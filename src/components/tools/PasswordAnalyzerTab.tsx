import { useState, useEffect, useId } from "react";
import zxcvbn from "zxcvbn";
import { Card, Pill, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { EFF_WORDLIST } from "@/data/effWordlist";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   K-ANONYMITY HAVEIBEENPWNED SHA-1 CHECKER
───────────────────────────────────────────────────────────────────────────── */

async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function checkPwnedPassword(password: string): Promise<{
  isPwned: boolean;
  count: number;
  error?: string;
}> {
  if (!password) return { isPwned: false, count: 0 };
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: controller.signal,
      headers: { "Add-Padding": "true" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { isPwned: false, count: 0, error: "Breach API returned error" };
    }

    const text = await res.text();
    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(":");
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        return { isPwned: true, count: parseInt(countStr, 10) || 1 };
      }
    }

    return { isPwned: false, count: 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { isPwned: false, count: 0, error: `Offline or blocked (${msg})` };
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   CRYPTOGRAPHIC PASSPHRASE GENERATOR (EFF WORDLIST + CRYPTO.GETRANDOMVALUES)
───────────────────────────────────────────────────────────────────────────── */

function generatePassphrase(
  wordCount: number,
  separator: string,
  capitalize: boolean,
  addNumber: boolean
) {
  const words: string[] = [];
  const randomIndices = new Uint32Array(wordCount);
  crypto.getRandomValues(randomIndices);

  for (let i = 0; i < wordCount; i++) {
    const index = randomIndices[i] % EFF_WORDLIST.length;
    let word = EFF_WORDLIST[index];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (addNumber) {
    const randNum = new Uint32Array(1);
    crypto.getRandomValues(randNum);
    const digit = (randNum[0] % 90 + 10).toString();
    words.push(digit);
  }

  return words.join(separator);
}

export function PasswordAnalyzerTab() {
  const passwordInputId = useId();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ZXCVBN analysis
  const [zxcvbnResult, setZxcvbnResult] = useState<ReturnType<typeof zxcvbn> | null>(null);

  // Pwned check state
  const [pwnedChecking, setPwnedChecking] = useState(false);
  const [pwnedResult, setPwnedResult] = useState<{ isPwned: boolean; count: number; error?: string } | null>(null);

  // Passphrase generator state
  const [passphraseWordCount, setPassphraseWordCount] = useState(4);
  const [passphraseSeparator, setPassphraseSeparator] = useState("-");
  const [passphraseCapitalize, setPassphraseCapitalize] = useState(true);
  const [passphraseAddNumber, setPassphraseAddNumber] = useState(true);
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() =>
    generatePassphrase(4, "-", true, true)
  );
  const [copied, setCopied] = useState(false);

  // Compute zxcvbn
  useEffect(() => {
    if (!password) {
      setZxcvbnResult(null);
      setPwnedResult(null);
      return;
    }
    const res = zxcvbn(password);
    setZxcvbnResult(res);
  }, [password]);

  // Debounced Pwned Check
  useEffect(() => {
    if (!password || password.length < 3) {
      setPwnedResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setPwnedChecking(true);
      const res = await checkPwnedPassword(password);
      setPwnedResult(res);
      setPwnedChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [password]);

  const handleCopyPassphrase = async () => {
    await navigator.clipboard.writeText(generatedPassphrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setGeneratedPassphrase(
      generatePassphrase(
        passphraseWordCount,
        passphraseSeparator,
        passphraseCapitalize,
        passphraseAddNumber
      )
    );
  };

  // Score metrics
  const zScore = zxcvbnResult ? zxcvbnResult.score : 0; // 0 to 4
  const scorePercent = (zScore / 4) * 100;

  // Average-case crack time: Half the search space = combinations / (2 * guesses_per_sec)
  const singleGpuRate = 1e8; // 100 MH/s for bcrypt/PBKDF2 or modern GPUs
  const clusterRate = 1e11; // 100 GH/s for massive GPU rigs
  const combinations = zxcvbnResult ? Math.max(1, Math.pow(10, zxcvbnResult.guesses_log10)) : 1;
  const avgSecondsSingleGpu = combinations / (2 * singleGpuRate);
  const avgSecondsCluster = combinations / (2 * clusterRate);

  const formatSeconds = (secs: number) => {
    if (secs < 1) return "Under 1 second (Instant)";
    if (secs < 60) return `${Math.round(secs)} seconds`;
    if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
    if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
    if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
    if (secs < 31536000 * 100) return `${Math.round(secs / 31536000)} years`;
    if (secs < 31536000 * 1e6) return `${(secs / (31536000 * 1e3)).toFixed(1)}k centuries`;
    return "Centuries (Immune to brute-force)";
  };

  // Passphrase entropy: count * log2(7776) ~ count * 12.925 bits + 3.32 bits if number
  const passphraseEntropyBits = Math.round(
    passphraseWordCount * Math.log2(EFF_WORDLIST.length) + (passphraseAddNumber ? 3.32 : 0)
  );

  // Entropy Chart Data
  const entropyData = [
    { name: "Common (8 ch)", bits: 28, fill: "#ef4444" },
    { name: "Min Safe", bits: 60, fill: "#f59e0b" },
    { name: "Current Input", bits: zxcvbnResult ? Math.round(zxcvbnResult.guesses_log10 * 3.32) : 0, fill: "#3b82f6" },
    { name: "Passphrase", bits: passphraseEntropyBits, fill: "#10b981" },
  ];

  return (
    <div className="space-y-8">
      {/* ── TOOL 1A: REAL-TIME PASSWORD HEALTH & PWNED CHECK ── */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Pill tone="primary" size="sm">Real-Time Cryptographic Engine</Pill>
            <Pill tone="emerald" size="sm">k-Anonymity Verified</Pill>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-text-pure mt-2">
            Password Health &amp; Breach Exposure Check
          </h2>
          <p className="text-xs sm:text-sm text-text-fog mt-1">
            Evaluates password strength using Dropbox&apos;s realistic <strong className="text-text-pure">zxcvbn</strong> pattern engine and checks against 900M+ real breach dumps via k-Anonymity.
          </p>
        </div>

        {/* Input Field with Show/Hide */}
        <div className="space-y-2">
          <label htmlFor={passwordInputId} className="text-xs font-semibold text-text-ash block">
            Enter Any Password to Analyze
          </label>
          <div className="relative">
            <input
              id={passwordInputId}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. CorrectHorseBatteryStaple! or Pa$$w0rd"
              className="w-full h-12 px-4 pr-24 rounded-2xl bg-surface border border-border text-sm font-mono text-text-pure focus:outline-none focus:border-primary transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="px-2.5 py-1 text-xs text-text-ash hover:text-text-pure transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"}`} />
              </button>
              {password && (
                <button
                  type="button"
                  onClick={() => setPassword("")}
                  className="px-2 py-1 text-xs text-text-ash hover:text-text-pure transition-colors cursor-pointer"
                  aria-label="Clear input"
                >
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Strength Progress & Label */}
        {password && (
          <div className="space-y-3 p-4 rounded-2xl bg-surface-elevated border border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-ash uppercase tracking-wider">
                Overall Strength:{" "}
                <strong
                  className={
                    zScore <= 1
                      ? "text-red-400 font-bold"
                      : zScore === 2
                      ? "text-amber-400 font-bold"
                      : zScore === 3
                      ? "text-cyan-400 font-bold"
                      : "text-emerald-400 font-bold"
                  }
                >
                  {zScore === 0
                    ? "Very Weak (Dangerous)"
                    : zScore === 1
                    ? "Weak"
                    : zScore === 2
                    ? "Fair"
                    : zScore === 3
                    ? "Strong"
                    : "Excellent (Fortified)"}
                </strong>
              </span>
              <span className="font-mono text-text-pure font-bold">
                {scorePercent}%
              </span>
            </div>

            <ProgressBar value={scorePercent} />

            {/* zxcvbn Feedback Warning & Suggestions */}
            {zxcvbnResult?.feedback && (
              <div className="text-xs space-y-1 pt-1">
                {zxcvbnResult.feedback.warning && (
                  <p className="text-amber-400 font-medium flex items-center gap-1.5">
                    <i className="ti ti-alert-triangle" /> {zxcvbnResult.feedback.warning}
                  </p>
                )}
                {zxcvbnResult.feedback.suggestions.map((s, idx) => (
                  <p key={idx} className="text-text-fog flex items-center gap-1.5">
                    <i className="ti ti-arrow-right text-primary text-xs" /> {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* K-Anonymity HaveIBeenPwned Result Card */}
        {password && (
          <div
            className={`p-4 rounded-2xl border transition-all ${
              pwnedChecking
                ? "bg-surface border-border text-text-ash"
                : pwnedResult?.isPwned
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : pwnedResult?.error
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <i
                className={`ti ${
                  pwnedChecking
                    ? "ti-loader animate-spin text-primary"
                    : pwnedResult?.isPwned
                    ? "ti-alert-octagon text-red-400 text-xl"
                    : pwnedResult?.error
                    ? "ti-info-circle text-amber-400 text-xl"
                    : "ti-shield-check text-emerald-400 text-xl"
                } shrink-0 mt-0.5`}
              />
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm">
                  {pwnedChecking
                    ? "Verifying Against 900M+ Pwned Passwords..."
                    : pwnedResult?.isPwned
                    ? `SEEN ${pwnedResult.count.toLocaleString()} TIMES IN KNOWN DATA BREACHES!`
                    : pwnedResult?.error
                    ? `Offline / Network Fallback (${pwnedResult.error})`
                    : "NOT FOUND IN KNOWN DATA BREACHES"}
                </h4>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {pwnedResult?.isPwned
                    ? "This exact password has appeared in public hacker dumps. Cybercriminals use credential-stuffing bots that test this password within seconds. Change it immediately!"
                    : "K-Anonymity Security: Your password NEVER leaves your computer. Only the first 5 characters of its SHA-1 hash were queried; the full hash cannot be reversed."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Average-Case Crack Time Estimator with Clear Assumptions */}
        {password && (
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-ash">
                <span>Single High-End GPU (RTX 4090)</span>
                <span className="font-mono text-[10px]">100 MH/s</span>
              </div>
              <p className="text-base font-bold font-mono text-text-pure">
                {formatSeconds(avgSecondsSingleGpu)}
              </p>
              <span className="text-[10px] text-text-ash block">
                Average-case (half the keyspace: combinations / 2 / rate)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
              <div className="flex items-center justify-between text-xs text-text-ash">
                <span>Enterprise GPU Cracking Cluster</span>
                <span className="font-mono text-[10px]">100 GH/s</span>
              </div>
              <p className="text-base font-bold font-mono text-text-pure">
                {formatSeconds(avgSecondsCluster)}
              </p>
              <span className="text-[10px] text-text-ash block">
                Distributed botnet or state-sponsored hash rig
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* ── TOOL 1B: CRYPTOGRAPHIC PASSPHRASE VAULT GENERATOR ── */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Pill tone="emerald" size="sm">CSPRNG Powered</Pill>
            <Pill tone="primary" size="sm">EFF 7,776 Wordlist</Pill>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-text-pure mt-2">
            Cryptographic Passphrase Generator
          </h2>
          <p className="text-xs sm:text-sm text-text-fog mt-1">
            Generates memorable, mathematically uncrackable passphrases using hardware random numbers (<code className="font-mono text-primary">crypto.getRandomValues</code>) and the Electronic Frontier Foundation wordlist.
          </p>
        </div>

        {/* Generated Output Display */}
        <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
          <span className="font-mono text-base sm:text-lg font-bold text-text-pure select-all break-all">
            {generatedPassphrase}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerate}
              aria-label="Generate new passphrase"
            >
              <i className="ti ti-refresh mr-1.5" />
              Regenerate
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyPassphrase}
              aria-label="Copy passphrase to clipboard"
            >
              <i className={`ti ${copied ? "ti-check text-emerald-400" : "ti-copy"} mr-1.5`} />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Passphrase Generator Controls */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {/* Word Count Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-text-ash">
              <span>Word Count</span>
              <span className="font-mono font-bold text-text-pure">{passphraseWordCount} words</span>
            </div>
            <input
              type="range"
              min={3}
              max={7}
              value={passphraseWordCount}
              onChange={(e) => {
                setPassphraseWordCount(Number(e.target.value));
                setGeneratedPassphrase(
                  generatePassphrase(
                    Number(e.target.value),
                    passphraseSeparator,
                    passphraseCapitalize,
                    passphraseAddNumber
                  )
                );
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          {/* Separator Picker */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-ash block">Separator</label>
            <div className="flex items-center gap-1.5">
              {["-", ".", "_", " "].map((sep) => (
                <button
                  key={sep}
                  type="button"
                  onClick={() => {
                    setPassphraseSeparator(sep);
                    setGeneratedPassphrase(
                      generatePassphrase(
                        passphraseWordCount,
                        sep,
                        passphraseCapitalize,
                        passphraseAddNumber
                      )
                    );
                  }}
                  className={`flex-1 py-1 text-xs rounded-lg font-mono border transition-colors cursor-pointer ${
                    passphraseSeparator === sep
                      ? "bg-primary text-white border-primary font-bold"
                      : "bg-surface border-border text-text-ash hover:text-text-pure"
                  }`}
                >
                  {sep === " " ? "space" : sep}
                </button>
              ))}
            </div>
          </div>

          {/* Capitalize Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-pure font-medium">Capitalize</span>
            <input
              type="checkbox"
              checked={passphraseCapitalize}
              onChange={(e) => {
                setPassphraseCapitalize(e.target.checked);
                setGeneratedPassphrase(
                  generatePassphrase(
                    passphraseWordCount,
                    passphraseSeparator,
                    e.target.checked,
                    passphraseAddNumber
                  )
                );
              }}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Append Number Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-pure font-medium">Add Number</span>
            <input
              type="checkbox"
              checked={passphraseAddNumber}
              onChange={(e) => {
                setPassphraseAddNumber(e.target.checked);
                setGeneratedPassphrase(
                  generatePassphrase(
                    passphraseWordCount,
                    passphraseSeparator,
                    passphraseCapitalize,
                    e.target.checked
                  )
                );
              }}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </div>
        </div>

        {/* Recharts Entropy Comparison Visualizer */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-pure uppercase tracking-wider">
              Cryptographic Entropy Comparison (Shannon Bits)
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              Passphrase: ~{passphraseEntropyBits} bits
            </span>
          </div>

          <div className="h-44 w-full bg-surface-elevated rounded-2xl p-3 border border-border">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entropyData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" fontSize={11} unit=" bits" />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val) => [`${val} bits of entropy`, "Strength"]}
                />
                <Bar dataKey="bits" radius={[0, 6, 6, 0]}>
                  {entropyData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
