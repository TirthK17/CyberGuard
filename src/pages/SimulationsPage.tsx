import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSimulations, useUserSimulationResults } from "@/hooks/useContent";
import { Pill, EmptyState, SkeletonCard } from "@/components/ui/primitives";
import {
  Target,
  Mail,
  Wifi,
  ShieldAlert,
  Smartphone,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  X,
  CreditCard,
  FlaskConical,
} from "lucide-react";

function getCategoryIcon(cat: string) {
  switch (cat?.toLowerCase()) {
    case "phishing":
      return <Mail className="h-5 w-5 text-primary" />;
    case "wifi":
      return <Wifi className="h-5 w-5 text-cyan-400" />;
    case "ransomware":
      return <ShieldAlert className="h-5 w-5 text-rose-400" />;
    case "social_engineering":
      return <Smartphone className="h-5 w-5 text-amber-400" />;
    case "quishing":
      return <QrCode className="h-5 w-5 text-purple-400" />;
    case "payments":
    case "banking":
      return <CreditCard className="h-5 w-5 text-emerald-400" />;
    default:
      return <Target className="h-5 w-5 text-primary" />;
  }
}

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
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    return ["all", ...new Set((simulations ?? []).map((s) => s.category))];
  }, [simulations]);

  // Highest score per simulation
  const scoreBySim = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of simResults ?? []) {
      const existing = map.get(r.simulation_id);
      if (existing === undefined || r.score > existing) {
        map.set(r.simulation_id, r.score);
      }
    }
    return map;
  }, [simResults]);

  const filtered = useMemo(() => {
    return (simulations ?? []).filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || s.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [simulations, search, category]);

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
              <FlaskConical className="h-3.5 w-3.5 text-primary" /> Hands-On Threat Sandboxes
            </span>
            <span>•</span>
            <span className="text-text-fog">Zero-Risk Simulation</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-pure">
            Scam &amp; Threat Sandboxes
          </h1>
          <p className="text-xs sm:text-sm text-text-fog max-w-2xl">
            Safely test your reactions to deceptive phishing emails, fraudulent SMS links, and rogue Wi-Fi networks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Safe Sandbox
          </span>
        </div>
      </motion.div>

      {/* ── 2. SEARCH & CATEGORY FILTER ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-ash" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attack scenarios (phishing, Wi-Fi, SMS)..."
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

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize cursor-pointer ${
                category === cat
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "bg-surface border border-border text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              {cat === "all" ? "All Scenarios" : cat.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. CLEAN SCENARIO CARDS GRID ── */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          title="No simulation scenarios match your search"
          description="Adjust your keywords or select another scenario category."
          actionLabel="Clear Filter"
          onAction={() => {
            setSearch("");
            setCategory("all");
          }}
          icon="ti-flask"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, index) => {
            const bestScore = scoreBySim.get(s.id);
            const isPassed = bestScore !== undefined && bestScore >= 60;

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <Link
                  to={`/simulations/${s.slug}`}
                  className="group block h-full rounded-2xl border border-border bg-surface p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header: Icon & Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border">
                        {getCategoryIcon(s.category)}
                      </div>
                      <Pill tone={DIFF_TONE[s.difficulty]} size="sm">
                        {s.difficulty}
                      </Pill>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="font-display text-sm sm:text-base font-bold text-text-pure group-hover:text-primary transition-colors leading-snug">
                        {s.title}
                      </h2>
                      <p className="mt-1.5 text-xs text-text-fog leading-relaxed line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-ash">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="h-3 w-3" /> {s.duration_minutes}m duration
                    </span>

                    {bestScore !== undefined ? (
                      <span className={`flex items-center gap-1 font-semibold text-xs ${isPassed ? "text-emerald-400" : "text-amber-400"}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Score: {bestScore}/100
                      </span>
                    ) : (
                      <span className="text-primary font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                        Start Simulation <ArrowRight className="h-3 w-3" />
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
