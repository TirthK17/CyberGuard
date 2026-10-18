import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { CyberGuardLogo, CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function groupUserNav(items: NavItem[]): NavSection[] {
  const sections: NavSection[] = [
    {
      label: "Main",
      items: items.filter((i) => ["/dashboard"].includes(i.to)),
    },
    {
      label: "Learn & Practice",
      items: items.filter((i) =>
        ["/training", "/simulations", "/topics", "/assessment"].includes(i.to)
      ),
    },
    {
      label: "Safety Tools",
      items: items.filter((i) =>
        ["/tools", "/threats", "/report", "/leaderboard"].includes(i.to)
      ),
    },
    {
      label: "Account",
      items: items.filter((i) => ["/settings"].includes(i.to)),
    },
  ];
  return sections.filter((s) => s.items.length > 0);
}

function groupAdminNav(items: NavItem[]): NavSection[] {
  const sections: NavSection[] = [
    {
      label: "Overview",
      items: items.filter((i) => ["/admin"].includes(i.to)),
    },
    {
      label: "Administration",
      items: items.filter((i) =>
        ["/admin/users", "/admin/courses", "/admin/reports"].includes(i.to)
      ),
    },
    {
      label: "System",
      items: items.filter((i) => ["/admin/settings"].includes(i.to)),
    },
  ];
  return sections.filter((s) => s.items.length > 0);
}

import { LEVELS } from "@/lib/constants";

function levelProgress(points: number) {
  const cur = [...LEVELS].reverse().find((l) => points >= l.minPoints) ?? LEVELS[0];
  const next = LEVELS.find((l) => l.level === cur.level + 1);
  if (!next) return 100;
  return Math.round(((points - cur.minPoints) / (next.minPoints - cur.minPoints)) * 100);
}

function SidebarNav({
  sections,
  collapsed,
}: {
  sections: NavSection[];
  collapsed: boolean;
}) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pb-2" aria-label="Main navigation">
      {sections.map((section, si) => (
        <div key={section.label} className={cn("", si > 0 && "mt-4")}>
          {!collapsed && (
            <p className="sidebar-section-label mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-text-ash">
              {section.label}
            </p>
          )}
          {section.items.map((item, i) => {
            const active = location.pathname === item.to;
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.2,
                  delay: si * 0.02 + i * 0.015,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium",
                    "transition-all duration-150 ease-out group",
                    active
                      ? "bg-surface-elevated text-text-pure font-semibold shadow-sm border border-border"
                      : "text-text-fog hover:bg-surface-hover hover:text-text-pure border border-transparent"
                  )}
                >
                  {/* macOS active accent bar */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-bar"
                      className="nav-active-bar"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <i
                    className={cn(
                      `ti ${item.icon} relative z-10 text-base shrink-0 transition-colors`,
                      active ? "text-primary" : "text-text-ash group-hover:text-text-fog"
                    )}
                  />
                  {!collapsed && (
                    <span className="sidebar-label relative z-10 truncate">{item.label}</span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function DashboardShell({
  navItems,
  brandLabel,
  children,
}: {
  navItems: NavItem[];
  brandLabel: string;
  children: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isAdmin = brandLabel.toLowerCase().includes("admin");
  const sections = isAdmin ? groupAdminNav(navItems) : groupUserNav(navItems);
  const lvlPct = levelProgress(profile?.points ?? 0);
  const initials = profile?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* macOS Traffic Lights Window Header */}
      <div className={cn("mb-4 flex items-center justify-between px-2 pt-1")}>
        <div className="flex items-center gap-2">
          <div className="macos-traffic-lights">
            <span className="macos-dot macos-dot-close" />
            <span className="macos-dot macos-dot-minimize" />
            <span className="macos-dot macos-dot-expand" />
          </div>
        </div>

        {/* Theme quick toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-fog hover:text-text-pure transition-colors"
        >
          <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-xs`} />
        </button>
      </div>

      {/* Brand Header */}
      <div className={cn("mb-4 flex items-center px-2", collapsed ? "justify-center" : "gap-2.5")}>
        {collapsed ? (
          <CyberGuardLogoMark size={32} pulse={false} />
        ) : (
          <Link to="/dashboard" className="transition-opacity hover:opacity-90">
            <CyberGuardLogo size="sm" subtitle={brandLabel || "DEFENSE PLATFORM"} pulse={false} />
          </Link>
        )}
      </div>

      {/* macOS Spotlight search prompt */}
      {!collapsed && (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("cyberguard:open-command-palette"));
          }}
          className="sidebar-search mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-text-fog transition-all duration-150 hover:border-border-strong hover:text-text-pure"
        >
          <i className="ti ti-search text-xs text-text-ash" />
          <span className="flex-1 text-left font-medium">Quick search…</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-xs font-semibold text-text-ash leading-none">⌘K</kbd>
        </button>
      )}

      {/* Nav List */}
      <SidebarNav sections={sections} collapsed={collapsed} />

      {/* Bottom Profile / Level */}
      <div className="mt-auto border-t border-border pt-3">
        {!collapsed && profile && (
          <div className="mb-3 px-3">
            <div className="mb-1 flex items-center justify-between text-xs font-medium">
              <span className="text-text-ash">Level {profile.level}</span>
              <span className="text-primary font-semibold">{profile.points} XP</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated border border-border">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${lvlPct}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        <Link
          to="/profile"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-surface-elevated border border-transparent hover:border-border",
            collapsed && "justify-center"
          )}
          title={collapsed ? profile?.full_name : undefined}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-text-pure leading-none">{profile?.full_name ?? "User"}</div>
              <div className="mt-1 truncate text-[10px] text-text-ash">{profile?.email}</div>
            </div>
          )}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-text-ash",
            "transition-colors duration-150 hover:bg-danger/10 hover:text-danger",
            collapsed && "justify-center"
          )}
        >
          <i className="ti ti-logout text-xs shrink-0" />
          {!collapsed && <span className="text-[11px] font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 flex min-h-screen bg-canvas">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        className={cn(
          "hidden lg:flex flex-col shrink-0 border-r border-border bg-surface/75 backdrop-blur-xl px-3 py-4 overflow-hidden sticky top-0 h-screen",
          collapsed ? "sidebar-collapsed" : ""
        )}
      >
        {/* Collapse toggle */}
        <div className="absolute -right-3 top-16 z-50 hidden lg:block">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-ash shadow-sm transition-colors hover:text-text-pure hover:border-border-strong"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`ti ${collapsed ? "ti-chevron-right" : "ti-chevron-left"} text-[10px]`} />
          </button>
        </div>
        {SidebarContent}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="w-64 border-r border-border bg-surface px-3 py-4 flex flex-col"
            >
              {SidebarContent}
            </motion.div>
            <div
              className="flex-1 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur-xl px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="macos-traffic-lights mr-1">
              <span className="macos-dot macos-dot-close" />
              <span className="macos-dot macos-dot-minimize" />
              <span className="macos-dot macos-dot-expand" />
            </div>
            <CyberGuardLogo size="xs" showText={true} />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-1.5 text-text-fog hover:bg-surface-elevated transition-colors"
            >
              <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-base`} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-1.5 text-text-fog hover:bg-surface-elevated transition-colors"
            >
              <i className="ti ti-menu-2 text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8 max-w-[1500px] w-full"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
