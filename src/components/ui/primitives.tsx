import type { HTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
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
  return (
    <div className={cn("segmented-control", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn("segmented-item flex items-center gap-1.5", active && "active")}
          >
            {item.icon && <i className={`ti ${item.icon} text-xs`} />}
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
  tone?: "default" | "cyan" | "violet" | "warn" | "danger" | "success" | "info" | "lime" | "primary" | "emerald" | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-surface text-text-low border-border",
    cyan:    "bg-primary/10 text-primary border-primary/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    violet:  "bg-primary/10 text-primary border-primary/20",
    warn:    "bg-amber-500/10 text-amber-500 border-amber-500/25",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/25",
    danger:  "bg-red-500/10 text-red-500 border-red-500/25",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    info:    "bg-primary/10 text-primary border-primary/20",
    lime:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
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

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("progress-track", className)}>
      <motion.div
        className="progress-fill"
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
