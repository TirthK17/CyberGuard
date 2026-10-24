import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { contentApi } from "@/lib/api/content";
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

export function useModules() {
  const query = useQuery({
    queryKey: ["modules"],
    queryFn: () => contentApi.getModules(),
  });
  return {
    data: (query.data as unknown as Module[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useModule(slug: string | undefined) {
  const query = useQuery({
    queryKey: ["module", slug],
    queryFn: () => (slug ? contentApi.getModuleBySlug(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
  });
  return {
    data: (query.data as unknown as Module) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useLessons(moduleId: string | undefined) {
  const query = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: () => (moduleId ? contentApi.getLessonsByModule(moduleId) : Promise.resolve([])),
    enabled: Boolean(moduleId),
  });
  return {
    data: (query.data as unknown as Lesson[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useQuizzes() {
  const query = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => contentApi.getQuizzes(),
  });
  return {
    data: (query.data as unknown as Quiz[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useSimulations() {
  const query = useQuery({
    queryKey: ["simulations"],
    queryFn: () => contentApi.getSimulations(),
  });
  return {
    data: (query.data as unknown as Simulation[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useBadges() {
  const query = useQuery({
    queryKey: ["badges"],
    queryFn: () => contentApi.getBadges(),
  });
  return {
    data: (query.data as unknown as Badge[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook for live community Leaderboard.
 * Connects Supabase Realtime channel and window events to automatically invalidate and refetch
 * in sub-second real time when any user gains XP or changes ranking.
 */
export function useLeaderboard(limit: number = 50) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    };

    window.addEventListener("cyberguard:progress-updated", handleUpdate);
    window.addEventListener("cyberguard:activity-logged", handleUpdate);

    const channel = supabase
      .channel("leaderboard-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        handleUpdate
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        handleUpdate
      )
      .subscribe();

    return () => {
      window.removeEventListener("cyberguard:progress-updated", handleUpdate);
      window.removeEventListener("cyberguard:activity-logged", handleUpdate);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => contentApi.getLeaderboard(limit),
  });

  return {
    data: (query.data as unknown as LeaderboardEntry[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserProgress(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-progress-channel-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-progress", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: ["user-progress", userId],
    queryFn: () => (userId ? contentApi.getUserProgress(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
  return {
    data: (query.data as unknown as Progress[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserBadges(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-badges-channel-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_badges" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-badges", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: () => (userId ? contentApi.getUserBadges(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
  return {
    data: (query.data as unknown as { badge_id: string; earned_at: string }[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserQuizResults(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-quiz-results-channel-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quiz_results" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-quiz-results", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: ["user-quiz-results", userId],
    queryFn: () => (userId ? contentApi.getUserQuizResults(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
  return {
    data: (query.data as unknown as UserQuizResult[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useUserSimulationResults(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-sim-results-channel-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "simulation_results" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user-sim-results", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);

  const query = useQuery({
    queryKey: ["user-sim-results", userId],
    queryFn: () => (userId ? contentApi.getUserSimulationResults(userId) : Promise.resolve([])),
    enabled: Boolean(userId),
  });
  return {
    data: (query.data as unknown as UserSimulationResult[]) ?? null,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}

export function useThreatBulletins() {
  const query = useQuery({
    queryKey: ["threat-bulletins"],
    queryFn: () => contentApi.getThreatBulletins(),
  });
  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}
