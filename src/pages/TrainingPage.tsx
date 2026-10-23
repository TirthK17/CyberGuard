import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useModules, useUserProgress } from "@/hooks/useContent";
import { Pill, EmptyState, SkeletonCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Target,
  Shield,
  Key,
  Wifi,
  Search,
  X,
  Play,
  Layers,
} from "lucide-react";

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_TONE: Record<Difficulty, "default" | "success" | "warn" | "danger"> = {
  all:          "default",
  beginner:     "success",
  intermediate: "warn",
  advanced:     "danger",
};

const MODULE_SANDBOX_MAP: Record<string, { label: string; slug: string }> = {
  "cybersecurity-fundamentals": { label: "Wi-Fi Simulation", slug: "mitm-attack" },
  "password-account-security": { label: "Phishing Simulation", slug: "phishing-email" },
  "phishing-awareness": { label: "Fake Email Lab", slug: "phishing-email" },
  "social-engineering": { label: "SMS Scam Drill", slug: "social-engineering-call" },
  "malware-ransomware": { label: "Ransomware Drill", slug: "ransomware-response" },
  "network-security": { label: "Wi-Fi Security Demo", slug: "mitm-attack" },
};

function getCategoryIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "authentication":
      return <Key className="h-5 w-5 text-primary" />;
    case "network":
      return <Wifi className="h-5 w-5 text-cyan-400" />;
    case "threats":
      return <Target className="h-5 w-5 text-amber-400" />;
    default:
      return <Shield className="h-5 w-5 text-primary" />;
  }
}

export function TrainingPage() {
  const { profile } = useAuth();
  const { data: modules, loading } = useModules();
  const { data: progress } = useUserProgress(profile?.id);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const { data: allLessons } = await supabase.from("lessons").select("id, module_id");
      const counts: Record<string, number> = {};
      for (const l of allLessons ?? []) {
        counts[l.module_id] = (counts[l.module_id] ?? 0) + 1;
      }
      setLessonCounts(counts);
    })();
  }, []);

  const moduleList = modules ?? [];
  const categories = ["all", ...new Set(moduleList.map((m) => m.category))];

  // Map user progress per module
  const progressMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number; isDone: boolean }>();
    for (const p of progress ?? []) {
      const totalForModule = lessonCounts[p.module_id] ?? 3;
      map.set(p.module_id, {
        completed: p.completed_lessons?.length ?? 0,
        total: totalForModule,
        isDone: p.is_completed || (p.completed_lessons?.length ?? 0) >= totalForModule,
      });
    }
    return map;
  }, [progress, lessonCounts]);

  const completedCount = moduleList.filter((m) => progressMap.get(m.id)?.isDone).length;
  const overallPercent = moduleList.length > 0 ? Math.round((completedCount / moduleList.length) * 100) : 0;

  // Next incomplete module to resume
  const nextToLearn = moduleList.find((m) => !progressMap.get(m.id)?.isDone) ?? moduleList[0];

  const filtered = useMemo(() => {
    return moduleList.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || m.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [moduleList, search, category]);

  return (
    <div className="space-y-7 max-w-[1300px] mx-auto pb-12">
      {/* ── 1. MINIMAL HERO HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-text-ash">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Interactive Curriculum
            </span>
            <span>•</span>
            <span className="text-text-fog">6 Everyday Topics</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-pure">
            Academy Lessons
          </h1>
          <p className="text-xs sm:text-sm text-text-fog max-w-2xl">
            Story-based defensive modules to build reflexive cybersecurity habits and spot deception early.
          </p>
        </div>

        {/* Progress & Next Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs">
            <span className="text-text-ash text-[10px] block">Curriculum Status</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-pure font-mono">{completedCount}/{moduleList.length}</span>
              <span className="text-primary font-bold font-mono text-[11px]">{overallPercent}%</span>
            </div>
          </div>

          {nextToLearn && (
            <Button
              to={`/training/${nextToLearn.slug}`}
              variant="primary"
              size="sm"
              icon={<Play className="h-3.5 w-3.5 fill-current" />}
            >
              {completedCount > 0 ? "Resume Module" : "Start Module"}
            </Button>
          )}
        </div>
      </motion.div>

      {/* ── 2. SEARCH & CATEGORY FILTER ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search defense modules (passwords, emails, Wi-Fi)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-surface text-xs text-text-pure placeholder:text-text-ash focus:outline-none focus:border-primary shadow-xs transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                category === cat
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-surface border border-border text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              {cat === "all" ? "All Topics" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. CLEAN MODULE CARDS GRID ── */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No modules match your search"
          description="Try adjusting your keywords or selecting another topic filter."
          actionLabel="Clear Search"
          onAction={() => {
            setSearch("");
            setCategory("all");
          }}
          icon="ti-search-off"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const sandbox = MODULE_SANDBOX_MAP[m.slug];
            const prog = progressMap.get(m.id);
            const isDone = prog?.isDone;
            const inProgress = !isDone && (prog?.completed ?? 0) > 0;

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 6) * 0.03, duration: 0.25 }}
              >
                <Link to={`/training/${m.slug}`} className="group block h-full">
                  <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      {/* Header: Icon & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated">
                          {getCategoryIcon(m.category)}
                        </div>

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

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-display text-sm sm:text-base font-bold text-text-pure group-hover:text-primary transition-colors leading-snug">
                          {m.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-text-fog leading-relaxed line-clamp-2">
                          {m.description}
                        </p>
                      </div>

                      {/* Simulation Tag if available */}
                      {sandbox && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          <Target className="h-3 w-3" />
                          <span>Includes {sandbox.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-ash">
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 text-primary" />
                          3 Lessons
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {m.duration_minutes}m
                        </span>
                      </div>

                      <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                        {isDone ? "Review" : inProgress ? "Resume" : "Start"}
                        <ArrowRight className="h-3 w-3" />
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
