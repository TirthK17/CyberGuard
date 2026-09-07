import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface ShortcutRow {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { keys: ["⌘", "K"],   description: "Open Spotlight command palette" },
  { keys: ["Esc"],       description: "Dismiss active modal or palette" },
  { keys: ["↑", "↓"],   description: "Navigate list items or search results" },
  { keys: ["↵"],         description: "Confirm or launch selected item" },
];

function SettingSection({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="font-display text-sm font-semibold text-text-pure">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-text-fog">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-text-pure">{label}</p>
        {description && <p className="text-xs text-text-ash mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("settings_email_alerts");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [drillReminders, setDrillReminders] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("settings_drill_reminders");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [threatRadarAlerts, setThreatRadarAlerts] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("settings_threat_radar_alerts");
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("settings_email_alerts", JSON.stringify(emailAlerts));
    } catch {}
  }, [emailAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem("settings_drill_reminders", JSON.stringify(drillReminders));
    } catch {}
  }, [drillReminders]);

  useEffect(() => {
    try {
      localStorage.setItem("settings_threat_radar_alerts", JSON.stringify(threatRadarAlerts));
    } catch {}
  }, [threatRadarAlerts]);

  const handleExportData = () => {
    try {
      const dbRaw = localStorage.getItem("cyberguard_local_db_v4") || "{}";
      const blob = new Blob([dbRaw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cyberguard_defense_telemetry_${profile?.id || "operator"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Telemetry Export Complete",
        description: "Your local training, scorecards, and incident logs were downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export local storage telemetry.",
        variant: "error",
      });
    }
  };

  const handleResetTelemetry = () => {
    if (window.confirm("Are you sure you want to reset your local training progress and re-seed defaults? This cannot be undone.")) {
      try {
        localStorage.removeItem("cyberguard_local_db_v4");
        toast({
          title: "System Cache Cleared",
          description: "Reloading clean telemetry...",
          variant: "info",
        });
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch {}
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="pb-2 border-b border-border"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">System Preferences</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
          Settings
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Customize your appearance, security credentials, notification triggers, and offline telemetry.
        </p>
      </motion.div>

      {/* Appearance: macOS Theme Switcher */}
      <SettingSection
        title="Appearance &amp; Display"
        description="Select your preferred color mode for the CyberGuard console."
      >
        <div className="grid gap-3 sm:grid-cols-3 pt-2">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              theme === "light"
                ? "border-primary bg-primary-subtle ring-2 ring-primary/20"
                : "border-border bg-surface hover:bg-surface-elevated"
            }`}
          >
            <div className="w-full h-16 rounded-lg border border-black/10 bg-[#fbfbfd] p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f56]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-neutral-300" />
                <div className="h-1.5 w-1/2 rounded bg-[#0071e3]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-text-pure">Light</span>
              {theme === "light" && <i className="ti ti-check text-xs text-primary" />}
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              theme === "dark"
                ? "border-primary bg-primary-subtle ring-2 ring-primary/20"
                : "border-border bg-surface hover:bg-surface-elevated"
            }`}
          >
            <div className="w-full h-16 rounded-lg border border-white/10 bg-[#09090b] p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f56]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-neutral-700" />
                <div className="h-1.5 w-1/2 rounded bg-[#0071e3]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-text-pure">Dark</span>
              {theme === "dark" && <i className="ti ti-check text-xs text-primary" />}
            </div>
          </button>

          {/* Auto / System Theme Card */}
          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex flex-col items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              theme === "system"
                ? "border-primary bg-primary-subtle ring-2 ring-primary/20"
                : "border-border bg-surface hover:bg-surface-elevated"
            }`}
          >
            <div className="w-full h-16 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-gradient-to-r from-[#fbfbfd] to-[#09090b] p-2 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f56]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-3/4 rounded bg-neutral-400" />
                <div className="h-1.5 w-1/2 rounded bg-[#0071e3]" />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-text-pure">Auto (System)</span>
              {theme === "system" && <i className="ti ti-check text-xs text-primary" />}
            </div>
          </button>
        </div>
      </SettingSection>

      {/* Account Info */}
      <SettingSection title="Account &amp; Security Clearance" description="Your authenticated identity and access privileges.">
        <SettingRow label="Account Email" description="Connected authentication identity.">
          <span className="text-xs font-medium text-text-pure">{user?.email ?? "operator@cyberguard.dev"}</span>
        </SettingRow>
        <SettingRow label="Platform Role">
          <span className="rounded-full bg-surface-elevated border border-border px-2.5 py-0.5 text-xs font-semibold uppercase text-text-pure">
            {profile?.role ?? "Operator"}
          </span>
        </SettingRow>
        <SettingRow label="Security Clearance">
          <span className="rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-xs font-semibold text-success">
            Active • Tier {profile?.level ?? 1}
          </span>
        </SettingRow>
        <div className="pt-3">
          <Link to="/profile">
            <Button variant="secondary" size="sm" icon={<i className="ti ti-user-edit" />}>
              Edit Profile &amp; Cryptographic Credentials
            </Button>
          </Link>
        </div>
      </SettingSection>

      {/* Security Alerts */}
      <SettingSection title="Notifications &amp; Threat Feeds" description="Configure real-time drill reminders and threat alerts.">
        <SettingRow
          label="Phishing Simulation Drills"
          description="Receive occasional test scenarios to maintain defensive muscle memory."
        >
          <input
            type="checkbox"
            checked={drillReminders}
            onChange={(e) => {
              setDrillReminders(e.target.checked);
              toast({ title: "Drill reminders updated", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          label="Incident Report Status Updates"
          description="Get notified when the SOC team logs containment directives for your incident."
        >
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => {
              setEmailAlerts(e.target.checked);
              toast({ title: "Incident updates updated", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          label="Live Threat Radar Alerts"
          description="Urgent notifications when active zero-day campaigns are detected globally."
        >
          <input
            type="checkbox"
            checked={threatRadarAlerts}
            onChange={(e) => {
              setThreatRadarAlerts(e.target.checked);
              toast({ title: "Threat radar alerts updated", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
      </SettingSection>

      {/* Local Telemetry & Diagnostics */}
      <SettingSection title="Local Data &amp; Telemetry Station" description="Manage offline data state, backups, and cache sync.">
        <SettingRow
          label="Export Defense Telemetry"
          description="Download a verified JSON backup of completed modules, badges, and scorecards."
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<i className="ti ti-download" />}
            onClick={handleExportData}
            className="text-xs"
          >
            Export JSON
          </Button>
        </SettingRow>

        <SettingRow
          label="Reset Local Database"
          description="Clear local storage cache and re-seed pre-populated curriculum dataset."
        >
          <Button
            variant="danger"
            size="sm"
            icon={<i className="ti ti-refresh" />}
            onClick={handleResetTelemetry}
            className="text-xs"
          >
            Reset Telemetry
          </Button>
        </SettingRow>
      </SettingSection>

      {/* Keyboard Shortcuts */}
      <SettingSection title="Keyboard Shortcuts" description="Boost efficiency across the console with macOS shortcuts.">
        <div className="space-y-2 pt-1">
          {SHORTCUTS.map((s) => (
            <div key={s.description} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
              <span className="text-text-fog">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-pure">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  );
}
