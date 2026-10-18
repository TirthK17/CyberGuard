import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { celebrate } from "@/lib/celebrate";
import { playSfx } from "@/lib/sfx";
import { Button } from "@/components/ui/Button";

interface LevelUpDetail {
  oldLevel: number;
  newLevel: number;
  newPoints: number;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export function CelebrationModal() {
  const [levelUp, setLevelUp] = useState<LevelUpDetail | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeItem[]>([]);

  useEffect(() => {
    const handleLevelUp = (e: Event) => {
      const custom = e as CustomEvent<LevelUpDetail>;
      if (custom.detail) {
        setLevelUp(custom.detail);
        celebrate();
        playSfx("success");
      }
    };

    const handleBadges = (e: Event) => {
      const custom = e as CustomEvent<{ badges: BadgeItem[] }>;
      if (custom.detail?.badges?.length) {
        setNewBadges((prev) => [...prev, ...custom.detail.badges]);
        celebrate();
        playSfx("success");
      }
    };

    window.addEventListener("cyberguard:level-up", handleLevelUp);
    window.addEventListener("cyberguard:badges-unlocked", handleBadges);

    return () => {
      window.removeEventListener("cyberguard:level-up", handleLevelUp);
      window.removeEventListener("cyberguard:badges-unlocked", handleBadges);
    };
  }, []);

  const closeLevelUp = () => setLevelUp(null);

  const closeBadges = () => setNewBadges([]);

  return (
    <>
      {/* ── Level Up Celebration Modal ── */}
      <AnimatePresence>
        {levelUp && (
          <div
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={closeLevelUp}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-primary/30 bg-surface p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/30 text-primary shadow-lg mb-4">
                <i className="ti ti-trophy text-4xl" />
              </div>

              <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                Security Level Up!
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-text-pure mt-1">
                Level {levelUp.newLevel} Reached
              </h2>
              <p className="text-xs sm:text-sm text-text-fog mt-2">
                Your cyber defensive expertise has expanded to Level {levelUp.newLevel} with {levelUp.newPoints} lifetime XP.
              </p>

              <div className="my-5 p-3 rounded-2xl bg-surface-elevated border border-border">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-text-ash">Level {levelUp.oldLevel}</span>
                  <span className="text-primary font-bold">Level {levelUp.newLevel}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "20%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={closeLevelUp}
                className="w-full justify-center"
              >
                Keep Defending
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Badge Unlock Celebration Modal ── */}
      <AnimatePresence>
        {!levelUp && newBadges.length > 0 && (
          <div
            className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={closeBadges}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl border border-amber-500/30 bg-surface p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-lg mb-4">
                <i className="ti ti-award text-4xl" />
              </div>

              <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-500">
                New Badge Unlocked!
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-text-pure mt-1">
                {newBadges[0].name}
              </h2>
              <p className="text-xs text-text-fog mt-2">
                {newBadges[0].description}
              </p>

              {newBadges.length > 1 && (
                <p className="text-[11px] text-text-ash mt-3 font-semibold">
                  + {newBadges.length - 1} more badge(s) unlocked!
                </p>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={closeBadges}
                className="mt-6 w-full justify-center"
              >
                Claim Badge
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
