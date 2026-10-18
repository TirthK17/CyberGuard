import { supabase } from "@/lib/supabase";
import { levelForPoints, XP } from "@/lib/constants";

/**
 * Action types for activity logging.
 * Extend this union whenever a new action type is introduced.
 */
export type ActivityAction =
  | "lesson_completed"
  | "module_completed"
  | "quiz_completed"
  | "quiz_passed"
  | "simulation_completed"
  | "assessment_completed"
  | "badge_earned"
  | "hygiene_check"
  | "incident_reported"
  | "topic_learned";

interface ActivityInput {
  userId: string;
  action: ActivityAction;
  /** Points to award — comes from constants.ts XP */
  points: number;
  meta?: Record<string, unknown>;
  /**
   * An optional reference ID (lesson id, quiz id, simulation id, etc.).
   * When `awardOnce` is true, this refId is checked against existing activity_logs
   * to prevent duplicate XP awards for the same action + ref.
   */
  refId?: string;
  /**
   * If true, XP is only awarded the *first* time this (userId, action, refId) triple
   * is seen. Subsequent calls are silently ignored.
   */
  awardOnce?: boolean;
}

/**
 * Logs an activity, adds points to the user's profile, recalculates their level,
 * then checks whether any badges should be newly awarded.
 *
 * Call this after any lesson/quiz/simulation/assessment completion.
 *
 * @returns The badge array returned by evaluateBadges (newly awarded badges), or undefined.
 */
export async function recordActivity({
  userId,
  action,
  points,
  meta,
  refId,
  awardOnce = false,
}: ActivityInput): Promise<Awaited<ReturnType<typeof evaluateBadges>> | undefined> {
  // ── Idempotency check ────────────────────────────────────────────────────────
  if (awardOnce && refId) {
    const { data: existing } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      // The localDb eq filter does string comparison so store refId in meta.ref_id
      .eq("meta->ref_id" as never, refId as never);

    // Fallback: filter manually in case the localDb doesn't support nested key access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- meta shape is dynamic
    const alreadyDone = (existing as any[] | null)?.some(
      (row: { meta?: Record<string, unknown> }) =>
        row.meta?.ref_id === refId
    );
    if (alreadyDone) return undefined; // Skip — already awarded
  }

  // ── Log the activity ─────────────────────────────────────────────────────────
  const { error: logError } = await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    meta: { ...(meta ?? {}), ...(refId ? { ref_id: refId } : {}) },
    points_earned: points,
  });
  if (logError) console.error("Failed to log activity:", logError.message);

  if (points === 0) {
    // No points to add — just log, then badge-check.
    return evaluateBadges(userId);
  }

  // ── Update profile points + level ────────────────────────────────────────────
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

  return evaluateBadges(userId);
}

/**
 * Returns the XP to award for a simulation based on its score.
 * The displayed "+X XP" pill must use exactly this value.
 */
export function simulationXp(score: number): number {
  return Math.round(score * XP.SIMULATION_FACTOR);
}

/**
 * Checks every badge definition against the user's current activity/progress and
 * awards any newly-earned ones. Safe to call repeatedly — user_badges has a unique
 * constraint on (user_id, badge_id) so duplicates are naturally prevented via insert.
 *
 * @returns Array of newly awarded badge objects (may be empty).
 */
export async function evaluateBadges(userId: string) {
  const { data: badges } = await supabase.from("badges").select("*");
  if (!badges?.length) return [];

  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);
  const earnedIds = new Set((earned ?? []).map((e) => e.badge_id));

  const [progressRes, simResultsRes, assessmentRes, simulationsRes] = await Promise.all([
    supabase.from("progress").select("is_completed").eq("user_id", userId),
    supabase.from("simulation_results").select("simulation_id").eq("user_id", userId),
    supabase
      .from("assessment_results")
      .select("score")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(1),
    supabase.from("simulations").select("id, category"),
  ]);

  const completedModuleCount = (progressRes.data ?? []).filter((p) => p.is_completed).length;
  const bestAssessmentScore = assessmentRes.data?.[0]?.score ?? 0;
  const simCategoryById = new Map(
    (simulationsRes.data ?? []).map((s) => [s.id, s.category])
  );
  const completedSimIds = (simResultsRes.data ?? []).map((r) => r.simulation_id);

  const categoryCounts = new Map<string, number>();
  for (const simId of completedSimIds) {
    const cat = simCategoryById.get(simId);
    if (!cat) continue;
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const maxCategoryCount = categoryCounts.size ? Math.max(...categoryCounts.values()) : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- badges come from DB with loose shape
  const toAward = (badges as any[]).filter((badge) => {
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

  if (!toAward.length) return [];

  await supabase.from("user_badges").insert(
    toAward.map((b) => ({ user_id: userId, badge_id: b.id }))
  );

  for (const badge of toAward) {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action: "badge_earned" satisfies ActivityAction,
      meta: { badge_id: badge.id, badge_name: badge.name },
      points_earned: 0,
    });
  }

  return toAward;
}
