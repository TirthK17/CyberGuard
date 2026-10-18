import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type ReducedMotionPreference = "auto" | "reduce" | "no-preference";

interface AccessibilityContextValue {
  reducedMotion: ReducedMotionPreference;
  setReducedMotion: (preference: ReducedMotionPreference) => void;
  isMotionReduced: boolean;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = "cyberguard_reduced_motion";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotionState] = useState<ReducedMotionPreference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "reduce" || saved === "no-preference" || saved === "auto") {
        return saved;
      }
    } catch {}
    return "auto";
  });

  const [systemPrefersReduced, setSystemPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersReduced(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  const isMotionReduced = useMemo(() => {
    if (reducedMotion === "reduce") return true;
    if (reducedMotion === "no-preference") return false;
    return systemPrefersReduced;
  }, [reducedMotion, systemPrefersReduced]);

  // Synchronize CSS class on document element for global CSS rules
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isMotionReduced) {
        document.documentElement.classList.add("reduce-motion");
      } else {
        document.documentElement.classList.remove("reduce-motion");
      }
    }
  }, [isMotionReduced]);

  const setReducedMotion = (preference: ReducedMotionPreference) => {
    setReducedMotionState(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {}
  };

  const toggleReducedMotion = () => {
    setReducedMotion(isMotionReduced ? "no-preference" : "reduce");
  };

  const value = useMemo(
    () => ({
      reducedMotion,
      setReducedMotion,
      isMotionReduced,
      toggleReducedMotion,
    }),
    [reducedMotion, isMotionReduced]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      <MotionConfig reducedMotion={isMotionReduced ? "always" : "user"}>
        {children}
      </MotionConfig>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
