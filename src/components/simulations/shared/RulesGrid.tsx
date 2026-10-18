
export interface DefenseRule {
  icon: string;
  title: string;
  description: string;
  type?: "do" | "dont" | "tip";
}

interface RulesGridProps {
  title?: string;
  rules: DefenseRule[];
  className?: string;
}

export function RulesGrid({
  title = "Key Rules to Remember",
  rules,
  className = "",
}: RulesGridProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="text-xs uppercase font-bold text-text-ash tracking-wider flex items-center gap-2">
          <i className="ti ti-shield-check text-primary" />
          <span>{title}</span>
        </h3>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule, idx) => {
          const isDo = rule.type === "do";
          const isDont = rule.type === "dont";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                isDo
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : isDont
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-surface-elevated border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isDo
                      ? "bg-emerald-500/10 text-emerald-400"
                      : isDont
                      ? "bg-red-500/10 text-red-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <i className={`ti ${rule.icon} text-sm`} aria-hidden="true" />
                </div>
                <h4 className="text-xs font-bold text-text-pure line-clamp-1">
                  {rule.title}
                </h4>
              </div>

              <p className="text-[11px] text-text-fog leading-relaxed">
                {rule.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
