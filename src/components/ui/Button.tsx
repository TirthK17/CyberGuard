import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/primitives";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "google";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "relative inline-flex items-center justify-center gap-2 select-none font-medium " +
    "transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const variants: Record<string, string> = {
    primary:
      "rounded-xl bg-primary text-white font-medium border border-white/20 " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] " +
      "hover:bg-primary-hover active:scale-[0.98]",
    secondary:
      "rounded-xl bg-surface-elevated border border-border text-text-pure " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
      "hover:bg-surface-hover hover:border-border-strong active:scale-[0.98]",
    ghost:
      "rounded-xl text-text-fog hover:text-text-pure hover:bg-surface-elevated border border-transparent",
    danger:
      "rounded-xl bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
    google:
      "rounded-xl bg-surface border border-border-strong text-text-pure " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface-hover",
  };

  const sizes: Record<string, string> = {
    xs: "px-2.5 py-1 text-xs rounded-lg",
    sm: "px-3.5 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-sm font-semibold rounded-xl",
  };

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      disabled={isDisabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(props as Record<string, unknown>)}
    >
      {loading ? (
        <>
          <Spinner className="h-3.5 w-3.5" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </motion.button>
  );
}

/* ── Google Icon Component ── */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}
