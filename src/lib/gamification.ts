import { supabase } from "@/lib/supabase";

// Points required to reach each level. Level = highest threshold met.
const LEVEL_THRESHOLDS = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 300 },
  { level: 4, points: 600 },
];

function levelForPoints(points: number) {
  return LEVEL_THRESHOLDS.slice().reverse().find((l) => points >= l.points)?.level ?? 1;
}

interface ActivityInput {
  userId: string;
  action: "lesson_completed" | "quiz_completed" | "simulation_completed" | "assessment_completed";
  points: number;
  meta?: Record<string, unknown>;
}

/**
 * Logs an activity, adds points to the user's profile, recalculates their level,
 * then checks whether any badges should be newly awarded.
 * Call this after any lesson/quiz/simulation/assessment completion.
 */
export async function recordActivity({ userId, action, points, meta }: ActivityInput) {
  const { error: logError } = await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    meta: meta ?? {},
    points_earned: points,
  });
  if (logError) console.error("Failed to log activity:", logError.message);

  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();
  if (profileFetchError) {
    console.error("Failed to fetch profile for points update:", profileFetchError.message);
    return;
  }

  const newPoints = (profile?.points ?? 0) + points;
  const newLevel = levelForPoints(newPoints);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ points: newPoints, level: newLevel })
    .eq("id", userId);
  if (updateError) console.error("Failed to update points/level:", updateError.message);

  await evaluateBadges(userId);
}

/**
 * Checks every badge definition against the user's current activity/progress and
 * awards any newly-earned ones. Safe to call repeatedly — user_badges has a unique
 * constraint on (user_id, badge_id) so duplicates are naturally prevented via upsert-ignore.
 */
export async function evaluateBadges(userId: string) {
  const { data: badges } = await supabase.from("badges").select("*");
  if (!badges?.length) return;

  const { data: earned } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));

  const [progressRes, simResultsRes, assessmentRes, simulationsRes] = await Promise.all([
    supabase.from("progress").select("is_completed").eq("user_id", userId),
    supabase.from("simulation_results").select("simulation_id").eq("user_id", userId),
    supabase.from("assessment_results").select("score").eq("user_id", userId).order("score", { ascending: false }).limit(1),
    supabase.from("simulations").select("id, category"),
  ]);

  const completedModuleCount = (progressRes.data ?? []).filter((p) => p.is_completed).length;
  const bestAssessmentScore = assessmentRes.data?.[0]?.score ?? 0;
  const simCategoryById = new Map((simulationsRes.data ?? []).map((s) => [s.id, s.category]));
  const completedSimIds = (simResultsRes.data ?? []).map((r) => r.simulation_id);

  const categoryCounts = new Map<string, number>();
  for (const simId of completedSimIds) {
    const cat = simCategoryById.get(simId);
    if (!cat) continue;
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const maxCategoryCount = categoryCounts.size ? Math.max(...categoryCounts.values()) : 0;

  const toAward = badges.filter((badge) => {
    if (earnedIds.has(badge.id)) return false;
    switch (badge.requirement_type) {
      case "module_complete":
      case "module_count":
        return completedModuleCount >= badge.requirement_value;
      case "simulation_category_count":
        return maxCategoryCount >= badge.requirement_value;
      case "assessment_score":
        return bestAssessmentScore >= badge.requirement_value;
      default:
        return false;
    }
  });

  if (!toAward.length) return;

  await supabase.from("user_badges").insert(
    toAward.map((b) => ({ user_id: userId, badge_id: b.id }))
  );

  for (const badge of toAward) {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action: "badge_earned",
      meta: { badge_id: badge.id, badge_name: badge.name },
      points_earned: 0,
    });
  }

  return toAward;
}
