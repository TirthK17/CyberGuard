import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

export type CertificateRecord = Database["public"]["Tables"]["certificates"]["Row"];

export const certificatesApi = {
  /**
   * Public verification of an issued certificate by ID.
   */
  async verifyCertificate(certId: string): Promise<CertificateRecord | null> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", certId.trim().toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("Verification error:", error.message);
      return null;
    }
    return data;
  },

  /**
   * Retrieves certificate for the authenticated user if already issued.
   */
  async getUserCertificate(userId: string): Promise<CertificateRecord | null> {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Issues a permanent, uniquely identified certificate (CG-YYYY-XXXXX)
   * through server-side verification of passing assessment score.
   */
  async issueCertificate(): Promise<CertificateRecord> {
    const { data, error } = await supabase.rpc("issue_certificate");

    if (error) throw new Error(error.message);
    return data as unknown as CertificateRecord;
  },
};
