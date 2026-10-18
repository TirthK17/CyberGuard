import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useModules, useUserProgress, useUserBadges, useUserQuizResults, useUserSimulationResults } from "@/hooks/useContent";
import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/gamification";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";

interface RecentActivity {
  id: string;
  action: string;
  meta: Record<string, unknown>;
  points_earned: number;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: string }> = {
  lesson_completed:      { label: "Completed defense module", icon: "ti-shield" },
  quiz_completed:        { label: "Passed threat quiz",       icon: "ti-clipboard-check" },
  simulation_completed:  { label: "Neutralized simulation",   icon: "ti-target" },
  assessment_completed:  { label: "Completed audit drill",    icon: "ti-certificate" },
  badge_earned:          { label: "Unlocked defense badge",   icon: "ti-award" },
};

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

/* ─────────────────────────────────────────────────────────────────────────────
   5 VECTORS OF PERSONAL CYBER DEFENSE
───────────────────────────────────────────────────────────────────────────── */
interface DefenseVector {
  id: string;
  name: string;
  icon: string;
  score: number;
  status: "Fortified" | "Solid" | "Moderate" | "Vulnerable";
  statusTone: "success" | "cyan" | "warn" | "danger";
  drillLink: string;
  drillLabel: string;
}

const DEFENSE_VECTORS: DefenseVector[] = [
  {
    id: "phishing",
    name: "Fake Emails & Links",
    icon: "ti-mail-bolt",
    score: 92,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/simulations/phishing-email",
    drillLabel: "Practice",
  },
  {
    id: "passwords",
    name: "Password Habits",
    icon: "ti-key",
    score: 88,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/tools",
    drillLabel: "Check",
  },
  {
    id: "smishing",
    name: "Scam Texts & Calls",
    icon: "ti-device-mobile-message",
    score: 75,
    status: "Solid",
    statusTone: "cyan",
    drillLink: "/simulations/social-engineering-call",
    drillLabel: "Practice",
  },
  {
    id: "social_eng",
    name: "AI & Impersonation Scams",
    icon: "ti-robot",
    score: 64,
    status: "Moderate",
    statusTone: "warn",
    drillLink: "/training/social-engineering",
    drillLabel: "Learn",
  },
  {
    id: "malware",
    name: "Viruses & Suspicious Files",
    icon: "ti-file-lock",
    score: 80,
    status: "Solid",
    statusTone: "cyan",
    drillLink: "/simulations/ransomware-response",
    drillLabel: "Practice",
  },
  {
    id: "wifi_mitm",
    name: "Safe Public Wi-Fi",
    icon: "ti-wifi",
    score: 85,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/simulations/mitm-attack",
    drillLabel: "Practice",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ACTIVE REAL-WORLD THREAT RADAR NOTICES
───────────────────────────────────────────────────────────────────────────── */
const ACTIVE_THREAT_NOTICES = [
  {
    id: "thr-1",
    severity: "critical",
    category: "Mobile Smishing",
    title: "Fake Traffic Fine / E-Challan APK SMS Wave",
    description: "Automated SMS messages claim an unpaid traffic violation with link to install an APK file that steals all incoming SMS OTPs and banking passwords.",
    action: "Never install Android .apk files from SMS links. Pay tickets only on official government portals.",
  },
  {
    id: "thr-2",
    severity: "high",
    category: "AI Social Engineering",
    title: "AI Voice Cloning Emergency Scam Alert",
    description: "Fraudsters scrape 3-second audio snippets from social videos to generate synthetic distress calls impersonating children or siblings asking for instant bail/medical cash.",
    action: "Establish a private family safe-word and call their verified phone number before sending money.",
  },
  {
    id: "thr-3",
    severity: "elevated",
    category: "Credential Stuffing",
    title: "Compromised Corporate & Personal Email Logs",
    description: "Recent stealer malware dumps have leaked millions of browser-stored credentials across streaming and utility accounts.",
    action: "Ensure your primary email has app-based 2FA enabled and does not share passwords with other websites.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: USER DASHBOARD PAGE
───────────────────────────────────────────────────────────────────────────── */
export function UserDashboardPage() {
  const { profile } = useAuth();
  const { data: modules } = useModules();
  const { data: progress } = useUserProgress(profile?.id);
  const { data: badges } = useUserBadges(profile?.id);
  const { data: quizResults } = useUserQuizResults(profile?.id);
  const { data: simResults } = useUserSimulationResults(profile?.id);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[] | null>(null);

  // Daily Scenario Drill State
  const [dailyAnswered, setDailyAnswered] = useState<boolean>(false);
  const [dailySelectedOpt, setDailySelectedOpt] = useState<number | null>(null);
  const [showSosGuide, setShowSosGuide] = useState<boolean>(false);

  // Quick Mini-Tool States
  const [quickPass, setQuickPass] = useState("");
  const [quickUrl, setQuickUrl] = useState("");
  const [urlScanResult, setUrlScanResult] = useState<string | null>(null);
  const [activeQuickTool, setActiveQuickTool] = useState<"password" | "link">("password");
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(null);

  const toast = useToast();

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
    return () => { active = false; };
  }, [profile?.id]);

  const completedModules = progress?.filter((p) => p.is_completed).length ?? 0;
  const quizzesCompleted = new Set((quizResults ?? []).map((r) => r.quiz_id)).size;
  const simulationsCompleted = new Set((simResults ?? []).map((r) => r.simulation_id)).size;
  const badgesEarned = badges?.length ?? 0;

  // Learning Paths Filter
  const [learningPath, setLearningPath] = useState<"all" | "student" | "employee" | "senior">("all");

  // Daily Streak State
  const [streakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_streak_${profile?.id}`);
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [streakCompletedToday] = useState<boolean>(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      return localStorage.getItem(`cyberguard_streak_done_${profile?.id}_${today}`) === "true";
    } catch {
      return false;
    }
  });

  // Calculate Next Up / Resume Module
  const nextUp = useMemo(() => {
    if (!modules || modules.length === 0) return null;
    const completedSet = new Set((progress ?? []).filter((p) => p.is_completed).map((p) => p.module_id));
    const nextMod = modules.find((m) => !completedSet.has(m.id));
    return nextMod || modules[0];
  }, [modules, progress]);

  // Real or simulated awareness posture score
  const score = profile?.awareness_score && profile.awareness_score > 0 ? profile.awareness_score : 84;
  const totalModules = modules?.length || 6;
  const overallPct = Math.round((completedModules / totalModules) * 100);

  // Daily Challenge submission
  const handleDailyAnswer = async (optIdx: number) => {
    if (dailyAnswered) return;
    setDailySelectedOpt(optIdx);
    setDailyAnswered(true);

    if (optIdx === 1) { // Correct option
      toast({
        title: "Tactical Defense Confirmed!",
        description: "+25 Defense XP awarded to your security profile.",
        variant: "success",
      });
      if (profile?.id) {
        await recordActivity({
          userId: profile.id,
          action: "simulation_completed",
          points: 25,
          meta: { scenario: "daily_courier_smishing_drill" },
        });
      }
    } else {
      toast({
        title: "Vulnerable Choice!",
        description: "Review the threat breakdown below to spot this lure next time.",
        variant: "error",
      });
    }
  };

  // Quick URL scanner
  const handleQuickUrlScan = () => {
    if (!quickUrl.trim()) return;
    const lower = quickUrl.toLowerCase();
    const suspiciousTlds = [".xyz", ".top", ".me", ".tk", ".ml", ".ga", ".cf", ".click", ".work", ".info"];
    const hasSuspiciousTld = suspiciousTlds.some((tld) => lower.includes(tld));
    const isIp = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower);
    const hasTyposquat = lower.includes("paypa1") || lower.includes("goog1e") || lower.includes("micros0ft") || lower.includes("chase-verify");

    if (isIp || hasTyposquat || hasSuspiciousTld) {
      setUrlScanResult("MALICIOUS / HIGH RISK: Detected suspicious domain pattern, deceptive typosquatting, or untrusted TLD.");
    } else {
      setUrlScanResult("NO IMMEDIATE RED FLAGS: Standard format, but always verify sender authenticity before entering credentials.");
    }
  };

  // Quick Password Entropy Calculation
  const getPasswordStrengthLabel = (pwd: string) => {
    if (!pwd) return null;
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;
    const entropy = Math.round(pwd.length * Math.log2(pool || 1));

    if (entropy < 40) return { text: "Weak • Crackable in seconds", tone: "danger" };
    if (entropy < 65) return { text: "Moderate • Crackable in hours/days", tone: "warn" };
    return { text: "Fortified • Centuries to crack", tone: "success" };
  };

  const pwdAnalysis = getPasswordStrengthLabel(quickPass);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* ── 1. WELCOME & STATUS BAR ── */}
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
                <span className="text-text-pure font-semibold font-mono">Level {profile?.level ?? 1}</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-text-pure">
                Welcome back, {profile?.full_name ?? "Member"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Daily Streak Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                <i className="ti ti-flame text-sm" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-500 font-mono text-[11px]">{streakDays} Days</span>
                  <span className="text-[10px] text-text-ash">Streak</span>
                </div>
                <p className="text-[10px] text-text-fog leading-none">
                  {streakCompletedToday ? "Active today" : "Complete 1 drill"}
                </p>
              </div>
            </div>

            <a
              href="#daily-drill"
              className="relative inline-flex items-center justify-center gap-2 select-none font-medium transition-all duration-150 ease-out px-3 py-1 text-xs font-semibold rounded-lg bg-surface-elevated border border-border text-text-pure shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-surface-hover hover:border-border-strong cursor-pointer"
            >
              <i className="ti ti-target" aria-hidden="true" />
              <span>Daily Quiz</span>
            </a>
            <Button to="/tools" variant="secondary" size="xs" icon={<i className="ti ti-tools" aria-hidden="true" />}>
              Tools
            </Button>
            <button
              onClick={() => setShowSosGuide(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ti ti-sos text-sm" /> SOS Checklist
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── EMERGENCY SOS MODAL DIALOG ── */}
      <AnimatePresence>
        {showSosGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSosGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl border border-danger/30 bg-surface p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-danger/20">
                <div className="flex items-center gap-2.5 text-danger font-bold text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/15 text-danger">
                    <i className="ti ti-alert-triangle text-base" />
                  </div>
                  <span>EMERGENCY CHECKLIST: SUSPECT A SCAM OR HACK?</span>
                </div>
                <button
                  onClick={() => setShowSosGuide(false)}
                  className="p-1 rounded-lg text-text-ash hover:text-text-pure transition-colors cursor-pointer"
                >
                  <i className="ti ti-x text-base" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-[11px] font-bold text-danger uppercase tracking-wider">01. Disconnect</span>
                  <p className="font-bold text-text-pure mt-1">Turn Off Wi-Fi &amp; Cellular</p>
                  <p className="text-text-fog mt-1 leading-relaxed">Stop active data exfiltration or remote control tools instantly.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-[11px] font-bold text-danger uppercase tracking-wider">02. Second Device</span>
                  <p className="font-bold text-text-pure mt-1">Reset Master Passwords</p>
                  <p className="text-text-fog mt-1 leading-relaxed">Use a clean secondary device to update your email &amp; banking passwords.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-[11px] font-bold text-danger uppercase tracking-wider">03. Sign Out</span>
                  <p className="font-bold text-text-pure mt-1">Log Out Everywhere</p>
                  <p className="text-text-fog mt-1 leading-relaxed">In Google/Apple account security, terminate all other active sessions.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-elevated border border-border">
                  <span className="text-[11px] font-bold text-danger uppercase tracking-wider">04. Call Bank</span>
                  <p className="font-bold text-text-pure mt-1">Freeze Affected Accounts</p>
                  <p className="text-text-fog mt-1 leading-relaxed">Dial the official number on your card or call national cyber helpline 1930.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"
                >
                  <i className="ti ti-phone text-xs" /> Dial 1930 Helpline
                </a>
                <Button variant="secondary" size="xs" onClick={() => setShowSosGuide(false)}>
                  Close Checklist
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CONTINUE WHERE YOU LEFT OFF CARD ── */}
      {nextUp && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-surface to-surface p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
              <i className="ti ti-player-play text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-primary font-bold uppercase tracking-wider">
                <span>Continue Where You Left Off</span>
                <span>•</span>
                <span className="text-text-ash capitalize">{nextUp.category?.replace(/_/g, " ")}</span>
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-text-pure mt-0.5">
                {nextUp.title}
              </h2>
              <p className="text-xs text-text-fog line-clamp-1 mt-0.5">
                {nextUp.description || "Resume your defensive training curriculum and fortify your awareness."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Button
              to={`/training/${nextUp.slug}`}
              variant="primary"
              size="sm"
              icon={<i className="ti ti-arrow-right" />}
            >
              Resume Module
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── 2. QUICK-START ROADMAP RIBBON ── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              Quick Start
            </span>
            <h2 className="text-sm font-bold text-text-pure">
              3 Core Safety Drills to Try First
            </h2>
          </div>
          <span className="text-[11px] text-text-ash">&lt; 5 mins total • 100% Safe Sandbox</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to="/simulations/phishing-email"
            className="p-3 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all group flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary mb-0.5">
                <span>STEP 01</span>
                <span>•</span>
                <span className="text-text-ash">Email</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-text-pure truncate">Phishing Mail Game</h3>
              <p className="text-[11px] text-text-fog truncate mt-0.5">Spot 4 hidden cues in fake email</p>
            </div>
            <i className="ti ti-arrow-right text-text-ash group-hover:text-primary group-hover:translate-x-0.5 transition-all text-sm shrink-0" />
          </Link>

          <Link
            to="/simulations/social-engineering-call"
            className="p-3 rounded-xl bg-surface border border-border hover:border-cyan-500/50 transition-all group flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-500 mb-0.5">
                <span>STEP 02</span>
                <span>•</span>
                <span className="text-text-ash">Mobile</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-text-pure truncate">Fake Bank SMS Test</h3>
              <p className="text-[11px] text-text-fog truncate mt-0.5">Inspect phone OTP scam trap</p>
            </div>
            <i className="ti ti-arrow-right text-text-ash group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all text-sm shrink-0" />
          </Link>

          <Link
            to="/tools"
            className="p-3 rounded-xl bg-surface border border-border hover:border-emerald-500/50 transition-all group flex items-center justify-between"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 mb-0.5">
                <span>STEP 03</span>
                <span>•</span>
                <span className="text-text-ash">Passwords</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-text-pure truncate">Password Crack Test</h3>
              <p className="text-[11px] text-text-fog truncate mt-0.5">Test compute guess time</p>
            </div>
            <i className="ti ti-arrow-right text-text-ash group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all text-sm shrink-0" />
          </Link>
        </div>
      </div>

      {/* ── LEARNING PATH CURRICULUM SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Tailored Cybersecurity Tracks</span>
          <h2 className="text-sm sm:text-base font-bold text-text-pure">Select Your Persona Learning Path</h2>
          <p className="text-xs text-text-fog mt-0.5">Prioritizes threats and simulations most relevant to your daily routine.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border text-xs">
          {[
            { id: "all", label: "General" },
            { id: "student", label: "Student" },
            { id: "employee", label: "Office / Enterprise" },
            { id: "senior", label: "Senior Citizen" },
          ].map((path) => (
            <button
              key={path.id}
              onClick={() => {
                setLearningPath(path.id as "all" | "student" | "employee" | "senior");
                toast({ title: `Filtered curriculum for ${path.label}`, variant: "info" });
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                learningPath === path.id
                  ? "bg-primary text-white shadow-xs font-semibold"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              {path.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. DEFENSE POSTURE OVERVIEW (SCORE + 6-VECTOR MATRIX) ── */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Overall Score Card (4 Cols) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-pure uppercase tracking-wider">Overall Safety Score</span>
              <Pill tone={score >= 75 ? "success" : score >= 50 ? "warn" : "danger"} size="sm">
                {score >= 75 ? "Well Protected" : score >= 50 ? "Fair" : "Practice Needed"}
              </Pill>
            </div>
            <p className="text-xs text-text-fog mt-1">
              Combined safety index from lessons, simulations &amp; quizzes.
            </p>
          </div>

          <div className="my-3 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
                <circle cx="50" cy="50" r={40} fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="7" />
                <circle
                  cx="50" cy="50" r={40} fill="none"
                  stroke="var(--color-primary)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (score / 100) * (2 * Math.PI * 40)}
                />
              </svg>
              <div className="absolute text-center">
                <div className="font-display text-2xl font-bold text-text-pure leading-none">
                  <AnimatedNumber value={score} />
                </div>
                <div className="text-[10px] text-text-ash font-medium mt-0.5">/ 100 PTS</div>
              </div>
            </div>
          </div>

          {/* 2x2 Metric Grid */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs">
            <div className="p-2 rounded-lg bg-surface-elevated border border-border flex flex-col">
              <span className="text-[11px] text-text-ash">Lessons</span>
              <span className="font-bold text-primary mt-0.5">{overallPct}% ({completedModules}/{totalModules})</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-elevated border border-border flex flex-col">
              <span className="text-[11px] text-text-ash">Simulations</span>
              <span className="font-bold text-text-pure mt-0.5">{simulationsCompleted + completedModules}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-elevated border border-border flex flex-col">
              <span className="text-[11px] text-text-ash">Quizzes</span>
              <span className="font-bold text-text-pure mt-0.5">{quizzesCompleted}</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-elevated border border-border flex flex-col">
              <span className="text-[11px] text-text-ash">Badges</span>
              <span className="font-bold text-text-pure mt-0.5">{badgesEarned}</span>
            </div>
          </div>
        </Card>

        {/* Right: 6-Vector Resilience Matrix in Compact 2-Col Grid (8 Cols) */}
        <Card className="lg:col-span-8 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text-pure">
                Defense Vectors by Category
              </h2>
              <p className="text-xs text-text-ash">
                Real-time preparedness across everyday attack vectors.
              </p>
            </div>
            <Link to="/assessment" className="text-xs font-semibold text-primary hover:underline">
              Take Drill &rarr;
            </Link>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 my-2.5">
            {DEFENSE_VECTORS.map((v) => (
              <div key={v.id} className="p-2.5 rounded-xl bg-surface-elevated border border-border flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <i className={`ti ${v.icon} text-sm text-primary shrink-0`} />
                    <span className="font-semibold text-text-pure truncate text-[11px] sm:text-xs">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-text-pure text-[11px]">{v.score}%</span>
                    <Link
                      to={v.drillLink}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-surface border border-border text-primary hover:bg-primary/10 transition-colors cursor-pointer inline-flex items-center"
                    >
                      {v.drillLabel}
                    </Link>
                  </div>
                </div>
                <ProgressBar value={v.score} />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-ash">
            <span>Tip: Explore interactive lessons to elevate your scores</span>
            <Link to="/training" className="font-semibold text-primary hover:underline flex items-center gap-1">
              Browse Lessons <i className="ti ti-arrow-right text-[10px]" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── 4. DAILY 60-SECOND SCAM SPOTTER WIDGET ── */}
      <div id="daily-drill" className="rounded-2xl border border-primary/20 bg-surface p-5 shadow-sm scroll-mt-20">
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                Daily Scam Spotter (1 Min)
              </span>
              <span className="text-xs text-text-ash font-medium">• +25 XP</span>
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold text-text-pure mt-1">
              Urgent Package Delivery Fee Text (Fake Courier SMS)
            </h3>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <i className="ti ti-device-mobile-message text-lg" />
          </div>
        </div>

        {/* SMS Preview Mockup */}
        <div className="my-3 p-3 rounded-xl bg-surface-elevated border border-border text-xs leading-relaxed flex items-start gap-2.5">
          <i className="ti ti-message text-primary text-base shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-text-pure block text-[11px] text-text-ash">SMS SENDER: USPS-UPDATE</span>
            <p className="text-text-pure mt-0.5">
              &quot;Package #US-91823 has an invalid delivery address. A $1.50 handling fee is required to confirm redelivery: <code className="text-primary font-mono text-[11px] bg-primary/10 px-1 py-0.5 rounded">http://usps-parcel-redelivery.me/confirm</code>&quot;
            </p>
          </div>
        </div>

        {/* Decision Options */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-text-pure">What is your safe action?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              {
                id: 0,
                text: "Click link and pay $1.50 since it's a negligible amount.",
                correct: false,
                reason: "Never pay! The $1.50 fee is a lure to capture your debit card number, CVV, and billing address on a clone portal.",
              },
              {
                id: 1,
                text: "Ignore SMS, open official USPS tracking tool directly to verify.",
                correct: true,
                reason: "Exact correct instinct! Courier services never request redelivery fees via raw SMS links.",
              },
              {
                id: 2,
                text: "Reply to the text with your full home address.",
                correct: false,
                reason: "Dangerous! Replying confirms an active number and provides attackers with personal identity data.",
              },
            ].map((opt) => {
              const isSelected = dailySelectedOpt === opt.id;
              return (
                <button
                  key={opt.id}
                  disabled={dailyAnswered}
                  onClick={() => handleDailyAnswer(opt.id)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer flex flex-col justify-between ${
                    dailyAnswered
                      ? opt.correct
                        ? "border-success bg-success/10 text-success font-semibold"
                        : isSelected
                        ? "border-danger bg-danger/10 text-danger font-semibold"
                        : "border-border bg-surface text-text-ash opacity-50"
                      : "border-border bg-surface-elevated hover:bg-surface hover:border-primary/40 text-text-pure"
                  }`}
                >
                  <span className="leading-snug">{opt.text}</span>
                  {dailyAnswered && isSelected && (
                    <span className="mt-2 text-[11px] font-bold block">
                      {opt.correct ? "✓ Correct Instinct" : "✗ Trap Sprung"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {dailyAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl border border-primary/20 bg-surface-elevated text-xs leading-relaxed"
          >
            <span className="font-bold text-primary block mb-0.5">
              {dailySelectedOpt === 1 ? "✓ Threat Successfully Neutralized" : "⚠️ Scam Vulnerability Identified"}
            </span>
            <p className="text-text-fog">
              Courier phishing scams spike heavily around holidays. Attackers register disposable domains (like <code>.me</code> or <code>.xyz</code>) to impersonate shipping portals. Always use the official mobile app or visit the verified courier portal directly.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── 5. UNIFIED QUICK MINI-TOOLS (TABBED macOS WIDGET) ── */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-text-pure">Quick Security Tools</span>
            <span className="text-xs text-text-ash">• Instant local client checks</span>
          </div>

          <div className="flex items-center rounded-xl bg-surface-elevated p-1 border border-border">
            <button
              onClick={() => setActiveQuickTool("password")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeQuickTool === "password"
                  ? "bg-surface text-text-pure shadow-xs border border-border"
                  : "text-text-ash hover:text-text-pure"
              }`}
            >
              <i className="ti ti-key text-xs text-primary" /> Password Check
            </button>
            <button
              onClick={() => setActiveQuickTool("link")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeQuickTool === "link"
                  ? "bg-surface text-text-pure shadow-xs border border-border"
                  : "text-text-ash hover:text-text-pure"
              }`}
            >
              <i className="ti ti-link text-xs text-primary" /> Link Scanner
            </button>
          </div>
        </div>

        {/* Tab 1: Password Check */}
        {activeQuickTool === "password" && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-text-fog">Test password resilience against offline brute-force clusters:</span>
              <Link to="/tools" className="text-primary hover:underline font-semibold text-xs">
                Open Password Studio &rarr;
              </Link>
            </div>

            <input
              type="text"
              placeholder="Type sample password (e.g. Blue!River#2026)..."
              value={quickPass}
              onChange={(e) => setQuickPass(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-elevated text-text-pure focus:outline-none focus:border-primary font-sans"
            />

            {pwdAnalysis && (
              <div className="p-2.5 rounded-xl border border-border bg-surface text-xs flex items-center justify-between">
                <span className="text-text-ash font-medium">Strength Rating:</span>
                <span className={`font-bold ${
                  pwdAnalysis.tone === "success" ? "text-success" : pwdAnalysis.tone === "warn" ? "text-warn" : "text-danger"
                }`}>
                  {pwdAnalysis.text}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Link Scanner */}
        {activeQuickTool === "link" && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-text-fog">Check suspicious URLs for typosquatting, raw IP targets, or untrusted TLDs:</span>
              <Link to="/tools" className="text-primary hover:underline font-semibold text-xs">
                Open URL Analyzer &rarr;
              </Link>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste link to test (e.g. http://paypa1-account.xyz)..."
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface-elevated text-text-pure focus:outline-none focus:border-primary font-sans"
              />
              <button
                onClick={handleQuickUrlScan}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer shrink-0"
              >
                Scan
              </button>
            </div>

            {urlScanResult && (
              <div className="p-2.5 rounded-xl border border-border bg-surface text-xs text-text-pure leading-relaxed">
                {urlScanResult}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── 6. RECENT WARNINGS & RECENT ACTIVITY (BALANCED FEED) ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Real-World Threat Radar */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
                <h3 className="font-display text-sm font-bold text-text-pure">Active Scam Radar</h3>
              </div>
              <Link to="/threats" className="text-xs font-semibold text-primary hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2.5 mt-3">
              {ACTIVE_THREAT_NOTICES.map((t) => {
                const isExpanded = expandedThreatId === t.id;
                return (
                  <div key={t.id} className="p-3 rounded-xl bg-surface-elevated border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text-pure truncate text-[11px] sm:text-xs">{t.title}</span>
                      <Pill tone={t.severity === "critical" ? "danger" : t.severity === "high" ? "warn" : "info"} size="sm">
                        {t.category}
                      </Pill>
                    </div>
                    <p className="text-text-fog text-[11px] leading-relaxed line-clamp-2">{t.description}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedThreatId(isExpanded ? null : t.id)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <i className={`ti ${isExpanded ? "ti-chevron-up" : "ti-shield"} text-[10px]`} />
                        {isExpanded ? "Hide Rule" : "🛡️ View Safety Rule"}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-1.5 p-2 rounded-lg bg-surface border border-primary/20 text-[11px] text-primary font-medium leading-relaxed">
                        {t.action}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <div>
                <h3 className="font-display text-sm font-bold text-text-pure">Your Recent Activity</h3>
                <p className="text-[11px] text-text-ash">Completed drills, lessons &amp; certifications</p>
              </div>
              <Link to="/progress" className="text-xs font-semibold text-primary hover:underline">
                View Progress &rarr;
              </Link>
            </div>

            <div className="mt-3">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((act) => {
                    const conf = ACTION_CONFIG[act.action] ?? { label: act.action, icon: "ti-activity" };
                    return (
                      <div key={act.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated text-xs border border-border">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                            <i className={`ti ${conf.icon} text-sm`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text-pure truncate text-[11px] sm:text-xs">{conf.label}</p>
                            <p className="text-[10px] text-text-ash">{relativeTime(act.created_at)}</p>
                          </div>
                        </div>
                        {act.points_earned > 0 && (
                          <span className="text-[11px] font-bold text-success shrink-0">
                            +{act.points_earned} XP
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated border border-border text-text-ash mb-1.5">
                    <i className="ti ti-shield text-base" />
                  </div>
                  <p className="text-xs font-medium text-text-pure">No activity logged yet</p>
                  <p className="text-[11px] text-text-ash mt-0.5">Complete a module to start earning Defense XP.</p>
                  <Button to="/training" variant="secondary" size="xs" className="mt-3">
                    Start First Lesson
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

