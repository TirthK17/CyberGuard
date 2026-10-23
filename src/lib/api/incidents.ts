import { supabase } from "@/lib/supabase";
import type { Database, IncidentUrgency } from "@/types/database";

export type IncidentRecord = Database["public"]["Tables"]["incidents"]["Row"];

export interface ReportIncidentInput {
  category: string;
  categoryId: string;
  urgency: IncidentUrgency;
  subject: string;
  senderOrSource: string;
  targetUrlOrHash?: string;
  details: string;
  attachedFiles?: string[];
}

export const incidentsApi = {
  /**
   * Submits a new security incident report via the server-side RPC.
   * Generates a unique collision-resistant INC-YYYY-XXXXX identifier.
   */
  async reportIncident(input: ReportIncidentInput): Promise<IncidentRecord> {
    const { data, error } = await supabase.rpc("report_incident", {
      p_category: input.category,
      p_category_id: input.categoryId,
      p_urgency: input.urgency,
      p_subject: input.subject,
      p_sender: input.senderOrSource,
      p_target_url: input.targetUrlOrHash ?? "",
      p_details: input.details,
      p_attached_files: input.attachedFiles ?? [],
    });

    if (error) throw new Error(error.message);
    return data as unknown as IncidentRecord;
  },

  /**
   * Retrieves the current user's submitted incident reports.
   */
  async getUserIncidents(userId: string): Promise<IncidentRecord[]> {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /**
   * Admin-only retrieval of all platform incidents.
   */
  async getAllIncidents(): Promise<IncidentRecord[]> {
    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /**
   * Admin status update on an incident report.
   */
  async updateIncidentStatus(incidentId: string, status: string): Promise<IncidentRecord> {
    const { data, error } = await supabase
      .from("incidents")
      .update({ status })
      .eq("id", incidentId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
