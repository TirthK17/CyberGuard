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

export const ADVISORIES: ThreatAdvisory[] = [
  {
    id: "ADV-2026-PHP2SHELL",
    cve: "CVE-2026-109618",
    title: "PHP2Shell: 10-Year-Old Critical Remote Code Execution Flaw in Core PHP Engine Discovered by AI",
    category: "AI & Emerging",
    severity: "critical",
    date: "Last week (October 2026)",
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    originRegion: "Global Open-Source / PHP Core Engine",
    targetSectors: ["Global Web (70% of Internet)", "WordPress Portals", "Government Backends", "Cloud Servers"],
    summary: "Frontier AI vulnerability discovery agents (Calif & Wiz security models) discovered 'php2shell'—uncovering two critical, decade-old remote code execution (RCE) flaws hidden inside the core PHP engine since 2016 (CVE-2026-109618 & CVE-2026-109619). The AI autonomously mapped complex execution paths that human security audits and classical static analyzers missed for 10 years, triggering an emergency worldwide patching wave.",
    attackVector: "Deep logic corruption and input parsing flaws in PHP's core engine allow unauthenticated remote attackers to execute arbitrary shell commands on any server running unpatched PHP.",
    mitigation: "Immediately upgrade PHP to patched releases (PHP 8.3.13+, 8.2.25+, or 8.1.30+). Apply emergency WAF virtual patches, isolate exposed PHP-FPM / CGI processes, and verify server integrity per CISA & CERT-EU emergency directives.",
    mitre: [
      { tactic: "Initial Access", techniqueId: "T1190", techniqueName: "Exploit Public-Facing Application" },
      { tactic: "Execution", techniqueId: "T1059", techniqueName: "Command and Scripting Interpreter (PHP)" },
      { tactic: "Defense Evasion", techniqueId: "T1203", techniqueName: "Exploitation for Client/Server Execution" },
    ],
    iocs: {
      domains: ["php2shell-cve-exploit-scanner.io", "php-vulnerability-probe.net"],
      ips: ["194.38.20.15", "185.196.10.42", "45.154.255.88"],
      hashes: ["e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "7d4b9a1e2f3c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"],
    },
    simulationUrl: "/tools",
    simulationLabel: "Analyze Server Exposure in Tools",
  },
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
    cve: "CVE-2024-21762",
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
    cve: "CVE-2024-5274",
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
      ips: ["185.220.101.44"],
      hashes: ["99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa"],
    },
    simulationUrl: "/simulations/mitm",
    simulationLabel: "Launch Wi-Fi MITM Sim",
  },
];
