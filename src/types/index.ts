export type Role = "user" | "admin";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  points: number;
  level: number;
  awareness_score: number;
  status: "active" | "disabled";
  created_at: string;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  duration_minutes: number;
  thumbnail_url: string | null;
  learning_objectives: string[];
  is_published: boolean;
  order_index: number;
}

export type LessonBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tip"; text: string }
  | { type: "warning"; text: string }
  | { type: "image"; url: string; caption?: string }
  | { type: "case_study"; title: string; incident: string; impact: string; takeaway: string }
  | { type: "interactive_check"; question: string; options: { text: string; correct: boolean; explanation: string }[] }
  | { type: "terminal"; title?: string; command?: string; output: string }
  | { type: "takeaway"; title: string; points: string[] };

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: LessonBlock[];
  order_index: number;
  video_url: string | null;
}

export interface Quiz {
  id: string;
  module_id: string | null;
  title: string;
  category: string;
  difficulty: Difficulty;
  time_limit_seconds: number | null;
  is_published: boolean;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "a" | "b" | "c" | "d";
  explanation: string | null;
  points: number;
  difficulty: Difficulty;
  order_index: number;
}

export interface Simulation {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  scenario: string;
  difficulty: Difficulty;
  duration_minutes: number;
  learning_objective: string | null;
  is_published: boolean;
}

export interface SimulationStepOption {
  id: string;
  label: string;
  correct: boolean;
  feedback?: string;
}

export interface SimulationStep {
  id: string;
  simulation_id: string;
  order_index: number;
  prompt: string;
  options: SimulationStepOption[];
  explanation: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

export interface Progress {
  id: string;
  user_id: string;
  module_id: string;
  completed_lessons: string[];
  is_completed: boolean;
}

export interface LeaderboardEntry {
  id: string;
  user_id?: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  level: number;
  rank?: number;
  badges_count?: number;
}

export interface UserQuizResult {
  quiz_id: string;
  score: number;
  total_questions: number;
}

export interface UserSimulationResult {
  simulation_id: string;
  score: number;
}
