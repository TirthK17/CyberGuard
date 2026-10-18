import { useState, useEffect } from "react";
import { Card, Pill, ProgressBar, AnimatedNumber } from "@/components/ui/primitives";
import { useAuth } from "@/context/AuthContext";
import { recordActivity } from "@/lib/gamification";
import { XP } from "@/lib/constants";
import { useToast } from "@/context/ToastContext";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface HygieneCheck {
  id: string;
  category: "Login Safety" | "Passwords" | "Devices" | "Backups" | "Wi-Fi Safety" | "Privacy" | "Awareness";
  title: string;
  description: string;
  impact: string;
  points: number;
}

const HYGIENE_CHECKS: HygieneCheck[] = [
  {
    id: "mfa-email",
    category: "Login Safety",
    title: "Two-Step Verification on Main Email",
    description: "An authenticator app or security key protects your personal and work email accounts against password theft.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "pwd-manager",
    category: "Passwords",
    title: "Password Manager in Use",
    description: "All your logins are saved in a secure password manager with unique, long passwords for every website.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "os-updates",
    category: "Devices",
    title: "Automatic System Updates Turned On",
    description: "Your phone and computer install security patches automatically so known vulnerabilities get patched quickly.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "remote-wipe",
    category: "Devices",
    title: "Device Lock & Find My Enabled",
    description: "Your laptop and phone require a PIN or biometric lock, and you can remotely lock or erase them if lost.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "backup-321",
    category: "Backups",
    title: "Regular Backups of Critical Data (3-2-1 Rule)",
    description: "Your important files and photos are backed up to cloud storage or an external drive to protect against ransomware.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "vpn-public",
    category: "Wi-Fi Safety",
    title: "VPN on Public Wi-Fi Hotspots",
    description: "You use a VPN or mobile hotspot data whenever connecting to Wi-Fi at cafes, railway stations, or airports.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "privacy-social",
    category: "Privacy",
    title: "Private Social Media Profiles",
    description: "Personal details like your birthday, phone number, and location are restricted from strangers online.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
  {
    id: "phish-reporting",
    category: "Awareness",
    title: "Recognize & Report Scams to 1930 / Portal",
    description: "You identify phishing lures and report cyber fraud to the National Cybercrime Portal instead of complying.",
    impact: `+${XP.HYGIENE_ITEM} XP`,
    points: XP.HYGIENE_ITEM,
  },
];

const INDIA_RESOURCES = [
  {
    name: "National Cyber Crime Reporting Portal",
    url: "https://cybercrime.gov.in",
    description: "Official Government of India portal (I4C, MHA) for registering complaints on financial fraud, identity theft, and cyber harassment.",
    badge: "Official Portal",
    icon: "ti-building-estate",
  },
  {
    name: "Citizen Financial Cyber Fraud Helpline (1930)",
    url: "tel:1930",
    description: "Toll-free 24/7 emergency helpline to freeze fraudulent financial transactions immediately within the 'golden hour'.",
    badge: "24/7 Helpline",
    icon: "ti-phone-call",
  },
  {
    name: "CERT-In (Indian Computer Emergency Response Team)",
    url: "https://www.cert-in.org.in",
    description: "National nodal agency for incident response, publishing vulnerability notes, critical security advisories, and cyber rules.",
    badge: "Advisories & IOCs",
    icon: "ti-shield",
  },
  {
    name: "DoT Sanchar Saathi (Chakshu & CEIR)",
    url: "https://sancharsaathi.gov.in",
    description: "Department of Telecommunications initiative to report fraudulent communication and block lost or stolen mobile devices.",
    badge: "Telecom Safety",
    icon: "ti-device-mobile",
  },
];

export function CyberHygieneAuditTab() {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    try {
      const saved = localStorage.getItem(`hygiene_${profile.id}`);
      if (saved) {
        setCheckedIds(new Set(JSON.parse(saved)));
      }
    } catch {
      // Local storage disabled or error
    }
    setLoaded(true);
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id || !loaded) return;
    try {
      localStorage.setItem(`hygiene_${profile.id}`, JSON.stringify(Array.from(checkedIds)));
    } catch {
      // Local storage write error
    }
  }, [checkedIds, profile?.id, loaded]);

  const toggleCheck = async (check: HygieneCheck) => {
    const next = new Set(checkedIds);
    const wasChecked = next.has(check.id);
    if (wasChecked) {
      next.delete(check.id);
      setCheckedIds(next);
    } else {
      next.add(check.id);
      setCheckedIds(next);
      if (profile) {
        try {
          await recordActivity({
            userId: profile.id,
            action: "hygiene_check",
            points: XP.HYGIENE_ITEM,
            refId: check.id,
            awardOnce: true,
            meta: { audit_item: check.id, title: check.title },
          });
          toast({
            title: "Safety habit checked!",
            description: `+${XP.HYGIENE_ITEM} XP earned for good cyber hygiene.`,
            variant: "success",
          });
          await refreshProfile();
        } catch {
          toast({
            title: "Safety Habit Saved",
            description: "Saved locally.",
            variant: "info",
          });
        }
      }
    }
  };

  const total = HYGIENE_CHECKS.length;
  const passed = checkedIds.size;
  const pct = Math.round((passed / total) * 100);

  const radialData = [
    {
      name: "Hygiene",
      value: pct,
      fill: pct >= 80 ? "#10b981" : pct >= 50 ? "#3b82f6" : "#f43f5e",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview & Radial Gauge Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Everyday Cyber Hygiene &amp; Readiness Checklist
            </h3>
            <p className="text-xs text-text-fog leading-relaxed">
              Consistently practicing these 8 fundamental habits mitigates over 90% of opportunistic phishing attacks, credential stuffing, and ransomware infections.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Pill tone={pct >= 80 ? "success" : pct >= 50 ? "cyan" : "danger"}>
                {pct >= 80 ? "STRONG RESILIENCE" : pct >= 50 ? "MODERATE HYGIENE" : "ACTION REQUIRED"}
              </Pill>
              <span className="text-xs text-text-fog font-medium">
                {passed} of {total} habits verified ({pct}%)
              </span>
            </div>
          </div>

          {/* Recharts Radial Progress Gauge */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-surface border border-border">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="100%"
                  barSize={10}
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-text-pure">
                  <AnimatedNumber value={pct} suffix="%" />
                </span>
                <span className="text-[10px] uppercase font-bold text-text-dim">Score</span>
              </div>
            </div>
          </div>
        </div>

        <ProgressBar value={pct} />
      </Card>

      {/* Checklist Grid (Accessible Buttons) */}
      <div className="grid gap-4 sm:grid-cols-2" role="group" aria-label="Cyber hygiene checklist">
        {HYGIENE_CHECKS.map((item) => {
          const checked = checkedIds.has(item.id);
          return (
            <button
              type="button"
              key={item.id}
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggleCheck(item)}
              className={`rounded-2xl p-5 text-left transition-all duration-200 border cursor-pointer ${
                checked
                  ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm"
                  : "border-border bg-surface hover:border-primary/40 hover:bg-surface-elevated"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    checked
                      ? "border-emerald-500 bg-emerald-500 text-black font-bold"
                      : "border-border bg-surface-elevated text-transparent"
                  }`}
                >
                  <i className="ti ti-check text-xs font-bold" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-ash">
                      {item.category}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {item.impact}
                    </span>
                  </div>
                  <h4 className={`mt-1 font-display text-sm font-semibold ${checked ? "text-text-pure" : "text-text-fog"}`}>
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-text-ash">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* India-Specific Cyber Incident Reporting Resources */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <i className="ti ti-shield-check text-primary text-xl" aria-hidden="true" />
            <h4 className="font-display text-base font-bold text-text-pure">
              Official Indian Cyber Security &amp; Fraud Redressal Portals
            </h4>
          </div>
          <p className="mt-1 text-xs text-text-fog">
            Verified emergency numbers and statutory response organizations for reporting online financial extortion, SIM abuse, and cyber attacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {INDIA_RESOURCES.map((res) => (
            <a
              key={res.name}
              href={res.url}
              target={res.url.startsWith("tel:") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className="p-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated hover:border-primary/40 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-text-pure group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <i className={`ti ${res.icon} text-primary`} aria-hidden="true" />
                    {res.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {res.badge}
                  </span>
                </div>
                <p className="text-xs text-text-fog leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="text-[11px] font-semibold text-primary flex items-center gap-1 pt-1">
                <span>{res.url.startsWith("tel:") ? "Dial Immediately" : "Visit Official Portal"}</span>
                <i className="ti ti-arrow-right text-xs" aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
