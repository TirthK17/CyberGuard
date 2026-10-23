import { type ReactNode } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

interface KavachLogoMarkProps {
  size?: number;
  pulse?: boolean;
  className?: string;
}

/**
 * Geometric SVG rendering of the Kavach Ribbon Shield Logo Mark
 */
export function KavachLogoMark({
  size = 36,
  pulse = false,
  className = "",
}: KavachLogoMarkProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="kavach-navy-shield" x1="6" y1="12" x2="22" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#151e34" />
            <stop offset="100%" stopColor="#0b101f" />
          </linearGradient>
          <linearGradient id="kavach-blue-ribbon" x1="16" y1="10" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00b0ff" />
            <stop offset="50%" stopColor="#0077ff" />
            <stop offset="100%" stopColor="#0055d4" />
          </linearGradient>
        </defs>

        {/* Left Dark Navy Shield Half */}
        <path
          d="M21 10.5C14.5 10.5 8 15 8 23.5C8 32 14.5 39 21 41.5V33C17 31.5 13.5 28 13.5 23.5C13.5 19 17 15.5 21 14.2V10.5Z"
          fill="url(#kavach-navy-shield)"
        />

        {/* Center Emerald Security Node */}
        <circle cx="16" cy="24.5" r="3.2" fill="#00e676" />

        {/* Right Folding Cyan/Blue Ribbon */}
        <path
          d="M23 11C27 11 31 13 33 16.5L25 24.5L34 33.5C32 37 28 39.5 24 39.5L19 33L27 24.5L20 16.5L23 11Z"
          fill="url(#kavach-blue-ribbon)"
        />
      </svg>

      {/* Live active defense pulse indicator */}
      {pulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-surface" />
        </span>
      )}
    </div>
  );
}

interface KavachLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  pulse?: boolean;
  className?: string;
  badge?: ReactNode;
}

export function KavachLogo({
  size = "md",
  showText = true,
  subtitle = APP_TAGLINE,
  pulse = false,
  className = "",
  badge,
}: KavachLogoProps) {
  const sizeMap = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };
  const pixelSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <KavachLogoMark size={pixelSize} pulse={pulse} />
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-display font-black tracking-tight text-text-pure text-base sm:text-lg">
              {APP_NAME}
            </span>
            {badge ?? (
              <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                PRO
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] font-semibold tracking-wider text-text-ash uppercase mt-0.5 font-mono truncate max-w-[220px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export backward compatibility aliases
export { KavachLogoMark as CyberGuardLogoMark };
export { KavachLogo as CyberGuardLogo };
