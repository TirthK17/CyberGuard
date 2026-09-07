import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useQuizzes, useUserQuizResults } from "@/hooks/useContent";
import { Pill, EmptyState, SkeletonCard } from "@/components/ui/primitives";

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_TONE: Record<string, "default" | "success" | "warn" | "danger"> = {
  beginner: "success",
  intermediate: "warn",
  advanced: "danger",
};

export function QuizzesPage() {
  const { profile } = useAuth();
  const { data: quizzes, loading } = useQuizzes();
  const { data: results } = useUserQuizResults(profile?.id);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [category, setCategory] = useState("all");

  const categories = ["all", ...new Set((quizzes ?? []).map((q) => q.category))];

  // Map highest score per quiz
  const scoreByQuiz = new Map<string, { score: number; total: number }>();
  for (const r of results ?? []) {
    const existing = scoreByQuiz.get(r.quiz_id);
    if (!existing || r.score > existing.score) {
      scoreByQuiz.set(r.quiz_id, { score: r.score, total: r.total_questions });
    }
  }

  const filtered = (quizzes ?? []).filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || q.category === category;
    const matchesDiff = difficulty === "all" || q.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDiff;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-frost-glow">Verification Challenges</p>
        <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Practice Quizzes
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Reinforce threat detection through rapid-fire, scenario-based security questions.
        </p>
      </motion.div>

      {/* Filters & Search */}
      <div className="space-y-3.5">
        <div className="relative">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title, vector, or topic..."
            className="input pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure"
            >
              <i className="ti ti-x text-sm" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={
                `rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all duration-150 capitalize ` +
                (category === cat
                  ? "border-void-violet/50 bg-void-violet/20 text-frost-glow shadow-[0_0_12px_rgba(102,58,243,0.3)]"
                  : "border-glass-edge bg-carbon text-text-fog hover:border-glass-edge-strong hover:text-text-pure")
              }
            >
              {cat === "all" ? "All Categories" : cat.replace(/_/g, " ")}
            </button>
          ))}

          <span className="h-4 w-px bg-glass-edge mx-1" />

          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={
                `rounded-full border px-3 py-1 font-mono text-[11px] font-medium transition-all duration-150 capitalize ` +
                (difficulty === d
                  ? "border-void-violet/50 bg-void-violet/20 text-frost-glow shadow-[0_0_12px_rgba(102,58,243,0.3)]"
                  : "border-glass-edge bg-carbon text-text-fog hover:border-glass-edge-strong hover:text-text-pure")
              }
            >
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No quizzes match your filters"
          description="Try broadening your search term or resetting category filters."
          actionLabel="Reset filters"
          onAction={() => {
            setSearch("");
            setCategory("all");
            setDifficulty("all");
          }}
          icon="ti-search-off"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q, i) => {
            const completed = scoreByQuiz.get(q.id);
            const scorePct = completed ? Math.round((completed.score / completed.total) * 100) : null;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.3 }}
              >
                <Link to={`/quizzes/${q.id}`} className="group block h-full">
                  <div className="glass h-full rounded-2xl p-6 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-glass-edge-strong hover:-translate-y-0.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Pill tone="violet">{q.category.replace(/_/g, " ")}</Pill>
                        <Pill tone={DIFF_TONE[q.difficulty] ?? "default"}>{q.difficulty}</Pill>
                      </div>

                      <h3 className="mt-4 font-display text-base font-semibold text-text-pure group-hover:text-frost-glow transition-colors leading-snug">
                        {q.title}
                      </h3>

                      <p className="mt-2 text-xs text-text-fog leading-relaxed">
                        Test your defensive decision-making under time pressure.
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-glass-edge pt-3.5 font-mono text-[11px]">
                      {scorePct !== null ? (
                        <div className="flex items-center gap-1.5 text-success font-medium">
                          <i className="ti ti-circle-check-filled text-xs" />
                          <span>Score: {scorePct}%</span>
                        </div>
                      ) : (
                        <span className="text-text-ash flex items-center gap-1">
                          <i className="ti ti-circle-dotted text-xs" />
                          Not Taken
                        </span>
                      )}

                      <span className="text-frost-glow group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        {scorePct !== null ? "Retake" : "Launch Quiz"}
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
