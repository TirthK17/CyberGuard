import { useState } from "react";
import { motion } from "framer-motion";
import { Card, Pill } from "@/components/ui/primitives";

const terms = [
  {
    term: "Phishing",
    category: "Social Engineering",
    def: "A deceptive attempt to trick you into revealing sensitive credentials or information by impersonating a trusted entity.",
    example: "An email mimicking your payroll department asking you to 're-verify' direct deposit details.",
    tip: "Always inspect the actual sender email domain and never click unverified authentication links.",
  },
  {
    term: "MFA (Multi-Factor Authentication)",
    category: "Authentication",
    def: "A multi-step verification protocol requiring two or more independent factors (something you know, have, or are) to grant access.",
    example: "Entering a master password plus confirming an authenticator prompt or hardware security key.",
    tip: "Prefer hardware keys (FIDO2/WebAuthn) or time-based authenticator apps over SMS verification.",
  },
  {
    term: "MITM (Man-in-the-Middle)",
    category: "Network",
    def: "An attack where an eavesdropping adversary covertly intercepts and potentially alters communication between two distinct parties.",
    example: "A rogue access point at a coffee shop spoofing legitimate routers to inspect unencrypted traffic.",
    tip: "Enforce HTTPS traffic and use an encrypted VPN whenever connecting to unfamiliar Wi-Fi hotspots.",
  },
  {
    term: "Malware",
    category: "Threats",
    def: "An umbrella term for malicious software designed to disrupt, damage, exfiltrate data, or gain unauthorized control over an endpoint.",
    example: "A trojan payload disguised within a software crack or invoice attachment.",
    tip: "Download binaries exclusively from verified first-party publishers and maintain active endpoint protection.",
  },
  {
    term: "Ransomware",
    category: "Threats",
    def: "Extortion malware that systematically encrypts personal or enterprise files and demands a cryptocurrency payment for decryption keys.",
    example: "A company database locked overnight with a README ransom demand on every server desktop.",
    tip: "Maintain automated, air-gapped immutable offline backups that attackers cannot delete or reach.",
  },
  {
    term: "VPN (Virtual Private Network)",
    category: "Network",
    def: "An encrypted network tunnel extending across a public infrastructure, shielding traffic and origin IP addresses from local sniffers.",
    example: "Routing laptop traffic through an encrypted corporate gateway while traveling abroad.",
    tip: "Ensure your VPN client incorporates an automatic kill-switch in case the tunnel drops.",
  },
  {
    term: "Zero-Day Vulnerability",
    category: "Threats",
    def: "A software or hardware security flaw unknown to the vendor, meaning zero days have elapsed since public awareness and no patch exists.",
    example: "A browser rendering flaw weaponized in the wild before security maintainers release an emergency patch.",
    tip: "Turn on automated automatic software updates so patches apply the exact moment vendors ship fixes.",
  },
  {
    term: "Spoofing",
    category: "Identity",
    def: "The act of falsifying identity metadata—such as email headers, IP packets, or caller ID—to deceive human or technical verifiers.",
    example: "An incoming phone call showing your local police department's exact phone number.",
    tip: "Independently search and dial the institution's official published contact number.",
  },
  {
    term: "Social Engineering",
    category: "Social Engineering",
    def: "Psychological manipulation aimed at persuading individuals to bypass established safety protocols or hand over credentials.",
    example: "A caller claiming to be from the IT helpdesk claiming your account will be locked in 5 minutes unless you give your OTP.",
    tip: "Slow down when an external party manufactures artificial urgency. Genuine security teams never ask for your password.",
  },
  {
    term: "Brute Force Attack",
    category: "Authentication",
    def: "A trial-and-error method where automated scripts systematically attempt thousands of password permutations until one succeeds.",
    example: "A bot attempting common password lists against a server's remote SSH port.",
    tip: "Implement account rate-limiting, IP lockouts, and use lengthy passphrases.",
  },
  {
    term: "Spear Phishing",
    category: "Social Engineering",
    def: "A targeted, customized phishing operation focusing on a specific individual or organization using researched personal details.",
    example: "An email referencing your exact job title, manager's name, and recent company projects to request a wire transfer.",
    tip: "Be mindful of personal information published on professional social networks.",
  },
  {
    term: "Zero Trust Architecture",
    category: "Architecture",
    def: "A security model predicated on the principle 'never trust, always verify', requiring continuous authentication for every request.",
    example: "Requiring identity and device health verification even when connected to the internal office LAN.",
    tip: "Treat internal networks with the same degree of skepticism as public networks.",
  },
];

export function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...new Set(terms.map((t) => t.category))];

  const filtered = terms.filter((t) => {
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.def.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs text-text-faint">Security Lexicon</p>
        <h1 className="mt-0.5 font-display text-2xl font-semibold text-text">Cybersecurity Glossary</h1>
        <p className="mt-1 text-sm text-text-dim">
          Plain-language explanations, illustrative real-world examples, and protective habits.
        </p>
      </motion.div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cybersecurity terminology..."
            className="input pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
            >
              <i className="ti ti-x text-sm" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={
                `rounded-full border px-3 py-1 text-[11px] font-medium transition-colors duration-150 capitalize ` +
                (selectedCategory === c
                  ? "border-cyan/30 bg-cyan/10 text-cyan"
                  : "border-border bg-surface text-text-dim hover:border-border-strong hover:text-text")
              }
            >
              {c === "all" ? "All Terms" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map((t, i) => (
          <motion.div
            key={t.term}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-cyan tracking-tight">{t.term}</h3>
                  <Pill>{t.category}</Pill>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{t.def}</p>
              </div>

              <div className="mt-5 space-y-2.5 border-t border-border pt-3.5 text-xs">
                <div className="rounded-xl border border-border bg-surface-2/60 p-2.5">
                  <span className="font-semibold text-text">Example: </span>
                  <span className="text-text-dim">{t.example}</span>
                </div>
                <div className="flex items-start gap-2 text-text-faint">
                  <i className="ti ti-bulb text-cyan text-sm shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text font-medium">Pro-tip:</strong> {t.tip}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
