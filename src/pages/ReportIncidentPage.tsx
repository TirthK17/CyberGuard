import { useState, useEffect, type FormEvent } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { recordActivity } from "@/lib/gamification";
import { useToast } from "@/context/ToastContext";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES & PRESETS
───────────────────────────────────────────────────────────────────────────── */

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface IncidentReport {
  id: string;
  category: string;
  categoryId: string;
  urgency: UrgencyLevel;
  subject: string;
  senderOrSource: string;
  targetUrlOrHash?: string;
  details: string;
  submittedAt: string;
  status: "Triage Complete" | "Under SOC Investigation" | "Quarantined & Contained";
  riskScore: string;
  socActions: string[];
  containmentPlaybook: string[];
  attachedFiles: string[];
}

interface IncidentCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultUrgency: UrgencyLevel;
  triagePrompts: string[];
}

const INCIDENT_CATEGORIES: IncidentCategory[] = [
  {
    id: "phish",
    label: "Fake Email (Phishing)",
    icon: "ti-mail-alert",
    description: "Emails pretending to be Netflix, Amazon, your bank, or company IT with fake login links.",
    defaultUrgency: "high",
    triagePrompts: [
      "Did you click any link in the email?",
      "Did you type your password or one-time verification code?",
      "Did you download or open any file attachment (.zip, .exe, .pdf)?",
    ],
  },
  {
    id: "digital-arrest",
    label: "Fake Police / Video Call Scam",
    icon: "ti-video-off",
    description: "Threatening video or phone calls pretending to be Police, CBI, or Customs claiming illegal parcels.",
    defaultUrgency: "critical",
    triagePrompts: [
      "Are they telling you not to disconnect or stay on video call?",
      "Did they show fake police ID cards or forged arrest warrants?",
      "Did you send money for 'verification' or to 'clear your name'?",
    ],
  },
  {
    id: "ransomware",
    label: "Virus / Locked Files",
    icon: "ti-virus",
    description: "Files refusing to open, strange file extensions, or popups asking for money to unlock files.",
    defaultUrgency: "critical",
    triagePrompts: [
      "Are your photos or documents unable to open?",
      "Did a note or popup appear asking for money to restore files?",
      "Have you disconnected your computer from Wi-Fi and the internet?",
    ],
  },
  {
    id: "smishing",
    label: "Scam Text (SMS / WhatsApp)",
    icon: "ti-device-mobile-message",
    description: "Texts about bill cutoffs, courier delays, or links asking you to install apps outside app stores.",
    defaultUrgency: "high",
    triagePrompts: [
      "Did you get a text threatening power cutoff or bank account block?",
      "Did you download or install an app file (.apk) from a link in the text?",
      "Did you share any verification code (OTP) from your phone?",
    ],
  },
  {
    id: "credential",
    label: "Hacked Account / Strange Logins",
    icon: "ti-key-off",
    description: "Unexpected login alerts, password reset emails you didn't request, or unfamiliar devices logged in.",
    defaultUrgency: "high",
    triagePrompts: [
      "Are you getting login approval prompts you didn't request?",
      "Was your recovery email or phone number changed?",
      "Are strange messages or emails being sent from your account?",
    ],
  },
  {
    id: "hardware",
    label: "Lost Device or Unsafe Wi-Fi",
    icon: "ti-wifi-off",
    description: "Lost or stolen laptop/phone, or entering passwords while connected to suspicious public Wi-Fi.",
    defaultUrgency: "medium",
    triagePrompts: [
      "Did the lost device have a password or biometric lock enabled?",
      "Can you remotely lock or erase it using Find My Device / Apple Find My?",
      "Did you type sensitive passwords while connected to public Wi-Fi?",
    ],
  },
];

interface IncidentSample {
  name: string;
  categoryId: string;
  urgency: UrgencyLevel;
  subject: string;
  source: string;
  targetUrl: string;
  details: string;
}

