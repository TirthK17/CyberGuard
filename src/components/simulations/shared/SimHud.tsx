import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { ViewSwitcher, type SimulationView } from "./ViewSwitcher";

interface SimHudProps {
  title: string;
  categoryLabel?: string;
  currentActIndex: number;
  totalActs: number;
  actLabel: string;
  score?: number;
  beginnerClues: boolean;
  onToggleClues: () => void;
  timedMode?: boolean;
  timeLeft?: number;
  onReset: () => void;
  activeView: SimulationView;
  onViewChange: (view: SimulationView) => void;
  victimLabel?: string;
  hackerLabel?: string;
}

export function SimHud({
  title,
  categoryLabel = "Live Sandbox",
  currentActIndex,
  totalActs,
  actLabel,
  score,
  beginnerClues,
  onToggleClues,
  timedMode = false,
  timeLeft,
  onReset,
  activeView,
  onViewChange,
  victimLabel,
  hackerLabel,
}: SimHudProps) {
  const progressPercent = Math.min(
    100,
    Math.round(((currentActIndex + 1) / totalActs) * 100)
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3">
      {/* Top Bar: Title, Category, Clues Toggle, Timer, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title and Category */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <i className="ti ti-flask text-base" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text-pure line-clamp-1">
              {title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-text-ash">
              <span>{categoryLabel}</span>
              <span>•</span>
              <span className="font-medium text-text-pure">
                Act {currentActIndex + 1} of {totalActs}: {actLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Beginner Clues Toggle */}
          <button
            type="button"
            onClick={onToggleClues}
            aria-pressed={beginnerClues}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              beginnerClues
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold"
                : "bg-surface-elevated border-border text-text-ash hover:text-text-pure"
            }`}
            title="Highlight suspicious clues and red flags"
          >
            <i className={`ti ${beginnerClues ? "ti-bulb-filled text-amber-400" : "ti-bulb"}`} />
            <span className="hidden sm:inline">Clues</span>
            {beginnerClues && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Timed Mode Display */}
          {timedMode && typeof timeLeft === "number" && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border ${
                timeLeft <= 10
                  ? "border-red-500/40 bg-red-500/10 text-red-400 font-bold animate-pulse"
                  : "border-border bg-surface-elevated text-text-pure"
              }`}
              title="Time remaining for this decision"
            >
              <i className="ti ti-clock text-xs" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Current Score Pill if active */}
          {typeof score === "number" && (
            <Pill tone={score >= 70 ? "emerald" : "warn"} size="sm">
              Score: {score}
            </Pill>
          )}

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-text-ash hover:text-text-pure"
            aria-label="Restart scenario"
          >
            <i className="ti ti-rotate text-sm" />
            <span className="hidden sm:inline ml-1">Reset</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-border/40">
        {/* Act Steps Progress */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-[11px] text-text-ash mb-1">
            <span>Scenario Progress</span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* View Perspective Switcher */}
        <div className="flex justify-center sm:justify-end">
          <ViewSwitcher
            activeView={activeView}
            onViewChange={onViewChange}
            victimLabel={victimLabel}
            hackerLabel={hackerLabel}
          />
        </div>
      </div>
    </div>
  );
}
