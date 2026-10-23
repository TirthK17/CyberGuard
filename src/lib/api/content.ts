import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type ModuleRecord = Database["public"]["Tables"]["modules"]["Row"];
export type LessonRecord = Database["public"]["Tables"]["lessons"]["Row"];
export type QuizRecord = Database["public"]["Tables"]["quizzes"]["Row"];
export type QuestionRecord = Database["public"]["Tables"]["questions"]["Row"];
export type SimulationRecord = Database["public"]["Tables"]["simulations"]["Row"];
export type SimulationStepRecord = Database["public"]["Tables"]["simulation_steps"]["Row"];
export type BadgeRecord = Database["public"]["Tables"]["badges"]["Row"];
export type ProgressRecord = Database["public"]["Tables"]["progress"]["Row"];
export type LeaderboardEntryRecord = Database["public"]["Views"]["leaderboard"]["Row"];
export type ThreatBulletinRecord = Database["public"]["Tables"]["threat_bulletins"]["Row"];
export type AssessmentRecord = Database["public"]["Tables"]["assessments"]["Row"];
export type AssessmentQuestionRecord = Database["public"]["Tables"]["assessment_questions"]["Row"];

export const contentApi = {
  async getModules(): Promise<ModuleRecord[]> {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getModuleBySlug(slug: string): Promise<ModuleRecord | null> {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async getLessonsByModule(moduleId: string): Promise<LessonRecord[]> {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getQuizzes(): Promise<QuizRecord[]> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("is_published", true);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getQuizById(id: string): Promise<QuizRecord | null> {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async getQuestionsByQuiz(quizId: string): Promise<QuestionRecord[]> {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getSimulations(): Promise<SimulationRecord[]> {
    const { data, error } = await supabase
      .from("simulations")
      .select("*")
      .eq("is_published", true);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getSimulationBySlug(slug: string): Promise<SimulationRecord | null> {
    const { data, error } = await supabase
      .from("simulations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async getSimulationSteps(simulationId: string): Promise<SimulationStepRecord[]> {
    const { data, error } = await supabase
      .from("simulation_steps")
      .select("*")
      .eq("simulation_id", simulationId)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getBadges(): Promise<BadgeRecord[]> {
    const { data, error } = await supabase
      .from("badges")
      .select("*");

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getUserBadges(userId: string): Promise<{ badge_id: string; earned_at: string }[]> {
    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntryRecord[]> {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(limit);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getUserProgress(userId: string): Promise<ProgressRecord[]> {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getUserQuizResults(userId: string) {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("quiz_id, score, total_questions, completed_at")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getUserSimulationResults(userId: string) {
    const { data, error } = await supabase
      .from("simulation_results")
      .select("simulation_id, score, completed_at")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getAssessment(): Promise<AssessmentRecord | null> {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestionRecord[]> {
    const { data, error } = await supabase
      .from("assessment_questions")
      .select("*")
      .eq("assessment_id", assessmentId)
      .order("order_index", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getThreatBulletins(): Promise<ThreatBulletinRecord[]> {
    const { data, error } = await supabase
      .from("threat_bulletins")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
};
