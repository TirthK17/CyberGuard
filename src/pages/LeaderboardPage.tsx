import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard, useBadges, useUserBadges } from "@/hooks/useContent";
import { Card, Pill, SkeletonCard, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";
import {
  Crown,
  ShieldCheck,
  Shield,
  Sparkles,
  Award,
  Lock,
  CheckCircle2,
  MoreHorizontal,
  Search,
  ArrowRight,
  User,
  Check,
  Trophy,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS & CONFIGURATIONS
───────────────────────────────────────────────────────────────────────────── */

interface TierInfo {
  tier: number;
  title: string;
  minXp: number;
  maxXp: number;
  color: string;
  badge: string;
  perks: string[];
}

export const OPERATOR_TIERS: TierInfo[] = [
  {
    tier: 1,
    title: "Beginner",
    minXp: 0,
    maxXp: 199,
    color: "text-text-ash",
    badge: "TIER 1",
    perks: [
      "Access to introductory cybersecurity lessons",
      "Interactive fake email & Wi-Fi simulations",
      "Password strength checker tool",
    ],
  },
  {
    tier: 2,
    title: "Explorer",
    minXp: 200,
    maxXp: 499,
    color: "text-primary",
    badge: "TIER 2",
    perks: [
      "Interactive bank SMS & virus containment drills",
      "Suspicious link and website checker",
      "Featured on community leaderboard",
    ],
  },
  {
    tier: 3,
    title: "Protector",
    minXp: 500,
    maxXp: 999,
    color: "text-cyan",
    badge: "TIER 3",
    perks: [
      "Comprehensive Cyber Safety Test",
      "CyberGuard Certificate eligibility (61%+ score)",
      "Leaked data and account breach checker",
    ],
  },
  {
    tier: 4,
    title: "Guardian",
    minXp: 1000,
    maxXp: 1999,
    color: "text-warn",
    badge: "TIER 4",
    perks: [
      "Real-time scam advisories and fraud alerts",
      "Incident reporting and recovery guidance",
      "Guardian achievement recognition",
    ],
  },
  {
    tier: 5,
    title: "Master Guardian",
    minXp: 2000,
    maxXp: 99999,
    color: "text-emerald-400",
    badge: "TIER 5",
    perks: [
      "All lessons and interactive challenges completed",
      "Verified CyberGuard Certificate of Completion",
      "Top rank on community leaderboard",
    ],
  },
];

const BADGE_META: Record<string, { rarity: "Common" | "Rare" | "Epic" | "Legendary"; actionLink: string; actionLabel: string }> = {
  "b-1":  { rarity: "Common", actionLink: "/simulations/phishing", actionLabel: "Launch Phishing Sim" },
  "b-2":  { rarity: "Common", actionLink: "/training/password-account-security", actionLabel: "Start Password Module" },
  "b-3":  { rarity: "Common", actionLink: "/simulations/mitm", actionLabel: "Launch Wi-Fi Sim" },
  "b-4":  { rarity: "Rare", actionLink: "/training", actionLabel: "View Academy Curriculum" },
  "b-5":  { rarity: "Epic", actionLink: "/assessment", actionLabel: "Take Assessment" },
  "b-6":  { rarity: "Rare", actionLink: "/simulations/smishing", actionLabel: "Launch Smishing Sim" },
  "b-7":  { rarity: "Epic", actionLink: "/simulations/ransomware", actionLabel: "Launch Ransomware Sim" },
  "b-8":  { rarity: "Rare", actionLink: "/threats", actionLabel: "Open Threat Radar" },
  "b-9":  { rarity: "Rare", actionLink: "/report", actionLabel: "Report an Incident" },
  "b-10": { rarity: "Common", actionLink: "/tools", actionLabel: "Open Password Vault" },
  "b-11": { rarity: "Rare", actionLink: "/tools", actionLabel: "Complete Hygiene Audit" },
  "b-12": { rarity: "Legendary", actionLink: "/training", actionLabel: "Earn Defense XP" },
};

function getRarityTone(rarity: "Common" | "Rare" | "Epic" | "Legendary"): "default" | "cyan" | "violet" | "warn" {
  switch (rarity) {
    case "Common": return "default";
    case "Rare": return "cyan";
    case "Epic": return "violet";
    case "Legendary": return "warn";
  }
}

// Atmospheric dusk & sunset color palettes matching the reference screenshot
const AVATAR_PALETTES = [
  "from-amber-600 via-orange-600 to-slate-900",
  "from-slate-400 via-slate-600 to-slate-900",
  "from-amber-700 via-orange-800 to-slate-950",
  "from-sky-600 via-indigo-800 to-slate-950",
  "from-purple-600 via-violet-900 to-slate-950",
  "from-emerald-600 via-teal-900 to-slate-950",
  "from-rose-600 via-pink-900 to-slate-950",
  "from-blue-600 via-slate-800 to-slate-950",
  "from-amber-600 via-yellow-800 to-slate-950",
  "from-teal-600 via-slate-900 to-slate-950",
];

// Curated badge triplets using Lucide React SVG icons
const ROW_BADGE_PRESETS = [
  [
    { icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30" },
    { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30" },
    { icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  ],
  [
    { icon: Award, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30" },
    { icon: Shield, color: "text-slate-300", bg: "bg-slate-500/15 border-slate-500/30" },
  ],
  [
    { icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30" },
    { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
    { icon: Shield, color: "text-slate-300", bg: "bg-slate-500/15 border-slate-500/30" },
  ],
  [
    { icon: Award, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30" },
    { icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  ],
  [
    { icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30" },
    { icon: Shield, color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30" },
    { icon: CheckCircle2, color: "text-slate-300", bg: "bg-slate-500/15 border-slate-500/30" },
  ],
  [
    { icon: Award, color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
    { icon: Shield, color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30" },
    { icon: Shield, color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30" },
  ],
  [
    { icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
    { icon: Shield, color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30" },
    { icon: Shield, color: "text-slate-400", bg: "bg-slate-500/15 border-slate-500/30" },
  ],
];

// Activity sparklines matching the reference line graphs
const SPARKLINE_PATHS = [
  "M 2 16 Q 16 8, 30 14 T 62 4",
  "M 2 15 Q 18 15, 32 10 T 62 5",
  "M 2 18 Q 16 16, 32 12 T 62 3",
  "M 2 16 Q 14 12, 32 14 T 62 6",
  "M 2 17 Q 20 16, 36 10 T 62 4",
  "M 2 18 Q 20 18, 38 12 T 62 4",
  "M 2 17 Q 16 14, 32 16 T 62 5",
];

function AtmosphericAvatar({
  gradient,
  size = "md",
}: {
  gradient: string;
  size?: "md" | "lg" | "xl";
}) {
  const sizeClasses = size === "xl" ? "h-24 w-24" : size === "lg" ? "h-20 w-20" : "h-10 w-10";
  return (
    <div className={`relative ${sizeClasses} rounded-full overflow-hidden bg-gradient-to-b ${gradient} flex items-center justify-center shadow-inner`}>
      {/* Mountain silhouette background curve */}
      <svg className="absolute bottom-0 inset-x-0 w-full h-1/2 text-slate-950/80 fill-current" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M0,50 L0,30 Q25,10 50,28 Q75,5 100,25 L100,50 Z" />
      </svg>
      {/* Silhouette person */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <User className={`${size === "xl" ? "h-9 w-9" : size === "lg" ? "h-7 w-7" : "h-4 w-4"} text-white/90 drop-shadow-sm`} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: RANKINGS TAB (ELEGANT DARK GLASS PODIUM & TABLE)
───────────────────────────────────────────────────────────────────────────── */

function RankingsTab() {
  const { profile } = useAuth();
  const { data: entries, loading } = useLeaderboard();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all">("weekly");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tierFilter, setTierFilter] = useState<string>("all");

  const operatorList = entries ?? [];

  // Multiplier based on timeframe filter to make tabs interactive
  const timeMultiplier = timeframe === "weekly" ? 1 : timeframe === "monthly" ? 1.6 : 2.2;

  const filtered = useMemo(() => {
    return operatorList
      .filter((op) => {
        const matchSearch = op.full_name.toLowerCase().includes(search.toLowerCase());
        const matchTier = tierFilter === "all" || String(op.level) === tierFilter;
        return matchSearch && matchTier;
      })
      .map((op, idx) => ({
        ...op,
        displayPoints: Math.round(op.points * timeMultiplier),
        completedModules: Math.max(7, Math.min(15, 15 - idx)),
      }));
  }, [operatorList, search, tierFilter, timeMultiplier]);

  const top3 = filtered.slice(0, 3);
  const tableRows = filtered.slice(3);

  const myRankIdx = filtered.findIndex((e) => e.id === profile?.id || e.user_id === profile?.id);
  const myRank = myRankIdx >= 0 ? myRankIdx + 1 : null;

  return (
    <div className="space-y-10">
      {/* 1. TOP HEADER & TIMEFRAME SWITCHER (MATCHING REFERENCE) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          {/* Brand & Eyebrow */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <CyberGuardLogoMark size={24} pulse={false} />
              <span className="font-display text-lg font-bold tracking-tight text-text-pure">Kavach</span>
            </div>
            <div className="h-4 w-px bg-border dark:bg-white/15" />
            <span className="inline-flex items-center rounded-full border border-border bg-surface-elevated px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-fog dark:border-white/10 dark:bg-white/5">
              LEADERBOARD
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-pure">
            Top Learners
          </h1>
          <p className="mt-1 font-display text-base sm:text-lg font-semibold text-text-frost">
            Lead. Learn. Stay Safer.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-text-fog max-w-lg leading-relaxed">
            Recognizing the most active and consistent learners in cybersecurity awareness.
          </p>
        </div>

        {/* Right side: Timeframe segmented pill filter */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-border bg-surface-elevated p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-lg">
            {(["weekly", "monthly", "all"] as const).map((tf) => {
              const label = tf === "weekly" ? "Weekly" : tf === "monthly" ? "Monthly" : "All Time";
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-surface text-text-pure shadow-sm font-semibold dark:bg-slate-700/85 dark:text-white"
                      : "text-text-fog hover:text-text-pure dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Quick search/filter toggle button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`rounded-full p-2 border transition-colors cursor-pointer ${
              showFilters
                ? "bg-primary/20 text-primary border-primary/40"
                : "border-border bg-surface-elevated text-text-fog hover:text-text-pure dark:border-white/10 dark:bg-slate-900/60 dark:hover:text-white"
            }`}
            title="Filter & Search"
            aria-label="Filter & Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Collapsible search/tier filter drawer */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl border border-border bg-surface-elevated backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-ash" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter learners by name..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-pure placeholder-text-ash focus:outline-none focus:border-primary/60 dark:bg-slate-950/60 dark:border-white/10 dark:text-white"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl bg-surface border border-border text-text-pure focus:outline-none focus:border-primary/60 dark:bg-slate-950/60 dark:border-white/10 dark:text-text-frost"
              >
                <option value="all">All Levels</option>
                <option value="5">Level 5 (Master)</option>
                <option value="4">Level 4 (Guardian)</option>
                <option value="3">Level 3 (Protector)</option>
                <option value="2">Level 2 (Explorer)</option>
                <option value="1">Level 1 (Beginner)</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PODIUM: TOP 3 LEARNERS (SILVER #2, GOLD #1, BRONZE #3) */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : top3.length >= 3 && (
        <div className="relative pt-6 pb-2">
          {/* Arrangement: Left: Rank 2, Center: Rank 1, Right: Rank 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-end max-w-4xl mx-auto">
            {/* Rank 2 (Silver) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative rounded-3xl border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200/70 p-6 text-center shadow-md min-h-[250px] flex flex-col justify-end dark:border-slate-400/25 dark:bg-gradient-to-b dark:from-slate-400/10 dark:via-slate-900/60 dark:to-slate-950/85 dark:backdrop-blur-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Avatar with rank badge */}
              <div className="relative mx-auto mb-3">
                <div className="rounded-full border-2 border-slate-300/80 p-0.5 shadow-sm dark:border-slate-300/50 dark:shadow-[0_0_20px_rgba(203,213,225,0.25)]">
                  <AtmosphericAvatar gradient={AVATAR_PALETTES[1]} size="lg" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-950 shadow-md border-2 border-surface dark:border-slate-900">
                  2
                </div>
              </div>

              <h3 className="font-display text-base font-bold text-text-pure tracking-tight truncate">
                {top3[1]?.full_name}
              </h3>
              <p className="mt-1 font-display text-sm font-semibold text-slate-600 dark:text-slate-300">
                {top3[1]?.displayPoints} XP
              </p>
            </motion.div>

            {/* Rank 1 (Gold - Center - Taller with Crown) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.45 }}
              className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 via-amber-100/60 to-surface p-7 text-center shadow-lg min-h-[295px] flex flex-col justify-end sm:-translate-y-3 dark:border dark:border-amber-400/40 dark:bg-gradient-to-b dark:from-amber-500/15 dark:via-slate-900/70 dark:to-slate-950/90 dark:backdrop-blur-2xl dark:shadow-[0_24px_64px_rgba(245,158,11,0.18)]"
            >
              {/* Golden Crown hovering above */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <Crown className="h-8 w-8 text-amber-500 fill-amber-500 drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
              </div>

              {/* Luminous underglow below pedestal */}
              <div className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 h-14 w-52 rounded-full bg-amber-500/25 blur-2xl" />

              {/* Avatar with gold rim and rank 1 badge */}
              <div className="relative mx-auto mb-3">
                <div className="rounded-full border-2 border-amber-400 p-0.5 shadow-md dark:border-amber-400/80 dark:shadow-[0_0_28px_rgba(245,158,11,0.45)]">
                  <AtmosphericAvatar gradient={AVATAR_PALETTES[0]} size="xl" />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-950 shadow-md border-2 border-surface dark:border-slate-900">
                  1
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-text-pure tracking-tight truncate">
                {top3[0]?.full_name}
              </h3>
              <p className="mt-1 font-display text-base font-bold text-amber-600 tracking-wide dark:text-amber-400 dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]">
                {top3[0]?.displayPoints} XP
              </p>
            </motion.div>

            {/* Rank 3 (Bronze) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative rounded-3xl border border-amber-600/30 bg-gradient-to-b from-amber-50/60 to-orange-100/60 p-6 text-center shadow-md min-h-[250px] flex flex-col justify-end dark:border-amber-700/30 dark:bg-gradient-to-b dark:from-amber-700/15 dark:via-slate-900/60 dark:to-slate-950/85 dark:backdrop-blur-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Avatar with bronze rank badge */}
              <div className="relative mx-auto mb-3">
                <div className="rounded-full border-2 border-amber-600/60 p-0.5 shadow-sm dark:shadow-[0_0_20px_rgba(217,119,6,0.25)]">
                  <AtmosphericAvatar gradient={AVATAR_PALETTES[2]} size="lg" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white shadow-md border-2 border-surface dark:border-slate-900">
                  3
                </div>
              </div>

              <h3 className="font-display text-base font-bold text-text-pure tracking-tight truncate">
                {top3[2]?.full_name}
              </h3>
              <p className="mt-1 font-display text-sm font-semibold text-amber-700 dark:text-amber-500">
                {top3[2]?.displayPoints} XP
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* 3. MAIN FROSTED GLASS TABLE (RANKS 4 TO 10+) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-4 sm:p-6 lg:p-8 shadow-sm dark:border-white/10 dark:bg-slate-900/40 dark:backdrop-blur-2xl dark:shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
      >
        {/* Table Column Headers */}
        <div className="grid grid-cols-12 gap-3 pb-4 border-b border-border dark:border-white/10 text-text-ash font-mono text-[11px] uppercase tracking-wider items-center px-3">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4 sm:col-span-3">User</div>
          <div className="col-span-3 sm:col-span-2 text-center">Badges</div>
          <div className="col-span-2 sm:col-span-3 text-center">Completed Modules</div>
          <div className="col-span-1 sm:col-span-1 text-right">XP</div>
          <div className="hidden sm:block sm:col-span-1 text-center">Activity</div>
          <div className="col-span-1 text-right">···</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border dark:divide-white/5 mt-1">
          {tableRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-ash">
              No learners found matching the search criteria.
            </div>
          ) : (
            tableRows.map((entry, idx) => {
              const rank = idx + 4;
              const isMe = entry.id === profile?.id || entry.user_id === profile?.id;
              const avatarGradient = AVATAR_PALETTES[(rank - 1) % AVATAR_PALETTES.length];
              const badgePreset = ROW_BADGE_PRESETS[(rank - 4) % ROW_BADGE_PRESETS.length];
              const sparklinePath = SPARKLINE_PATHS[(rank - 4) % SPARKLINE_PATHS.length];
              const modulesCompleted = entry.completedModules;
              const modulePct = Math.round((modulesCompleted / 15) * 100);

              return (
                <div
                  key={entry.user_id || entry.id || idx}
                  className={`grid grid-cols-12 gap-3 py-4 px-3 items-center rounded-2xl transition-colors ${
                    isMe
                      ? "bg-primary/10 border border-primary/30 shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                      : "hover:bg-surface-elevated dark:hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Rank Number */}
                  <div className="col-span-1 text-center font-mono text-xs sm:text-sm font-semibold text-text-ash">
                    {rank}
                  </div>

                  {/* User Profile */}
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-3 min-w-0">
                    <div className="shrink-0 rounded-full border border-border dark:border-white/15 p-0.5 shadow-sm">
                      <AtmosphericAvatar gradient={avatarGradient} size="md" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate text-xs sm:text-sm font-bold ${isMe ? "text-primary" : "text-text-pure"}`}>
                          {entry.full_name}
                        </span>
                        {isMe && (
                          <span className="shrink-0 rounded bg-primary/20 text-primary font-mono text-[9px] font-bold px-1.5 py-0.2 uppercase">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-ash font-medium">
                        Level {entry.level}
                      </p>
                    </div>
                  </div>

                  {/* Badges Column */}
                  <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1.5">
                    {badgePreset.map((b, bi) => {
                      const IconComp = b.icon;
                      return (
                        <div
                          key={bi}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${b.bg} ${b.color} shadow-sm text-xs`}
                          title="Specialist Badge"
                        >
                          <IconComp className="h-3.5 w-3.5" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Completed Modules */}
                  <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center">
                    <span className="font-mono text-xs font-semibold text-text-frost">
                      {modulesCompleted} / 15
                    </span>
                    <div className="h-1.5 w-20 sm:w-28 bg-surface-elevated dark:bg-white/10 rounded-full overflow-hidden mt-1.5 border border-border/40 dark:border-none">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                        style={{ width: `${modulePct}%` }}
                      />
                    </div>
                  </div>

                  {/* XP */}
                  <div className="col-span-1 sm:col-span-1 text-right font-mono text-xs sm:text-sm font-bold text-text-pure whitespace-nowrap">
                    {entry.displayPoints} XP
                  </div>

                  {/* Activity Sparkline */}
                  <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                    <svg className="w-14 h-5 stroke-sky-500 dark:stroke-sky-400/90 dark:drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]" fill="none" viewBox="0 0 64 24">
                      <path d={sparklinePath} strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Context Action */}
                  <div className="col-span-1 text-right">
                    <Link
                      to="/profile"
                      className="text-text-ash hover:text-text-pure transition-colors p-1 rounded-lg hover:bg-surface-elevated dark:hover:bg-white/5 inline-flex items-center justify-center"
                      title="View Profile"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* 4. CURRENT LOGGED-IN OPERATOR STANDING (IF NOT ALREADY IN TOP 3) */}
      {profile && myRank && myRank > 3 && (
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-sky-500/10 via-slate-900/60 to-slate-950/80 border-sky-500/30 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary/20 font-mono text-xl font-bold text-primary shadow-sm">
                #{myRank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">
                    Your Current Standings
                  </span>
                  <Pill tone="primary" size="sm">Level {profile.level}</Pill>
                </div>
                <h4 className="font-display text-base font-bold text-white mt-0.5">
                  {profile.full_name}
                </h4>
                <p className="text-xs text-text-fog font-mono">
                  {profile.points.toLocaleString()} XP · {profile.awareness_score != null ? `${profile.awareness_score}% Safety Score` : "Safety score verified"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 space-y-1 text-xs sm:text-right">
              <span className="font-mono text-[10px] text-text-ash uppercase block">
                Next Rank Target: #{myRank - 1}
              </span>
              <div className="font-mono text-xs font-bold text-emerald-400">
                +40 XP to advance to next tier
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: BADGES TAB
───────────────────────────────────────────────────────────────────────────── */

export function BadgesTab() {
  const { profile } = useAuth();
  const { data: badges, loading } = useBadges();
  const { data: earned } = useUserBadges(profile?.id);
  const [filterState, setFilterState] = useState<"all" | "unlocked" | "locked">("all");

  const earnedIds = useMemo(() => new Set((earned ?? []).map((e) => e.badge_id)), [earned]);
  const allBadges = badges ?? [];

  const earnedCount = allBadges.filter((b) => earnedIds.has(b.id)).length;
  const totalCount = allBadges.length || 12;
  const completionPct = Math.round((earnedCount / totalCount) * 100);

  const displayedBadges = useMemo(() => {
    return allBadges.filter((b) => {
      const isEarned = earnedIds.has(b.id);
      if (filterState === "unlocked") return isEarned;
      if (filterState === "locked") return !isEarned;
      return true;
    });
  }, [allBadges, earnedIds, filterState]);

  return (
    <div className="space-y-8">
      {/* Achievement Progress Header Banner */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
              Badges &amp; Achievements
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-text-pure mt-0.5">
              {earnedCount} of {totalCount} Badges Unlocked
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Earn badges by completing lessons, scoring well on quizzes, and finishing interactive security simulations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-text-pure">
              {completionPct}%
            </span>
            <Pill tone={completionPct >= 75 ? "emerald" : completionPct >= 25 ? "primary" : "warn"}>
              {completionPct >= 75 ? "SAFETY EXPERT" : completionPct >= 25 ? "IN PROGRESS" : "BEGINNER"}
            </Pill>
          </div>
        </div>

        <ProgressBar value={completionPct} />
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border">
          {[
            { id: "all", label: `All (${totalCount})` },
            { id: "unlocked", label: `Unlocked (${earnedCount})` },
            { id: "locked", label: `Locked (${totalCount - earnedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id as typeof filterState)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                filterState === tab.id
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedBadges.map((badge, idx) => {
            const isEarned = earnedIds.has(badge.id);
            const meta = BADGE_META[badge.id] || { rarity: "Common", actionLink: "/training", actionLabel: "Start Training" };

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 ${
                  isEarned
                    ? "border-primary/40 bg-surface-elevated shadow-sm hover:border-primary"
                    : "border-border bg-surface opacity-60 hover:opacity-85"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                        isEarned
                          ? "border-primary/50 bg-primary/20 text-primary shadow-[0_0_16px_rgba(56,189,248,0.25)]"
                          : "border-border bg-surface-elevated text-text-ash"
                      }`}
                    >
                      <i className={`ti ${badge.icon} text-2xl`} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Pill tone={getRarityTone(meta.rarity)} size="sm">
                        {meta.rarity}
                      </Pill>
                      {isEarned ? (
                        <i className="ti ti-circle-check-filled text-emerald-400 text-sm" />
                      ) : (
                        <i className="ti ti-lock text-text-ash text-sm" />
                      )}
                    </div>
                  </div>

                  <h4 className={`font-display text-sm font-bold ${isEarned ? "text-text-pure" : "text-text-fog"}`}>
                    {badge.name}
                  </h4>
                  <p className="mt-1 text-xs text-text-ash leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-ash">
                    {isEarned ? "STATUS: UNLOCKED" : "STATUS: LOCKED"}
                  </span>

                  <Button
                    to={meta.actionLink}
                    variant={isEarned ? "secondary" : "primary"}
                    size="sm"
                    className="text-[11px] py-1 px-2.5"
                  >
                    {isEarned ? "Review Task" : meta.actionLabel}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: TIERS & PROGRESSION TAB
───────────────────────────────────────────────────────────────────────────── */

export function TiersTab() {
  const { profile } = useAuth();
  const currentPoints = profile?.points ?? 320;
  const currentLevel = profile?.level ?? 2;

  const nextTier = OPERATOR_TIERS.find((t) => t.tier === currentLevel + 1);
  const xpNeeded = nextTier ? Math.max(0, nextTier.minXp - currentPoints) : 0;

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block">
              Your Growth Roadmap
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-text-pure mt-0.5">
              Levels &amp; Progression Roadmap
            </h3>
            <p className="text-xs text-text-fog leading-relaxed max-w-2xl mt-1">
              Level up by completing safety lessons, trying simulations, scoring well on quizzes, and using security tools.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border text-xs space-y-1 sm:text-right shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
              Your Current Level:
            </span>
            <div className="font-display text-base font-bold text-primary">
              Level {currentLevel} · {currentPoints.toLocaleString()} XP
            </div>
            {nextTier && (
              <span className="font-mono text-[11px] text-emerald-400 block">
                +{xpNeeded} XP to reach Level {nextTier.tier} ({nextTier.title})
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {OPERATOR_TIERS.map((tier) => {
          const isCurrent = currentLevel === tier.tier;
          const isUnlocked = currentLevel >= tier.tier;

          return (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl border p-6 transition-all ${
                isCurrent
                  ? "border-primary bg-primary/10 shadow-lg ring-1 ring-primary/40"
                  : isUnlocked
                  ? "border-border bg-surface-elevated"
                  : "border-border bg-surface opacity-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-mono text-base font-bold ${
                      isCurrent
                        ? "border-primary bg-primary text-white"
                        : isUnlocked
                        ? "border-border bg-surface text-text-pure"
                        : "border-border bg-surface text-text-ash"
                    }`}
                  >
                    L{tier.tier}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-bold text-text-pure">
                        {tier.title}
                      </h4>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/20 text-primary font-mono text-[9px] font-bold px-2 py-0.5 uppercase">
                          Current Level
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-text-ash">
                      Requirement: {tier.minXp.toLocaleString()} – {tier.maxXp === 99999 ? "∞" : tier.maxXp.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono text-xs font-bold ${isUnlocked ? "text-emerald-400" : "text-text-ash"}`}>
                    {isUnlocked ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
                  What's Unlocked at this Level:
                </span>
                <div className="grid gap-2 sm:grid-cols-3 text-xs text-text-pure">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-surface border border-border">
                      <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-snug">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE SHELL: LEADERBOARD
───────────────────────────────────────────────────────────────────────────── */

export function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  if (tab === "badges") {
    return <Navigate to="/badges" replace />;
  }
  if (tab === "tiers") {
    return <Navigate to="/badges?tab=tiers" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar between Rankings & Badges */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Link
            to="/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold bg-white/10 text-white shadow-sm border border-white/15"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </Link>
          <Link
            to="/badges"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-transparent text-text-fog hover:text-white hover:bg-white/5 font-mono text-xs transition-all"
          >
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>Badges &amp; Tiers</span>
          </Link>
        </div>

        <Link
          to="/assessment"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-primary hover:text-white font-mono transition-colors"
        >
          <span>Take Test to Earn XP</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Leaderboard Rankings View */}
      <RankingsTab />
    </div>
  );
}
