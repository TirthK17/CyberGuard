import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/gamification";
import { celebrate } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, ProgressBar, PageSpinner, EmptyState, Pill } from "@/components/ui/primitives";
import type { Simulation, SimulationStep } from "@/types";
import { PhishingMailSandbox } from "@/components/simulations/PhishingMailSandbox";
import { RansomwareContainmentDrill } from "@/components/simulations/RansomwareContainmentDrill";
import { SmishingSimulator } from "@/components/simulations/SmishingSimulator";
import { MitmPaymentSandbox } from "@/components/simulations/MitmPaymentSandbox";

const SLUG_ALIASES: Record<string, string> = {
  phishing: "phishing-email",
  ransomware: "ransomware-response",
  smishing: "social-engineering-call",
  mitm: "mitm-attack",
  "public-wifi": "mitm-attack",
};

export function SimulationPlayerPage() {
  const { slug } = useParams();
  const activeSlug = (slug && SLUG_ALIASES[slug]) || slug || "";
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [steps, setSteps] = useState<SimulationStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sim, error: simError } = await supabase.from("simulations").select("*").eq("slug", activeSlug).single();
      if (simError) {
        setLoadError("Failed to load this simulation. Please try again.");
        return;
      }
      setSimulation(sim as Simulation);
      if (sim) {
        const { data: stepData, error: stepsError } = await supabase
          .from("simulation_steps")
          .select("*")
          .eq("simulation_id", sim.id)
          .order("order_index");
        if (stepsError) {
          setLoadError("Failed to load simulation steps. Please try again.");
          return;
        }
        setSteps(stepData as SimulationStep[]);
      }
    })();
  }, [slug]);

  const saveResult = async (finalScore: number, meta?: Record<string, unknown>) => {
    if (!profile || !simulation) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase.from("simulation_results").insert({
      user_id: profile.id,
      simulation_id: simulation.id,
      score: finalScore,
    });
    if (error) {
      setSaving(false);
      setSaveError("Your result wasn't saved. Please try again.");
      return;
    }
    await recordActivity({
      userId: profile.id,
      action: "simulation_completed",
      points: 40,
      meta: { simulation_id: simulation.id, score: finalScore, ...(meta || {}) },
    });
    setSaving(false);
  };

  const handleSandboxComplete = async (score: number, meta: Record<string, unknown>) => {
    await saveResult(score, meta);
  };

  if (loadError) return <EmptyState title={loadError} />;
  if (!simulation) return <PageSpinner />;

  // Specialized Real-Time Interactive Simulation Modes:
  if (activeSlug === "phishing-email") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
            <i className="ti ti-arrow-left mr-1.5" /> Back to Simulation Studio
          </Button>
          <div className="flex items-center gap-2">
            <Pill tone="primary" size="sm">Scenario: Spear-Phishing Mailbox</Pill>
            <Pill tone="emerald" size="sm">macOS Sandbox</Pill>
          </div>
        </div>
        <PhishingMailSandbox onComplete={handleSandboxComplete} />
      </div>
    );
  }

  if (activeSlug === "ransomware-response") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
            <i className="ti ti-arrow-left mr-1.5" /> Back to Simulation Studio
          </Button>
          <div className="flex items-center gap-2">
            <Pill tone="danger" size="sm">Scenario: Active Endpoint Ransomware</Pill>
            <Pill tone="primary" size="sm">Containment Drill</Pill>
          </div>
        </div>
        <RansomwareContainmentDrill onComplete={handleSandboxComplete} />
      </div>
    );
  }

  if (activeSlug === "social-engineering-call") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
            <i className="ti ti-arrow-left mr-1.5" /> Back to Simulation Studio
          </Button>
          <div className="flex items-center gap-2">
            <Pill tone="warning" size="sm">Scenario: Mobile Smishing &amp; Bank Fraud</Pill>
            <Pill tone="primary" size="sm">Dual-Perspective Phone &amp; Attacker Lab</Pill>
          </div>
        </div>
        <SmishingSimulator onComplete={handleSandboxComplete} />
      </div>
    );
  }

  if (activeSlug === "mitm-attack" || activeSlug === "public-wifi") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
            <i className="ti ti-arrow-left mr-1.5" /> Back to Simulation Studio
          </Button>
          <div className="flex items-center gap-2">
            <Pill tone="danger" size="sm">Scenario: Rogue Wi-Fi &amp; MITM Interception</Pill>
            <Pill tone="primary" size="sm">Live Network Sandbox</Pill>
          </div>
        </div>
        <MitmPaymentSandbox onComplete={handleSandboxComplete} />
      </div>
    );
  }

  // Fallback Step Player for generic quiz-based simulations (e.g. public-wifi)
  if (!steps || !steps.length) return <EmptyState title="This simulation has no steps yet" icon="ti-flask" />;

  const current = steps[index];
  const selectedOption = current.options.find((o) => o.id === choiceId);

  const choose = (optionId: string) => setChoiceId(optionId);

  const next = async () => {
    const wasCorrect = selectedOption?.correct ?? false;
    const newCorrect = correctCount + (wasCorrect ? 1 : 0);
    setCorrectCount(newCorrect);

    if (index < steps.length - 1) {
      setIndex((i) => i + 1);
      setChoiceId(null);
      return;
    }

    setFinished(true);
    const finalScore = Math.round((newCorrect / steps.length) * 100);
    if (finalScore >= 60) celebrate();
    await saveResult(finalScore);
  };

  if (finished) {
    const score = Math.round((correctCount / steps.length) * 100);
    const passed = score >= 60;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg"
      >
        <Card className="text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
            <i className={`ti ${passed ? "ti-shield-check text-2xl text-primary" : "ti-alert-triangle text-2xl text-amber-500"}`} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-text-high">Simulation Complete</h1>
          <p className="mt-3 font-display text-5xl font-extrabold text-primary">{score}/100</p>
          <p className="mt-2 text-sm text-text-low">
            {correctCount} of {steps.length} decisions protected against the threat scenario.
            {saving ? " · saving results..." : ""}
          </p>

          {saveError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400">
              {saveError}
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => saveResult(score)} disabled={saving}>
                {saving ? "Retrying..." : "Retry save"}
              </Button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2.5">
            <Button onClick={() => navigate("/simulations")}>Back to Simulation Studio</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIndex(0);
                setChoiceId(null);
                setCorrectCount(0);
                setFinished(false);
              }}
            >
              Replay Scenario
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const progressPercent = ((index + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
          <i className="ti ti-arrow-left mr-1.5" /> Back to Simulation Studio
        </Button>
        <span className="text-xs font-mono text-text-muted">
          Step {index + 1} of {steps.length}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-low">
          <span className="font-semibold text-text-high">{simulation.title}</span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
        <ProgressBar value={progressPercent} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Scenario Step {index + 1}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-text-high leading-snug">
                {current.prompt}
              </h2>
            </div>

            <div className="space-y-3">
              {current.options.map((option) => {
                const isSelected = choiceId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-text-high shadow-sm"
                        : "border-border bg-surface text-text-low hover:border-primary/40 hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected ? "border-primary bg-primary text-white" : "border-border text-text-muted"
                      }`}>
                        {option.id.toUpperCase()}
                      </span>
                      <span className="leading-relaxed">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedOption && current.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-surface-muted border border-border text-xs text-text-low leading-relaxed"
              >
                <strong className="text-text-high block mb-1">Defense Insight:</strong>
                {current.explanation}
              </motion.div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={next}
                disabled={!choiceId}
                className="min-w-[140px]"
              >
                {index === steps.length - 1 ? "Complete Simulation" : "Next Step"}
                <i className="ti ti-arrow-right ml-1.5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
