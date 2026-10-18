import { useState, useId } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface MockBreach {
  title: string;
  domain: string;
  breachDate: string;
  pwnCount: string;
  dataClasses: string[];
  description: string;
  severity: "high" | "critical" | "medium";
}

const DEMO_BREACH_DATABASE: Record<string, MockBreach[]> = {
  "test@example.com": [
    {
      title: "Canva Breach",
      domain: "canva.com",
      breachDate: "May 2019",
      pwnCount: "137,249,088 accounts",
      dataClasses: ["Email addresses", "Names", "Passwords (bcrypt)", "Cities"],
      description: "In May 2019, the graphic-design tool website Canva suffered a data breach impacting 137M subscribers. Stolen data included salted bcrypt hashes and personal profile records.",
      severity: "high",
    },
    {
      title: "Adobe Systems Credential Spill",
      domain: "adobe.com",
      breachDate: "October 2013",
      pwnCount: "152,989,508 accounts",
      dataClasses: ["Email addresses", "Password hints", "Passwords (symmetric 3DES)", "Usernames"],
      description: "In October 2013, Adobe was breached exposing 153M accounts. Weak symmetric encryption allowed attackers to reverse millions of passwords.",
      severity: "critical",
    },
  ],
  "operator@cyberguard.dev": [
    {
      title: "LinkedIn Scrape & Hash Dump",
      domain: "linkedin.com",
      breachDate: "May 2016",
      pwnCount: "164,611,595 accounts",
      dataClasses: ["Email addresses", "Passwords (unsalted SHA-1)"],
      description: "In May 2016, 164M LinkedIn user accounts from an earlier 2012 compromise surfaced online. Over 90% of hashes were cracked within days due to lack of salting.",
      severity: "critical",
    },
    {
      title: "Dropbox Cloud Spill",
      domain: "dropbox.com",
      breachDate: "July 2012",
      pwnCount: "68,648,009 accounts",
      dataClasses: ["Email addresses", "Passwords (bcrypt & SHA-1)"],
      description: "In mid-2012, Dropbox credentials stolen from an employee's reused password were used to exfiltrate 68M customer email and hash pairs.",
      severity: "high",
    },
    {
      title: "MyFitnessPal (Under Armour)",
      domain: "myfitnesspal.com",
      breachDate: "February 2018",
      pwnCount: "143,622,482 accounts",
      dataClasses: ["Email addresses", "IP addresses", "Passwords (bcrypt)", "Usernames"],
      description: "In February 2018, the diet and exercise service MyFitnessPal suffered a breach exposing 144M account records.",
      severity: "medium",
    },
  ],
  "sarah.connor@cyberguard.dev": [
    {
      title: "Apollo Sales Intelligence",
      domain: "apollo.io",
      breachDate: "July 2018",
      pwnCount: "125,979,531 accounts",
      dataClasses: ["Email addresses", "Employers", "Job titles", "Names", "Phone numbers"],
      description: "An exposed, unauthenticated database containing corporate prospect data collected by Apollo was left open to public access.",
      severity: "medium",
    },
  ],
};

const PRESET_EMAILS = [
  { label: "Sample Breached Account", email: "test@example.com" },
  { label: "Multi-Breach Account", email: "operator@cyberguard.dev" },
  { label: "Executive Account", email: "sarah.connor@cyberguard.dev" },
  { label: "Clean / Unbreached Email", email: "clean.security.tester@safe-domain.org" },
];

