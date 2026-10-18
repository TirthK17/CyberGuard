import { describe, it, expect, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { localDb } from "@/lib/localDb";
import { PASS_MARK } from "@/lib/constants";

describe("Certificate System & Public Verification", () => {
  const userId = "user-cert-test";

  beforeEach(() => {
    localDb.resetDatabase();
  });

  it("stores and maintains a stable certificate ID without re-generation", async () => {
    const certId = "CG-2026-X99AB";
    const issuedAt = "2026-03-15T10:00:00.000Z";

    // Insert certificate
    await supabase.from("certificates").insert({
      id: certId,
      user_id: userId,
      full_name: "Test Operator",
      score: 92,
      issued_at: issuedAt,
    });

    // Query certificate
    const { data: cert1 } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    expect(cert1).not.toBeNull();
    expect(cert1?.id).toBe(certId);
    expect(cert1?.issued_at).toBe(issuedAt);

    // Second query simulates re-opening CertificatePage
    const { data: cert2 } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // The ID and date must remain identical
    expect(cert2?.id).toBe(certId);
    expect(cert2?.issued_at).toBe(issuedAt);
  });

  it("determines eligibility based on BEST assessment score so failed retakes do not revoke certificate", async () => {
    // User passes first attempt with 85%
    await supabase.from("assessment_results").insert({
      user_id: userId,
      score: 85,
      passed: true,
      completed_at: "2026-03-10T12:00:00.000Z",
    });

    // User later retakes and scores 45% (failed)
    await supabase.from("assessment_results").insert({
      user_id: userId,
      score: 45,
      passed: false,
      completed_at: "2026-03-12T12:00:00.000Z",
    });

    // Query best assessment score
    const { data: results } = await supabase
      .from("assessment_results")
      .select("score")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(1);

    const bestScore = results?.[0]?.score ?? 0;
    expect(bestScore).toBe(85);
    expect(bestScore).toBeGreaterThanOrEqual(PASS_MARK);
  });

  it("allows public certificate verification by ID and returns correct record", async () => {
    const testCert = {
      id: "CG-2026-VERIF",
      user_id: "user-public-cert",
      full_name: "Aarav Sharma",
      score: 88,
      issued_at: new Date().toISOString(),
    };

    await supabase.from("certificates").insert(testCert);

    // Verify valid certificate lookup
    const { data: foundCert } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", "CG-2026-VERIF")
      .maybeSingle();

    expect(foundCert).not.toBeNull();
    expect(foundCert?.full_name).toBe("Aarav Sharma");
    expect(foundCert?.score).toBe(88);

    // Verify non-existent ID lookup returns null
    const { data: notFound } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", "CG-2026-DOESNOTEXIST")
      .maybeSingle();

    expect(notFound).toBeNull();
  });
});
