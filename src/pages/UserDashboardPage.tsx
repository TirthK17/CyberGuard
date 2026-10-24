import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  useModules,
  useQuizzes,
  useSimulations,
  useUserProgress,
  useUserBadges,
  useUserQuizResults,
  useUserSimulationResults,
} from "@/hooks/useContent";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";
import {
  ShieldCheck,
  BookOpen,
  Target,
  Award,
  Flame,
  Play,
  Mail,
  Key,
  Smartphone,
  Bot,
  Wrench,
  Radio,
  CheckCircle2,
  ArrowRight,
  Activity,
} from "lucide-react";

interface RecentActivity {
  id: string;
  action: string;
  meta: Record<string, unknown>;
  points_earned: number;
  created_at: string;
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface DefenseVector {
  id: string;
  name: string;
  icon: ReactNode;
  score: number;
  status: "Fortified" | "Solid" | "Moderate";
  tone: "cyan" | "emerald" | "violet" | "amber";
  link: string;
}

export function UserDashboardPage() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const { data: modules, refetch: refetchModules } = useModules();
  const { data: allQuizzes, refetch: refetchQuizzes } = useQuizzes();
  const { data: allSimulations, refetch: refetchSimulations } = useSimulations();
  const { data: progress, refetch: refetchProgress } = useUserProgress(profile?.id);
  const { data: badges, refetch: refetchBadges } = useUserBadges(profile?.id);
  const { data: quizResults, refetch: refetchQuizResults } = useUserQuizResults(profile?.id);
  const { data: simResults, refetch: refetchSimResults } = useUserSimulationResults(profile?.id);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[] | null>(null);

