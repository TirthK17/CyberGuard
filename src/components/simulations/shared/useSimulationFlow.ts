import { useState, useEffect, useRef, useCallback } from "react";
import { celebrate } from "@/lib/celebrate";
import type { SimulationView } from "./ViewSwitcher";

export interface UseSimulationFlowOptions<TAct extends string> {
  initialAct: TAct;
  totalActs?: number;
  onComplete?: (score: number, meta: Record<string, unknown>) => void;
  timedMode?: boolean;
  timePerDecisionSeconds?: number;
}

export function useSimulationFlow<TAct extends string>({
  initialAct,
  totalActs = 4,
  onComplete,
  timedMode = false,
  timePerDecisionSeconds = 30,
}: UseSimulationFlowOptions<TAct>) {
  const [act, setAct] = useState<TAct>(initialAct);
  const [activeView, setActiveView] = useState<SimulationView>("split");
  const [beginnerClues, setBeginnerClues] = useState(false);
  const [isAttacked, setIsAttacked] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerDecisionSeconds);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active timers ref for automatic cleanup
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Reduced motion check
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const addTimer = useCallback((callback: () => void, delayMs: number) => {
    const timer = setTimeout(callback, delayMs);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Timed mode countdown
  useEffect(() => {
    if (!timedMode || isCompleted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timedMode, isCompleted, act]);

  // Trigger attack effect
  const triggerAttackEffect = useCallback(() => {
    if (prefersReducedMotion) {
      setIsAttacked(true);
      return;
    }
    setIsAttacked(true);
    addTimer(() => {
      setIsAttacked(false);
    }, 2400);
  }, [addTimer, prefersReducedMotion]);

  // Trigger defense effect
  const triggerDefenseEffect = useCallback(() => {
    setIsProtected(true);
    celebrate();
    if (!prefersReducedMotion) {
      addTimer(() => {
        setIsProtected(false);
      }, 3000);
    }
  }, [addTimer, prefersReducedMotion]);

  // One-shot completion handler
  const completeFlow = useCallback(
    (finalScore: number, meta: Record<string, unknown> = {}) => {
      if (isCompleted) return;
      setIsCompleted(true);
      if (finalScore >= 70) {
        triggerDefenseEffect();
      } else {
        triggerAttackEffect();
      }
      onComplete?.(finalScore, {
        score: finalScore,
        timedOut: timedMode && timeLeft === 0,
        beginnerCluesUsed: beginnerClues,
        ...meta,
      });
    },
    [isCompleted, onComplete, timedMode, timeLeft, beginnerClues, triggerDefenseEffect, triggerAttackEffect]
  );

  // Reset helper
  const resetFlow = useCallback(() => {
    clearAllTimers();
    setAct(initialAct);
    setIsAttacked(false);
    setIsProtected(false);
    setIsCompleted(false);
    setTimeLeft(timePerDecisionSeconds);
  }, [clearAllTimers, initialAct, timePerDecisionSeconds]);

  const toggleClues = useCallback(() => {
    setBeginnerClues((v) => !v);
  }, []);

  return {
    act,
    setAct,
    totalActs,
    activeView,
    setActiveView,
    beginnerClues,
    toggleClues,
    isAttacked,
    isProtected,
    timeLeft,
    isCompleted,
    triggerAttackEffect,
    triggerDefenseEffect,
    completeFlow,
    resetFlow,
    addTimer,
  };
}
