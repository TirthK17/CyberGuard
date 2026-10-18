import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/primitives";
import { CyberGuardLogo, CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

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
      label: "Academy & Drills",
      items: items.filter((i) =>
        ["/training", "/simulations", "/quizzes", "/assessment", "/topics"].includes(i.to)
      ),
    },
    {
      label: "Defense & Intel",
      items: items.filter((i) =>
        ["/tools", "/threats", "/report", "/guide", "/glossary"].includes(i.to)
      ),
    },
    {
      label: "Standings & Growth",
      items: items.filter((i) =>
        ["/progress", "/badges", "/leaderboard", "/certificate"].includes(i.to)
      ),
    },
    {
      label: "Account",
      items: items.filter((i) => ["/profile", "/settings"].includes(i.to)),
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
      label: "Curriculum Management",
      items: items.filter((i) =>
        ["/admin/courses", "/admin/lessons", "/admin/quizzes", "/admin/simulations", "/admin/badges"].includes(i.to)
      ),
    },
    {
      label: "Operations & Users",
      items: items.filter((i) =>
        ["/admin/users", "/admin/reports"].includes(i.to)
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

const NAV_KEY_MAP: Record<string, string> = {
  "/dashboard": "nav.dashboard",
  "/training": "nav.training",
  "/quizzes": "nav.quizzes",
  "/simulations": "nav.simulations",
  "/tools": "nav.tools",
  "/topics": "nav.topics",
  "/guide": "nav.guide",
  "/threats": "nav.threats",
  "/report": "nav.report",
  "/leaderboard": "nav.leaderboard",
  "/badges": "nav.badges",
  "/certificate": "nav.certificate",
  "/glossary": "nav.glossary",
  "/settings": "nav.settings",
  "/profile": "nav.profile",
  "/admin": "nav.admin",
};

const SECTION_KEY_MAP: Record<string, string> = {
  "Main": "nav.main",
  "Academy & Drills": "nav.academy",
  "Defense & Intel": "nav.defense",
  "Standings & Growth": "nav.standings",
  "Account": "nav.account",
  "Overview": "nav.overview",
  "Curriculum Management": "nav.curriculum",
  "Operations & Users": "nav.operations",
  "System": "nav.system",
};

function SidebarNav({
  sections,
  collapsed,
}: {
  sections: NavSection[];
  collapsed: boolean;
}) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pb-2" aria-label="Main navigation">
      {sections.map((section, si) => {
        const localizedSectionLabel = SECTION_KEY_MAP[section.label]
          ? t(SECTION_KEY_MAP[section.label], section.label)
          : section.label;

        return (
          <div key={section.label} className={cn("", si > 0 && "mt-4")}>
            {!collapsed && (
              <p className="sidebar-section-label mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-text-ash">
                {localizedSectionLabel}
              </p>
            )}
            {section.items.map((item, i) => {
              const active = location.pathname === item.to;
              const localizedLabel = NAV_KEY_MAP[item.to]
                ? t(NAV_KEY_MAP[item.to], item.label)
                : item.label;

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
                    title={collapsed ? localizedLabel : undefined}
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
                      <span className="sidebar-label relative z-10 truncate">{localizedLabel}</span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        );
      })}
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
  const { t } = useTranslation();
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

        {/* Controls: Language and Theme quick toggles */}
        <div className="flex items-center gap-1.5">
          {!collapsed && <LanguageSwitcher variant="compact" />}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-fog hover:text-text-pure transition-colors cursor-pointer"
          >
            <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-xs`} />
          </button>
        </div>
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
      {!collapsed ? (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("cyberguard:open-command-palette"));
          }}
          className="sidebar-search mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-text-fog transition-all duration-150 hover:border-border-strong hover:text-text-pure cursor-pointer"
        >
          <i className="ti ti-search text-xs text-text-ash" />
          <span className="flex-1 text-left font-medium">{t("nav.quickSearch", "Quick search…")}</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-text-ash leading-none">⌘K</kbd>
        </button>
      ) : (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent("cyberguard:open-command-palette"));
          }}
          title={t("nav.quickSearch", "Quick search (⌘K)")}
          aria-label={t("nav.quickSearch", "Quick search (⌘K)")}
          className="mb-4 mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-elevated text-text-fog hover:text-text-pure hover:border-border-strong transition-colors cursor-pointer"
        >
          <i className="ti ti-search text-sm text-text-ash" />
        </button>
      )}

      {/* Nav List */}
      <SidebarNav sections={sections} collapsed={collapsed} />

      {/* Bottom Profile / Level */}
      <div className="mt-auto border-t border-border pt-3">
        {!collapsed && profile && (
          <div className="mb-3 px-3">
            <div className="mb-1 flex items-center justify-between text-xs font-medium">
              <span className="text-text-ash">{t("common.level", "Level")} {profile.level}</span>
              <span className="text-primary font-semibold">{profile.points} {t("common.xp", "XP")}</span>
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
          title={collapsed ? t("nav.signOut", "Sign out") : undefined}
          className={cn(
            "mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-text-ash",
            "transition-colors duration-150 hover:bg-danger/10 hover:text-danger cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <i className="ti ti-logout text-xs shrink-0" />
          {!collapsed && <span className="text-[11px] font-medium">{t("nav.signOut", "Sign out")}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 flex min-h-screen bg-canvas">
      {/* Skip to Main Content Link for Keyboard / Screen Reader Navigation */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

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
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-ash shadow-sm transition-colors hover:text-text-pure hover:border-border-strong cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`ti ${collapsed ? "ti-chevron-right" : "ti-chevron-left"} text-[10px]`} aria-hidden="true" />
          </button>
        </div>
        {SidebarContent}
      </motion.aside>

      {/* Accessible Mobile Drawer */}
      <Drawer
        id="mobile-navigation-drawer"
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Navigation"
        position="left"
        className="w-64 max-w-[85vw] p-3"
      >
        {SidebarContent}
      </Drawer>

      {/* Main Page Area */}
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        {/* Mobile top bar (compact, clean without macOS dots) */}
        <div className="flex items-center justify-between border-b border-border bg-surface/85 backdrop-blur-xl px-4 py-2.5 lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CyberGuardLogo size="xs" showText={true} />
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("cyberguard:open-command-palette"))}
              aria-label="Search and quick actions (Ctrl K)"
              title="Search (⌘K)"
              className="rounded-lg p-2 text-text-fog hover:bg-surface-elevated hover:text-text-pure transition-colors cursor-pointer"
            >
              <i className="ti ti-search text-base" aria-hidden="true" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("cyberguard:open-shortcuts"))}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              className="rounded-lg p-2 text-text-fog hover:bg-surface-elevated hover:text-text-pure transition-colors cursor-pointer"
            >
              <i className="ti ti-help text-base" aria-hidden="true" />
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-text-fog hover:bg-surface-elevated hover:text-text-pure transition-colors cursor-pointer"
            >
              <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-base`} aria-hidden="true" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
              className="rounded-lg p-2 text-text-fog hover:bg-surface-elevated hover:text-text-pure transition-colors cursor-pointer"
            >
              <i className="ti ti-menu-2 text-xl" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.main
            id="main-content"
            tabIndex={-1}
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-8 max-w-[1500px] w-full focus:outline-none pb-24 lg:pb-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Mobile Bottom Tab Bar */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-surface/90 backdrop-blur-xl py-2 px-2 lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        >
          {[
            { to: "/dashboard", label: t("nav.dashboard", "Dashboard"), icon: "ti-layout-dashboard" },
            { to: "/training", label: t("nav.training", "Training"), icon: "ti-book-2" },
            { to: "/simulations", label: t("nav.simulations", "Sims"), icon: "ti-flask" },
            { to: "/tools", label: t("nav.tools", "Tools"), icon: "ti-tools" },
            { to: "/threats", label: t("nav.threats", "Threats"), icon: "ti-radar" },
          ].map((tab) => {
            const isActive = location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer",
                  isActive ? "text-primary font-semibold" : "text-text-ash hover:text-text-fog"
                )}
              >
                <i className={`ti ${tab.icon} text-lg leading-none`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
