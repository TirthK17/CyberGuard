import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Pill, AnimatedNumber } from "@/components/ui/primitives";
import { motion, AnimatePresence } from "framer-motion";

interface Stats {
  badgeCount: number;
  modulesCompleted: number;
  hasCertificate: boolean;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileError, setProfileError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const [{ count: badgeCount }, { data: progressRows }, { data: cert }] = await Promise.all([
        supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
        supabase.from("progress").select("is_completed").eq("user_id", profile.id).eq("is_completed", true),
        supabase.from("certificates").select("id").eq("user_id", profile.id).maybeSingle(),
      ]);
      if (!active) return;
      setStats({
        badgeCount: badgeCount ?? 0,
        modulesCompleted: progressRows?.length ?? 0,
        hasCertificate: !!cert || (profile.awareness_score ?? 0) >= 61,
      });
    })();
    return () => { active = false; };
  }, [profile?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setProfileError(null);
    setSaving(true);
    setSavedState("saving");
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    setSaving(false);
    if (error) {
      setProfileError(`Failed to save: ${error.message}`);
      setSavedState("error");
      return;
    }
    await refreshProfile();
    setSavedState("saved");
    setTimeout(() => setSavedState("idle"), 2500);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPasswordSaving(true);
    if (profile?.email) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (reauthError) {
        setPasswordSaving(false);
        setPasswordMsg({ type: "error", text: "Current password is incorrect." });
        return;
      }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMsg({ type: "success", text: "Password updated successfully." });
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : "—";

  const saveLabel =
    savedState === "saving" ? "Saving…" :
    savedState === "saved"  ? "Saved ✓" :
    savedState === "error"  ? "Failed" :
    "Save changes";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-frost-glow">Operator Credentials</p>
        <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Profile &amp; Security
        </h1>
        <p className="mt-1 text-xs text-text-fog">Manage personal identity, cryptographic credentials, and access keys.</p>
      </motion.div>

      {/* Overview */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-void-violet/40 bg-void-violet/20 font-mono text-xl font-bold text-frost-glow shadow-[0_0_20px_var(--color-void-violet-glow)]">
              {profile ? getInitials(profile.full_name) : "OP"}
            </div>
            {profile && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-canvas bg-void-violet font-mono text-[10px] font-bold text-text-pure shadow">
                {profile.level}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-bold text-text-pure">{profile?.full_name}</span>
              <Pill tone={profile?.role === "admin" ? "violet" : "default"}>{profile?.role}</Pill>
              <Pill tone={profile?.status === "active" ? "success" : "danger"}>{profile?.status}</Pill>
            </div>
            <p className="mt-1 font-mono text-xs text-frost-glow truncate">{profile?.email}</p>
            <p className="mt-0.5 font-mono text-[10px] text-text-ash">Operator registered {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "ti-coin",        label: "XP POINTS",  value: profile?.points ?? 0 },
            { icon: "ti-trending-up", label: "TIER LEVEL", value: profile?.level ?? 1 },
            { icon: "ti-gauge",       label: "DEFENSE %",  value: `${profile?.awareness_score ?? 0}%` },
            { icon: "ti-award",       label: "BADGES",     value: stats?.badgeCount ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-glass-edge bg-carbon p-3.5">
              <i className={`ti ${s.icon} text-sm text-frost-glow`} />
              <div className="mt-2 font-display text-lg font-bold text-text-pure">
                {typeof s.value === "number" ? <AnimatedNumber value={s.value} /> : s.value}
              </div>
              <div className="font-mono text-[10px] uppercase text-text-ash">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-glass-edge pt-4">
          <Link to="/badges">
            <Button variant="ghost" size="xs" icon={<i className="ti ti-award text-xs" />}>Badges</Button>
          </Link>
          <Link to="/progress">
            <Button variant="ghost" size="xs" icon={<i className="ti ti-trending-up text-xs" />}>Progress Telemetry</Button>
          </Link>
          {stats?.hasCertificate && (
            <Link to="/certificate">
              <Button variant="ghost" size="xs" icon={<i className="ti ti-certificate text-xs" />}>Certificate</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Edit profile */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-sm font-semibold text-text-pure">Operator Details</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon" htmlFor="full-name">
              Full Name
            </label>
            <input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon" htmlFor="email">
              Verified Email
            </label>
            <input
              id="email"
              disabled
              value={profile?.email ?? ""}
              className="input"
              aria-describedby="email-note"
            />
            <p id="email-note" className="mt-1.5 font-mono text-[10px] text-text-ash">
              Identity email is managed by your auth provider (Google OAuth / Supabase).
            </p>
          </div>
          <AnimatePresence>
            {profileError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xs text-danger"
              >
                {profileError}
              </motion.p>
            )}
          </AnimatePresence>
          <Button
            type="submit"
            loading={saving}
            disabled={saving || savedState === "saved"}
            variant={savedState === "saved" ? "secondary" : "primary"}
            size="sm"
          >
            {saveLabel}
          </Button>
        </form>
      </div>

      {/* Security */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-sm font-semibold text-text-pure">Update Password</h2>
        <p className="mt-0.5 text-xs text-text-fog">You'll need to confirm your existing password to rotate keys.</p>
        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon" htmlFor="cur-pass">
              Current Password
            </label>
            <input
              id="cur-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon" htmlFor="new-pass">
                New Password
              </label>
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon" htmlFor="conf-pass">
                Confirm Password
              </label>
              <input
                id="conf-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          </div>
          <AnimatePresence>
            {passwordMsg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`font-mono text-xs ${passwordMsg.type === "error" ? "text-danger" : "text-success"}`}
              >
                {passwordMsg.text}
              </motion.p>
            )}
          </AnimatePresence>
          <Button type="submit" variant="secondary" size="sm" loading={passwordSaving}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
