import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useSfx } from "@/lib/sfx";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    hackerMode,
    toggleHackerMode,
  } = useTheme();
  const { isMuted, toggleMute, playSfx } = useSfx();
  const { reducedMotion, setReducedMotion, isMotionReduced } = useAccessibility();
  const toast = useToast();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    setShowResetConfirm(true);
  };

  const handlePerformReset = () => {
    setShowResetConfirm(false);
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
    } catch {
      toast({
        title: "Reset Failed",
        description: "Could not reset local database.",
        variant: "error",
      });
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

        {/* Accent Color Palette */}
        <div className="mt-5 pt-4 border-t border-border flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-text-pure">Signature Accent</p>
            <p className="text-[11px] text-text-fog">
              Personalize primary buttons, badge highlights, and security metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            {[
              { id: "blue", label: "Precision Blue", color: "#0071e3" },
              { id: "emerald", label: "Emerald Terminal", color: "#10b981" },
              { id: "violet", label: "Void Violet", color: "#8b5cf6" },
              { id: "amber", label: "Cyberpunk Amber", color: "#f59e0b" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAccent(item.id as "blue" | "emerald" | "violet" | "amber");
                  playSfx("click");
                  toast({ title: `Accent set to ${item.label}`, variant: "info" });
                }}
                title={item.label}
                aria-label={item.label}
                className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  accent === item.id
                    ? "ring-2 ring-primary ring-offset-2 scale-110 border-white/60"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: item.color }}
              >
                {accent === item.id && <i className="ti ti-check text-white text-xs font-bold" />}
              </button>
            ))}
          </div>
        </div>

        {/* Hacker Terminal Mode */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-pure">Hacker Terminal Mode</p>
            <p className="text-[11px] text-text-fog">
              Monospace typography, green phosphor CRT aesthetic, and scanline overlay.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleHackerMode();
              playSfx("alert");
              toast({
                title: !hackerMode ? "Hacker Terminal Mode Activated" : "Hacker Terminal Mode Deactivated",
                variant: "info",
              });
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              hackerMode
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/50"
                : "bg-surface-elevated text-text-fog border-border hover:text-text-pure"
            }`}
          >
            {hackerMode ? "Terminal Mode: ACTIVE" : "Terminal Mode: OFF"}
          </button>
        </div>
      </SettingSection>

      {/* Sound & Audio Effects */}
      <SettingSection
        title="Sound &amp; Audio Effects"
        description="Synthesized client-side audio via Web Audio API. Zero external audio assets."
      >
        <SettingRow
          label="Interface Sound Effects"
          description="Tactile audio feedback for clicks, simulation terminal events, and success chimes."
        >
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <Button
                size="xs"
                variant="ghost"
                onClick={() => playSfx("click")}
                title="Preview Click Sound"
              >
                Click
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => playSfx("success")}
                title="Preview Success Chime"
              >
                Chime
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => playSfx("alert")}
                title="Preview Alert"
              >
                Alert
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                toggleMute();
                toast({
                  title: isMuted ? "Sound Effects Enabled" : "Sound Effects Muted",
                  variant: "info",
                });
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                !isMuted
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-border bg-surface-elevated text-text-fog hover:text-text-pure"
              }`}
            >
              <i className={`ti ${isMuted ? "ti-volume-off" : "ti-volume"} text-sm`} />
              <span>{isMuted ? "Muted" : "Enabled"}</span>
            </button>
          </div>
        </SettingRow>
      </SettingSection>

      {/* Accessibility & Motion */}
      <SettingSection
        title="Accessibility &amp; Motion"
        description="Configure animation preferences and accessibility settings to reduce discomfort."
      >
        <SettingRow
          label="Reduced Motion Mode"
          description="Limits background animations, pulsing orbs, radar sweeps, and floating transitions across all pages."
        >
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
            <button
              type="button"
              onClick={() => {
                setReducedMotion("auto");
                toast({ title: "Motion set to System Default", variant: "info" });
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                reducedMotion === "auto"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              Auto (OS)
            </button>
            <button
              type="button"
              onClick={() => {
                setReducedMotion("reduce");
                toast({ title: "Reduced Motion Enabled", variant: "info" });
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                reducedMotion === "reduce"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              Reduce
            </button>
            <button
              type="button"
              onClick={() => {
                setReducedMotion("no-preference");
                toast({ title: "Standard Motion Enabled", variant: "info" });
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                reducedMotion === "no-preference"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-fog hover:text-text-pure"
              }`}
            >
              Normal
            </button>
          </div>
        </SettingRow>

        <SettingRow
          label="Current Motion Status"
          description={
            isMotionReduced
              ? "All fluid animations, particle sweeps, and decorative transitions are currently suppressed."
              : "Standard fluid spring animations and transitions are active."
          }
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isMotionReduced
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                : "bg-success/10 text-success border border-success/20"
            }`}
          >
            <i className={`ti ${isMotionReduced ? "ti-player-pause" : "ti-player-play"} text-xs`} />
            {isMotionReduced ? "Reduced Motion Active" : "Full Motion Active"}
          </span>
        </SettingRow>
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
          <Button to="/profile" variant="secondary" size="sm" icon={<i className="ti ti-user-edit" />}>
            Edit Profile &amp; Settings
          </Button>
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
          description="Press and hold to reset your locally saved progress and restore defaults."
        >
          <Button
            variant="danger"
            size="sm"
            holdToConfirm
            holdDurationMs={1200}
            icon={<i className="ti ti-refresh" />}
            onHoldComplete={handleResetTelemetry}
            className="text-xs"
          >
            Hold to Reset
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

      {/* Confirm Reset Telemetry Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Local Telemetry &amp; Training"
        message="Are you sure you want to reset your local training progress and re-seed defaults? All locally stored badges, quiz attempts, and scores will be restored to demo defaults. This cannot be undone."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Progress"
        confirmTone="danger"
        onConfirm={handlePerformReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
