import { useState } from "react";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { recordActivity } from "@/lib/gamification";
import { useToast } from "@/context/ToastContext";

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL 1: PASSWORD HEALTH & PASSPHRASE VAULT ENGINE
───────────────────────────────────────────────────────────────────────────── */

const COMMON_PASSWORDS = new Set([
  "123456", "password", "123456789", "12345", "12345678", "qwerty", "1234567",
  "dragon", "pussy", "baseball", "football", "welcome", "master", "monkey",
  "shadow", "sunshine", "princess", "superman", "michael", "charlie", "trustno1",
  "iloveyou", "admin", "admin123", "password123", "pass@123", "root"
]);

function calculatePasswordMetrics(password: string) {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      crackTimeSingleGpu: "Instant",
      crackTimeCluster: "Instant",
      isCommon: false,
      label: "Empty",
      tone: "default" as const,
      checks: [],
    };
  }

  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase().trim());

  let pool = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSymbol) pool += 33;

  const entropy = Math.round(password.length * Math.log2(pool || 1));
  const combinations = Math.pow(pool || 1, password.length);

  // Crack times: Single GPU = 1e8 guesses/sec, Cluster = 1e11 guesses/sec
  const formatTime = (secs: number) => {
    if (isCommon) return "Instant (< 1 millisecond)";
    if (secs < 1) return "Under 1 second";
    if (secs < 60) return `${Math.round(secs)} seconds`;
    if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
    if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
    if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
    if (secs < 31536000 * 100) return `${Math.round(secs / 31536000)} years`;
    if (secs < 31536000 * 1e6) return `${(secs / (31536000 * 1e3)).toFixed(1)}k years`;
    return "Millions of years (Immune)";
  };

  const crackTimeSingleGpu = formatTime(combinations / 1e8);
  const crackTimeCluster = formatTime(combinations / 1e11);

  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 14) score += 20;
  if (hasLower && hasUpper) score += 20;
  if (hasDigit) score += 20;
  if (hasSymbol) score += 20;
  if (isCommon) score = Math.min(score, 10);

  let label = "Very Weak";
  let tone: "danger" | "warn" | "cyan" | "success" = "danger";

  if (score >= 80) {
    label = "Fortified (Vault Ready)";
    tone = "success";
  } else if (score >= 60) {
    label = "Moderate (Acceptable)";
    tone = "cyan";
  } else if (score >= 40) {
    label = "Weak (Vulnerable)";
    tone = "warn";
  }

  const checks = [
    { label: "14+ characters minimum length", passed: password.length >= 14 },
    { label: "Includes uppercase & lowercase letters", passed: hasLower && hasUpper },
    { label: "Includes numeric digits (0–9)", passed: hasDigit },
    { label: "Includes special symbols (!@#$%^&*)", passed: hasSymbol },
    { label: "Resists known dictionary breach lists", passed: !isCommon && !/^(password|admin|123456|qwerty)/i.test(password) },
  ];

  return { score, entropy, crackTimeSingleGpu, crackTimeCluster, isCommon, label, tone, checks };
}

function generateStrongPassphrase(wordsCount = 4, separator = "-", includeNum = true, includeSym = true) {
  const dictionary = [
    "quantum", "cipher", "glacier", "falcon", "cobalt", "harbor", "zenith", "aurora",
    "matrix", "vector", "nebula", "titan", "vertex", "timber", "shield", "beacon",
    "sapphire", "obsidian", "monolith", "circuit", "vortex", "granite", "crypto", "stellar",
    "cascade", "radiant", "horizon", "solstice", "phantom", "bastion", "tempest", "eclipse"
  ];
  const selected: string[] = [];
  for (let i = 0; i < wordsCount; i++) {
    const r = Math.floor(Math.random() * dictionary.length);
    selected.push(dictionary[r]);
  }
  let result = selected.join(separator);
  if (includeNum) {
    const num = Math.floor(10 + Math.random() * 90);
    result += `${separator}${num}`;
  }
  if (includeSym) {
    const symbols = ["!", "@", "#", "$", "%", "*"];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    result += sym;
  }
  return result;
}

