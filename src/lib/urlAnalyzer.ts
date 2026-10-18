export interface UrlAnalysisResult {
  isValid: boolean;
  hostname: string;
  protocol: string;
  verdict: "No red flags found" | "SUSPICIOUS" | "CRITICAL PHISHING RISK" | "INVALID URL FORMAT";
  tone: "emerald" | "warning" | "danger";
  score: number;
  flags: string[];
}

export function analyzeCustomUrl(rawUrl: string): UrlAnalysisResult | null {
  if (!rawUrl.trim()) return null;

  const flags: string[] = [];
  let threatPoints = 0;

  // Pre-parse checks: @ symbol trickery
  if (rawUrl.includes("@")) {
    flags.push("Contains '@' symbol: browsers treat characters before '@' as userinfo and navigate to the address following it.");
    threatPoints += 40;
  }

  // Punycode / IDN homograph spoofing check
  if (rawUrl.toLowerCase().includes("xn--")) {
    flags.push("Punycode (IDN homograph) detected: domain may use visually indistinguishable Unicode characters to spoof legitimate brands.");
    threatPoints += 35;
  }

  // Excessive overall length
  if (rawUrl.length > 120) {
    flags.push("Unusually long URL (> 120 characters): often used to obscure redirect destinations or hide malicious token payloads.");
    threatPoints += 15;
  }

  let parsed: URL | null = null;
  try {
    const toParse = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `http://${rawUrl}`;
    parsed = new URL(toParse);
  } catch {
    return {
      isValid: false,
      hostname: "Invalid URL format",
      protocol: "none",
      verdict: "INVALID URL FORMAT",
      tone: "danger",
      score: 0,
      flags: ["The input cannot be parsed as a valid web address."],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();

  // 1. Protocol check
  if (parsed.protocol === "http:") {
    flags.push("Insecure HTTP protocol: unencrypted network transmission allows traffic eavesdropping and tampering.");
    threatPoints += 25;
  }

  // 2. IP address as host
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    flags.push("Bare IP address host rather than a registered domain name (common in automated malware C2).");
    threatPoints += 35;
  }

  // 3. Excessive hyphens in domain
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    flags.push(`Excessive hyphens in hostname (${hyphenCount} found): typical of disposable phishing domains mimicking brand names.`);
    threatPoints += 25;
  }

  // 4. URL shortener services
  const shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "goo.gl"];
  if (shorteners.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
    flags.push("URL shortener detected: destination is obscured and cannot be verified without expanding the link.");
    threatPoints += 30;
  }

  // 5. Suspicious or high-abuse TLDs
  const highRiskTlds = [".ru", ".xyz", ".top", ".shop", ".click", ".live", ".work", ".cfd", ".monster", ".sbs", ".buzz", ".zip", ".mov"];
  if (highRiskTlds.some((tld) => hostname.endsWith(tld))) {
    flags.push("Uses a high-risk or low-cost top-level domain frequently abused by bulk phishing campaigns.");
    threatPoints += 25;
  }

  // 6. Registrable domain and brand spoofing (supporting multi-part ccTLDs like .co.uk, .gov.in)
  const multiPartSuffixes = [".co.uk", ".org.uk", ".ac.uk", ".gov.uk", ".co.in", ".gov.in", ".com.au", ".net.au", ".co.nz"];
  const isMultiPart = multiPartSuffixes.some((s) => hostname.endsWith(s));
  const domainParts = hostname.split(".");
  const registrableDomain = isMultiPart && domainParts.length >= 3
    ? domainParts.slice(-3).join(".")
    : domainParts.slice(-2).join(".");

  const brandKeywords = ["microsoft", "google", "apple", "paypal", "netflix", "hdfc", "amazon", "chase", "sbi", "wellsfargo"];
  const officialSuffixes = [".com", ".in", ".org", ".net", ".co.uk", ".co.in", ".gov.in", ".com.au"];
  for (const b of brandKeywords) {
    if (hostname.includes(b)) {
      const isOfficial = officialSuffixes.some((suf) => registrableDomain === `${b}${suf}`);
      if (!isOfficial) {
        flags.push(`Brand spoofing detected: hostname references '${b}', but registered domain is '${registrableDomain}' (NOT official ${b}!).`);
        threatPoints += 45;
        break;
      }
    }
  }

  // 7. Credential harvesting keywords in pathname or hostname (case-insensitive)
  const sensitiveWords = ["login", "verify", "update", "cancel", "secure", "auth", "billing", "signin", "reset", "reauth", "kyc"];
  for (const w of sensitiveWords) {
    if (pathname.includes(w) || hostname.includes(w)) {
      flags.push(`Contains credential-harvesting keyword '${w}' in URL path or hostname.`);
      threatPoints += 15;
      break;
    }
  }

  // 8. Dangerous file extensions
  if (/\.(exe|scr|vbs|bat|ps1|apk|iso|zip\.exe)$/i.test(pathname)) {
    flags.push("Direct executable payload download detected (.exe/.apk/.scr)!");
    threatPoints += 50;
  }

  threatPoints = Math.min(threatPoints, 100);

  let verdict: "No red flags found" | "SUSPICIOUS" | "CRITICAL PHISHING RISK" = "No red flags found";
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
    flags: flags.length
      ? flags
      : ["No overt red flags detected in URL structure. (Note: Static analysis cannot guarantee the destination page is safe.)"],
  };
}
