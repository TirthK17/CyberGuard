import { useState, useEffect, useMemo } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import {
  CISA_KEV_SNAPSHOT,
  CISA_KEV_SNAPSHOT_METADATA,
  type CisaKevEntry,
} from "@/data/cisaKevSnapshot";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  ADVISORIES,
  type ThreatAdvisory,
  type ThreatSeverity,
  type LiveAttackEvent,
} from "@/data/threats";

export {
  ADVISORIES,
  type ThreatAdvisory,
  type ThreatSeverity,
  type LiveAttackEvent,
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS & RELATIVE TIME FORMATTER
───────────────────────────────────────────────────────────────────────────── */

function formatRelativeTime(dateString: string): string {
  try {
    const target = new Date(dateString);
    if (isNaN(target.getTime())) return dateString;
    const now = new Date();
    const diffSec = Math.round((target.getTime() - now.getTime()) / 1000);
    const diffDays = Math.round(diffSec / 86400);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (Math.abs(diffDays) === 0) return "Today";
    if (Math.abs(diffDays) < 30) {
      return rtf.format(diffDays, "day");
    }
    const diffMonths = Math.round(diffDays / 30);
    return rtf.format(diffMonths, "month");
  } catch {
    return dateString;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   RADAR NODE HUBS FOR LIVE SVG ATTACK CANVAS (SIMULATED)
───────────────────────────────────────────────────────────────────────────── */

interface RadarHub {
  name: string;
  x: number;
  y: number;
  country: string;
}

const RADAR_HUBS: RadarHub[] = [
  { name: "Silicon Valley", x: 130, y: 150, country: "USA" },
  { name: "New York", x: 230, y: 160, country: "USA" },
  { name: "Frankfurt", x: 440, y: 140, country: "Germany" },
  { name: "London", x: 410, y: 130, country: "UK" },
  { name: "Moscow", x: 520, y: 120, country: "Russia" },
  { name: "Dubai", x: 530, y: 190, country: "UAE" },
  { name: "Bengaluru", x: 580, y: 220, country: "India" },
  { name: "Singapore", x: 640, y: 240, country: "Singapore" },
  { name: "Tokyo", x: 720, y: 170, country: "Japan" },
  { name: "Sydney", x: 730, y: 310, country: "Australia" },
  { name: "São Paulo", x: 290, y: 290, country: "Brazil" },
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

const INDIA_SECURITY_CENTERS = [
  {
    name: "CERT-In Vulnerability Notes & Bulletins",
    url: "https://www.cert-in.org.in",
    desc: "National agency for security incident management, issuing high-severity bulletins for operating systems, browsers, and mobile devices.",
    tag: "National CERT",
  },
  {
    name: "National Cybercrime Portal (cybercrime.gov.in)",
    url: "https://cybercrime.gov.in",
    desc: "MHA-authorized central platform to report UPI financial extortion, digital arrest scams, and cyber fraud.",
    tag: "Official Reporting",
  },
  {
    name: "National Cyber Helpline 1930",
    url: "tel:1930",
    desc: "24/7 dedicated financial cyber fraud reporting helpline to trigger immediate banking transaction freezes.",
    tag: "Emergency 1930",
  },
  {
    name: "DoT Sanchar Saathi (Chakshu Portal)",
    url: "https://sancharsaathi.gov.in",
    desc: "Citizen-centric facility to report suspected malicious SMS, spam calls, and block cloned or stolen mobile handsets.",
    tag: "Telecom Fraud",
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */

export function ThreatIntelligencePage() {
  const toast = useToast();

  // Mode: Real CISA KEV Catalog vs Curated Educational Bulletins
  const [activeIntelView, setActiveIntelView] = useState<"cisa" | "bulletins">("cisa");

  // CISA KEV Feed State
  const [kevEntries, setKevEntries] = useState<CisaKevEntry[]>(CISA_KEV_SNAPSHOT);
  const [isLiveFeed, setIsLiveFeed] = useState(false);
  const [feedStatus, setFeedStatus] = useState<string>("Loading CISA KEV feed...");
  const [kevSearch, setKevSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [ransomwareFilter, setRansomwareFilter] = useState<"all" | "ransomware">("all");
  const [selectedKev, setSelectedKev] = useState<CisaKevEntry | null>(null);

  // Curated Advisories State
  const [advSearch, setAdvSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "severity">("recent");
  const [selectedAdvisory, setSelectedAdvisory] = useState<ThreatAdvisory | null>(null);
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  // Live attack simulator state
  const [liveStreamPaused, setLiveStreamPaused] = useState(false);
  const [attacks, setAttacks] = useState<LiveAttackEvent[]>(() => [
    generateLiveAttack(1),
    generateLiveAttack(2),
    generateLiveAttack(3),
    generateLiveAttack(4),
  ]);

  // Fetch CISA KEV JSON with fallback
  useEffect(() => {
    let isMounted = true;
    const fetchCisaKev = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);

        const res = await fetch(
          "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isMounted && data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
          setKevEntries(data.vulnerabilities);
          setIsLiveFeed(true);
          setFeedStatus(`Live CISA KEV Feed Synced (${data.vulnerabilities.length} catalog items)`);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsLiveFeed(false);
          const reason = err instanceof Error ? err.message : "CORS / Network constraint";
          setFeedStatus(
            `CISA KEV Snapshot: v${CISA_KEV_SNAPSHOT_METADATA.catalogVersion} (Offline Snapshot, ${reason})`
          );
        }
      }
    };

    fetchCisaKev();
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic attack generator for simulated radar
  useEffect(() => {
    if (liveStreamPaused) return;
    const interval = setInterval(() => {
      setAttacks((prev) => [generateLiveAttack(Date.now()), ...prev.slice(0, 11)]);
    }, 2800);
    return () => clearInterval(interval);
  }, [liveStreamPaused]);

  // CISA KEV Vendors
  const vendorList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of kevEntries) {
      counts.set(item.vendorProject, (counts.get(item.vendorProject) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([vendor]) => vendor);
  }, [kevEntries]);

  // Filtered CISA KEV
  const filteredKev = useMemo(() => {
    const query = kevSearch.toLowerCase().trim();
    return kevEntries.filter((item) => {
      const matchSearch =
        !query ||
        item.cveID.toLowerCase().includes(query) ||
        item.vendorProject.toLowerCase().includes(query) ||
        item.product.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query);

      const matchVendor = selectedVendor === "all" || item.vendorProject === selectedVendor;
      const matchRansomware =
        ransomwareFilter === "all" ||
        item.knownRansomwareCampaignUse.toLowerCase() === "known";

      return matchSearch && matchVendor && matchRansomware;
    });
  }, [kevEntries, kevSearch, selectedVendor, ransomwareFilter]);

  // Chart Data: Top Vendors in KEV
  const vendorChartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of kevEntries) {
      counts.set(item.vendorProject, (counts.get(item.vendorProject) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count]) => ({ name, count }));
  }, [kevEntries]);

  // Chart Data: 7-Day / Temporal Threat Wave Trend
  const trendData = useMemo(() => [
    { day: "Mon", exploits: 14, ransomware: 4 },
    { day: "Tue", exploits: 19, ransomware: 6 },
    { day: "Wed", exploits: 23, ransomware: 8 },
    { day: "Thu", exploits: 18, ransomware: 5 },
    { day: "Fri", exploits: 27, ransomware: 9 },
    { day: "Sat", exploits: 12, ransomware: 3 },
    { day: "Sun", exploits: 16, ransomware: 4 },
  ], []);

  // Filtered Curated Advisories
  const filteredAdvisories = useMemo(() => {
    return ADVISORIES.filter((adv) => {
      const matchSearch =
        adv.title.toLowerCase().includes(advSearch.toLowerCase()) ||
        adv.summary.toLowerCase().includes(advSearch.toLowerCase()) ||
        adv.attackVector.toLowerCase().includes(advSearch.toLowerCase()) ||
        (adv.cve && adv.cve.toLowerCase().includes(advSearch.toLowerCase()));

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
  }, [advSearch, selectedCategory, selectedSeverity, sortBy]);

  const handleCopyIocs = async (adv: ThreatAdvisory) => {
    const text = [
      `=== IOC EXPORT: ${adv.title} (${adv.id}) ===`,
      `CVE: ${adv.cve || "N/A"}`,
      `Domains: ${adv.iocs.domains.join(", ")}`,
      `IPs: ${adv.iocs.ips.join(", ")}`,
      `Hashes: ${adv.iocs.hashes.join(", ")}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIoc(adv.id);
      setTimeout(() => setCopiedIoc(null), 2500);
      toast({ title: "IOCs Copied", description: `Exported indicators of compromise for ${adv.id}.`, variant: "info" });
    } catch {
      toast({ title: "Copy Failed", description: "Clipboard access was denied by your browser.", variant: "error" });
    }
  };

  const severityTone = (sev: ThreatSeverity): "danger" | "warn" | "violet" | "cyan" => {
    switch (sev) {
      case "critical": return "danger";
      case "high": return "warn";
      case "elevated": return "violet";
      case "advisory": return "cyan";
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. HEADER & DEFCON HERO ── */}
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
                Real Threat Intelligence &amp; CISA Catalog
              </p>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-1">
              Live Threat Intelligence &amp; Vulnerabilities
            </h1>
            <p className="mt-1 text-sm text-text-fog">
              Direct feed from CISA Known Exploited Vulnerabilities (KEV), national CERT-In security bulletins, and verified online scams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`rounded-2xl border px-3.5 py-2 flex items-center gap-2.5 text-xs ${
              isLiveFeed ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-border bg-surface text-text-fog"
            }`}>
              <i className={`ti ${isLiveFeed ? "ti-wifi" : "ti-database"} text-sm`} aria-hidden="true" />
              <span className="font-mono font-medium">{feedStatus}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BREAKING ZERO-DAY SPOTLIGHT: PHP2SHELL (AI-DISCOVERED) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-surface to-surface p-5 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                CRITICAL ZERO-DAY
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold">
                🤖 AI-Discovered Vulnerability
              </span>
              <span className="text-xs text-text-ash font-mono">• October 2026 Emergency Advisory</span>
            </div>

            <h2 className="font-display text-base sm:text-lg font-bold text-text-pure">
              PHP2Shell: 10-Year-Old Remote Code Execution in PHP Core (CVE-2026-109618 / 19)
            </h2>

            <p className="text-xs sm:text-sm text-text-fog leading-relaxed">
              Autonomous AI vulnerability agents (Calif &amp; Wiz) uncovered two critical flaws dormant inside the core PHP engine since 2016. Because PHP powers ~70% of global web servers (including WordPress and government portals), this triggered global emergency directives from CISA and CERT-EU.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const phpAdv = ADVISORIES.find((a) => a.id === "ADV-2026-PHP2SHELL") || ADVISORIES[0];
                setSelectedAdvisory(phpAdv);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
            >
              Inspect IoCs &amp; Mitigations &rarr;
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── 2. RECHARTS ANALYTICS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Top Vendors with Exploited CVEs */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-text-pure">
                Most Targeted Vendors (CISA KEV Catalog)
              </h3>
              <p className="text-xs text-text-fog">Number of actively weaponized zero-days and vulnerabilities</p>
            </div>
            <Pill tone="cyan">KEV Analysis</Pill>
          </div>

          <div className="h-48 w-full" aria-label="Vendor breakdown bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "0.75rem", fontSize: "12px", color: "#f4f4f5" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Weekly Threat Wave & Ransomware Campaign Trend */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-text-pure">
                7-Day Infiltration &amp; Ransomware Frequency
              </h3>
              <p className="text-xs text-text-fog">Simulated telemetry trend across critical infrastructure sectors</p>
            </div>
            <Pill tone="warn">Telemetry Trend</Pill>
          </div>

          <div className="h-48 w-full" aria-label="7-day trend line chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "0.75rem", fontSize: "12px", color: "#f4f4f5" }}
                />
                <Line type="monotone" dataKey="exploits" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} name="Exploit Attempts" />
                <Line type="monotone" dataKey="ransomware" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Ransomware Vectors" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 3. SIMULATED RADAR VISUALIZATION (HONEST LABELLING) ── */}
      <Card className="p-0 overflow-hidden border-border bg-surface-elevated shadow-xl">
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display text-base font-bold text-text-pure">
              Simulated Global Threat Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-[10px] font-bold text-text-dim">
              Simulated Visualisation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiveStreamPaused((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                liveStreamPaused
                  ? "border-warn bg-warn/10 text-warn"
                  : "border-border bg-surface text-text-ash hover:text-text-pure"
              }`}
            >
              <i className={`ti ${liveStreamPaused ? "ti-player-play" : "ti-player-pause"} text-xs`} aria-hidden="true" />
              <span>{liveStreamPaused ? "Resume Telemetry" : "Pause"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Visual SVG World Canvas */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-[#070b14] relative overflow-hidden flex items-center justify-center min-h-[300px]">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <svg viewBox="0 0 840 380" className="w-full h-auto max-h-[320px] select-none relative z-10" aria-label="World attack map schematic">
              <defs>
                <linearGradient id="attackBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Continents outline */}
              <g fill="#162036" stroke="#223354" strokeWidth="0.8" opacity="0.6">
                <path d="M 90 90 L 250 80 L 280 140 L 240 210 L 170 230 L 130 170 Z" />
                <path d="M 240 240 L 320 250 L 300 360 L 250 340 Z" />
                <path d="M 380 90 L 480 80 L 490 160 L 390 170 Z" />
                <path d="M 400 180 L 510 180 L 490 320 L 420 300 Z" />
                <path d="M 500 70 L 740 80 L 730 220 L 610 240 L 520 180 Z" />
                <path d="M 680 270 L 780 280 L 760 360 L 680 340 Z" />
              </g>

              {/* Dynamic Attack Laser Beams */}
              {attacks.slice(0, 4).map((atk) => {
                const midX = (atk.x1 + atk.x2) / 2;
                const midY = Math.min(atk.y1, atk.y2) - 35;
                const pathD = `M ${atk.x1} ${atk.y1} Q ${midX} ${midY} ${atk.x2} ${atk.y2}`;

                return (
                  <g key={atk.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={atk.severity === "critical" ? "#ef4444" : "#f59e0b"}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.4"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#attackBeamGrad)"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                    <circle
                      cx={atk.x2}
                      cy={atk.y2}
                      r="6"
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
                <g key={hub.name}>
                  <circle cx={hub.x} cy={hub.y} r="3.5" fill="#38bdf8" />
                  <text x={hub.x} y={hub.y - 10} textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">
                    {hub.name}
                  </text>
                </g>
              ))}
            </svg>

            <div className="absolute bottom-3 left-4 text-[11px] font-semibold text-text-ash flex items-center gap-2 bg-black/70 px-3 py-1 rounded-lg border border-border/40 backdrop-blur-md">
              <span className="text-amber-400 font-bold">● SIMULATED TELEMETRY</span>
              <span className="hidden sm:inline text-text-fog">Illustrative visualization of global attack traffic</span>
            </div>
          </div>

          {/* Telemetry Stream Ticker */}
          <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col justify-between max-h-[340px]">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border mb-2.5">
                <span className="text-xs font-bold text-text-pure flex items-center gap-1.5">
                  <i className="ti ti-terminal text-primary" aria-hidden="true" /> Simulated Attack Log
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-400">DEMO FEED</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                <AnimatePresence initial={false}>
                  {attacks.slice(0, 5).map((atk) => (
                    <motion.div
                      key={atk.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-2.5 rounded-xl border border-border bg-surface-elevated text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-text-ash">[{atk.time}]</span>
                        <span className={`font-semibold uppercase px-1.5 py-0.5 rounded text-[9px] ${
                          atk.severity === "critical" ? "bg-danger/20 text-danger" : "bg-warn/20 text-warn"
                        }`}>
                          {atk.severity}
                        </span>
                      </div>
                      <div className="font-semibold text-text-pure truncate text-xs">
                        {atk.attackType}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-fog">
                        <span>{atk.sourceCity} &rarr; {atk.targetCity}</span>
                        <span className="text-text-ash">{atk.targetSector}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-2 text-[11px] text-text-ash flex items-center justify-between">
              <span>Updated: Simulated Stream</span>
              <span className="text-primary font-semibold">Active</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. DUAL INTEL FEED SWITCHER ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2" role="tablist" aria-label="Intel Feed Category">
            <button
              role="tab"
              aria-selected={activeIntelView === "cisa"}
              onClick={() => setActiveIntelView("cisa")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeIntelView === "cisa"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-fog hover:text-text-pure hover:bg-surface"
              }`}
            >
              <i className="ti ti-shield-code mr-1.5" aria-hidden="true" />
              CISA Known Exploited Vulnerabilities ({filteredKev.length})
            </button>

            <button
              role="tab"
              aria-selected={activeIntelView === "bulletins"}
              onClick={() => setActiveIntelView("bulletins")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeIntelView === "bulletins"
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-fog hover:text-text-pure hover:bg-surface"
              }`}
            >
              <i className="ti ti-alert-triangle mr-1.5" aria-hidden="true" />
              Scam &amp; Phishing Bulletins ({filteredAdvisories.length})
            </button>
          </div>
        </div>

        {/* ── VIEW 1: CISA KEV CATALOG FEED ── */}
        {activeIntelView === "cisa" && (
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" aria-hidden="true" />
                <input
                  type="text"
                  value={kevSearch}
                  onChange={(e) => setKevSearch(e.target.value)}
                  placeholder="Search CVE ID, vendor (e.g. Fortinet, Microsoft), or product..."
                  className="input pl-10 text-xs sm:text-sm py-2.5"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
                >
                  <option value="all">All Vendors ({vendorList.length})</option>
                  {vendorList.slice(0, 15).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <select
                  value={ransomwareFilter}
                  onChange={(e) => setRansomwareFilter(e.target.value as typeof ransomwareFilter)}
                  className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
                >
                  <option value="all">All Exploits</option>
                  <option value="ransomware">Known Ransomware Campaigns</option>
                </select>
              </div>
            </div>

            {/* KEV Entries List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKev.slice(0, 30).map((item) => (
                <Card
                  key={item.cveID}
                  className="p-5 border-border bg-surface hover:bg-surface-elevated hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {item.cveID}
                      </span>
                      {item.knownRansomwareCampaignUse.toLowerCase() === "known" && (
                        <Pill tone="danger">Known Ransomware Vector</Pill>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-text-pure">
                      {item.vendorProject} - {item.product}
                    </h4>

                    <p className="text-xs text-text-fog leading-relaxed line-clamp-3">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-text-ash font-mono">
                      <span>Added: <strong>{formatRelativeTime(item.dateAdded)}</strong></span>
                      <span>Due: <strong>{formatRelativeTime(item.dueDate)}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${item.cveID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                      >
                        NVD Reference <i className="ti ti-external-link text-xs" aria-hidden="true" />
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedKev(item)}
                        className="text-xs h-7 px-2"
                      >
                        Action Required
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── VIEW 2: SCAM & PHISHING BULLETINS ── */}
        {activeIntelView === "bulletins" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-ash" aria-hidden="true" />
                <input
                  type="text"
                  value={advSearch}
                  onChange={(e) => setAdvSearch(e.target.value)}
                  placeholder="Search advisories (e.g., 'teams', 'sms', 'apk', 'wire')..."
                  className="input pl-10 text-xs sm:text-sm py-2.5"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
                >
                  <option value="all">All Categories</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="Zero-Day">Zero-Day</option>
                  <option value="Social Engineering">Social Engineering</option>
                  <option value="Mobile Smishing">Mobile Smishing</option>
                  <option value="AI & Emerging">AI & Emerging</option>
                  <option value="Cloud & Network">Cloud & Network</option>
                </select>

                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="select text-xs py-2 px-3 bg-surface border-border rounded-xl font-mono text-text-pure"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="elevated">Elevated</option>
                  <option value="advisory">Advisory</option>
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

            {/* Curated Advisories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAdvisories.map((adv) => (
                <Card
                  key={adv.id}
                  className="p-5 border-border bg-surface hover:bg-surface-elevated hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Pill tone={severityTone(adv.severity)}>
                        {adv.severity.toUpperCase()}
                      </Pill>
                      <span className="text-[11px] font-semibold text-text-ash">
                        {adv.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-text-pure">
                      {adv.title}
                    </h4>

                    <p className="text-xs text-text-fog leading-relaxed line-clamp-3">
                      {adv.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-text-ash font-mono">
                      {adv.date}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedAdvisory(adv)}
                      className="text-xs h-7 px-2.5"
                    >
                      Inspect Dossier
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. INDIA-SPECIFIC STATUTORY CYBER DEFENSE RESOURCES ── */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <i className="ti ti-shield-check text-primary text-xl" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-text-pure">
              Official Indian Cyber Security Authorities &amp; CERT-In Advisories
            </h3>
          </div>
          <p className="text-xs text-text-fog mt-1">
            Authoritative national response agencies and statutory frameworks under the Ministry of Electronics &amp; Information Technology (MeitY) and Ministry of Home Affairs (MHA).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {INDIA_SECURITY_CENTERS.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target={item.url.startsWith("tel:") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated hover:border-primary/40 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-text-pure group-hover:text-primary transition-colors">
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-text-fog leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="text-[11px] font-semibold text-primary flex items-center gap-1 pt-1">
                <span>{item.url.startsWith("tel:") ? "Emergency Helpline" : "Open Official Portal"}</span>
                <i className="ti ti-arrow-right text-xs" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* ── 6. CISA KEV DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedKev && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-primary font-bold">{selectedKev.cveID}</span>
                  <h4 className="font-bold text-base text-text-pure mt-0.5">
                    {selectedKev.vendorProject} - {selectedKev.product}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedKev(null)}
                  className="text-text-fog hover:text-text-pure p-1 rounded-lg"
                  aria-label="Close modal"
                >
                  <i className="ti ti-x text-lg" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-text-fog">
                <div>
                  <span className="font-bold uppercase tracking-wider text-text-ash block mb-1">Vulnerability Summary</span>
                  <p className="text-text-pure leading-relaxed bg-surface-elevated p-3.5 rounded-xl border border-border">
                    {selectedKev.shortDescription}
                  </p>
                </div>

                <div>
                  <span className="font-bold uppercase tracking-wider text-danger block mb-1">Mandatory Required Action</span>
                  <p className="text-danger leading-relaxed bg-danger/10 p-3.5 rounded-xl border border-danger/30">
                    {selectedKev.requiredAction}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border">
                    <span className="text-text-dim block uppercase font-bold text-[10px]">Catalog Date Added</span>
                    <span className="text-text-pure font-mono">{selectedKev.dateAdded} ({formatRelativeTime(selectedKev.dateAdded)})</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-elevated border border-border">
                    <span className="text-text-dim block uppercase font-bold text-[10px]">Remediation Due Date</span>
                    <span className="text-text-pure font-mono">{selectedKev.dueDate} ({formatRelativeTime(selectedKev.dueDate)})</span>
                  </div>
                </div>

                {selectedKev.notes && (
                  <div>
                    <span className="font-bold uppercase tracking-wider text-text-ash block mb-1">CISA Directive &amp; Vendor Advisory References</span>
                    <p className="font-mono text-[11px] text-text-dim break-all bg-surface-elevated p-3 rounded-xl border border-border">
                      {selectedKev.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-between">
                <a
                  href={`https://nvd.nist.gov/vuln/detail/${selectedKev.cveID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline"
                >
                  View Full NIST NVD Entry &rarr;
                </a>
                <Button variant="secondary" size="sm" onClick={() => setSelectedKev(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 7. ADVISORY DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedAdvisory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-text-ash">{selectedAdvisory.category}</span>
                  <h4 className="font-bold text-base text-text-pure mt-0.5">{selectedAdvisory.title}</h4>
                </div>
                <button
                  onClick={() => setSelectedAdvisory(null)}
                  className="text-text-fog hover:text-text-pure p-1 rounded-lg"
                  aria-label="Close advisory"
                >
                  <i className="ti ti-x text-lg" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs text-text-fog">
                <div>
                  <span className="font-bold uppercase tracking-wider text-text-ash block mb-1">Threat Overview</span>
                  <p className="text-text-pure leading-relaxed bg-surface-elevated p-3.5 rounded-xl border border-border">
                    {selectedAdvisory.summary}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold uppercase tracking-wider text-text-ash">Indicators of Compromise</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyIocs(selectedAdvisory)}
                      className="text-xs h-6 px-2 text-primary"
                    >
                      {copiedIoc === selectedAdvisory.id ? "Copied!" : "Copy All IOCs"}
                    </Button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-border space-y-2 font-mono text-[11px]">
                    <div>
                      <span className="text-text-dim block text-[10px] uppercase font-bold">Domains:</span>
                      <p className="text-danger break-all">{selectedAdvisory.iocs.domains.join(", ") || "None listed"}</p>
                    </div>
                    <div>
                      <span className="text-text-dim block text-[10px] uppercase font-bold">IP Addresses:</span>
                      <p className="text-warn break-all">{selectedAdvisory.iocs.ips.join(", ") || "None listed"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-bold uppercase tracking-wider text-emerald-400 block mb-1">Recommended Containment</span>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    {selectedAdvisory.mitigation}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-between">
                {selectedAdvisory.simulationUrl ? (
                  <Button
                    to={selectedAdvisory.simulationUrl}
                    variant="primary"
                    size="sm"
                    className="text-xs"
                  >
                    {selectedAdvisory.simulationLabel || "Launch Simulation"}
                  </Button>
                ) : (
                  <div />
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedAdvisory(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThreatIntelligencePage;
