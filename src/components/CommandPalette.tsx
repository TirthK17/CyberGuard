import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSfx } from "@/lib/sfx";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";

interface SearchItem {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  to?: string;
  action?: () => void;
  category?: "nav" | "action" | "tool" | "module" | "quiz" | "simulation";
}

const STATIC_USER_PAGES: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard", to: "/dashboard", category: "nav" },
  { id: "training", label: "Training Modules", icon: "ti-book-2", to: "/training", category: "nav" },
  { id: "quizzes", label: "Quizzes", icon: "ti-clipboard-check", to: "/quizzes", category: "nav" },
  { id: "simulations", label: "Simulation Lab", icon: "ti-flask", to: "/simulations", category: "nav" },
  { id: "assessment", label: "Final Assessment", icon: "ti-gauge", to: "/assessment", category: "nav" },
  { id: "tools", label: "Security Tools & Password Meter", icon: "ti-tools", to: "/tools", category: "nav" },
  { id: "report", label: "Report Incident or Phishing", icon: "ti-alert-octagon", to: "/report", category: "nav" },
  { id: "progress", label: "Progress Telemetry", icon: "ti-trending-up", to: "/progress", category: "nav" },
  { id: "threats", label: "Threat Radar & CVE Advisories", icon: "ti-radar", to: "/threats", category: "nav" },
  { id: "badges", label: "Badges", icon: "ti-award", to: "/badges", category: "nav" },
  { id: "leaderboard", label: "Leaderboard", icon: "ti-trophy", to: "/leaderboard", category: "nav" },
  { id: "certificate", label: "Certificate", icon: "ti-certificate", to: "/certificate", category: "nav" },
  { id: "guide", label: "Security Guide Playbook", icon: "ti-shield-check", to: "/guide", category: "nav" },
  { id: "glossary", label: "Glossary", icon: "ti-book", to: "/glossary", category: "nav" },
  { id: "profile", label: "Profile", icon: "ti-user", to: "/profile", category: "nav" },
  { id: "settings", label: "Settings", icon: "ti-settings", to: "/settings", category: "nav" },
];

const STATIC_ADMIN_PAGES: SearchItem[] = [
  { id: "admin", label: "Admin Dashboard", icon: "ti-layout-dashboard", to: "/admin", category: "nav" },
  { id: "admin-users", label: "Manage Users", icon: "ti-users", to: "/admin/users", category: "nav" },
  { id: "admin-courses", label: "Manage Courses", icon: "ti-book-2", to: "/admin/courses", category: "nav" },
  { id: "admin-lessons", label: "Manage Lessons", icon: "ti-notes", to: "/admin/lessons", category: "nav" },
  { id: "admin-quizzes", label: "Manage Quizzes", icon: "ti-clipboard-check", to: "/admin/quizzes", category: "nav" },
  { id: "admin-simulations", label: "Manage Simulations", icon: "ti-flask", to: "/admin/simulations", category: "nav" },
  { id: "admin-badges", label: "Manage Badges", icon: "ti-award", to: "/admin/badges", category: "nav" },
  { id: "admin-reports", label: "Reports", icon: "ti-chart-bar", to: "/admin/reports", category: "nav" },
];

const SECURITY_TOOL_ACTIONS: SearchItem[] = [
  { id: "tool-password", label: "Password Strength & Pwned Check", hint: "Tool", icon: "ti-key", to: "/tools", category: "tool" },
  { id: "tool-passphrase", label: "Passphrase Generator (Diceware)", hint: "Tool", icon: "ti-lock", to: "/tools", category: "tool" },
  { id: "tool-breach", label: "Data Breach Radar (Demo)", hint: "Tool", icon: "ti-shield-alert", to: "/tools", category: "tool" },
  { id: "tool-url", label: "Link & Domain Inspector", hint: "Tool", icon: "ti-link", to: "/tools", category: "tool" },
  { id: "tool-header", label: "Email Header Analyzer (SPF/DKIM/DMARC)", hint: "Tool", icon: "ti-mail-check", to: "/tools", category: "tool" },
  { id: "tool-hash", label: "File Hash & VirusTotal Lookup", hint: "Tool", icon: "ti-file-code", to: "/tools", category: "tool" },
  { id: "tool-qr", label: "QR Code Safety Scanner", hint: "Tool", icon: "ti-qrcode", to: "/tools", category: "tool" },
  { id: "tool-msg", label: "Suspicious Message & SMS Analyzer", hint: "Tool", icon: "ti-message-report", to: "/tools", category: "tool" },
  { id: "tool-audit", label: "Cyber Hygiene 10-Point Checklist", hint: "Tool", icon: "ti-checklist", to: "/tools", category: "tool" },
];

