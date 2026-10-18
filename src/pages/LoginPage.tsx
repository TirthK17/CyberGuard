import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { CyberGuardLogo } from "@/components/ui/CyberGuardLogo";
import { DEMO_PASSWORD } from "@/lib/localDb";

export function LoginPage() {
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Wait for profile to load before navigating
  useEffect(() => {
    if (!submitted || loading || !user) return;
    navigate(profile?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [submitted, loading, user, profile, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInErr } = await signIn(email, password);
    setSubmitting(false);
    if (signInErr) {
      setError(signInErr);
      return;
    }
    setSubmitted(true);
  };

  /** 1-click demo login — shows an error if sign-in fails (never silently redirects) */
  const handleDemoLogin = async (asAdmin: boolean = false) => {
    setError(null);
    setDemoLoading(true);
    const demoEmail = asAdmin ? "admin@cyberguard.dev" : "operator@cyberguard.dev";
    const { error: signInErr } = await signIn(demoEmail, DEMO_PASSWORD);
    setDemoLoading(false);
    if (signInErr) {
      setError(`Demo login failed: ${signInErr}. Try clearing localStorage and refreshing.`);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="macos-window relative w-full max-w-md p-0 shadow-lg"
      >
        {/* macOS Titlebar */}
        <div className="macos-titlebar px-4 py-2.5">
          <div className="macos-traffic-lights">
            <span className="macos-dot macos-dot-close" />
            <span className="macos-dot macos-dot-minimize" />
            <span className="macos-dot macos-dot-expand" />
          </div>
          <span className="text-[11px] font-medium text-text-ash">CyberGuard</span>
          <div className="w-10" />
        </div>

        <div className="p-8">
          {/* Brand mark */}
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <CyberGuardLogo size="md" subtitle="ONLINE SAFETY PORTAL" />
          </Link>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-pure">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Sign in to access your safety lessons, simulations, and security tools.
          </p>

          {/* Demo Credentials Box */}
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary-subtle p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">Demo Credentials</span>
              <span className="text-[10px] uppercase font-bold text-primary tracking-wide">Offline Mode</span>
            </div>
            <p className="text-[11px] text-text-fog mt-1 mb-2">
              Use these to explore all features without registering:
            </p>
            <table className="w-full text-[11px] text-text-fog mb-3">
              <tbody>
                <tr>
                  <td className="pr-2 font-medium text-text-pure">Admin</td>
                  <td className="font-mono">admin@cyberguard.dev</td>
                </tr>
                <tr>
                  <td className="pr-2 font-medium text-text-pure">User</td>
                  <td className="font-mono">operator@cyberguard.dev</td>
                </tr>
                <tr>
                  <td className="pr-2 font-medium text-text-pure">Password</td>
                  <td className="font-mono font-bold text-primary">{DEMO_PASSWORD}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="xs"
                className="flex-1 py-1.5 font-semibold"
                onClick={() => handleDemoLogin(false)}
                loading={demoLoading}
              >
                1-Click User Demo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="flex-1 py-1.5 font-semibold"
                onClick={() => handleDemoLogin(true)}
                loading={demoLoading}
              >
                Admin Demo
              </Button>
            </div>
          </div>

          {/* Hairline Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-surface px-3 text-[10px] uppercase font-medium tracking-wider text-text-ash">
              or sign in with email
            </span>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mb-4 rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-pure" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-text-pure" htmlFor="login-password">
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-semibold text-sm"
              loading={submitting}
            >
              Sign In
            </Button>
          </form>

          {/* Bottom link */}
          <p className="mt-6 text-center text-xs text-text-fog">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
