import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard, useBadges, useUserBadges } from "@/hooks/useContent";
import { Card, Pill, SkeletonCard, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";

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

const OPERATOR_TIERS: TierInfo[] = [
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

const MEDAL_CONFIG = [
  { rank: 1, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", glow: "shadow-[0_0_24px_rgba(251,191,36,0.15)]", icon: "🥇", label: "Champion" },
  { rank: 2, color: "text-slate-300",  bg: "bg-slate-300/10 border-slate-300/30",  glow: "shadow-[0_0_24px_rgba(203,213,225,0.1)]",  icon: "🥈", label: "Runner Up" },
  { rank: 3, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30", glow: "shadow-[0_0_24px_rgba(217,119,6,0.1)]",  icon: "🥉", label: "Third Place" },
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

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function getRarityTone(rarity: "Common" | "Rare" | "Epic" | "Legendary"): "default" | "cyan" | "violet" | "warn" {
  switch (rarity) {
    case "Common": return "default";
    case "Rare": return "cyan";
    case "Epic": return "violet";
    case "Legendary": return "warn";
  }
}

function isDemoUser(entry: { id?: string; user_id?: string; email?: string }) {
  const id = entry.id || entry.user_id || "";
  const email = entry.email || "";
  return id.startsWith("user-demo") || email.endsWith("@cyberguard.dev");
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: RANKINGS TAB
───────────────────────────────────────────────────────────────────────────── */

function RankingsTab() {
  const { profile } = useAuth();
  const { data: entries, loading } = useLeaderboard();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const operatorList = entries ?? [];

  const filtered = useMemo(() => {
    return operatorList.filter((op) => {
      const matchSearch = op.full_name.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === "all" || String(op.level) === tierFilter;
      return matchSearch && matchTier;
    });
  }, [operatorList, search, tierFilter]);

  const top3 = operatorList.slice(0, 3);
  const myRankIdx = operatorList.findIndex((e) => e.id === profile?.id || e.user_id === profile?.id);
  const myRank = myRankIdx >= 0 ? myRankIdx + 1 : null;
  const nextRankUser = myRankIdx > 0 ? operatorList[myRankIdx - 1] : null;

  return (
    <div className="space-y-8">
      {/* 1. TOP 3 PODIUM OF CHAMPIONS */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        top3.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-ash flex items-center gap-1.5">
                <i className="ti ti-crown text-warn" /> Top Community Learners
              </span>
              <span className="font-mono text-[10px] text-emerald-400">Community Rankings</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-end">
              {/* Silver #2, Gold #1, Bronze #3 visual arrangement */}
              {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
                if (!entry) return null;
                const rank = [2, 1, 3][podiumIdx];
                const cfg = MEDAL_CONFIG[rank - 1];
                const isFirst = rank === 1;
                const isMe = entry.id === profile?.id || entry.user_id === profile?.id;

                return (
                  <motion.div
                    key={entry.user_id || entry.id}
                    initial={{ opacity: 0, y: isFirst ? 16 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: podiumIdx * 0.08, duration: 0.35 }}
                    className={`rounded-3xl border p-6 text-center transition-all bg-surface-elevated relative overflow-hidden ${
                      isFirst
                        ? "border-amber-400/40 bg-gradient-to-b from-amber-400/10 to-surface-elevated sm:-translate-y-2 " + cfg.glow
                        : "border-border " + cfg.glow
                    } ${isMe ? "ring-2 ring-primary" : ""}`}
                  >
                    {isFirst && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-black font-mono text-[9px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-widest">
                        #1 Rank
                      </div>
                    )}

                    <div className="text-3xl mb-1">{cfg.icon}</div>

                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border font-mono font-bold text-lg ${cfg.bg} ${cfg.color}`}
                    >
                      {getInitials(entry.full_name)}
                    </div>

                    <h3 className="mt-3.5 font-display text-sm font-bold text-text-pure truncate flex items-center justify-center gap-1.5">
                      <span>{entry.full_name}</span>
                      {isMe && <span className="text-primary font-mono text-[10px]">(You)</span>}
                      {isDemoUser(entry) && (
                        <span className="rounded bg-surface-muted border border-border text-text-ash font-mono text-[9px] px-1.5 py-0.2 uppercase">
                          Demo
                        </span>
                      )}
                    </h3>

                    <div className="mt-1">
                      <span className={`font-display text-2xl font-bold ${cfg.color}`}>
                        {entry.points.toLocaleString()}
                      </span>
                      <span className="font-mono text-[10px] text-text-ash uppercase ml-1">XP</span>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] text-text-fog">
                        Level {entry.level}
                      </span>
                      <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] text-primary font-semibold">
                        {entry.badges_count ?? 0} Badges
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* 2. LOGGED-IN USER RANK CALLOUT CARD */}
      {profile && (
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-primary/10 via-surface to-surface-elevated border-primary/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/40 bg-primary/20 font-mono text-xl font-bold text-primary shadow-sm">
                {myRank ? `#${myRank}` : "—"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">
                    Your Current Standings
                  </span>
                  <Pill tone="primary" size="sm">Level {profile.level}</Pill>
                </div>
                <h4 className="font-display text-base font-bold text-text-pure mt-0.5">
                  {profile.full_name}
                </h4>
                <p className="text-xs text-text-fog font-mono">
                  {profile.points.toLocaleString()} XP · {profile.awareness_score != null ? `${profile.awareness_score}% Safety Score` : "Safety score pending"}
                </p>
              </div>
            </div>

            {nextRankUser && (
              <div className="rounded-2xl border border-border bg-surface p-3.5 space-y-1 text-xs sm:text-right">
                <span className="font-mono text-[10px] text-text-ash uppercase block">
                  Next Rank Target: #{myRankIdx} ({nextRankUser.full_name})
                </span>
                <div className="font-mono text-xs font-bold text-emerald-400">
                  +{Math.max(0, nextRankUser.points - profile.points + 10)} XP needed to advance
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 3. FULL COMMUNITY LEADERBOARD TABLE */}
      <Card className="p-0 overflow-hidden border-border bg-surface-elevated">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search learners by name..."
              className="input pl-10 text-xs py-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-ash">Filter Level:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="select text-xs py-1.5 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
            >
              <option value="all">All Levels</option>
              <option value="5">Tier 5 (Master Guardian)</option>
              <option value="4">Tier 4 (Guardian)</option>
              <option value="3">Tier 3 (Protector)</option>
              <option value="2">Tier 2 (Explorer)</option>
              <option value="1">Tier 1 (Beginner)</option>
            </select>
          </div>
        </div>

        {/* Table Roster */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-ash">
              No learners match your search query.
            </div>
          ) : (
            filtered.map((entry, idx) => {
              const isMe = entry.id === profile?.id || entry.user_id === profile?.id;
              const displayRank = entry.rank || idx + 1;

              return (
                <div
                  key={entry.user_id || entry.id || idx}
                  className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 transition-colors ${
                    isMe
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-surface"
                  }`}
                >
                  {/* Rank number or medal */}
                  <span className="w-8 shrink-0 font-mono text-xs font-bold text-text-ash">
                    {displayRank === 1 ? "🥇" : displayRank === 2 ? "🥈" : displayRank === 3 ? "🥉" : `#${displayRank}`}
                  </span>

                  {/* Avatar Initials */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface font-mono text-xs font-bold text-text-pure">
                    {getInitials(entry.full_name)}
                  </div>

                  {/* Name & Tier */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-xs sm:text-sm font-semibold ${isMe ? "text-primary font-bold" : "text-text-pure"}`}>
                        {entry.full_name}
                      </p>
                      {isMe && (
                        <span className="rounded bg-primary/20 text-primary font-mono text-[9px] font-bold px-1.5 py-0.2 uppercase">
                          You
                        </span>
                      )}
                      {isDemoUser(entry) && (
                        <span className="rounded bg-surface-muted border border-border text-text-ash font-mono text-[9px] px-1.5 py-0.2 uppercase">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-text-ash mt-0.5">
                      <span>Level {entry.level}</span>
                      <span>·</span>
                      <span>{entry.badges_count ?? 0} Badges</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs sm:text-sm font-bold text-text-pure block">
                      {entry.points.toLocaleString()} XP
                    </span>
                    <span className="font-mono text-[10px] text-text-ash">Score</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: BADGES TAB
───────────────────────────────────────────────────────────────────────────── */

function BadgesTab() {
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

function TiersTab() {
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
                      <i className="ti ti-check text-emerald-400 mt-0.5 shrink-0" />
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
   MAIN PAGE SHELL
───────────────────────────────────────────────────────────────────────────── */

export function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "rankings" | "badges" | "tiers") || "rankings";
  const [activeTab, setActiveTab] = useState<"rankings" | "badges" | "tiers">(initialTab);

  const handleTabChange = (tab: "rankings" | "badges" | "tiers") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5"
      >
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
            Community &amp; Achievements
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
            Leaderboard &amp; Badges
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            See top learners in the community, collect achievement badges, and level up as you complete safety lessons.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border">
          {[
            { id: "rankings", label: "Rankings", icon: "ti-trophy" },
            { id: "badges",   label: "Badges", icon: "ti-award" },
            { id: "tiers",    label: "Tiers & Perks", icon: "ti-hierarchy" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
                }`}
              >
                <i className={`ti ${tab.icon} text-xs`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "rankings" && <RankingsTab />}
          {activeTab === "badges" && <BadgesTab />}
          {activeTab === "tiers" && <TiersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
