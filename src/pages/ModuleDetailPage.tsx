import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModule, useLessons, useUserProgress } from "@/hooks/useContent";
import { useAuth } from "@/context/AuthContext";
import { drillsApi } from "@/lib/api/drills";
import { celebrate } from "@/lib/celebrate";
import { Button } from "@/components/ui/Button";
import { Card, Pill, ProgressBar, PageSpinner, EmptyState } from "@/components/ui/primitives";
import type { LessonBlock } from "@/types";

/* ── Module Extras: Associated Quizzes & Threat Sandboxes ── */
const MODULE_EXTRAS: Record<
  string,
  {
    quizId: string;
    quizTitle: string;
    sandboxSlug?: string;
    sandboxTitle?: string;
    nextSlug?: string;
    nextTitle?: string;
  }
> = {
  "cybersecurity-fundamentals": {
    quizId: "quiz-1",
    quizTitle: "Fundamentals Knowledge Check",
    sandboxSlug: "mitm-attack",
    sandboxTitle: "Public Wi-Fi Safety Demo",
    nextSlug: "password-account-security",
    nextTitle: "Password & Account Security",
  },
  "password-account-security": {
    quizId: "quiz-3",
    quizTitle: "Password & 2FA Quiz",
    sandboxSlug: "phishing-email",
    sandboxTitle: "Fake Email Simulation",
    nextSlug: "phishing-awareness",
    nextTitle: "Phishing & Fake Emails",
  },
  "phishing-awareness": {
    quizId: "quiz-2",
    quizTitle: "Phishing Detection Quiz",
    sandboxSlug: "phishing-email",
    sandboxTitle: "Fake Email Simulation",
    nextSlug: "social-engineering",
    nextTitle: "Social Engineering & Scams",
  },
  "social-engineering": {
    quizId: "quiz-4",
    quizTitle: "Scam Detection Quiz",
    sandboxSlug: "social-engineering-call",
    sandboxTitle: "Fake Bank SMS & Call Simulation",
    nextSlug: "malware-ransomware",
    nextTitle: "Viruses & Ransomware",
  },
  "malware-ransomware": {
    quizId: "quiz-5",
    quizTitle: "Ransomware Safety Quiz",
    sandboxSlug: "ransomware-response",
    sandboxTitle: "Virus Containment Drill",
    nextSlug: "network-security",
    nextTitle: "Wi-Fi & Safe Browsing",
  },
  "network-security": {
    quizId: "quiz-6",
    quizTitle: "Wi-Fi & Safe Browsing Quiz",
    sandboxSlug: "mitm-attack",
    sandboxTitle: "Public Wi-Fi Safety Demo",
    nextSlug: "cybersecurity-fundamentals",
    nextTitle: "Cybersecurity Fundamentals",
  },
};