  const fetchRecentActivity = useCallback(() => {
    if (!profile?.id) return;
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRecentActivity((data as RecentActivity[]) ?? []);
      });
  }, [profile?.id]);

  useEffect(() => {
    fetchRecentActivity();

    const handleRealtimeUpdate = () => {
      refetchModules();
      refetchQuizzes();
      refetchSimulations();
      refetchProgress();
      refetchBadges();
      refetchQuizResults();
      refetchSimResults();
      refreshProfile();
      fetchRecentActivity();
    };

    window.addEventListener("cyberguard:progress-updated", handleRealtimeUpdate);
    window.addEventListener("cyberguard:activity-logged", handleRealtimeUpdate);
    window.addEventListener("focus", handleRealtimeUpdate);

    if (!profile?.id) return;
    const channel = supabase
      .channel(`dashboard-activity-channel-${profile.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        () => {
          handleRealtimeUpdate();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("cyberguard:progress-updated", handleRealtimeUpdate);
      window.removeEventListener("cyberguard:activity-logged", handleRealtimeUpdate);
      window.removeEventListener("focus", handleRealtimeUpdate);
      supabase.removeChannel(channel);
    };
  }, [
    profile?.id,
    fetchRecentActivity,
    refetchModules,
    refetchQuizzes,
    refetchSimulations,
    refetchProgress,
    refetchBadges,
    refetchQuizResults,
    refetchSimResults,
    refreshProfile,
  ]);

  const completedModules = progress?.filter((p) => p.is_completed).length ?? 0;
  const quizzesCompleted = new Set((quizResults ?? []).map((r) => r.quiz_id)).size;
  const simulationsCompleted = new Set((simResults ?? []).map((r) => r.simulation_id)).size;
  const badgesEarned = badges?.length ?? 0;
  const drillsPassed = quizzesCompleted + simulationsCompleted;

  const streakDays = useMemo(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_streak_${profile?.id}`);
      return saved ? parseInt(saved, 10) : (profile?.streak_days ?? 1);
    } catch {
      return profile?.streak_days ?? 1;
    }
  }, [profile?.id, profile?.streak_days]);

  // Calculate Next Up / Resume Module
  const nextUp = useMemo(() => {
    if (!modules || modules.length === 0) return null;
    const completedSet = new Set((progress ?? []).filter((p) => p.is_completed).map((p) => p.module_id));
    const nextMod = modules.find((m) => !completedSet.has(m.id));
    return nextMod || modules[0];
  }, [modules, progress]);

  // Dynamic simulation score lookup map by slug
  const simScoreBySlug = useMemo(() => {
    const map = new Map<string, number>();
    if (!allSimulations || !simResults) return map;
    for (const res of simResults) {
      const sim = allSimulations.find((s) => s.id === res.simulation_id);
      if (sim?.slug) {
        const cur = map.get(sim.slug) ?? 0;
        map.set(sim.slug, Math.max(cur, res.score));
      }
    }
    return map;
  }, [allSimulations, simResults]);

  // Dynamic quiz score lookup map by module_id
  const quizScoreByModuleId = useMemo(() => {
    const map = new Map<string, number>();
    if (!allQuizzes || !quizResults) return map;
    for (const res of quizResults) {
      const quiz = allQuizzes.find((q) => q.id === res.quiz_id);
      if (quiz?.module_id) {
        const pct = Math.round((res.score / (res.total_questions || 1)) * 100);
        const cur = map.get(quiz.module_id) ?? 0;
        map.set(quiz.module_id, Math.max(cur, pct));
      }
    }
    return map;
  }, [allQuizzes, quizResults]);

  // Dynamic Defense Vectors based on actual user progress, quiz scores, and simulation results
  const DEFENSE_VECTORS: DefenseVector[] = useMemo(() => {
    // 1. Phishing & Fake Links
    const phishingMod = modules?.find(
      (m) => m.slug === "phishing-awareness" || m.slug?.includes("phishing") || m.category?.toLowerCase().includes("social")
    );
    const phishingProg = progress?.find((p) => p.module_id === phishingMod?.id);
    const phishingLessonsDone = phishingProg?.completed_lessons?.length ?? 0;
    const phishingSimScore = Math.max(
      simScoreBySlug.get("phishing-email") ?? 0,
      simScoreBySlug.get("quishing") ?? 0
    );
    const phishingQuizScore = quizScoreByModuleId.get(phishingMod?.id ?? "") ?? 0;

    let phishingScore = 0;
    if (phishingSimScore > 0) phishingScore += Math.round((phishingSimScore / 100) * 50);
    if (phishingProg?.is_completed) phishingScore += 35;
    else if (phishingLessonsDone > 0) phishingScore += Math.min(30, phishingLessonsDone * 12);
    if (phishingQuizScore > 0) phishingScore += Math.round((phishingQuizScore / 100) * 15);
    phishingScore = Math.min(100, phishingScore);

    // 2. Password Hygiene & MFA
    const pwdMod = modules?.find(
      (m) => m.slug === "password-account-security" || m.slug?.includes("password") || m.category?.toLowerCase().includes("auth")
    );
    const pwdProg = progress?.find((p) => p.module_id === pwdMod?.id);
    const pwdLessonsDone = pwdProg?.completed_lessons?.length ?? 0;
    const pwdQuizScore = quizScoreByModuleId.get(pwdMod?.id ?? "") ?? 0;

    let pwdScore = 0;
    if (pwdProg?.is_completed) pwdScore += 50;
    else if (pwdLessonsDone > 0) pwdScore += Math.min(45, pwdLessonsDone * 20);
    if (pwdQuizScore > 0) pwdScore += Math.round((pwdQuizScore / 100) * 50);
    pwdScore = Math.min(100, pwdScore);

    // 3. SMS & Call Scams
    const callSimScore = Math.max(
      simScoreBySlug.get("social-engineering-call") ?? 0,
      simScoreBySlug.get("upi-collect") ?? 0
    );
    const incidentMod = modules?.find(
      (m) => m.slug === "incident-response" || m.slug?.includes("incident") || m.category?.toLowerCase().includes("operations")
    );
    const incidentProg = progress?.find((p) => p.module_id === incidentMod?.id);
    const incidentLessonsDone = incidentProg?.completed_lessons?.length ?? 0;

    let smsScore = 0;
    if (callSimScore > 0) smsScore += Math.round((callSimScore / 100) * 60);
    if (incidentProg?.is_completed) smsScore += 40;
    else if (incidentLessonsDone > 0) smsScore += Math.min(30, incidentLessonsDone * 15);
    smsScore = Math.min(100, smsScore);

    // 4. Social Engineering & AI / Malware
    const threatSimScore = Math.max(
      simScoreBySlug.get("ransomware-response") ?? 0,
      simScoreBySlug.get("mitm-attack") ?? 0
    );
    const fundMod = modules?.find((m) => m.slug === "cybersecurity-fundamentals");
    const fundProg = progress?.find((p) => p.module_id === fundMod?.id);
    const fundLessonsDone = fundProg?.completed_lessons?.length ?? 0;

    const malMod = modules?.find((m) => m.slug === "malware-ransomware" || m.slug?.includes("malware"));
    const malProg = progress?.find((p) => p.module_id === malMod?.id);
    const malLessonsDone = malProg?.completed_lessons?.length ?? 0;

    const fundQuizScore = quizScoreByModuleId.get(fundMod?.id ?? "") ?? 0;

    let socialScore = 0;
    if (threatSimScore > 0) socialScore += Math.round((threatSimScore / 100) * 45);
    if (malProg?.is_completed || fundProg?.is_completed) socialScore += 35;
    else if ((malLessonsDone + fundLessonsDone) > 0) {
      socialScore += Math.min(30, (malLessonsDone + fundLessonsDone) * 10);
    }
    if (fundQuizScore > 0) socialScore += Math.round((fundQuizScore / 100) * 20);
    socialScore = Math.min(100, socialScore);

    return [
      {
        id: "phishing",
        name: "Phishing & Fake Links",
        icon: <Mail className="h-4 w-4" />,
        score: phishingScore,
        status: phishingScore >= 80 ? "Fortified" : phishingScore >= 50 ? "Solid" : "Moderate",
        tone: "cyan",
        link: "/simulations/phishing-email",
      },
      {
        id: "passwords",
        name: "Password Hygiene & MFA",
        icon: <Key className="h-4 w-4" />,
        score: pwdScore,
        status: pwdScore >= 80 ? "Fortified" : pwdScore >= 50 ? "Solid" : "Moderate",
        tone: "emerald",
        link: "/tools",
      },
      {
        id: "smishing",
        name: "SMS & Call Scams",
        icon: <Smartphone className="h-4 w-4" />,
        score: smsScore,
        status: smsScore >= 80 ? "Fortified" : smsScore >= 50 ? "Solid" : "Moderate",
        tone: "violet",
        link: "/simulations/social-engineering-call",
      },
      {
        id: "social_eng",
        name: "Social Engineering & AI",
        icon: <Bot className="h-4 w-4" />,
        score: socialScore,
        status: socialScore >= 80 ? "Fortified" : socialScore >= 50 ? "Solid" : "Moderate",
        tone: "amber",
        link: "/training",
      },
    ];
  }, [modules, progress, quizScoreByModuleId, simScoreBySlug]);

  // Dynamic Safety Score (0 for fresh accounts, calculated from vector preparedness + drill milestones)
  const score = useMemo(() => {
    if (profile?.awareness_score && profile.awareness_score > 0) {
      return profile.awareness_score;
    }
    if (!DEFENSE_VECTORS || DEFENSE_VECTORS.length === 0) return 0;
    const avgVectorScore = Math.round(
      DEFENSE_VECTORS.reduce((acc, v) => acc + v.score, 0) / DEFENSE_VECTORS.length
    );
    const drillBonus = Math.min(20, drillsPassed * 5);
    return Math.min(100, Math.round(avgVectorScore * 0.8 + drillBonus));
  }, [profile?.awareness_score, DEFENSE_VECTORS, drillsPassed]);

  const totalModules = modules?.length || 6;
  const overallPct = Math.round((completedModules / totalModules) * 100);

  const scoreTone: "emerald" | "amber" | "danger" =
    score >= 80 ? "emerald" : score >= 50 ? "amber" : "danger";
  const scoreLabel =
    score >= 80 ? "Fortified" : score >= 50 ? "Solid" : score > 0 ? "Developing" : "Untrained";

  const QUICK_SHORTCUTS = [
    {
      to: "/training",
      title: "Academy Lessons",
      description: "Structured defense courses",
      icon: <BookOpen className="h-4 w-4" />,
      badge: "Courses",
      iconStyle: "text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
      badgeStyle: "text-sky-500 dark:text-sky-400",
      hoverBorder: "hover:border-sky-500/40",
    },
    {
      to: "/simulations",
      title: "Threat Sandboxes",
      description: "Interactive attack drills",
      icon: <Target className="h-4 w-4" />,
      badge: "Drills",
      iconStyle: "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
      badgeStyle: "text-violet-500 dark:text-violet-400",
      hoverBorder: "hover:border-violet-500/40",
    },
    {
      to: "/tools",
      title: "Defense Tools",
      description: "Password & URL safety tools",
      icon: <Wrench className="h-4 w-4" />,
      badge: "Utilities",
      iconStyle: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
      badgeStyle: "text-emerald-500 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-500/40",
    },
    {
      to: "/threats",
      title: "Threat Intelligence",
      description: "Live advisories & attack patterns",
      icon: <Radio className="h-4 w-4" />,
      badge: "Intel",
      iconStyle: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
      badgeStyle: "text-amber-500 dark:text-amber-400",
      hoverBorder: "hover:border-amber-500/40",
    },
  ];

  const getActivityConfig = (action: string) => {
    switch (action) {
      case "lesson_completed":
        return {
          label: "Completed defense module",
          icon: <BookOpen className="h-3.5 w-3.5" />,
          style: "text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
        };
      case "quiz_completed":
        return {
          label: "Passed threat quiz",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          style: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        };
      case "simulation_completed":
        return {
          label: "Neutralized simulation",
          icon: <Target className="h-3.5 w-3.5" />,
          style: "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
        };
      case "assessment_completed":
        return {
          label: "Completed audit drill",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
          style: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        };
      case "badge_earned":
        return {
          label: "Unlocked defense badge",
          icon: <Award className="h-3.5 w-3.5" />,
          style: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
        };
      default:
        return {
          label: "Security milestone completed",
          icon: <Activity className="h-3.5 w-3.5" />,
          style: "text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto pb-10">
      {/* ── 1. MINIMAL HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-elevated border border-border shadow-sm">
              <CyberGuardLogoMark size={32} pulse={true} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-text-ash">
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide flex items-center gap-1 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Shield Active
                </span>
                <span>•</span>
                <span>{timeGreeting()}</span>
                <span>•</span>
                <span className="text-text-pure font-semibold font-mono">
                  {t("common.level", "Level")} {profile?.level ?? 1}
                </span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-text-pure">
                {t("dashboard.welcome", "Welcome back")}, {profile?.full_name ?? "Member"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Minimal Streak Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs">
              <Flame className="h-4 w-4 text-amber-500" />
              <span className="font-bold text-amber-500 font-mono text-xs">{streakDays}</span>
              <span className="text-text-ash text-xs">Day Streak</span>
            </div>

            <Button
              to="/training"
              variant="primary"
              size="sm"
              icon={<BookOpen className="h-4 w-4" />}
            >
              Start Training
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. ESSENTIAL VITALS (4 MINIMAL STAT CARDS) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Safety Score */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-ash uppercase tracking-wider">Safety Score</span>
            <Pill tone={scoreTone} size="sm">
              {scoreLabel}
            </Pill>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-pure">
              <AnimatedNumber value={score} />
            </span>
            <span className="text-xs text-text-ash font-mono font-medium">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-text-fog">
            {score === 0 ? "Complete lessons or drills to calibrate" : "Overall defense rating"}
          </p>
        </Card>

        {/* Metric 2: Academy Progress */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-ash uppercase tracking-wider">Lessons</span>
            <span className="text-xs font-bold text-sky-500 dark:text-sky-400 font-mono">{overallPct}%</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-pure">
              {completedModules}
            </span>
            <span className="text-xs text-text-ash font-mono font-medium">/ {totalModules} modules</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={overallPct} tone="cyan" />
          </div>
        </Card>

        {/* Metric 3: Practical Drills */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-ash uppercase tracking-wider">Drills Passed</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-500 dark:text-violet-400">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-pure">
              {drillsPassed}
            </span>
            <span className="text-xs text-text-ash font-mono font-medium">completed</span>
          </div>
          <p className="mt-1 text-xs text-text-fog">Simulations &amp; quizzes cleared</p>
        </Card>

        {/* Metric 4: Defense Level & XP */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-ash uppercase tracking-wider">Rank &amp; XP</span>
            <Pill tone="amber" size="sm">
              Level {profile?.level ?? 1}
            </Pill>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-2xl sm:text-3xl font-bold text-text-pure">
              {profile?.points ?? 0}
            </span>
            <span className="text-xs text-amber-500 dark:text-amber-400 font-mono font-medium">XP</span>
          </div>
          <p className="mt-1 text-xs text-text-fog">{badgesEarned} security badges unlocked</p>
        </Card>
      </div>

      {/* ── 3. PRIMARY ACTION: CONTINUE LEARNING ── */}
      {nextUp && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-surface to-surface p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_4px_16px_rgba(56,189,248,0.25)]">
              <Play className="h-5 w-5 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-sky-500 dark:text-sky-400 font-bold uppercase tracking-wider font-mono">
                <span>Next Defense Module</span>
                <span>•</span>
                <span className="text-text-ash capitalize">{nextUp.category?.replace(/_/g, " ")}</span>
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-text-pure mt-0.5">
                {nextUp.title}
              </h2>
              <p className="text-xs text-text-fog line-clamp-1 mt-0.5">
                {nextUp.description || "Continue your defensive curriculum to fortify against real-world threats."}
              </p>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <Button
              to={`/training/${nextUp.slug}`}
              variant="primary"
              size="sm"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Resume Lesson
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── 4. TWO-COLUMN BALANCED WORKSPACE ── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Defense Vectors Readiness (7 Cols) */}
        <Card className="lg:col-span-7 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-text-pure">Core Defense Vectors</h2>
                <p className="text-xs text-text-ash">Your personal preparedness across key attack vectors</p>
              </div>
              <Link to="/assessment" className="text-xs font-semibold text-sky-500 dark:text-sky-400 hover:underline">
                Full Audit Drill &rarr;
              </Link>
            </div>

            <div className="space-y-3.5 my-4">
              {DEFENSE_VECTORS.map((v) => {
                const vectorTheme = {
                  cyan: {
                    icon: "text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25",
                    tone: "cyan" as const,
                    linkHover: "hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-500/40",
                  },
                  emerald: {
                    icon: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
                    tone: "emerald" as const,
                    linkHover: "hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/40",
                  },
                  violet: {
                    icon: "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
                    tone: "violet" as const,
                    linkHover: "hover:text-violet-500 dark:hover:text-violet-400 hover:border-violet-500/40",
                  },
                  amber: {
                    icon: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
                    tone: "amber" as const,
                    linkHover: "hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40",
                  },
                }[v.tone];

                return (
                  <div key={v.id} className="p-3 rounded-xl bg-surface-elevated border border-border">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg border", vectorTheme.icon)}>
                          {v.icon}
                        </div>
                        <span className="font-semibold text-text-pure text-xs">{v.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-pure text-xs font-mono">{v.score}%</span>
                        <Link
                          to={v.link}
                          className={cn("px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-surface border border-border text-text-pure transition-colors", vectorTheme.linkHover)}
                        >
                          Practice &rarr;
                        </Link>
                      </div>
                    </div>
                    <ProgressBar value={v.score} tone={vectorTheme.tone} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-ash">
            <span>Preparedness scores update dynamically as you complete lessons &amp; drills.</span>
            <Link to="/training" className="font-semibold text-sky-500 dark:text-sky-400 hover:underline shrink-0">
              Browse Topics &rarr;
            </Link>
          </div>
        </Card>

        {/* Right: Quick Access Hub & Recent Activity (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Access Shortcuts */}
          <Card className="p-5">
            <div className="pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-text-pure">Quick Defense Hub</h2>
              <p className="text-xs text-text-ash">Direct shortcuts to primary learning areas</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              {QUICK_SHORTCUTS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "p-3 rounded-xl bg-surface-elevated border border-border hover:bg-surface-hover transition-all group flex flex-col justify-between",
                    item.hoverBorder
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border group-hover:scale-105 transition-transform", item.iconStyle)}>
                      {item.icon}
                    </div>
                    <span className={cn("text-[10px] font-bold transition-colors font-mono", item.badgeStyle)}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <h3 className="font-bold text-xs text-text-pure group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-text-fog line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Activity Stream */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-sm font-bold text-text-pure">Recent Activity</h2>
                <p className="text-[11px] text-text-ash">Latest drills, lessons &amp; badges</p>
              </div>
              <Link to="/progress" className="text-xs font-semibold text-sky-500 dark:text-sky-400 hover:underline">
                View History &rarr;
              </Link>
            </div>

            <div className="mt-3">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((act) => {
                    const conf = getActivityConfig(act.action);
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated text-xs border border-border"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border", conf.style)}>
                            {conf.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text-pure truncate text-xs">{conf.label}</p>
                            <p className="text-[10px] text-text-ash">{relativeTime(act.created_at)}</p>
                          </div>
                        </div>
                        {act.points_earned > 0 && (
                          <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 font-mono shrink-0">
                            +{act.points_earned} XP
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border text-text-ash mb-2">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-medium text-text-pure">No recent activity logged</p>
                  <p className="text-[11px] text-text-ash mt-0.5">
                    Start a training module to begin building your defense streak.
                  </p>
                  <Button to="/training" variant="secondary" size="xs" className="mt-3">
                    Start First Lesson
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
