export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type ContentDifficulty = "beginner" | "intermediate" | "advanced";
export type IncidentUrgency = "low" | "medium" | "high" | "critical";
export type ThreatSeverity = "critical" | "high" | "elevated" | "advisory";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          points: number;
          xp: number;
          level: number;
          tier: string;
          awareness_score: number;
          streak_days: number;
          status: "active" | "disabled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          email: string;
          role?: UserRole;
          avatar_url?: string | null;
          points?: number;
          xp?: number;
          level?: number;
          tier?: string;
          awareness_score?: number;
          streak_days?: number;
          status?: "active" | "disabled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          points?: number;
          xp?: number;
          level?: number;
          tier?: string;
          awareness_score?: number;
          streak_days?: number;
          status?: "active" | "disabled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          difficulty: ContentDifficulty;
          duration_minutes: number;
          thumbnail_url: string | null;
          learning_objectives: string[];
          is_published: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          difficulty: ContentDifficulty;
          duration_minutes?: number;
          thumbnail_url?: string | null;
          learning_objectives?: string[];
          is_published?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          category?: string;
          difficulty?: ContentDifficulty;
          duration_minutes?: number;
          thumbnail_url?: string | null;
          learning_objectives?: string[];
          is_published?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: Json;
          order_index: number;
          video_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content?: Json;
          order_index?: number;
          video_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: Json;
          order_index?: number;
          video_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          module_id: string | null;
          title: string;
          category: string;
          difficulty: ContentDifficulty;
          time_limit_seconds: number | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id?: string | null;
          title: string;
          category: string;
          difficulty?: ContentDifficulty;
          time_limit_seconds?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string | null;
          title?: string;
          category?: string;
          difficulty?: ContentDifficulty;
          time_limit_seconds?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
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
          difficulty: ContentDifficulty;
          order_index: number;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_answer: "a" | "b" | "c" | "d";
          explanation?: string | null;
          points?: number;
          difficulty?: ContentDifficulty;
          order_index?: number;
        };
        Update: {
          id?: string;
          quiz_id?: string;
          question?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_answer?: "a" | "b" | "c" | "d";
          explanation?: string | null;
          points?: number;
          difficulty?: ContentDifficulty;
          order_index?: number;
        };
        Relationships: [];
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          answers: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          answers?: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          score?: number;
          total_questions?: number;
          answers?: Json;
          completed_at?: string;
        };
        Relationships: [];
      };
      simulations: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          scenario: string;
          difficulty: ContentDifficulty;
          duration_minutes: number;
          learning_objective: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          description: string;
          scenario: string;
          difficulty?: ContentDifficulty;
          duration_minutes?: number;
          learning_objective?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          description?: string;
          scenario?: string;
          difficulty?: ContentDifficulty;
          duration_minutes?: number;
          learning_objective?: string | null;
          is_published?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      simulation_steps: {
        Row: {
          id: string;
          simulation_id: string;
          order_index: number;
          prompt: string;
          options: Json;
          explanation: string | null;
        };
        Insert: {
          id?: string;
          simulation_id: string;
          order_index?: number;
          prompt: string;
          options?: Json;
          explanation?: string | null;
        };
        Update: {
          id?: string;
          simulation_id?: string;
          order_index?: number;
          prompt?: string;
          options?: Json;
          explanation?: string | null;
        };
        Relationships: [];
      };
      simulation_results: {
        Row: {
          id: string;
          user_id: string;
          simulation_id: string;
          score: number;
          answers: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          simulation_id: string;
          score: number;
          answers?: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          simulation_id?: string;
          score?: number;
          answers?: Json;
          completed_at?: string;
        };
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string;
          topic: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_answer: "a" | "b" | "c" | "d";
          explanation: string | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          topic: string;
          question: string;
          option_a: string;
          option_b: string;
          option_c: string;
          option_d: string;
          correct_answer: "a" | "b" | "c" | "d";
          explanation?: string | null;
          order_index?: number;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          topic?: string;
          question?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string;
          option_d?: string;
          correct_answer?: "a" | "b" | "c" | "d";
          explanation?: string | null;
          order_index?: number;
        };
        Relationships: [];
      };
      assessment_results: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          score: number;
          band: string;
          answers: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          score: number;
          band: string;
          answers?: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          assessment_id?: string;
          score?: number;
          band?: string;
          answers?: Json;
          completed_at?: string;
        };
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed_lessons: string[];
          is_completed: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed_lessons?: string[];
          is_completed?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          completed_lessons?: string[];
          is_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          requirement_type: string;
          requirement_value: number;
          requirement_meta: Json;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon?: string;
          requirement_type: string;
          requirement_value?: number;
          requirement_meta?: Json;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          requirement_type?: string;
          requirement_value?: number;
          requirement_meta?: Json;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          score: number;
          issued_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          full_name: string;
          score: number;
          issued_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          score?: number;
          issued_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          category_id: string;
          urgency: IncidentUrgency;
          subject: string;
          sender_or_source: string;
          target_url_or_hash: string | null;
          details: string;
          status: string;
          risk_score: string;
          soc_actions: Json;
          containment_playbook: Json;
          attached_files: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          category_id: string;
          urgency: IncidentUrgency;
          subject: string;
          sender_or_source: string;
          target_url_or_hash?: string | null;
          details: string;
          status?: string;
          risk_score?: string;
          soc_actions?: Json;
          containment_playbook?: Json;
          attached_files?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          category_id?: string;
          urgency?: IncidentUrgency;
          subject?: string;
          sender_or_source?: string;
          target_url_or_hash?: string | null;
          details?: string;
          status?: string;
          risk_score?: string;
          soc_actions?: Json;
          containment_playbook?: Json;
          attached_files?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          meta: Json;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          meta?: Json;
          points_earned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          meta?: Json;
          points_earned?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tool_usage: {
        Row: {
          id: string;
          user_id: string;
          tool_name: string;
          action: string;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_name: string;
          action?: string;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool_name?: string;
          action?: string;
          meta?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      threat_bulletins: {
        Row: {
          id: string;
          cve: string | null;
          title: string;
          category: string;
          severity: ThreatSeverity;
          origin_region: string;
          target_sectors: string[];
          summary: string;
          attack_vector: string;
          mitigation: string;
          mitre: Json;
          iocs: Json;
          simulation_url: string | null;
          simulation_label: string | null;
          is_published: boolean;
          published_at: string;
        };
        Insert: {
          id: string;
          cve?: string | null;
          title: string;
          category: string;
          severity: ThreatSeverity;
          origin_region?: string;
          target_sectors?: string[];
          summary: string;
          attack_vector: string;
          mitigation: string;
          mitre?: Json;
          iocs?: Json;
          simulation_url?: string | null;
          simulation_label?: string | null;
          is_published?: boolean;
          published_at?: string;
        };
        Update: {
          id?: string;
          cve?: string | null;
          title?: string;
          category?: string;
          severity?: ThreatSeverity;
          origin_region?: string;
          target_sectors?: string[];
          summary?: string;
          attack_vector?: string;
          mitigation?: string;
          mitre?: Json;
          iocs?: Json;
          simulation_url?: string | null;
          simulation_label?: string | null;
          is_published?: boolean;
          published_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          points: number;
          xp: number;
          level: number;
          tier: string;
          awareness_score: number;
          badges_count: number;
          rank: number;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: Database["public"]["Tables"]["quiz_results"]["Row"];
        Relationships: [];
      };
      simulation_attempts: {
        Row: Database["public"]["Tables"]["simulation_results"]["Row"];
        Relationships: [];
      };
      assessment_attempts: {
        Row: Database["public"]["Tables"]["assessment_results"]["Row"];
        Relationships: [];
      };
      lesson_progress: {
        Row: Database["public"]["Tables"]["progress"]["Row"];
        Relationships: [];
      };
      activity_log: {
        Row: Database["public"]["Tables"]["activity_logs"]["Row"];
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      award_xp: {
        Args: {
          p_action: string;
          p_points: number;
          p_meta?: Json;
          p_ref_id?: string | null;
          p_award_once?: boolean;
        };
        Returns: {
          awarded: boolean;
          points_earned: number;
          points: number;
          level: number;
          tier: string;
          badges_unlocked: Array<{
            id: string;
            name: string;
            description: string;
            icon: string;
          }>;
        };
      };
      issue_certificate: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["certificates"]["Row"];
      };
      report_incident: {
        Args: {
          p_category: string;
          p_category_id: string;
          p_urgency: IncidentUrgency;
          p_subject: string;
          p_sender: string;
          p_target_url: string;
          p_details: string;
          p_attached_files?: string[];
        };
        Returns: Database["public"]["Tables"]["incidents"]["Row"];
      };
      record_lesson_progress: {
        Args: {
          p_module_id: string;
          p_lesson_id: string;
        };
        Returns: Database["public"]["Tables"]["progress"]["Row"];
      };
      submit_assessment: {
        Args: {
          p_assessment_id: string;
          p_score: number;
          p_band: string;
          p_answers?: Json;
        };
        Returns: Database["public"]["Tables"]["assessment_results"]["Row"];
      };
      log_tool_usage: {
        Args: {
          p_tool_name: string;
          p_action?: string;
          p_meta?: Json;
        };
        Returns: Database["public"]["Tables"]["tool_usage"]["Row"];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
