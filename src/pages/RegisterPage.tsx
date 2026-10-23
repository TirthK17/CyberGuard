import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { KavachLogo } from "@/components/ui/KavachLogo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export function RegisterPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = registerSchema.safeParse({ fullName, email, password, confirm });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please check your input");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: signUpErr } = await signUp(email, password, fullName);
    setLoading(false);

    if (signUpErr) {
      setError(signUpErr);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="macos-window w-full max-w-md p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-success/30 bg-success/10 text-success">
            <i className="ti ti-check text-2xl" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-text-pure">
            Account Created!
          </h2>
          <p className="mt-2 text-xs text-text-fog leading-relaxed">
            Your account for <strong className="text-text-pure">{email}</strong> is ready.
            You are now signed in.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to="/dashboard" variant="primary" size="sm">
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <span className="text-[11px] font-medium text-text-ash">{APP_NAME} Sign Up</span>
          <div className="w-10" />
        </div>

        <div className="p-8">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <KavachLogo size="md" subtitle={APP_TAGLINE} />
          </Link>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-pure">
            Create Free Account
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Start learning with interactive lessons, scam simulations, and free safety tools.
          </p>

          {/* Hairline Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-surface px-3 text-[10px] uppercase font-medium tracking-wider text-text-ash">
              or register with email
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-pure" htmlFor="reg-name">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-pure" htmlFor="reg-email">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-pure" htmlFor="reg-pw">
                Password
              </label>
              <input
                id="reg-pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="input"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-pure" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="input"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 py-2.5 font-semibold text-sm"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-text-fog">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
