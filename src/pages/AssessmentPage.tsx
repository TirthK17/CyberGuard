import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/gamification";
import { celebrateBig } from "@/lib/celebrate";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, Pill, ProgressBar, PageSpinner, EmptyState } from "@/components/ui/primitives";

interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  topic: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "a" | "b" | "c" | "d";
  explanation?: string;
  order_index: number;
}

const TOPIC_MODULE_MAP: Record<string, { slug: string; name: string }> = {
  "Passwords & Identity": { slug: "password-account-security", name: "Password & Account Security" },
  "Email & Spear-Phishing": { slug: "phishing-awareness", name: "Phishing & Spear-Phishing Awareness" },
  "Social Engineering & Smishing": { slug: "social-engineering", name: "Social Engineering & Pretexting" },
  "Malware & Ransomware": { slug: "malware-ransomware", name: "Malware & Ransomware Defense" },
  "Network & Wi-Fi Security": { slug: "network-security", name: "Network Security & Safe Browsing" },
  "Incident Response & Backup": { slug: "cybersecurity-fundamentals", name: "Cybersecurity Fundamentals" },
};

function bandFor(score: number) {
  if (score >= 85) return "Security Specialist (Elite)";
  if (score >= 61) return "Verified Competent (Good)";
  if (score >= 41) return "Basic Awareness (Developing)";
  return "High Risk (Foundational)";
}

