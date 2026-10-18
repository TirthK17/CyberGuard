import { useId } from "react";

interface CyberGuardLogoMarkProps {
  size?: number;
  pulse?: boolean;
  className?: string;
}

export function CyberGuardLogoMark({
  size = 36,
  pulse = true,
  className = "",
}: CyberGuardLogoMarkProps) {
  const id = useId();
  const gradId = `cg-shield-${id}`;
  const coreGradId = `cg-core-${id}`;

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
          {/* Main Shield Gradient: Precision Blue to Indigo with Cyan highlights */}
          <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="48%" stopColor="#0071e3" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          {/* Inner Core Gradient */}
          <linearGradient id={coreGradId} x1="16" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Outer Shield Backplate */}
        <path
          d="M24 4L39 9.5V22C39 31.8 32.6 40.7 24 44C15.4 40.7 9 31.8 9 22V9.5L24 4Z"
          fill={`url(#${gradId})`}
        />

        {/* Specular Left Highlight / Bevel */}
        <path
          d="M24 4L9 9.5V22C9 31.8 15.4 40.7 24 44V4Z"
          fill="white"
          fillOpacity="0.14"
        />

        {/* Top Rim Crest Highlight */}
        <path
          d="M24 4.5L38.5 9.8L38 11L24 6L10 11L9.5 9.8L24 4.5Z"
          fill="white"
          fillOpacity="0.25"
        />

        {/* Inner Geometric Circuit / Micro-Shield Core */}
        <path
          d="M24 13.5L32 17V23.5C32 28.5 28.6 33.1 24 35C19.4 33.1 16 28.5 16 23.5V17L24 13.5Z"
          fill="#060c18"
          stroke={`url(#${coreGradId})`}
          strokeWidth="1.4"
        />

        {/* Central Core Crystal & Quantum Node */}
        <path
          d="M24 18.5L28 22.5L24 28.5L20 22.5L24 18.5Z"
          fill="#38bdf8"
          fillOpacity="0.95"
        />

        {/* Center Active Defense Beacon Dot */}
        <circle cx="24" cy="22.5" r="2" fill="#ffffff" />
        <circle cx="24" cy="22.5" r="3.2" fill="#38bdf8" fillOpacity="0.45" />

        {/* Precision Laser Intersect lines */}
        <line x1="24" y1="4.5" x2="24" y2="13.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="24" y1="35" x2="24" y2="43.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
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

interface CyberGuardLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  pulse?: boolean;
  className?: string;
}

export function CyberGuardLogo({
  size = "md",
  showText = true,
  subtitle,
  pulse = true,
  className = "",
}: CyberGuardLogoProps) {
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
      <CyberGuardLogoMark size={pixelSize} pulse={pulse} />
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-display font-bold tracking-tight text-text-pure text-base sm:text-lg">
              Cyber<span className="text-primary font-black">Guard</span>
            </span>
            <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              PRO
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] font-semibold tracking-wider text-text-ash uppercase mt-0.5 font-mono">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
