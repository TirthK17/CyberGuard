/**
 * src/lib/constants.ts
 *
 * Single source of truth for all game-mechanic constants.
 * Any XP values, level thresholds, or pass marks used in the codebase
 * must come from here — never hardcoded inline.
 */

/** Brand constants */
export const APP_NAME = "Kavach";
export const APP_TAGLINE = "Cyber awareness. Human defence.";
export const SOUND_PREF_KEY = "kavach_sound_effects_enabled";

// ─── Assessment pass marks ────────────────────────────────────────────────────

/** Minimum score (%) to pass the safety assessment and earn a certificate */
export const PASS_MARK = 61;

/** Score (%) considered "Pro" level on the assessment */
export const PRO_MARK = 85;

/** Minimum score (%) to pass a module quiz (used for celebrate + label logic) */
export const QUIZ_PASS = 70;

// ─── Level thresholds ─────────────────────────────────────────────────────────

export interface LevelDef {
  level: number;
  /** Minimum points to reach this level */
  minPoints: number;
  /** Display label shown in UI */
  tier: string;
  /** Short badge colour hint */
  colour: string;
}

/**
 * 5-tier level system. Used in gamification.ts, DashboardShell, LeaderboardPage
 * and TiersTab. All must read from here.
 */
export const LEVELS: LevelDef[] = [
  { level: 1, minPoints: 0,    tier: "Novice",    colour: "zinc"   },
  { level: 2, minPoints: 100,  tier: "Operator",  colour: "blue"   },
  { level: 3, minPoints: 300,  tier: "Analyst",   colour: "violet" },
  { level: 4, minPoints: 600,  tier: "Defender",  colour: "amber"  },
  { level: 5, minPoints: 1000, tier: "Architect", colour: "emerald" },
];

/** Compute the level integer for a given points total */
export function levelForPoints(points: number): number {
  return (
    [...LEVELS]
      .reverse()
      .find((l) => points >= l.minPoints)?.level ?? 1
  );
}

/** Get the LevelDef for a level integer */
export function getLevelDef(level: number): LevelDef {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

// ─── XP award amounts ─────────────────────────────────────────────────────────

/**
 * XP amounts for each action type.
 * Changing a value here propagates everywhere automatically.
 */
export const XP = {
  /** First-time completion of a lesson */
  LESSON: 20,
  /** First-time passing a quiz (>= QUIZ_PASS%) */
  QUIZ_PASS: 30,
  /** Small consolation for completing (but not passing) a quiz retake */
  QUIZ_COMPLETION: 5,
  /** First-time completion of a simulation */
  SIMULATION: 40,
  /** Proportional: simulation score * SIMULATION_FACTOR (capped to SIMULATION) */
  SIMULATION_FACTOR: 0.4,
  /** First-time passing the safety assessment */
  ASSESSMENT_PASS: 100,
  /** Small bonus for improving best assessment score */
  ASSESSMENT_IMPROVEMENT: 20,
  /** Incident report — idempotent per day, max 3/day */
  INCIDENT_REPORT: 30,
  /** Maximum incident-report XP per day */
  INCIDENT_REPORT_DAILY_CAP: 90,
  /** First tick of a hygiene checklist item */
  HYGIENE_ITEM: 10,
  /** First time a topic is marked "learned" */
  TOPIC_LEARNED: 5,
} as const;

// ─── Operator tier thresholds (leaderboard display) ───────────────────────────

export interface TierDef {
  label: string;
  minPoints: number;
  colour: string;
}

/**
 * 5 operator tiers shown on the leaderboard.
 * These are display-only — level progression uses LEVELS above.
 */
export const OPERATOR_TIERS: TierDef[] = [
  { label: "Cyber Novice",    minPoints: 0,    colour: "zinc"   },
  { label: "Security Trainee",minPoints: 150,  colour: "sky"    },
  { label: "Defense Analyst", minPoints: 400,  colour: "violet" },
  { label: "Threat Hunter",   minPoints: 800,  colour: "amber"  },
  { label: "Cyber Architect", minPoints: 1200, colour: "emerald" },
];

/** Get the operator tier for a given points total */
export function getTierForPoints(points: number): TierDef {
  return (
    [...OPERATOR_TIERS]
      .reverse()
      .find((t) => points >= t.minPoints) ?? OPERATOR_TIERS[0]
  );
}
