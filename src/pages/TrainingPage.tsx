import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useModules, useUserProgress } from "@/hooks/useContent";
import { Pill, EmptyState, SkeletonCard, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { XP } from "@/lib/constants";

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_LABEL: Record<Difficulty, string> = {
  all:          "All Levels",
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
};

const DIFF_TONE: Record<Difficulty, "default" | "success" | "warn" | "danger"> = {
  all:          "default",
  beginner:     "success",
  intermediate: "warn",
  advanced:     "danger",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Fundamentals":       "ti-shield-half",
  "Authentication":     "ti-key",
  "Social Engineering": "ti-user-question",
  "Threats":            "ti-virus",
  "Network":            "ti-wifi",
  "Privacy":            "ti-eye-off",
  "Compliance":         "ti-file-certificate",
};

const MODULE_SANDBOX_MAP: Record<string, { label: string; slug: string }> = {
  "cybersecurity-fundamentals": { label: "Wi-Fi Simulation", slug: "mitm-attack" },
  "password-account-security": { label: "Fake Email Simulation", slug: "phishing-email" },
  "phishing-awareness": { label: "Fake Email Simulation", slug: "phishing-email" },
  "social-engineering": { label: "SMS Scam Simulation", slug: "social-engineering-call" },
  "malware-ransomware": { label: "Virus Emergency Drill", slug: "ransomware-response" },
  "network-security": { label: "Wi-Fi Simulation", slug: "mitm-attack" },
};

export function TrainingPage() {
  const { profile } = useAuth();
  const { data: modules, loading } = useModules();
  const { data: progress } = useUserProgress(profile?.id);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [totalQuizzes, setTotalQuizzes] = useState(6);
  const [totalSims, setTotalSims] = useState(4);
  const [totalLessonCount, setTotalLessonCount] = useState(18);

  useEffect(() => {
    (async () => {
      const [{ data: allLessons }, { count: qCount }, { count: sCount }] = await Promise.all([
        supabase.from("lessons").select("id, module_id"),
        supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("simulations").select("id", { count: "exact", head: true }).eq("is_published", true),
      ]);
      const counts: Record<string, number> = {};
      for (const l of allLessons ?? []) {
        counts[l.module_id] = (counts[l.module_id] ?? 0) + 1;
      }
      setLessonCounts(counts);
      if (allLessons?.length) setTotalLessonCount(allLessons.length);
      if (qCount !== null && qCount !== undefined) setTotalQuizzes(qCount);
      if (sCount !== null && sCount !== undefined) setTotalSims(sCount);
    })();
  }, []);

  const moduleList = modules ?? [];
  const categories = ["all", ...new Set(moduleList.map((m) => m.category))];

  // Map user progress per module
  const progressMap = new Map<string, { completed: number; total: number; isDone: boolean }>();
  for (const p of progress ?? []) {
    const totalForModule = lessonCounts[p.module_id] ?? 3;
    progressMap.set(p.module_id, {
      completed: p.completed_lessons?.length ?? 0,
      total: totalForModule,
      isDone: p.is_completed || (p.completed_lessons?.length ?? 0) >= totalForModule,
    });
  }

  const completedCount = moduleList.filter((m) => progressMap.get(m.id)?.isDone).length;
  const totalCompletedLessons = (progress ?? []).reduce(
    (acc, p) => acc + (p.completed_lessons?.length ?? 0),
    0
  );
  const earnedXp = totalCompletedLessons * XP.LESSON + completedCount * 50;
  const overallPercent = moduleList.length > 0 ? Math.round((completedCount / moduleList.length) * 100) : 0;
  const totalPossibleXp = totalLessonCount * XP.LESSON + moduleList.length * 50 + totalQuizzes * XP.QUIZ_PASS + totalSims * XP.SIMULATION;

  // First incomplete module to resume
  const nextToLearn = moduleList.find((m) => !progressMap.get(m.id)?.isDone) ?? moduleList[0];

  const filtered = moduleList.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || m.category === category;
    const matchesDiff = difficulty === "all" || m.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDiff;
  });

  return (
    <div className="space-y-8">
      {/* ── ACADEMY HERO & PROGRESS BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
                Cyber Safety Lessons
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <i className="ti ti-circle-check" /> 6 Everyday Topics
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-text-pure">
              Interactive Lessons
            </h1>

            <p className="text-sm sm:text-base text-text-fog leading-relaxed">
              Learn how to spot real-world scams and protect your personal information with quick, story-based lessons and practice quizzes.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end shrink-0">
            <div className="p-4 rounded-2xl bg-surface-elevated border border-border min-w-[200px] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-ash font-medium">Your Progress</span>
                <span className="font-semibold text-primary">{overallPercent}%</span>
              </div>
              <ProgressBar value={overallPercent} />
              <div className="flex justify-between text-xs text-text-ash pt-1 font-medium">
                <span>{completedCount} of {moduleList.length} Modules Finished</span>
                <span className="text-emerald-400 font-semibold">+{earnedXp} XP Earned</span>
              </div>
            </div>

            {nextToLearn && (
              <Button
                to={`/training/${nextToLearn.slug}`}
                variant="primary"
                size="sm"
                className="font-semibold text-sm shadow-md"
              >
                <i className="ti ti-player-play mr-1.5" aria-hidden="true" />
                {completedCount > 0 ? "Continue Learning" : "Start First Lesson"}
              </Button>
            )}
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border text-xs">
          <div className="flex items-center gap-2 text-text-fog">
            <i className="ti ti-book-2 text-primary text-base" />
            <span><strong>{totalLessonCount}</strong> Short Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-text-fog">
            <i className="ti ti-clipboard-check text-emerald-400 text-base" />
            <span><strong>{totalQuizzes}</strong> Practice Quizzes</span>
          </div>
          <div className="flex items-center gap-2 text-text-fog">
            <i className="ti ti-device-gamepad-2 text-warn text-base" />
            <span><strong>{totalSims}</strong> Hands-on Simulations</span>
          </div>
          <div className="flex items-center gap-2 text-text-fog">
            <i className="ti ti-award text-cyan-400 text-base" />
            <span><strong>{totalPossibleXp}+</strong> Total XP to Earn</span>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="space-y-3.5">
        <div className="relative">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons (e.g. 'passwords', 'fake emails', 'Wi-Fi')..."
            className="input pl-10"
            aria-label="Search modules"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure transition-colors"
              aria-label="Clear search"
            >
              <i className="ti ti-x text-sm" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={
                `rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ` +
                (category === cat
                  ? "border-primary bg-primary-subtle text-primary font-semibold"
                  : "border-border bg-surface text-text-fog hover:bg-surface-elevated hover:text-text-pure")
              }
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}

          <span className="h-4 w-px bg-border mx-1" />

          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={
                `rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 capitalize ` +
                (difficulty === d
                  ? "border-primary bg-primary-subtle text-primary font-semibold"
                  : "border-border bg-surface text-text-fog hover:bg-surface-elevated hover:text-text-pure")
              }
            >
              {DIFF_LABEL[d]}
            </button>
          ))}
        </div>

        {(search || category !== "all" || difficulty !== "all") && (
          <p className="text-xs text-text-ash">
            Showing <span className="text-text-pure font-bold">{filtered.length}</span> of{" "}
            <span>{moduleList.length}</span> modules
            {search && <> matching "<span className="text-primary font-medium">{search}</span>"</>}
            <button
              onClick={() => { setSearch(""); setCategory("all"); setDifficulty("all"); }}
              className="ml-3 text-primary font-medium hover:underline"
            >
              Reset filters
            </button>
          </p>
        )}
      </div>

      {/* ── MODULE CARDS GRID ── */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No modules match your filters"
          description="Try adjusting your search query or clearing active category filters."
          actionLabel="Reset filters"
          onAction={() => { setSearch(""); setCategory("all"); setDifficulty("all"); }}
          icon="ti-search-off"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const catIcon = CATEGORY_ICONS[m.category] ?? "ti-shield";
            const sandbox = MODULE_SANDBOX_MAP[m.slug];
            const prog = progressMap.get(m.id);
            const isDone = prog?.isDone;
            const inProgress = !isDone && (prog?.completed ?? 0) > 0;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }}
              >
                <Link to={`/training/${m.slug}`} className="group block h-full">
                  <div className="glass h-full rounded-2xl p-6 transition-all duration-200 ease-out hover:border-primary/50 hover:shadow-lg flex flex-col justify-between border border-border">
                    <div className="space-y-4">
                      {/* Card Header: Icon, Category & Difficulty */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                          <i className={`ti ${catIcon} text-lg`} />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isDone ? (
                            <Pill tone="emerald" size="sm">
                              ✓ Completed
                            </Pill>
                          ) : inProgress ? (
                            <Pill tone="primary" size="sm">
                              {prog?.completed}/3 Lessons
                            </Pill>
                          ) : (
                            <Pill tone={DIFF_TONE[m.difficulty as Difficulty] ?? "default"} size="sm">
                              {m.difficulty}
                            </Pill>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-text-pure group-hover:text-primary transition-colors leading-snug">
                          {m.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-fog line-clamp-2">
                          {m.description}
                        </p>
                      </div>

                      {/* Learning Objectives Preview */}
                      {m.learning_objectives && m.learning_objectives.length > 0 && (
                        <div className="pt-2 text-xs text-text-ash space-y-1">
                          <div className="font-semibold text-text-pure/80">Key takeaway:</div>
                          <div className="truncate text-text-fog">
                            • {m.learning_objectives[0]}
                          </div>
                        </div>
                      )}

                      {/* Threat Sandbox Link Badge */}
                      {sandbox && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                          <i className="ti ti-device-gamepad-2" />
                          <span>Includes {sandbox.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Metadata & Action CTA */}
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-3.5 text-xs text-text-ash">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <i className="ti ti-book-2 text-xs text-primary" />
                          3 Lessons
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <i className="ti ti-clock text-xs" />
                          {m.duration_minutes} min
                        </span>
                      </div>

                      <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs sm:text-sm">
                        {isDone ? "Review" : inProgress ? "Continue" : "Start Lesson"}
                        <i className="ti ti-arrow-right text-xs" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
