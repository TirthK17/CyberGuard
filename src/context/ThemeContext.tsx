import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type AccentTheme = "blue" | "emerald" | "violet" | "amber";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  accent: AccentTheme;
  hackerMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccent: (accent: AccentTheme) => void;
  setHackerMode: (enabled: boolean) => void;
  toggleHackerMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "cyberguard-theme-v2";
const ACCENT_STORAGE_KEY = "cyberguard-accent";
const HACKER_MODE_STORAGE_KEY = "cyberguard-hacker-mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved && ["light", "dark", "system"].includes(saved) ? saved : "dark";
  });

  const [accent, setAccentState] = useState<AccentTheme>(() => {
    if (typeof window === "undefined") return "blue";
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentTheme | null;
    return saved && ["blue", "emerald", "violet", "amber"].includes(saved) ? saved : "blue";
  });

  const [hackerMode, setHackerModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(HACKER_MODE_STORAGE_KEY) === "true";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const root = document.documentElement;

    const applyResolved = () => {
      let active: ResolvedTheme = "dark";
      if (theme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        active = systemDark ? "dark" : "light";
      } else {
        active = theme;
      }

      setResolvedTheme(active);

      if (active === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };

    applyResolved();

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyResolved();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", accent);
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-hacker-mode", String(hackerMode));
    localStorage.setItem(HACKER_MODE_STORAGE_KEY, String(hackerMode));
  }, [hackerMode]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const setAccent = (next: AccentTheme) => {
    setAccentState(next);
  };

  const setHackerMode = (next: boolean) => {
    setHackerModeState(next);
  };

  const toggleHackerMode = () => {
    setHackerModeState((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        accent,
        hackerMode,
        setTheme,
        toggleTheme,
        setAccent,
        setHackerMode,
        toggleHackerMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
