import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export function LoginPage() {
  const { signIn, signInWithGoogle, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    setGoogleLoading(false);
    if (err) {
      setError(err);
    }
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
          <span className="text-[11px] font-medium text-text-ash">{APP_NAME}</span>
          <div className="w-10" />
        </div>

        <div className="p-8">
          {/* Brand mark */}
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <KavachLogo size="md" subtitle={APP_TAGLINE} />
          </Link>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-pure">
            Account Access
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Sign in with your verified credentials to access defence lessons, live drills, and security tools.
          </p>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-4 rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="w-full py-2.5 font-semibold text-sm cursor-pointer"
              loading={submitting}
            >
              Sign In
            </Button>
          </form>

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
