import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { drillsApi } from "@/lib/api/drills";
import { celebrate } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Card, ProgressBar, PageSpinner, EmptyState, Pill } from "@/components/ui/primitives";
import type { Simulation, SimulationStep } from "@/types";

const PhishingMailSandbox = lazy(() =>
  import("@/components/simulations/PhishingMailSandbox").then((m) => ({ default: m.PhishingMailSandbox }))
);
const RansomwareContainmentDrill = lazy(() =>
  import("@/components/simulations/RansomwareContainmentDrill").then((m) => ({ default: m.RansomwareContainmentDrill }))
);
const SmishingSimulator = lazy(() =>
  import("@/components/simulations/SmishingSimulator").then((m) => ({ default: m.SmishingSimulator }))
);
const MitmPaymentSandbox = lazy(() =>
  import("@/components/simulations/MitmPaymentSandbox").then((m) => ({ default: m.MitmPaymentSandbox }))
);
const UpiCollectScamSandbox = lazy(() =>
  import("@/components/simulations/UpiCollectScamSandbox").then((m) => ({ default: m.UpiCollectScamSandbox }))
);
const QuishingSandbox = lazy(() =>
  import("@/components/simulations/QuishingSandbox").then((m) => ({ default: m.QuishingSandbox }))
);

interface SandboxConfig {
  component: React.LazyExoticComponent<React.ComponentType<{ onComplete: (score: number, meta: Record<string, unknown>) => void }>>;
  badges: { label: string; tone: "primary" | "emerald" | "danger" | "warn" }[];
}

const SANDBOXES: Record<string, SandboxConfig> = {
  "phishing-email": {
    component: PhishingMailSandbox,
    badges: [
      { label: "Fake Work Email", tone: "primary" },
      { label: "Interactive Mailbox", tone: "emerald" },
    ],
  },
  "ransomware-response": {
    component: RansomwareContainmentDrill,
    badges: [
      { label: "Virus & Ransomware Alert", tone: "danger" },
      { label: "Action Checklist", tone: "primary" },
    ],
  },
  "social-engineering-call": {
    component: SmishingSimulator,
    badges: [
      { label: "Fake Bank SMS & Call", tone: "warn" },
      { label: "Phone & Scammer View", tone: "primary" },
    ],
  },
  "mitm-attack": {
    component: MitmPaymentSandbox,
    badges: [
      { label: "Unsafe Public Wi-Fi", tone: "danger" },
      { label: "Interactive Demo", tone: "primary" },
    ],
  },
  "upi-collect": {
    component: UpiCollectScamSandbox,
    badges: [
      { label: "UPI & Mobile Fraud", tone: "warn" },
      { label: "Interactive Banking", tone: "primary" },
    ],
  },
  "quishing": {
    component: QuishingSandbox,
    badges: [
      { label: "Physical QR Phishing", tone: "danger" },
      { label: "Camera & Browser Inspection", tone: "primary" },
    ],
  },
};

const SLUG_ALIASES: Record<string, string> = {
  phishing: "phishing-email",
  ransomware: "ransomware-response",
  smishing: "social-engineering-call",
  mitm: "mitm-attack",
  "public-wifi": "mitm-attack",
  upi: "upi-collect",
  "upi-scam": "upi-collect",
  "qr-phishing": "quishing",
};

export function SimulationPlayerPage() {
  const { slug } = useParams();
  const activeSlug = (slug && SLUG_ALIASES[slug]) || slug || "";
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
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
      if (simError || !sim) {
        setLoadError("The simulation scenario you are looking for does not exist or may have been moved.");
        return;
      }
      setSimulation(sim as Simulation);
      const { data: stepData, error: stepsError } = await supabase
        .from("simulation_steps")
        .select("*")
        .eq("simulation_id", sim.id)
        .order("order_index");
      if (stepsError) {
        setLoadError("Failed to load simulation steps. Please try again.");
        return;
      }
      setSteps((stepData ?? []) as unknown as SimulationStep[]);
    })();
  }, [activeSlug]);

  const saveResult = async (finalScore: number, meta?: Record<string, unknown>) => {
    if (!profile || !simulation) return false;
    setSaving(true);
    setSaveError(null);
    try {
      await drillsApi.submitSimulationResult(profile.id, simulation.id, finalScore, meta);
      await refreshProfile();
      setSaving(false);
      toast({
        title: "Simulation Recorded",
        description: `Completed with ${finalScore}/100`,
        variant: "success",
      });
      return true;
    } catch {
      setSaving(false);
      setSaveError("Your result could not be saved to the database. Please try again.");
      toast({
        title: "Sync Error",
        description: "Could not save simulation score. Please retry.",
        variant: "error",
      });
      return false;
    }
  };

  const handleSandboxComplete = async (score: number, meta: Record<string, unknown>) => {
    await saveResult(score, meta);
  };

  if (loadError) {
    return (
      <div className="py-12">
        <EmptyState
          title="Simulation Not Found"
          description={loadError}
          icon="ti-flask"
          actionLabel="Back to Simulations"
          onAction={() => navigate("/simulations")}
        />
      </div>
    );
  }

  if (!simulation) return <PageSpinner />;

  // Specialized Real-Time Interactive Simulation Modes:
  const sandbox = SANDBOXES[activeSlug];
  if (sandbox) {
    const SandboxComponent = sandbox.component;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/simulations")}>
            <i className="ti ti-arrow-left mr-1.5" /> Back to Simulations
          </Button>
          <div className="flex items-center gap-2">
            {sandbox.badges.map((b, i) => (
              <Pill key={i} tone={b.tone} size="sm">
                {b.label}
              </Pill>
            ))}
          </div>
        </div>
        <Suspense fallback={<PageSpinner />}>
          <SandboxComponent onComplete={handleSandboxComplete} />
        </Suspense>
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
            <Button onClick={() => navigate("/simulations")}>Back to Simulations</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIndex(0);
                setChoiceId(null);
                setCorrectCount(0);
                setFinished(false);
              }}
            >
              Try Again
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
          <i className="ti ti-arrow-left mr-1.5" /> Back to Simulations
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
                Question {index + 1}
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
                <strong className="text-text-high block mb-1">Security Tip:</strong>
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
