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
    if (isCommon) return "Instant (< 1 second)";
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
    label = "Very Strong";
    tone = "success";
  } else if (score >= 60) {
    label = "Good";
    tone = "cyan";
  } else if (score >= 40) {
    label = "Weak";
    tone = "warn";
  }

  const checks = [
    { label: "At least 14 characters long", passed: password.length >= 14 },
    { label: "Uppercase & lowercase letters", passed: hasLower && hasUpper },
    { label: "Numbers (0–9)", passed: hasDigit },
    { label: "Special symbols (!@#$%^&*)", passed: hasSymbol },
    { label: "Not a commonly guessed word", passed: !isCommon && !/^(password|admin|123456|qwerty)/i.test(password) },
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
              Password Strength &amp; Passphrase Generator
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Test how hard your password is to guess and generate easy-to-remember, ultra-strong passphrases.
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
            placeholder="Type or paste any password to test..."
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
              <strong>Warning: Common Leaked Password!</strong> This password is listed in publicly known breach databases. Hackers can guess this in under a second!
            </span>
          </div>
        )}

        {/* Live Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="text-xs font-semibold text-text-ash block">
              Time to Guess
            </span>
            <div className="font-display text-base sm:text-lg font-bold text-text-pure truncate">
              {metrics.crackTimeCluster}
            </div>
            <p className="text-xs text-text-fog">
              Estimated time for automated guessing tools
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="text-xs font-semibold text-text-ash block">
              Complexity Rating
            </span>
            <div className="font-display text-base sm:text-lg font-bold text-primary">
              {metrics.entropy} / 100
            </div>
            <p className="text-xs text-text-fog">
              Based on length and variety of characters
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-elevated p-4 space-y-1">
            <span className="text-xs font-semibold text-text-ash block">
              Strength Score
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
          <span className="text-xs font-semibold uppercase tracking-wider text-text-ash block">
            Password Checklist:
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
          <span className="text-xs font-semibold uppercase tracking-wider text-text-ash block">
            Passphrase Generator Options:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-fog">Word Count:</span>
              {[3, 4, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setWordsCount(cnt)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
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
              <span className="text-text-fog">Divider:</span>
              {["-", "_", "."].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => setSeparator(sep)}
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
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
            <i className="ti ti-link mr-1.5" /> Check a Link
          </button>
          <button
            onClick={() => setSubMode("samples")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subMode === "samples"
                ? "bg-primary text-white shadow-sm"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-mail-opened mr-1.5" /> Sample Scam Emails
          </button>
        </div>
      </div>

      {subMode === "live" ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Suspicious Link &amp; Website Checker
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Paste any suspicious link or website you received in a text or email to check for fake domains, spoofed company names, and dangerous downloads.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-pure uppercase tracking-wider">
              Link to Check:
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
                Sample Link
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
                  <span className="text-xs font-semibold text-text-ash uppercase tracking-wider">
                    Website Address:
                  </span>
                  <div className="font-mono text-sm sm:text-base font-bold text-text-pure break-all">
                    {urlAnalysis.hostname}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Pill tone={urlAnalysis.tone} size="md">
                    {urlAnalysis.verdict}
                  </Pill>
                  <span className="text-xs font-semibold text-text-pure">
                    Risk: {urlAnalysis.score}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-pure uppercase tracking-wider">
                  Detected Red Flags:
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
                Sample Scam Emails
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-fog">
                Inspect real-life scam emails to see how attackers use fake sender addresses, artificial panic, and disguised links.
              </p>
            </div>
            {/* Sample Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {PHISHING_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setAnalyzed(false); }}
                  className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition-colors ${
                    selectedId === s.id
                      ? "border-primary bg-primary/20 text-primary"
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
                <span className="text-text-ash font-medium">From:</span>
                <span className="text-text-pure font-medium">
                  {sample.senderName} &lt;<span className="font-mono text-danger font-semibold">{sample.senderEmail}</span>&gt;
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-text-ash font-medium">Reply-To:</span>
                <span className="font-mono text-warn font-semibold">{sample.replyTo}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-text-ash font-medium">Subject:</span>
                <span className="text-text-pure font-bold">{sample.subject}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm leading-relaxed text-text-fog whitespace-pre-line">
                {sample.body}
              </p>

              <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 space-y-2">
                <span className="text-xs uppercase tracking-wider text-danger font-bold block">
                  Suspicious Link Inside Email
                </span>
                <div className="text-sm font-semibold text-text-pure underline">
                  {sample.linkText}
                </div>
                <div className="text-xs font-mono text-danger break-all">
                  Actual Destination: {sample.targetLink}
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
              className="text-xs font-semibold"
            >
              {analyzed ? "Hide Red Flags" : "Show Red Flags"}
            </Button>
            <span className="text-xs text-text-ash font-medium">
              {sample.redFlags.length} suspicious clues found
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
                  <span>Why This Is A Scam</span>
                </div>
                <ul className="space-y-2">
                  {sample.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed text-text-pure">
                      <span className="font-semibold text-danger shrink-0 mt-0.5">[{i + 1}]</span>
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
    warnings.push("Open Wi-Fi (No Password): Anyone nearby can potentially see which websites you connect to.");
  } else if (encType === "wep") {
    riskScore += 40;
    warnings.push("Old WEP Security: Outdated encryption that can be broken in under a minute by attackers.");
  } else if (encType === "wpa2") {
    riskScore += 10;
  }

  if (location === "cafe" || location === "airport") {
    riskScore += 25;
    warnings.push("Public Hotspot: Scammers can set up fake Wi-Fi networks with the same name to trick you.");
  }

  if (hasCertWarning) {
    riskScore += 40;
    warnings.push("Warning Message Detected: Your device alerted you about an unsafe security certificate. Do not type passwords or payment details!");
  }

  if (hasVpn) {
    riskScore = Math.max(0, riskScore - 50);
  } else if (location !== "home") {
    warnings.push("No VPN Active: Your browsing activity is visible to the network owner or router.");
  }

  riskScore = Math.min(riskScore, 100);
  const isSafe = riskScore < 30;

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
            Wi-Fi Safety Checker
          </h3>
          <p className="mt-1 text-xs text-text-fog">
            Check how safe your current Wi-Fi connection is before typing sensitive passwords or opening banking apps.
          </p>
        </div>

        {/* Configuration Parameters */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <span className="text-xs font-semibold text-text-pure uppercase tracking-wider">
              1. Wi-Fi Security Type:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "open", label: "Open (No Password)" },
                { id: "wep",  label: "WEP (Old / Insecure)" },
                { id: "wpa2", label: "WPA2 (Standard)" },
                { id: "wpa3", label: "WPA3 (Modern & Safest)" },
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
            <span className="text-xs font-semibold text-text-pure uppercase tracking-wider">
              2. Where are you connecting from?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "home",    label: "Home / Office" },
                { id: "cafe",    label: "Coffee Shop" },
                { id: "airport", label: "Airport / Hotel" },
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
                <strong className="block text-text-pure">VPN (Virtual Private Network)</strong>
                <span className="text-xs text-text-fog">
                  {hasVpn ? "Active: Your internet connection is encrypted" : "Off: Network owner can see websites visited"}
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold ${hasVpn ? "text-emerald-400" : "text-text-ash"}`}>
              {hasVpn ? "ON" : "OFF"}
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
                <strong className="block text-text-pure">Browser Warning Alert</strong>
                <span className="text-xs text-text-fog">
                  {hasCertWarning ? "Saw an 'Unsafe Connection' Warning" : "No Browser Warnings"}
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold ${hasCertWarning ? "text-danger" : "text-text-ash"}`}>
              {hasCertWarning ? "YES" : "NO"}
            </span>
          </div>
        </div>

        {/* Assessment Scorecard */}
        <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-pure uppercase tracking-wider">
              Safety Summary:
            </span>
            <div className="flex items-center gap-2">
              <Pill tone={isSafe ? "emerald" : "danger"} size="md">
                {isSafe ? "SAFE TO USE" : "UNSAFE FOR BANKING OR LOGINS"}
              </Pill>
              <span className="text-xs font-semibold text-text-pure">
                Risk Level: {riskScore}/100
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
                <span>Great protection! Modern encryption and VPN keep your network traffic private.</span>
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
    dataClasses: ["Email addresses", "Passwords (encrypted)", "Usernames", "Locations"],
    description: "Unauthorized attackers broke into database servers and copied millions of user profile records.",
  },
  {
    title: "LinkedIn",
    domain: "linkedin.com",
    breachDate: "June 2021",
    pwnCount: "700 Million",
    dataClasses: ["Email addresses", "Full names", "Phone numbers", "Physical addresses", "Job titles"],
    description: "Scrapers exploited public web endpoints to collect user information from over 90% of registered accounts.",
  },
  {
    title: "Adobe Creative Cloud",
    domain: "adobe.com",
    breachDate: "October 2013",
    pwnCount: "153 Million",
    dataClasses: ["Email addresses", "Password hints", "Encrypted passwords", "User IDs"],
    description: "Hackers accessed servers containing customer account records and encrypted passwords.",
  },
  {
    title: "Dropbox",
    domain: "dropbox.com",
    breachDate: "Mid 2012",
    pwnCount: "68 Million",
    dataClasses: ["Email addresses", "Passwords (hashed)"],
    description: "Stolen employee login credentials gave unauthorized attackers access to internal user lists.",
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
            Data Breach Checker
          </h3>
          <p className="mt-1 text-xs text-text-fog">
            Check if your email address was ever included in past major company data leaks.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your email address (e.g., alex@example.com)..."
            className="input flex-1 font-mono text-xs sm:text-sm py-2.5"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleScan}
            disabled={loading}
            className="text-xs font-bold shrink-0 px-6"
          >
            {loading ? "Checking..." : "Check Breaches"}
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
                  Email <strong>{query}</strong> was found in <strong>2 past public data leaks</strong>.
                </span>
              </div>
              <Pill tone="danger" size="sm">FOUND IN BREACH</Pill>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-text-pure uppercase tracking-wider">
                Past Incidents Involving This Email:
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {HISTORICAL_BREACHES.slice(0, 2).map((b, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-text-pure font-bold text-sm sm:text-base">{b.title}</strong>
                      <span className="text-xs text-text-ash font-medium">{b.breachDate}</span>
                    </div>
                    <p className="text-text-fog leading-relaxed text-xs sm:text-sm">
                      {b.description}
                    </p>
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs font-semibold text-text-ash block mb-1">Information Leaked:</span>
                      <div className="flex flex-wrap gap-1">
                        {b.dataClasses.map((dc, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded bg-surface border border-border text-xs font-medium text-text-pure"
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
                🛡️ Recommended Safety Steps:
              </strong>
              <ul className="space-y-1 text-text-fog pl-2">
                <li>• Change your password immediately on any service where you used this email and password.</li>
                <li>• Turn on two-step verification (2FA) with an authenticator app.</li>
                <li>• Never reuse the same password across multiple websites.</li>
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
    category: "Login Safety",
    title: "Two-Step Verification on Main Email",
    description: "An authenticator app or security key protects your personal and work email accounts against password theft.",
    impact: "+25 XP",
    points: 25,
  },
  {
    id: "pwd-manager",
    category: "Passwords",
    title: "Password Manager in Use",
    description: "All your logins are saved in a secure password manager with unique, long passwords for every website.",
    impact: "+25 XP",
    points: 25,
  },
  {
    id: "os-updates",
    category: "Devices",
    title: "Automatic System Updates Turned On",
    description: "Your phone and computer install security patches automatically so known glitches get fixed quickly.",
    impact: "+20 XP",
    points: 20,
  },
  {
    id: "remote-wipe",
    category: "Devices",
    title: "Device Lock & Find My Enabled",
    description: "Your laptop and phone require a PIN or biometric lock, and you can remotely lock or erase them if lost.",
    impact: "+20 XP",
    points: 20,
  },
  {
    id: "backup-321",
    category: "Backups",
    title: "Regular Backups of Important Files",
    description: "Your precious photos and documents are backed up to cloud storage or an external hard drive in case of virus infection.",
    impact: "+30 XP",
    points: 30,
  },
  {
    id: "vpn-public",
    category: "Wi-Fi Safety",
    title: "VPN on Public Wi-Fi",
    description: "You use a VPN or your phone's mobile hotspot whenever you connect to Wi-Fi at cafes or airports.",
    impact: "+20 XP",
    points: 20,
  },
  {
    id: "privacy-social",
    category: "Privacy",
    title: "Private Social Media Profiles",
    description: "Personal details like your birthday, phone number, and location are hidden from strangers online.",
    impact: "+20 XP",
    points: 20,
  },
  {
    id: "phish-reporting",
    category: "Good Habits",
    title: "Know How to Spot & Report Scams",
    description: "You recognize fake messages and report suspicious emails instead of clicking links or replying.",
    impact: "+20 XP",
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
          title: "Safety habit checked!",
          description: `+${check.points} XP earned for keeping good cyber safety habits.`,
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
              Daily Safety Checklist
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Check off your everyday security habits to earn XP points and boost your safety score.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-text-pure">
              <AnimatedNumber value={pct} suffix="%" />
            </span>
            <Pill tone={pct >= 80 ? "emerald" : pct >= 50 ? "primary" : "danger"}>
              {pct >= 80 ? "WELL PROTECTED" : pct >= 50 ? "PARTIALLY PROTECTED" : "NEEDS ATTENTION"}
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-ash">
                      {item.category}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {item.impact}
                    </span>
                  </div>
                  <h4 className={`mt-1 font-display text-sm sm:text-base font-semibold ${checked ? "text-text-pure" : "text-text-fog"}`}>
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-text-ash">
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
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Practical Tools
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
            Safety Tools
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Test password strength, inspect suspicious links, check Wi-Fi safety, and audit everyday digital habits.
          </p>
        </div>

        {/* Responsive Segmented Tab Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border">
          {[
            { id: "password", label: "Passwords", icon: "ti-key" },
            { id: "phish",    label: "Link Inspector", icon: "ti-link" },
            { id: "wifi",     label: "Wi-Fi Safety", icon: "ti-wifi" },
            { id: "breach",   label: "Breach Check", icon: "ti-spy" },
            { id: "hygiene",  label: "Safety Checklist", icon: "ti-list-check" },
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
