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
      const db = JSON.parse(dbRaw);
      const currentUserId = profile?.id;

      // Extract only current user's profile and records
      const userData = {
        exported_at: new Date().toISOString(),
        profile: profile || null,
        activity_logs: Array.isArray(db.activity_logs)
          ? db.activity_logs.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
        quiz_attempts: Array.isArray(db.quiz_attempts)
          ? db.quiz_attempts.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
        assessment_results: Array.isArray(db.assessment_results)
          ? db.assessment_results.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
        simulation_results: Array.isArray(db.simulation_results)
          ? db.simulation_results.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
        user_badges: Array.isArray(db.user_badges)
          ? db.user_badges.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
        certificates: Array.isArray(db.certificates)
          ? db.certificates.filter((item: { user_id?: string }) => item.user_id === currentUserId)
          : [],
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cyberguard_user_data_${currentUserId || "operator"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "User Data Export Complete",
        description: "Your local training, scorecards, and incident logs were downloaded.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export user data.",
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
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Preferences</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
          Settings
        </h1>
        <p className="mt-1 text-sm text-text-fog">
          Manage your theme, account, notifications, and local data.
        </p>
      </motion.div>

      {/* Appearance: Theme Switcher */}
      <SettingSection
        title="Appearance &amp; Display"
        description="Choose light, dark, or automatic system theme."
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
      <SettingSection title="Account Information" description="Your login email and account level.">
        <SettingRow label="Account Email" description="Email used to sign in.">
          <span className="text-xs font-medium text-text-pure">{user?.email ?? "user@cyberguard.dev"}</span>
        </SettingRow>
        <SettingRow label="Role">
          <span className="rounded-full bg-surface-elevated border border-border px-2.5 py-0.5 text-xs font-semibold uppercase text-text-pure">
            {profile?.role ?? "Learner"}
          </span>
        </SettingRow>
        <SettingRow label="Account Level">
          <span className="rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-xs font-semibold text-success">
            Active • Level {profile?.level ?? 1}
          </span>
        </SettingRow>
        <div className="pt-3">
          <Link to="/profile">
            <Button variant="secondary" size="sm" icon={<i className="ti ti-user-edit" />}>
              Edit Profile &amp; Settings
            </Button>
          </Link>
        </div>
      </SettingSection>

      {/* Security Alerts */}
      <SettingSection title="Notifications &amp; Alerts" description="Choose what notifications you want to receive.">
        <SettingRow
          label="Simulation Reminders"
          description="Receive reminders to practice new scam simulations."
        >
          <input
            type="checkbox"
            checked={drillReminders}
            onChange={(e) => {
              setDrillReminders(e.target.checked);
              toast({ title: "Reminders preference updated", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          label="Scam Report Updates"
          description="Get notified when there are updates on your reported incident."
        >
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => {
              setEmailAlerts(e.target.checked);
              toast({ title: "Report updates preference saved", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
        <SettingRow
          label="Urgent Scam Alerts"
          description="Get alerted when widespread new online scams are detected in your area."
        >
          <input
            type="checkbox"
            checked={threatRadarAlerts}
            onChange={(e) => {
              setThreatRadarAlerts(e.target.checked);
              toast({ title: "Scam alerts preference saved", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
      </SettingSection>

      {/* Local Data & Storage */}
      <SettingSection title="Data &amp; Storage" description="Export your progress or reset your local data.">
        <SettingRow
          label="Onboarding Tour"
          description="Re-launch the interactive walkthrough guide of CyberGuard."
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<i className="ti ti-compass" />}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("cyberguard:start-onboarding"));
              toast({ title: "Launching Onboarding Tour", variant: "info" });
            }}
            className="text-xs"
          >
            Replay Tour
          </Button>
        </SettingRow>

        <SettingRow
          label="Export My Data"
          description="Download a copy of your completed lessons, badges, and quiz scores."
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<i className="ti ti-download" />}
            onClick={handleExportData}
            className="text-xs"
          >
            Download Data (JSON)
          </Button>
        </SettingRow>

        <SettingRow
          label="Reset Local Data"
          description="Reset your locally saved progress and restore defaults."
        >
          <Button
            variant="danger"
            size="sm"
            icon={<i className="ti ti-refresh" />}
            onClick={handleResetTelemetry}
            className="text-xs"
          >
            Reset Data
          </Button>
        </SettingRow>
      </SettingSection>

      {/* Keyboard Shortcuts */}
      <SettingSection title="Keyboard Shortcuts" description="Quick keyboard shortcuts for easy navigation.">
        <div className="space-y-2 pt-1">
          {SHORTCUTS.map((s) => (
            <div key={s.description} className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border last:border-0">
              <span className="text-text-fog">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded border border-border bg-surface-elevated px-2 py-0.5 font-medium text-xs text-text-pure shadow-xs">
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
