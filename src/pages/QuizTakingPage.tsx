import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/gamification";
import { celebrate } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, Pill, ProgressBar, PageSpinner, EmptyState } from "@/components/ui/primitives";
import { QUIZ_PASS, XP } from "@/lib/constants";
import type { Question } from "@/types";

export function QuizTakingPage() {
  const { id } = useParams();
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = questions && questions.length > index ? questions[index] : null;
  const score = questions ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0), 0) : 0;

  const selectAnswer = (choice: "a" | "b" | "c" | "d") => {
    if (revealed || !current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
    setRevealed(true);
  };

  const saveResult = async () => {
    if (!profile || !id || !questions) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error } = await supabase.from("quiz_results").insert({
        user_id: profile.id,
        quiz_id: id,
        score,
        total_questions: questions.length,
        answers,
      });
      if (error) {
        setSaveError("Your score wasn't saved due to a connection issue. Please try again.");
        return;
      }
      const pct = Math.round((score / questions.length) * 100);
      const passed = pct >= QUIZ_PASS;
      await recordActivity({
        userId: profile.id,
        action: "quiz_completed",
        points: passed ? XP.QUIZ_PASS : XP.QUIZ_COMPLETION,
        meta: { quiz_id: id, score, total: questions.length, passed },
        refId: id,
        awardOnce: true,
      });
      await refreshProfile();
    } catch {
      setSaveError("An unexpected error occurred while saving your results.");
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!questions) return;
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
      return;
    }
    setFinished(true);
    if ((score / questions.length) * 100 >= QUIZ_PASS) celebrate();
    await saveResult();
  };

  useEffect(() => {
    supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", id)
      .order("order_index")
      .then(({ data }) => setQuestions(data as Question[]));
  }, [id]);

  useEffect(() => {
    if (finished || !current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (!revealed) {
        if (e.key === "1" || e.key.toLowerCase() === "a") {
          e.preventDefault();
          selectAnswer("a");
        } else if (e.key === "2" || e.key.toLowerCase() === "b") {
          e.preventDefault();
          selectAnswer("b");
        } else if (e.key === "3" || e.key.toLowerCase() === "c") {
          e.preventDefault();
          selectAnswer("c");
        } else if (e.key === "4" || e.key.toLowerCase() === "d") {
          e.preventDefault();
          selectAnswer("d");
        }
      } else {
        if (e.key === "Enter") {
          e.preventDefault();
          next();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, finished, index, current, questions]);

  if (!questions) return <PageSpinner />;
  if (!questions.length) return <EmptyState title="This quiz has no questions yet" icon="ti-clipboard-check" />;
  if (!current) return <PageSpinner />;

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= QUIZ_PASS;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg"
      >
        <Card className="text-center p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10">
            <i className={`ti ${passed ? "ti-trophy text-2xl text-cyan" : "ti-refresh text-2xl text-warn"}`} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-text">Quiz Complete</h1>
          <p className="mt-3 font-display text-5xl font-extrabold text-cyan">{pct}%</p>
          <p className="mt-2 text-sm text-text-dim">
            You scored {score} out of {questions.length} questions correctly.
            {saving ? " · saving results..." : ""}
          </p>

          {saveError && (
            <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-sm text-danger">
              {saveError}
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={saveResult} disabled={saving}>
                {saving ? "Retrying..." : "Retry save"}
              </Button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-2.5">
            <Button onClick={() => navigate("/quizzes")}>Back to Quizzes</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIndex(0);
                setAnswers({});
                setRevealed(false);
                setFinished(false);
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const options: Array<["a" | "b" | "c" | "d", string]> = [
    ["a", current.option_a],
    ["b", current.option_b],
    ["c", current.option_c],
    ["d", current.option_d],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-faint">
          <span>Question {index + 1} of {questions.length}</span>
          <Pill tone={current.difficulty === "advanced" ? "danger" : current.difficulty === "intermediate" ? "warn" : "success"}>
            {current.difficulty}
          </Pill>
        </div>
        <ProgressBar value={((index + 1) / questions.length) * 100} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-text leading-snug">
                {current.question}
              </h2>
            </div>
            <p className="mt-1 text-xs text-text-ash">
              Use keys 1–4 or A–D to pick an answer
            </p>

            <div
              role="radiogroup"
              aria-label={`Question ${index + 1}: ${current.question}`}
              className="mt-6 space-y-3"
            >
              {options.map(([key, label], optIdx) => {
                const isSelected = answers[current.id] === key;
                const isCorrect = key === current.correct_answer;

                let btnStyle = "border-border bg-surface text-text-dim hover:border-border-strong hover:text-text hover:bg-surface-2";
                let keyStyle = "border-border bg-bg-elevated text-text-faint";

                if (revealed) {
                  if (isCorrect) {
                    btnStyle = "border-success/60 bg-success/15 text-success shadow-[0_0_20px_rgba(78,225,194,0.15)]";
                    keyStyle = "border-success/60 bg-success/20 text-success";
                  } else if (isSelected) {
                    btnStyle = "border-danger/60 bg-danger/15 text-danger";
                    keyStyle = "border-danger/60 bg-danger/20 text-danger";
                  } else {
                    btnStyle = "opacity-40 border-border bg-surface text-text-faint";
                  }
                } else if (isSelected) {
                  btnStyle = "border-primary/50 bg-primary/10 text-primary";
                  keyStyle = "border-primary/50 bg-primary/20 text-primary";
                }

                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected || (!answers[current.id] && optIdx === 0) ? 0 : -1}
                    disabled={revealed}
                    onClick={() => selectAnswer(key)}
                    className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${btnStyle}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-bold uppercase transition-colors ${keyStyle}`}>
                      {key}
                    </span>
                    <span className="flex-1 leading-relaxed">{label}</span>
                    {revealed && isCorrect && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-success shrink-0">
                        <i className="ti ti-circle-check-filled text-base" aria-hidden="true" />
                        <span>Correct</span>
                      </span>
                    )}
                    {revealed && isSelected && !isCorrect && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-danger shrink-0">
                        <i className="ti ti-circle-x-filled text-base" aria-hidden="true" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {revealed && current.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                role="region"
                aria-live="polite"
                aria-label="Answer explanation"
                className="mt-6 rounded-2xl border border-border bg-surface-2/70 p-4 text-xs leading-relaxed text-text-dim"
              >
                <div className="flex items-center gap-2 text-text font-semibold mb-1">
                  <i className="ti ti-bulb text-primary text-sm" aria-hidden="true" />
                  <span>Key Takeaway</span>
                </div>
                <p>{current.explanation}</p>
              </motion.div>
            )}

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center justify-between"
              >
                <span className="text-[11px] text-text-ash">
                  Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-elevated font-sans font-semibold">Enter ↵</kbd> to continue
                </span>
                <Button onClick={next}>
                  {index < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
