import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface SearchItem {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  to: string;
}

const STATIC_USER_PAGES: SearchItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard", to: "/dashboard" },
  { id: "training", label: "Training Modules", icon: "ti-book-2", to: "/training" },
  { id: "quizzes", label: "Quizzes", icon: "ti-clipboard-check", to: "/quizzes" },
  { id: "simulations", label: "Simulation Lab", icon: "ti-flask", to: "/simulations" },
  { id: "assessment", label: "Final Assessment", icon: "ti-gauge", to: "/assessment" },
  { id: "tools", label: "Security Tools & Password Meter", icon: "ti-tools", to: "/tools" },
  { id: "report", label: "Report Incident or Phishing", icon: "ti-alert-octagon", to: "/report" },
  { id: "progress", label: "Progress Telemetry", icon: "ti-trending-up", to: "/progress" },
  { id: "threats", label: "Threat Radar & CVE Advisories", icon: "ti-radar", to: "/threats" },
  { id: "badges", label: "Badges", icon: "ti-award", to: "/badges" },
  { id: "leaderboard", label: "Leaderboard", icon: "ti-trophy", to: "/leaderboard" },
  { id: "certificate", label: "Certificate", icon: "ti-certificate", to: "/certificate" },
  { id: "guide", label: "Security Guide Playbook", icon: "ti-shield-check", to: "/guide" },
  { id: "glossary", label: "Glossary", icon: "ti-book", to: "/glossary" },
  { id: "profile", label: "Profile", icon: "ti-user", to: "/profile" },
  { id: "settings", label: "Settings", icon: "ti-settings", to: "/settings" },
];

const STATIC_ADMIN_PAGES: SearchItem[] = [
  { id: "admin", label: "Admin Dashboard", icon: "ti-layout-dashboard", to: "/admin" },
  { id: "admin-users", label: "Manage Users", icon: "ti-users", to: "/admin/users" },
  { id: "admin-courses", label: "Manage Courses", icon: "ti-book-2", to: "/admin/courses" },
  { id: "admin-lessons", label: "Manage Lessons", icon: "ti-notes", to: "/admin/lessons" },
  { id: "admin-quizzes", label: "Manage Quizzes", icon: "ti-clipboard-check", to: "/admin/quizzes" },
  { id: "admin-simulations", label: "Manage Simulations", icon: "ti-flask", to: "/admin/simulations" },
  { id: "admin-badges", label: "Manage Badges", icon: "ti-award", to: "/admin/badges" },
  { id: "admin-reports", label: "Reports", icon: "ti-chart-bar", to: "/admin/reports" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<SearchItem[]>([]);
  const [quizzes, setQuizzes] = useState<SearchItem[]>([]);
  const [simulations, setSimulations] = useState<SearchItem[]>([]);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

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

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const [{ data: mods }, { data: qz }, { data: sims }] = await Promise.all([
        supabase.from("modules").select("id, title, slug, category").eq("is_published", true).limit(20),
        supabase.from("quizzes").select("id, title").eq("is_published", true).limit(20),
        supabase.from("simulations").select("id, title, slug").eq("is_published", true).limit(20),
      ]);
      setModules((mods ?? []).map((m) => ({ id: m.id, label: m.title, hint: m.category, icon: "ti-book-2", to: `/training/${m.slug}` })));
      setQuizzes((qz ?? []).map((q) => ({ id: q.id, label: q.title, icon: "ti-clipboard-check", to: `/quizzes/${q.id}` })));
      setSimulations((sims ?? []).map((s) => ({ id: s.id, label: s.title, icon: "ti-flask", to: `/simulations/${s.slug}` })));
    })();
  }, [open, user]);

  const go = (to: string) => {
    setOpen(false);
    setSearch("");
    navigate(to);
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[300] flex items-start justify-center bg-black/75 pt-[12vh] backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-modal w-full max-w-lg overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)]"
          >
            <Command shouldFilter loop>
              <div className="flex items-center gap-2 border-b border-border px-4 bg-surface-elevated">
                <i className="ti ti-search text-text-ash" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  autoFocus
                  placeholder="Type a command, topic, or search query..."
                  className="input flex-1 border-none bg-transparent px-2 py-3.5 text-sm text-text-pure focus:shadow-none"
                />
                <kbd className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text-ash">ESC</kbd>
              </div>

              <Command.List className="max-h-[55vh] overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center font-mono text-xs text-text-ash">No matches found.</Command.Empty>

                <Command.Group heading="Navigation Pages" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1">
                  {(isAdmin ? STATIC_ADMIN_PAGES : STATIC_USER_PAGES).map((item) => (
                    <PaletteItem key={item.id} item={item} onSelect={go} />
                  ))}
                </Command.Group>

                {modules.length > 0 && (
                  <Command.Group heading="Training Modules" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1">
                    {modules.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={go} />
                    ))}
                  </Command.Group>
                )}

                {quizzes.length > 0 && (
                  <Command.Group heading="Practice Quizzes" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1">
                    {quizzes.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={go} />
                    ))}
                  </Command.Group>
                )}

                {simulations.length > 0 && (
                  <Command.Group heading="Simulation Scenarios" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-widest text-text-ash [&_[cmdk-group-items]]:mt-1">
                    {simulations.map((item) => (
                      <PaletteItem key={item.id} item={item} onSelect={go} />
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({ item, onSelect }: { item: SearchItem; onSelect: (to: string) => void }) {
  return (
    <Command.Item
      value={`${item.label} ${item.hint ?? ""}`}
      onSelect={() => onSelect(item.to)}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-text-fog data-[selected=true]:bg-primary data-[selected=true]:text-white transition-colors"
    >
      <i className={`ti ${item.icon} text-base`} />
      <span className="flex-1">{item.label}</span>
      {item.hint && <span className="text-[10px] uppercase opacity-75">{item.hint.replace(/_/g, " ")}</span>}
    </Command.Item>
  );
}