function PasswordAnalyzerTab() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordsCount, setWordsCount] = useState(4);
  const [separator, setSeparator] = useState("-");

  const metrics = calculatePasswordMetrics(password);

  const handleGenerate = () => {
    const gen = generateStrongPassphrase(wordsCount, separator);
    setPassword(gen);
    setShow(true);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Password Health &amp; Entropy Meter
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Test your password resilience against high-throughput GPU clusters (RTX 4090 rigs) and leaked dictionary tables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<i className="ti ti-wand" />}
              onClick={handleGenerate}
              className="text-xs font-semibold"
            >
              Generate Strong Passphrase
            </Button>
          </div>
        </div>

        {/* Input Box */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste any password/passphrase to test..."
            className="input pr-24 font-mono text-sm py-3"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="p-1.5 text-text-ash hover:text-text-pure transition-colors"
              title={show ? "Hide password" : "Show password"}
            >
              <i className={`ti ${show ? "ti-eye-off" : "ti-eye"} text-base`} />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!password}
              className="p-1.5 text-text-ash hover:text-text-pure transition-colors disabled:opacity-30"
              title="Copy to clipboard"
            >
              <i className={`ti ${copied ? "ti-check text-emerald-400" : "ti-copy"} text-base`} />
            </button>
          </div>
        </div>

        {metrics.isCommon && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center gap-2">
            <i className="ti ti-alert-triangle text-base shrink-0" />
            <span>
              <strong>Warning: Common Dictionary Match!</strong> This password appears in top leaked credential databases. Attackers test this within the first 0.001 seconds of an attack!
            </span>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">
              8x GPU Cluster Rig
            </span>
            <div className="font-display text-base sm:text-lg font-bold text-text-pure truncate">
              {metrics.crackTimeCluster}
            </div>
            <p className="text-[11px] text-text-fog">
              At 100 billion hash guesses / sec
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">
              Information Entropy
            </span>
            <div className="font-display text-base sm:text-lg font-bold text-primary">
              {metrics.entropy} bits
            </div>
            <p className="text-[11px] text-text-fog">
              Mathematical randomness index
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">
              Vault Health Score
            </span>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-bold text-text-pure">
                {metrics.score}%
              </span>
              <Pill tone={metrics.tone}>{metrics.label}</Pill>
            </div>
            <ProgressBar value={metrics.score} className="mt-1" />
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="border-t border-border pt-5 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
            Defensive Criteria Validation
          </span>
          <div className="grid gap-2 sm:grid-cols-2">
            {metrics.checks.map((chk, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs p-2 rounded-lg bg-surface">
                <i
                  className={`ti ${
                    chk.passed
                      ? "ti-circle-check-filled text-emerald-400"
                      : "ti-circle-x text-text-ash"
                  } text-sm`}
                />
                <span className={chk.passed ? "text-text-pure font-medium" : "text-text-ash"}>
                  {chk.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Passphrase Generator Settings Drawer */}
        <div className="border-t border-border pt-5 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
            Passphrase Generator Settings:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-fog">Length:</span>
              {[3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setWordsCount(cnt)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                    wordsCount === cnt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-ash"
                  }`}
                >
                  {cnt} Words
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-text-fog">Separator:</span>
              {["-", "_", "."].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => setSeparator(sep)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                    separator === sep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-ash"
                  }`}
                >
                  &apos;{sep}&apos;
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL 2: LIVE PHISHING URL & EMAIL THREAT DISSECTOR
───────────────────────────────────────────────────────────────────────────── */

interface PhishingSample {
  id: string;
  name: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  subject: string;
  date: string;
  body: string;
  targetLink: string;
  linkText: string;
  redFlags: string[];
}

const PHISHING_SAMPLES: PhishingSample[] = [
  {
    id: "sample-1",
    name: "Executive Wire Request (CEO Fraud)",
    senderName: "Robert Vance (CEO)",
    senderEmail: "ceo-office@company-corp-internal.com",
    replyTo: "exec-vance992@gmail.com",
    subject: "URGENT & CONFIDENTIAL: Acquisition Wire Transfer Instructions",
    date: "Today, 08:42 AM",
    body: "Hi team, I am currently boarding a flight and cannot take calls. We are closing the confidential vendor buyout today. Please immediately execute a domestic wire of $48,200 to the attached invoice account details before 11:00 AM cut-off. Do not discuss this with the rest of the department until formally announced.",
    targetLink: "http://wire-portal.secure-banking-auth.ru/invoice.pdf.exe",
    linkText: "Download Wire_Invoice_Confidential.pdf",
    redFlags: [
      "Manufactured urgency & artificial time deadline ('before 11:00 AM cut-off')",
      "Executive impersonation with communication lockout ('currently boarding a flight, cannot take calls')",
      "Mismatched reply-to address pointing to a personal Gmail account instead of corporate domain",
      "Lookalike spoofed domain (@company-corp-internal.com instead of verified primary domain)",
      "Executable file (.pdf.exe) disguised as an innocent PDF invoice document",
    ],
  },
  {
    id: "sample-2",
    name: "Microsoft 365 Password Expiration Notice",
    senderName: "IT Support Center",
    senderEmail: "helpdesk-noreply@microsoft-authenticator-notice.net",
    replyTo: "helpdesk-noreply@microsoft-authenticator-notice.net",
    subject: "Action Required: 3 Pending Messages Kept on Hold (Password Expires Today)",
    date: "Today, 10:15 AM",
    body: "Your organizational password for user mailbox will expire in 2 hours. As a result, 3 incoming encrypted emails are currently held on the exchange queue. Click below to retain your current credentials and release incoming transmissions without service disruption.",
    targetLink: "https://login.microsoftonline.com.account-reauth.shop/auth/login",
    linkText: "Keep Same Password & Release Emails",
    redFlags: [
      "Artificial threat of lost productivity ('3 incoming encrypted emails held on exchange')",
      "Deceptive subdomain trickery: real domain is 'account-reauth.shop', NOT 'microsoftonline.com'",
      "Legitimate IT departments never send external links allowing you to 'keep' expired credentials",
      "Generic non-personalized salutation ('user mailbox' instead of your employee name)",
    ],
  },
  {
    id: "sample-3",
    name: "FedEx Delivery Exception & Customs Fee",
    senderName: "FedEx Tracking Alerts",
    senderEmail: "notifications@delivery-tracking-update-portal.org",
    replyTo: "no-reply@delivery-tracking-update-portal.org",
    subject: "Shipment #FDX-8829104: Delivery Delayed - Address Incomplete ($2.85 fee)",
    date: "Yesterday, 04:20 PM",
    body: "We attempted delivery of your priority parcel today at 14:15. Due to an incomplete street address, the parcel was returned to our sorting center. To re-dispatch your package tomorrow, confirm your postal details and settle the pending $2.85 redelivery insurance fee.",
    targetLink: "http://fedex-package-redelivery-portal.xyz/pay",
    linkText: "Update Postal Address & Reschedule Delivery",
    redFlags: [
      "Smishing / Phishing delivery lure taking advantage of online shopping habits",
      "Requesting small payment ($2.85) designed to harvest full credit card credentials & CVVs",
      "Suspicious top-level domain (.xyz / .org) completely unrelated to official fedex.com",
      "Unsolicited tracking notification without specifying what package was ordered",
    ],
  },
];

function analyzeCustomUrl(rawUrl: string) {
  if (!rawUrl.trim()) return null;

  let parsed: URL | null = null;
  try {
    const toParse = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `http://${rawUrl}`;
    parsed = new URL(toParse);
  } catch {
    return {
      isValid: false,
      hostname: "Invalid URL format",
      protocol: "none",
      verdict: "INVALID",
      score: 0,
      flags: ["The input is not a syntactically valid web URL."],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const flags: string[] = [];
  let threatPoints = 0;

  // 1. Protocol check
  if (parsed.protocol === "http:") {
    flags.push("Insecure HTTP protocol: unencrypted network transmission allows traffic eavesdropping.");
    threatPoints += 25;
  }

  // 2. IP address as host
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    flags.push("Host is a bare IP address rather than a registered domain name (common in automated malware C2).");
    threatPoints += 35;
  }

  // 3. Suspicious TLDs
  const highRiskTlds = [".ru", ".xyz", ".top", ".shop", ".click", ".live", ".work", ".cfd", ".monster", ".sbs", ".buzz"];
  if (highRiskTlds.some((tld) => hostname.endsWith(tld))) {
    flags.push(`Uses a high-risk or low-cost top-level domain commonly abused by phishing kits.`);
    threatPoints += 25;
  }

  // 4. Subdomain spoofing
  const brandKeywords = ["microsoft", "google", "apple", "paypal", "netflix", "hdfc", "amazon", "chase", "bank"];
  for (const b of brandKeywords) {
    if (hostname.includes(b)) {
      const parts = hostname.split(".");
      const mainDomain = parts.slice(-2).join(".");
      if (!mainDomain.includes(b)) {
        flags.push(`Subdomain brand spoofing: includes '${b}' in a subdomain, but the real domain is '${mainDomain}'!`);
        threatPoints += 40;
      }
    }
  }

  // 5. Credential harvesting keywords in path or hostname
  const sensitiveWords = ["login", "verify", "update", "cancel", "secure", "auth", "billing", "signin", "reset"];
  for (const w of sensitiveWords) {
    if (parsed.pathname.includes(w) || hostname.includes(w)) {
      flags.push(`Contains credential-harvesting keyword '${w}'.`);
      threatPoints += 15;
      break;
    }
  }

  // 6. Dangerous file extensions
  if (/\.(exe|scr|vbs|bat|ps1|apk|iso)$/i.test(parsed.pathname)) {
    flags.push("Direct executable payload download detected (.exe/.apk/.scr)!");
    threatPoints += 50;
  }

  threatPoints = Math.min(threatPoints, 100);

  let verdict: "SAFE / CLEAN" | "SUSPICIOUS" | "CRITICAL PHISHING RISK" = "SAFE / CLEAN";
  let tone: "emerald" | "warning" | "danger" = "emerald";

  if (threatPoints >= 60) {
    verdict = "CRITICAL PHISHING RISK";
    tone = "danger";
  } else if (threatPoints >= 25) {
    verdict = "SUSPICIOUS";
    tone = "warning";
  }

  return {
    isValid: true,
    hostname,
    protocol: parsed.protocol,
    verdict,
    tone,
    score: threatPoints,
    flags: flags.length ? flags : ["No overt suspicious patterns detected in static URL structure."],
  };
}

function PhishingInspectorTab() {
  const [subMode, setSubMode] = useState<"live" | "samples">("live");
  const [customInput, setCustomInput] = useState("https://login.microsoft.com.account-update.ru/auth/login.exe");
  const [selectedId, setSelectedId] = useState<string>(PHISHING_SAMPLES[0].id);
  const [analyzed, setAnalyzed] = useState(false);

  const sample = PHISHING_SAMPLES.find((s) => s.id === selectedId) ?? PHISHING_SAMPLES[0];
  const urlAnalysis = analyzeCustomUrl(customInput);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubMode("live")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subMode === "live"
                ? "bg-primary text-white shadow-sm"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-link mr-1.5" /> Live Custom URL Analyzer
          </button>
          <button
            onClick={() => setSubMode("samples")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subMode === "samples"
                ? "bg-primary text-white shadow-sm"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-mail-opened mr-1.5" /> Phishing Email Case Samples
          </button>
        </div>
      </div>

      {subMode === "live" ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Live URL &amp; Domain Phishing Dissector
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Paste any suspicious link, domain, or SMS URL. The engine performs deep lexical dissection to identify lookalike subdomains, brand spoofing, and executable drops.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-text-pure uppercase">
              Target URL to Dissect:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Paste URL (e.g., https://login.paypal.com.verify-account.net/login)..."
                className="input flex-1 font-mono text-xs sm:text-sm py-2.5"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCustomInput("https://login.microsoft.com.account-update.ru/auth/login.exe")}
                className="text-xs shrink-0"
              >
                Sample URL
              </Button>
            </div>
          </div>

          {urlAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface-elevated p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-mono text-text-ash uppercase">
                    Dissection Hostname:
                  </span>
                  <div className="font-mono text-sm font-bold text-text-pure break-all">
                    {urlAnalysis.hostname}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Pill tone={urlAnalysis.tone} size="md">
                    {urlAnalysis.verdict}
                  </Pill>
                  <span className="text-xs font-mono font-bold text-text-pure">
                    Risk: {urlAnalysis.score}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-text-pure font-mono uppercase">
                  Detected Red Flags &amp; Structural Anomalies:
                </span>
                <div className="space-y-2">
                  {urlAnalysis.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-border text-xs leading-relaxed flex items-start gap-2.5"
                    >
                      <i className="ti ti-shield-alert text-danger font-bold text-sm shrink-0 mt-0.5" />
                      <span className="text-text-fog">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <h3 className="font-display text-base font-bold text-text-pure">
                Adversary Phishing Email Dissection Lab
              </h3>
              <p className="mt-1 text-xs text-text-fog">
                Inspect real-world adversary email techniques. Examine spoofed headers, lookalike subdomains, and hidden redirection payloads.
              </p>
            </div>
            {/* Sample Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {PHISHING_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setAnalyzed(false); }}
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors ${
                    selectedId === s.id
                      ? "border-primary bg-primary/20 text-primary font-bold"
                      : "border-border bg-surface text-text-ash hover:text-text-pure"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Email Frame */}
          <div className="rounded-2xl border border-border bg-surface-elevated overflow-hidden">
            {/* Headers */}
            <div className="border-b border-border bg-surface p-4 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-text-ash">From:</span>
                <span className="text-text-pure font-medium">
                  {sample.senderName} &lt;<span className="font-mono text-danger font-semibold">{sample.senderEmail}</span>&gt;
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-text-ash">Reply-To:</span>
                <span className="font-mono text-warn font-semibold">{sample.replyTo}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-text-ash">Subject:</span>
                <span className="text-text-pure font-bold">{sample.subject}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs leading-relaxed text-text-fog whitespace-pre-line">
                {sample.body}
              </p>

              <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-danger font-bold block">
                  Weaponized Link / Call-to-Action
                </span>
                <div className="text-sm font-semibold text-text-pure underline">
                  {sample.linkText}
                </div>
                <div className="text-xs font-mono text-danger break-all">
                  Hidden Destination: {sample.targetLink}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant={analyzed ? "secondary" : "primary"}
              size="sm"
              icon={<i className="ti ti-scan" />}
              onClick={() => setAnalyzed((a) => !a)}
              className="text-xs"
            >
              {analyzed ? "Hide Red Flag Annotations" : "Analyze Phishing Red Flags"}
            </Button>
            <span className="font-mono text-[11px] text-text-ash">
              {sample.redFlags.length} security indicators flagged
            </span>
          </div>

          <AnimatePresence>
            {analyzed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-primary/30 bg-primary/10 p-5 space-y-3"
              >
                <div className="flex items-center gap-2 font-display text-sm font-bold text-primary">
                  <i className="ti ti-shield-alert text-lg" />
                  <span>Defensive Threat Breakdown</span>
                </div>
                <ul className="space-y-2">
                  {sample.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-text-pure">
                      <span className="font-mono font-bold text-danger shrink-0 mt-0.5">[{i + 1}]</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL 3: WI-FI & NETWORK SECURITY AUDITOR
───────────────────────────────────────────────────────────────────────────── */

function WifiAuditorTab() {
  const [encType, setEncType] = useState<"open" | "wep" | "wpa2" | "wpa3">("open");
  const [location, setLocation] = useState<"home" | "cafe" | "airport">("cafe");
  const [hasVpn, setHasVpn] = useState(false);
  const [hasCertWarning, setHasCertWarning] = useState(false);

  // Compute Risk Metrics
  let riskScore = 0;
  const warnings: string[] = [];

  if (encType === "open") {
    riskScore += 45;
    warnings.push("Unencrypted Open Wi-Fi: Every network packet is broadcast in plain text over radio frequencies.");
  } else if (encType === "wep") {
    riskScore += 40;
    warnings.push("WEP Encryption: Deprecated and trivially broken in under 60 seconds with automated tools (Aircrack-ng).");
  } else if (encType === "wpa2") {
    riskScore += 10;
  }

  if (location === "cafe" || location === "airport") {
    riskScore += 25;
    warnings.push("Public Hotspot: Vulnerable to rogue 'Evil Twin' spoofing and local ARP cache poisoning.");
  }

  if (hasCertWarning) {
    riskScore += 40;
    warnings.push("CRITICAL: SSL/TLS Certificate Warning detected! High probability of active Man-in-the-Middle (MITM) proxy interception.");
  }

  if (hasVpn) {
    riskScore = Math.max(0, riskScore - 50);
  } else if (location !== "home") {
    warnings.push("No VPN Active: Local router operator and eavesdroppers can log DNS requests and unencrypted connections.");
  }

  riskScore = Math.min(riskScore, 100);
  const isSafe = riskScore < 30;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
            Public Wi-Fi &amp; Network Security Risk Auditor
          </h3>
          <p className="mt-1 text-xs text-text-fog">
            Evaluate your network environment before transmitting passwords or banking details. Calculate MITM interception exposure and test VPN shielding.
          </p>
        </div>

        {/* Configuration Parameters */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <span className="font-mono font-bold text-text-pure uppercase">
              1. Wireless Encryption Standard:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "open", label: "Open (No Password)" },
                { id: "wep",  label: "WEP (Legacy)" },
                { id: "wpa2", label: "WPA2-Personal" },
                { id: "wpa3", label: "WPA3 (Modern)" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEncType(item.id as typeof encType)}
                  className={`p-2 rounded-lg border text-left font-medium transition-all ${
                    encType === item.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-ash hover:text-text-pure"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <span className="font-mono font-bold text-text-pure uppercase">
              2. Physical Environment:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "home",    label: "Home / Office" },
                { id: "cafe",    label: "Coffee Shop" },
                { id: "airport", label: "Airport / Transit" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLocation(item.id as typeof location)}
                  className={`p-2 rounded-lg border text-center font-medium transition-all ${
                    location === item.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-text-ash hover:text-text-pure"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defense Toggles */}
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div
            onClick={() => setHasVpn(!hasVpn)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              hasVpn ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-surface-elevated"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`ti ti-shield-lock text-xl ${hasVpn ? "text-emerald-400" : "text-text-ash"}`} />
              <div>
                <strong className="block text-text-pure">Virtual Private Network (VPN)</strong>
                <span className="text-[11px] text-text-fog">
                  {hasVpn ? "Active: All packets encrypted in transit" : "Inactive: Raw packets exposed"}
                </span>
              </div>
            </div>
            <span className={`font-mono text-xs font-bold ${hasVpn ? "text-emerald-400" : "text-text-ash"}`}>
              {hasVpn ? "ENABLED" : "DISABLED"}
            </span>
          </div>

          <div
            onClick={() => setHasCertWarning(!hasCertWarning)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              hasCertWarning ? "border-danger bg-danger/10" : "border-border bg-surface-elevated"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`ti ti-alert-triangle text-xl ${hasCertWarning ? "text-danger" : "text-text-ash"}`} />
              <div>
                <strong className="block text-text-pure">SSL Certificate Warning</strong>
                <span className="text-[11px] text-text-fog">
                  {hasCertWarning ? "Warning Triggered on Network" : "Clean Certificate Handshake"}
                </span>
              </div>
            </div>
            <span className={`font-mono text-xs font-bold ${hasCertWarning ? "text-danger" : "text-text-ash"}`}>
              {hasCertWarning ? "DETECTED" : "NONE"}
            </span>
          </div>
        </div>

        {/* Assessment Scorecard */}
        <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-pure font-mono uppercase">
              Network Threat Telemetry:
            </span>
            <div className="flex items-center gap-2">
              <Pill tone={isSafe ? "emerald" : "danger"} size="md">
                {isSafe ? "PROTECTED / SECURE" : "VULNERABLE TO INTERCEPTION"}
              </Pill>
              <span className="font-mono text-xs font-bold text-text-pure">
                Risk: {riskScore}/100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {warnings.length ? (
              warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-text-pure p-2 rounded-lg bg-surface">
                  <i className="ti ti-alert-circle text-danger mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-400 p-2 rounded-lg bg-surface">
                <i className="ti ti-shield-check text-base" />
                <span>Modern WPA3 encryption with VPN tunneling provides robust network security.</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL 4: DATA BREACH & CREDENTIAL EXPOSURE SCANNER
───────────────────────────────────────────────────────────────────────────── */

interface BreachRecord {
  title: string;
  domain: string;
  breachDate: string;
  pwnCount: string;
  dataClasses: string[];
  description: string;
}

const HISTORICAL_BREACHES: BreachRecord[] = [
  {
    title: "Canva Creative Suite",
    domain: "canva.com",
    breachDate: "May 2019",
    pwnCount: "137 Million",
    dataClasses: ["Email addresses", "Passwords (salted bcrypt)", "Usernames", "Geographic locations"],
    description: "A malicious actor gained unauthorized access to internal database servers, extracting millions of user profiles.",
  },
  {
    title: "LinkedIn Professional Network",
    domain: "linkedin.com",
    breachDate: "June 2021",
    pwnCount: "700 Million",
    dataClasses: ["Email addresses", "Full names", "Phone numbers", "Physical addresses", "Job titles"],
    description: "An adversary exploited public API endpoints to scrape and correlate records of over 92% of all registered users.",
  },
  {
    title: "Adobe Creative Cloud",
    domain: "adobe.com",
    breachDate: "October 2013",
    pwnCount: "153 Million",
    dataClasses: ["Email addresses", "Password hints", "Encrypted passwords", "User IDs"],
    description: "Attackers breached customer servers, extracting encrypted source code and customer credentials.",
  },
  {
    title: "Dropbox Cloud Storage",
    domain: "dropbox.com",
    breachDate: "Mid 2012",
    pwnCount: "68 Million",
    dataClasses: ["Email addresses", "Passwords (hashed)"],
    description: "Credentials stolen from an employee account were used to access an internal project document containing customer accounts.",
  },
];

function BreachScannerTab() {
  const [query, setQuery] = useState("alex@example.com");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
            Dark Web Data Breach &amp; Credential Exposure Scanner
          </h3>
          <p className="mt-1 text-xs text-text-fog">
            Scan simulated threat intelligence databases to see if your email address or company domain was exposed in major historical breaches.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter an email address to check (e.g., user@domain.com)..."
            className="input flex-1 font-mono text-xs sm:text-sm py-2.5"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleScan}
            disabled={loading}
            className="text-xs font-bold shrink-0 px-6"
          >
            {loading ? "Scanning..." : "Check Breaches"}
          </Button>
        </div>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-between text-xs text-danger">
              <div className="flex items-center gap-2">
                <i className="ti ti-alert-triangle text-lg shrink-0" />
                <span>
                  Query <strong>{query}</strong> was detected in <strong>2 historic breach dumps</strong>.
                </span>
              </div>
              <Pill tone="danger" size="sm">EXPOSED</Pill>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-text-pure uppercase font-mono">
                Correlated Historical Incident Records:
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {HISTORICAL_BREACHES.slice(0, 2).map((b, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-text-pure font-bold text-sm">{b.title}</strong>
                      <span className="font-mono text-[11px] text-text-ash">{b.breachDate}</span>
                    </div>
                    <p className="text-text-fog leading-relaxed text-[11px]">
                      {b.description}
                    </p>
                    <div className="pt-2 border-t border-border">
                      <span className="text-[10px] font-mono text-text-ash block mb-1">Exposed Data:</span>
                      <div className="flex flex-wrap gap-1">
                        {b.dataClasses.map((dc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text-pure"
                          >
                            {dc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated border border-border text-xs space-y-2">
              <strong className="text-text-pure font-bold block">
                🛡️ Required Remediation Protocol:
              </strong>
              <ul className="space-y-1 text-text-fog pl-2">
                <li>• Change passwords immediately on accounts that shared this credential.</li>
                <li>• Enforce app-based Multi-Factor Authentication (TOTP / FIDO2).</li>
                <li>• Never reuse passwords across email and banking portals.</li>
              </ul>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL 5: PERSONAL CYBER HYGIENE AUDIT SCORECARD
───────────────────────────────────────────────────────────────────────────── */

interface HygieneCheck {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: string;
  points: number;
}

const HYGIENE_CHECKS: HygieneCheck[] = [
  {
    id: "mfa-email",
    category: "Authentication",
    title: "Multi-Factor Authentication on Primary Email",
    description: "App-based authenticator (Google Authenticator / 1Password) or hardware FIDO2 key active on your primary personal and corporate email accounts.",
    impact: "+25 Awareness XP",
    points: 25,
  },
  {
    id: "pwd-manager",
    category: "Authentication",
    title: "Dedicated Password Manager in Use",
    description: "All web credentials stored in an encrypted vault with 16+ character random passwords, zero human memory reuse.",
    impact: "+25 Awareness XP",
    points: 25,
  },
  {
    id: "os-updates",
    category: "System Integrity",
    title: "Automated Operating System & Browser Updates",
    description: "Auto-update enabled across your laptop and smartphone so zero-day security patches apply without human delay.",
    impact: "+20 Awareness XP",
    points: 20,
  },
  {
    id: "remote-wipe",
    category: "Physical Security",
    title: "Device Encryption & Find My / Remote Wipe Configured",
    description: "FileVault (macOS) or BitLocker (Windows) active, alongside remote wipe capability if laptop/phone is stolen.",
    impact: "+20 Awareness XP",
    points: 20,
  },
  {
    id: "backup-321",
    category: "Data Protection",
    title: "3-2-1 Rule Encrypted Backup Solution",
    description: "3 copies of critical data across 2 separate media, with at least 1 immutable offline/cloud copy protected against ransomware.",
    impact: "+30 Awareness XP",
    points: 30,
  },
  {
    id: "vpn-public",
    category: "Network Safety",
    title: "VPN Active on Untrusted Public Wi-Fi",
    description: "Tunnels all laptop/mobile traffic through an encrypted VPN when connecting at airports, cafes, or hotels.",
    impact: "+20 Awareness XP",
    points: 20,
  },
  {
    id: "privacy-social",
    category: "Social Engineering",
    title: "Social Media Privacy & Metadata Lock Down",
    description: "Work details, birthday, and location metadata locked to private connections to prevent spear-phishing reconnaissance.",
    impact: "+20 Awareness XP",
    points: 20,
  },
  {
    id: "phish-reporting",
    category: "Response",
    title: "Know Exactly How to Report Suspicious Incidents",
    description: "Familiar with company IT emergency contact, spam reporting button, and quarantine protocol.",
    impact: "+20 Awareness XP",
    points: 20,
  },
];

function CyberHygieneAuditTab() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`hygiene_${profile?.id}`);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggleCheck = async (check: HygieneCheck) => {
    const next = new Set(checkedIds);
    const wasChecked = next.has(check.id);
    if (wasChecked) {
      next.delete(check.id);
    } else {
      next.add(check.id);
      if (profile) {
        await recordActivity({
          userId: profile.id,
          action: "lesson_completed",
          points: check.points,
          meta: { audit_item: check.id },
        });
        toast({
          title: "Audit item confirmed!",
          description: `+${check.points} XP earned for verified security hygiene.`,
          variant: "success",
        });
        await refreshProfile();
      }
    }
    setCheckedIds(next);
    try {
      localStorage.setItem(`hygiene_${profile?.id}`, JSON.stringify(Array.from(next)));
    } catch {}
  };

  const total = HYGIENE_CHECKS.length;
  const passed = checkedIds.size;
  const pct = Math.round((passed / total) * 100);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Personal Cyber Hygiene Checklist
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Audit your everyday workstation defense posture. Check off verified habits to earn XP and boost your defense score.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-text-pure">
              <AnimatedNumber value={pct} suffix="%" />
            </span>
            <Pill tone={pct >= 80 ? "emerald" : pct >= 50 ? "primary" : "danger"}>
              {pct >= 80 ? "HARDENED" : pct >= 50 ? "PARTIALLY PROTECTED" : "EXPOSED"}
            </Pill>
          </div>
        </div>
        <ProgressBar value={pct} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {HYGIENE_CHECKS.map((item) => {
          const checked = checkedIds.has(item.id);
          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleCheck(item)}
              className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border ${
                checked
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm"
                  : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    checked
                      ? "border-emerald-500 bg-emerald-500 text-black font-bold"
                      : "border-border bg-surface-elevated text-transparent"
                  }`}
                >
                  <i className="ti ti-check text-xs font-bold" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-ash">
                      {item.category}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                      {item.impact}
                    </span>
                  </div>
                  <h4 className={`mt-1 font-display text-sm font-semibold ${checked ? "text-text-pure" : "text-text-fog"}`}>
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-text-ash">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN TOOLS CONTAINER PAGE
───────────────────────────────────────────────────────────────────────────── */

export function SecurityToolsPage() {
  const [activeTab, setActiveTab] = useState<"password" | "phish" | "wifi" | "breach" | "hygiene">("password");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="pb-2 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary font-mono">
            Defensive Utilities &amp; Diagnostics
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
            Security Toolkit
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Audit passwords, dissect suspicious URLs, test public Wi-Fi vulnerability, scan dark web breaches, and track workstation hygiene.
          </p>
        </div>

        {/* Responsive Segmented Tab Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border">
          {[
            { id: "password", label: "Passwords", icon: "ti-key" },
            { id: "phish",    label: "URL Inspector", icon: "ti-link" },
            { id: "wifi",     label: "Wi-Fi Auditor", icon: "ti-wifi" },
            { id: "breach",   label: "Breach Scanner", icon: "ti-spy" },
            { id: "hygiene",  label: "Hygiene Scorecard", icon: "ti-list-check" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
                }`}
              >
                <i className={`ti ${tab.icon} text-xs`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Active Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "password" && <PasswordAnalyzerTab />}
        {activeTab === "phish" && <PhishingInspectorTab />}
        {activeTab === "wifi" && <WifiAuditorTab />}
        {activeTab === "breach" && <BreachScannerTab />}
        {activeTab === "hygiene" && <CyberHygieneAuditTab />}
      </motion.div>
    </div>
  );
}
