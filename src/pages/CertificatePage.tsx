import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";
import { supabase } from "@/lib/supabase";
import { PASS_MARK } from "@/lib/constants";

interface CertRecord {
  id: string;
  user_id: string;
  full_name: string;
  score: number;
  issued_at: string;
}

/**
 * Generates a collision-resistant certificate ID in the format CG-YYYY-XXXXX.
 * Checks the DB for collisions and retries if needed (extremely unlikely).
 */
async function generateCertId(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const suffix = arr[0].toString(36).toUpperCase().padStart(6, "0").slice(0, 5);
    const id = `CG-${year}-${suffix}`;
    const { data } = await supabase.from("certificates").select("id").eq("id", id).maybeSingle();
    if (!data) return id; // No collision — use this ID
  }
  // Fallback (should never reach here)
  return `CG-${year}-${Date.now().toString(36).toUpperCase()}`;
}

export function CertificatePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [cert, setCert] = useState<CertRecord | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    let active = true;

    (async () => {
      // Determine best assessment score (eligibility is based on BEST score, not current)
      const { data: results } = await supabase
        .from("assessment_results")
        .select("score")
        .eq("user_id", profile.id)
        .order("score", { ascending: false })
        .limit(1);

      const best = results?.[0]?.score ?? 0;
      if (!active) return;
      setBestScore(best);

      if (best < PASS_MARK) {
        setLoading(false);
        return;
      }

      // Look for an existing certificate
      const { data: existing } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (!active) return;

      if (existing) {
        setCert(existing as CertRecord);
      } else {
        // Issue a new certificate — store it permanently
        const id = await generateCertId();
        const newCert: CertRecord = {
          id,
          user_id: profile.id,
          full_name: profile.full_name,
          score: best,
          issued_at: new Date().toISOString(),
        };
        await supabase.from("certificates").insert(newCert);
        setCert(newCert);
      }
      setLoading(false);
    })();

    return () => { active = false; };
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const eligible = (bestScore ?? 0) >= PASS_MARK;

  const verifyUrl = cert
    ? `${window.location.origin}/verify/${cert.id}`
    : null;

  const formattedDate = cert
    ? new Date(cert.issued_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  useEffect(() => {
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 120,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [verifyUrl]);

  const handleShare = async () => {
    if (!cert || !verifyUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My CyberGuard Certificate",
          text: `I passed the CyberGuard Cyber Safety Test with a score of ${cert.score}%!`,
          url: verifyUrl,
        });
      } else {
        await navigator.clipboard.writeText(verifyUrl);
        toast({ title: "Verify URL copied to clipboard!", variant: "success" });
      }
    } catch {
      toast({ title: "Could not share", description: `Verify URL: ${verifyUrl}`, variant: "info" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow text-frost-glow">Achievement</p>
          <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Certification
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Pass the Cyber Safety Test with {PASS_MARK}% or higher to earn your certificate.
          </p>
        </motion.div>
        <EmptyState
          title="Certificate not yet unlocked"
          description={`Score at least ${PASS_MARK}% on the Cyber Safety Test to earn your official CyberGuard Certificate. Your best score so far: ${bestScore ?? 0}%.`}
          actionLabel="Take Safety Test"
          onAction={() => navigate("/assessment")}
          icon="ti-certificate"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-frost-glow">Achievement</p>
        <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Cyber Safety Certificate
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Official digital certificate verifying your cyber safety knowledge.
        </p>
      </motion.div>

      {/* Certificate card */}
      <motion.div
        id="certificate-card"
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-void-violet/35 bg-gradient-to-br from-carbon via-obsidian to-carbon p-8 sm:p-12 text-center shadow-[0_24px_64px_rgba(0,0,0,0.8),0_0_40px_rgba(102,58,243,0.15)]">
          {/* Subtle glow wash behind certificate */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-void-violet/15 blur-[80px]" />

          {/* Top Seal */}
          <div className="relative flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-glass-edge" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-surface-elevated shadow-md p-1">
              <CyberGuardLogoMark size={40} pulse={false} />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-glass-edge" />
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-ash">
            Certificate of Completion
          </p>

          <h2 className="gradient-heading mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cybersecurity Awareness
          </h2>

          <p className="mt-6 text-xs text-text-fog">This certificate is awarded to</p>
          <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-frost-glow tracking-tight">
            {cert?.full_name}
          </p>

          <p className="mt-3 max-w-md mx-auto text-xs leading-relaxed text-text-fog">
            for successfully demonstrating practical knowledge in spotting online scams,
            protecting accounts and passwords, and practising safe digital habits.
          </p>

          {/* Telemetry Row */}
          <div className="relative mt-8 flex justify-center gap-8 border-t border-glass-edge pt-6">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-frost-glow">{cert?.score}%</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Safety Score</div>
            </div>
            <div className="h-10 w-px self-center bg-glass-edge" />
            <div className="text-center">
              <div className="font-mono text-sm font-semibold text-text-pure">{formattedDate}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Issued On</div>
            </div>
            <div className="h-10 w-px self-center bg-glass-edge" />
            <div className="text-center">
              <div className="font-mono text-sm font-semibold text-void-violet">{cert?.id}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Certificate ID</div>
            </div>
          </div>

          {/* QR Code and Verification */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            {qrDataUrl && (
              <div className="rounded-xl border border-glass-edge bg-white p-1.5 shadow-sm">
                <img src={qrDataUrl} alt={`QR Code for Certificate ${cert?.id}`} className="h-16 w-16" />
              </div>
            )}
            <p className="font-mono text-[9px] text-text-ash uppercase tracking-widest">
              Scan to verify or visit {window.location.origin}/verify/{cert?.id}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mx-auto max-w-2xl flex flex-wrap gap-3 justify-center"
      >
        <Button
          variant="secondary"
          size="sm"
          icon={<i className="ti ti-printer" aria-hidden="true" />}
          onClick={() => window.print()}
        >
          Print Certificate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<i className="ti ti-share" aria-hidden="true" />}
          onClick={handleShare}
        >
          Share Verify Link
        </Button>
      </motion.div>

      {/* Print styles injected inline */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-card, #certificate-card * { visibility: visible !important; }
          #certificate-card { position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
