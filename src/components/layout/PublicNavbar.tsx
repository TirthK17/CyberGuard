import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { KavachLogo } from "@/components/ui/KavachLogo";
import { APP_TAGLINE } from "@/lib/constants";

const links = [
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
];

export function PublicNavbar() {
  const { user, isAdmin } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand */}
        <Link to="/" className="flex items-center group">
          <KavachLogo size="sm" subtitle={APP_TAGLINE} />
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-2 py-1 text-sm font-medium transition-colors ${
                  active ? "text-text-pure font-semibold" : "text-text-fog hover:text-text-pure"
                }`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-1 left-2 right-2 h-[2px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + Auth */}
        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface-elevated text-text-fog hover:text-text-pure hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-sm`} />
          </button>

          {user ? (
            <Button size="sm" variant="primary" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
              {isAdmin ? "Admin Console" : "Dashboard"}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
              Start Training
            </Button>
          )}
        </div>

        {/* Mobile menu and theme toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-fog"
          >
            <i className={`ti ${resolvedTheme === "dark" ? "ti-sun" : "ti-moon"} text-sm`} />
          </button>
          <button
            className="text-text-pure p-1.5 rounded-lg active:scale-95 transition-transform"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <i className={`ti ${open ? "ti-x" : "ti-menu-2"} text-xl`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <div className="flex flex-col gap-2 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg px-2 py-1.5 text-sm font-medium text-text-fog hover:text-text-pure hover:bg-surface-elevated"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-3 border-t border-border">
                {user ? (
                  <Button size="sm" variant="primary" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
                    {isAdmin ? "Admin Console" : "Dashboard"}
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