const RECENT_KEY = "cyberguard_recent_commands";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<SearchItem[]>([]);
  const [quizzes, setQuizzes] = useState<SearchItem[]>([]);
  const [simulations, setSimulations] = useState<SearchItem[]>([]);
  const [recentItems, setRecentItems] = useState<SearchItem[]>([]);

  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { resolvedTheme, toggleTheme, hackerMode, toggleHackerMode } = useTheme();
  const { isMuted, toggleMute, playSfx } = useSfx();
  const toast = useToast();

  // Load recent items from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentItems(JSON.parse(saved));
      }
    } catch {}
  }, [open]);

  // Global shortcut listeners
  useEffect(() => {
    if (!user) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("cyberguard:open-command-palette", onCustomOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("cyberguard:open-command-palette", onCustomOpen);
    };
  }, [user]);

  // Fetch dynamic content on palette open
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [{ data: mods }, { data: qz }, { data: sims }] = await Promise.all([
        supabase.from("modules").select("id, title, slug, category").eq("is_published", true).limit(20),
        supabase.from("quizzes").select("id, title").eq("is_published", true).limit(20),
        supabase.from("simulations").select("id, title, slug").eq("is_published", true).limit(20),
      ]);
      setModules((mods ?? []).map((m) => ({ id: m.id, label: m.title, hint: m.category, icon: "ti-book-2", to: `/training/${m.slug}`, category: "module" })));
      setQuizzes((qz ?? []).map((q) => ({ id: q.id, label: q.title, icon: "ti-clipboard-check", to: `/quizzes/${q.id}`, category: "quiz" })));
      setSimulations((sims ?? []).map((s) => ({ id: s.id, label: s.title, icon: "ti-flask", to: `/simulations/${s.slug}`, category: "simulation" })));
    })();
  }, [open, user]);

  const saveRecent = (item: SearchItem) => {
    try {
      const updated = [item, ...recentItems.filter((r) => r.id !== item.id)].slice(0, 4);
      setRecentItems(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSelect = (item: SearchItem) => {
    setOpen(false);
    setSearch("");
    saveRecent(item);
    playSfx("click");

    if (item.action) {
      item.action();
    } else if (item.to) {
      navigate(item.to);
    }
  };

  const SYSTEM_ACTIONS: SearchItem[] = useMemo(
    () => [
      {
        id: "act-theme",
        label: `Toggle Theme (Current: ${resolvedTheme})`,
        hint: "Action",
        icon: resolvedTheme === "dark" ? "ti-sun" : "ti-moon",
        category: "action",
        action: () => {
          toggleTheme();
          toast({ title: `Theme switched to ${resolvedTheme === "dark" ? "light" : "dark"}`, variant: "info" });
        },
      },
      {
        id: "act-hacker",
        label: `Toggle Hacker Terminal Mode (${hackerMode ? "Active" : "Off"})`,
        hint: "Action",
        icon: "ti-terminal-2",
        category: "action",
        action: () => {
          toggleHackerMode();
          playSfx("alert");
          toast({ title: !hackerMode ? "Hacker Mode Enabled" : "Hacker Mode Disabled", variant: "info" });
        },
      },
      {
        id: "act-sound",
        label: `Toggle Sound Effects (${isMuted ? "Muted" : "Active"})`,
        hint: "Action",
        icon: isMuted ? "ti-volume-off" : "ti-volume",
        category: "action",
        action: () => {
          toggleMute();
          toast({ title: isMuted ? "Sound Effects Enabled" : "Sound Effects Muted", variant: "info" });
        },
      },
      {
        id: "act-shortcuts",
        label: "Keyboard Shortcuts Cheat-sheet",
        hint: "Press ?",
        icon: "ti-keyboard",
        category: "action",
        action: () => {
          window.dispatchEvent(new CustomEvent("cyberguard:open-shortcuts"));
        },
      },
      {
        id: "act-tour",
        label: "Replay Onboarding Tour",
        hint: "Action",
        icon: "ti-compass",
        category: "action",
        action: () => {
          window.dispatchEvent(new CustomEvent("cyberguard:start-onboarding"));
          toast({ title: "Launching Onboarding Tour", variant: "info" });
        },
      },
      {
        id: "act-logout",
        label: "Sign Out",
        hint: "Auth",
        icon: "ti-logout",
        category: "action",
        action: () => {
          signOut();
          navigate("/login");
          toast({ title: "Signed out successfully", variant: "info" });
        },
      },
    ],
    [resolvedTheme, toggleTheme, hackerMode, toggleHackerMode, isMuted, toggleMute, playSfx, toast, signOut, navigate]
  );

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] flex items-start justify-center bg-black/75 pt-[10vh] px-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] border border-border"
          >
            <Command shouldFilter loop>
              <div className="flex items-center gap-2 border-b border-border px-4 py-1 bg-surface-elevated">
                <i className="ti ti-search text-text-ash text-base" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  autoFocus
                  placeholder="Search pages, tools, simulations, or type an action..."
                  className="input flex-1 border-none bg-transparent px-2 py-3 text-sm text-text-pure focus:shadow-none focus:outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-ash">
                    ESC
                  </kbd>
                </div>
              </div>

              <Command.List className="max-h-[58vh] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center font-mono text-xs text-text-ash">
                  No matches found for &quot;{search}&quot;.
                </Command.Empty>

                {/* Recent Items */}
                {recentItems.length > 0 && !search && (
                  <Command.Group
                    heading="Recent Items"
                    className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-primary [&_[cmdk-group-items]]:mt-1"
                  >
                    {recentItems.map((item) => (
                      <PaletteItem key={`recent-${item.id}`} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                )}

                {/* Quick Actions */}
                <Command.Group
                  heading="Quick Actions & System"
                  className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                >
                  {SYSTEM_ACTIONS.map((item) => (
                    <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </Command.Group>

                {/* Security Tools */}
                <Command.Group
                  heading="Security Tools & Utilities"
                  className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                >
                  {SECURITY_TOOL_ACTIONS.map((item) => (
                    <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </Command.Group>

                {/* Navigation Pages */}
                <Command.Group
                  heading="Navigation Pages"
                  className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                >
                  {(isAdmin ? STATIC_ADMIN_PAGES : STATIC_USER_PAGES).map((item) => (
                    <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </Command.Group>

                {/* Training Modules */}
                {modules.length > 0 && (
                  <Command.Group
                    heading="Training Modules"
                    className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                  >
                    {modules.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                )}

                {/* Quizzes */}
                {quizzes.length > 0 && (
                  <Command.Group
                    heading="Practice Quizzes"
                    className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                  >
                    {quizzes.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                )}

                {/* Simulations */}
                {simulations.length > 0 && (
                  <Command.Group
                    heading="Simulation Scenarios"
                    className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1"
                  >
                    {simulations.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={handleSelect} />
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-surface-elevated/40 text-[11px] text-text-ash">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] mr-1">↑↓</kbd>
                    navigate
                  </span>
                  <span>
                    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] mr-1">↵</kbd>
                    select
                  </span>
                </div>
                <span>Press <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px]">?</kbd> for shortcuts</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({
  item,
  onSelect,
}: {
  item: SearchItem;
  onSelect: (item: SearchItem) => void;
}) {
  return (
    <Command.Item
      value={`${item.label} ${item.hint ?? ""}`}
      onSelect={() => onSelect(item)}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-text-fog data-[selected=true]:bg-primary data-[selected=true]:text-white transition-colors"
    >
      <i className={`ti ${item.icon} text-base shrink-0`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.hint && (
        <span className="text-[10px] uppercase opacity-75 font-mono shrink-0">
          {item.hint.replace(/_/g, " ")}
        </span>
      )}
    </Command.Item>
  );
}
