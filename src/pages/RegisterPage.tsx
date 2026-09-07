import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, GoogleIcon } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      setError(error);
      return;
    }
    setDone(true);
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      setError(error);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-70px)] items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="macos-window w-full max-w-md p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-success/30 bg-success/10 text-success">
            <i className="ti ti-mail-check text-2xl" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-text-pure">
            Verification link sent
          </h2>
          <p className="mt-2 text-xs text-text-fog leading-relaxed">
            We’ve dispatched a verification link to <strong className="text-text-pure">{email}</strong>.
            Click the link in the message to activate your defense operator account.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/login">
              <Button variant="primary" size="sm">
                Proceed to Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-70px)] items-center justify-center px-6 py-12">
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
          <span className="text-[11px] font-medium text-text-ash">CyberGuard Operator Registration</span>
          <div className="w-10" />
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <i className="ti ti-shield-check text-xl" />
            </div>
            <div>
              <span className="font-display text-base font-bold tracking-tight text-text-pure">CyberGuard</span>
              <p className="text-[10px] text-text-ash">Security Awareness Portal</p>
            </div>
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-text-pure">
            Create Operator Account
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Join the platform to begin threat simulations and track your security readiness index.
          </p>

          {/* Google OAuth Button */}
          <div className="mt-6">
            <Button
              type="button"
              variant="google"
              className="w-full justify-center gap-2.5 py-2 text-xs"
              onClick={handleGoogleSignUp}
              loading={googleLoading}
            >
              <GoogleIcon />
              <span>Sign up with Google</span>
            </Button>
          </div>

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
                placeholder="alex@organization.com"
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
              Sign in to Console
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
