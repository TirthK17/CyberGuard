import { useState, useEffect, useRef } from "react";

interface AttackerTerminalProps {
  logs: string[];
  title?: string;
  className?: string;
  onSkip?: () => void;
}

export function AttackerTerminal({
  logs,
  title = "ATTACKER C2 TERMINAL (LIVE FEED)",
  className = "",
  onSkip,
}: AttackerTerminalProps) {
  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Track lines that have been displayed
  const [displayedLines, setDisplayedLines] = useState<string[]>(() =>
    prefersReducedMotion ? logs : []
  );
  const [currentLineIndex, setCurrentLineIndex] = useState(
    prefersReducedMotion ? logs.length : 0
  );
  const [isTyping, setIsTyping] = useState(!prefersReducedMotion && logs.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // When logs change (new scene entered), sync
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedLines(logs);
      setCurrentLineIndex(logs.length);
      setIsTyping(false);
      return;
    }

    if (logs.length > displayedLines.length) {
      setIsTyping(true);
    }
  }, [logs, prefersReducedMotion, displayedLines.length]);

  // Typewriter line appending
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (currentLineIndex < logs.length) {
      const timer = setTimeout(() => {
        setDisplayedLines((prev) => {
          if (prev.length < currentLineIndex + 1) {
            return [...prev, logs[currentLineIndex]];
          }
          return prev;
        });
        setCurrentLineIndex((i) => i + 1);
      }, 160); // 160ms per log line for brisk, satisfying terminal feed

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [currentLineIndex, logs, prefersReducedMotion]);

  // Auto-scroll on new line
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines, isTyping]);

  const handleSkip = () => {
    setDisplayedLines(logs);
    setCurrentLineIndex(logs.length);
    setIsTyping(false);
    onSkip?.();
  };

  const formatLogLine = (line: string, index: number) => {
    let colorClass = "text-text-fog";

    if (line.startsWith("[+]") || line.startsWith("[CAPTURED]")) {
      colorClass = "text-emerald-400 font-semibold";
    } else if (line.startsWith("[!]") || line.startsWith("[ALERT]") || line.startsWith("[FAIL]")) {
      colorClass = "text-red-400 font-semibold";
    } else if (line.startsWith("[*]") || line.startsWith("[INFO]")) {
      colorClass = "text-cyan-400";
    } else if (line.startsWith("[>]") || line.startsWith("[SEND]")) {
      colorClass = "text-amber-300";
    } else if (line.startsWith("[SAFE]") || line.startsWith("[BLOCKED]")) {
      colorClass = "text-emerald-300 font-medium";
    } else if (line.startsWith("[★]") || line.startsWith("[PWNED]")) {
      colorClass = "text-fuchsia-400 font-bold";
    }

    return (
      <div key={index} className="flex items-start gap-2 py-0.5 font-mono text-xs leading-relaxed">
        <span className="text-[10px] text-zinc-600 select-none pt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`break-all ${colorClass}`}>
          {line}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl overflow-hidden flex flex-col font-mono ${className}`}
      onClick={isTyping ? handleSkip : undefined}
      title={isTyping ? "Click anywhere to reveal all lines" : undefined}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 ml-1.5 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isTyping && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
              aria-label="Skip typing animation"
            >
              Skip
            </button>
          )}
          <span className="text-[10px] text-zinc-500">
            {displayedLines.length}/{logs.length} lines
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        tabIndex={0}
        aria-label="Attacker console output"
        className="p-3.5 sm:p-4 space-y-1 overflow-y-auto max-h-[380px] min-h-[220px] focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
      >
        {displayedLines.length === 0 ? (
          <div className="text-zinc-600 text-xs italic py-4">
            [SYS] Initializing command &amp; control channel...
          </div>
        ) : (
          displayedLines.map((line, idx) => formatLogLine(line, idx))
        )}

        {/* Blinking Caret */}
        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 py-1 font-mono">
            <span>&gt;</span>
            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="px-3.5 py-1.5 bg-zinc-900/60 border-t border-zinc-800/80 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>Channel: TLS-1.3 / Port: 4444</span>
        <span className="text-zinc-400">Target: Simulated Endpoint</span>
      </div>
    </div>
  );
}
