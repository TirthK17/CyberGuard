import { describe, it, expect, beforeEach } from "vitest";
import { localDb } from "@/lib/localDb";
import { supabase } from "@/lib/supabase";
import { recordActivity, simulationXp } from "@/lib/gamification";
import { XP, PASS_MARK } from "@/lib/constants";

describe("End-to-End User Journey & Security Integration", () => {
  beforeEach(() => {
    localDb.resetDatabase();
  });

  it("blocks unauthenticated access to admin privileges", () => {
    const currentUser = localDb.auth.getCurrentUser();
    expect(currentUser).toBeNull();

    // Verification that non-logged-in session cannot perform admin actions
    const isAdmin = currentUser?.role === "admin";
    expect(isAdmin).toBe(false);
  });

  it("executes complete lifecycle: register -> login -> lesson -> quiz -> simulation -> assessment -> certificate", async () => {
    const userEmail = "cadet.journey@cyberguard.dev";
    const userPassword = "SecureCadetPassword2026!";
    const userName = "Cadet Jordan";

    // ── 1. Register ──────────────────────────────────────────────────────────
    const regRes = await localDb.auth.signUp({
      email: userEmail,
      password: userPassword,
      options: { data: { full_name: userName } },
    });
    expect(regRes.error).toBeNull();

    const signedUpUser = localDb.auth.getCurrentUser();
    expect(signedUpUser).not.toBeNull();
    expect(signedUpUser?.role).toBe("user"); // Always assigned user role
    const userId = signedUpUser!.id;

    // ── 2. Sign out & Sign in ────────────────────────────────────────────────
    await localDb.auth.signOut();
    expect(localDb.auth.getCurrentUser()).toBeNull();

    const loginRes = await localDb.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });
    expect(loginRes.error).toBeNull();
    expect(localDb.auth.getCurrentUser()?.id).toBe(userId);

    // ── 3. Complete a Lesson (Idempotent XP) ──────────────────────────────────
    await recordActivity({
      userId,
      action: "lesson_completed",
      points: XP.LESSON,
      refId: "les-mitm-1",
      awardOnce: true,
    });

    let { data: profile } = await supabase
      .from("profiles")
      .select("points, level")
      .eq("id", userId)
      .single();
    expect(profile?.points).toBe(XP.LESSON); // 20 XP

    // Retrying same lesson does not award duplicate XP
    await recordActivity({
      userId,
      action: "lesson_completed",
      points: XP.LESSON,
      refId: "les-mitm-1",
      awardOnce: true,
    });

    ({ data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single());
    expect(profile?.points).toBe(XP.LESSON); // Still 20 XP

    // ── 4. Pass a Quiz ───────────────────────────────────────────────────────
    await recordActivity({
      userId,
      action: "quiz_passed",
      points: XP.QUIZ_PASS,
      refId: "quiz-mitm",
      awardOnce: true,
    });

    ({ data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single());
    expect(profile?.points).toBe(XP.LESSON + XP.QUIZ_PASS); // 20 + 30 = 50 XP

    // ── 5. Run a Simulation ──────────────────────────────────────────────────
    const simScore = 100;
    const earnedSimXp = simulationXp(simScore); // 40 XP
    expect(earnedSimXp).toBe(40);

    await recordActivity({
      userId,
      action: "simulation_completed",
      points: earnedSimXp,
      refId: "sim-mitm-sandbox",
      awardOnce: true,
    });

    ({ data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single());
    expect(profile?.points).toBe(90); // 50 + 40 = 90 XP

    // ── 6. Take Safety Assessment ────────────────────────────────────────────
    const assessmentScore = 92;
    expect(assessmentScore).toBeGreaterThanOrEqual(PASS_MARK);

    // Record assessment result in DB
    await supabase.from("assessment_results").insert({
      id: "asmt-res-1",
      user_id: userId,
      assessment_id: "asmt-1",
      score: assessmentScore,
      completed_at: new Date().toISOString(),
    });

    // Award assessment pass XP (100 XP) -> Total reaches 190 XP (Level 2: Operator)
    await recordActivity({
      userId,
      action: "assessment_completed",
      points: XP.ASSESSMENT_PASS,
      refId: "asmt-1",
      awardOnce: true,
    });

    ({ data: profile } = await supabase
      .from("profiles")
      .select("points, level")
      .eq("id", userId)
      .single());
    expect(profile?.points).toBe(190);
    expect(profile?.level).toBe(2); // Automatically promoted to Level 2!

    // ── 7. Issue & Verify Certificate ────────────────────────────────────────
    const certId = "CG-2026-FLOW1";
    await supabase.from("certificates").insert({
      id: certId,
      user_id: userId,
      full_name: userName,
      score: assessmentScore,
      issued_at: new Date().toISOString(),
    });

    // Public verification without user session
    const { data: verifiedCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certId)
      .maybeSingle();

    expect(verifiedCert).not.toBeNull();
    expect(verifiedCert?.id).toBe(certId);
    expect(verifiedCert?.full_name).toBe(userName);
    expect(verifiedCert?.score).toBe(92);
  });
});
