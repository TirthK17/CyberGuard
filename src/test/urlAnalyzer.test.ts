import { describe, it, expect } from "vitest";
import { analyzeCustomUrl } from "@/lib/urlAnalyzer";

describe("URL Analyzer Static Analysis Engine", () => {
  it("returns null for empty or whitespace-only input", () => {
    expect(analyzeCustomUrl("")).toBeNull();
    expect(analyzeCustomUrl("   ")).toBeNull();
  });

  it("handles malformed/unparseable URLs gracefully", () => {
    const res = analyzeCustomUrl("http:// [invalid host] :8080");
    expect(res).not.toBeNull();
    expect(res?.isValid).toBe(false);
    expect(res?.verdict).toBe("INVALID URL FORMAT");
    expect(res?.tone).toBe("danger");
  });

  it("identifies legitimate websites with no red flags", () => {
    const res = analyzeCustomUrl("https://github.com/TirthK17");
    expect(res).not.toBeNull();
    expect(res?.isValid).toBe(true);
    expect(res?.verdict).toBe("No red flags found");
    expect(res?.tone).toBe("emerald");
    expect(res?.score).toBeLessThan(25);
  });

  it("flags brand spoofing with non-matching registrable domains (e.g. evil-paypal.com)", () => {
    const res = analyzeCustomUrl("https://evil-paypal.com/login");
    expect(res).not.toBeNull();
    expect(res?.isValid).toBe(true);
    expect(res?.flags.some((f) => f.includes("Brand spoofing detected"))).toBe(true);
    expect(res?.score).toBeGreaterThanOrEqual(45);
  });

  it("handles multi-part ccTLDs correctly (.co.uk, .gov.in)", () => {
    // Legitimate PayPal on UK ccTLD should NOT be flagged as spoofing itself
    const legitUk = analyzeCustomUrl("https://paypal.co.uk");
    expect(legitUk?.flags.some((f) => f.includes("Brand spoofing detected"))).toBe(false);

    // Fake PayPal on UK ccTLD MUST be flagged as spoofing
    const fakeUk = analyzeCustomUrl("https://secure-login.paypal-update.co.uk");
    expect(fakeUk?.flags.some((f) => f.includes("Brand spoofing detected"))).toBe(true);

    // Official Indian Government portal
    const legitGovIn = analyzeCustomUrl("https://cybercrime.gov.in");
    expect(legitGovIn?.flags.some((f) => f.includes("Brand spoofing detected"))).toBe(false);
  });

  it("detects Punycode / IDN homograph spoofing", () => {
    const res = analyzeCustomUrl("https://xn--pple-43d.com");
    expect(res).not.toBeNull();
    expect(res?.flags.some((f) => f.includes("Punycode (IDN homograph) detected"))).toBe(true);
    expect(res?.score).toBeGreaterThanOrEqual(35);
  });

  it("detects userinfo / '@' symbol navigation trickery", () => {
    const res = analyzeCustomUrl("https://google.com@phishing-landing.com");
    expect(res).not.toBeNull();
    expect(res?.flags.some((f) => f.includes("Contains '@' symbol"))).toBe(true);
    expect(res?.score).toBeGreaterThanOrEqual(40);
  });

  it("flags known URL shortener services", () => {
    const bitly = analyzeCustomUrl("https://bit.ly/secure-account");
    expect(bitly?.flags.some((f) => f.includes("URL shortener detected"))).toBe(true);

    const tiny = analyzeCustomUrl("https://tinyurl.com/update-now");
    expect(tiny?.flags.some((f) => f.includes("URL shortener detected"))).toBe(true);
  });

  it("detects bare IP address hostnames and insecure HTTP protocol", () => {
    const res = analyzeCustomUrl("http://192.168.1.50/admin");
    expect(res).not.toBeNull();
    expect(res?.flags.some((f) => f.includes("Bare IP address"))).toBe(true);
    expect(res?.flags.some((f) => f.includes("Insecure HTTP protocol"))).toBe(true);
  });

  it("detects direct executable payload file downloads", () => {
    const res = analyzeCustomUrl("https://fileshare-portal.com/invoices/statement.exe");
    expect(res).not.toBeNull();
    expect(res?.flags.some((f) => f.includes("executable payload"))).toBe(true);
    expect(res?.score).toBeGreaterThanOrEqual(50);
  });

  it("escalates multiple combined threats to CRITICAL PHISHING RISK", () => {
    const res = analyzeCustomUrl("http://paypal-verification-account.xyz@192.168.1.1/update.scr");
    expect(res).not.toBeNull();
    expect(res?.verdict).toBe("CRITICAL PHISHING RISK");
    expect(res?.tone).toBe("danger");
    expect(res?.score).toBeGreaterThanOrEqual(60);
  });
});
