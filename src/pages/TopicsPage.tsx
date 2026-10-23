import { useState, useEffect, useMemo } from "react";
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
import {
  Search,
  X,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Circle,
  ShieldAlert,
  Radio,
  FileCheck,
} from "lucide-react";

export { AWARENESS_TOPICS, PANIC_SHORTCUTS, type AwarenessTopic, type PanicShortcut };

export function TopicsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<AwarenessTopic | null>(null);

  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  // Track learned topic IDs
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

  const toggleLearned = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
          description: `+${XP.TOPIC_LEARNED} XP added to your defense score.`,
          variant: "success",
        });
        await refreshProfile();
      } catch {}
    }
  };

  const categories = [
    { id: "all", label: "All Threats", count: AWARENESS_TOPICS.length },
    { id: "high_alert", label: "High-Alert", count: AWARENESS_TOPICS.filter((t) => t.category === "high_alert").length },
    { id: "payments", label: "Banking & UPI", count: AWARENESS_TOPICS.filter((t) => t.category === "payments").length },
    { id: "ai_social", label: "AI & Impersonation", count: AWARENESS_TOPICS.filter((t) => t.category === "ai_social").length },
    { id: "safety_privacy", label: "Safety & Privacy", count: AWARENESS_TOPICS.filter((t) => t.category === "safety_privacy").length },
    { id: "mobile_device", label: "Mobile & Devices", count: AWARENESS_TOPICS.filter((t) => t.category === "mobile_device").length },
  ];

  const filteredTopics = useMemo(() => {
    return AWARENESS_TOPICS.filter((t) => {
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.summary.toLowerCase().includes(query) ||
        t.keyRedFlag.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  // Top 3 Spotlight Scams for Jury Wow-Factor
  const spotlightTopics = useMemo(() => {
    return AWARENESS_TOPICS.filter((t) =>
      ["digital-arrest", "upi-qr-fraud", "fake-loan-apps"].includes(t.id)
    );
  }, []);

  return (
    <div className="space-y-7 max-w-[1300px] mx-auto pb-12">
      {/* ── 1. CLEAN JURY-READY HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-text-ash">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-primary" /> Verified Scam Intelligence
            </span>
            <span>•</span>
            <span className="text-text-fog">2026 Defense Catalog</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-pure">
            Scam Library &amp; Threat Dossiers
          </h1>
          <p className="text-xs sm:text-sm text-text-fog max-w-2xl">
            Practical field guides on modern digital fraud, impersonation calls, and financial scams.
          </p>
        </div>

        {/* Quick Stats Counter */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            <div className="text-left text-xs">
              <span className="font-bold text-text-pure font-mono">{learnedTopics.length}/{AWARENESS_TOPICS.length}</span>
              <span className="text-[10px] text-text-ash block">Learned</span>
            </div>
          </div>

          <a
            href="tel:1930"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="National Cyber Helpline 1930"
          >
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            Helpline 1930
          </a>
        </div>
      </motion.div>

      {/* ── 2. TOP SPOTLIGHT THREATS (3 SLEEK CARDS) ── */}
      {search === "" && activeCategory === "all" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-text-pure">Most Critical Threats Right Now</h2>
            </div>
            <span className="text-xs text-text-ash font-medium">High Financial &amp; Legal Impact</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {spotlightTopics.map((topic) => (
              <motion.div
                key={topic.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTopic(topic)}
                className="rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-500/5 to-surface p-4 flex flex-col justify-between hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Pill tone="danger" size="sm">High Alert</Pill>
                    <span className="text-[11px] text-text-ash font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {topic.readTimeMinutes}m read
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-text-pure group-hover:text-primary transition-colors line-clamp-1">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-text-fog line-clamp-2 leading-relaxed">
                    {topic.summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-rose-500/20 text-xs text-rose-300 leading-snug">
                    <strong className="text-rose-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                      Key Red Flag:
                    </strong>
                    <span className="line-clamp-1 text-[11px]">{topic.keyRedFlag}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                    Inspect Dossier <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  {learnedTopics.includes(topic.id) && (
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Learned
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SEARCH & CATEGORY SELECTOR ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-ash" />
            <input
              type="text"
              placeholder="Search scams by name, tactic, or keyword (UPI, Police, Video Call)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-xs font-semibold"
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
        </div>
      </div>

      {/* ── 4. THREAT DOSSIER CATALOG GRID ── */}
      {filteredTopics.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const isLearned = learnedTopics.includes(topic.id);
            return (
              <motion.div
                key={topic.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTopic(topic)}
                className={`rounded-2xl border bg-surface p-4 flex flex-col justify-between hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group ${
                  isLearned ? "border-emerald-500/30" : "border-border"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Pill tone={topic.badgeTone} size="sm">{topic.categoryLabel}</Pill>
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
                      {isLearned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <h3 className="font-display text-sm font-bold text-text-pure group-hover:text-primary transition-colors line-clamp-1">
                    {topic.title}
                  </h3>

                  <p className="text-xs text-text-fog leading-relaxed line-clamp-2">
                    {topic.summary}
                  </p>

                  <div className="p-2 rounded-xl bg-surface-elevated border border-border text-xs text-text-pure leading-snug">
                    <span className="font-bold text-amber-500 text-[10px] uppercase tracking-wider block mb-0.5">
                      ⚠️ Clue:
                    </span>
                    <span className="text-[11px] text-text-fog line-clamp-1">{topic.keyRedFlag}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                    View Guide <ArrowRight className="h-3 w-3" />
                  </span>
                  <span className="text-[11px] text-text-ash font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {topic.readTimeMinutes}m read
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl bg-surface border border-border space-y-2">
          <Search className="h-6 w-6 text-text-ash mx-auto mb-1" />
          <p className="text-sm font-semibold text-text-pure">No threat guides match &quot;{search}&quot;</p>
          <p className="text-xs text-text-fog">Try broader terms like &apos;UPI&apos;, &apos;Police&apos;, or &apos;OTP&apos;.</p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* ── 5. CLEAN INTERACTIVE THREAT DOSSIER MODAL ── */}
      <AnimatePresence>
        {selectedTopic && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedTopic(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl my-6 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTopic(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-ash hover:text-text-pure hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <Pill tone={selectedTopic.badgeTone} size="sm">{selectedTopic.categoryLabel}</Pill>
                  <span className="text-xs text-text-ash font-mono">• {selectedTopic.readTimeMinutes} min read</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-text-pure">
                  {selectedTopic.title}
                </h2>
                <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
                  {selectedTopic.summary}
                </p>
              </div>

              {/* Golden Rule Banner */}
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs leading-relaxed text-text-pure">
                <strong className="text-danger block text-[11px] uppercase tracking-wider mb-0.5">
                  🛡️ Defense Rule:
                </strong>
                {selectedTopic.keyRedFlag}
              </div>

              {/* Attack Mechanism (Step by Step) */}
              <div className="p-3.5 rounded-xl bg-surface-elevated border border-border space-y-2">
                <div className="font-bold text-[11px] uppercase tracking-wider text-primary">
                  How The Attack Unfolds:
                </div>
                <ol className="space-y-1.5 text-xs text-text-pure">
                  {selectedTopic.howItWorks.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Do's and Don'ts */}
              <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-400">
                    Safe Protocols (Do):
                  </div>
                  <ul className="space-y-1 text-text-pure">
                    {selectedTopic.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-danger/5 border border-danger/20 space-y-1.5">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-danger">
                    Critical Traps (Never):
                  </div>
                  <ul className="space-y-1 text-text-pure">
                    {selectedTopic.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-danger shrink-0">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Emergency Protocol */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-text-pure">
                <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider mb-0.5">
                  If Targeted:
                </span>
                {selectedTopic.emergencyAction}
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => toggleLearned(selectedTopic.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    learnedTopics.includes(selectedTopic.id)
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-surface-elevated text-text-pure border border-border hover:bg-surface-hover"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {learnedTopics.includes(selectedTopic.id) ? "Learned (+25 XP)" : "Mark as Learned"}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:1930"
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
                  >
                    Dial 1930
                  </a>
                  <Button variant="secondary" size="xs" onClick={() => setSelectedTopic(null)}>
                    Close
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
