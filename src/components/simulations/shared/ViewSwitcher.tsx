
export type SimulationView = "split" | "victim" | "hacker";

interface ViewSwitcherProps {
  activeView: SimulationView;
  onViewChange: (view: SimulationView) => void;
  victimLabel?: string;
  hackerLabel?: string;
  hasNewLogs?: boolean;
  className?: string;
}

export function ViewSwitcher({
  activeView,
  onViewChange,
  victimLabel = "Victim Screen",
  hackerLabel = "Attacker Terminal",
  hasNewLogs = false,
  className = "",
}: ViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Simulation perspective switcher"
      className={`inline-flex items-center p-1 rounded-2xl bg-surface border border-border text-xs shadow-inner ${className}`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeView === "victim"}
        onClick={() => onViewChange("victim")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
          activeView === "victim"
            ? "bg-primary text-white shadow-sm font-semibold"
            : "text-text-ash hover:text-text-pure hover:bg-surface-elevated"
        }`}
      >
        <i className="ti ti-device-mobile text-sm" aria-hidden="true" />
        <span>{victimLabel}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeView === "split"}
        onClick={() => onViewChange("split")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
          activeView === "split"
            ? "bg-primary text-white shadow-sm font-semibold"
            : "text-text-ash hover:text-text-pure hover:bg-surface-elevated"
        }`}
      >
        <i className="ti ti-columns text-sm" aria-hidden="true" />
        <span>Side-by-Side</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeView === "hacker"}
        onClick={() => onViewChange("hacker")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all relative cursor-pointer ${
          activeView === "hacker"
            ? "bg-zinc-900 text-emerald-400 border border-emerald-500/30 shadow-sm font-mono font-semibold"
            : "text-text-ash hover:text-text-pure hover:bg-surface-elevated font-mono"
        }`}
      >
        <i className="ti ti-terminal-2 text-sm" aria-hidden="true" />
        <span>{hackerLabel}</span>
        {hasNewLogs && (
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5"
            aria-label="New attacker logs"
          />
        )}
      </button>
    </div>
  );
}