export function AssessmentPage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"intro" | "taking" | "results">("intro");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [saving, setSaving] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: assessment } = await supabase.from("assessments").select("id").limit(1).single();
      if (!assessment) return;
      setAssessmentId(assessment.id);
      const { data: qs } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("assessment_id", assessment.id)
        .order("order_index");
      setQuestions(qs as AssessmentQuestion[]);
    })();
  }, []);

  if (!questions) return <PageSpinner />;
  if (!questions.length) {
    return <EmptyState title="No assessment available yet" icon="ti-clipboard-list" />;
  }

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;

  const choose = (choice: "a" | "b" | "c" | "d") => {
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
  };

  const saveResult = async (score: number, band: string) => {
    if (!profile || !assessmentId) return;
    setSaving(true);
    setSaveError(null);
    const { error: resultError } = await supabase.from("assessment_results").insert({
      user_id: profile.id,
      assessment_id: assessmentId,
      score,
      band: band.toLowerCase(),
    });
    if (resultError) {
      setSaving(false);
      setSaveError("Your results weren't saved due to a connection issue. Please try again.");
      return;
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ awareness_score: score })
      .eq("id", profile.id);

    if (profileError) {
      setSaving(false);
      setSaveError("Your awareness score couldn't be updated. Please try again.");
      return;
    }
    await recordActivity({
      userId: profile.id,
      action: "assessment_completed",
      points: 100,
      meta: { score, band },
    });
    await refreshProfile();
    setSaving(false);
  };

  const submitAssessment = async () => {
    const correct = questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correct_answer ? 1 : 0),
      0
    );
    const score = Math.round((correct / questions.length) * 100);
    const band = bandFor(score);
    setFinalScore(score);
    setPhase("results");

    if (score >= 61) {
      celebrateBig();
    }
    await saveResult(score, band);
  };

  const handleRetake = () => {
    setAnswers({});
    setIndex(0);
    setShowReview(false);
    setPhase("intro");
  };

  /* ══════════════════════════════════════════════════════════════
     PHASE 1: BRIEFING & READINESS INTRO
     ══════════════════════════════════════════════════════════════ */
  if (phase === "intro") {
    const currentScore = profile?.awareness_score ?? 0;
    const isAlreadyCertified = currentScore >= 61;

    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="rounded-3xl border border-primary/30 bg-surface p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-bold font-mono tracking-wider uppercase">
                    Official Competency Benchmark
                  </span>
                  <span className="text-text-muted text-xs">•</span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    100% Adaptive Sandbox
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-text-pure">
                  Cybersecurity Awareness Assessment
                </h1>
                <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
                  Evaluate your instinctual defense readiness across all 6 critical threat vectors. Pass with 61% or higher to earn your verified <strong>Cybersecurity Awareness Certificate</strong>.
                </p>
              </div>

              <div className="shrink-0 flex items-center justify-center h-20 w-20 rounded-3xl bg-primary/10 text-primary border border-primary/25 text-4xl shadow-inner">
                <i className="ti ti-certificate" />
              </div>
            </div>

            {/* Diagnostic Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border text-xs">
              <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-ash uppercase">Questions</span>
                <div className="font-bold text-text-pure text-base">12 Scenarios</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-ash uppercase">Estimated Time</span>
                <div className="font-bold text-text-pure text-base">6–8 Minutes</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-ash uppercase">Pass Threshold</span>
                <div className="font-bold text-emerald-400 text-base">61% Score</div>
              </div>
              <div className="p-3 rounded-2xl bg-surface-elevated border border-border space-y-1">
                <span className="text-[10px] font-mono text-text-ash uppercase">Specialist Badge</span>
                <div className="font-bold text-primary text-base">85% Score</div>
              </div>
            </div>

            {/* 6 Evaluated Threat Domains */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-text-pure uppercase tracking-wider font-mono">
                Evaluated Threat Domains:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { icon: "ti-key", label: "Passwords & Identity Entropy" },
                  { icon: "ti-mail-exclamation", label: "Email Spoofing & Spear-Phishing" },
                  { icon: "ti-device-mobile-message", label: "Mobile Smishing & Pretexting" },
                  { icon: "ti-virus", label: "Malware & Ransomware First Response" },
                  { icon: "ti-wifi", label: "Public Wi-Fi & SSL/TLS Interception" },
                  { icon: "ti-server", label: "Incident Containment & 3-2-1 Backups" },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-elevated/70 border border-border text-text-fog"
                  >
                    <i className={`ti ${d.icon} text-primary text-sm`} />
                    <span className="font-medium text-text-pure/90">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User status alert if already certified */}
            {isAlreadyCertified && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <i className="ti ti-certificate text-lg" />
                  <span>
                    Current Awareness Index: <strong>{currentScore}/100</strong> (Certificate Unlocked)
                  </span>
                </div>
                <Link to="/certificate" className="font-bold underline hover:text-emerald-200">
                  View Certificate
                </Link>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => setPhase("taking")}
                className="w-full sm:w-auto font-bold text-sm px-8 py-3 shadow-md"
              >
                <i className="ti ti-player-play mr-2" /> Start Comprehensive Assessment
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/training")}
                className="w-full sm:w-auto text-xs"
              >
                Review Training Modules First
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     PHASE 3: DIAGNOSTIC REPORT & TELEMETRY DASHBOARD
     ══════════════════════════════════════════════════════════════ */
  if (phase === "results") {
    const hasUnlockedCert = finalScore >= 61;
    const isSpecialist = finalScore >= 85;
    const band = bandFor(finalScore);

    const r = 60;
    const circ = 2 * Math.PI * r;
    const offset = circ - (finalScore / 100) * circ;

    // Compute domain scores
    const domainScores: Record<string, { total: number; correct: number }> = {};
    for (const q of questions) {
      if (!domainScores[q.topic]) {
        domainScores[q.topic] = { total: 0, correct: 0 };
      }
      domainScores[q.topic].total += 1;
      if (answers[q.id] === q.correct_answer) {
        domainScores[q.topic].correct += 1;
      }
    }

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Main Results Card */}
          <Card className="text-center p-6 sm:p-10 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
                Diagnostic Telemetry Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-text-pure">
                Awareness Index Calibrated
              </h1>
              <p className="text-xs text-text-fog max-w-md mx-auto">
                Your performance across 12 scenario vectors has been scored and synchronized to your defense profile.
              </p>
            </div>

            {/* Radial Gauge */}
            <div className="relative mx-auto my-4 flex h-44 w-44 items-center justify-center">
              <svg viewBox="0 0 140 140" className="h-44 w-44 -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke="var(--color-surface-2, rgba(255,255,255,0.06))"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r={r}
                  fill="none"
                  stroke={hasUnlockedCert ? "var(--color-primary, #663AF3)" : "#f87171"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute text-center space-y-0.5">
                <div className="font-display text-4xl font-extrabold text-text-pure">
                  {finalScore}
                </div>
                <div className="text-[10px] font-mono text-text-ash">out of 100</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Pill tone={hasUnlockedCert ? "emerald" : "danger"} size="md">
                {band}
              </Pill>
              <Pill tone="primary" size="md">
                +100 XP Earned
              </Pill>
            </div>

            {/* Certificate Unlocked Banner */}
            {hasUnlockedCert ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl border border-emerald-500/30">
                    <i className="ti ti-certificate" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-emerald-300">
                      Official Certificate Unlocked!
                    </strong>
                    <span className="text-xs text-emerald-200/90 leading-relaxed">
                      You met the 61+ score requirement to claim your verified Cybersecurity Awareness Certificate.
                    </span>
                  </div>
                </div>
                <Link to="/certificate" className="shrink-0 w-full sm:w-auto">
                  <Button variant="primary" size="sm" className="w-full font-bold text-xs">
                    View Certificate &rarr;
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-xs text-danger text-left">
                <strong>Certificate Locked (Score under 61):</strong> Review the domain breakdowns below and retake the assessment to earn your certificate!
              </div>
            )}

            {/* Specialist Honor Badge */}
            {isSpecialist && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3 text-left">
                <i className="ti ti-award text-2xl text-primary shrink-0" />
                <div className="text-xs">
                  <strong className="block text-text-pure font-bold">
                    Specialist Honor Earned (Score 85+)
                  </strong>
                  <span className="text-text-fog">
                    You have unlocked the elite &quot;Security Specialist&quot; badge in your profile.
                  </span>
                </div>
              </div>
            )}

            {/* ── DOMAIN COMPETENCY MATRIX ── */}
            <div className="space-y-3 text-left pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-text-pure uppercase tracking-wider font-mono">
                Threat Vector Competency Matrix:
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {Object.entries(domainScores).map(([topic, stat]) => {
                  const pct = Math.round((stat.correct / stat.total) * 100);
                  const isSolid = pct >= 80;
                  const mod = TOPIC_MODULE_MAP[topic];

                  return (
                    <div
                      key={topic}
                      className="p-3 rounded-xl bg-surface-elevated border border-border space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-pure truncate pr-2">{topic}</span>
                        <span
                          className={`font-mono text-xs font-semibold ${
                            isSolid ? "text-emerald-400" : "text-warn"
                          }`}
                        >
                          {stat.correct}/{stat.total} ({pct}%)
                        </span>
                      </div>
                      <ProgressBar value={pct} />
                      {!isSolid && mod && (
                        <div className="pt-1 text-[11px]">
                          <Link
                            to={`/training/${mod.slug}`}
                            className="text-primary hover:underline flex items-center gap-1 font-medium"
                          >
                            Brush up in {mod.name} &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Toggle Detailed Answer Explanations */}
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReview(!showReview)}
                className="w-full text-xs font-semibold"
              >
                <i className={`ti ${showReview ? "ti-eye-off" : "ti-eye"} mr-1.5`} />
                {showReview ? "Hide Detailed Answer Key" : "Review All 12 Questions & Explanations"}
              </Button>
            </div>

            {/* ── EXPANDED QUESTION-BY-QUESTION REVIEW ── */}
            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 text-left pt-4 border-t border-border overflow-hidden"
                >
                  <h4 className="text-xs font-bold text-text-pure uppercase tracking-wider font-mono">
                    Detailed Question Audit:
                  </h4>

                  {questions.map((q, idx) => {
                    const userPick = answers[q.id];
                    const isCorrect = userPick === q.correct_answer;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          isCorrect
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-danger/30 bg-danger/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-text-ash">
                            QUESTION {idx + 1} • {q.topic}
                          </span>
                          <span
                            className={`font-bold flex items-center gap-1 ${
                              isCorrect ? "text-emerald-400" : "text-danger"
                            }`}
                          >
                            <i className={`ti ${isCorrect ? "ti-check" : "ti-x"}`} />
                            {isCorrect ? "Correct" : "Missed"}
                          </span>
                        </div>

                        <p className="font-semibold text-text-pure text-sm leading-snug">
                          {q.question}
                        </p>

                        <div className="grid gap-1 pt-1 text-[11px]">
                          <div>
                            <span className="text-text-ash">Your answer: </span>
                            <span className={isCorrect ? "text-emerald-400 font-medium" : "text-danger font-medium"}>
                              Option {userPick?.toUpperCase()}) {q[`option_${userPick}` as keyof AssessmentQuestion]}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-text-ash">Correct answer: </span>
                              <span className="text-emerald-400 font-medium">
                                Option {q.correct_answer.toUpperCase()}) {q[`option_${q.correct_answer}` as keyof AssessmentQuestion]}
                              </span>
                            </div>
                          )}
                        </div>

                        {q.explanation && (
                          <div className="p-2.5 rounded-lg bg-surface border border-border text-[11px] text-text-fog leading-relaxed">
                            <strong className="text-text-pure block mb-0.5">Defensive Insight:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {saveError && (
              <div className="p-3 rounded-xl border border-danger/30 bg-danger/10 text-xs text-danger">
                {saveError}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={handleRetake} className="flex-1 text-xs">
                <i className="ti ti-rotate-clockwise mr-1.5" /> Retake Assessment
              </Button>
              <Button variant="primary" onClick={() => navigate("/dashboard")} className="flex-1 text-xs font-semibold">
                Back to Security Console <i className="ti ti-arrow-right ml-1.5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     PHASE 2: LIVE ASSESSMENT EXAMINATION
     ══════════════════════════════════════════════════════════════ */
  const options: Array<["a" | "b" | "c" | "d", string]> = [
    ["a", current.option_a],
    ["b", current.option_b],
    ["c", current.option_c],
    ["d", current.option_d],
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress and Topic Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-ash">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">
              Question {index + 1} of {questions.length}
            </span>
            <span>•</span>
            <span>{answeredCount} of {questions.length} Answered</span>
          </div>
          <Pill tone="primary" size="sm">
            {current.topic}
          </Pill>
        </div>

        <ProgressBar value={((index + 1) / questions.length) * 100} />

        {/* Clickable Question Navigator Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = i === index;

            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                aria-label={`Jump to question ${i + 1}`}
                className={`h-7 w-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-white ring-2 ring-primary/40 shadow-sm"
                    : isAnswered
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-surface border border-border text-text-ash hover:border-text-ash"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                Scenario Challenge {index + 1}
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold text-text-pure leading-snug">
                {current.question}
              </h2>
            </div>

            {/* 4 Interactive Options */}
            <div className="space-y-3">
              {options.map(([key, label]) => {
                const isSelected = answers[current.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => choose(key)}
                    className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-text-pure ring-1 ring-primary shadow-sm"
                        : "border-border bg-surface text-text-fog hover:border-primary/40 hover:text-text-pure hover:bg-surface-elevated"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold uppercase transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-surface-elevated text-text-ash"
                      }`}
                    >
                      {key}
                    </span>
                    <span className="flex-1 leading-relaxed">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border gap-3">
              <Button
                variant="secondary"
                disabled={index === 0}
                onClick={() => setIndex((i) => i - 1)}
                className="text-xs"
              >
                <i className="ti ti-arrow-left mr-1.5" /> Previous
              </Button>

              {index < questions.length - 1 ? (
                <Button
                  variant="primary"
                  disabled={!answers[current.id]}
                  onClick={() => setIndex((i) => i + 1)}
                  className="text-xs font-semibold"
                >
                  Next Question <i className="ti ti-arrow-right ml-1.5" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={saving || answeredCount < questions.length}
                  onClick={submitAssessment}
                  className="text-xs font-bold px-6 shadow-md"
                >
                  {saving ? "Calibrating..." : "Submit Assessment →"}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
