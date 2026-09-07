import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSimulations, useUserSimulationResults } from "@/hooks/useContent";
import { Pill, EmptyState, SkeletonCard } from "@/components/ui/primitives";

const categoryIcons: Record<string, string> = {
  wifi: "ti-wifi",
  phishing: "ti-mail-exclamation",
  social_engineering: "ti-user-question",
  ransomware: "ti-file-lock",
};

const SIMULATION_BADGES: Record<string, { label: string; tone: "primary" | "emerald" | "danger" | "warning" }> = {
  "mitm-attack": { label: "Live Rogue Wi-Fi & MITM", tone: "danger" },
  "phishing-email": { label: "Live Spear-Phishing Lab", tone: "primary" },
  "ransomware-response": { label: "Live Ransomware Attack & Triage", tone: "danger" },
  "social-engineering-call": { label: "Live Mobile Smishing & OTP Scam", tone: "warning" },
};

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_TONE: Record<string, "emerald" | "warning" | "danger"> = {
  beginner: "emerald",
  intermediate: "warning",
  advanced: "danger",
};

export function SimulationsPage() {
  const { profile } = useAuth();
  const { data: simulations, loading } = useSimulations();
  const { data: simResults } = useUserSimulationResults(profile?.id);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [category, setCategory] = useState("all");

  const categories = ["all", ...new Set((simulations ?? []).map((s) => s.category))];

  // Highest score per simulation
  const scoreBySim = new Map<string, number>();
  for (const r of simResults ?? []) {
    const existing = scoreBySim.get(r.simulation_id);
    if (existing === undefined || r.score > existing) {
      scoreBySim.set(r.simulation_id, r.score);
    }
  }

  const filtered = (simulations ?? []).filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || s.category === category;
    const matchesDiff = difficulty === "all" || s.difficulty === difficulty;
    return matchesSearch && matchesCategory && matchesDiff;
  });

  return (
    <div className="space-y-8">
      {/* Header with Live Threat Feed Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
              Safe Practice Arena
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-high mt-1">
              Interactive Threat Sandboxes &amp; Games
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-text-low">
              Practice in a 100% safe, zero-risk playground. Experience real scams, spot the hidden clues, and test your defense instincts—you can&apos;t break anything here!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono text-emerald-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Safe Sandbox
            </span>
          </div>
        </div>

        {/* Friendly 3-Step How-It-Works Bar */}
        <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-text-high">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <i className="ti ti-bulb" /> How to play:
            </span>
            <span className="flex items-center gap-1 text-text-low">
              <strong className="text-primary">1.</strong> Choose any scenario below
            </span>
            <span className="text-text-muted">•</span>
            <span className="flex items-center gap-1 text-text-low">
              <strong className="text-primary">2.</strong> Turn on &apos;Beginner Clues&apos; if needed
            </span>
            <span className="text-text-muted">•</span>
            <span className="flex items-center gap-1 text-text-low">
              <strong className="text-primary">3.</strong> Decide if it&apos;s safe or a scam
            </span>
          </div>
          <div className="text-[11px] text-emerald-500 font-mono font-bold">
            All skill levels welcome!
          </div>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <div className="space-y-3.5">
        <div className="relative">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scenarios by incident type or vector..."
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-surface border border-border text-sm text-text-high placeholder:text-text-muted focus:outline-none focus:border-primary transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-high"
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
                `rounded-full border px-3 py-1 text-xs font-medium transition-all capitalize cursor-pointer ` +
                (category === cat
                  ? "border-primary bg-primary text-white font-semibold shadow-sm"
                  : "border-border bg-surface text-text-low hover:bg-surface-muted")
              }
            >
              {cat.replace("_", " ")}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5 text-xs text-text-muted">
            <span className="hidden sm:inline">Difficulty:</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={
                  `rounded-lg px-2.5 py-1 capitalize transition cursor-pointer ` +
                  (difficulty === d
                    ? "bg-surface-muted text-primary font-semibold border border-border"
                    : "text-text-muted hover:text-text-high")
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-56" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="No simulation scenarios match your criteria"
          description="Adjust your search query or filter tags to reveal attack drills."
          icon="ti-flask"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((s, index) => {
            const bestScore = scoreBySim.get(s.id);
            const isPassed = bestScore !== undefined && bestScore >= 60;
            const badgeMeta = SIMULATION_BADGES[s.slug];

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Link
                  to={`/simulations/${s.slug}`}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                        <i className={`ti ${categoryIcons[s.category] ?? "ti-flask"} text-xl`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                            {s.category.replace("_", " ")}
                          </span>
                          {badgeMeta && (
                            <Pill tone={badgeMeta.tone} size="sm">
                              {badgeMeta.label}
                            </Pill>
                          )}
                        </div>
                        <h2 className="text-base font-bold text-text-high group-hover:text-primary transition-colors">
                          {s.title}
                        </h2>
                      </div>
                    </div>

                    <Pill tone={DIFF_TONE[s.difficulty]} size="sm">
                      {s.difficulty}
                    </Pill>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-text-low line-clamp-2">
                    {s.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5 text-xs text-text-muted">
                    <span className="flex items-center gap-1.5 font-mono">
                      <i className="ti ti-clock text-primary" /> {s.duration_minutes}m duration
                    </span>

                    {bestScore !== undefined ? (
                      <span className={`flex items-center gap-1.5 font-semibold font-mono ${isPassed ? "text-emerald-500" : "text-amber-500"}`}>
                        <i className={`ti ${isPassed ? "ti-check" : "ti-alert-triangle"}`} />
                        Best Score: {bestScore}/100
                      </span>
                    ) : (
                      <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Launch Drill <i className="ti ti-arrow-right" />
                      </span>
                    )}
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
