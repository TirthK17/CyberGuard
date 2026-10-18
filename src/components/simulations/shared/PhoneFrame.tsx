
interface PhoneFrameProps {
  children: React.ReactNode;
  time?: string;
  carrier?: string;
  battery?: string;
  isAttacked?: boolean;
  isProtected?: boolean;
  className?: string;
}

export function PhoneFrame({
  children,
  time = "09:41",
  carrier = "CyberGuard 5G",
  battery = "98%",
  isAttacked = false,
  isProtected = false,
  className = "",
}: PhoneFrameProps) {
  return (
    <div
      role="region"
      aria-label="Simulated Smartphone Screen"
      className={`relative mx-auto w-full max-w-[380px] rounded-[44px] p-3 shadow-2xl transition-all duration-300
        border-4 ${
          isAttacked
            ? "border-red-500/80 shadow-red-500/20 animate-[pulse_1s_infinite]"
            : isProtected
            ? "border-emerald-500/80 shadow-emerald-500/20"
            : "border-border bg-surface-elevated"
        } ${className}`}
    >
      {/* Outer Phone Shell */}
      <div className="relative rounded-[36px] overflow-hidden bg-background border border-border/60 flex flex-col min-h-[560px] max-h-[80vh]">
        {/* Phone Status Bar & Dynamic Island */}
        <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-2 text-[11px] font-semibold text-text-pure bg-surface/80 backdrop-blur-md select-none border-b border-border/30">
          <span className="font-medium tracking-tight">{time}</span>

          {/* Dynamic Island Pill */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-4 w-20 bg-zinc-950 rounded-full flex items-center justify-end px-2 gap-1 shadow-inner" aria-hidden="true">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 text-text-ash" aria-hidden="true">
            <span className="text-[10px] font-mono">{carrier}</span>
            <i className="ti ti-wifi text-xs" />
            <span className="text-[10px] font-mono ml-0.5">{battery}</span>
            <i className="ti ti-battery-4 text-xs text-emerald-400" />
          </div>
        </div>

        {/* Inner Scrollable Screen Content */}
        <div className="relative flex-1 overflow-y-auto flex flex-col focus:outline-none">
          {children}

          {/* Glitch Overlay when Attacked */}
          {isAttacked && (
            <div
              className="absolute inset-0 bg-red-950/20 pointer-events-none z-30 mix-blend-multiply border-2 border-red-500/40 animate-pulse"
              aria-hidden="true"
            />
          )}

          {/* Green Shield Pulse when Protected */}
          {isProtected && (
            <div
              className="absolute inset-0 bg-emerald-950/15 pointer-events-none z-30 border-2 border-emerald-400/40"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="py-2 flex justify-center bg-surface/80 border-t border-border/30" aria-hidden="true">
          <div className="w-32 h-1 bg-text-ash/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
