import {
  useState,
  useRef,
  useEffect,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/primitives";
import { playSfx } from "@/lib/sfx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "google" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: ReactNode;
  loading?: boolean;
  success?: boolean;
  to?: string;
  holdToConfirm?: boolean;
  holdDurationMs?: number;
  onHoldComplete?: () => void;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  success = false,
  holdToConfirm = false,
  holdDurationMs = 1000,
  onHoldComplete,
  className,
  children,
  disabled,
  to,
  ref,
  onClick,
  ...props
}: ButtonProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdStartRef = useRef<number>(0);
  const holdAnimFrameRef = useRef<number | null>(null);

  const isDisabled = disabled || loading;

  const base =
    "relative inline-flex items-center justify-center gap-2 select-none font-medium overflow-hidden " +
    "transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  const variants: Record<string, string> = {
    primary:
      "rounded-xl bg-primary text-white font-semibold border border-white/20 " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] " +
      "hover:bg-primary-hover active:scale-[0.98]",
    secondary:
      "rounded-xl bg-surface-elevated border border-border text-text-pure font-semibold " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
      "hover:bg-surface-hover hover:border-border-strong active:scale-[0.98]",
    ghost:
      "rounded-xl text-text-fog hover:text-text-pure hover:bg-surface-elevated font-semibold border border-transparent",
    danger:
      "rounded-xl bg-danger/10 text-danger border border-danger/25 hover:bg-danger/20 font-semibold active:scale-[0.98]",
    google:
      "rounded-xl bg-surface border border-border-strong text-text-pure font-semibold " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface-hover",
    success:
      "rounded-xl bg-emerald-600 text-white font-semibold border border-emerald-500/30 " +
      "shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-emerald-500 active:scale-[0.98]",
  };

  const sizes: Record<string, string> = {
    xs: "px-3 py-1 text-xs font-semibold rounded-lg",
    sm: "px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl",
    md: "px-4 py-2 text-sm font-semibold rounded-xl",
    lg: "px-6 py-2.5 text-sm sm:text-base font-semibold rounded-xl",
  };

  // Hold-to-confirm animation loop
  useEffect(() => {
    if (!isHolding) {
      if (holdAnimFrameRef.current) {
        cancelAnimationFrame(holdAnimFrameRef.current);
        holdAnimFrameRef.current = null;
      }
      setHoldProgress(0);
      return;
    }

    const step = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(1, elapsed / holdDurationMs);
      setHoldProgress(progress);

      if (progress >= 1) {
        setIsHolding(false);
        setHoldProgress(0);
        playSfx("success");
        if (onHoldComplete) {
          onHoldComplete();
        } else if (onClick) {
          onClick({} as React.MouseEvent<HTMLButtonElement>);
        }
      } else {
        holdAnimFrameRef.current = requestAnimationFrame(step);
      }
    };

    holdAnimFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (holdAnimFrameRef.current) {
        cancelAnimationFrame(holdAnimFrameRef.current);
      }
    };
  }, [isHolding, holdDurationMs, onHoldComplete, onClick]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (holdToConfirm && !isDisabled) {
      e.preventDefault();
      holdStartRef.current = Date.now();
      setIsHolding(true);
      playSfx("click");
    }
  };

  const handlePointerUp = () => {
    if (holdToConfirm) {
      setIsHolding(false);
      setHoldProgress(0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (holdToConfirm) {
      // For hold-to-confirm, regular click is suppressed in favor of holding
      e.preventDefault();
      return;
    }
    playSfx("click");
    onClick?.(e);
  };

  if (to) {
    return (
      <Link
        to={to}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {icon}
        {children}
      </Link>
    );
  }

  // Active variant when success is true overrides to success style
  const activeVariantKey = success ? "success" : variant;

  return (
    <motion.button
      ref={ref}
      whileTap={isDisabled || holdToConfirm ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      disabled={isDisabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={cn(base, variants[activeVariantKey], sizes[size], className)}
      {...(props as Record<string, unknown>)}
    >
      {/* Hold-to-confirm progress overlay */}
      {holdToConfirm && holdProgress > 0 && (
        <span
          className="absolute inset-y-0 left-0 bg-white/20 transition-all pointer-events-none"
          style={{ width: `${holdProgress * 100}%` }}
        />
      )}

      {loading ? (
        <>
          <Spinner className="h-3.5 w-3.5 shrink-0" />
          <span>{children}</span>
        </>
      ) : success ? (
        <AnimatePresence mode="wait">
          <motion.span
            key="success-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1.5 font-bold"
          >
            <i className="ti ti-check text-base" />
            <span>{typeof children === "string" ? "Success!" : children}</span>
          </motion.span>
        </AnimatePresence>
      ) : (
        <>
          {icon}
          {children}
          {holdToConfirm && isHolding && (
            <span className="text-[10px] opacity-75 font-mono ml-1">
              ({Math.round(holdProgress * 100)}%)
            </span>
          )}
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
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}
