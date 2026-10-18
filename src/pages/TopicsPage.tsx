import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { recordActivity } from "@/lib/gamification";
import { XP } from "@/lib/constants";

import {
  AWARENESS_TOPICS,
  PANIC_SHORTCUTS,
  type AwarenessTopic,
  type PanicShortcut,
} from "@/data/topics";
export { AWARENESS_TOPICS, PANIC_SHORTCUTS, type AwarenessTopic, type PanicShortcut };

export function TopicsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeAudience, setActiveAudience] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<AwarenessTopic | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  // Track learned topic IDs in localStorage and user profile
  const [learnedTopics, setLearnedTopics] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_learned_topics_${profile?.id ?? "guest"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!profile?.id) return;
    try {
      const saved = localStorage.getItem(`cyberguard_learned_topics_${profile.id}`);
      if (saved) setLearnedTopics(JSON.parse(saved));
    } catch {}
  }, [profile?.id]);

  const toggleLearned = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLearned = !learnedTopics.includes(id);
    const next = isNowLearned ? [...learnedTopics, id] : learnedTopics.filter((item) => item !== id);
    setLearnedTopics(next);
    try {
      localStorage.setItem(`cyberguard_learned_topics_${profile?.id ?? "guest"}`, JSON.stringify(next));
    } catch {}

    if (isNowLearned && profile) {
      try {
        await recordActivity({
          userId: profile.id,
          action: "topic_learned",
          points: XP.TOPIC_LEARNED,
          meta: { topic_id: id },
          refId: `topic_${id}`,
          awardOnce: true,
        });
        toast({
          title: "Topic marked as learned!",
          description: `+${XP.TOPIC_LEARNED} XP earned for completing this safety guide.`,
          variant: "success",
        });
        await refreshProfile();
      } catch {}
    }
  };

  const categories = [
    { id: "all", label: "All Threats", count: AWARENESS_TOPICS.length },
    { id: "high_alert", label: "🚨 High-Alert", count: AWARENESS_TOPICS.filter((t) => t.category === "high_alert").length },
    { id: "payments", label: "💳 Banking & UPI", count: AWARENESS_TOPICS.filter((t) => t.category === "payments").length },
    { id: "ai_social", label: "🤖 AI & Impersonation", count: AWARENESS_TOPICS.filter((t) => t.category === "ai_social").length },
    { id: "safety_privacy", label: "🛡️ Safety & Privacy", count: AWARENESS_TOPICS.filter((t) => t.category === "safety_privacy").length },
    { id: "mobile_device", label: "📱 Mobile & Devices", count: AWARENESS_TOPICS.filter((t) => t.category === "mobile_device").length },
    { id: "laws", label: "⚖️ Legal & Helpline", count: AWARENESS_TOPICS.filter((t) => t.category === "laws").length },
  ];

  const audienceFilters = [
    { id: "all", label: "All Audiences" },
    { id: "Senior Citizens", label: "👴 Seniors & Parents" },
    { id: "Students", label: "🎓 Students & Youth" },
    { id: "Shop Owners", label: "🏪 Merchants & Shops" },
    { id: "Professionals", label: "💼 Working Professionals" },
  ];

  const filteredTopics = AWARENESS_TOPICS.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesAudience =
      activeAudience === "all" ||
      t.targetAudience.some((aud) => aud.toLowerCase().includes(activeAudience.toLowerCase()));
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.summary.toLowerCase().includes(query) ||
      t.keyRedFlag.toLowerCase().includes(query) ||
      t.redFlags.some((rf) => rf.toLowerCase().includes(query)) ||
      t.targetAudience.some((a) => a.toLowerCase().includes(query));
    return matchesCategory && matchesAudience && matchesSearch;
  });

  // Top 3 Spotlight Scams
  const spotlightTopics = AWARENESS_TOPICS.filter((t) =>
    ["digital-arrest", "upi-qr-fraud", "fake-loan-apps"].includes(t.id)
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* ── 1. CLEAN HERO HEADER & EMERGENCY RIBBON ── */}
      <div className="space-y-4">
        {/* Top Emergency Action Ribbon */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold text-base shadow-sm">
              <i className="ti ti-phone-call animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                  Citizen Helpline 1930
                </span>
                <span className="text-xs font-semibold text-rose-300">
                  ⏱️ Golden Hour (2-3 hrs)
                </span>
              </div>
              <p className="text-xs text-text-pure font-medium mt-0.5">
                Targeted or money debited? Call <strong>1930</strong> immediately to freeze funds in destination bank accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors shadow-xs"
            >
              <i className="ti ti-phone text-xs" />
              Call 1930 Free
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-medium text-text-pure hover:bg-surface-elevated transition-colors"
            >
              cybercrime.gov.in ↗
            </a>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-0.5 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online Scam Directory • Simple Guides
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-pure">
            Cyber Safety &amp; Scam Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
            Concise, practical guides to help you spot scams early and know the exact steps to protect your finances.
          </p>
        </div>
      </div>

      {/* ── 2. INSTANT PANIC TRIAGE: "ARE YOU EXPERIENCING THIS RIGHT NOW?" ── */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-danger/10 text-danger flex items-center justify-center text-xs">
              <i className="ti ti-bolt" />
            </div>
            <h2 className="font-display text-xs sm:text-sm font-bold text-text-pure uppercase tracking-wider">
              Experiencing a Suspicious Situation Right Now?
            </h2>
          </div>
          <span className="text-[11px] text-text-ash font-medium">
            1-click immediate defense advice
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {PANIC_SHORTCUTS.map((sc) => {
            const matched = AWARENESS_TOPICS.find((t) => t.id === sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => matched && setSelectedTopic(matched)}
                className="flex flex-col justify-between text-left p-3 rounded-xl border border-border bg-surface-elevated hover:border-primary/50 hover:bg-surface transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <i className={`ti ${sc.icon} text-sm text-primary`} />
                    <span className="font-semibold text-xs text-text-pure group-hover:text-primary transition-colors line-clamp-1">
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-fog leading-relaxed line-clamp-2">
                    {sc.trigger}
                  </p>
                </div>
                <span className="mt-2 text-[11px] text-primary font-semibold flex items-center gap-1">
                  View Guide <i className="ti ti-arrow-right text-[10px]" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. FEATURED SPOTLIGHT: TOP 3 MOST CRITICAL THREATS ── */}
      {search === "" && activeCategory === "all" && activeAudience === "all" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <h2 className="font-display text-sm sm:text-base font-bold text-text-pure">
                Most Critical Threats in 2025–2026
              </h2>
            </div>
            <span className="text-[11px] text-text-ash font-medium">
              Highest Financial Impact
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-3">
            {spotlightTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="rounded-2xl border border-rose-500/30 bg-surface p-4 flex flex-col justify-between hover:border-rose-500/60 hover:shadow-sm transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      <i className={`ti ${topic.icon} text-lg`} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 uppercase tracking-wider">
                      High Alert
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-text-pure group-hover:text-primary transition-colors line-clamp-1">
                    {topic.title}
                  </h3>

                  <p className="mt-1 text-xs text-text-fog leading-relaxed line-clamp-2">
                    {topic.summary}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-danger/10 border border-danger/20 text-xs text-text-pure leading-snug">
                    <span className="font-bold text-danger text-[11px]">⚠️ Key Clue: </span>
                    <span className="text-[11px] line-clamp-1">{topic.keyRedFlag}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary group-hover:underline flex items-center gap-1 text-[11px]">
                    Read Guide <i className="ti ti-chevron-right text-[10px]" />
                  </span>
                  <span className="text-[11px] font-medium text-text-ash">
                    ⏱️ {topic.readTimeMinutes}m read
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. SEARCH, CATEGORIES & AUDIENCE FILTERS + VIEW TOGGLE ── */}
      <div className="space-y-3 pt-1">
        {/* Search Bar & Result Count & View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
            <input
              type="text"
              placeholder="Search scams, keywords, or tactics (UPI, Police, OTP)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-surface text-xs text-text-pure placeholder:text-text-ash focus:outline-none focus:border-primary shadow-xs transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure text-xs cursor-pointer"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-medium text-text-ash">
              <strong className="text-text-pure">{filteredTopics.length}</strong> of {AWARENESS_TOPICS.length} guides
            </span>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-surface-elevated p-0.5 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                title="Card Grid View"
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "grid" ? "bg-surface text-text-pure shadow-xs border border-border" : "text-text-ash hover:text-text-pure"
                }`}
              >
                <i className="ti ti-layout-grid text-xs" /> Grid
              </button>
              <button
                onClick={() => setViewMode("compact")}
                title="Compact List View"
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === "compact" ? "bg-surface text-text-pure shadow-xs border border-border" : "text-text-ash hover:text-text-pure"
                }`}
              >
                <i className="ti ti-list text-xs" /> List
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === cat.id ? "bg-white/20 text-white" : "bg-surface-elevated text-text-ash"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Audience Sub-Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs text-text-ash">
          <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1">Audience:</span>
          {audienceFilters.map((aud) => (
            <button
              key={aud.id}
              onClick={() => setActiveAudience(aud.id)}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeAudience === aud.id
                  ? "bg-surface-elevated text-text-pure border border-border font-semibold shadow-xs"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. COMPLETE THREAT TOPICS DIRECTORY ── */}
      {viewMode === "grid" ? (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const isLearned = learnedTopics.includes(topic.id);
            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border bg-surface p-4 flex flex-col justify-between transition-all cursor-pointer group hover:border-primary/50 hover:shadow-xs ${
                  isLearned ? "border-emerald-500/30" : "border-border"
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <i className={`ti ${topic.icon} text-base`} />
                      </div>
                      <Pill tone={topic.badgeTone} size="sm">{topic.categoryLabel}</Pill>
                    </div>

                    <button
                      type="button"
                      title={isLearned ? "Marked as Learned" : "Mark as Learned"}
                      onClick={(e) => toggleLearned(topic.id, e)}
                      className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                        isLearned
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                          : "border-border text-text-ash hover:text-text-pure"
                      }`}
                    >
                      <i className={`ti ${isLearned ? "ti-check" : "ti-circle"} text-xs`} />
                    </button>
                  </div>

                  {/* Card Title */}
                  <h3 className="font-display text-sm font-bold text-text-pure group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                    {topic.title}
                  </h3>

                  {/* Card Summary */}
                  <p className="mt-1 text-xs text-text-fog leading-relaxed line-clamp-2">
                    {topic.summary}
                  </p>

                  {/* Micro Clue Callout */}
                  <div className="mt-2.5 p-2 rounded-lg bg-surface-elevated border border-border text-xs text-text-pure leading-snug">
                    <span className="font-bold text-warn text-[11px]">⚠️ Clue: </span>
                    <span className="text-[11px] text-text-fog line-clamp-1">{topic.keyRedFlag}</span>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1 group-hover:underline text-[11px]">
                    Open Safety Guide <i className="ti ti-arrow-right text-[10px]" />
                  </span>
                  <span className="text-[11px] font-medium text-text-ash">
                    ⏱️ {topic.readTimeMinutes}m read
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Compact List View for Instant Scanning */
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          {filteredTopics.map((topic) => {
            const isLearned = learnedTopics.includes(topic.id);
            return (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-surface-elevated transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <i className={`ti ${topic.icon} text-base`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs sm:text-sm text-text-pure group-hover:text-primary transition-colors truncate">
                        {topic.title}
                      </h4>
                      <Pill tone={topic.badgeTone} size="sm">{topic.categoryLabel}</Pill>
                    </div>
                    <p className="text-[11px] text-text-fog truncate mt-0.5">
                      {topic.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-text-ash hidden sm:inline">
                    ⏱️ {topic.readTimeMinutes}m
                  </span>
                  <button
                    type="button"
                    title={isLearned ? "Marked as Learned" : "Mark as Learned"}
                    onClick={(e) => toggleLearned(topic.id, e)}
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                      isLearned
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                        : "border-border text-text-ash hover:text-text-pure"
                    }`}
                  >
                    <i className={`ti ${isLearned ? "ti-check" : "ti-circle"} text-xs`} />
                  </button>
                  <Button variant="secondary" size="xs" className="hidden sm:inline-flex">
                    View Guide
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty Search State */}
      {filteredTopics.length === 0 && (
        <div className="p-10 text-center rounded-2xl bg-surface border border-border space-y-2">
          <i className="ti ti-search text-3xl text-text-ash mb-1" />
          <p className="text-sm font-semibold text-text-pure">No guides matching &quot;{search}&quot;</p>
          <p className="text-xs text-text-fog">Try broader terms like &apos;UPI&apos;, &apos;Police&apos;, &apos;OTP&apos;, or &apos;Aadhaar&apos;.</p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
                setActiveAudience("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── 6. DETAILED TOPIC DEEP-DIVE MODAL ── */}
      <AnimatePresence>
        {selectedTopic && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl my-6 rounded-2xl border border-border bg-surface p-5 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-text-ash hover:text-text-pure hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <i className="ti ti-x text-lg" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <Pill tone={selectedTopic.badgeTone}>{selectedTopic.categoryLabel}</Pill>
                  <span className="text-xs text-text-ash font-medium">• ⏱️ {selectedTopic.readTimeMinutes} min read</span>
                </div>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-text-pure flex items-center gap-2.5">
                  <i className={`ti ${selectedTopic.icon} text-primary`} />
                  {selectedTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-text-fog leading-relaxed">
                  {selectedTopic.summary}
                </p>
              </div>

              {/* Primary Key Rule Callout */}
              <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3">
                <i className="ti ti-alert-triangle text-danger text-lg shrink-0 mt-0.5" />
                <div className="text-sm text-text-pure leading-relaxed">
                  <strong className="text-danger block mb-0.5 text-xs font-bold uppercase tracking-wider">
                    Golden Rule to Remember:
                  </strong>
                  {selectedTopic.keyRedFlag}
                </div>
              </div>

              {/* Step-by-Step Modus Operandi */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2.5">
                <div className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <i className="ti ti-eye" /> How The Scam Works (Step-by-Step):
                </div>
                <ol className="space-y-2 text-sm text-text-pure">
                  {selectedTopic.howItWorks.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning Signs & Red Flags */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-danger flex items-center gap-1.5">
                  <i className="ti ti-alert-octagon" /> Critical Warning Signs &amp; Red Flags:
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedTopic.redFlags.map((flag, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-danger/5 border border-danger/20 text-xs sm:text-sm text-text-pure flex items-start gap-2 leading-relaxed">
                      <i className="ti ti-x text-danger shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-success flex items-center gap-1.5">
                    <i className="ti ti-shield-check" /> Do&apos;s (Protective Habits):
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-text-pure">
                    {selectedTopic.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <i className="ti ti-check text-success shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-danger flex items-center gap-1.5">
                    <i className="ti ti-shield-x" /> Don&apos;ts (Never Do This):
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-text-pure">
                    {selectedTopic.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <i className="ti ti-ban text-danger shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emergency Action */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-xs sm:text-sm">
                <div className="font-bold text-rose-400 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                  <i className="ti ti-sos text-sm" /> Emergency Action If Targeted:
                </div>
                <p className="text-text-pure leading-relaxed">
                  {selectedTopic.emergencyAction}
                </p>
              </div>

              {/* Modal Footer with Actions */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-ash">
                    National Helpline:
                  </span>
                  <a
                    href="tel:1930"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono text-xs font-bold shadow-xs hover:bg-rose-500"
                  >
                    <i className="ti ti-phone text-[11px]" />
                    Dial 1930
                  </a>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {selectedTopic.relatedToolOrSim && (
                    <Button
                      to={selectedTopic.relatedToolOrSim.link}
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedTopic(null)}
                    >
                      {selectedTopic.relatedToolOrSim.label}
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setSelectedTopic(null)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
