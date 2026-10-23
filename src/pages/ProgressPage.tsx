import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useModules, useUserProgress } from "@/hooks/useContent";
import { supabase } from "@/lib/supabase";
import { Card, ProgressBar, AnimatedNumber, Pill, SkeletonCard, EmptyState, SectionHeader } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ActivityLog {
  id: string;
  action: string;
  meta: Record<string, unknown>;
  points_earned: number;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: string }> = {
  lesson_completed: { label: "Completed a lesson", icon: "ti-book-2" },
  quiz_completed: { label: "Completed a quiz", icon: "ti-clipboard-check" },
  simulation_completed: { label: "Completed a simulation", icon: "ti-flask" },
  assessment_completed: { label: "Completed the assessment", icon: "ti-gauge" },
  badge_earned: { label: "Earned a badge", icon: "ti-award" },
};

export function ProgressPage() {
  const { profile } = useAuth();
  const { data: modules, loading } = useModules();
  const { data: progress } = useUserProgress(profile?.id);

  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [categoryData, setCategoryData] = useState<{ category: string; score: number }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; activities: number }[]>([]);
  const [timeline, setTimeline] = useState<ActivityLog[] | null>(null);

  const profileId = profile?.id;
  useEffect(() => {
    if (!profileId) return;
    let active = true;

    (async () => {
      // Total lessons per module, for accurate per-module progress percentage.
      const { data: allLessons } = await supabase.from("lessons").select("id, module_id");
      if (active && allLessons) {
        const counts: Record<string, number> = {};
        for (const l of allLessons as { module_id: string }[]) {
          counts[l.module_id] = (counts[l.module_id] ?? 0) + 1;
        }
        setLessonCounts(counts);
      }

      // Quiz performance by category
      const { data: quizResults } = await supabase
        .from("quiz_results")
        .select("quiz_id, score, total_questions")
        .eq("user_id", profileId);
      const { data: quizzes } = await supabase.from("quizzes").select("id, category");
      const quizCategoryById = new Map((quizzes ?? []).map((q) => [q.id, q.category]));

      // Simulation performance by category
      const { data: simResults } = await supabase
        .from("simulation_results")
        .select("simulation_id, score")
        .eq("user_id", profileId);
      const { data: sims } = await supabase.from("simulations").select("id, category");
      const simCategoryById = new Map((sims ?? []).map((s) => [s.id, s.category]));

      const categoryTotals: Record<string, { sum: number; count: number }> = {};
      for (const r of quizResults ?? []) {
        const cat = quizCategoryById.get(r.quiz_id);
        if (!cat) continue;
        const pct = r.total_questions ? (r.score / r.total_questions) * 100 : 0;
        categoryTotals[cat] = categoryTotals[cat] ?? { sum: 0, count: 0 };
        categoryTotals[cat].sum += pct;
        categoryTotals[cat].count += 1;
      }
      for (const r of simResults ?? []) {
        const cat = simCategoryById.get(r.simulation_id);
        if (!cat) continue;
        categoryTotals[cat] = categoryTotals[cat] ?? { sum: 0, count: 0 };
        categoryTotals[cat].sum += r.score;
        categoryTotals[cat].count += 1;
      }

      if (active) {
        setCategoryData(
          Object.entries(categoryTotals).map(([category, { sum, count }]) => ({
            category: category.replace(/_/g, " "),
            score: Math.round(sum / count),
          }))
        );
      }

      // Activity timeline + weekly chart
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (active && logs) {
        setTimeline(logs as ActivityLog[]);

        const now = new Date();
        const days: { day: string; date: string; activities: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), date: d.toDateString(), activities: 0 });
        }
        for (const log of logs as ActivityLog[]) {
          const logDate = new Date(log.created_at).toDateString();
          const match = days.find((d) => d.date === logDate);
          if (match) match.activities += 1;
        }
        setWeeklyData(days.map(({ day, activities }) => ({ day, activities })));
      }
    })();

    return () => {
      active = false;
    };
  }, [profileId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const completed = progress?.filter((p) => p.is_completed).length ?? 0;
  const total = modules?.length ?? 0;
  const overall = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-frost-glow">Your Learning Journey</p>
        <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Learning Progress
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Track your completed lessons, quiz scores, and weekly activity.
        </p>
      </motion.div>

      {/* Overall Progress Banner */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">Modules Progress</span>
            <div className="mt-1 font-display text-xl font-bold text-text-pure">
              <AnimatedNumber value={completed} /> / {total} modules completed
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-bold text-frost-glow">
              <AnimatedNumber value={overall} suffix="%" />
            </span>
            <Pill tone={overall >= 100 ? "success" : overall > 0 ? "violet" : "default"}>
              {overall >= 100 ? "COMPLETED" : overall > 0 ? "IN PROGRESS" : "GETTING STARTED"}
            </Pill>
          </div>
        </div>
        <ProgressBar value={overall} className="mt-4" />
      </Card>

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Radar / Strength */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader
            title="Safety Score by Topic"
            description="Your performance across quizzes and interactive simulations."
          />
          <div className="mt-4 h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={categoryData}>
                  <PolarGrid stroke="var(--color-glass-edge)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "var(--color-text-fog)", fontSize: 11 }}
                    className="capitalize font-mono"
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="var(--color-void-violet)"
                    fill="var(--color-void-violet)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <i className="ti ti-chart-radar text-2xl text-text-ash mb-2" />
                <p className="font-mono text-xs text-text-fog">Complete quizzes and simulations to see your scores here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader
            title="Weekly Activity"
            description="Lessons, quizzes, and simulations completed over the last 7 days."
          />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-glass-edge)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-glass-edge-strong)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-text-pure)",
                  }}
                  labelStyle={{ color: "var(--color-text-pure)", fontFamily: "monospace" }}
                  cursor={{ fill: "rgba(186, 215, 247, 0.04)" }}
                />
                <Bar
                  dataKey="activities"
                  fill="var(--color-void-violet)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Module Progress Grid */}
      <div className="space-y-4">
        <SectionHeader
          title="All Learning Modules"
          description="Track progress across each cybersecurity topic."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(modules ?? []).map((m, i) => {
            const p = progress?.find((pr) => pr.module_id === m.id);
            const totalLessons = lessonCounts[m.id] ?? 0;
            const doneCount = p?.completed_lessons?.length ?? 0;
            const percent = p?.is_completed ? 100 : totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link to={`/training/${m.slug}`} className="group block h-full">
                  <div className="glass h-full rounded-2xl p-5 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-glass-edge-strong hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-text-ash">{m.category}</span>
                      <Pill tone={p?.is_completed ? "success" : percent > 0 ? "violet" : "default"}>
                        {p?.is_completed ? "Completed" : percent > 0 ? `${percent}%` : "Not started"}
                      </Pill>
                    </div>

                    <h3 className="mt-3 font-display text-sm font-semibold text-text-pure group-hover:text-frost-glow transition-colors">
                      {m.title}
                    </h3>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] text-text-ash">
                        <span>Lessons Completed</span>
                        <span>{doneCount} / {totalLessons}</span>
                      </div>
                      <ProgressBar value={percent} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      {timeline && timeline.length > 0 ? (
        <Card>
          <SectionHeader
            title="Recent Activity"
            description="Timeline of completed lessons, quizzes, and earned badges."
          />
          <div className="mt-6 space-y-0">
            {timeline.map((log, i) => {
              const info = ACTION_LABELS[log.action] ?? {
                label: log.action.replace(/_/g, " "),
                icon: "ti-circle-dot",
              };
              return (
                <div key={log.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-[15px] top-7 bottom-0 w-px bg-glass-edge" aria-hidden="true" />
                  )}
                  <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-glass-edge bg-carbon text-frost-glow">
                    <i className={`ti ${info.icon} text-sm`} />
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-text-pure">{info.label}</span>
                      {log.points_earned > 0 && (
                        <span className="rounded-full bg-void-violet/15 border border-void-violet/25 px-2 py-0.5 font-mono text-[10px] font-semibold text-frost-glow">
                          +{log.points_earned} XP
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-text-ash">
                      {new Date(log.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No activity recorded yet"
          description="Your completed lessons, quizzes, and simulation outcomes will be recorded here."
          icon="ti-history"
        />
      )}
    </div>
  );
}
