import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "cyberguard_onboarded_v1";

interface Step {
  title: string;
  description: string;
  icon: string;
  to?: string;
}

const STEPS: Step[] = [
  {
    title: "Welcome to CyberGuard 👋",
    description: "A quick 30-second tour of how the platform works, so you know exactly where everything is.",
    icon: "ti-shield-check",
  },
  {
    title: "Training Modules",
    description: "Work through structured lessons on phishing, malware, social engineering, and more — at your own pace.",
    icon: "ti-book-2",
    to: "/training",
  },
  {
    title: "Simulations & Quizzes",
    description: "Practice real scenarios in the Simulation Lab, then test your knowledge with quizzes tied to each topic.",
    icon: "ti-flask",
    to: "/simulations",
  },
  {
    title: "Track your growth",
    description: "Your Progress page shows category strengths, activity history, points, levels, and badges as you go.",
    icon: "ti-trending-up",
    to: "/progress",
  },
  {
    title: "Quick tip",
    description: "Press ⌘K (or Ctrl+K) anytime to instantly jump to any page, module, quiz, or simulation.",
    icon: "ti-command",
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="glass w-full max-w-sm rounded-3xl p-7 text-center shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface border border-border text-cyan">
              <i className={`ti ${current.icon} text-2xl`} />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-text">{current.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-dim">{current.description}</p>

            <div className="mt-6 flex items-center justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-cyan" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={finish}>
                Skip
              </Button>
              <Button size="sm" className="flex-1" onClick={next}>
                {step < STEPS.length - 1 ? "Next" : "Get started"}
              </Button>
            </div>

            {current.to && (
              <button
                onClick={() => {
                  finish();
                  navigate(current.to!);
                }}
                className="mt-3 text-xs text-text-faint underline decoration-dotted hover:text-cyan"
              >
                Take me there now
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
