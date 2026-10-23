import { supabase } from "@/lib/supabase";
import type { Database, UserRole } from "@/types/database";
import type { ProfileRecord } from "./auth";
export type ModuleInsert = Database["public"]["Tables"]["modules"]["Insert"];
export type ModuleUpdate = Database["public"]["Tables"]["modules"]["Update"];
export type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
export type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"];
export type QuizInsert = Database["public"]["Tables"]["quizzes"]["Insert"];
export type QuizUpdate = Database["public"]["Tables"]["quizzes"]["Update"];
export type SimulationInsert = Database["public"]["Tables"]["simulations"]["Insert"];
export type SimulationUpdate = Database["public"]["Tables"]["simulations"]["Update"];
export type BadgeInsert = Database["public"]["Tables"]["badges"]["Insert"];
export type BadgeUpdate = Database["public"]["Tables"]["badges"]["Update"];

export const adminApi = {
  async getDashboardStats() {
    const [usersRes, activeRes, coursesRes, quizzesRes, simsRes, scoreRes, profileDatesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("modules").select("id", { count: "exact", head: true }),
      supabase.from("quizzes").select("id", { count: "exact", head: true }),
      supabase.from("simulations").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("awareness_score"),
      supabase.from("profiles").select("created_at"),
    ]);

    const scores = (scoreRes.data ?? []).map((r) => r.awareness_score);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      totalUsers: usersRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      totalCourses: coursesRes.count ?? 0,
      totalQuizzes: quizzesRes.count ?? 0,
      totalSimulations: simsRes.count ?? 0,
      avgScore,
      scores,
      profileDates: profileDatesRes.data ?? [],
    };
  },

  async getUsers(): Promise<ProfileRecord[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async updateUserStatus(userId: string, status: "active" | "disabled"): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  },

  // Courses (Modules) CRUD
  async createCourse(course: ModuleInsert) {
    const { data, error } = await supabase.from("modules").insert(course).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateCourse(id: string, updates: ModuleUpdate) {
    const { data, error } = await supabase.from("modules").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteCourse(id: string) {
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Lessons CRUD
  async createLesson(lesson: LessonInsert) {
    const { data, error } = await supabase.from("lessons").insert(lesson).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateLesson(id: string, updates: LessonUpdate) {
    const { data, error } = await supabase.from("lessons").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteLesson(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Quizzes CRUD
  async createQuiz(quiz: QuizInsert) {
    const { data, error } = await supabase.from("quizzes").insert(quiz).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateQuiz(id: string, updates: QuizUpdate) {
    const { data, error } = await supabase.from("quizzes").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteQuiz(id: string) {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Simulations CRUD
  async createSimulation(sim: SimulationInsert) {
    const { data, error } = await supabase.from("simulations").insert(sim).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateSimulation(id: string, updates: SimulationUpdate) {
    const { data, error } = await supabase.from("simulations").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteSimulation(id: string) {
    const { error } = await supabase.from("simulations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // Badges CRUD
  async createBadge(badge: BadgeInsert) {
    const { data, error } = await supabase.from("badges").insert(badge).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateBadge(id: string, updates: BadgeUpdate) {
    const { data, error } = await supabase.from("badges").update(updates).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deleteBadge(id: string) {
    const { error } = await supabase.from("badges").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
