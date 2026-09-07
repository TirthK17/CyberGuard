import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   LIVE REAL-TIME THREAT ADVISORY TICKER
───────────────────────────────────────────────────────────────────────────── */
const LIVE_THREATS = [
  { id: 1, icon: "ti-alert-triangle", tone: "danger", text: "ACTIVE SURGE: Bank APK Smishing campaigns impersonating unpaid electricity & utility bills" },
  { id: 2, icon: "ti-microphone", tone: "danger", text: "AI THREAT: Synthetic voice clone scams impersonating family members asking for urgent cash up +340%" },
  { id: 3, icon: "ti-qrcode", tone: "warn", text: "QUISHING ADVISORY: Malicious QR stickers placed over legitimate parking meter payment portals" },
  { id: 4, icon: "ti-brand-whatsapp", tone: "danger", text: "WHATSAPP ALERT: 'Hi Mom/Dad, dropped my phone in water' emergency funds lure circulating" },
  { id: 5, icon: "ti-lock", tone: "warn", text: "CREDENTIAL NOTICE: 1.2B leaked credentials used in automated credential stuffing attacks this week" },
  { id: 6, icon: "ti-wifi", tone: "info", text: "PUBLIC WI-FI: Evil Twin rogue hotspots detected in transit hubs harvesting plaintext session tokens" },
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
    title: "Phishing & Fake Portals",
    tag: "91% OF BREACHES",
    summary: "Deceptive emails impersonating Netflix, Amazon, PayPal, and banks asking you to 'verify your billing details' on lookalike websites.",
    realLifeDefense: "Never log in from an email link. Navigate to the website manually through your browser bookmark or official app.",
  },
  {
    icon: "ti-device-mobile-message",
    title: "SMS & WhatsApp OTP Fraud",
    tag: "FASTEST GROWING",
    summary: "Urgent texts about courier packages, toll charges, or electricity disconnections tempting you to tap malicious links or share OTPs.",
    realLifeDefense: "One-Time Passwords (OTPs) are for YOUR eyes only. No genuine bank employee or customer support will ever ask for them.",
  },
  {
    icon: "ti-key",
    title: "Password Reuse & Leaks",
    tag: "CREDENTIAL STUFFING",
    summary: "Reusing one password across school, social media, and banking means one breached forum grants hackers access to your entire digital identity.",
    realLifeDefense: "Use unique passphrases for every single service, backed by an encrypted password manager and app-based 2FA.",
  },
  {
    icon: "ti-robot",
    title: "AI Voice & Deepfake Scams",
    tag: "EMERGING THREAT",
    summary: "Criminals clone 3 seconds of audio from social media videos to generate realistic telephone calls from children or bosses begging for money.",
    realLifeDefense: "Always hang up and call the person back on their verified saved contact number before transferring any funds.",
  },
  {
    icon: "ti-file-alert",
    title: "Malware & Pirated Downloads",
    tag: "DEVICE TAKEOVER",
    summary: "Cracked software, free movie streams, and suspicious PDF invoice attachments secretly injecting keyloggers and info-stealing malware.",
    realLifeDefense: "Download software only from official stores. Avoid pirated cracks, and keep your operating system updated with auto-patches.",
  },
  {
    icon: "ti-wifi-off",
    title: "Public Wi-Fi Snooping",
    tag: "MAN-IN-THE-MIDDLE",
    summary: "Free airport and coffee shop Wi-Fi networks without encryption, or 'Evil Twin' fake hotspots designed to intercept your unencrypted traffic.",
    realLifeDefense: "Avoid accessing financial accounts on public Wi-Fi without a reputable VPN, and turn off auto-connect to open networks.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE 60-SECOND CYBER HYGIENE AUDIT QUESTIONS
───────────────────────────────────────────────────────────────────────────── */
const AUDIT_QUESTIONS = [
  {
    id: "q1",
    question: "Do you use the same or similar passwords across multiple websites?",
    riskIfYes: "High vulnerability to credential-stuffing attacks if any one service is breached.",
  },
  {
    id: "q2",
    question: "Do you click tracking links in SMS messages without checking the official delivery app?",
    riskIfYes: "Susceptible to mobile smishing and malicious package-tracking APK downloads.",
  },
  {
    id: "q3",
    question: "Do you lack Multi-Factor Authentication (MFA / 2FA) on your primary email account?",
    riskIfYes: "Email is the master key to password resets; without MFA, accounts can be hijacked easily.",
  },
  {
    id: "q4",
    question: "Have you ever connected to free public Wi-Fi without verifying the network or using a VPN?",
    riskIfYes: "Vulnerable to local network eavesdropping and session cookie interception.",
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
      <div className="relative border-b border-border bg-surface-elevated overflow-hidden py-2 text-xs flex items-center">
        <div className="relative z-10 flex items-center gap-1.5 px-3 py-0.5 bg-danger/10 text-danger font-mono text-[10px] font-bold uppercase tracking-wider rounded shrink-0 ml-4 shadow-sm border border-danger/20">
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-ping" />
          Live Threat Radar
        </div>
        <div className="threat-ticker-track flex items-center gap-8 text-text-fog pl-4">
            {LIVE_THREATS.concat(LIVE_THREATS).map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 shrink-0">
                <i className={`ti ${item.icon} ${item.tone === "danger" ? "text-danger" : item.tone === "warn" ? "text-warn" : "text-primary"}`} />
                <span className="font-medium text-text-pure text-[11px]">{item.text}</span>
                <span className="text-text-ash text-[10px]">•</span>
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
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3.5 py-1 text-xs font-medium text-primary shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>Real-Life Cybersecurity Awareness &amp; Defense Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-6 font-display text-4xl font-bold tracking-tight text-text-pure sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight"
          >
            Transform From A Cyber Target Into An{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-500 to-emerald-500">
              Active Defender.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-text-fog max-w-3xl mx-auto leading-relaxed"
          >
            95% of cyber breaches exploit human manipulation, not software bugs.
            CyberGuard empowers everyday users, students, and teams with instinctual defenses against
            phishing, WhatsApp &amp; SMS scams, deepfakes, and account hijackers through realistic zero-risk simulations.
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
                Start Training Free
              </Button>
            </Link>
            <a href="#interactive-lab">
              <Button variant="secondary" size="lg" icon={<i className="ti ti-target" />}>
                Try Live Scam Spotter
              </Button>
            </a>
            <Link to="/simulations">
              <Button variant="ghost" size="lg" icon={<i className="ti ti-device-laptop" />}>
                Explore Threat Sandboxes
              </Button>
            </Link>
          </motion.div>

          {/* ── 3. HERO INTERACTIVE SCAM SPOTTER & ATTACK INSPECTOR ── */}
          <div id="interactive-lab" className="mt-14 max-w-4xl mx-auto text-left scroll-mt-24">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl relative overflow-hidden">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <i className="ti ti-scan text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-pure">
                      Live Threat Inspection Station: Real-Life Scam Spotter
                    </h2>
                    <p className="text-[11px] text-text-ash">
                      Can you identify the deception tactics? Test your instincts below.
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
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeScenario === "smishing"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    📱 Bank SMS
                  </button>
                  <button
                    onClick={() => {
                      setActiveScenario("email");
                      setSelectedOption(null);
                      setShowXRay(false);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeScenario === "email"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    📧 Phishing Email
                  </button>
                  <button
                    onClick={() => {
                      setActiveScenario("whatsapp");
                      setSelectedOption(null);
                      setShowXRay(false);
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeScenario === "whatsapp"
                        ? "bg-surface text-text-pure shadow-sm border border-border"
                        : "text-text-ash hover:text-text-pure"
                    }`}
                  >
                    💬 WhatsApp AI Lure
                  </button>
                </div>
              </div>

              {/* Threat Display Box */}
              <div className="mt-4 grid gap-5 lg:grid-cols-3">
                {/* Left: Simulated Message Frame */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl border border-border bg-surface-elevated p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-pure">{scenario.source}</span>
                        <span className="text-[11px] text-text-ash font-mono">From: {scenario.displayFrom}</span>
                      </div>
                      <Pill tone={scenario.badgeTone}>{scenario.category}</Pill>
                    </div>

                    {/* Message Body */}
                    <div className="py-4">
                      <p className="text-xs sm:text-sm text-text-pure font-sans leading-relaxed bg-surface p-3.5 rounded-lg border border-border">
                        {scenario.body}
                      </p>
                    </div>

                    {/* X-Ray Inspector Toggle Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <button
                        onClick={() => setShowXRay(!showXRay)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover cursor-pointer"
                      >
                        <i className={`ti ${showXRay ? "ti-eye-off" : "ti-scan"} text-sm`} />
                        {showXRay ? "Hide Deception Analysis" : "Inspect Red Flags & X-Ray Analysis"}
                      </button>
                      <span className="text-[11px] text-text-ash font-mono">
                        {scenario.redFlags.length} Deception Flags
                      </span>
                    </div>

                    {/* X-Ray Analysis Dropdown */}
                    <AnimatePresence>
                      {showXRay && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2 pt-3 border-t border-border"
                        >
                          {scenario.redFlags.map((flag, idx) => (
                            <div key={idx} className="p-2 rounded bg-danger/5 border border-danger/20 text-xs">
                              <span className="font-semibold text-danger flex items-center gap-1">
                                <i className="ti ti-alert-circle text-xs" /> Flag {idx + 1}: {flag.label}
                              </span>
                              <p className="text-[11px] text-text-fog mt-0.5">{flag.explanation}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactive Decision Choices */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-pure">
                      What is your immediate defensive response?
                    </p>
                    <div className="space-y-2">
                      {scenario.options.map((opt) => {
                        const isSelected = selectedOption === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedOption(opt.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? opt.isCorrect
                                  ? "border-success bg-success/10 text-text-pure"
                                  : "border-danger bg-danger/10 text-text-pure"
                                : "border-border bg-surface hover:bg-surface-elevated text-text-fog hover:text-text-pure"
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isSelected && (
                              <span className={`text-xs font-semibold shrink-0 ml-2 ${opt.isCorrect ? "text-success" : "text-danger"}`}>
                                {opt.isCorrect ? "✓ Safe Action" : "✗ Vulnerable"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Expert Guidance & Feedback Panel */}
                <div className="rounded-xl border border-border bg-surface-elevated p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <i className="ti ti-shield-check text-primary" />
                      <span className="text-xs font-bold text-text-pure">Tactical Evaluation</span>
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
                          <p className="font-bold mb-1">
                            {activeOption.isCorrect ? "Defensive Instinct Confirmed!" : "Attacker Trap Sprung!"}
                          </p>
                          <p className="text-[11px] text-text-pure leading-normal">
                            {activeOption.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-surface border border-border text-center py-6">
                          <i className="ti ti-hand-click text-2xl text-text-ash mb-1" />
                          <p className="text-xs font-medium text-text-pure">Choose an action</p>
                          <p className="text-[11px] text-text-ash mt-0.5">
                            Pick how you would handle this message in real life.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pro Defense Rule */}
                    <div className="mt-4 p-3 rounded-xl bg-surface border border-border text-xs">
                      <span className="font-semibold text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <i className="ti ti-bulb text-sm" /> Real-Life Rule
                      </span>
                      <p className="mt-1 text-[11px] text-text-fog leading-relaxed">
                        {scenario.expertTip}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border text-center">
                    <Link to="/simulations" className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                      Play Full Simulation Sandboxes <i className="ti ti-arrow-right text-[10px]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. REAL-WORLD CYBER THREATS IMPACTING EVERYONE ── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="eyebrow">Real Threat Landscape</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
            The Scams &amp; Attacks Targeting Everyone in Daily Life
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-fog leading-relaxed">
            Cybercrime is no longer just a corporate IT issue. Criminals prey on curiosity, fear, and daily routines.
            Here are the 6 primary attack vectors you must recognize.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {THREAT_VECTORS.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="cyber-card p-5 flex flex-col justify-between border border-border"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <i className={`ti ${v.icon} text-xl`} />
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-surface-elevated text-primary border border-border">
                    {v.tag}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-text-pure">{v.title}</h3>
                <p className="mt-2 text-xs text-text-fog leading-relaxed">{v.summary}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-border">
                <div className="text-[11px] text-text-pure bg-surface-elevated p-2.5 rounded-lg border border-border">
                  <span className="font-semibold text-success flex items-center gap-1 text-[10px] uppercase tracking-wider mb-0.5">
                    <i className="ti ti-shield text-xs" /> Defense Habit
                  </span>
                  {v.realLifeDefense}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 5. INTERACTIVE 60-SECOND CYBER HYGIENE AUDIT ── */}
      <section className="py-20 border-t border-border bg-surface-elevated">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="eyebrow">Interactive Self-Check</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
              60-Second Cyber Vulnerability Audit
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-text-fog">
              Answer 4 honest questions about your daily digital habits to calculate your personal Cyber Exposure Grade.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            <div className="space-y-4">
              {AUDIT_QUESTIONS.map((q, idx) => {
                const answer = auditAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-surface-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <span className="text-[10px] font-mono font-bold text-primary uppercase">Risk Factor 0{idx + 1}</span>
                      <p className="text-xs sm:text-sm font-medium text-text-pure mt-0.5">{q.question}</p>
                      {answer === true && (
                        <p className="text-[11px] text-danger mt-1 flex items-center gap-1">
                          <i className="ti ti-alert-triangle" /> {q.riskIfYes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAuditToggle(q.id, true)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          answer === true
                            ? "bg-danger text-white shadow-sm"
                            : "bg-surface border border-border text-text-fog hover:text-text-pure"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAuditToggle(q.id, false)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          answer === false
                            ? "bg-success text-white shadow-sm"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-5 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-text-pure">
                      Your Cyber Resilience Score: {auditScore} / 100
                    </span>
                    <Pill tone={auditScore >= 75 ? "success" : auditScore >= 50 ? "warn" : "danger"}>
                      {auditScore >= 75 ? "Low Exposure (Hardened)" : auditScore >= 50 ? "Moderate Risk" : "High Exposure"}
                    </Pill>
                  </div>
                  <p className="text-xs text-text-fog mt-1">
                    {auditScore === 100
                      ? "Outstanding! You practice proactive cyber defense habits."
                      : "You have actionable security blind spots that adversaries actively exploit. Level up in our training modules!"}
                  </p>
                </div>

                <Link to="/training">
                  <Button variant="primary" size="sm" icon={<i className="ti ti-arrow-right" />}>
                    Fix My Weak Spots
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6. HANDS-ON SIMULATION SANDBOXES SHOWCASE ── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="eyebrow">Experiential Learning</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-text-pure sm:text-3xl">
            Simulations That Build Muscle Memory
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-fog leading-relaxed">
            Slide decks don't stop hackers. CyberGuard places you inside safe virtual environments where you can safely experience attacks, inspect payloads, and practice emergency response.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <i className="ti ti-mail-bolt text-xl" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-ash">Interactive Client</span>
              <h3 className="font-display text-base font-bold text-text-pure mt-1">Phishing Mail Sandbox</h3>
              <p className="text-xs text-text-fog mt-2 leading-relaxed">
                Step into a full simulated email client. Inspect spoofed RFC headers, verify SPF/DKIM flags, and report malicious links.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-primary hover:underline flex items-center justify-between">
                <span>Launch Sandbox</span>
                <i className="ti ti-chevron-right text-xs" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-4">
                <i className="ti ti-message-chatbot text-xl" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-ash">Mobile Lab</span>
              <h3 className="font-display text-base font-bold text-text-pure mt-1">SMS Smishing Simulator</h3>
              <p className="text-xs text-text-fog mt-2 leading-relaxed">
                Experience deceptive banking alerts, parcel delivery updates, and fake lottery lures inside a realistic mobile smartphone interface.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-cyan-500 hover:underline flex items-center justify-between">
                <span>Launch Lab</span>
                <i className="ti ti-chevron-right text-xs" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger mb-4">
                <i className="ti ti-file-lock text-xl" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-ash">Incident Triage</span>
              <h3 className="font-display text-base font-bold text-text-pure mt-1">Ransomware Quarantine</h3>
              <p className="text-xs text-text-fog mt-2 leading-relaxed">
                A workstation is compromised by encrypting malware. Can you isolate the network segment and kill command channels in under 60 seconds?
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border">
              <Link to="/simulations" className="text-xs font-semibold text-danger hover:underline flex items-center justify-between">
                <span>Launch Drill</span>
                <i className="ti ti-chevron-right text-xs" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                <i className="ti ti-key text-xl" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-ash">Security Toolkit</span>
              <h3 className="font-display text-base font-bold text-text-pure mt-1">Entropy &amp; Crack Calculator</h3>
              <p className="text-xs text-text-fog mt-2 leading-relaxed">
                Real-time mathematical entropy analyzer that calculates how many minutes, years, or centuries it takes GPUs to crack your passphrase.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border">
              <Link to="/tools" className="text-xs font-semibold text-emerald-500 hover:underline flex items-center justify-between">
                <span>Launch Tool</span>
                <i className="ti ti-chevron-right text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. EMERGENCY SOS: UNDER ATTACK RIGHT NOW? ── */}
      <section className="py-16 border-t border-border bg-danger/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl border border-danger/20 bg-surface p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger text-white">
                <i className="ti ti-sos text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-danger">Emergency Action: Suspect You Just Got Hacked?</h3>
                <p className="text-xs text-text-ash">Follow these 4 immediate containment steps if you clicked a bad link or shared credentials.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-6">
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs">
                <span className="font-mono text-danger font-bold">STEP 01</span>
                <p className="font-semibold text-text-pure mt-1">Sever Connections</p>
                <p className="text-[11px] text-text-fog mt-0.5">Disconnect device Wi-Fi and mobile data immediately to halt malware exfiltration.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs">
                <span className="font-mono text-danger font-bold">STEP 02</span>
                <p className="font-semibold text-text-pure mt-1">Reset Passwords</p>
                <p className="text-[11px] text-text-fog mt-0.5">From a clean secondary device, immediately change your primary email and bank passwords.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs">
                <span className="font-mono text-danger font-bold">STEP 03</span>
                <p className="font-semibold text-text-pure mt-1">Revoke Sessions</p>
                <p className="text-[11px] text-text-fog mt-0.5">In Google/Apple/Microsoft account settings, click 'Log out of all other active devices'.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-elevated text-xs">
                <span className="font-mono text-danger font-bold">STEP 04</span>
                <p className="font-semibold text-text-pure mt-1">Report Incident</p>
                <p className="text-[11px] text-text-fog mt-0.5">File an incident report on CyberGuard or notify your bank's 24/7 fraud helpline.</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-text-ash">CyberGuard Incident Desk provides guided containment checklists.</span>
              <Link to="/report">
                <Button variant="secondary" size="xs" icon={<i className="ti ti-flag" />}>
                  Submit Scam Incident
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FINAL DEFENSE CALL TO ACTION ── */}
      <section className="py-20 border-t border-border text-center">
        <div className="max-w-xl mx-auto px-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-5">
            <i className="ti ti-shield-check text-2xl" />
          </div>
          <h2 className="font-display text-3xl font-bold text-text-pure">
            Make Cyber Safety An Instinct, Not An Afterthought.
          </h2>
          <p className="mt-3 text-sm text-text-fog leading-relaxed">
            Join thousands of individuals, students, and defenders who test their security instincts on CyberGuard.
            Accessible, zero-risk, and engineered for real-life safety.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={<i className="ti ti-arrow-right" />}>
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Quick Demo Access
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
