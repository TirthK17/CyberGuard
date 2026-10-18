import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

const situations = [
  {
    id: "upi-digital-arrest",
    label: "UPI scam or Digital Arrest police call",
    icon: "ti-shield-alert",
    urgency: "Immediate Golden Hour Action",
    steps: [
      "If money was sent via UPI/netbanking, dial National Cybercrime Helpline 1930 immediately to freeze recipient accounts.",
      "If on a video call with fake Police, CBI, or ED threatening 'Digital Arrest', disconnect immediately. Law enforcement never arrests citizens via Skype or WhatsApp.",
      "Never transfer any security deposit, bond fee, or verification money under intimidation.",
      "File a formal complaint on cybercrime.gov.in and preserve screenshot evidence, call logs, and transaction UTR numbers.",
      "Block the sender number and warn family members not to answer calls from the same caller.",
    ],
  },
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

const LOCALIZED_SITUATIONS: Record<string, { hi: string; gu: string }> = {
  "upi-digital-arrest": {
    hi: "यूपीआई घोटाला या डिजिटल अरेस्ट फर्जी पुलिस कॉल",
    gu: "યુપીઆઇ છેતરપિંડી અથવા ડિજિટલ અરેસ્ટ નકલી પોલીસ કૉલ",
  },
  "phishing-link": {
    hi: "मैंने किसी संदिग्ध / फ़िशिंग लिंक पर क्लिक कर दिया",
    gu: "મેં શંકાસ્પદ / ફિશિંગ લિંક પર ક્લિક કર્યું છે",
  },
  "hacked": {
    hi: "मेरा खाता या ईमेल हैक / समझौता हो गया",
    gu: "મારું એકાઉન્ટ અથવા ઇમેઇલ હેક થઈ ગયું છે",
  },
  "suspicious-file": {
    hi: "मैंने संदिग्ध फ़ाइल डाउनलोड या ओपन कर ली",
    gu: "મેં શંકાસ્પદ ફાઇલ ડાઉનલોડ અથવા ઓપન કરી છે",
  },
  "compromised-device": {
    hi: "मेरा मोबाइल या कंप्यूटर मैलवेयर/रिमोट कंट्रोल से प्रभावित है",
    gu: "મારો મોબાઇલ અથવા કમ્પ્યુટર માલવેરથી પ્રભાવિત છે",
  },
  "leaked-credentials": {
    hi: "मेरा पासवर्ड या डेटा किसी लीक में पाया गया",
    gu: "મારો પાસવર્ડ અથવા ડેટા લીકમાં મળી આવ્યો",
  },
  "unsecured-wifi": {
    hi: "मैंने असुरक्षित सार्वजनिक वाई-फ़ाई का उपयोग किया",
    gu: "મેં અસુરક્ષિત સાર્વજનિક વાઇ-ફાઇનો ઉપયોગ કર્યો",
  },
  "suspicious-call": {
    hi: "मुझे फर्जी बैंक या तत्काल फोन कॉल / एसएमएस आया",
    gu: "મને શંકાસ્પદ તાત્કાલિક ફોન કૉલ અથવા એસએમએસ આવ્યો",
  },
};

export function SecurityGuidePage() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) as "hi" | "gu") || "en";
  const [active, setActive] = useState(situations[0].id);
  const current = situations.find((s) => s.id === active) ?? situations[0];

  const [checkedSteps, setCheckedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_guide_steps_${situations[0].id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cyberguard_guide_steps_${active}`);
      setCheckedSteps(saved ? JSON.parse(saved) : []);
    } catch {
      setCheckedSteps([]);
    }
  }, [active]);

  const toggleStep = (idx: number) => {
    const next = checkedSteps.includes(idx)
      ? checkedSteps.filter((i) => i !== idx)
      : [...checkedSteps, idx];
    setCheckedSteps(next);
    try {
      localStorage.setItem(`cyberguard_guide_steps_${active}`, JSON.stringify(next));
    } catch {}
  };

  const resetSteps = () => {
    setCheckedSteps([]);
    try {
      localStorage.removeItem(`cyberguard_guide_steps_${active}`);
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Quick Response Playbook</p>
          <h1 className="mt-0.5 font-display text-2xl sm:text-3xl font-bold text-text-pure">
            What Should I Do Right Now?
          </h1>
          <p className="mt-1 text-sm text-text-fog">
            Emergency step-by-step containment protocols for suspected security incidents.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <Button
            variant="secondary"
            size="sm"
            icon={<i className="ti ti-printer" />}
            onClick={() => window.print()}
          >
            {t("common.print", "Print Playbook")}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Navigation / Scenario buttons */}
        <div className="space-y-2 no-print">
          {situations.map((s) => {
            const isSelected = active === s.id;
            const label = LOCALIZED_SITUATIONS[s.id]?.[currentLang] || s.label;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-primary/40 bg-primary/10 text-primary font-semibold shadow-xs"
                    : "border-border bg-surface text-text-fog hover:border-border-strong hover:text-text-pure hover:bg-surface-elevated"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    isSelected
                      ? "border-primary/30 bg-primary/20 text-primary"
                      : "border-border bg-surface-elevated text-text-ash"
                  }`}
                >
                  <i className={`ti ${s.icon} text-base`} />
                </div>
                <span className="flex-1 leading-snug">{label}</span>
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
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <i className={`ti ${current.icon} text-xl`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                        {current.urgency}
                      </span>
                      <h2 className="mt-0.5 font-display text-lg sm:text-xl font-bold text-text-pure">
                        {LOCALIZED_SITUATIONS[current.id]?.[currentLang] || current.label}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-ash no-print">
                    <span>
                      {checkedSteps.length} of {current.steps.length} {t("common.completed", "completed")}
                    </span>
                    {checkedSteps.length > 0 && (
                      <button
                        type="button"
                        onClick={resetSteps}
                        className="text-primary hover:underline font-semibold ml-2 cursor-pointer"
                      >
                        {t("common.reset", "Reset")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-ash mb-4">
                    Tactical Steps Checklist (Click steps as you complete them)
                  </p>
                  <ol className="space-y-3">
                    {current.steps.map((step, i) => {
                      const isDone = checkedSteps.includes(i);
                      return (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.3 }}
                          onClick={() => toggleStep(i)}
                          className={`flex items-start gap-4 rounded-xl border p-3.5 text-sm leading-relaxed cursor-pointer transition-all ${
                            isDone
                              ? "border-emerald-500/30 bg-emerald-500/5 text-text-ash"
                              : "border-border bg-surface-elevated/40 text-text-pure hover:border-border-strong hover:bg-surface-elevated/70"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold mt-0.5 transition-colors ${
                              isDone
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-primary/30 bg-primary/10 text-primary"
                            }`}
                          >
                            {isDone ? <i className="ti ti-check text-xs font-bold" /> : i + 1}
                          </span>
                          <span className={`flex-1 ${isDone ? "line-through opacity-75" : ""}`}>
                            {step}
                          </span>
                        </motion.li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-8 rounded-xl border border-border bg-surface-elevated p-4 text-xs text-text-fog flex items-center gap-3">
                  <i className="ti ti-info-circle text-base text-primary shrink-0" />
                  <span>
                    When in doubt, notify your IT administrator or report to CERT-In (<strong>1930</strong>).
                    Prompt reporting limits breach impact and prevents lateral infection across your network.
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
