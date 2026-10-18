import { useState, useEffect, useMemo } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useToast } from "@/context/ToastContext";

import {
  ADVISORIES,
  type ThreatAdvisory,
  type ThreatSeverity,
  type ThreatCategory,
  type MitreMapping,
  type LiveAttackEvent,
} from "@/data/threats";

export {
  ADVISORIES,
  type ThreatAdvisory,
  type ThreatSeverity,
  type ThreatCategory,
  type MitreMapping,
  type LiveAttackEvent,
};

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
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "severity">("recent");
  const [selectedAdvisory, setSelectedAdvisory] = useState<ThreatAdvisory | null>(null);
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);
  const [liveStreamPaused, setLiveStreamPaused] = useState(false);
  const [feedDensity, setFeedDensity] = useState<"standard" | "compact">("standard");
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);

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
      toast({
        title: "IOCs Copied",
        description: `Exported indicators of compromise for ${adv.id}.`,
        variant: "info",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Clipboard access was denied by your browser.",
        variant: "error",
      });
    }
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
                Live Scam &amp; Threat Radar
              </p>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-1">
              Recent Scams &amp; Threat Alerts
            </h1>
            <p className="mt-1 text-sm text-text-fog">
              Track active online scams, new fake email tricks, and trending cyber warnings from around the web.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-2 flex items-center gap-3">
              <i className="ti ti-shield-bolt text-2xl text-danger animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-text-ash block">
                  Current Threat Level
                </span>
                <span className="font-display text-sm sm:text-base font-bold text-danger">
                  HIGH ALERT
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface px-4 py-2 flex items-center gap-3">
              <i className="ti ti-radar text-2xl text-primary" />
              <div>
                <span className="text-xs font-semibold text-text-ash block">
                  Trending Scams
                </span>
                <span className="font-display text-sm sm:text-base font-bold text-text-pure">
                  {ADVISORIES.length} Active Bulletins
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
            <span className="font-display text-base font-bold text-text-pure">
              Global Threat Map (Live Simulation)
            </span>
            <span className="hidden sm:inline text-xs text-text-ash">
              (Live visual demo of simulated attack traffic)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiveStreamPaused((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                liveStreamPaused
                  ? "border-warn bg-warn/10 text-warn"
                  : "border-border bg-surface text-text-ash hover:text-text-pure"
              }`}
            >
              <i className={`ti ${liveStreamPaused ? "ti-player-play" : "ti-player-pause"} text-xs`} />
              <span>{liveStreamPaused ? "Resume Feed" : "Pause Feed"}</span>
            </button>
            <div className="text-xs font-semibold text-text-ash px-2.5 py-1 rounded-lg bg-surface border border-border">
              {attacks.length} Live Signals
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
            <div className="absolute bottom-3 left-4 text-xs font-semibold text-text-ash flex items-center gap-4 bg-black/60 px-3 py-1.5 rounded-lg border border-border/40 backdrop-blur-md">
              <span className="text-emerald-400 font-semibold">● LIVE GLOBAL SIMULATION</span>
              <span className="hidden sm:inline text-text-fog">Showing simulated real-time attack attempts</span>
            </div>
          </div>

          {/* Right: Real-time Telemetry Stream Ticker */}
          <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col justify-between max-h-[380px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <span className="text-sm font-bold text-text-pure flex items-center gap-1.5">
                  <i className="ti ti-terminal text-primary" /> Live Attack Log
                </span>
                <span className="text-xs font-semibold text-emerald-400">REALTIME</span>
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
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-text-ash">[{atk.time}]</span>
                        <span
                          className={`font-semibold uppercase px-2 py-0.5 rounded text-[10px] ${
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
                      <div className="font-semibold text-text-pure truncate text-xs sm:text-sm">
                        {atk.attackType}
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-fog">
                        <span>{atk.sourceCity} &rarr; {atk.targetCity}</span>
                        <span className="text-text-ash font-medium">{atk.targetSector}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-3 border-t border-border mt-3 text-xs text-text-ash flex items-center justify-between">
              <span>Updated: Just now</span>
              <span className="text-primary font-semibold">Active Sync</span>
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
              placeholder="Search scams and security alerts (e.g., 'teams', 'sms', 'apk', 'ransomware')..."
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

          {/* Severity, Sort & Density Controls */}
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Density toggle: Cards vs List */}
            <div className="flex items-center rounded-xl bg-surface border border-border p-0.5">
              <button
                type="button"
                onClick={() => setFeedDensity("standard")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  feedDensity === "standard"
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-text-ash hover:text-text-pure"
                }`}
                title="Cards View"
              >
                <i className="ti ti-layout-grid text-xs" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedDensity("compact")}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all ${
                  feedDensity === "compact"
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-text-ash hover:text-text-pure"
                }`}
                title="List View"
              >
                <i className="ti ti-list text-xs" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
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
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-ash font-mono px-1">
          <span>Showing {filteredAdvisories.length} verified security warnings</span>
          <span className="hidden sm:inline">Continuously tracked from trusted cyber advisories</span>
        </div>

        {filteredAdvisories.length === 0 ? (
          <Card className="p-10 text-center space-y-3">
            <i className="ti ti-radar-off text-3xl text-text-ash" />
            <h3 className="font-display text-base font-bold text-text-pure">
              No Warnings Match Your Filter
            </h3>
            <p className="text-xs text-text-fog max-w-sm mx-auto">
              Try clearing your search query or selecting &apos;All Advisories&apos; to view all warnings.
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
        ) : feedDensity === "compact" ? (
          /* Sleek Compact List View */
          <div className="space-y-2">
            {filteredAdvisories.map((adv, i) => (
              <motion.div
                key={adv.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                className="group p-3 sm:p-4 rounded-2xl border border-border bg-surface hover:bg-surface-elevated hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={severityTone(adv.severity)} size="sm">
                      {adv.severity.toUpperCase()}
                    </Pill>
                    <span className="text-[11px] font-semibold text-text-ash px-2 py-0.5 rounded-full bg-surface-elevated border border-border">
                      {adv.category}
                    </span>
                    {adv.cve && (
                      <span className="text-[11px] font-mono text-primary font-bold px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {adv.cve}
                      </span>
                    )}
                    <span className="text-[11px] text-text-ash font-mono ml-auto sm:ml-0">
                      {adv.date}
                    </span>
                  </div>
                  <h4 
                    onClick={() => setSelectedAdvisory(adv)}
                    className="font-display text-sm font-bold text-text-pure hover:text-primary transition-colors cursor-pointer truncate"
                  >
                    {adv.title}
                  </h4>
                  <p className="text-xs text-text-fog line-clamp-1">
                    {adv.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<i className="ti ti-eye" />}
                    onClick={() => setSelectedAdvisory(adv)}
                    className="text-xs px-2.5 py-1.5 h-8"
                  >
                    Details
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleCopyIocs(adv)}
                    className="h-8 w-8 rounded-xl border border-border bg-surface flex items-center justify-center text-text-ash hover:text-text-pure hover:bg-surface-elevated transition-colors text-xs"
                    title="Copy details"
                  >
                    <i className={`ti ${copiedIoc === adv.id ? "ti-check text-emerald-400" : "ti-copy"}`} />
                  </button>
                  {adv.simulationUrl && (
                    <Link to={adv.simulationUrl}>
                      <button
                        type="button"
                        className="h-8 px-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold flex items-center gap-1"
                        title={adv.simulationLabel || "Simulate"}
                      >
                        <i className="ti ti-player-play text-xs" />
                        <span className="hidden md:inline">Simulate</span>
                      </button>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Standard Card View with Collapsible Breakdown */
          <div className="space-y-4">
            {filteredAdvisories.map((adv, i) => {
              const isExpanded = expandedAdvisoryId === adv.id;
              return (
                <motion.div
                  key={adv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <Card className="p-5 sm:p-6 hover:border-primary/40 transition-all">
                    {/* Top Badge Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={severityTone(adv.severity)} size="sm">
                          {adv.severity.toUpperCase()}
                        </Pill>
                        <span className="text-xs font-semibold text-text-ash px-2.5 py-0.5 rounded-full bg-surface border border-border">
                          {adv.category}
                        </span>
                        {adv.cve && (
                          <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                            {adv.cve}
                          </span>
                        )}
                        <span className="text-xs text-text-ash font-medium">
                          Origin: <strong className="text-text-pure">{adv.originRegion}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-text-ash font-medium font-mono">
                        <span>ALERT #{adv.id.replace("ADV-2025-", "").replace("ADV-2024-", "")}</span>
                        <span>·</span>
                        <span>{adv.date}</span>
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div className="mt-3.5">
                      <h3 className="font-display text-base sm:text-lg font-bold text-text-pure leading-snug">
                        {adv.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-text-fog">
                        {adv.summary}
                      </p>
                    </div>

                    {/* Target Sectors */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-text-ash mr-1">Most Targeted:</span>
                      {adv.targetSectors.map((sec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-surface text-[11px] font-medium text-text-pure border border-border"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>

                    {/* Collapsible Attack Vector & Mitigation Drawer */}
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setExpandedAdvisoryId(isExpanded ? null : adv.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors py-1"
                      >
                        <i className={`ti ${isExpanded ? "ti-chevron-up" : "ti-chevron-down"}`} />
                        <span>{isExpanded ? "Hide Attack Vector & Protection" : "Inspect Attack Vector & Protection"}</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 grid gap-3 sm:grid-cols-2 overflow-hidden"
                          >
                            <div className="rounded-2xl border border-danger/30 bg-danger/5 p-3.5 space-y-1">
                              <span className="text-xs uppercase tracking-wider text-danger font-bold flex items-center gap-1.5">
                                <i className="ti ti-target" /> How The Scam Works
                              </span>
                              <p className="text-xs sm:text-sm text-text-pure leading-relaxed">
                                {adv.attackVector}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1">
                              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                                <i className="ti ti-shield-check" /> How To Protect Yourself
                              </span>
                              <p className="text-xs sm:text-sm text-text-pure leading-relaxed">
                                {adv.mitigation}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer Actions: Deep-Dive Dossier, Copy IOCs, Sandbox Link */}
                    <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<i className="ti ti-eye" />}
                          onClick={() => setSelectedAdvisory(adv)}
                          className="text-xs font-semibold"
                        >
                          Full Dossier &amp; Safety Steps
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<i className={`ti ${copiedIoc === adv.id ? "ti-check text-emerald-400" : "ti-copy"}`} />}
                          onClick={() => handleCopyIocs(adv)}
                          className="text-xs"
                        >
                          {copiedIoc === adv.id ? "Copied!" : "Copy Details"}
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
                            {adv.simulationLabel || "Try Simulation"} &rarr;
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
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
              <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
                {/* Full Threat Brief */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-text-ash font-bold block">
                    1. Threat Overview
                  </span>
                  <p className="text-text-pure leading-relaxed text-sm bg-surface p-4 rounded-2xl border border-border">
                    {selectedAdvisory.summary}
                  </p>
                </div>

                {/* MITRE ATT&CK Matrix Mapping */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-text-ash font-bold block">
                    2. How Attackers Operate (Techniques)
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedAdvisory.mitre.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="text-xs text-primary uppercase font-bold block">
                            Stage: {m.tactic}
                          </span>
                          <strong className="text-sm text-text-pure mt-0.5 block">
                            {m.techniqueName}
                          </strong>
                        </div>
                        <span className="font-mono text-xs font-semibold text-text-pure px-2.5 py-0.5 rounded bg-surface border border-border">
                          {m.techniqueId}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicators of Compromise (IOCs) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-text-ash font-bold block">
                      3. Known Suspicious Links &amp; Addresses
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<i className={`ti ${copiedIoc === selectedAdvisory.id ? "ti-check text-emerald-400" : "ti-copy"}`} />}
                      onClick={() => handleCopyIocs(selectedAdvisory)}
                      className="text-xs py-1"
                    >
                      {copiedIoc === selectedAdvisory.id ? "Copied!" : "Copy Details"}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 font-mono text-xs">
                    <div>
                      <span className="text-text-ash block text-xs font-semibold uppercase mb-1">Scam Domains &amp; Websites:</span>
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
                      <span className="text-text-ash block text-xs font-semibold uppercase mb-1">Scammer Server IPs:</span>
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
                      <span className="text-text-ash block text-xs font-semibold uppercase mb-1">Dangerous File Hashes (SHA-256):</span>
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
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block">
                    4. How to Stay Safe
                  </span>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-text-pure space-y-2">
                    <p className="leading-relaxed">
                      {selectedAdvisory.mitigation}
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-text-fog text-sm">
                      <li>Block access to listed fake websites and suspicious IP addresses.</li>
                      <li>Scan your device for matching file downloads or suspicious background tasks.</li>
                      <li>Share this advisory with friends, family, or coworkers who might receive similar messages.</li>
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
                  Close Details
                </Button>

                {selectedAdvisory.simulationUrl && (
                  <Link to={selectedAdvisory.simulationUrl}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<i className="ti ti-player-play" />}
                      className="text-xs font-bold"
                    >
                      {selectedAdvisory.simulationLabel || "Try Interactive Simulation"}
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
              Stay Alert to New Online Threats
            </h3>
          </div>
          <p className="text-xs text-text-fog max-w-xl">
            Receive instant notifications whenever a widespread phishing scam or high-risk online security issue is detected in your region.
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
              Notification Settings
            </Button>
          </Link>
          <Link to="/report">
            <Button
              variant="secondary"
              size="sm"
              icon={<i className="ti ti-flag" />}
              className="text-xs"
            >
              Report a Scam
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
