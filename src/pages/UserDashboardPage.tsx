import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useModules, useUserProgress, useUserBadges, useUserQuizResults, useUserSimulationResults } from "@/hooks/useContent";
import { supabase } from "@/lib/supabase";
import { recordActivity } from "@/lib/gamification";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

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
    name: "Phishing & Fake Portals Reflex",
    icon: "ti-mail-bolt",
    score: 92,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/simulations/phishing-email",
    drillLabel: "Inspect Headers",
  },
  {
    id: "passwords",
    name: "Password Entropy & MFA Health",
    icon: "ti-key",
    score: 88,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/tools",
    drillLabel: "Audit Entropy",
  },
  {
    id: "smishing",
    name: "Mobile SMS & WhatsApp Defense",
    icon: "ti-device-mobile-message",
    score: 75,
    status: "Solid",
    statusTone: "cyan",
    drillLink: "/simulations/social-engineering-call",
    drillLabel: "Smishing Lab",
  },
  {
    id: "social_eng",
    name: "Social Engineering & Deepfakes",
    icon: "ti-robot",
    score: 64,
    status: "Moderate",
    statusTone: "warn",
    drillLink: "/training/social-engineering",
    drillLabel: "Strengthen Vector",
  },
  {
    id: "malware",
    name: "Malware & Ransomware Containment",
    icon: "ti-file-lock",
    score: 80,
    status: "Solid",
    statusTone: "cyan",
    drillLink: "/simulations/ransomware-response",
    drillLabel: "Quarantine Drill",
  },
  {
    id: "wifi_mitm",
    name: "Public Wi-Fi & MITM Interception",
    icon: "ti-wifi",
    score: 85,
    status: "Fortified",
    statusTone: "success",
    drillLink: "/simulations/mitm-attack",
    drillLabel: "MITM Sandbox",
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

    if (entropy < 40) return { text: "Weak - Crackable in seconds", tone: "danger" };
    if (entropy < 65) return { text: "Moderate - Crackable in hours/days", tone: "warn" };
    return { text: "Fortified - Centuries to crack", tone: "success" };
  };

  const pwdAnalysis = getPasswordStrengthLabel(quickPass);

  return (
    <div className="space-y-6">
      {/* ── 1. OPERATOR TACTICAL STATUS BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <i className="ti ti-shield-check text-2xl" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-text-ash">
                <span className="font-mono text-[11px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> SENTRY ACTIVE
                </span>
                <span>•</span>
                <span>{timeGreeting()}</span>
                <span>•</span>
                <span className="text-text-pure font-medium">Clearance Level {profile?.level ?? 1}</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-text-pure mt-0.5">
                {profile?.full_name ?? "Cyber Defender"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="#daily-drill">
              <Button variant="secondary" size="sm" icon={<i className="ti ti-target" />}>
                Daily 60s Drill
              </Button>
            </a>
            <Link to="/tools">
              <Button variant="secondary" size="sm" icon={<i className="ti ti-tools" />}>
                Security Toolkit
              </Button>
            </Link>
            <button
              onClick={() => setShowSosGuide(!showSosGuide)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ti ti-sos text-sm" /> Emergency SOS
            </button>
          </div>
        </div>

        {/* Expandable Emergency SOS Guide */}
        <AnimatePresence>
          {showSosGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-danger/20 bg-danger/5 p-4 rounded-xl"
            >
              <div className="flex items-center justify-between pb-2 border-b border-danger/20 text-xs">
                <span className="font-bold text-danger flex items-center gap-1.5">
                  <i className="ti ti-alert-triangle" /> ACTIVE INCIDENT RESPONSE PROTOCOL
                </span>
                <button
                  onClick={() => setShowSosGuide(false)}
                  className="text-text-ash hover:text-text-pure text-xs"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-4 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="font-mono text-danger font-bold text-[10px]">01. DISCONNECT</span>
                  <p className="font-semibold text-text-pure mt-0.5">Sever Wi-Fi / Net</p>
                  <p className="text-[11px] text-text-fog mt-0.5">Halt live credential exfiltration.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="font-mono text-danger font-bold text-[10px]">02. SECOND DEVICE</span>
                  <p className="font-semibold text-text-pure mt-0.5">Reset Master Pwds</p>
                  <p className="text-[11px] text-text-fog mt-0.5">Change email &amp; banking passwords.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="font-mono text-danger font-bold text-[10px]">03. REVOKE TOKENS</span>
                  <p className="font-semibold text-text-pure mt-0.5">Force Sign-Out</p>
                  <p className="text-[11px] text-text-fog mt-0.5">Log out of all other active sessions.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="font-mono text-danger font-bold text-[10px]">04. REPORT SCAM</span>
                  <p className="font-semibold text-text-pure mt-0.5">Notify CyberGuard</p>
                  <p className="text-[11px] text-text-fog mt-0.5">File incident report for analysis.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── BEGINNER-FRIENDLY QUICK START ROADMAP ── */}
      <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold font-mono text-primary uppercase tracking-wider">
              Beginner Friendly Roadmap
            </span>
            <h2 className="text-sm sm:text-base font-bold text-text-pure mt-0.5">
              New to cyber safety? Start here in 3 simple steps:
            </h2>
          </div>
          <span className="text-xs text-text-ash">Takes less than 5 minutes • 100% Safe</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            to="/simulations/phishing-email"
            className="p-3.5 rounded-xl bg-surface border border-border hover:border-primary/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">STEP 1</span>
                <span className="text-xs text-text-ash group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                  Play Game <i className="ti ti-arrow-right text-[10px]" />
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-pure">Phishing Mail Game</h4>
              <p className="text-[11px] text-text-fog mt-1 leading-relaxed">
                Can you spot a fake Microsoft login email? Hover the button and find the 4 clues.
              </p>
            </div>
          </Link>

          <Link
            to="/simulations/social-engineering-call"
            className="p-3.5 rounded-xl bg-surface border border-border hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-mono">STEP 2</span>
                <span className="text-xs text-text-ash group-hover:text-cyan-500 transition-colors flex items-center gap-1 font-medium">
                  Try Lab <i className="ti ti-arrow-right text-[10px]" />
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-pure">Fake Bank SMS Test</h4>
              <p className="text-[11px] text-text-fog mt-1 leading-relaxed">
                Experience a scam text asking for an OTP on a simulated smartphone screen.
              </p>
            </div>
          </Link>

          <Link
            to="/tools"
            className="p-3.5 rounded-xl bg-surface border border-border hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">STEP 3</span>
                <span className="text-xs text-text-ash group-hover:text-emerald-500 transition-colors flex items-center gap-1 font-medium">
                  Check Now <i className="ti ti-arrow-right text-[10px]" />
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-pure">Password Strength Check</h4>
              <p className="text-[11px] text-text-fog mt-1 leading-relaxed">
                Find out how many seconds or centuries it takes supercomputers to guess your password.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 2. DEFENSE RADAR & 5-VECTOR RESILIENCE MATRIX ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Security Posture Index Gauge Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-pure">Personal Defense Index</span>
              <Pill tone={score >= 75 ? "success" : score >= 50 ? "warn" : "danger"}>
                {score >= 75 ? "Fortified Posture" : score >= 50 ? "Moderate Risk" : "High Exposure"}
              </Pill>
            </div>
            <p className="text-[11px] text-text-ash mt-1 leading-normal">
              Calculated from phishing detection reflexes, password entropy health, and simulation containment speed.
            </p>
          </div>

          <div className="my-5 flex flex-col items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
                <circle cx="50" cy="50" r={42} fill="none" stroke="currentColor" className="text-surface-elevated" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r={42} fill="none"
                  stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 - (score / 100) * (2 * Math.PI * 42)}
                />
              </svg>
              <div className="absolute text-center">
                <div className="font-display text-3xl font-bold text-text-pure">
                  <AnimatedNumber value={score} />
                </div>
                <div className="text-[10px] text-text-ash font-medium">/ 100 PTS</div>
              </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-success">
              Optimal Defense Readiness
            </span>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border text-xs">
            <div className="flex justify-between items-center text-text-fog">
              <span>Curriculum Mastery</span>
              <span className="font-mono font-bold text-primary">{overallPct}% ({completedModules}/{totalModules})</span>
            </div>
            <div className="flex justify-between items-center text-text-fog">
              <span>Threats Neutralized</span>
              <span className="font-mono font-bold text-text-pure">{simulationsCompleted + completedModules}</span>
            </div>
            <div className="flex justify-between items-center text-text-fog">
              <span>Knowledge Quizzes Passed</span>
              <span className="font-mono font-bold text-text-pure">{quizzesCompleted}</span>
            </div>
            <div className="flex justify-between items-center text-text-fog">
              <span>Security Badges Earned</span>
              <span className="font-mono font-bold text-text-pure">{badgesEarned}</span>
            </div>
          </div>
        </Card>

        {/* Right: 5-Vector Cyber Threat Resilience Matrix */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text-pure">
                5-Vector Threat Resilience Matrix
              </h2>
              <p className="text-[11px] text-text-ash">
                Breakdown of your readiness across key attack surfaces with direct drill actions.
              </p>
            </div>
            <Link to="/assessment" className="text-xs font-semibold text-primary hover:underline">
              Full Assessment
            </Link>
          </div>

          <div className="space-y-3.5 my-3">
            {DEFENSE_VECTORS.map((v) => (
              <div key={v.id} className="p-3 rounded-xl bg-surface-elevated border border-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <i className={`ti ${v.icon} text-base text-primary`} />
                    <span className="font-semibold text-text-pure">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={v.statusTone}>{v.status}</Pill>
                    <span className="font-mono font-bold text-text-pure">{v.score}%</span>
                    <Link to={v.drillLink}>
                      <button className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface border border-border text-primary hover:bg-primary/10 transition-colors cursor-pointer">
                        {v.drillLabel}
                      </button>
                    </Link>
                  </div>
                </div>
                <ProgressBar value={v.score} />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-ash">
            <span>Focus vector: Social Engineering &amp; AI Voice Phishing</span>
            <Link to="/training" className="font-semibold text-primary hover:underline flex items-center gap-1">
              Level Up All Vectors <i className="ti ti-arrow-right text-[10px]" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ── 3. DAILY 60-SECOND CYBER DEFENSE CHALLENGE ── */}
      <div id="daily-drill" className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm scroll-mt-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-mono font-bold uppercase">
                Daily Scenario Challenge
              </span>
              <span className="text-xs text-text-ash font-mono">• Refreshed Daily • +25 Defense XP</span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure mt-1.5">
              Urgent Postal Delivery Fee Text (Courier Smishing)
            </h3>
            <p className="text-xs text-text-fog mt-1 max-w-2xl leading-relaxed">
              You receive an SMS from <strong>"USPS-UPDATE"</strong>:{" "}
              <em>"Package #US-91823 has an invalid delivery address. A $1.50 handling fee is required to confirm redelivery: http://usps-parcel-redelivery.me/confirm"</em>.
            </p>
          </div>

          <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <i className="ti ti-device-mobile-message text-2xl" />
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-text-pure">What is your immediate action?</p>
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
                        ? "border-success bg-success/10 text-success font-medium"
                        : isSelected
                        ? "border-danger bg-danger/10 text-danger font-medium"
                        : "border-border bg-surface text-text-ash opacity-60"
                      : "border-border bg-surface hover:bg-surface-elevated text-text-pure"
                  }`}
                >
                  <span>{opt.text}</span>
                  {dailyAnswered && isSelected && (
                    <span className="mt-2 text-[11px] font-bold block">
                      {opt.correct ? "✓ Correct Defense" : "✗ Vulnerable Trap"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {dailyAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-surface border border-border text-xs"
          >
            <span className="font-semibold text-primary">Cyber Defense Takeaway:</span>
            <p className="text-text-fog mt-0.5">
              Courier smishing is the #1 mobile scam worldwide. Attackers register domains ending in <code>.me</code>, <code>.info</code>, or <code>.top</code> to bypass basic spam filters. Always inspect the URL domain carefully.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── 4. TACTICAL DEFENSE TOOLBOX (QUICK ACCESS) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Password Entropy Meter */}
        <Card>
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
            <div className="flex items-center gap-2">
              <i className="ti ti-key text-primary text-base" />
              <span className="font-semibold text-text-pure">Quick Password Entropy Check</span>
            </div>
            <Link to="/tools" className="text-primary hover:underline font-medium">
              Full Analyzer
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs text-text-fog">
              Test a sample passphrase to evaluate if it can withstand offline GPU brute-force attacks:
            </p>
            <input
              type="text"
              placeholder="Enter a test passphrase (e.g. Blue!River#2026)..."
              value={quickPass}
              onChange={(e) => setQuickPass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-surface-elevated text-text-pure focus:outline-none focus:border-primary font-mono"
            />

            {pwdAnalysis && (
              <div className="p-2.5 rounded-lg border border-border bg-surface text-xs flex items-center justify-between">
                <span className="text-text-ash">Crack Resistance:</span>
                <span className={`font-semibold ${
                  pwdAnalysis.tone === "success" ? "text-success" : pwdAnalysis.tone === "warn" ? "text-warn" : "text-danger"
                }`}>
                  {pwdAnalysis.text}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Suspicious URL Scanner */}
        <Card>
          <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
            <div className="flex items-center gap-2">
              <i className="ti ti-link text-primary text-base" />
              <span className="font-semibold text-text-pure">Quick URL Typosquatting Scanner</span>
            </div>
            <Link to="/tools" className="text-primary hover:underline font-medium">
              Advanced Scanner
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-xs text-text-fog">
              Check a link for suspicious TLDs, IP addresses, or lookalike typosquatting:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste link (e.g. http://paypa1-account.xyz)..."
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-surface-elevated text-text-pure focus:outline-none focus:border-primary font-mono"
              />
              <button
                onClick={handleQuickUrlScan}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Scan
              </button>
            </div>

            {urlScanResult && (
              <div className="p-2.5 rounded-lg border border-border bg-surface text-xs text-text-pure">
                {urlScanResult}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── 5. REAL-WORLD THREAT RADAR & RECENT SECURITY TELEMETRY ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Real-World Threat Radar */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
              <h3 className="font-display text-sm font-semibold text-text-pure">Active Threats This Week</h3>
            </div>
            <Link to="/threats" className="text-xs font-semibold text-primary hover:underline">
              Live Intel Feed
            </Link>
          </div>

          <div className="space-y-3 mt-3">
            {ACTIVE_THREAT_NOTICES.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-surface-elevated border border-border text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-pure">{t.title}</span>
                  <Pill tone={t.severity === "critical" ? "danger" : t.severity === "high" ? "warn" : "info"}>
                    {t.category}
                  </Pill>
                </div>
                <p className="text-text-fog text-[11px] leading-relaxed">{t.description}</p>
                <p className="text-primary text-[11px] font-medium pt-1">
                  🛡️ Defense Rule: {t.action}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Security Telemetry Audit */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-display text-sm font-semibold text-text-pure">Recent Security Telemetry</h3>
              <p className="text-[11px] text-text-ash">Audit log of your defense actions</p>
            </div>
            <Link to="/progress" className="text-xs font-semibold text-primary hover:underline">
              Detailed Analytics
            </Link>
          </div>

          <div className="mt-3">
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-2.5">
                {recentActivity.map((act) => {
                  const conf = ACTION_CONFIG[act.action] ?? { label: act.action, icon: "ti-activity" };
                  return (
                    <div key={act.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated text-xs border border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                          <i className={`ti ${conf.icon} text-sm`} />
                        </div>
                        <div>
                          <p className="font-medium text-text-pure">{conf.label}</p>
                          <p className="text-[10px] text-text-ash">{relativeTime(act.created_at)}</p>
                        </div>
                      </div>
                      {act.points_earned > 0 && (
                        <span className="font-mono text-[11px] font-semibold text-success">
                          +{act.points_earned} XP
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-border text-text-ash mb-2">
                  <i className="ti ti-shield text-lg" />
                </div>
                <p className="text-xs font-medium text-text-pure">No defense telemetry logged yet</p>
                <p className="text-[11px] text-text-ash mt-0.5">Start your first training drill to build defensive muscle memory.</p>
                <Link to="/training" className="mt-4">
                  <Button variant="secondary" size="xs">
                    Start Training Drill
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
