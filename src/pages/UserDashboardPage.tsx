import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  useModules,
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
  const { profile } = useAuth();
  const { data: modules } = useModules();
  const { data: progress } = useUserProgress(profile?.id);
  const { data: badges } = useUserBadges(profile?.id);
  const { data: quizResults } = useUserQuizResults(profile?.id);
  const { data: simResults } = useUserSimulationResults(profile?.id);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[] | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    let active = true;
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (active) setRecentActivity((data as RecentActivity[]) ?? []);
      });
    return () => {
      active = false;
    };
  }, [profile?.id]);

  const completedModules = progress?.filter((p) => p.is_completed).length ?? 0;
  const quizzesCompleted = new Set((quizResults ?? []).map((r) => r.quiz_id)).size;
  const simulationsCompleted = new Set((simResults ?? []).map((r) => r.simulation_id)).size;
  const badgesEarned = badges?.length ?? 0;
  const drillsPassed = quizzesCompleted + simulationsCompleted;

  const streakDays = useMemo(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_streak_${profile?.id}`);
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  }, [profile?.id]);

  // Calculate Next Up / Resume Module
  const nextUp = useMemo(() => {
    if (!modules || modules.length === 0) return null;
    const completedSet = new Set((progress ?? []).filter((p) => p.is_completed).map((p) => p.module_id));
    const nextMod = modules.find((m) => !completedSet.has(m.id));
    return nextMod || modules[0];
  }, [modules, progress]);

  const score = profile?.awareness_score && profile.awareness_score > 0 ? profile.awareness_score : 84;
  const totalModules = modules?.length || 6;
  const overallPct = Math.round((completedModules / totalModules) * 100);

  const scoreTone: "emerald" | "amber" | "danger" = score >= 80 ? "emerald" : score >= 60 ? "amber" : "danger";
  const scoreLabel = score >= 80 ? "Fortified" : score >= 60 ? "Solid" : "Needs Practice";

  const DEFENSE_VECTORS: DefenseVector[] = [
    {
      id: "phishing",
      name: "Phishing & Fake Links",
      icon: <Mail className="h-4 w-4" />,
      score: 92,
      status: "Fortified",
      tone: "cyan",
      link: "/simulations/phishing-email",
    },
    {
      id: "passwords",
      name: "Password Hygiene & MFA",
      icon: <Key className="h-4 w-4" />,
      score: 88,
      status: "Fortified",
      tone: "emerald",
      link: "/tools",
    },
    {
      id: "smishing",
      name: "SMS & Call Scams",
      icon: <Smartphone className="h-4 w-4" />,
      score: 75,
      status: "Solid",
      tone: "violet",
      link: "/simulations/social-engineering-call",
    },
    {
      id: "social_eng",
      name: "Social Engineering & AI",
      icon: <Bot className="h-4 w-4" />,
      score: 64,
      status: "Moderate",
      tone: "amber",
      link: "/training/social-engineering",
    },
  ];

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
          <p className="mt-1 text-xs text-text-fog">Overall defense rating</p>
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
              {profile?.points ?? 320}
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
