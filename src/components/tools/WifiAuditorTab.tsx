import { useState } from "react";
import { Card, Pill, ProgressBar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

type EncType = "open" | "wep" | "wpa2" | "wpa3" | "enterprise";
type LocationType = "home" | "cafe" | "airport" | "campus";

interface PresetScenario {
  name: string;
  enc: EncType;
  loc: LocationType;
  vpn: boolean;
  cert: boolean;
}

const PRESETS: PresetScenario[] = [
  {
    name: "Risky Public Cafe",
    enc: "open",
    loc: "cafe",
    vpn: false,
    cert: false,
  },
  {
    name: "Evil Twin Attack",
    enc: "open",
    loc: "airport",
    vpn: false,
    cert: true,
  },
  {
    name: "Fortified Home Setup",
    enc: "wpa3",
    loc: "home",
    vpn: true,
    cert: false,
  },
  {
    name: "Campus 802.1X Enterprise",
    enc: "enterprise",
    loc: "campus",
    vpn: false,
    cert: false,
  },
];

export function WifiAuditorTab() {
  const [encType, setEncType] = useState<EncType>("open");
  const [location, setLocation] = useState<LocationType>("cafe");
  const [hasVpn, setHasVpn] = useState(false);
  const [hasCertWarning, setHasCertWarning] = useState(false);

  // Compute Risk Metrics
  let riskScore = 0;
  const warnings: string[] = [];
  const safeSignals: string[] = [];

  if (encType === "open") {
    riskScore += 45;
    warnings.push("Open Unencrypted Wi-Fi: Wireless frames are transmitted in cleartext. Anyone with a packet sniffer can see unencrypted traffic and DNS lookups.");
  } else if (encType === "wep") {
    riskScore += 40;
    warnings.push("Deprecated WEP Protocol: Vulnerable to IV collision attacks (FMS/KoreK/PTW) and can be cracked in under 60 seconds.");
  } else if (encType === "wpa2") {
    riskScore += 10;
    safeSignals.push("WPA2-AES Encryption: Strong pairwise key negotiation, though susceptible to dictionary attacks on weak pre-shared keys (KRACK).");
  } else if (encType === "wpa3") {
    safeSignals.push("WPA3-SAE (Simultaneous Authentication of Equals): Modern dragonfly handshake protects against offline dictionary attacks and provides forward secrecy.");
  } else if (encType === "enterprise") {
    safeSignals.push("WPA2/WPA3-Enterprise (802.1X EAP): Individual credential authentication via RADIUS server eliminates shared passphrase risks.");
  }

  if (location === "cafe" || location === "airport") {
    riskScore += 25;
    warnings.push("Public High-Density Hotspot: High risk of Rogue APs / Evil Twins broadcasting cloned SSIDs to intercept traffic.");
  } else if (location === "campus") {
    riskScore += 10;
    warnings.push("Shared Institutional Network: Client isolation may not be enforced; peer devices on the same subnet could probe open ports.");
  } else {
    safeSignals.push("Private Home/Office Perimeter: Network physical access is controlled by you or your organization.");
  }

  if (hasCertWarning) {
    riskScore += 45;
    warnings.push("CRITICAL SSL/TLS Warning Triggered: Browser rejected server certificate. Highly probable Man-in-the-Middle (MITM) proxy actively intercepting HTTPS!");
  }

  if (hasVpn) {
    riskScore = Math.max(0, riskScore - 40);
    safeSignals.push("Active VPN Tunnel: Layer-3 IPsec/WireGuard/OpenVPN tunnel encapsulates all IP packets in authenticated cryptographic cipher.");
  } else if (location !== "home") {
    warnings.push("No Tunneling Protection: DNS queries, SNI hostnames, and unencrypted packets are visible to the hotspot operator.");
  }

  riskScore = Math.min(riskScore, 100);
  const isSafe = riskScore < 30;

  const applyPreset = (p: PresetScenario) => {
    setEncType(p.enc);
    setLocation(p.loc);
    setHasVpn(p.vpn);
    setHasCertWarning(p.cert);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Wi-Fi Threat &amp; Configuration Auditor
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Evaluate real-world transmission security risks across public, enterprise, and home Wi-Fi hotspots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Presets:</span>
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(p)}
                className="text-xs h-7 px-2"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Configuration Parameters */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <label className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
              1. Wi-Fi Security Standard
            </label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Wi-Fi security standard">
              {[
                { id: "open", label: "Open (No Password)" },
                { id: "wep",  label: "WEP (Legacy Broken)" },
                { id: "wpa2", label: "WPA2-AES (Standard)" },
                { id: "wpa3", label: "WPA3-SAE (Modern)" },
                { id: "enterprise", label: "WPA Enterprise (802.1X)" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  role="radio"
                  aria-checked={encType === item.id}
                  onClick={() => setEncType(item.id as EncType)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    encType === item.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-surface text-text-ash hover:text-text-pure"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <label className="text-xs font-semibold text-text-pure uppercase tracking-wider block">
              2. Connection Environment
            </label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Connection environment">
              {[
                { id: "home",    label: "Home / Private Office" },
                { id: "cafe",    label: "Coffee Shop Hotspot" },
                { id: "airport", label: "Airport / Hotel Public" },
                { id: "campus",  label: "College Campus / Dorm" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  role="radio"
                  aria-checked={location === item.id}
                  onClick={() => setLocation(item.id as LocationType)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    location === item.id
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-surface text-text-ash hover:text-text-pure"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defense Toggles (Keyboard accessible buttons) */}
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <button
            type="button"
            role="switch"
            aria-checked={hasVpn}
            onClick={() => setHasVpn(!hasVpn)}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
              hasVpn ? "border-emerald-500/40 bg-emerald-500/10 shadow-sm" : "border-border bg-surface-elevated hover:bg-surface"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`ti ti-shield-lock text-xl ${hasVpn ? "text-emerald-400" : "text-text-ash"}`} aria-hidden="true" />
              <div>
                <strong className="block text-text-pure">VPN Tunnel Protection</strong>
                <span className="text-xs text-text-fog">
                  {hasVpn ? "Active: Entire packet payload and DNS are encrypted" : "Off: Network owner can inspect unencrypted DNS & SNI"}
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${hasVpn ? "bg-emerald-500/20 text-emerald-400" : "bg-surface border border-border text-text-ash"}`}>
              {hasVpn ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={hasCertWarning}
            onClick={() => setHasCertWarning(!hasCertWarning)}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
              hasCertWarning ? "border-danger bg-danger/10 shadow-sm" : "border-border bg-surface-elevated hover:bg-surface"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`ti ti-alert-triangle text-xl ${hasCertWarning ? "text-danger" : "text-text-ash"}`} aria-hidden="true" />
              <div>
                <strong className="block text-text-pure">TLS / SSL Warning Alert</strong>
                <span className="text-xs text-text-fog">
                  {hasCertWarning ? "Browser warned about invalid or self-signed cert" : "No certificate warning displayed"}
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${hasCertWarning ? "bg-danger/20 text-danger" : "bg-surface border border-border text-text-ash"}`}>
              {hasCertWarning ? "WARNING" : "NONE"}
            </span>
          </button>
        </div>

        {/* Assessment Scorecard */}
        <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-fog">Overall Threat Exposure</p>
              <h4 className="font-display font-bold text-lg text-text-pure mt-0.5">
                {isSafe ? "Low Threat Environment" : riskScore > 65 ? "Severe Infiltration Risk" : "Elevated Hotspot Vulnerability"}
              </h4>
            </div>
            <Pill tone={isSafe ? "success" : riskScore > 65 ? "danger" : "warn"}>
              Risk Index: {riskScore} / 100
            </Pill>
          </div>

          <ProgressBar value={riskScore} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Positive Indicators */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <i className="ti ti-shield-check text-sm" aria-hidden="true" /> Protective Controls
              </h5>
              {safeSignals.length > 0 ? (
                <ul className="space-y-1.5">
                  {safeSignals.map((s, idx) => (
                    <li key={idx} className="text-xs text-text-fog flex items-start gap-2">
                      <i className="ti ti-check text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-dim italic">No strong security controls currently active.</p>
              )}
            </div>

            {/* Warnings */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                <i className="ti ti-alert-triangle text-sm" aria-hidden="true" /> Identified Vulnerabilities
              </h5>
              {warnings.length > 0 ? (
                <ul className="space-y-1.5">
                  {warnings.map((w, idx) => (
                    <li key={idx} className="text-xs text-text-fog flex items-start gap-2">
                      <i className="ti ti-x text-danger mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-400 italic">No overt network vulnerabilities detected.</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
