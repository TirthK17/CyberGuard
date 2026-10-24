import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import type { Json } from "@/types/database";

export interface AwardXpResult {
  awarded: boolean;
  points_earned: number;
  points: number;
  level: number;
  tier: string;
  badges_unlocked: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

export function notifyDrillProgressUpdated() {
  if (typeof window !== "undefined") {
    queryClient.invalidateQueries({ queryKey: ["user-progress"] });
    queryClient.invalidateQueries({ queryKey: ["user-quiz-results"] });
    queryClient.invalidateQueries({ queryKey: ["user-sim-results"] });
    queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["activity_logs"] });
    window.dispatchEvent(new CustomEvent("cyberguard:progress-updated"));
  }
}

export const drillsApi = {
  /**
   * Authoritative server-side XP award engine.
   * Prevents client manipulation by executing in PostgreSQL SECURITY DEFINER context.
   */
  async awardXp(
    action: string,
    points: number,
    meta: Record<string, unknown> = {},
    refId?: string,
    awardOnce: boolean = false
  ): Promise<AwardXpResult> {
    const { data, error } = await supabase.rpc("award_xp", {
      p_action: action,
      p_points: points,
      p_meta: meta as Json,
      p_ref_id: refId ?? null,
      p_award_once: awardOnce,
    });

    if (error) {
      console.error("Failed to award XP:", error.message);
      throw new Error(error.message);
    }

    const res = data as unknown as AwardXpResult;

    // Dispatch UI event for sound and celebratory micro-animations if level up occurred
    if (typeof window !== "undefined" && res?.awarded) {
      window.dispatchEvent(
        new CustomEvent("cyberguard:activity-logged", {
          detail: { action, points: res.points_earned, totalPoints: res.points, level: res.level },
        })
      );
      if (res.badges_unlocked && res.badges_unlocked.length > 0) {
        window.dispatchEvent(
          new CustomEvent("cyberguard:badges-unlocked", {
            detail: { badges: res.badges_unlocked },
          })
        );
      }
      notifyDrillProgressUpdated();
    }

    return res;
  },

  /**
   * Records completed lesson progress through the atomic server-side RPC.
   */
  async recordLessonProgress(moduleId: string, lessonId: string) {
    const { data, error } = await supabase.rpc("record_lesson_progress", {
      p_module_id: moduleId,
      p_lesson_id: lessonId,
    });

    if (error) throw new Error(error.message);
    notifyDrillProgressUpdated();
    return data;
  },

  /**
   * Records a user's quiz attempt and awards passing/completion XP.
   */
  async submitQuizResult(
    userId: string,
    quizId: string,
    score: number,
    totalQuestions: number,
    answers: Record<string, string>
  ) {
    const { data, error } = await supabase.from("quiz_results").insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      total_questions: totalQuestions,
      answers: answers as Json,
    }).select().single();

    if (error) throw new Error(error.message);

    const pct = Math.round((score / totalQuestions) * 100);
    const passed = pct >= 70;
    const points = passed ? 30 : 5;

    await this.awardXp("quiz_completed", points, { quiz_id: quizId, score, total: totalQuestions, passed }, quizId, true);
    notifyDrillProgressUpdated();

    return data;
  },

  /**
   * Records a user's simulation attempt and awards proportional XP.
   */
  async submitSimulationResult(
    userId: string,
    simulationId: string,
    score: number,
    answers: Record<string, unknown> = {}
  ) {
    const { data, error } = await supabase.from("simulation_results").insert({
      user_id: userId,
      simulation_id: simulationId,
      score,
      answers: answers as Json,
    }).select().single();

    if (error) throw new Error(error.message);

    const points = Math.round(score * 0.4);
    await this.awardXp("simulation_completed", points, { simulation_id: simulationId, score, ...answers }, simulationId, true);
    notifyDrillProgressUpdated();

    return data;
  },

  /**
   * Submits the 20-question comprehensive assessment score via server RPC.
   */
  async submitAssessment(
    assessmentId: string,
    score: number,
    band: string,
    answers: Record<string, string>
  ) {
    const { data, error } = await supabase.rpc("submit_assessment", {
      p_assessment_id: assessmentId,
      p_score: score,
      p_band: band,
      p_answers: answers as Json,
    });

    if (error) throw new Error(error.message);
    notifyDrillProgressUpdated();
    return data;
  },

  /**
   * Logs security tool usage (passwords, headers, Wi-Fi checks, hygiene audits).
   */
  async logToolUsage(toolName: string, action: string = "audit", meta: Record<string, unknown> = {}) {
    const { data, error } = await supabase.rpc("log_tool_usage", {
      p_tool_name: toolName,
      p_action: action,
      p_meta: meta as Json,
    });

    if (error) {
      console.warn("Failed to log tool usage:", error.message);
      return null;
    }
    return data;
  },
};
