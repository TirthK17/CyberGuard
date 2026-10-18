import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  levelForPoints,
  getLevelDef,
  getTierForPoints,
  LEVELS,
  OPERATOR_TIERS,
  XP,
  PASS_MARK,
  PRO_MARK,
  QUIZ_PASS,
} from "@/lib/constants";
import { recordActivity, simulationXp, evaluateBadges } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";

describe("Gamification Constants & Thresholds", () => {
  it("defines strict pass marks that agree across the platform", () => {
    expect(PASS_MARK).toBe(61);
    expect(PRO_MARK).toBe(85);
    expect(QUIZ_PASS).toBe(70);
    expect(LEVELS.length).toBe(5);
    expect(OPERATOR_TIERS.length).toBe(5);
  });

  it("calculates exact levels from points thresholds", () => {
    expect(levelForPoints(0)).toBe(1);
    expect(levelForPoints(50)).toBe(1);
    expect(levelForPoints(99)).toBe(1);
    expect(levelForPoints(100)).toBe(2);
    expect(levelForPoints(250)).toBe(2);
    expect(levelForPoints(299)).toBe(2);
    expect(levelForPoints(300)).toBe(3);
    expect(levelForPoints(599)).toBe(3);
    expect(levelForPoints(600)).toBe(4);
    expect(levelForPoints(999)).toBe(4);
    expect(levelForPoints(1000)).toBe(5);
    expect(levelForPoints(5000)).toBe(5);
  });

  it("returns correct level definitions and fallback", () => {
    expect(getLevelDef(1).tier).toBe("Novice");
    expect(getLevelDef(2).tier).toBe("Operator");
    expect(getLevelDef(3).tier).toBe("Analyst");
    expect(getLevelDef(4).tier).toBe("Defender");
    expect(getLevelDef(5).tier).toBe("Architect");
    expect(getLevelDef(999).tier).toBe("Novice"); // fallback
  });

  it("returns correct operator tiers for leaderboard display", () => {
    expect(getTierForPoints(0).label).toBe("Cyber Novice");
    expect(getTierForPoints(150).label).toBe("Security Trainee");
    expect(getTierForPoints(400).label).toBe("Defense Analyst");
    expect(getTierForPoints(800).label).toBe("Threat Hunter");
    expect(getTierForPoints(1200).label).toBe("Cyber Architect");
  });

  it("calculates proportional simulation XP correctly", () => {
    expect(simulationXp(100)).toBe(40);
    expect(simulationXp(85)).toBe(34);
    expect(simulationXp(50)).toBe(20);
    expect(simulationXp(0)).toBe(0);
  });
});

describe("recordActivity & Idempotency", () => {
  const testUserId = "user-test-gamification";

  beforeEach(async () => {
    // Seed test profile
    await supabase.from("profiles").insert({
      id: testUserId,
      full_name: "Test Operator",
      email: "testop@cyberguard.dev",
      role: "user",
      points: 0,
      level: 1,
      status: "active",
      created_at: new Date().toISOString(),
    });
  });

  it("awards XP on first lesson completion and updates profile points", async () => {
    await recordActivity({
      userId: testUserId,
      action: "lesson_completed",
      points: XP.LESSON,
      refId: "lesson-intro-1",
      awardOnce: true,
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("points, level")
      .eq("id", testUserId)
      .single();

    expect(profile?.points).toBe(XP.LESSON);
    expect(profile?.level).toBe(1);
  });

  it("enforces idempotency: does not award duplicate XP for same (userId, action, refId)", async () => {
    // First award
    await recordActivity({
      userId: testUserId,
      action: "lesson_completed",
      points: XP.LESSON,
      refId: "lesson-phishing-101",
      awardOnce: true,
    });

    const { data: profile1 } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", testUserId)
      .single();
    expect(profile1?.points).toBe(XP.LESSON);

    // Second award attempt for the same lesson
    await recordActivity({
      userId: testUserId,
      action: "lesson_completed",
      points: XP.LESSON,
      refId: "lesson-phishing-101",
      awardOnce: true,
    });

    const { data: profile2 } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", testUserId)
      .single();

    // Points MUST remain unchanged (no XP farming)
    expect(profile2?.points).toBe(XP.LESSON);
  });

  it("triggers level-up custom event when crossing a level boundary", async () => {
    const levelUpListener = vi.fn();
    window.addEventListener("cyberguard:level-up", levelUpListener);

    // Award 120 XP to jump from 0 (Level 1) to 120 (Level 2: threshold 100)
    await recordActivity({
      userId: testUserId,
      action: "assessment_completed",
      points: 120,
    });

    expect(levelUpListener).toHaveBeenCalledTimes(1);
    const eventDetail = levelUpListener.mock.calls[0][0].detail;
    expect(eventDetail.oldLevel).toBe(1);
    expect(eventDetail.newLevel).toBe(2);
    expect(eventDetail.newPoints).toBe(120);

    window.removeEventListener("cyberguard:level-up", levelUpListener);
  });

  it("evaluates badges without error when user has activity", async () => {
    const awarded = await evaluateBadges(testUserId);
    expect(Array.isArray(awarded)).toBe(true);
  });
});
