import { describe, it, expect } from "vitest";
import {
  calculatePasswordEntropy,
  calculatePassphraseEntropy,
  formatCrackSeconds,
  generatePassphrase,
  analyzePassword,
  sha1,
} from "@/lib/passwordAnalyzer";

describe("Password and Passphrase Analyzer Engine", () => {
  it("calculates accurate Shannon entropy bits based on character pool size", () => {
    expect(calculatePasswordEntropy("")).toBe(0);

    // 8 characters, lowercase pool (26): 8 * log2(26) ≈ 37.6 -> 38 bits
    const lowercaseOnly = calculatePasswordEntropy("abcdefgh");
    expect(lowercaseOnly).toBe(38);

    // 8 characters, mixed case + numbers + symbols: pool size = 26+26+10+33 = 95
    // 8 * log2(95) ≈ 52.5 -> 53 bits
    const complex8 = calculatePasswordEntropy("aB3!cD4@");
    expect(complex8).toBe(53);

    // 16 characters mixed
    const complex16 = calculatePasswordEntropy("aB3!cD4@eF5#gH6$");
    expect(complex16).toBeGreaterThan(100);
  });

  it("calculates passphrase entropy using EFF 2,048-word dictionary math", () => {
    // 4 words, each gives 11 bits (log2(2048) = 11) -> 44 bits
    expect(calculatePassphraseEntropy(4, false)).toBe(44);

    // 4 words with 2-digit number (adds ~3.32 bits) -> 47 bits
    expect(calculatePassphraseEntropy(4, true)).toBe(47);

    // 6 words with number -> 6 * 11 + 3.32 = 69.32 -> 69 bits
    expect(calculatePassphraseEntropy(6, true)).toBe(69);
  });

  it("formats crack time seconds into human-readable intervals", () => {
    expect(formatCrackSeconds(0.0001)).toBe("Under 1 second (Instant)");
    expect(formatCrackSeconds(45)).toBe("45 seconds");
    expect(formatCrackSeconds(180)).toBe("3 minutes");
    expect(formatCrackSeconds(7200)).toBe("2 hours");
    expect(formatCrackSeconds(86400 * 3)).toBe("3 days");
    expect(formatCrackSeconds(31536000 * 5)).toBe("5 years");
    expect(formatCrackSeconds(1e15)).toBe("Centuries (Immune to brute-force)");
  });

  it("generates cryptographically secure passphrases with custom parameters", () => {
    const phrase = generatePassphrase(4, "-", true, true);
    const parts = phrase.split("-");

    // 4 words + 1 number part
    expect(parts.length).toBe(5);

    // First 4 parts are capitalized words
    for (let i = 0; i < 4; i++) {
      expect(parts[i][0]).toBe(parts[i][0].toUpperCase());
      expect(parts[i].length).toBeGreaterThan(1);
    }

    // Fifth part is a 2-digit number
    expect(/^\d{2}$/.test(parts[4])).toBe(true);
  });

  it("evaluates passwords realistically via zxcvbn pattern matching", () => {
    const weak = analyzePassword("password123");
    expect(weak.score).toBeLessThanOrEqual(1);
    expect(weak.singleGpuFormatted).toContain("Instant");

    const strong = analyzePassword("Correct-Horse-Battery-Staple-99!");
    expect(strong.score).toBe(4);
    expect(strong.entropyBits).toBeGreaterThan(60);
  });

  it("computes standard SHA-1 hash for k-Anonymity breach verification", async () => {
    const hash = await sha1("password");
    // Standard known SHA-1 of "password"
    expect(hash).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
    expect(hash.slice(0, 5)).toBe("5BAA6");
  });
});
