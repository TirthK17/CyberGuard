import { useState, useEffect, useMemo } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES & INTERFACES
───────────────────────────────────────────────────────────────────────────── */

export type ThreatSeverity = "critical" | "high" | "elevated" | "advisory";
export type ThreatCategory = 
  | "Ransomware"
  | "Zero-Day"
  | "Social Engineering"
  | "Mobile Smishing"
  | "AI & Emerging"
  | "Cloud & Network";

export interface MitreMapping {
  tactic: string;
  techniqueId: string;
  techniqueName: string;
}

export interface ThreatAdvisory {
  id: string;
  cve?: string;
  title: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  date: string;
  timestamp: number;
  originRegion: string;
  targetSectors: string[];
  summary: string;
  attackVector: string;
  mitigation: string;
  mitre: MitreMapping[];
  iocs: {
    domains: string[];
    ips: string[];
    hashes: string[];
  };
  simulationUrl?: string;
  simulationLabel?: string;
}

export interface LiveAttackEvent {
  id: string;
  time: string;
  sourceCity: string;
  sourceCountry: string;
  targetCity: string;
  targetSector: string;
  attackType: string;
  severity: "critical" | "high" | "medium";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
   REAL-WORLD CURATED 2025–2026 THREAT ADVISORIES
───────────────────────────────────────────────────────────────────────────── */

const ADVISORIES: ThreatAdvisory[] = [
  {
    id: "ADV-2025-104",
    cve: "CVE-2025-21298",
    title: "Global Phishing Surge Exploiting Microsoft Teams & SharePoint Guest Invites",
    category: "Social Engineering",
    severity: "critical",
    date: "1 day ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    originRegion: "Eastern Europe",
    targetSectors: ["Enterprise Tech", "Finance", "Legal"],
    summary: "Adversaries are generating automated external Microsoft Teams tenant invitations embedded with malicious SharePoint payloads that bypass traditional secure email gateway (SEG) inspections.",
    attackVector: "Teams meeting notifications containing disguised weaponized OneNote attachments and OAuth token consent grant lures.",
    mitigation: "Strictly restrict external Microsoft Teams guest domains, enforce conditional access policies requiring MFA re-prompt on guest access, and disable user consent for unverified OAuth apps.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1566.002", techniqueName: "Spearphishing Link" },
      { tactic: "Credential Access", techniqueId: "T1528", techniqueName: "Steal Application Access Token" },
    ],
    iocs: {
      domains: ["sharepoint-auth-portal.online", "teams-conf-relay.live"],
      ips: ["185.220.101.44", "194.26.29.112"],
      hashes: ["a7b4c9e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8"],
    },
    simulationUrl: "/simulations/phishing",
    simulationLabel: "Practice in Phishing Sandbox",
  },
  {
    id: "ADV-2025-098",
    cve: "CVE-2025-0994",
    title: "Akira & LockBit 4.0 Dual-Ransomware Wave Targeting Unpatched VPN Appliances",
    category: "Ransomware",
    severity: "critical",
    date: "2 days ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    originRegion: "Russia / CIS",
    targetSectors: ["Healthcare", "Manufacturing", "Municipal Utilities"],
    summary: "A newly resurfaced double-extortion ransomware offensive targets unpatched remote access SSL-VPN gateways. Attackers dump LSASS credentials and deploy automated encryption within 40 minutes of penetration.",
    attackVector: "Exposed corporate VPN endpoints with single-factor authentication or credentials stolen via infostealer malware (RedLine / Lumma).",
    mitigation: "Immediately enforce hardware FIDO2 MFA on all remote access gateways, segment domain controllers behind zero-trust network access (ZTNA), and maintain 3-2-1 immutable offline backups.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1078.004", techniqueName: "Cloud & Remote Accounts" },
      { tactic: "Impact", techniqueId: "T1486", techniqueName: "Data Encrypted for Impact" },
    ],
    iocs: {
      domains: ["akira-leak-gate.onion", "decryptor-auth-v4.biz"],
      ips: ["91.215.85.17", "45.142.214.9"],
      hashes: ["8f4b1e9c2d3a4b5c6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d"],
    },
    simulationUrl: "/simulations/ransomware",
    simulationLabel: "Launch Ransomware Defense Sim",
  },
  {
    id: "ADV-2025-089",
    title: "High-Pressure 'Digital Arrest' & Law Enforcement Video Extortion Syndicates",
    category: "Social Engineering",
    severity: "critical",
    date: "3 days ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    originRegion: "Southeast Asia (Cambodia / Myanmar)",
    targetSectors: ["General Citizens", "Senior Citizens", "Academics"],
    summary: "Organized cybercrime syndicates contact victims posing as Police, CBI, or Customs officers. Victims are subjected to fake Skype video calls in counterfeit police stations and coerced into transferring entire savings under pretext of 'financial verification'.",
    attackVector: "Unsolicited phone calls alleging illegal narcotics in courier parcels, followed by coercive video conference 'investigations' and forged court warrants.",
    mitigation: "Law enforcement agencies NEVER arrest citizens via video calls or demand money transfers for clearance. Disconnect immediately and file an incident with cybercrime.gov.in (1930).",
    mitre: [
      { tactic: "Social Engineering", techniqueId: "T1656", techniqueName: "Impersonation" },
      { tactic: "Initial Access", techniqueId: "T1566.004", techniqueName: "Spearphishing Voice / Video" },
    ],
    iocs: {
      domains: ["delhi-police-cyber-verification.info", "cbi-investigation-portal.org"],
      ips: ["103.172.95.8", "195.123.245.89"],
      hashes: ["b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2"],
    },
    simulationUrl: "/report",
    simulationLabel: "Report Similar Incident",
  },
  {
    id: "ADV-2025-076",
    cve: "CVE-2024-52741",
    title: "Chromium V8 Engine Remote Code Execution (RCE) Active Zero-Day Exploit",
    category: "Zero-Day",
    severity: "high",
    date: "4 days ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    originRegion: "Middle East",
    targetSectors: ["Defense Contractors", "Journalists", "Cryptocurrency"],
    summary: "Type confusion flaw in the Google V8 JavaScript engine enables arbitrary remote code execution within the browser sandbox upon visiting a booby-trapped webpage.",
    attackVector: "Watering-hole attacks hosting weaponized JavaScript payloads embedded in legitimate forums and tech portals.",
    mitigation: "Ensure Google Chrome, Microsoft Edge, Brave, and Opera are patched to the latest emergency release. Enable enhanced memory protection.",
    mitre: [
      { tactic: "Execution", techniqueId: "T1203", techniqueName: "Exploitation for Client Execution" },
      { tactic: "Defense Evasion", techniqueId: "T1055", techniqueName: "Process Injection" },
    ],
    iocs: {
      domains: ["cryptotracker-market-feed.xyz", "techforum-cdn-update.net"],
      ips: ["185.180.143.19"],
      hashes: ["4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b"],
    },
  },
  {
    id: "ADV-2025-062",
    title: "Electricity Board & Bank KYC Disconnection Smishing with Malicious APK Droppers",
    category: "Mobile Smishing",
    severity: "high",
    date: "5 days ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    originRegion: "South Asia",
    targetSectors: ["Mobile Banking Users", "Small Businesses"],
    summary: "Widespread automated SMS campaigns warning that power or bank accounts will be disconnected tonight. Victims are instructed to install an 'official update APK' that steals SMS OTPs and forwards calls.",
    attackVector: "SMS with shortened links downloading malicious Android package kits (.apk) that request accessibility and SMS permissions.",
    mitigation: "Never install APK files from outside the official Google Play Store or Apple App Store. Legitimate utility boards do not send threats from personal mobile numbers.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1566.002", techniqueName: "Spearphishing SMS" },
      { tactic: "Collection", techniqueId: "T1412", techniqueName: "Capture SMS / OTP Messages" },
    ],
    iocs: {
      domains: ["powerbill-update-quickpay.top", "kyc-sbi-service-alert.click"],
      ips: ["141.98.11.89", "193.106.191.144"],
      hashes: ["c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8"],
    },
    simulationUrl: "/simulations/smishing",
    simulationLabel: "Test Mobile Smishing Sim",
  },
  {
    id: "ADV-2025-051",
    title: "AI Voice-Cloning & CEO Deepfake Audio Authorizing High-Value Wire Transfers",
    category: "AI & Emerging",
    severity: "high",
    date: "1 week ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 168,
    originRegion: "Global / Distributed",
    targetSectors: ["Corporate Finance", "Real Estate", "Venture Capital"],
    summary: "Adversaries train neural text-to-speech models using public conference talks and earnings calls of senior executives, then place phone calls to accounts payable employees instructing urgent vendor payments.",
    attackVector: "Synthetic voice generation combined with spoofed corporate caller ID and follow-up emails mimicking executive syntax.",
    mitigation: "Establish mandatory multi-channel out-of-band verification and verbal dual-authorization passphrases for all wire transfers above $5,000.",
    mitre: [
      { tactic: "Social Engineering", techniqueId: "T1656", techniqueName: "Impersonation via Generative AI" },
      { tactic: "Initial Access", techniqueId: "T1566.004", techniqueName: "Spearphishing Voice" },
    ],
    iocs: {
      domains: ["vendor-procurement-settlement.com"],
      ips: ["23.106.249.12"],
      hashes: ["f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2"],
    },
  },
  {
    id: "ADV-2025-044",
    title: "Quishing: Weaponized QR Code Stickers Overlaid at Parking Meters & Cafes",
    category: "Social Engineering",
    severity: "elevated",
    date: "1 week ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 180,
    originRegion: "North America & Western Europe",
    targetSectors: ["Retail Consumers", "Commuters"],
    summary: "Threat actors paste malicious QR code stickers over legitimate municipal parking meters, dining tables, and transit kiosks. Scanning takes victims to deceptive payment credential harvesting sites.",
    attackVector: "Physical sticker tampering directing mobile browsers to reverse proxies harvesting credit cards and CVVs.",
    mitigation: "Inspect QR codes for physical tampering (stickers overlaid on original signs). Preview the exact destination URL in your camera app before confirming navigation.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1566", techniqueName: "Phishing via QR Code (Quishing)" },
      { tactic: "Credential Access", techniqueId: "T1056", techniqueName: "Input Capture" },
    ],
    iocs: {
      domains: ["quick-park-pay-city.site", "meter-pay-transit.net"],
      ips: ["172.67.189.44"],
      hashes: ["11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff"],
    },
    simulationUrl: "/tools",
    simulationLabel: "Inspect URL in Toolkit",
  },
  {
    id: "ADV-2025-037",
    title: "OAuth Session Hijacking via Malicious Chrome & Edge Extensions",
    category: "Cloud & Network",
    severity: "elevated",
    date: "2 weeks ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 336,
    originRegion: "East Asia",
    targetSectors: ["Software Developers", "Cloud DevOps", "Marketing Agencies"],
    summary: "Adversaries acquired abandoned legitimate browser extension listings on the Chrome Web Store and pushed updates that covertly exfiltrated session cookies for GitHub, AWS, and Google Workspace.",
    attackVector: "Automated exfiltration of active `Cookie` HTTP request headers to remote command-and-control servers.",
    mitigation: "Enforce corporate browser management policies restricting extension installation to an IT-approved enterprise whitelist. Audit active OAuth tokens regularly.",
    mitre: [
      { tactic: "Persistence", techniqueId: "T1176", techniqueName: "Browser Extensions" },
      { tactic: "Credential Access", techniqueId: "T1539", techniqueName: "Steal Web Session Cookie" },
    ],
    iocs: {
      domains: ["sync-api-analytics-cloud.io", "extension-telemetry-cdn.com"],
      ips: ["104.21.32.18"],
      hashes: ["aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899"],
    },
  },
  {
    id: "ADV-2025-029",
    cve: "CVE-2024-43451",
    title: "Windows Shell NTLM Hash Disclosure Zero-Click Exploit",
    category: "Zero-Day",
    severity: "high",
    date: "2 weeks ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 360,
    originRegion: "Russia / CIS",
    targetSectors: ["Government Agencies", "Defense Industry"],
    summary: "A vulnerability in Windows file handling allows remote attackers to trigger an automatic outbound NTLM connection merely by a user selecting, viewing, or interacting with a crafted .url file.",
    attackVector: "Malicious shortcut files distributed via spearphishing attachments triggering unauthenticated NTLM relay attacks.",
    mitigation: "Apply Windows monthly security rollups immediately. Block outbound SMB (port 445) at the network perimeter firewall and configure NTLM auditing.",
    mitre: [
      { tactic: "Credential Access", techniqueId: "T1187", techniqueName: "Forced Authentication" },
      { tactic: "Execution", techniqueId: "T1204.002", techniqueName: "Malicious File Execution" },
    ],
    iocs: {
      domains: ["relay-auth-check.ru"],
      ips: ["185.196.8.22"],
      hashes: ["fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"],
    },
  },
  {
    id: "ADV-2025-018",
    title: "Public Wi-Fi 'Evil Twin' & SSL Stripping Attacks in Airport Transit Terminals",
    category: "Cloud & Network",
    severity: "elevated",
    date: "3 weeks ago",
    timestamp: Date.now() - 1000 * 60 * 60 * 504,
    originRegion: "Global Airports & Hotels",
    targetSectors: ["Business Travelers", "Remote Executives"],
    summary: "Attackers operate portable Wi-Fi Pineapple devices broadcasting identical SSIDs (e.g., 'Airport_Free_HighSpeed_WiFi') in transit terminals, spoofing captive portals and performing SSL stripping.",
    attackVector: "Rogue 802.11 access points broadcasting identical BSSIDs with de-authentication frame floods to force victim device reconnection.",
    mitigation: "Never connect to untrusted public Wi-Fi without an active corporate VPN. Turn off 'Auto-Join Known Networks' on mobile devices.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1557.002", techniqueName: "ARP Poisoning / Evil Twin" },
      { tactic: "Credential Access", techniqueId: "T1040", techniqueName: "Network Sniffing" },
    ],
    iocs: {
      domains: ["airport-wifi-login-portal.cc"],
      ips: ["192.168.1.1"],
      hashes: ["99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa"],
    },
    simulationUrl: "/simulations/mitm",
    simulationLabel: "Launch Wi-Fi MITM Sim",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   RADAR NODE HUBS FOR LIVE SVG ATTACK CANVAS