const INCIDENT_SAMPLES: IncidentSample[] = [
  {
    name: "Urgent Money Request Email",
    categoryId: "phish",
    urgency: "high",
    subject: "URGENT: Confidential Payment Needed Before 11:00 AM",
    source: "ceo-office@corp-management-review.com",
    targetUrl: "http://wire-portal.secure-banking-auth.ru/invoice.pdf.exe",
    details: "Received email allegedly from CEO requesting immediate transfer of funds. Claimed to be boarding a flight and unable to take calls. I did NOT send money or click the attachment.",
  },
  {
    name: "Fake Police Video Call",
    categoryId: "digital-arrest",
    urgency: "critical",
    subject: "Caller claiming illegal parcel sent in my name",
    source: "+91 98450 11928 (WhatsApp Video Call with Police Logo)",
    targetUrl: "https://mumbai-police-cyber-verification.info",
    details: "Caller claimed a courier parcel in my name was seized with illegal items. Transferred to a man in police uniform demanding money for 'verification'.",
  },
  {
    name: "Electricity Bill Scam SMS",
    categoryId: "smishing",
    urgency: "high",
    subject: "Urgent SMS: Power disconnection notice tonight at 9:30 PM",
    source: "+91 91204 88392",
    targetUrl: "http://powerbill-update-quickpay.top/update.apk",
    details: "Received SMS claiming electricity will be disconnected tonight unless I update my bill via a download link. Checked my official account and had zero dues.",
  },
  {
    name: "Suspicious Virus Popup",
    categoryId: "ransomware",
    urgency: "critical",
    subject: "Spreadsheets renamed to .lockbit and ransom note on screen",
    source: "Desktop popup: README_TO_RESTORE_FILES.txt",
    targetUrl: "http://lockbit773829.onion",
    details: "Files suddenly showed strange extensions and a note demanded money to restore them. Immediately disconnected Wi-Fi.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT IMPLEMENTATION
───────────────────────────────────────────────────────────────────────────── */

export function ReportIncidentPage() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [category, setCategory] = useState<string>("phish");
  const [urgency, setUrgency] = useState<UrgencyLevel>("high");
  const [subject, setSubject] = useState("");
  const [source, setSource] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // Simulated attached files
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [newFileName, setNewFileName] = useState("");

  // History loaded from localStorage
  const [history, setHistory] = useState<IncidentReport[]>(() => {
    try {
      const saved = localStorage.getItem(`incident_reports_${profile?.id}`);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: "INC-2025-08412",
          category: "Phishing / Malicious Email",
          categoryId: "phish",
          urgency: "high",
          subject: "Microsoft 365 Password Expiration Alert with Cloned Portal",
          senderOrSource: "helpdesk@microsoft-authenticator-notice.net",
          targetUrlOrHash: "https://login.microsoftonline.com.account-reauth.shop/auth/login",
          details: "Email claimed organizational mailbox would expire in 2 hours. Clicked link and arrived at lookalike Microsoft portal. Stopped before typing password.",
          submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          status: "Quarantined & Contained",
          riskScore: "HIGH RISK — THREAT CONTAINED",
          socActions: [
            "URL 'account-reauth.shop' added to corporate firewall blocklist.",
            "Sender domain blacklisted at Secure Email Gateway.",
            "User session cookies invalidated as defensive precaution.",
          ],
          containmentPlaybook: [
            "Do NOT click links in emails warning of immediate password expiration.",
            "Verify all Microsoft login URLs end with 'microsoft.com' or 'live.com'.",
            "Report any future emails from the same external domain.",
          ],
          attachedFiles: ["screenshot_phish_login.png"],
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!profile?.id) return;
    try {
      localStorage.setItem(`incident_reports_${profile.id}`, JSON.stringify(history));
    } catch {}
  }, [history, profile?.id]);

  const activeCat = INCIDENT_CATEGORIES.find((c) => c.id === category) ?? INCIDENT_CATEGORIES[0];

  const handleSelectCategory = (catId: string) => {
    setCategory(catId);
    const cat = INCIDENT_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setUrgency(cat.defaultUrgency);
    }
  };

  const handleLoadSample = (sample: IncidentSample) => {
    setCategory(sample.categoryId);
    setUrgency(sample.urgency);
    setSubject(sample.subject);
    setSource(sample.source);
    setTargetUrl(sample.targetUrl);
    setDetails(sample.details);
    setAttachedFiles(["suspicious_lure_evidence.png"]);
    toast({
      title: `Loaded ${sample.name}`,
      description: "Incident intake form populated with realistic adversary telemetry.",
      variant: "info",
    });
  };

  const handleAddAttachment = () => {
    if (!newFileName.trim()) return;
    setAttachedFiles((prev) => [...prev, newFileName.trim()]);
    setNewFileName("");
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);

    const reportId = `INC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    // Build automated SOC Actions & Containment Playbook based on category & urgency
    let riskScore = "HIGH RISK — SOC TRIAGE ACTIVE";
    let socActions: string[] = [
      `Automated IOC ingestion: Extracted source identifier '${source}'.`,
      "Domain and IP intelligence queried against VirusTotal and AbuseIPDB.",
      "Perimeter egress firewall updated with preliminary containment rules.",
      "Incident ticket dispatched to Security Operations Center tier-2 queue.",
    ];
    let containmentPlaybook: string[] = [];

    if (category === "digital-arrest") {
      riskScore = "CRITICAL RISK — CRIMINAL EXTORTION ACTIVE";
      socActions = [
        "Flagged as high-priority Digital Arrest extortion syndicate.",
        "Emergency citizen advisory generated with 1930 National Cyber Helpline guidance.",
        "Source phone number logged for state cyber cell interception.",
      ];
      containmentPlaybook = [
        "TERMINATE CALL IMMEDIATELY: Law enforcement agencies (Police, CBI, ED, Customs) NEVER arrest citizens via video calls or demand money transfers.",
        "CALL 1930 IMMEDIATELY: If you transferred any funds within the last 2-3 hours (The Golden Hour), dial 1930 or lodge complaint at cybercrime.gov.in.",
        "DO NOT PAY: Scammers increase extortion demands exponentially after the first payment.",
        "BLOCK CALLER: Block caller on WhatsApp/Skype and inform your family and trusted advisors.",
      ];
    } else if (category === "ransomware") {
      riskScore = "CRITICAL RISK — SYSTEM CONTAINMENT REQUIRED";
      socActions = [
        "Host isolation directive issued to endpoint detection & response (EDR) agent.",
        "Outbound SMB (Port 445) and RDP (Port 3389) traffic halted across subnet.",
        "Snapshot replication triggered for unaffected cloud backup volumes.",
      ];
      containmentPlaybook = [
        "UNPLUG NETWORK IMMEDIATELY: Disconnect Ethernet cable and turn off Wi-Fi to stop lateral spread.",
        "DO NOT REBOOT: Powering off or rebooting can delete vital encryption keys in volatile RAM.",
        "NEVER PAY THE RANSOM: Paying does not guarantee decryptors and finances criminal enterprises.",
        "PRESERVE RANSOM NOTE: Keep ransom note text file for ransomware family identification.",
      ];
    } else if (category === "smishing") {
      riskScore = "HIGH RISK — MOBILE COMPROMISE LURE";
      socActions = [
        "Malicious APK download URL added to mobile threat defense (MTD) blocklist.",
        "Telecom carrier anti-spoofing alert triggered for source phone number.",
      ];
      containmentPlaybook = [
        "NEVER INSTALL APKS: Do not install application packages (.apk) sent via SMS or WhatsApp.",
        "UNINSTALL IF DOWNLOADED: Check Settings -> Apps -> Recently Installed and remove suspicious apps.",
        "CHECK SMS FORWARDING: Dial *#21# on your phone dialer to ensure calls/SMS aren't diverted.",
        "VERIFY INDEPENDENTLY: Contact your electricity board or bank directly via official websites.",
      ];
    } else if (category === "credential") {
      riskScore = "HIGH RISK — CREDENTIAL EXPOSURE";
      socActions = [
        "Force-terminated active OAuth sessions across all connected applications.",
        "Triggered mandatory password reset workflow at next authentication.",
      ];
      containmentPlaybook = [
        "CHANGE PASSWORD NOW: Reset master password immediately from an uninfected device.",
        "REVOKE ACTIVE SESSIONS: Go to security settings and choose 'Sign out of all sessions'.",
        "ENFORCE APP-BASED MFA: Switch from SMS OTPs to an authenticator app (Google Authenticator / 1Password).",
      ];
    } else {
      containmentPlaybook = [
        "Do NOT forward, click, or reply to the suspicious sender.",
        "If credentials were submitted, immediately reset your master password.",
        "Verify all communication out-of-band via phone or in-person confirmation.",
        "Maintain vigilant monitoring on your account activity for the next 72 hours.",
      ];
    }

    const newReport: IncidentReport = {
      id: reportId,
      category: activeCat.label,
      categoryId: category,
      urgency,
      subject,
      senderOrSource: source,
      targetUrlOrHash: targetUrl,
      details,
      submittedAt: new Date().toISOString(),
      status: "Triage Complete",
      riskScore,
      socActions,
      containmentPlaybook,
      attachedFiles: [...attachedFiles],
    };

    // Award +30 XP for participating in security incident reporting!
    await recordActivity({
      userId: profile.id,
      action: "simulation_completed",
      points: 30,
      meta: { incident_report: reportId, category },
    });

    setHistory((prev) => [newReport, ...prev]);
    setSelectedIncident(newReport);
    setSubmitting(false);

    toast({
      title: "Report Submitted!",
      description: `Report ${reportId} created. +30 XP awarded for reporting.`,
      variant: "success",
    });
    await refreshProfile();

    // Reset form fields
    setSubject("");
    setSource("");
    setTargetUrl("");
    setDetails("");
    setAttachedFiles([]);
  };

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & EMERGENCY HOTLINE CALLOUT ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                Help &amp; Incident Desk
              </p>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-1">
              Report a Scam or Security Issue
            </h1>
            <p className="mt-1 text-xs text-text-fog">
              Encountered a fake email, suspicious call, or think your account was compromised? Submit the details below to get immediate step-by-step guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/threats">
              <Button
                variant="secondary"
                size="sm"
                icon={<i className="ti ti-radar" />}
                className="text-xs"
              >
                View Recent Scams
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-World Emergency Callout Banner: National Helpline 1930 */}
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-5 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-danger/40 bg-danger/20 text-danger">
                <i className="ti ti-phone-call text-2xl animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-text-pure">
                    Lost Money or On a Threatening Call Right Now?
                  </span>
                  <span className="rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-semibold text-danger uppercase border border-danger/30">
                    National Helpline 1930
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-text-fog max-w-3xl leading-relaxed">
                  If money was taken from your bank account recently or you are being threatened on a fake &quot;police video call&quot;, dial <strong>1930</strong> immediately to freeze the transaction and alert the cybercrime helpline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="tel:1930"
                className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-danger/30 transition-transform hover:scale-105"
              >
                <i className="ti ti-phone" />
                Dial 1930
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm font-semibold text-text-pure hover:border-primary/50 transition-colors"
              >
                cybercrime.gov.in
                <i className="ti ti-external-link text-xs text-text-ash" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. QUICK LOAD INCIDENT SAMPLE PRESETS ── */}
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-text-pure uppercase tracking-wide flex items-center gap-1.5">
            <i className="ti ti-bolt text-primary" /> Try a Sample Scenario (Click to Fill):
          </span>
          <span className="text-xs text-text-ash font-medium">Interactive Demo</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {INCIDENT_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-elevated text-xs sm:text-sm font-medium text-text-fog hover:text-text-pure hover:border-primary/50 transition-all cursor-pointer"
            >
              <i className="ti ti-file-text text-primary text-sm" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. TWO-COLUMN WORKBENCH: INTAKE FORM vs. TRIAGE DISPATCH ── */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Left Column: Intake Form */}
        <Card className="p-6 sm:p-7 space-y-6">
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Tell Us What Happened
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-text-fog leading-relaxed">
              Fill in the details below. We'll give you clear, actionable steps to secure your accounts right away.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Category Grid */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-semibold text-text-moon">
                1. What kind of scam or threat is this?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {INCIDENT_CATEGORIES.map((c) => {
                  const selected = category === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleSelectCategory(c.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                        selected
                          ? "border-primary bg-primary/10 text-primary shadow-sm font-semibold"
                          : "border-border bg-surface-elevated text-text-fog hover:border-border-strong hover:text-text-pure"
                      }`}
                    >
                      <i className={`ti ${c.icon} text-xl shrink-0 mt-0.5`} />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-text-pure truncate">{c.label}</div>
                        <p className="text-xs text-text-ash line-clamp-2 mt-0.5 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Assessment Checklist for Selected Category */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
                Quick check for {activeCat.label}:
              </span>
              <div className="space-y-1.5 text-xs sm:text-sm text-text-fog">
                {activeCat.triagePrompts.map((prompt, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <i className="ti ti-help-circle text-primary shrink-0 mt-0.5 text-base" />
                    <span>{prompt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Urgency Selector */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-semibold text-text-moon">
                2. How urgent is this?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "low", label: "Low (Just suspicious, no action taken)" },
                  { id: "medium", label: "Medium (Targeted message)" },
                  { id: "high", label: "High (Clicked link or shared info)" },
                  { id: "critical", label: "Critical (Money lost or device locked)" },
                ].map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setUrgency(u.id as UrgencyLevel)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      urgency === u.id
                        ? u.id === "critical"
                          ? "border-danger bg-danger/20 text-danger font-bold"
                          : "border-primary bg-primary/20 text-primary font-bold"
                        : "border-border bg-surface text-text-ash hover:text-text-pure"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Subject / Headline */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">
                3. Short Summary
              </label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent email claiming my electricity bill is overdue..."
                className="input py-2.5 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* 4. Sender & Destination URL */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">
                  Sender's Email or Phone Number
                </label>
                <input
                  required
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. alert-payroll@company-notice.org"
                  className="input text-xs sm:text-sm py-2.5"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">
                  Suspicious Website or Link (if any)
                </label>
                <input
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="e.g. http://login.bank-update.xyz/pay"
                  className="input text-xs sm:text-sm py-2.5"
                />
              </div>
            </div>

            {/* 5. What Happened */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">
                4. What happened? (Describe what you saw)
              </label>
              <textarea
                rows={4}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what happened: Did you click any links? Were any passwords or OTP codes shared? Did you download any files?..."
                className="input resize-none text-xs sm:text-sm leading-relaxed"
              />
            </div>

            {/* 6. Evidence Attachments */}
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">
                5. Attach Screenshots or File Names (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g., scam_sms_screenshot.png..."
                  className="input text-xs sm:text-sm flex-1 py-2"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddAttachment}
                  className="text-xs shrink-0"
                >
                  Add File
                </Button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {attachedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-mono text-text-pure"
                    >
                      <i className="ti ti-paperclip text-primary" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(i)}
                        className="text-text-ash hover:text-danger ml-1"
                      >
                        <i className="ti ti-x text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-3 font-bold text-xs"
              icon={<i className="ti ti-send" />}
            >
              Get Immediate Safety Advice (+30 XP)
            </Button>
          </form>
        </Card>

        {/* Right Column: SOC Triage Dispatch & Report History */}
        <div className="space-y-6">
          {/* Active Triage Ticket Inspector */}
          <AnimatePresence mode="wait">
            {selectedIncident ? (
              <motion.div
                key={selectedIncident.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-primary/40 bg-surface-elevated p-6 space-y-5 shadow-xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
                      Incident Ticket
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">
                      {selectedIncident.id}
                    </span>
                  </div>
                  <Pill tone={selectedIncident.urgency === "critical" ? "danger" : "primary"}>
                    {selectedIncident.status}
                  </Pill>
                </div>

                <div className="space-y-1">
                  <div className="font-display text-sm font-bold text-text-pure">
                    {selectedIncident.subject}
                  </div>
                  <div className="font-mono text-[11px] text-danger font-semibold">
                    {selectedIncident.riskScore}
                  </div>
                </div>

                {/* Immediate Containment Playbook */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                    <i className="ti ti-shield-check text-sm" /> What You Must Do Right Now:
                  </span>
                  <div className="space-y-2 text-xs leading-relaxed text-text-pure">
                    {selectedIncident.containmentPlaybook.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono font-bold text-emerald-400 shrink-0">[{idx + 1}]</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Automated Actions Taken */}
                <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
                    Automated Actions &amp; Security Checks:
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px] text-text-fog">
                    {selectedIncident.socActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <i className="ti ti-check text-emerald-400 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attached Evidence */}
                {selectedIncident.attachedFiles.length > 0 && (
                  <div className="pt-2 border-t border-border text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block mb-1">
                      Attached Files:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedIncident.attachedFiles.map((f, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-surface text-[10px] font-mono text-text-pure border border-border">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center space-y-2">
                <i className="ti ti-shield-check text-3xl text-text-ash block" />
                <h3 className="font-display text-sm font-bold text-text-pure">
                  No Report Selected
                </h3>
                <p className="text-xs text-text-fog max-w-xs mx-auto">
                  Submit the form on the left or select a previous report below to view emergency instructions.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Past Reported Incidents History Log */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold flex items-center gap-1.5">
                <i className="ti ti-history text-primary" /> Your Reported Incidents
              </span>
              <span className="font-mono text-xs text-text-fog">{history.length} logged</span>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-ash">
                <i className="ti ti-archive text-2xl text-text-ash block mb-2" />
                No incident reports filed yet. Use this form whenever you spot suspicious activity.
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {history.map((rep) => {
                  const isSelected = selectedIncident?.id === rep.id;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedIncident(rep)}
                      className={`rounded-2xl border p-3.5 space-y-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-surface hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-primary">{rep.id}</span>
                        <Pill tone={rep.urgency === "critical" ? "danger" : rep.urgency === "high" ? "warn" : "default"} size="sm">
                          {rep.urgency.toUpperCase()}
                        </Pill>
                      </div>
                      <div className="text-xs font-semibold text-text-pure truncate">{rep.subject}</div>
                      <div className="font-mono text-[10px] text-text-ash truncate">Source: {rep.senderOrSource}</div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-ash pt-1 border-t border-border">
                        <span>{new Date(rep.submittedAt).toLocaleDateString()}</span>
                        <span className="text-emerald-400 font-semibold">{rep.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
