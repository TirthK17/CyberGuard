import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { simulationXp } from "@/lib/gamification";

export interface ScoreBreakdownItem {
  type: "success" | "warning";
  text: string;
}

interface ScoreCardProps {
  score: number;
  scenarioTitle: string;
  goldenRule: string;
  breakdown: ScoreBreakdownItem[];
  onRetry: () => void;
  nextSimulationUrl?: string;
  nextSimulationLabel?: string;
  className?: string;
}

export function ScoreCard({
  score,
  scenarioTitle,
  goldenRule,
  breakdown,
  onRetry,
  nextSimulationUrl = "/simulations",
  nextSimulationLabel = "Back to Simulations",
  className = "",
}: ScoreCardProps) {
  const isPass = score >= 70;
  const isPerfect = score === 100;
  const earnedXp = simulationXp(score);

  return (
    <div
      role="region"
      aria-label="Simulation Score Card"
      className={`rounded-3xl border border-border bg-surface-elevated p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6 ${className}`}
    >
      {/* Header Result */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-border shadow-inner">
          <i
            className={`ti ${
              isPerfect
                ? "ti-trophy text-amber-400 text-4xl animate-bounce"
                : isPass
                ? "ti-shield-check text-emerald-400 text-4xl"
                : "ti-alert-triangle text-amber-400 text-4xl"
            }`}
          />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-text-ash font-bold">
            Scenario Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-pure mt-1">
            {scenarioTitle}
          </h2>
        </div>

        {/* Score & XP Pills */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-baseline gap-1 px-4 py-2 rounded-2xl bg-surface border border-border">
            <span
              className={`text-3xl font-display font-extrabold ${
                isPass ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {score}
            </span>
            <span className="text-sm text-text-ash font-medium">/100</span>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-base flex items-center gap-1.5">
            <i className="ti ti-sparkles text-sm" />
            <span>+{earnedXp} XP</span>
          </div>

          <Pill tone={isPass ? "emerald" : "warn"} size="sm">
            {isPerfect ? "Flawless Defense" : isPass ? "Threat Neutralized" : "Vulnerable to Exploit"}
          </Pill>
        </div>
      </div>

      {/* Golden Rule Highlight */}
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <i className="ti ti-bulb text-sm" />
          <span>Single Most Useful Rule to Remember</span>
        </div>
        <p className="text-sm text-text-pure leading-relaxed font-medium">
          {goldenRule}
        </p>
      </div>

      {/* Decision Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase font-bold text-text-ash tracking-wider">
          Decision Analysis &amp; Vigilance Check
        </h3>
        <div className="space-y-2">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                item.type === "success"
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-300"
              }`}
            >
              <i
                className={`ti ${
                  item.type === "success"
                    ? "ti-check text-emerald-400 text-base"
                    : "ti-alert-circle text-amber-400 text-base"
                } shrink-0 mt-0.5`}
              />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40">
        <Button variant="secondary" onClick={onRetry} className="w-full sm:w-auto">
          <i className="ti ti-rotate mr-2" />
          Replay Scenario
        </Button>

        <Link to={nextSimulationUrl} className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <span>{nextSimulationLabel}</span>
            <i className="ti ti-arrow-right ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