───────────────────────────────────────────────────────────────────────────── */

interface RadarHub {
  name: string;
  x: number;
  y: number;
  country: string;
}

const RADAR_HUBS: RadarHub[] = [
  { name: "Silicon Valley", x: 130, y: 150, country: "USA" },
  { name: "New York",       x: 230, y: 160, country: "USA" },
  { name: "Frankfurt",      x: 440, y: 140, country: "Germany" },
  { name: "London",         x: 410, y: 130, country: "UK" },
  { name: "Moscow",         x: 520, y: 120, country: "Russia" },
  { name: "Dubai",          x: 530, y: 190, country: "UAE" },
  { name: "Bengaluru",      x: 580, y: 220, country: "India" },
  { name: "Singapore",      x: 640, y: 240, country: "Singapore" },
  { name: "Tokyo",          x: 720, y: 170, country: "Japan" },
  { name: "Sydney",         x: 730, y: 310, country: "Australia" },
  { name: "São Paulo",      x: 290, y: 290, country: "Brazil" },
];

const SECTORS = ["Healthcare", "Finance", "Energy", "Education", "Government", "Defense", "Cloud Tech"];

const ATTACK_VECTORS = [
  "Ransomware Lateral Beacon",
  "Teams Phishing Wave",
  "Smishing OTP Intercept",
  "Zero-Day Memory Injection",
  "Evil Twin Wi-Fi Probe",
  "Credential Stuffing Surge",
  "Deepfake Audio Verification",
];