/* ── Interactive Concept Check Component ── */
function InteractiveCheckBlock({
  block,
}: {
  block: {
    question: string;
    options: { text: string; correct: boolean; explanation: string }[];
  };
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setRevealed(true);
    if (block.options[idx]?.correct) {
      celebrate();
    }
  };

  const choice = selected !== null ? block.options[selected] : null;

  return (
    <div className="my-6 rounded-2xl border border-primary/25 bg-surface-elevated/60 p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm">
          <i className="ti ti-bulb" />
        </span>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
          Interactive Concept Check
        </span>
      </div>

      <p className="font-semibold text-sm text-text-pure leading-snug">
        {block.question}
      </p>

      <div className="space-y-2">
        {block.options.map((opt, idx) => {
          const isSelected = selected === idx;
          let btnStyle =
            "border-border bg-surface text-text-fog hover:border-primary/40 hover:text-text-pure";

          if (revealed) {
            if (opt.correct) {
              btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-medium";
            } else if (isSelected && !opt.correct) {
              btnStyle = "border-danger bg-danger/10 text-danger";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 ${btnStyle}`}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[10px]">
                {revealed && opt.correct ? (
                  <i className="ti ti-check font-bold" />
                ) : revealed && isSelected && !opt.correct ? (
                  <i className="ti ti-x font-bold" />
                ) : (
                  String.fromCharCode(65 + idx)
                )}
              </span>
              <span className="leading-relaxed">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {revealed && choice && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            choice.correct
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
              : "border-danger/30 bg-danger/5 text-danger"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <i className={`ti ${choice.correct ? "ti-circle-check" : "ti-alert-circle"}`} />
            {choice.correct ? "Well reasoned!" : "Defensive Insight:"}
          </div>
          {choice.explanation}
        </motion.div>
      )}
    </div>
  );
}

/* ── Rich Lesson Block Renderer ── */
function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h3 className="mt-7 text-lg font-bold text-text-pure tracking-tight border-b border-border/50 pb-2">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p className="mt-3.5 leading-relaxed text-text-fog text-sm sm:text-[15px]">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul className="mt-4 space-y-2 pl-2 text-text-fog text-sm leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div className="mt-5 flex gap-3.5 rounded-xl border border-primary/25 bg-primary/5 p-4 text-text-pure shadow-sm">
          <i className="ti ti-bulb mt-0.5 text-lg text-primary shrink-0" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="block font-bold text-primary mb-0.5">Security Tip</strong>
            {block.text}
          </div>
        </div>
      );
    case "warning":
      return (
        <div className="mt-5 flex gap-3.5 rounded-xl border border-warn/30 bg-warn/5 p-4 text-text-pure shadow-sm">
          <i className="ti ti-alert-triangle mt-0.5 text-lg text-warn shrink-0" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="block font-bold text-warn mb-0.5">High-Risk Warning</strong>
            {block.text}
          </div>
        </div>
      );
    case "case_study":
      return (
        <div className="my-6 rounded-2xl border border-danger/30 bg-surface-elevated p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-danger/10 text-danger border border-danger/20 font-mono text-[10px] font-bold uppercase tracking-wider">
              Real-World Breach Case Study
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-text-pure">
            {block.title}
          </h4>
          <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
            {block.incident}
          </p>
          <div className="p-3 rounded-xl bg-danger/5 border border-danger/15 text-xs text-danger leading-relaxed">
            <strong>Impact:</strong> {block.impact}
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed flex items-start gap-2">
            <i className="ti ti-shield-check text-base shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300">Defense Takeaway:</strong> {block.takeaway}
            </div>
          </div>
        </div>
      );
    case "terminal":
      return (
        <div className="my-5 rounded-xl border border-border bg-black/90 font-mono text-xs overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-3.5 py-2 bg-surface-elevated/70 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-warn/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] text-text-ash">{block.title ?? "Defensive Terminal"}</span>
            <div className="w-8" />
          </div>
          <div className="p-4 space-y-2 overflow-x-auto text-emerald-400">
            {block.command && (
              <div className="text-text-fog">
                <span className="text-primary font-bold">defense@cyberguard:~$ </span>
                <span className="text-text-pure">{block.command}</span>
              </div>
            )}
            <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-text-low font-mono">
              {block.output}
            </pre>
          </div>
        </div>
      );
    case "takeaway":
      return (
        <div className="my-6 rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <i className="ti ti-shield-check text-base" />
            {block.title}
          </div>
          <div className="grid gap-2">
            {block.points.map((pt, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface border border-border text-xs leading-relaxed text-text-fog"
              >
                <i className="ti ti-check text-emerald-400 font-bold mt-0.5 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "interactive_check":
      return <InteractiveCheckBlock block={block} />;
    case "image":
      return (
        <figure className="my-5">
          <img
            src={block.url}
            alt={block.caption ?? ""}
            className="w-full rounded-xl border border-border shadow-sm"
          />
          {block.caption && (
            <figcaption className="mt-1.5 text-center text-xs text-text-ash">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

const MODULE_ALIASES: Record<string, string> = {
  "social-engineering-awareness": "social-engineering",
  "fundamentals": "cybersecurity-fundamentals",
  "passwords": "password-account-security",
  "phishing": "phishing-awareness",
  "ransomware": "malware-ransomware",
  "wifi": "network-security",
};

export function ModuleDetailPage() {
  const { slug } = useParams();
  const activeSlug = (slug && MODULE_ALIASES[slug]) || slug;
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { data: module, loading: moduleLoading } = useModule(activeSlug);
  const { data: lessons, loading: lessonsLoading } = useLessons(module?.id);
  const { data: progress, error: progressError } = useUserProgress(profile?.id);

  const [activeIndex, setActiveIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const extra = activeSlug ? MODULE_EXTRAS[activeSlug] : undefined;

  // Initialize completed lessons when progress loads
  useEffect(() => {
    if (progress && module) {
      const existing = progress.find((p) => p.module_id === module.id);
      if (existing?.completed_lessons) {
        setCompletedIds(existing.completed_lessons);
      }
    }
  }, [progress, module]);

  if (moduleLoading || lessonsLoading) return <PageSpinner />;
  if (!module) {
    return (
      <EmptyState
        title="Module not found"
        description="This training curriculum module may have been renamed or unpublished."
        icon="ti-file-off"
      />
    );
  }

  const lessonList = lessons ?? [];
  const done = new Set(completedIds);
  const isModuleFullyComplete =
    lessonList.length > 0 && lessonList.every((l) => done.has(l.id));
  const percent = lessonList.length
    ? Math.round((done.size / lessonList.length) * 100)
    : 0;
  const activeLesson = lessonList[activeIndex];

  const markComplete = async () => {
    if (!profile || !activeLesson) return;
    setSaving(true);
    setSaveError(null);

    try {
      const newCompleted = Array.from(new Set([...done, activeLesson.id]));
      const fullyDone = newCompleted.length === lessonList.length;

      await drillsApi.recordLessonProgress(module.id, activeLesson.id);

      setCompletedIds(newCompleted);

      if (fullyDone) {
        celebrate();
      }

      await refreshProfile();

      if (activeIndex < lessonList.length - 1) {
        setActiveIndex((i) => i + 1);
      }
    } catch {
      setSaveError("An unexpected error occurred while saving your progress.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/training")}
          className="text-xs"
        >
          <i className="ti ti-arrow-left mr-1.5" /> Back to Lessons
        </Button>
        <div className="flex items-center gap-2">
          <Pill tone="primary" size="sm">
            {module.category}
          </Pill>
          <Pill tone={isModuleFullyComplete ? "emerald" : "default"} size="sm">
            {isModuleFullyComplete ? "✓ Completed" : `${percent}% Complete`}
          </Pill>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* ── SIDEBAR CURRICULUM NAVIGATION ── */}
        <aside className="space-y-5">
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                Lesson List
              </span>
              <h1 className="mt-1 text-base font-bold text-text-pure leading-snug">
                {module.title}
              </h1>
            </div>

            <div>
              <div className="flex justify-between text-xs text-text-ash mb-1">
                <span>Module Progress</span>
                <span className="font-mono text-primary font-semibold">{percent}%</span>
              </div>
              <ProgressBar value={percent} />
            </div>

            {progressError && (
              <p className="text-xs text-danger">Couldn't load saved progress.</p>
            )}

            <div className="pt-2 border-t border-border space-y-1">
              {lessonList.map((l, i) => {
                const isCurrent = i === activeIndex;
                const isFinished = done.has(l.id);

                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveIndex(i)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                      isCurrent
                        ? "bg-primary/10 text-primary border border-primary/25 font-semibold"
                        : "text-text-fog hover:bg-surface-elevated hover:text-text-pure border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <i
                        className={`ti ${
                          isFinished
                            ? "ti-circle-check-filled text-emerald-400 text-sm"
                            : isCurrent
                            ? "ti-circle-dot text-primary text-sm"
                            : "ti-circle text-text-ash text-sm"
                        }`}
                      />
                      <span className="truncate">{l.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-ash shrink-0 ml-1">
                      {i + 1}/{lessonList.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected Quiz & Sandbox Shortcuts in Sidebar */}
          {extra && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="text-[11px] font-bold text-text-pure uppercase tracking-wider font-mono flex items-center gap-1.5">
                <i className="ti ti-target" /> Practice &amp; Quiz
              </div>

              <Link
                to={`/quizzes/${extra.quizId}`}
                className="group p-2.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all block space-y-1"
              >
                <div className="flex items-center justify-between text-xs font-bold text-text-pure group-hover:text-primary transition-colors">
                  <span>Quick Quiz</span>
                  <i className="ti ti-arrow-right text-[10px]" />
                </div>
                <p className="text-[11px] text-text-ash leading-snug">
                  4 scenario questions to test your knowledge (+20 XP).
                </p>
              </Link>

              {extra.sandboxSlug && (
                <Link
                  to={`/simulations/${extra.sandboxSlug}`}
                  className="group p-2.5 rounded-xl bg-surface border border-border hover:border-emerald-500/50 transition-all block space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-text-pure group-hover:text-emerald-400 transition-colors">
                    <span className="flex items-center gap-1">
                      🎮 Simulation
                    </span>
                    <i className="ti ti-arrow-right text-[10px]" />
                  </div>
                  <p className="text-[11px] text-text-ash leading-snug">
                    {extra.sandboxTitle}
                  </p>
                </Link>
              )}
            </div>
          )}
        </aside>

        {/* ── LESSON CONTENT AREA ── */}
        <main className="space-y-6">
          <Card className="p-6 sm:p-8">
            {!activeLesson ? (
              <EmptyState
                title="No lessons yet"
                description="This module doesn't have any lessons published yet."
                icon="ti-notes"
              />
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-text-ash">
                  <span className="font-mono">
                    LESSON {activeIndex + 1} OF {lessonList.length}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-mono">
                    <i className="ti ti-shield-check" /> +15 XP on complete
                  </span>
                </div>

                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-text-pure">
                  {activeLesson.title}
                </h2>

                <div className="mt-4">
                  {activeLesson.content.map((block, i) => (
                    <LessonBlockView key={i} block={block} />
                  ))}
                </div>

                {/* Footer Navigation Bar */}
                <div className="mt-10 border-t border-border pt-6">
                  {saveError && (
                    <p className="mb-3 text-sm text-danger">{saveError}</p>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      disabled={activeIndex === 0}
                      onClick={() => setActiveIndex((i) => i - 1)}
                      className="text-xs"
                    >
                      <i className="ti ti-arrow-left mr-1.5" /> Previous Lesson
                    </Button>

                    <Button
                      variant="primary"
                      disabled={saving}
                      onClick={markComplete}
                      className="text-xs font-semibold px-5"
                    >
                      {saving ? (
                        "Saving Progress..."
                      ) : done.has(activeLesson.id) ? (
                        activeIndex < lessonList.length - 1 ? (
                          <>
                            Next Lesson <i className="ti ti-arrow-right ml-1.5" />
                          </>
                        ) : (
                          "✓ Module Completed"
                        )
                      ) : (
                        <>
                          Complete &amp; Continue{" "}
                          <i className="ti ti-check ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* ── CELEBRATORY COMPLETION BRIDGE ── */}
          <AnimatePresence>
            {isModuleFullyComplete && extra && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/30 bg-surface p-6 shadow-lg space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 text-2xl">
                    <i className="ti ti-trophy" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-pure">
                      Great Job! {module.title} Completed!
                    </h3>
                    <p className="text-xs text-text-fog">
                      You've finished all lessons in this module. Practice what you learned:
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 pt-2">
                  <Link
                    to={`/quizzes/${extra.quizId}`}
                    className="p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-primary mb-1">
                        <span>1. Take Quiz</span>
                        <i className="ti ti-arrow-right text-[10px]" />
                      </div>
                      <h4 className="text-xs font-bold text-text-pure group-hover:text-primary transition-colors">
                        {extra.quizTitle}
                      </h4>
                      <p className="text-[11px] text-text-ash mt-1">
                        Answer 4 quick scenario questions (+20 XP).
                      </p>
                    </div>
                  </Link>

                  {extra.sandboxSlug && (
                    <Link
                      to={`/simulations/${extra.sandboxSlug}`}
                      className="p-4 rounded-xl bg-surface-elevated border border-border hover:border-emerald-500 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                          <span>2. Try Simulation</span>
                          <i className="ti ti-arrow-right text-[10px]" />
                        </div>
                        <h4 className="text-xs font-bold text-text-pure group-hover:text-emerald-400 transition-colors">
                          {extra.sandboxTitle}
                        </h4>
                        <p className="text-[11px] text-text-ash mt-1">
                          Interactive hands-on simulation with step-by-step guidance.
                        </p>
                      </div>
                    </Link>
                  )}

                  {extra.nextSlug && (
                    <Link
                      to={`/training/${extra.nextSlug}`}
                      className="p-4 rounded-xl bg-surface-elevated border border-border hover:border-cyan-500 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                          <span>3. Next Topic</span>
                          <i className="ti ti-arrow-right text-[10px]" />
                        </div>
                        <h4 className="text-xs font-bold text-text-pure group-hover:text-cyan-400 transition-colors">
                          {extra.nextTitle}
                        </h4>
                        <p className="text-[11px] text-text-ash mt-1">
                          Continue to the next safety lesson.
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
