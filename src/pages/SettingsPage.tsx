import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useSfx } from "@/lib/sfx";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Compass,
  Download,
  RotateCcw,
  Palette,
  Bell,
  Sliders,
  Database,
  Check,
} from "lucide-react";

function SettingCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-text-pure">{title}</h2>
          {description && <p className="text-xs text-text-fog mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div>
        <p className="text-xs sm:text-sm font-medium text-text-pure">{label}</p>
        {description && <p className="text-xs text-text-ash mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    hackerMode,
    toggleHackerMode,
  } = useTheme();
  const { isMuted, toggleMute, playSfx } = useSfx();
  const { reducedMotion, setReducedMotion } = useAccessibility();
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
        title: "Data Export Complete",
        description: "Your local training records were downloaded.",
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
        description: "Reloading defaults...",
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
        transition={{ duration: 0.25 }}
        className="pb-3 border-b border-border"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Preferences</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
          {t("nav.settings", "Settings")}
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Customize workspace appearance, audio feedback, alerts, and local data.
        </p>
      </motion.div>

      {/* 1. Appearance & Language */}
      <SettingCard icon={Palette} title="Appearance &amp; Language" description="Theme mode, accent colors, and display language">
        <SettingRow label="Language" description="Select interface language">
          <LanguageSwitcher variant="segmented" />
        </SettingRow>

        <SettingRow label="Theme" description="Switch between light, dark, and system default">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "Auto", icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const active = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as "light" | "dark" | "system")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-fog hover:text-text-pure hover:bg-surface"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </SettingRow>

        <SettingRow label="Accent Color" description="Highlights, buttons, and progress meters">
          <div className="flex items-center gap-2">
            {[
              { id: "blue", label: "Blue", color: "#0071e3" },
              { id: "emerald", label: "Emerald", color: "#10b981" },
              { id: "violet", label: "Violet", color: "#8b5cf6" },
              { id: "amber", label: "Amber", color: "#f59e0b" },
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
                className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  accent === item.id
                    ? "ring-2 ring-primary ring-offset-2 scale-110 border-white/60"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: item.color }}
              >
                {accent === item.id && <Check className="h-3 w-3 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Terminal Mode" description="Monospace aesthetic and scanline overlay">
          <button
            type="button"
            onClick={() => {
              toggleHackerMode();
              playSfx("alert");
              toast({
                title: !hackerMode ? "Terminal Mode Activated" : "Terminal Mode Deactivated",
                variant: "info",
              });
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              hackerMode
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/50"
                : "bg-surface-elevated text-text-fog border-border hover:text-text-pure"
            }`}
          >
            {hackerMode ? "Active" : "Off"}
          </button>
        </SettingRow>
      </SettingCard>

      {/* 2. Audio & Accessibility */}
      <SettingCard icon={Sliders} title="Audio &amp; Accessibility" description="Sound feedback and animation controls">
        <SettingRow label="Interface Audio" description="Tactile sound effects for interactions">
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
            {!isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{!isMuted ? "Enabled" : "Muted"}</span>
          </button>
        </SettingRow>

        <SettingRow label="Reduced Motion" description="Suppress fluid sweeps and floating animations">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated border border-border">
            {[
              { id: "auto", label: "Auto" },
              { id: "reduce", label: "Reduce" },
              { id: "no-preference", label: "Normal" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setReducedMotion(opt.id as "auto" | "reduce" | "no-preference");
                  toast({ title: `Motion set to ${opt.label}`, variant: "info" });
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  reducedMotion === opt.id
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-fog hover:text-text-pure"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingCard>

      {/* 3. Notifications */}
      <SettingCard icon={Bell} title="Notifications &amp; Alerts" description="Practice reminders and scam advisory updates">
        <SettingRow label="Simulation Reminders" description="Periodic prompts to test defense sandboxes">
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

        <SettingRow label="Scam Report Updates" description="Status updates on submitted incident records">
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

        <SettingRow label="Critical Threat Advisories" description="Immediate alerts for high-severity vulnerabilities">
          <input
            type="checkbox"
            checked={threatRadarAlerts}
            onChange={(e) => {
              setThreatRadarAlerts(e.target.checked);
              toast({ title: "Threat alerts preference saved", variant: "info" });
            }}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        </SettingRow>
      </SettingCard>

      {/* 4. Data & Storage */}
      <SettingCard icon={Database} title="Data &amp; Maintenance" description="Manage local storage, walkthrough tour, and data exports">
        <SettingRow label="Onboarding Tour" description="Walkthrough of CyberGuard core features and tools">
          <Button
            variant="secondary"
            size="sm"
            icon={<Compass className="h-3.5 w-3.5" />}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("cyberguard:start-onboarding"));
              toast({ title: "Launching Onboarding Tour", variant: "info" });
            }}
            className="text-xs"
          >
            Replay Tour
          </Button>
        </SettingRow>

        <SettingRow label="Export My Data" description="Download a JSON copy of your progress and scores">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-3.5 w-3.5" />}
            onClick={handleExportData}
            className="text-xs"
          >
            Export JSON
          </Button>
        </SettingRow>

        <SettingRow label="Reset Local Data" description="Restore local state to default demo profile">
          <Button
            variant="danger"
            size="sm"
            holdToConfirm
            holdDurationMs={1200}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            onHoldComplete={handleResetTelemetry}
            className="text-xs"
          >
            Hold to Reset
          </Button>
        </SettingRow>
      </SettingCard>

      {/* Reset Confirmation Dialog */}
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