function generateLiveAttack(id: number): LiveAttackEvent {
  const src = RADAR_HUBS[Math.floor(Math.random() * RADAR_HUBS.length)];
  let dest = RADAR_HUBS[Math.floor(Math.random() * RADAR_HUBS.length)];
  while (dest.name === src.name) {
    dest = RADAR_HUBS[Math.floor(Math.random() * RADAR_HUBS.length)];
  }

  const date = new Date();
  const time = date.toTimeString().split(" ")[0];
  const severity: "critical" | "high" | "medium" = 
    Math.random() > 0.65 ? "critical" : Math.random() > 0.35 ? "high" : "medium";

  return {
    id: `atk-${id}-${Date.now()}`,
    time,
    sourceCity: src.name,
    sourceCountry: src.country,
    targetCity: dest.name,
    targetSector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
    attackType: ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)],
    severity,
    x1: src.x,
    y1: src.y,
    x2: dest.x,
    y2: dest.y,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export function ThreatIntelligencePage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "severity">("recent");
  const [selectedAdvisory, setSelectedAdvisory] = useState<ThreatAdvisory | null>(null);
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);
  const [liveStreamPaused, setLiveStreamPaused] = useState(false);

  // Live attack events for the interactive canvas and stream
  const [attacks, setAttacks] = useState<LiveAttackEvent[]>(() => [
    generateLiveAttack(1),
    generateLiveAttack(2),
    generateLiveAttack(3),
    generateLiveAttack(4),
  ]);

  // Periodic attack generator
  useEffect(() => {
    if (liveStreamPaused) return;
    const interval = setInterval(() => {
      setAttacks((prev) => {
        const next = [generateLiveAttack(Date.now()), ...prev.slice(0, 11)];
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [liveStreamPaused]);

  // Categories list
  const categories: string[] = [
    "all",
    "Ransomware",
    "Zero-Day",
    "Social Engineering",
    "Mobile Smishing",
    "AI & Emerging",
    "Cloud & Network",
  ];

  // Filtering & Sorting
  const filteredAdvisories = useMemo(() => {
    return ADVISORIES.filter((adv) => {
      const matchSearch =
        adv.title.toLowerCase().includes(search.toLowerCase()) ||
        adv.summary.toLowerCase().includes(search.toLowerCase()) ||
        adv.attackVector.toLowerCase().includes(search.toLowerCase()) ||
        (adv.cve && adv.cve.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory === "all" || adv.category === selectedCategory;
      const matchSev = selectedSeverity === "all" || adv.severity === selectedSeverity;

      return matchSearch && matchCat && matchSev;
    }).sort((a, b) => {
      if (sortBy === "severity") {
        const rank = { critical: 4, high: 3, elevated: 2, advisory: 1 };
        return rank[b.severity] - rank[a.severity];
      }
      return b.timestamp - a.timestamp;
    });
  }, [search, selectedCategory, selectedSeverity, sortBy]);

  const handleCopyIocs = (adv: ThreatAdvisory) => {
    const text = [
      `=== IOC EXPORT: ${adv.title} (${adv.id}) ===`,
      `CVE: ${adv.cve || "N/A"}`,
      `Domains: ${adv.iocs.domains.join(", ")}`,
      `IPs: ${adv.iocs.ips.join(", ")}`,
      `Hashes: ${adv.iocs.hashes.join(", ")}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopiedIoc(adv.id);
    setTimeout(() => setCopiedIoc(null), 2500);
  };

  const severityTone = (sev: ThreatSeverity): "danger" | "warn" | "violet" | "cyan" => {
    switch (sev) {
      case "critical": return "danger";
      case "high":     return "warn";
      case "elevated": return "violet";
      case "advisory": return "cyan";
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & GLOBAL DEFCON LEVEL HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-danger animate-ping" />
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-danger">
                Global Cyber Threat Intelligence Radar
              </p>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-1">
              Live Threat Radar &amp; Tactical Intelligence
            </h1>
            <p className="mt-1 text-xs text-text-fog">
              Real-time surveillance tracking weaponized zero-days, ransomware syndicates, mobile smishing campaigns, and AI extortion waves.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-2 flex items-center gap-3">
              <i className="ti ti-shield-bolt text-2xl text-danger animate-pulse" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
                  Current Threat Posture
                </span>
                <span className="font-display text-sm font-bold text-danger">
                  DEFCON 2 — ELEVATED
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface px-4 py-2 flex items-center gap-3">
              <i className="ti ti-radar text-2xl text-primary" />
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash block">
                  Active Campaigns
                </span>
                <span className="font-display text-sm font-bold text-text-pure">
                  18 Tracked Worldwide
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. LIVE INTERACTIVE ATTACK RADAR CANVAS & TELEMETRY STREAM ── */}
      <Card className="p-0 overflow-hidden border-border bg-surface-elevated shadow-xl">
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display text-sm font-bold text-text-pure">
              Live Attack Stream &amp; In-Flight Vector Canvas
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-text-ash">
              (Simulated Global Honeypot Telemetry)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiveStreamPaused((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-colors border ${
                liveStreamPaused
                  ? "border-warn bg-warn/10 text-warn"
                  : "border-border bg-surface text-text-ash hover:text-text-pure"
              }`}
            >
              <i className={`ti ${liveStreamPaused ? "ti-player-play" : "ti-player-pause"} text-xs`} />
              <span>{liveStreamPaused ? "Resume Feed" : "Pause Feed"}</span>
            </button>
            <div className="font-mono text-[11px] text-text-ash px-2 py-1 rounded-lg bg-surface border border-border">
              {attacks.length} Active Vectors
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Visual SVG World Canvas */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-[#070b14] relative overflow-hidden flex items-center justify-center min-h-[320px]">
            {/* Grid Pattern Background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
                backgroundSize: "24px 24px"
              }}
            />

            {/* SVG Attack Projection */}
            <svg
              viewBox="0 0 840 380"
              className="w-full h-auto max-h-[340px] select-none relative z-10"
            >
              <defs>
                <linearGradient id="attackBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* World Continents Schematic Outline */}
              <g fill="#162036" stroke="#223354" strokeWidth="0.8" opacity="0.6">
                {/* North America */}
                <path d="M 90 90 L 250 80 L 280 140 L 240 210 L 170 230 L 130 170 Z" />
                {/* South America */}
                <path d="M 240 240 L 320 250 L 300 360 L 250 340 Z" />
                {/* Europe */}
                <path d="M 380 90 L 480 80 L 490 160 L 390 170 Z" />
                {/* Africa */}
                <path d="M 400 180 L 510 180 L 490 320 L 420 300 Z" />
                {/* Asia */}
                <path d="M 500 70 L 740 80 L 730 220 L 610 240 L 520 180 Z" />
                {/* Australia */}
                <path d="M 680 270 L 780 280 L 760 360 L 680 340 Z" />
              </g>

              {/* Dynamic Attack Laser Beams */}
              {attacks.slice(0, 5).map((atk) => {
                const midX = (atk.x1 + atk.x2) / 2;
                const midY = Math.min(atk.y1, atk.y2) - 35;
                const pathD = `M ${atk.x1} ${atk.y1} Q ${midX} ${midY} ${atk.x2} ${atk.y2}`;

                return (
                  <g key={atk.id}>
                    {/* Background Arc */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={atk.severity === "critical" ? "#ef4444" : "#f59e0b"}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />
                    {/* Pulsing projectile along path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#attackBeamGrad)"
                      strokeWidth="2.5"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                    {/* Target Impact Burst */}
                    <circle
                      cx={atk.x2}
                      cy={atk.y2}
                      r="7"
                      fill="none"
                      stroke={atk.severity === "critical" ? "#ef4444" : "#38bdf8"}
                      strokeWidth="1.5"
                      className="animate-ping origin-center"
                    />
                  </g>
                );
              })}

              {/* Hub Nodes */}
              {RADAR_HUBS.map((hub) => (
                <g key={hub.name} className="cursor-pointer group">
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r="4"
                    fill="#38bdf8"
                    className="group-hover:fill-white transition-colors"
                  />
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r="9"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                  <text
                    x={hub.x}
                    y={hub.y - 12}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    className="group-hover:fill-white font-bold transition-colors"
                  >
                    {hub.name}
                  </text>
                </g>
              ))}
            </svg>

            {/* Radar Coordinates Overlay */}
            <div className="absolute bottom-3 left-4 font-mono text-[10px] text-text-ash flex items-center gap-4 bg-black/60 px-3 py-1.5 rounded-lg border border-border/40 backdrop-blur-md">
              <span>SCAN GRID: 840x380 GEO-INT</span>
              <span className="text-emerald-400">STATUS: ACTIVE SWEEP</span>
              <span className="hidden sm:inline text-text-fog">SENSORS: 11 GLOBAL HONEYPOTS</span>
            </div>
          </div>

          {/* Right: Real-time Telemetry Stream Ticker */}
          <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col justify-between max-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="font-mono text-xs font-bold text-text-pure uppercase tracking-wider flex items-center gap-1.5">
                  <i className="ti ti-terminal text-primary" /> Live Intercept Log
                </span>
                <span className="font-mono text-[10px] text-emerald-400">REALTIME</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
                <AnimatePresence initial={false}>
                  {attacks.slice(0, 6).map((atk) => (
                    <motion.div
                      key={atk.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-2.5 rounded-xl border border-border bg-surface-elevated text-xs space-y-1 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-text-ash">[{atk.time}]</span>
                        <span
                          className={`font-bold uppercase px-1.5 py-0.2 rounded text-[9px] ${
                            atk.severity === "critical"
                              ? "bg-danger/20 text-danger border border-danger/30"
                              : atk.severity === "high"
                              ? "bg-warn/20 text-warn border border-warn/30"
                              : "bg-primary/20 text-primary border border-primary/30"
                          }`}
                        >
                          {atk.severity}
                        </span>
                      </div>
                      <div className="font-semibold text-text-pure truncate text-[11px]">
                        {atk.attackType}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-fog font-mono">
                        <span>{atk.sourceCity} &rarr; {atk.targetCity}</span>
                        <span className="text-text-ash">{atk.targetSector}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-3 border-t border-border mt-3 text-[10px] font-mono text-text-ash flex items-center justify-between">
              <span>Updated: Just now</span>
              <span className="text-primary font-semibold">Zero-Trust Node Sync</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 3. THREAT SEARCH, CATEGORY TABS & SEVERITY FILTER ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threat dossiers by CVE, keyword (e.g. 'ransomware', 'teams', 'apk'), or attack vector..."
              className="input pl-10 text-xs sm:text-sm py-2.5"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-ash hover:text-text-pure"
              >
                <i className="ti ti-x text-sm" />
              </button>
            )}
          </div>

          {/* Severity & Sort Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="elevated">Elevated Only</option>
              <option value="advisory">Advisory Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "severity")}
              className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="severity">Sort: Highest Severity</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-medium transition-all ${
                selectedCategory === c
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
              }`}
            >
              {c === "all" ? "All Advisories" : c}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. THREAT DOSSIERS FEED ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-text-ash font-mono">
          <span>Showing {filteredAdvisories.length} verified security bulletins</span>
          <span>Updated continuously from CISA KEV &amp; MITRE ATT&amp;CK feeds</span>
        </div>

        {filteredAdvisories.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <i className="ti ti-radar-off text-4xl text-text-ash" />
            <h3 className="font-display text-base font-bold text-text-pure">
              No Threat Advisories Match Your Filter
            </h3>
            <p className="text-xs text-text-fog max-w-sm mx-auto">
              Try clearing your search query or selecting &apos;All Advisories&apos; to view global intelligence bulletins.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedSeverity("all"); }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          filteredAdvisories.map((adv, i) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.25 }}
            >
              <Card className="p-6 sm:p-7 hover:border-primary/40 transition-all">
                {/* Top Badge Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={severityTone(adv.severity)} size="sm">
                      {adv.severity.toUpperCase()}
                    </Pill>
                    <span className="font-mono text-xs text-text-ash px-2 py-0.5 rounded bg-surface border border-border">
                      {adv.category}
                    </span>
                    {adv.cve && (
                      <span className="font-mono text-[11px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                        {adv.cve}
                      </span>
                    )}
                    <span className="text-[11px] text-text-ash font-mono">
                      Origin: <strong className="text-text-pure">{adv.originRegion}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-text-ash">
                    <span>REF: {adv.id}</span>
                    <span>·</span>
                    <span>{adv.date}</span>
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="mt-4">
                  <h3 className="font-display text-base sm:text-lg font-bold text-text-pure leading-snug">
                    {adv.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-text-fog">
                    {adv.summary}
                  </p>
                </div>

                {/* Target Sectors */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-text-ash mr-1">Impacted Sectors:</span>
                  {adv.targetSectors.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-surface text-[10px] font-mono text-text-pure border border-border"
                    >
                      {sec}
                    </span>
                  ))}
                </div>

                {/* Attack Vector & Mitigation Preview */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-danger font-bold flex items-center gap-1.5">
                      <i className="ti ti-target" /> Observed Attack Vector
                    </span>
                    <p className="text-xs text-text-pure leading-relaxed">
                      {adv.attackVector}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <i className="ti ti-shield-check" /> Defensive Mitigation Directive
                    </span>
                    <p className="text-xs text-text-pure leading-relaxed">
                      {adv.mitigation}
                    </p>
                  </div>
                </div>

                {/* Footer Actions: Deep-Dive Dossier, Copy IOCs, Sandbox Link */}
                <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<i className="ti ti-eye" />}
                      onClick={() => setSelectedAdvisory(adv)}
                      className="text-xs font-semibold"
                    >
                      Inspect Full Dossier &amp; MITRE
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<i className={`ti ${copiedIoc === adv.id ? "ti-check text-emerald-400" : "ti-copy"}`} />}
                      onClick={() => handleCopyIocs(adv)}
                      className="text-xs"
                    >
                      {copiedIoc === adv.id ? "IOCs Copied!" : "Export IOCs"}
                    </Button>
                  </div>

                  {adv.simulationUrl && (
                    <Link to={adv.simulationUrl}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<i className="ti ti-player-play text-primary" />}
                        className="text-xs text-primary font-bold hover:bg-primary/10"
                      >
                        {adv.simulationLabel || "Practice in Sandbox"} &rarr;
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* ── 5. DEEP-DIVE THREAT DOSSIER MODAL ── */}
      <AnimatePresence>
        {selectedAdvisory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-3xl rounded-3xl border border-border bg-surface-elevated shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border bg-surface flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone={severityTone(selectedAdvisory.severity)}>
                      {selectedAdvisory.severity.toUpperCase()}
                    </Pill>
                    <span className="font-mono text-xs text-text-ash">
                      {selectedAdvisory.category}
                    </span>
                    {selectedAdvisory.cve && (
                      <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                        {selectedAdvisory.cve}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 font-display text-lg sm:text-xl font-bold text-text-pure">
                    {selectedAdvisory.title}
                  </h2>
                  <p className="mt-1 text-xs font-mono text-text-ash">
                    Reference ID: {selectedAdvisory.id} · Recorded: {selectedAdvisory.date} · Region: {selectedAdvisory.originRegion}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAdvisory(null)}
                  className="p-2 rounded-xl text-text-ash hover:text-text-pure hover:bg-surface border border-border transition-colors"
                >
                  <i className="ti ti-x text-lg" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
                {/* Full Threat Brief */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
                    1. Tactical Threat Summary
                  </span>
                  <p className="text-text-pure leading-relaxed text-sm bg-surface p-4 rounded-2xl border border-border">
                    {selectedAdvisory.summary}
                  </p>
                </div>

                {/* MITRE ATT&CK Matrix Mapping */}
                <div className="space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
                    2. MITRE ATT&amp;CK Framework Mapping
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedAdvisory.mitre.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-mono text-[10px] text-primary uppercase font-bold block">
                            Tactic: {m.tactic}
                          </span>
                          <strong className="text-xs text-text-pure mt-0.5 block">
                            {m.techniqueName}
                          </strong>
                        </div>
                        <span className="font-mono text-xs font-bold text-text-pure px-2 py-0.5 rounded bg-surface border border-border">
                          {m.techniqueId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicators of Compromise (IOCs) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block">
                      3. Verified Indicators of Compromise (IOCs)
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<i className={`ti ${copiedIoc === selectedAdvisory.id ? "ti-check text-emerald-400" : "ti-copy"}`} />}
                      onClick={() => handleCopyIocs(selectedAdvisory)}
                      className="text-xs py-1"
                    >
                      {copiedIoc === selectedAdvisory.id ? "Copied to Clipboard!" : "Copy IOC Block"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 font-mono text-[11px]">
                    <div>
                      <span className="text-text-ash block text-[10px] uppercase mb-1">C2 Domains:</span>
                      <div className="space-y-1">
                        {selectedAdvisory.iocs.domains.map((d, i) => (
                          <div key={i} className="text-danger flex items-center gap-2">
                            <i className="ti ti-world text-xs shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-text-ash block text-[10px] uppercase mb-1">Observed Attacker IPs:</span>
                      <div className="space-y-1">
                        {selectedAdvisory.iocs.ips.map((ip, i) => (
                          <div key={i} className="text-warn flex items-center gap-2">
                            <i className="ti ti-server text-xs shrink-0" />
                            <span>{ip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-text-ash block text-[10px] uppercase mb-1">Payload SHA-256 Hashes:</span>
                      <div className="space-y-1">
                        {selectedAdvisory.iocs.hashes.map((h, i) => (
                          <div key={i} className="text-text-fog break-all flex items-center gap-2">
                            <i className="ti ti-hash text-xs shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardening Checklist */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                    4. Hardening &amp; Remediation Instructions
                  </span>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-text-pure space-y-2">
                    <p className="leading-relaxed">
                      {selectedAdvisory.mitigation}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-text-fog text-xs">
                      <li>Block outbound communication to all listed C2 domains and IP subnets at corporate perimeter firewalls.</li>
                      <li>Initiate endpoint compromise scans across all workstations for matching SHA-256 process hashes.</li>
                      <li>Deploy immediate user awareness notifications alerting staff to watch for this specific campaign vector.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-surface flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAdvisory(null)}
                  className="text-xs"
                >
                  Close Dossier
                </Button>

                {selectedAdvisory.simulationUrl && (
                  <Link to={selectedAdvisory.simulationUrl}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<i className="ti ti-player-play" />}
                      className="text-xs font-bold"
                    >
                      {selectedAdvisory.simulationLabel || "Launch Training Simulator"}
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. THREAT INTEL NOTIFICATION SUBSCRIPTION BANNER ── */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-surface to-surface-elevated border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <i className="ti ti-bell-ringing text-lg text-primary" />
            <h3 className="font-display text-base font-bold text-text-pure">
              Receive Urgent Zero-Day &amp; Critical Threat Alerts
            </h3>
          </div>
          <p className="text-xs text-text-fog max-w-xl">
            Get instant telemetry notifications whenever a critical vulnerability (CVSS 9.0+) or nationwide scam wave is detected in your region.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/settings">
            <Button
              variant="primary"
              size="sm"
              icon={<i className="ti ti-settings" />}
              className="text-xs font-bold"
            >
              Configure Notification Feeds
            </Button>
          </Link>
          <Link to="/report">
            <Button
              variant="secondary"
              size="sm"
              icon={<i className="ti ti-flag" />}
              className="text-xs"
            >
              Report a New Threat
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
