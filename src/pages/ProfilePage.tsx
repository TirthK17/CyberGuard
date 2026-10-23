import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { supabase } from "@/lib/supabase";
import { PASS_MARK } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Pill, AnimatedNumber } from "@/components/ui/primitives";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Coins,
  TrendingUp,
  ShieldCheck,
  Award,
  FileCheck,
  User,
} from "lucide-react";

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
  const toast = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileError, setProfileError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  // Password update & reset states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile?.full_name]);

  useEffect(() => {
    if (!profile) return;
    let active = true;
    (async () => {
      const [{ count: badgeCount }, { data: progressRows }, { data: certs }, { data: bestAssessment }] = await Promise.all([
        supabase.from("user_badges").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
        supabase.from("progress").select("is_completed").eq("user_id", profile.id).eq("is_completed", true),
        supabase.from("certificates").select("id").eq("user_id", profile.id).limit(1),
        supabase.from("assessment_results").select("score").eq("user_id", profile.id).order("score", { ascending: false }).limit(1),
      ]);
      if (!active) return;
      const best = bestAssessment?.[0]?.score ?? 0;
      setStats({
        badgeCount: badgeCount ?? 0,
        modulesCompleted: progressRows?.length ?? 0,
        hasCertificate: Boolean(certs?.length || best >= PASS_MARK),
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
    toast({ title: "Profile Updated", variant: "success" });
    setTimeout(() => setSavedState("idle"), 2500);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters long." });
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
    toast({ title: "Password Updated", variant: "success" });
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordMsg(null);
    }, 1500);
  };

  const handleForgotReset = async () => {
    if (!profile?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/settings`,
      });
      if (error) {
        toast({ title: "Reset Link Error", description: error.message, variant: "error" });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: `Instructions were sent to ${profile.email}. Check your inbox.`,
          variant: "success",
        });
      }
    } catch {
      toast({
        title: "Reset Email Sent",
        description: `Instructions have been dispatched to ${profile.email}.`,
        variant: "info",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short" })
    : "—";

  const saveLabel =
    savedState === "saving" ? "Saving…" :
    savedState === "saved"  ? "Saved ✓" :
    savedState === "error"  ? "Failed" :
    "Save Changes";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pb-3 border-b border-border"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Account Overview</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
          Profile &amp; Credentials
        </h1>
        <p className="mt-1 text-xs text-text-fog">Manage your personal information, scores, and security credentials.</p>
      </motion.div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 font-mono text-lg font-bold text-primary shadow-sm">
              {profile ? getInitials(profile.full_name) : "U"}
            </div>
            {profile && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-canvas bg-primary font-mono text-[9px] font-bold text-white shadow">
                {profile.level}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-bold text-text-pure">{profile?.full_name}</span>
              <Pill tone={profile?.role === "admin" ? "violet" : "default"} size="sm">{profile?.role}</Pill>
              <Pill tone={profile?.status === "active" ? "emerald" : "danger"} size="sm">{profile?.status}</Pill>
            </div>
            <p className="mt-0.5 font-mono text-xs text-text-fog truncate">{profile?.email}</p>
            <p className="mt-0.5 text-[11px] text-text-ash">Member since {memberSince}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
          {[
            { icon: Coins,        label: "XP Points",    value: profile?.points ?? 0 },
            { icon: TrendingUp,   label: "Level",        value: `Tier ${profile?.level ?? 1}` },
            { icon: ShieldCheck,  label: "Safety Score", value: `${profile?.awareness_score ?? 0}%` },
            { icon: Award,        label: "Badges",       value: stats?.badgeCount ?? 0 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-surface-elevated p-3 text-center sm:text-left">
                <Icon className="h-4 w-4 text-primary mx-auto sm:mx-0" />
                <div className="mt-1.5 font-display text-base font-bold text-text-pure">
                  {typeof s.value === "number" ? <AnimatedNumber value={s.value} /> : s.value}
                </div>
                <div className="text-[10px] uppercase font-mono text-text-ash mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <Button to="/badges" variant="secondary" size="xs" icon={<Award className="h-3 w-3" />}>
            Badges &amp; Ranks
          </Button>
          <Button to="/progress" variant="secondary" size="xs" icon={<TrendingUp className="h-3 w-3" />}>
            My Progress
          </Button>
          {stats?.hasCertificate && (
            <Button to="/certificate" variant="secondary" size="xs" icon={<FileCheck className="h-3 w-3" />}>
              Certificate
            </Button>
          )}
        </div>
      </div>

      {/* Edit Profile Details */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-pure">Personal Details</h2>
            <p className="text-xs text-text-fog mt-0.5">Your display name and account email</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-pure" htmlFor="full-name">
              Full Name
            </label>
            <input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input text-xs"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-pure" htmlFor="email">
              Verified Email
            </label>
            <input
              id="email"
              disabled
              value={profile?.email ?? ""}
              className="input text-xs opacity-75 cursor-not-allowed"
              aria-describedby="email-note"
            />
            <p id="email-note" className="mt-1 text-[11px] text-text-ash">
              Connected directly to your authentication identity.
            </p>
          </div>

          <AnimatePresence>
            {profileError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-danger"
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
            className="text-xs"
          >
            {saveLabel}
          </Button>
        </form>
      </div>

      {/* Password & Security Card: Minimal, professional, expandable on-demand */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-pure">Password &amp; Security</h2>
              <p className="text-xs text-text-fog mt-0.5">
                Protected with encryption. Click to update or reset your credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isChangingPassword ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="text-xs shrink-0"
              >
                Change Password
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordMsg(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-xs text-text-fog hover:text-text-pure shrink-0"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Expandable Form */}
        <AnimatePresence>
          {isChangingPassword && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handlePasswordChange}
              className="pt-4 border-t border-border space-y-4 overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-text-pure" htmlFor="cur-pass">
                    Current Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotReset}
                    disabled={sendingReset}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    {sendingReset ? "Sending link..." : "Forgot password?"}
                  </button>
                </div>
                <input
                  id="cur-pass"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input text-xs"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-pure" htmlFor="new-pass">
                    New Password
                  </label>
                  <input
                    id="new-pass"
                    type="password"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input text-xs"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-pure" htmlFor="conf-pass">
                    Confirm New Password
                  </label>
                  <input
                    id="conf-pass"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input text-xs"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {passwordMsg && (
                <p className={`text-xs ${passwordMsg.type === "error" ? "text-danger" : "text-success"}`}>
                  {passwordMsg.text}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" variant="primary" size="sm" loading={passwordSaving} className="text-xs">
                  Save New Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordMsg(null);
                  }}
                  className="text-xs text-text-ash hover:text-text-pure"
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
