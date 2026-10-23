import type { HTMLAttributes, ReactNode, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useId, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────── macOS Window Frame ───────────────────── */

export function MacOsWindow({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("macos-window", className)}>
      <div className="macos-titlebar">
        <div className="macos-traffic-lights">
          <span className="macos-dot macos-dot-close" />
          <span className="macos-dot macos-dot-minimize" />
          <span className="macos-dot macos-dot-expand" />
        </div>
        {title && (
          <div className="flex items-center gap-2 text-xs font-medium text-text-fog">
            <span className="font-semibold text-text-pure">{title}</span>
            {subtitle && <span className="text-[11px] text-text-ash">— {subtitle}</span>}
          </div>
        )}
        <div className="shrink-0">{action}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─────────────────────────────── Segmented Control ─────────────────────── */

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: string; icon?: string }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % items.length;
      onChange(items[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      onChange(items[prevIndex].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(items[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(items[items.length - 1].id);
    }
  };

  return (
    <div role="tablist" className={cn("segmented-control", className)}>
      {items.map((item, idx) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn("segmented-item flex items-center gap-1.5 focus-visible:ring-1 focus-visible:ring-primary", active && "active")}
          >
            {item.icon && <i className={`ti ${item.icon} text-xs`} aria-hidden="true" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────── Card ─────────────────────────────────── */

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass rounded-2xl p-6 transition-[border-color,box-shadow,transform] duration-150 ease-out",
        "hover:border-border-strong",
        className
      )}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────── SectionHeader ──────────────────────── */

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-pure">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-text-fog leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────── StatCard ───────────────────────────── */

export function StatCard({
  icon,
  label,
  value,
  delta,
  deltaLabel,
  tone = "default",
}: {
  icon: string;
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  tone?: "default" | "cyan" | "violet" | "success" | "warn" | "danger" | "lime";
}) {
  const iconToneMap: Record<string, string> = {
    default: "bg-surface-elevated border-border text-primary",
    cyan:    "bg-primary-subtle border-primary/20 text-primary",
    violet:  "bg-primary-subtle border-primary/20 text-primary",
    success: "bg-success/10 border-success/20 text-success",
    warn:    "bg-warn/10 border-warn/25 text-warn",
    danger:  "bg-danger/10 border-danger/25 text-danger",
    lime:    "bg-success/10 border-success/20 text-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", iconToneMap[tone] ?? iconToneMap.default)}>
          <i className={`ti ${icon} text-lg`} />
        </div>
        {delta !== undefined && (
          <div className={cn("flex items-center gap-1 font-sans text-xs font-semibold", delta >= 0 ? "text-success" : "text-danger")}>
            <i className={`ti ${delta >= 0 ? "ti-trending-up" : "ti-trending-down"} text-xs`} />
            {delta >= 0 ? "+" : ""}{delta}%
          </div>
        )}
      </div>
      <div className="mt-3.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-text-pure">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      <div className="mt-1 text-xs sm:text-sm font-medium text-text-fog">{label}</div>
      {deltaLabel && (
        <div className="mt-1 text-xs text-text-ash">{deltaLabel}</div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────── Pill ───────────────────────────────── */

export function Pill({
  children,
  tone = "default",
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "cyan" | "violet" | "warn" | "warning" | "danger" | "success" | "info" | "lime" | "primary" | "emerald" | "amber" | "sky";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-surface text-text-low border-border",
    cyan:    "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/25",
    sky:     "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/25",
    primary: "bg-primary/10 text-primary border-primary/20",
    violet:  "bg-violet-500/10 text-violet-500 dark:text-violet-400 border-violet-500/25",
    amber:   "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
    warn:    "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
    warning: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
    danger:  "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25",
    success: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    emerald: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    lime:    "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
    info:    "bg-sky-500/10 text-sky-500 dark:text-sky-400 border-sky-500/25",
  };
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-semibold",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-normal",
        tones[tone] ?? tones.default,
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────── Spinner ───────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary",
        className
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-6 w-6" />
      <p className="text-xs text-text-ash">Loading…</p>
    </div>
  );
}

/* ─────────────────────────────── Skeleton ───────────────────────────── */

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("skeleton h-3 rounded-md", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      <div className="flex items-center gap-3">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-2/3" />
          <SkeletonLine className="w-1/3 opacity-50" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <SkeletonLine />
        <SkeletonLine className="w-4/5" />
        <SkeletonLine className="w-3/5 opacity-50" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };
  return <div className={cn("skeleton rounded-full", sz[size])} />;
}

/* ─────────────────────────────── EmptyState ────────────────────────── */

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "ti-shield-search",
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex flex-col items-center justify-center rounded-2xl px-8 py-16 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-elevated">
        <i className={`ti ${icon} text-lg text-text-fog`} />
      </div>
      <h3 className="font-display text-lg font-bold text-text-pure">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-fog">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary mt-6 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────── ProgressBar ───────────────────────── */

export function ProgressBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "cyan" | "sky" | "emerald" | "amber" | "violet";
}) {
  const pct = Math.min(100, Math.max(0, value));
  const toneFill: Record<string, string> = {
    primary: "bg-primary",
    cyan: "bg-sky-500 dark:bg-sky-400",
    sky: "bg-sky-500 dark:bg-sky-400",
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    violet: "bg-violet-500 dark:bg-violet-400",
  };

  return (
    <div className={cn("progress-track", className)}>
      <motion.div
        className={cn("progress-fill", toneFill[tone] ?? "bg-primary")}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/* ─────────────────────────────── AnimatedNumber ────────────────────── */

export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 85, damping: 22 });
  const rounded = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{rounded}</motion.span>;
}

/* ─────────────────────────────── Divider ───────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

/* ─────────────────────────────── Modal ─────────────────────────────── */

export interface ModalProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({
  id,
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";

      // Focus modal or first focusable element
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalRef.current?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        } else if (e.key === "Tab") {
          const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative z-10 w-full rounded-2xl border border-border bg-surface p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto",
              sizeClasses[size],
              className
            )}
          >
            {(title || description) && (
              <div className="mb-4 pb-3 border-b border-border flex items-start justify-between gap-3">
                <div>
                  {title && (
                    <h3 id={titleId} className="font-display text-lg font-bold text-text-pure">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-xs text-text-fog leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1 text-text-ash hover:text-text-pure hover:bg-surface-elevated transition-colors cursor-pointer"
                >
                  <i className="ti ti-x text-lg" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────── Drawer ─────────────────────────────── */

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  position?: "left" | "right";
  id?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className,
  position = "left",
  id,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) {
          focusable[0].focus();
        } else {
          drawerRef.current?.focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  const xOffset = position === "left" ? -320 : 320;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Navigation Drawer"}
          className="fixed inset-0 z-[200] flex lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: xOffset }}
            animate={{ x: 0 }}
            exit={{ x: xOffset }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className={cn(
              "relative z-10 w-72 max-w-[85vw] border-r border-border bg-surface p-4 shadow-2xl flex flex-col focus:outline-none h-full",
              position === "right" && "ml-auto border-r-0 border-l",
              className
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between pb-2 border-b border-border">
                <span className="font-display text-sm font-bold text-text-pure">{title}</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="rounded-lg p-1 text-text-ash hover:text-text-pure cursor-pointer"
                >
                  <i className="ti ti-x text-base" aria-hidden="true" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

