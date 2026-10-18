import { useState } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { analyzeCustomUrl } from "@/lib/urlAnalyzer";

const PHISHING_SAMPLES = [
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

export function PhishingInspectorTab() {
  const [subMode, setSubMode] = useState<"live" | "samples">("live");
  const [customInput, setCustomInput] = useState("https://login.microsoft.com.account-update.ru/auth/login.exe");
  const [selectedId, setSelectedId] = useState<string>(PHISHING_SAMPLES[0].id);

  const sample = PHISHING_SAMPLES.find((s) => s.id === selectedId) ?? PHISHING_SAMPLES[0];
  const urlAnalysis = analyzeCustomUrl(customInput);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-2" role="tablist" aria-label="Phishing inspector modes">
          <button
            role="tab"
            aria-selected={subMode === "live"}
            onClick={() => setSubMode("live")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subMode === "live"
                ? "bg-primary text-white shadow-sm"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-link mr-1.5" aria-hidden="true" /> Check a Link
          </button>
          <button
            role="tab"
            aria-selected={subMode === "samples"}
            onClick={() => setSubMode("samples")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subMode === "samples"
                ? "bg-primary text-white shadow-sm"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-mail-opened mr-1.5" aria-hidden="true" /> Sample Scam Emails
          </button>
        </div>

        {subMode === "live" && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Load presets:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCustomInput("https://login.microsoft.com.account-update.ru/auth/login.exe")}
              className="text-xs h-7 px-2"
            >
              Dangerous Spoof
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCustomInput("https://www.apple.com/in/shop/buy-iphone")}
              className="text-xs h-7 px-2"
            >
              Legitimate URL
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCustomInput("https://xn--e1afmkfd.xn--p1ai/secure-auth")}
              className="text-xs h-7 px-2"
            >
              Punycode Homograph
            </Button>
          </div>
        )}
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
            <label htmlFor="url-inspector-input" className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
              Link to Check:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="url-inspector-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Paste URL (e.g., https://login.paypal.com.verify-account.net/login)..."
                className="input flex-1 font-mono text-xs sm:text-sm py-2.5"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCustomInput("")}
                className="text-xs shrink-0"
              >
                Clear
              </Button>
            </div>
          </div>

          {urlAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-border"
            >
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  urlAnalysis.tone === "danger"
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : urlAnalysis.tone === "warning"
                    ? "bg-warning/10 border-warning/30 text-warning"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
                    <i
                      className={`ti ${
                        urlAnalysis.tone === "danger"
                          ? "ti-alert-octagon text-xl"
                          : urlAnalysis.tone === "warning"
                          ? "ti-alert-triangle text-xl"
                          : "ti-shield-check text-xl"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Security Verdict</p>
                    <p className="font-display font-bold text-base sm:text-lg">{urlAnalysis.verdict}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Pill tone={urlAnalysis.tone === "danger" ? "danger" : urlAnalysis.tone === "warning" ? "warn" : "success"}>
                    Threat Score: {urlAnalysis.score} / 100
                  </Pill>
                </div>
              </div>

              {/* Parsed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-fog block">Parsed Hostname</span>
                  <span className="font-mono text-xs text-text-pure break-all">{urlAnalysis.hostname}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-fog block">Protocol Used</span>
                  <span className="font-mono text-xs text-text-pure uppercase">{urlAnalysis.protocol}</span>
                </div>
              </div>

              {/* Analysis Flags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-pure">Inspection Findings</h4>
                <ul className="space-y-2" aria-label="URL inspection findings">
                  {urlAnalysis.flags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="text-xs p-3 rounded-xl bg-surface border border-border text-text-fog flex items-start gap-2.5"
                    >
                      <i
                        className={`ti ${
                          urlAnalysis.tone === "danger"
                            ? "ti-x text-danger"
                            : urlAnalysis.tone === "warning"
                            ? "ti-alert-circle text-warning"
                            : "ti-check text-emerald-400"
                        } mt-0.5 shrink-0`}
                        aria-hidden="true"
                      />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Sample Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-fog">
              Common Real-World Lures
            </h3>
            <div className="space-y-2" role="tablist" aria-orientation="vertical">
              {PHISHING_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={selectedId === s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedId === s.id
                      ? "bg-primary/10 border-primary text-text-pure shadow-sm"
                      : "bg-surface border-border text-text-fog hover:text-text-pure hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-xs truncate">{s.name}</p>
                    <i className="ti ti-chevron-right text-xs shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] text-text-dim mt-0.5 truncate">{s.subject}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Email Preview & Red Flags */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-4 border-l-4 border-l-danger">
              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-text-pure">{sample.subject}</h4>
                  <span className="text-[11px] text-text-fog">{sample.date}</span>
                </div>
                <div className="text-xs space-y-1 text-text-fog">
                  <p>
                    <span className="font-semibold text-text-pure">From: </span>
                    {sample.senderName} &lt;<span className="font-mono text-danger">{sample.senderEmail}</span>&gt;
                  </p>
                  <p>
                    <span className="font-semibold text-text-pure">Reply-To: </span>
                    <span className="font-mono text-danger">{sample.replyTo}</span>
                  </p>
                </div>
              </div>

              <div className="text-xs text-text-fog leading-relaxed py-2">
                {sample.body}
              </div>

              <div className="pt-2">
                <span className="inline-block px-3 py-2 rounded-lg bg-surface border border-danger/40 text-danger text-xs font-mono break-all">
                  <i className="ti ti-external-link mr-1.5" aria-hidden="true" />
                  {sample.linkText}: {sample.targetLink}
                </span>
              </div>
            </Card>

            {/* Red Flags Identified */}
            <Card className="p-5 space-y-3 bg-danger/5 border-danger/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                <i className="ti ti-flag text-sm" aria-hidden="true" /> Anatomy of This Phishing Attempt
              </h4>
              <ul className="space-y-2" aria-label="Identified email red flags">
                {sample.redFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-text-pure flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-danger/20 text-danger font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
