import { useState, useCallback, useEffect } from "react";

export const INTRO_STORAGE_KEY = "kavach_intro_seen_v1";

/**
 * Checks whether the intro animation should be displayed.
 *
 * Rules:
 * 1. URL overrides: `?intro=1` forces playback; `?intro=0` skips playback.
 * 2. Reduced motion: Users with prefers-reduced-motion skip intro automatically.
 * 3. Session scope: Uses sessionStorage so every fresh browser session gets the intro,
 *    but in-tab navigation and refreshes do not repeatedly trigger it.
 * 4. Safe fallback: All storage operations are wrapped in try/catch to protect private browsing.
 */
function shouldShowIntroInitially(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("intro") === "1") return true;
    if (urlParams.get("intro") === "0") return false;

    // Respect user's OS reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    // Check session storage
    const seen = sessionStorage.getItem(INTRO_STORAGE_KEY);
    return seen !== "1";
  } catch {
    // If sessionStorage is unavailable (e.g. strict cookie blocking), default to false on errors
    return false;
  }
}

export function useIntroSeen() {
  const [showIntro, setShowIntro] = useState<boolean>(shouldShowIntroInitially);

  // Mark intro as seen in sessionStorage
  const markIntroSeen = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors in restricted private contexts
    }
  }, []);

  // Dismiss intro from state
  const dismissIntro = useCallback(() => {
    markIntroSeen();
    setShowIntro(false);
  }, [markIntroSeen]);

  // Replay intro (called from Settings page)
  const replayIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setShowIntro(true);
  }, []);

  // If initial check was true, listen to custom trigger events
  useEffect(() => {
    const handleReplayEvent = () => {
      replayIntro();
    };
    window.addEventListener("kavach:replay-intro", handleReplayEvent);
    return () => {
      window.removeEventListener("kavach:replay-intro", handleReplayEvent);
    };
  }, [replayIntro]);

  return {
    showIntro,
    markIntroSeen,
    dismissIntro,
    replayIntro,
  };
}
