
interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  title?: string;
  isSecure?: boolean;
  isAttacked?: boolean;
  isProtected?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function BrowserFrame({
  children,
  url = "https://accounts.google.com/signin",
  title = "Google Accounts",
  isSecure = true,
  isAttacked = false,
  isProtected = false,
  onRefresh,
  className = "",
}: BrowserFrameProps) {
  return (
    <div
      role="region"
      aria-label="Simulated Web Browser"
      className={`rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden flex flex-col bg-surface-elevated ${
        isAttacked
          ? "border-red-500/80 shadow-red-500/20"
          : isProtected
          ? "border-emerald-500/80 shadow-emerald-500/20"
          : "border-border"
      } ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between gap-3 text-xs">
        {/* macOS Stoplight Dots */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block shadow-sm" />
          <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block shadow-sm" />
        </div>

        {/* Tab / Title */}
        <div className="hidden sm:flex items-center gap-2 max-w-[200px] truncate text-text-pure text-xs font-medium px-2 py-1 bg-surface-elevated rounded-t-lg border border-b-0 border-border">
          <i className="ti ti-world text-primary text-xs" />
          <span className="truncate">{title}</span>
        </div>

        {/* Navigation / Address Bar */}
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-text-pure">
          {/* Padlock / Security Indicator */}
          <div
            className={`flex items-center gap-1 font-mono text-[11px] ${
              isSecure ? "text-emerald-400" : "text-red-400 font-semibold"
            }`}
            title={isSecure ? "HTTPS Encrypted Connection" : "Unencrypted / Deceptive Website"}
          >
            <i className={`ti ${isSecure ? "ti-lock" : "ti-lock-open"} text-xs`} />
            <span className="hidden md:inline">{isSecure ? "Secure" : "Not Secure"}</span>
          </div>

          {/* URL text */}
          <span className="font-mono text-[11px] text-text-pure truncate flex-1 select-all">
            {url}
          </span>

          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh page"
              className="text-text-ash hover:text-text-pure p-0.5 transition-colors cursor-pointer"
            >
              <i className="ti ti-refresh text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Browser Viewport */}
      <div className="relative flex-1 overflow-y-auto min-h-[380px] max-h-[75vh] bg-background">
        {children}

        {/* Glitch Overlay when Attacked */}
        {isAttacked && (
          <div
            className="absolute inset-0 bg-red-950/20 pointer-events-none z-30 mix-blend-multiply border-2 border-red-500/50 animate-pulse"
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
    </div>
  );
}
