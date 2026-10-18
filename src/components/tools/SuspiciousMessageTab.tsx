import { useState, useId } from "react";
import { Card, Pill, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface MessageScanResult {
  score: number;
  verdict: "CRITICAL SCAM RISK" | "SUSPICIOUS MESSAGE" | "LIKELY SAFE / LEGITIMATE";
  tone: "danger" | "warn" | "success";
  category: "Electricity / Utility Scam" | "Digital Arrest / Legal Coercion" | "Job / Investment Fraud" | "Banking / OTP Phish" | "Low Risk / Informational";
  redFlags: string[];
  safeFeatures: string[];
}

const PRESET_MESSAGES = [
  {
    name: "Electricity Cut-Off Scam (SMS)",
    category: "Electricity / Utility Scam" as const,
    text: "Dear Customer, Your Electricity power will be disconnected Tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please immediately call our electricity officer on 98210-91823. Thank you, State Electricity Board.",
  },
  {
    name: "Digital Arrest / TRAI Threat (WhatsApp)",
    category: "Digital Arrest / Legal Coercion" as const,
    text: "URGENT NOTICE FROM TRAI & CBI CYBER CELL: An illegal SIM card registered under your Aadhaar number is involved in money laundering and harassment cases in Mumbai. An arrest warrant has been issued. Do not disconnect this call or leave your room. Connect immediately via WhatsApp Video Call with Inspector Vikram Singh for confidential verification or your bank accounts will be seized.",
  },
  {
    name: "YouTube Task Part-Time Job (Telegram)",
    category: "Job / Investment Fraud" as const,
    text: "Greetings! I am Priya from Global Media Recruiters. We offer part-time work from home. Just like 3 YouTube videos and screenshot them to earn ₹150 per task (₹3,000 - ₹8,000 daily). No experience needed! Instant payout directly to your UPI ID. Click here to claim your ₹500 welcome bonus on Telegram: https://bit.ly/earn-daily-task-vip",
  },
  {
    name: "Legitimate Bank Debit Alert (Clean)",
    category: "Banking / OTP Phish" as const,
    text: "Your A/C ending in 4102 has been debited by Rs. 2,450.00 on 14-Oct-2024 at 14:32:10 via UPI ref 428819201940. Avail Bal: Rs. 38,120.40. If this transaction was not done by you, forward this SMS to 1930 or call customer care at 1800-425-0018 immediately.",
  },
];

export function analyzeSuspiciousMessage(text: string): MessageScanResult {
  if (!text.trim()) {
    return {
      score: 0,
      verdict: "LIKELY SAFE / LEGITIMATE",
      tone: "success",
      category: "Low Risk / Informational",
      redFlags: [],
      safeFeatures: ["No message content entered for analysis."],
    };
  }

  const lower = text.toLowerCase();
  const redFlags: string[] = [];
  const safeFeatures: string[] = [];
  let score = 0;

  // 1. Manufactured Urgency & Time Pressure
  const urgencyWords = [
    "tonight", "at 9.30 pm", "at 9:30 pm", "immediately", "within 2 hours",
    "within 24 hours", "power will be disconnected", "disconnected tonight",
    "account will be suspended", "immediate action", "urgent notice", "urgent action",
    "final warning", "arrest warrant", "action will be taken"
  ];
  const foundUrgency = urgencyWords.filter((w) => lower.includes(w));
  if (foundUrgency.length > 0) {
    score += 30;
    redFlags.push(`Artificial Time Pressure: Uses urgency triggers ('${foundUrgency.slice(0, 2).join("', '")}') to bypass rational thinking.`);
  }

  // 2. High-Pressure Impersonation (Authority / Law Enforcement / Utilities)
  const authorityTerms = [
    "cbi", "cyber cell", "police officer", "trai", "customs", "arrest warrant",
    "money laundering", "court order", "electricity officer", "electricity office",
    "income tax", "ed officer", "seized"
  ];
  const foundAuthority = authorityTerms.filter((w) => lower.includes(w));
  if (foundAuthority.length > 0) {
    score += 35;
    redFlags.push(`Authority Impersonation ('${foundAuthority.slice(0, 2).join("', '")}'): Genuine law enforcement never conducts investigations or arrests over WhatsApp video calls.`);
  }

  // 3. Financial Traps & Unrealistic Earnings
  const moneyTraps = [
    "earn ₹", "earn rs", "daily task", "part-time work", "welcome bonus",
    "lottery", "cashback", "claim refund", "send otp", "share otp",
    "investment return", "guaranteed profit"
  ];
  const foundMoney = moneyTraps.filter((w) => lower.includes(w));
  if (foundMoney.length > 0) {
    score += 30;
    redFlags.push(`Financial Lure / Task Trap ('${foundMoney.slice(0, 2).join("', '")}'): Promises of rapid guaranteed pay for trivial tasks (e.g., liking videos) precede advance-fee extortion.`);
  }

  // 4. Remote Control Software or Suspicious APK Downloads
  const remoteTools = ["anydesk", "teamviewer", "quicksupport", "rustdesk", ".apk", "download apk", "install app"];
  const foundTools = remoteTools.filter((w) => lower.includes(w));
  if (foundTools.length > 0) {
    score += 45;
    redFlags.push(`Dangerous Software Coercion: Demands installing remote screen-sharing tools (${foundTools.join(", ")}) or off-store APK packages.`);
  }

  // 5. Shortened / Deceptive Links
  const shorteners = ["bit.ly", "tinyurl.com", "cutt.ly", "t.me", "wa.me", "rb.gy", "goo.gl"];
  if (shorteners.some((s) => lower.includes(s))) {
    score += 25;
    redFlags.push("Obscured Destination URL: Contains a URL shortener designed to hide the true phishing or malware destination.");
  }

  // 6. Direct Unofficial Phone Numbers to Call
  if (/\b\d{5}[-\s]?\d{5}\b/.test(text) && (lower.includes("call") || lower.includes("officer") || lower.includes("executive"))) {
    score += 20;
    redFlags.push("Unofficial Personal Mobile Number: Official utility companies and banks never direct customers to call personal 10-digit mobile phones for billing disputes.");
  }

  // Safe signal checks
  if (lower.includes("1930") || lower.includes("cybercrime.gov.in")) {
    safeFeatures.push("Cites official National Cybercrime Helpline 1930.");
  }
  if (lower.includes("debited by") && lower.includes("avail bal") && !lower.includes("click") && !lower.includes("bit.ly")) {
    safeFeatures.push("Standard transactional banking notification format without coercive links.");
  }

  score = Math.min(100, score);

  // Categorize
  let category: MessageScanResult["category"] = "Low Risk / Informational";
  if (foundAuthority.length > 0) category = "Digital Arrest / Legal Coercion";
  else if (lower.includes("electricity") || lower.includes("bill")) category = "Electricity / Utility Scam";
  else if (foundMoney.length > 0) category = "Job / Investment Fraud";
  else if (lower.includes("otp") || lower.includes("pin") || lower.includes("bank")) category = "Banking / OTP Phish";

  let verdict: MessageScanResult["verdict"] = "LIKELY SAFE / LEGITIMATE";
  let tone: MessageScanResult["tone"] = "success";

  if (score >= 60) {
    verdict = "CRITICAL SCAM RISK";
    tone = "danger";
  } else if (score >= 25) {
    verdict = "SUSPICIOUS MESSAGE";
    tone = "warn";
  }

  return {
    score,
    verdict,
    tone,
    category,
    redFlags,
    safeFeatures,
  };
}

export function SuspiciousMessageTab() {
  const textareaId = useId();
  const [inputText, setInputText] = useState(PRESET_MESSAGES[0].text);
  const [analysis, setAnalysis] = useState<MessageScanResult>(() =>
    analyzeSuspiciousMessage(PRESET_MESSAGES[0].text)
  );

  const handleTextChange = (text: string) => {
    setInputText(text);
    setAnalysis(analyzeSuspiciousMessage(text));
  };

  const loadPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setInputText(preset.text);
    setAnalysis(analyzeSuspiciousMessage(preset.text));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              SMS, WhatsApp &amp; Telegram Scam Heuristic Analyzer
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Paste suspicious text messages to detect psychological coercion, digital arrest threats, electricity cut-offs, and fake job lures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Presets:</span>
            {PRESET_MESSAGES.map((p, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => loadPreset(p)}
                className="text-xs h-7 px-2"
              >
                {idx === 0 ? "Electricity Cut" : idx === 1 ? "Digital Arrest" : idx === 2 ? "Part-time Job" : "Genuine Bank SMS"}
              </Button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label htmlFor={textareaId} className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
            Message Content to Analyze:
          </label>
          <textarea
            id={textareaId}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={5}
            placeholder="Paste suspicious SMS, WhatsApp, or Telegram message here..."
            className="input w-full font-mono text-xs sm:text-sm leading-relaxed p-3.5 rounded-xl resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-dim">
              Never click links, download APK files, or call unverified phone numbers sent in unsolicited messages.
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleTextChange("")}
              className="text-xs h-7"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Analysis Output */}
        <AnimatePresence mode="wait">
          <motion.div
            key={inputText.slice(0, 20)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4 border-t border-border"
          >
            {/* Verdict Banner */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                analysis.tone === "danger"
                  ? "bg-danger/10 border-danger/30 text-danger"
                  : analysis.tone === "warn"
                  ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
                  <i
                    className={`ti ${
                      analysis.tone === "danger"
                        ? "ti-alert-octagon text-xl"
                        : analysis.tone === "warn"
                        ? "ti-alert-triangle text-xl"
                        : "ti-shield-check text-xl"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Category: {analysis.category}
                  </p>
                  <h4 className="font-display font-bold text-base sm:text-lg">{analysis.verdict}</h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Pill tone={analysis.tone === "danger" ? "danger" : analysis.tone === "warn" ? "warn" : "success"}>
                  Scam Probability: {analysis.score}%
                </Pill>
              </div>
            </div>

            <ProgressBar value={analysis.score} />

            {/* Findings Breakdown */}
            <div className="space-y-4">
              {analysis.redFlags.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                    <i className="ti ti-flag text-sm" aria-hidden="true" /> Identified Deception Tactics ({analysis.redFlags.length})
                  </h5>
                  <ul className="space-y-2" aria-label="Detected deception tactics">
                    {analysis.redFlags.map((flag, idx) => (
                      <li
                        key={idx}
                        className="text-xs p-3 rounded-xl bg-danger/5 border border-danger/20 text-text-pure flex items-start gap-2.5"
                      >
                        <i className="ti ti-x text-danger mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface border border-border text-xs text-emerald-400 flex items-center gap-2">
                  <i className="ti ti-circle-check text-lg" aria-hidden="true" />
                  <span>No overt manipulation keywords, shortened links, or coercion patterns identified.</span>
                </div>
              )}

              {analysis.safeFeatures.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <i className="ti ti-shield-check text-sm" aria-hidden="true" /> Reassuring Indicators
                  </h5>
                  <ul className="space-y-1.5">
                    {analysis.safeFeatures.map((feat, idx) => (
                      <li key={idx} className="text-xs text-text-fog flex items-start gap-2">
                        <i className="ti ti-check text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Citizen Advisory Box */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <i className="ti ti-bulb text-sm" aria-hidden="true" /> Golden Rule for Citizens
                </span>
                <p className="text-xs text-text-fog leading-relaxed">
                  If an unsolicited message threatens immediate power cut-off, legal arrest, or demands video calling an officer: <strong>NEVER comply</strong>. Hang up immediately and report the sender number to the National Cybercrime Reporting Portal at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary underline">cybercrime.gov.in</a> or call helpline <strong>1930</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
