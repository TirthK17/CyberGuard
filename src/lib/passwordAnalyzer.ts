import zxcvbn from "zxcvbn";
import { EFF_WORDLIST } from "@/data/effWordlist";

/* ─────────────────────────────────────────────────────────────────────────────
   K-ANONYMITY HAVEIBEENPWNED SHA-1 CHECKER
───────────────────────────────────────────────────────────────────────────── */

export async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function checkPwnedPassword(password: string): Promise<{
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

export function generatePassphrase(
  wordCount: number,
  separator: string,
  capitalize: boolean,
  addNumber: boolean
): string {
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
    const digit = ((randNum[0] % 90) + 10).toString();
    words.push(digit);
  }

  return words.join(separator);
}

export function calculatePassphraseEntropy(wordCount: number, hasNumber: boolean): number {
  return Math.round(
    wordCount * Math.log2(EFF_WORDLIST.length) + (hasNumber ? 3.32 : 0)
  );
}

export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;
  if (poolSize === 0) return 0;
  return Math.round(password.length * Math.log2(poolSize));
}

export function formatCrackSeconds(secs: number): string {
  if (secs < 1) return "Under 1 second (Instant)";
  if (secs < 60) return `${Math.round(secs)} seconds`;
  if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
  if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
  if (secs < 31536000) return `${Math.round(secs / 86400)} days`;
  if (secs < 31536000 * 100) return `${Math.round(secs / 31536000)} years`;
  if (secs < 31536000 * 1e6) return `${(secs / (31536000 * 1e3)).toFixed(1)}k centuries`;
  return "Centuries (Immune to brute-force)";
}

export function analyzePassword(password: string) {
  const result = zxcvbn(password);
  const combinations = Math.max(1, Math.pow(10, result.guesses_log10));
  const singleGpuRate = 1e8; // 100 MH/s
  const clusterRate = 1e11; // 100 GH/s
  const avgSecondsSingleGpu = combinations / (2 * singleGpuRate);
  const avgSecondsCluster = combinations / (2 * clusterRate);

  return {
    ...result,
    combinations,
    avgSecondsSingleGpu,
    avgSecondsCluster,
    singleGpuFormatted: formatCrackSeconds(avgSecondsSingleGpu),
    clusterFormatted: formatCrackSeconds(avgSecondsCluster),
    entropyBits: Math.round(result.guesses_log10 * 3.32),
  };
}