export function BreachScannerTab() {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Please enter an email address to query.";
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g., name@example.com).";
    }
    return "";
  };

  const handleScan = (targetEmail?: string) => {
    const toCheck = (targetEmail ?? email).trim().toLowerCase();
    const error = validateEmail(toCheck);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");
    setIsScanning(true);
    setHasSearched(false);

    // Realistic delay simulating network search
    setTimeout(() => {
      setIsScanning(false);
      setHasSearched(true);
    }, 600);
  };

  const handlePreset = (presetEmail: string) => {
    setEmail(presetEmail);
    handleScan(presetEmail);
  };

  const matchedBreaches = DEMO_BREACH_DATABASE[email.trim().toLowerCase()] ?? [];

  return (
    <div className="space-y-6">
      {/* Transparency & API Architecture Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
        <div className="flex items-start gap-3">
          <i className="ti ti-info-circle text-xl shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-200">
              Demo Simulation &amp; Architecture Reference
            </p>
            <p className="text-text-fog leading-relaxed">
              Unlike the <strong>Password Checker</strong> tab (which performs real, free k-anonymity SHA-1 prefix queries directly from your browser), querying account breaches by email address via the official HaveIBeenPwned API requires a paid commercial API key and a secure backend reverse proxy to prevent key exfiltration. To maintain zero-config offline security, this tab operates on an illustrative dataset.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Email Breach &amp; Data Leak Inspector
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Check if an email address has surfaced in major publicly leaked credential dumps and breach dumps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Demo accounts:</span>
            {PRESET_EMAILS.map((p) => (
              <Button
                key={p.label}
                variant="secondary"
                size="sm"
                onClick={() => handlePreset(p.email)}
                className="text-xs h-7 px-2"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="space-y-2">
          <label htmlFor={inputId} className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
            Email Address:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id={inputId}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationError) setValidationError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScan();
              }}
              placeholder="Enter email address (e.g. yourname@domain.com)..."
              className="input flex-1 font-mono text-xs sm:text-sm py-2.5"
            />
            <Button
              variant="primary"
              onClick={() => handleScan()}
              disabled={isScanning}
              className="text-xs shrink-0"
            >
              {isScanning ? (
                <>
                  <i className="ti ti-loader animate-spin mr-1.5" aria-hidden="true" />
                  Checking Leaks...
                </>
              ) : (
                <>
                  <i className="ti ti-search mr-1.5" aria-hidden="true" />
                  Inspect Breach Records
                </>
              )}
            </Button>
          </div>
          {validationError && (
            <p role="alert" className="text-xs text-danger font-medium flex items-center gap-1 mt-1">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              {validationError}
            </p>
          )}
        </div>

        {/* Scan Results */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 pt-4 border-t border-border"
            >
              {matchedBreaches.length > 0 ? (
                <div className="space-y-4">
                  {/* Verdict Banner */}
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center shrink-0">
                        <i className="ti ti-alert-triangle text-xl text-danger" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Leak Database Alert</p>
                        <h4 className="font-display font-bold text-base sm:text-lg">
                          Found in {matchedBreaches.length} Historical Data Breaches
                        </h4>
                      </div>
                    </div>
                    <Pill tone="danger">Pwned in Demo Records</Pill>
                  </div>

                  {/* Breach Details */}
                  <div className="grid grid-cols-1 gap-4">
                    {matchedBreaches.map((b, idx) => (
                      <Card key={idx} className="p-5 border-l-4 border-l-danger space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-text-pure">{b.title}</span>
                            <span className="text-xs text-text-fog font-mono">({b.domain})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-fog">
                            <span>Breached: <strong>{b.breachDate}</strong></span>
                            <span>•</span>
                            <span>Impact: <strong>{b.pwnCount}</strong></span>
                          </div>
                        </div>

                        <p className="text-xs text-text-fog leading-relaxed">{b.description}</p>

                        <div className="pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block mb-1.5">
                            Compromised Attributes:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {b.dataClasses.map((dc) => (
                              <span
                                key={dc}
                                className="px-2 py-0.5 rounded-md bg-surface border border-border text-[11px] font-medium text-text-pure"
                              >
                                {dc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Remediation Guide */}
                  <Card className="p-5 bg-surface-elevated border border-border space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <i className="ti ti-shield-check text-sm" aria-hidden="true" /> Immediate Containment Steps
                    </h5>
                    <ul className="text-xs text-text-fog space-y-2">
                      <li className="flex items-start gap-2">
                        <i className="ti ti-arrow-right text-primary mt-0.5 shrink-0" aria-hidden="true" />
                        <span><strong>Change Reused Passwords:</strong> If this password was ever used across other personal or academic accounts, change them immediately.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ti ti-arrow-right text-primary mt-0.5 shrink-0" aria-hidden="true" />
                        <span><strong>Enforce MFA/2FA:</strong> Turn on Authenticator App (TOTP) or Hardware FIDO keys on all primary email and financial accounts.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <i className="ti ti-arrow-right text-primary mt-0.5 shrink-0" aria-hidden="true" />
                        <span><strong>Beware of Targeted Phishing:</strong> When an email surfaces in leaks, attackers often craft personalized phishing referencing your name and company.</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <i className="ti ti-circle-check text-xl text-emerald-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base sm:text-lg">No Breaches Found in Demo Index</h4>
                      <p className="text-xs text-text-fog mt-0.5">
                        The email <strong>{email}</strong> does not appear in our local sample dump of major corporate leaks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
