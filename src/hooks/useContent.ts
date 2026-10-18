import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Module,
  Lesson,
  Quiz,
  Simulation,
  Badge,
  LeaderboardEntry,
  Progress,
  UserQuizResult,
  UserSimulationResult,
} from "@/types";

function useSupabaseQuery<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.resolve(fn()).then((res) => {
      if (!active) return;
      if (res.error) setError("Something went wrong loading this content.");
      setData(res.data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useModules() {
  return useSupabaseQuery<Module[]>(() =>
    supabase.from("modules").select("*").eq("is_published", true).order("order_index")
  );
}

export function useModule(slug: string | undefined) {
  return useSupabaseQuery<Module>(
    () => supabase.from("modules").select("*").eq("slug", slug).single(),
    [slug]
  );
}

export function useLessons(moduleId: string | undefined) {
  return useSupabaseQuery<Lesson[]>(
    () => supabase.from("lessons").select("*").eq("module_id", moduleId).order("order_index"),
    [moduleId]
  );
}

export function useQuizzes() {
  return useSupabaseQuery<Quiz[]>(() =>
    supabase.from("quizzes").select("*").eq("is_published", true)
  );
}

export function useSimulations() {
  return useSupabaseQuery<Simulation[]>(() =>
    supabase.from("simulations").select("*").eq("is_published", true)
  );
}

export function useBadges() {
  return useSupabaseQuery<Badge[]>(() => supabase.from("badges").select("*"));
}

export function useLeaderboard() {
  return useSupabaseQuery<LeaderboardEntry[]>(() =>
    supabase.from("leaderboard").select("*").limit(20)
  );
}

export function useUserProgress(userId: string | undefined) {
  return useSupabaseQuery<Progress[]>(
    () => supabase.from("progress").select("*").eq("user_id", userId),
    [userId]
  );
}

export function useUserBadges(userId: string | undefined) {
  return useSupabaseQuery<{ badge_id: string }[]>(
    () => supabase.from("user_badges").select("badge_id").eq("user_id", userId),
    [userId]
  );
}

export function useUserQuizResults(userId: string | undefined) {
  return useSupabaseQuery<UserQuizResult[]>(
    () => supabase.from("quiz_results").select("quiz_id, score, total_questions").eq("user_id", userId),
    [userId]
  );
}

export function useUserSimulationResults(userId: string | undefined) {
  return useSupabaseQuery<UserSimulationResult[]>(
    () => supabase.from("simulation_results").select("simulation_id, score").eq("user_id", userId),
    [userId]
  );
}
