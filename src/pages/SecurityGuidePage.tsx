import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/primitives";

const situations = [
  {
    id: "phishing-link",
    label: "I clicked a suspicious / phishing link",
    icon: "ti-link-off",
    urgency: "Immediate Action Required",
    steps: [
      "Disconnect immediately from the internet if you entered credentials or downloaded anything.",
      "Change the affected account password immediately using a different, clean device.",
      "Enable multi-factor authentication (MFA) on the account if not already enabled.",
      "Run a full anti-malware and antivirus scan on your machine.",
      "Notify your internal security / IT team or service provider so they can monitor for anomalous tokens.",
    ],
  },
  {
    id: "hacked",
    label: "My account or mailbox was compromised",
    icon: "ti-user-x",
    urgency: "High Priority",
    steps: [
      "Immediately reset your password using a separate trusted device.",
      "Navigate to account security settings and click 'Sign out of all other devices / sessions'.",
      "Check mailbox forwarding rules and filter configurations to ensure emails aren't being secretly redirected.",
      "Review connected third-party OAuth apps and revoke access to any unknown services.",
      "Notify your security contacts and monitor bank/credit accounts if financial info was involved.",
    ],
  },
  {
    id: "suspicious-file",
    label: "I downloaded or opened a suspicious file",
    icon: "ti-file-alert",
    urgency: "Critical Action",
    steps: [
      "Do NOT run or open the file if you have only downloaded it.",
      "Sever device network connectivity (turn off Wi-Fi or unplug Ethernet) to block command-and-control communication.",
      "Run an offline scanner or deep endpoint security scan.",
      "Do NOT enter passwords or payment credentials until verified clean by IT.",
      "If ransomware note appears, do not pay ransom; report to security team for backup restoration.",
    ],
  },
  {
    id: "phone-stolen",
    label: "My mobile phone or laptop was stolen",
    icon: "ti-device-mobile-off",
    urgency: "High Priority",
    steps: [
      "Use Find My (iOS/macOS) or Google Find My Device to remotely lock and initiate an erasure/wipe command.",
      "Contact your mobile carrier immediately to suspend the SIM/eSIM and block unauthorized SMS OTP interception.",
      "Revoke active device tokens and change passwords on your primary Google, Apple, and corporate accounts.",
      "Report theft to local authorities and obtain a police incident report for your records.",
      "Replace physical MFA keys or re-enroll software authenticators on a replacement device.",
    ],
  },
  {
    id: "password-compromised",
    label: "My password was leaked or reused",
    icon: "ti-key-off",
    urgency: "Preventative Action",
    steps: [
      "Change the leaked password on the originating service immediately.",
      "Audit every single website where you reused that same password and update them with unique passwords.",
      "Adopt a reputable password manager to generate and store 16+ character pseudorandom credentials.",
      "Check haveibeenpwned.com to see which breaches included your email address.",
      "Enforce hardware security keys (FIDO2/WebAuthn) or authenticator apps over SMS.",
    ],
  },
  {
    id: "suspicious-wifi",
    label: "I connected to an untrusted public Wi-Fi",
    icon: "ti-wifi-off",
    urgency: "Cautionary Steps",
    steps: [
      "Disconnect immediately from the open or spoofed wireless access point.",
      "Ensure your device settings have 'Auto-join unknown networks' disabled.",
      "Turn on an encrypted VPN whenever public wireless networks are strictly unavoidable.",
      "Verify that all visited web domains strictly utilized HTTPS encryption without SSL certificate warnings.",
      "If you typed credentials without a VPN, change those passwords once safely on cellular or home network.",
    ],
  },
  {
    id: "suspicious-call",
    label: "I received a suspicious urgent phone call / SMS",
    icon: "ti-phone-incoming",
    urgency: "Social Engineering Alert",
    steps: [
      "Immediately hang up. Never disclose OTP codes, passwords, or employee numbers over voice calls.",
      "Independently look up the official phone number of the institution from their verified website.",
      "Call the verified number directly and ask to confirm if any legitimate department attempted contact.",
      "Report the telephone number or SMS spoofing incident to your organization's security team.",
      "Block the contact on your phone to prevent recurring spam attempts.",
    ],
  },
];

export function SecurityGuidePage() {
  const [active, setActive] = useState(situations[0].id);
  const current = situations.find((s) => s.id === active) ?? situations[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs text-text-faint">Emergency Response Playbook</p>
        <h1 className="mt-0.5 font-display text-2xl font-semibold text-text">What Should I Do?</h1>
        <p className="mt-1 text-sm text-text-dim">
          Select an incident scenario below for prioritized, step-by-step containment instructions.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Navigation / Scenario buttons */}
        <div className="space-y-2">
          {situations.map((s) => {
            const isSelected = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? "border-cyan/35 bg-cyan/10 text-cyan shadow-[0_4px_16px_rgba(78,225,194,0.12)]"
                    : "border-border bg-surface text-text-dim hover:border-border-strong hover:text-text hover:bg-surface-2"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    isSelected
                      ? "border-cyan/30 bg-cyan/20 text-cyan"
                      : "border-border bg-bg-elevated text-text-faint"
                  }`}
                >
                  <i className={`ti ${s.icon} text-base`} />
                </div>
                <span className="flex-1 leading-snug">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Response Card */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan">
                      <i className={`ti ${current.icon} text-xl`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan">
                        {current.urgency}
                      </span>
                      <h2 className="mt-0.5 font-display text-lg font-bold text-text">
                        {current.label}
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-faint mb-4">
                    Immediate Remediation Steps
                  </p>
                  <ol className="space-y-4">
                    {current.steps.map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex items-start gap-4 rounded-xl border border-border bg-bg-elevated/40 p-3.5 text-sm leading-relaxed text-text-dim"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-xs font-bold text-cyan mt-0.5">
                          {i + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                      </motion.li>
                    ))}
                  </ol>
                </div>

                <div className="mt-8 rounded-xl border border-border bg-surface-2/60 p-4 text-xs text-text-dim flex items-center gap-3">
                  <i className="ti ti-info-circle text-base text-cyan shrink-0" />
                  <span>
                    When in doubt, always notify your company IT administrator or security response team.
                    Rapid reporting minimizes breach severity.
                  </span>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
