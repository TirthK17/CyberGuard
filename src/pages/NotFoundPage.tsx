import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <div className="font-display text-8xl font-extrabold text-primary/20 select-none">404</div>
        <h1 className="font-display text-2xl font-bold text-text-pure">Page not found</h1>
        <p className="text-sm text-text-fog max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-pure hover:bg-surface transition-colors"
          >
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
