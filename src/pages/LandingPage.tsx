import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { motion, AnimatePresence } from "framer-motion";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE REAL-TIME THREAT ADVISORY TICKER
───────────────────────────────────────────────────────────────────────────── */
const LIVE_THREATS = [
  { id: 1, icon: "ti-alert-triangle", tone: "danger", text: "Warning: Fake electricity & phone bill text messages asking to install apps" },
  { id: 2, icon: "ti-microphone", tone: "danger", text: "AI Alert: Fake voice calls pretending to be family members asking for urgent money" },
  { id: 3, icon: "ti-qrcode", tone: "warn", text: "QR Scam Alert: Fake payment stickers placed over parking meters and store counters" },
  { id: 4, icon: "ti-brand-whatsapp", tone: "danger", text: "WhatsApp Alert: Messages saying 'Hi Mom, I broke my phone, please send money quickly'" },
  { id: 5, icon: "ti-lock", tone: "warn", text: "Password Warning: Leaked password lists circulating online—keep your passwords unique" },
  { id: 6, icon: "ti-wifi", tone: "info", text: "Public Wi-Fi: Unsecured open Wi-Fi networks can expose what you browse" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HERO INTERACTIVE SCAM SPOTTER & ATTACK INSPECTOR
───────────────────────────────────────────────────────────────────────────── */
type ScenarioId = "smishing" | "email" | "whatsapp";

interface ScamScenario {
  id: ScenarioId;
  title: string;
  category: string;
  badgeTone: "danger" | "warn" | "cyan";
  source: string;
  displayFrom: string;
  previewSnippet: string;
  body: string;
  redFlags: { label: string; explanation: string }[];
  options: { id: string; text: string; isCorrect: boolean; feedback: string }[];
  expertTip: string;
}

const SCENARIOS: Record<ScenarioId, ScamScenario> = {
  smishing: {
    id: "smishing",
    title: "Urgent Bank Debit SMS",
    category: "Mobile Smishing",
    badgeTone: "danger",
    source: "SMS (+1 800-019-923)",
    displayFrom: "ALERT-SECURE-NOTIFY",
    previewSnippet: "Immediate verification required for debit transaction of $849.50.",
    body: "URGENT BANK ALERT: A withdrawal of $849.50 was authorized on your card *3910. If you did NOT authorize this, cancel immediately within 15 minutes at: https://secure-bank-cancel-resolve.me/verify?auth=91823",
    redFlags: [
      { label: "High Psychological Urgency", explanation: "'Within 15 minutes' induces panic so you act before thinking." },
      { label: "Spoofed Domain (.me)", explanation: "Banks never use random country-code TLDs like .me or hyphenated long URLs." },
      { label: "Unsolicited Link", explanation: "Real financial institutions advise you to log into the official app, never click raw links." },
    ],
    options: [
      {
        id: "click",
        text: "Click link to cancel transaction immediately",
        isCorrect: false,
        feedback: "Dangerous! Clicking this link directs you to a credential-harvesting clone page designed to steal your bank password and 2FA code.",
      },
      {
        id: "reply_stop",
        text: "Reply 'STOP' or 'NO' to cancel",
        isCorrect: false,
        feedback: "Risky! Replying confirms that your mobile number is live and active, which triggers more automated phishing waves.",
      },
      {
        id: "verify_app",
        text: "Ignore SMS, open official bank app directly & check statement",
        isCorrect: true,
        feedback: "Perfect instinct! Always verify independently via the verified official mobile app or the phone number printed on the back of your card.",
      },
    ],
    expertTip: "Banks will NEVER send an SMS with a direct login link to cancel a transaction. Any urgent SMS link is 99.9% a scam.",
  },
  email: {
    id: "email",
    title: "Executive / IT Password Expiry Email",
    category: "Spear-Phishing",
    badgeTone: "warn",
    source: "Email Client",
    displayFrom: "IT Support <support@company-auth-reset.org>",
    previewSnippet: "Your Microsoft 365 / Corporate credentials expire in 2 hours.",
    body: "Notice: Mandatory security update required. Your account password will expire today at 5:00 PM. Failure to validate will lock your workspace access. Click below to retain existing credentials: [Validate My Password Now]",
    redFlags: [
      { label: "Forged From Domain", explanation: "Sender domain 'company-auth-reset.org' is an attacker-registered domain mimicking internal IT." },
      { label: "Artificial Deadline", explanation: "Forcing a 2-hour deadline prevents you from checking with your company IT department." },
      { label: "'Retain Existing Password' Lure", explanation: "Security protocols never let you 'keep your expired password' by clicking an external link." },
    ],
    options: [
      {
        id: "click_btn",
        text: "Click 'Validate My Password' and enter corporate password",
        isCorrect: false,
        feedback: "Compromised! This transmits your company login credentials straight into the attacker's server.",
      },
      {
        id: "inspect_domain",
        text: "Inspect sender address domain & contact IT via official chat",
        isCorrect: true,
        feedback: "Spot on! The sender domain was fake. Confirming through verified internal channels neutralizes spear-phishing.",
      },
      {
        id: "forward_colleagues",
        text: "Forward email to your entire team to warn them",
        isCorrect: false,
        feedback: "Be careful! Forwarding active phishing emails can cause other colleagues to accidentally click the malicious link.",
      },
    ],
    expertTip: "Hover over the sender name to reveal the full email address. Look closely for subtle typos, extra dashes, or odd domains.",
  },
  whatsapp: {
    id: "whatsapp",
    title: "Family Emergency / Friend Impersonation",
    category: "AI & Social Engineering",
    badgeTone: "cyan",
    source: "WhatsApp (+1 415-829-1002)",
    displayFrom: "Unknown Number (Avatar: Family photo)",
    previewSnippet: "Hi, I dropped my phone in water and this is a friend's number...",
    body: "Hi! Dropped my phone in water and it completely died. This is my temporary number for today. I urgently need to pay my medical clinic bill of $320 before 4 PM but my banking app isn't set up on this device yet. Can you Zelle or Venmo it for me quickly? I'll repay you tonight!",
    redFlags: [
      { label: "Device Loss Pretext", explanation: "Explains why they are contacting you from an unknown or temporary phone number." },
      { label: "Emotional Distress & Pressure", explanation: "Exploits love, sympathy, and familial protective instincts to bypass rational caution." },
      { label: "Irreversible Payment Request", explanation: "Directs money via peer-to-peer services (Zelle, Venmo, Wire) where funds cannot be recovered." },
    ],
    options: [
      {
        id: "pay_immediately",
        text: "Send $320 immediately via Zelle to help out",
        isCorrect: false,
        feedback: "Lost funds! This is the infamous 'Hello Mum/Dad' impersonation scam. The attacker gathered your family names from social media.",
      },
      {
        id: "call_existing_number",
        text: "Call their actual existing number or ask a personal family safe-word",
        isCorrect: true,
        feedback: "Masterclass defense! Calling the known number or asking an un-Googleable secret question instantly unmasks the impostor.",
      },
      {
        id: "ask_name",
        text: "Reply: 'Who is this?'",
        isCorrect: false,
        feedback: "Partially effective, but social engineers will use clever guess tricks like: 'It's your eldest, don't you recognize my writing?' to trap you.",
      },
    ],
    expertTip: "Establish a secret family safe-word with loved ones. If an emergency money request doesn't include the word, it's a scam.",
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   6 REAL-LIFE THREAT VECTORS EVERYONE FACES
───────────────────────────────────────────────────────────────────────────── */
const THREAT_VECTORS = [
  {
    icon: "ti-mail-bolt",
    title: "Fake Emails & Phishing",
    tag: "MOST COMMON",
    summary: "Deceptive emails pretending to be Netflix, Amazon, PayPal, or your bank asking you to 'verify your details' on lookalike fake websites.",
    realLifeDefense: "Never sign in from an email link. Open the official app or type the real website address yourself.",
  },
  {
    icon: "ti-device-mobile-message",
    title: "Scam Texts & OTP Fraud",
    tag: "HIGH ALERT",
    summary: "Urgent text messages about parcel deliveries, unpaid bills, or bank alerts tricking you to click a link or give away one-time verification codes.",
    realLifeDefense: "One-Time Passwords (OTPs) are private. No real bank or company will ever call or text asking you to share an OTP.",
  },
  {
    icon: "ti-key",
    title: "Reused & Weak Passwords",
    tag: "ACCOUNT RISK",
    summary: "Using the same password across multiple websites means if one small site gets hacked, criminals can unlock all your other accounts.",
    realLifeDefense: "Use unique passwords for each service, save them in a secure password manager, and turn on two-step verification.",
  },
  {
    icon: "ti-robot",
    title: "AI Voice & Impersonation Scams",
    tag: "NEW SCAM",
    summary: "Scammers clone voices from social media videos to pretend to be family members or coworkers calling urgently to ask for money.",
    realLifeDefense: "Always hang up and call back the person's real, saved phone number to confirm before sending any money.",
  },
  {
    icon: "ti-file-alert",
    title: "Viruses & Dangerous Downloads",
    tag: "DEVICE THREAT",
    summary: "Cracked games, free movie apps, or suspicious email attachments that secretly spy on your passwords and keystrokes.",
    realLifeDefense: "Only download apps and files from verified app stores, avoid pirated software, and keep device updates turned on.",
  },
  {
    icon: "ti-wifi-off",
    title: "Public Wi-Fi Snooping",
    tag: "WI-FI RISK",
    summary: "Free public Wi-Fi in cafes or airports that has no password, or fake hotspots created by attackers to spy on what you browse.",
    realLifeDefense: "Avoid typing passwords or opening banking apps on public Wi-Fi unless you use a secure VPN or mobile data.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE 60-SECOND CYBER HYGIENE AUDIT QUESTIONS
───────────────────────────────────────────────────────────────────────────── */
const AUDIT_QUESTIONS = [
  {
    id: "q1",
    question: "Do you use the same or similar passwords across multiple websites?",
    riskIfYes: "If one website gets breached, hackers can test that password on all your other accounts.",
  },
  {
    id: "q2",
    question: "Do you click tracking links in text messages without checking the official app?",
    riskIfYes: "Fake delivery and bank texts often lead to scam pages designed to steal card details.",
  },
  {
    id: "q3",
    question: "Do you lack two-step verification (2FA) on your main email account?",
    riskIfYes: "Your email is the master key to your digital life; without two-step login, it's easier to hijack.",
  },
  {
    id: "q4",
    question: "Have you ever connected to free public Wi-Fi without using a VPN or mobile hotspot?",
    riskIfYes: "Unsecured public networks can expose the websites you visit to others on the same network.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT: LANDING PAGE
───────────────────────────────────────────────────────────────────────────── */
export function LandingPage() {
  // Scenario state
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("smishing");
  const [showXRay, setShowXRay] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 60-Sec Audit State
  const [auditAnswers, setAuditAnswers] = useState<Record<string, boolean>>({});

  const scenario = SCENARIOS[activeScenario];
  const activeOption = scenario.options.find((o) => o.id === selectedOption);

  const handleAuditToggle = (qid: string, val: boolean) => {
    setAuditAnswers((prev) => ({ ...prev, [qid]: val }));
  };

  const calculateAuditScore = () => {
    let points = 0;
    AUDIT_QUESTIONS.forEach((q) => {
      if (auditAnswers[q.id] === false) points += 25;
    });
    return points;
  };

  const auditScore = calculateAuditScore();
  const allAnswered = AUDIT_QUESTIONS.every((q) => auditAnswers[q.id] !== undefined);

  return (
    <div className="overflow-x-hidden bg-canvas">
      {/* ── 1. LIVE THREAT ADVISORY TICKER ── */}
      <div className="relative border-b border-border bg-surface-elevated overflow-hidden py-2.5 text-xs flex items-center">
        <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 bg-danger/10 text-danger text-xs font-semibold uppercase tracking-wide rounded-md shrink-0 ml-4 shadow-sm border border-danger/20">
          <span className="h-2 w-2 rounded-full bg-danger animate-ping" />
          Live Scam Radar
        </div>
        <div className="threat-ticker-track flex items-center gap-8 text-text-fog pl-4">
            {LIVE_THREATS.concat(LIVE_THREATS).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 shrink-0">
                <i className={`ti ${item.icon} ${item.tone === "danger" ? "text-danger" : item.tone === "warn" ? "text-warn" : "text-primary"} text-sm`} />
                <span className="font-medium text-text-pure text-xs sm:text-sm">{item.text}</span>
                <span className="text-text-ash text-xs">•</span>
              </div>
            ))}
          </div>
        </div>

      {/* ── 2. HERO SECTION ── */}
      <section className="relative border-b border-border pt-14 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-6xl px-6 text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>Easy Cybersecurity Training for Everyday Life</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-6 font-display text-4xl font-bold tracking-tight text-text-pure sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight"
          >
            Learn To Spot Online Scams &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-500 to-emerald-500">
              Protect Yourself.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-text-fog max-w-3xl mx-auto leading-relaxed"
          >
            Over 90% of cyber attacks trick people rather than breaking code. CyberGuard teaches you how to recognize fake emails, suspicious texts, AI phone scams, and unsafe Wi-Fi through simple, hands-on practice.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link to="/register">
              <Button variant="primary" size="lg" icon={<i className="ti ti-shield-check" />}>
                Start Free
              </Button>
            </Link>
            <a href="#interactive-lab">
              <Button variant="secondary" size="lg" icon={<i className="ti ti-target" />}>
                Try Scam Spotter
              </Button>
            </a>
            <Link to="/simulations">
              <Button variant="ghost" size="lg" icon={<i className="ti ti-device-laptop" />}>
                Practice Simulations
              </Button>
            </Link>
          </motion.div>

          {/* ── 3. HERO INTERACTIVE SCAM SPOTTER & ATTACK INSPECTOR ── */}
          <div id="interactive-lab" className="mt-14 max-w-4xl mx-auto text-left scroll-mt-24">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <i className="ti ti-scan text-xl" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-pure">
                      Scam Spotter: Test Your Instincts
                    </h2>
                    <p className="text-xs text-text-ash">
                      Can you spot the red flags in this message? Try picking the safe action below.
                    </p>
                  </div>
                </div>

                {/* Scenario Switcher Tabs */}
                <div className="flex items-center rounded-xl bg-surface-elevated p-1 border border-border">
                  <button
                    onClick={() => {
                      setActiveScenario("smishing");
                      setSelectedOption(null);
                      setShowXRay(false);
                    }}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeScenario === "smishing"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    📱 Fake SMS
                  </button>
                  <button
                    onClick={() => {
                      setActiveScenario("email");
                      setSelectedOption(null);
                      setShowXRay(false);
                    }}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeScenario === "email"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    📧 Fake Email
                  </button>
                  <button
                    onClick={() => {
                      setActiveScenario("whatsapp");
                      setSelectedOption(null);
                      setShowXRay(false);
                    }}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeScenario === "whatsapp"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    💬 WhatsApp Scam
                  </button>
                </div>
              </div>

              {/* Threat Display Box */}
              <div className="mt-4 grid gap-4 lg:grid-cols-12">
                {/* Left: Simulated Message Frame (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="rounded-xl border border-border bg-surface-elevated p-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-pure">{scenario.source}</span>
                        <span className="text-[11px] text-text-ash">From: {scenario.displayFrom}</span>
                      </div>
                      <Pill tone={scenario.badgeTone} size="sm">{scenario.category}</Pill>
                    </div>

                    {/* Message Body */}
                    <div className="py-3">
                      <p className="text-xs sm:text-sm text-text-pure font-sans leading-relaxed bg-surface p-3.5 rounded-xl border border-border">
                        {scenario.body}
                      </p>
                    </div>

                    {/* X-Ray Inspector Toggle Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                      <button
                        onClick={() => setShowXRay(!showXRay)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
                      >
                        <i className={`ti ${showXRay ? "ti-eye-off" : "ti-scan"} text-sm`} />
                        {showXRay ? "Hide Clues" : "Show Clues & Red Flags"}
                      </button>
                      <span className="text-[11px] text-text-ash font-medium">
                        {scenario.redFlags.length} Clues to Spot
                      </span>
                    </div>

                    {/* X-Ray Analysis Dropdown */}
                    <AnimatePresence>
                      {showXRay && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 space-y-2 pt-2.5 border-t border-border"
                        >
                          {scenario.redFlags.map((flag, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-danger/5 border border-danger/20 text-xs">
                              <span className="font-semibold text-danger flex items-center gap-1">
                                <i className="ti ti-alert-circle text-xs" /> Clue {idx + 1}: {flag.label}
                              </span>
                              <p className="text-[11px] text-text-fog mt-0.5 leading-relaxed">{flag.explanation}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactive Decision Choices */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-text-pure">
                      What would you do?
                    </p>
                    <div className="space-y-1.5">
                      {scenario.options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedOption(opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? opt.isCorrect
                                  ? "border-success bg-success/10 text-text-pure font-semibold"
                                  : "border-danger bg-danger/10 text-text-pure font-semibold"
                                : "border-border bg-surface hover:bg-surface-elevated text-text-fog hover:text-text-pure"
                            }`}
                          >
                            <span className="leading-snug">{opt.text}</span>
                            {isSelected && (
                              <span className={`text-[11px] font-bold shrink-0 ml-2 ${opt.isCorrect ? "text-success" : "text-danger"}`}>
                                {opt.isCorrect ? "✓ Safe Choice" : "✗ Scam Trap"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Guidance & Feedback Panel (5 cols) */}
                <div className="lg:col-span-5 rounded-xl border border-border bg-surface-elevated p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <i className="ti ti-shield-check text-primary text-sm" />
                      <span className="text-xs font-bold text-text-pure">Tactical Feedback</span>
                    </div>

                    <div className="mt-3">
                      {activeOption ? (
                        <div
                          className={`p-3 rounded-xl border text-xs leading-relaxed ${
                            activeOption.isCorrect
                              ? "bg-success/10 border-success/30 text-success"
                              : "bg-danger/10 border-danger/30 text-danger"
                          }`}
                        >
                          <p className="font-bold mb-0.5">
                            {activeOption.isCorrect ? "✓ Great Instinct!" : "✗ Trap Sprung!"}
                          </p>
                          <p className="text-[11px] text-text-pure leading-relaxed">
                            {activeOption.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-surface border border-border text-center py-5">
                          <i className="ti ti-hand-click text-xl text-text-ash mb-1" />
                          <p className="text-xs font-semibold text-text-pure">Select an Action</p>
                          <p className="text-[11px] text-text-ash mt-0.5">
                            Pick how you would react to see defense guidance.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pro Defense Rule */}
                    <div className="mt-3 p-3 rounded-xl bg-surface border border-border text-xs">
                      <span className="font-bold text-primary flex items-center gap-1 text-[10px] uppercase tracking-wider">
                        <i className="ti ti-bulb text-sm" /> Safety Rule
                      </span>
                      <p className="mt-1 text-[11px] text-text-fog leading-relaxed">
                        {scenario.expertTip}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border text-center">
                    <Link to="/simulations" className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                      Explore Full Simulations <i className="ti ti-arrow-right text-[10px]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. REAL-WORLD CYBER THREATS IMPACTING EVERYONE ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="eyebrow">Common Scams</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
            The 6 Most Common Online Scams Today
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-fog leading-relaxed">
            Most attacks rely on urgency or impersonation. Here are the 6 threats you are most likely to encounter in daily life.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {THREAT_VECTORS.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <i className={`ti ${v.icon} text-lg`} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-elevated text-primary border border-border uppercase tracking-wide">
                    {v.tag}
                  </span>
                </div>
                <h3 className="font-display text-sm sm:text-base font-bold text-text-pure">{v.title}</h3>
                <p className="mt-1 text-xs text-text-fog leading-relaxed line-clamp-2">{v.summary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-start gap-2 text-xs bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl">
                <i className="ti ti-shield-check text-emerald-500 text-sm shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold text-emerald-500 uppercase text-[10px] tracking-wider block">Good Habit</span>
                  <span className="text-text-pure text-[11px]">{v.realLifeDefense}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. INTERACTIVE 60-SECOND CYBER HYGIENE AUDIT ── */}
      <section className="py-16 border-t border-border bg-surface-elevated">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="eyebrow">Quick Check</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
              60-Second Security Self-Check
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-text-fog">
              Answer 4 quick questions about your digital habits to evaluate your basic protection level.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm">
            <div className="space-y-3">
              {AUDIT_QUESTIONS.map((q, idx) => {
                const answer = auditAnswers[q.id];
                return (
                  <div key={q.id} className="p-3.5 sm:p-4 rounded-xl border border-border bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="max-w-xl min-w-0">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Question 0{idx + 1}</span>
                      <p className="text-xs sm:text-sm font-semibold text-text-pure mt-0.5">{q.question}</p>
                      {answer === true && (
                        <p className="text-[11px] text-danger mt-1 flex items-center gap-1.5">
                          <i className="ti ti-alert-triangle text-xs shrink-0" /> {q.riskIfYes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleAuditToggle(q.id, true)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          answer === true
                            ? "bg-danger text-white shadow-xs"
                            : "bg-surface border border-border text-text-fog hover:text-text-pure"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAuditToggle(q.id, false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          answer === false
                            ? "bg-success text-white shadow-xs"
                            : "bg-surface border border-border text-text-fog hover:text-text-pure"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Audit Score Result */}
            {allAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-text-pure">
                      Score: {auditScore} / 100
                    </span>
                    <Pill tone={auditScore >= 75 ? "success" : auditScore >= 50 ? "warn" : "danger"} size="sm">
                      {auditScore >= 75 ? "Well Protected" : auditScore >= 50 ? "Moderate Risk" : "Needs Attention"}
                    </Pill>
                  </div>
                  <p className="text-xs text-text-fog mt-0.5">
                    {auditScore === 100
                      ? "Great job! You practice solid everyday cyber habits."
                      : "You have a few habits scammers exploit. Learn how to address them in our bite-sized lessons!"}
                  </p>
                </div>

                <Link to="/training">
                  <Button variant="primary" size="xs" icon={<i className="ti ti-arrow-right" />}>
                    Improve Habits
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. HANDS-ON SIMULATION SANDBOXES SHOWCASE ── */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="eyebrow">Interactive Practice</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
            Learn By Doing in Safe Simulations
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-text-fog leading-relaxed">
            Step inside our safe demo environments to see how real scams work without any risk to your personal accounts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-primary/40 transition-all">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <i className="ti ti-mail-bolt text-lg" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-ash">Email Lab</span>
              <h3 className="font-display text-sm font-bold text-text-pure mt-0.5">Fake Email Lab</h3>
              <p className="text-xs text-text-fog mt-1 leading-relaxed line-clamp-2">
                Inspect a mock inbox and practice finding sneaky spoofed sender addresses.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-primary hover:underline flex items-center justify-between">
                <span>Try Simulation</span>
                <i className="ti ti-chevron-right text-[10px]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-3">
                <i className="ti ti-message-chatbot text-lg" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-ash">Phone Lab</span>
              <h3 className="font-display text-sm font-bold text-text-pure mt-0.5">SMS Scam Lab</h3>
              <p className="text-xs text-text-fog mt-1 leading-relaxed line-clamp-2">
                See fake bank texts and parcel alerts on a virtual smartphone screen.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-cyan-500 hover:underline flex items-center justify-between">
                <span>Try Simulation</span>
                <i className="ti ti-chevron-right text-[10px]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-danger/40 transition-all">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10 text-danger mb-3">
                <i className="ti ti-file-lock text-lg" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-ash">Safety Drill</span>
              <h3 className="font-display text-sm font-bold text-text-pure mt-0.5">Virus Containment</h3>
              <p className="text-xs text-text-fog mt-1 leading-relaxed line-clamp-2">
                Practice isolating compromised devices to stop malicious file execution in time.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-danger hover:underline flex items-center justify-between">
                <span>Try Drill</span>
                <i className="ti ti-chevron-right text-[10px]" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3">
                <i className="ti ti-key text-lg" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-ash">Safety Tool</span>
              <h3 className="font-display text-sm font-bold text-text-pure mt-0.5">Password Studio</h3>
              <p className="text-xs text-text-fog mt-1 leading-relaxed line-clamp-2">
                Check entropy and see how quickly brute-force clusters can crack words.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-border">
              <Link to="/tools" className="text-xs font-semibold text-emerald-500 hover:underline flex items-center justify-between">
                <span>Open Tool</span>
                <i className="ti ti-chevron-right text-[10px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. EMERGENCY SOS: UNDER ATTACK RIGHT NOW? ── */}
      <section className="py-14 border-t border-border bg-danger/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-danger/20 bg-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger text-white shrink-0">
                <i className="ti ti-sos text-lg" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-danger">Emergency: Think You Just Got Scammed or Hacked?</h3>
                <p className="text-[11px] sm:text-xs text-text-ash">Take these 4 simple steps immediately if you clicked a suspicious link or entered credentials.</p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 mt-4 text-xs">
              <div className="p-3 rounded-xl border border-border bg-surface-elevated">
                <span className="text-[10px] font-bold text-danger uppercase tracking-wider">STEP 01</span>
                <p className="font-bold text-text-pure mt-0.5">Disconnect Network</p>
                <p className="text-[11px] text-text-fog mt-0.5 leading-snug">Turn off Wi-Fi &amp; cellular data right away.</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-elevated">
                <span className="text-[10px] font-bold text-danger uppercase tracking-wider">STEP 02</span>
                <p className="font-bold text-text-pure mt-0.5">Reset Passwords</p>
                <p className="text-[11px] text-text-fog mt-0.5 leading-snug">Use a separate clean device to change primary credentials.</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-elevated">
                <span className="text-[10px] font-bold text-danger uppercase tracking-wider">STEP 03</span>
                <p className="font-bold text-text-pure mt-0.5">Terminate Sessions</p>
                <p className="text-[11px] text-text-fog mt-0.5 leading-snug">Select &apos;Sign out of all other devices&apos; in account settings.</p>
              </div>
              <div className="p-3 rounded-xl border border-border bg-surface-elevated">
                <span className="text-[10px] font-bold text-danger uppercase tracking-wider">STEP 04</span>
                <p className="font-bold text-text-pure mt-0.5">Notify Institution</p>
                <p className="text-[11px] text-text-fog mt-0.5 leading-snug">Call your card issuer to lock accounts, or dial 1930.</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-text-ash text-[11px]">Need to report a scam? We provide clear step-by-step reporting guidance.</span>
              <Link to="/report">
                <Button variant="secondary" size="xs" icon={<i className="ti ti-flag" />}>
                  Report Incident
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FINAL DEFENSE CALL TO ACTION ── */}
      <section className="py-16 border-t border-border text-center">
        <div className="max-w-xl mx-auto px-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-border shadow-md mb-4 p-1">
            <CyberGuardLogoMark size={40} pulse={true} />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-pure">
            Make Cyber Safety Second Nature.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-fog leading-relaxed">
            Practice spotting real-world scams and protect your accounts with simple, practical daily habits. Free, zero-risk, and built for everyone.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2.5">
            <Link to="/register">
              <Button variant="primary" size="md" icon={<i className="ti ti-arrow-right" />}>
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="md">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
