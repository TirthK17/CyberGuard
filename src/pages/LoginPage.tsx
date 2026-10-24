import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { KavachLogo } from "@/components/ui/KavachLogo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const DEFAULT_ADMIN_EMAIL = "tirthbariya03@gmail.com";
const DEFAULT_ADMIN_PASS = "TK@Diya#173";

interface LoginPageProps {
  defaultAdmin?: boolean;
}

export function LoginPage({ defaultAdmin = false }: LoginPageProps) {
  const { signIn, signInWithGoogle, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isInitialAdmin = defaultAdmin || searchParams.get("portal") === "admin" || searchParams.get("mode") === "admin";
  const [activeTab, setActiveTab] = useState<"learner" | "admin">(isInitialAdmin ? "admin" : "learner");

  const [email, setEmail] = useState(isInitialAdmin ? DEFAULT_ADMIN_EMAIL : "");
  const [password, setPassword] = useState(isInitialAdmin ? DEFAULT_ADMIN_PASS : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [adminInstantLoading, setAdminInstantLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-route once session and profile are resolved
  useEffect(() => {
    if (!user || loading) return;
    if (submitted || user) {
      navigate(profile?.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [submitted, loading, user, profile, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Invalid credentials provided");
      return;
    }

    setSubmitting(true);
    const { error: signInErr } = await signIn(validation.data.email, validation.data.password);
    setSubmitting(false);

    if (signInErr) {
      setError(signInErr);
      return;
    }
    setSubmitted(true);
  };

  /** 1-Click Instant Admin Sign In with verified administrator credentials */
  const handleInstantAdminLogin = async () => {
    setError(null);
    setAdminInstantLoading(true);
    const { error: signInErr } = await signIn(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASS);
    setAdminInstantLoading(false);

    if (signInErr) {
      setError(`Admin authentication failed: ${signInErr}`);
      return;
    }
    setSubmitted(true);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    setGoogleLoading(false);
    if (err) {
      setError(err);
    }
  };

  const switchTab = (tab: "learner" | "admin") => {
    setActiveTab(tab);
    setError(null);
    if (tab === "admin") {
      setEmail(DEFAULT_ADMIN_EMAIL);
      setPassword(DEFAULT_ADMIN_PASS);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="macos-window relative w-full max-w-lg p-0 shadow-2xl border border-border"
      >
        {/* macOS Titlebar */}
        <div className="macos-titlebar px-4 py-2.5">
          <div className="macos-traffic-lights">
            <span className="macos-dot macos-dot-close" />
            <span className="macos-dot macos-dot-minimize" />
            <span className="macos-dot macos-dot-expand" />
          </div>
          <span className="text-[11px] font-medium text-text-ash">
            {APP_NAME} — {activeTab === "admin" ? "Administrative Console" : "Defender Access"}
          </span>
          <div className="w-10" />
        </div>

        <div className="p-8">
          {/* Brand mark */}
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <KavachLogo size="md" subtitle={APP_TAGLINE} />
            </Link>
            {activeTab === "admin" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <i className="ti ti-shield-lock" />
                Root Authority
              </span>
            )}
          </div>

          {/* Role Switching Tabs */}
          <div className="mt-6 flex rounded-xl border border-border bg-surface-elevated p-1">
            <button
              type="button"
              onClick={() => switchTab("learner")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "learner"
                  ? "bg-surface text-text-pure shadow-sm border border-border"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              <i className="ti ti-user text-sm" />
              Learner Login
            </button>
            <button
              type="button"
              onClick={() => switchTab("admin")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-primary text-text-pure shadow-sm border border-primary"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              <i className="ti ti-shield-lock text-sm" />
              Admin Portal
            </button>
          </div>

          {activeTab === "admin" ? (
            <div className="mt-6">
              <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure flex items-center gap-2">
                <i className="ti ti-shield-check text-primary" />
                Admin Command Center
              </h1>
              <p className="mt-1 text-xs text-text-fog">
                Full governance: manage operators, author curriculum, design quizzes, configure threat drills, and monitor incidents.
              </p>

              {/* Instant 1-Click Admin Access Card */}
              <div className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Verified Super Admin
                    </span>
                    <h3 className="text-sm font-semibold text-text-pure mt-0.5">
                      Master Guardian Access
                    </h3>
                    <p className="text-[11px] text-text-fog mt-1">
                      Direct single-click authentication into the CyberGuard management console with full administrative privileges.
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg">
                    <i className="ti ti-key" />
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-1.5 text-[10px] text-text-ash">
                  <span className="rounded-md bg-surface px-2 py-0.5 border border-border">👥 Operators & Roles</span>
                  <span className="rounded-md bg-surface px-2 py-0.5 border border-border">📚 Courses & Lessons</span>
                  <span className="rounded-md bg-surface px-2 py-0.5 border border-border">🎯 Quizzes & Drills</span>
                  <span className="rounded-md bg-surface px-2 py-0.5 border border-border">🛡️ Badges & Reports</span>
                </div>

                <div className="mt-4 pt-3 border-t border-primary/15 flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1 py-2 font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={handleInstantAdminLogin}
                    loading={adminInstantLoading}
                  >
                    <i className="ti ti-login-2 text-sm" />
                    1-Click Instant Admin Sign-In
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure">
                Defender Access
              </h1>
              <p className="mt-1 text-xs text-text-fog">
                Sign in with your verified credentials to access defence lessons, live drills, and security tools.
              </p>
            </div>
          )}

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger flex items-start gap-2"
              >
                <i className="ti ti-alert-triangle text-sm mt-0.5" />
                <div className="flex-1">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-text-pure" htmlFor="login-email">
                {activeTab === "admin" ? "Admin Email Address" : "Email Address"}
              </label>
              {activeTab === "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    setEmail(DEFAULT_ADMIN_EMAIL);
                    setPassword(DEFAULT_ADMIN_PASS);
                  }}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  Fill Admin Account
                </button>
              )}
            </div>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeTab === "admin" ? "admin@cyberguard.dev" : "name@example.com"}
              className="input w-full"
            />

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
                className="input w-full"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 font-semibold text-sm cursor-pointer"
              loading={submitting}
            >
              {activeTab === "admin" ? "Sign In to Admin Console" : "Sign In as Learner"}
            </Button>
          </form>

          {activeTab === "learner" && (
            <>
              {/* Social login divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-surface px-3 text-[10px] uppercase font-medium tracking-wider text-text-ash">
                  or continue with
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={handleGoogleSignIn}
                loading={googleLoading}
                className="w-full py-2 text-xs font-medium border border-border hover:bg-surface-elevated"
              >
                <i className="ti ti-brand-google mr-2 text-sm text-text-pure" />
                Continue with Google
              </Button>

              {/* Bottom links */}
              <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-text-fog">
                <p>
                  Don't have an account yet?{" "}
                  <Link to="/register" className="font-semibold text-primary hover:underline">
                    Create free account
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() => switchTab("admin")}
                  className="inline-flex items-center gap-1.5 text-text-ash hover:text-primary transition-colors text-[11px] mt-1 cursor-pointer"
                >
                  <i className="ti ti-shield-lock" />
                  Looking for Security Operations & Admin Console? Switch here →
                </button>
              </div>
            </>
          )}

          {activeTab === "admin" && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => switchTab("learner")}
                className="text-xs text-text-fog hover:text-text-pure transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <i className="ti ti-arrow-left text-xs" />
                Back to Standard Defender / Learner Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

