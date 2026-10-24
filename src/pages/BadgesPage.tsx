import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Layers, Trophy } from "lucide-react";
import { BadgesTab, TiersTab } from "./LeaderboardPage";

export function BadgesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"badges" | "tiers">(
    tabParam === "tiers" ? "tiers" : "badges"
  );

  useEffect(() => {
    if (tabParam === "tiers") {
      setActiveTab("tiers");
    } else {
      setActiveTab("badges");
    }
  }, [tabParam]);

  const handleTabChange = (tab: "badges" | "tiers") => {
    setActiveTab(tab);
    setSearchParams(tab === "tiers" ? { tab: "tiers" } : {});
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
            Achievements &amp; Progression
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
            Badges &amp; Ranks
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Collect achievement badges and unlock higher guardian tiers as you master security lessons.
          </p>
        </div>

        {/* Tab Switcher & Leaderboard Link */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border">
            <button
              onClick={() => handleTabChange("badges")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                activeTab === "badges"
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Badges</span>
            </button>
            <button
              onClick={() => handleTabChange("tiers")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                activeTab === "tiers"
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Tiers &amp; Perks</span>
            </button>
          </div>

          <Link
            to="/leaderboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-surface text-text-fog hover:text-text-pure hover:bg-surface-elevated font-mono text-xs transition-all"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            <span>Leaderboard</span>
          </Link>
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
          {activeTab === "badges" ? <BadgesTab /> : <TiersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
