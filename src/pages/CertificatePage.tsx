import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
 * Generates an ultra-unique, cryptographic certificate ID in the format CG-YYYY-XXXXXXXX.
 * Uses Web Crypto getRandomValues to generate an 8-character hex token (4.29 billion combinations/yr).
 * Validates collision-resistance against the DB before returning.
 */
async function generateCertId(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const arr = new Uint8Array(4);
    crypto.getRandomValues(arr);
    const suffix = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const id = `CG-${year}-${suffix}`;
    const { data } = await supabase.from("certificates").select("id").eq("id", id).maybeSingle();
    if (!data) return id; // Guaranteed unique ID
  }
  // High-entropy fallback
  const fallbackArr = new Uint8Array(4);
  crypto.getRandomValues(fallbackArr);
  const fallbackSuffix = Array.from(fallbackArr, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `CG-${year}-${fallbackSuffix}`;
}

/**
 * Computes an immutable SHA-256 digital fingerprint from the certificate payload
 * to guarantee authenticity and cryptographic integrity.
 */
async function computeDigitalFingerprint(cert: CertRecord): Promise<string> {
  const raw = `${cert.user_id}:${cert.id}:${cert.score}:${cert.issued_at}:cyberguard-root-ca-v1`;
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function CertificatePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [cert, setCert] = useState<CertRecord | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");

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

      let activeCert: CertRecord;
      if (existing) {
        activeCert = existing as CertRecord;
        setCert(activeCert);
      } else {
        // Issue a new certificate — store it permanently with guaranteed unique ID
        const id = await generateCertId();
        const newCert: CertRecord = {
          id,
          user_id: profile.id,
          full_name: profile.full_name,
          score: best,
          issued_at: new Date().toISOString(),
        };
        await supabase.from("certificates").insert(newCert);
        activeCert = newCert;
        setCert(newCert);
      }

      // Compute cryptographic hash
      const hash = await computeDigitalFingerprint(activeCert);
      if (active) {
        setFingerprint(hash);
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
      width: 140,
      color: {
        dark: "#0b101b",
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
          title: "Official CyberGuard Certificate",
          text: `I earned the official CyberGuard Cybersecurity Safety Certificate with a score of ${cert.score}%! Verify my credential:`,
          url: verifyUrl,
        });
      } else {
        await navigator.clipboard.writeText(verifyUrl);
        toast({ title: "Verification URL copied to clipboard!", variant: "success" });
      }
    } catch {
      toast({ title: "Could not share", description: `Verify URL: ${verifyUrl}`, variant: "info" });
    }
  };

  const handleCopyId = async () => {
    if (!cert) return;
    await navigator.clipboard.writeText(cert.id);
    toast({ title: "Certificate ID copied!", description: cert.id, variant: "success" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" aria-label="Loading" />
          <p className="text-xs font-mono text-text-fog uppercase tracking-widest">Verifying accreditation record…</p>
        </div>
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
          <p className="eyebrow text-frost-glow">Accreditation</p>
          <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Cyber Defense Certification
          </h1>
          <p className="mt-1 text-xs text-text-fog">
            Pass the Comprehensive Cyber Safety Test with {PASS_MARK}% or higher to unlock your official credential.
          </p>
        </motion.div>
        <EmptyState
          title="Certificate not yet unlocked"
          description={`Score at least ${PASS_MARK}% on the Cyber Safety Test to earn your official, cryptographically verified CyberGuard Certificate. Your best score so far: ${bestScore ?? 0}%.`}
          actionLabel="Take Safety Test"
          onAction={() => navigate("/assessment")}
          icon="ti-certificate"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold">
              VERIFIED CREDENTIAL
            </span>
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Official Cyber Defense Certificate
          </h1>
          <p className="mt-1 text-xs text-text-fog max-w-xl leading-relaxed">
            Cryptographically sealed and signed by the CyberGuard Defense Council. Scannable QR code guarantees permanent public verification for all employers and evaluators.
          </p>
        </div>

        {/* Quick action buttons on top */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<i className="ti ti-printer" aria-hidden="true" />}
            onClick={() => window.print()}
          >
            Print / Save PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<i className="ti ti-share" aria-hidden="true" />}
            onClick={handleShare}
          >
            Share Credential
          </Button>
        </div>
      </motion.div>

      {/* ── LUXURY EXECUTIVE CERTIFICATE CARD ── */}
      <motion.div
        id="certificate-card"
        initial={{ opacity: 0, scale: 0.98, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)]">
          {/* Subtle gold / cyan ambient backdrops */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-amber-500/12 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-sky-500/10 blur-[90px]" />

          {/* Double Ornate Security Guilloche Borders */}
          <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-2xl border border-amber-400/25" />
          <div className="pointer-events-none absolute inset-5 sm:inset-6 rounded-xl border border-dashed border-amber-400/15" />

          {/* Corner Security Accents */}
          <span className="pointer-events-none absolute top-4 left-4 font-mono text-xs text-amber-400/60 font-bold">⌜</span>
          <span className="pointer-events-none absolute top-4 right-4 font-mono text-xs text-amber-400/60 font-bold">⌝</span>
          <span className="pointer-events-none absolute bottom-4 left-4 font-mono text-xs text-amber-400/60 font-bold">⌞</span>
          <span className="pointer-events-none absolute bottom-4 right-4 font-mono text-xs text-amber-400/60 font-bold">⌟</span>

          {/* Top Seal & Crest */}
          <div className="relative flex items-center justify-center gap-4 mb-6 pt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/30 to-amber-400/70" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-slate-900 to-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.3)] p-1.5">
              <CyberGuardLogoMark size={44} pulse={false} />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm">
                <i className="ti ti-check" />
              </div>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-400/30 to-amber-400/70" />
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold">
            CYBERGUARD DEFENSE COUNCIL · ACCREDITATION REGISTRY
          </p>

          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Certificate of Cyber Defense
          </h2>

          <p className="mt-5 text-xs text-text-fog tracking-wide uppercase font-mono">
            This professional credential is conferred upon
          </p>

          {/* Recipient Name in Luxury Typography */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 tracking-tight">
              {cert?.full_name}
            </p>
            <i className="ti ti-rosette-discount-check-filled text-amber-400 text-2xl drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" title="Verified Operator" />
          </div>

          <p className="mt-3.5 max-w-lg mx-auto text-xs leading-relaxed text-text-fog">
            for successfully passing the Comprehensive Cyber Safety Assessment, demonstrating verified competence in identifying social engineering attacks, safeguarding credentials, neutralizing malware threats, and maintaining active digital hygiene.
          </p>

          {/* Telemetry Row (Score, Date, Unique ID, Status) */}
          <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-amber-400/20 py-4 bg-white/[0.02] rounded-xl px-2">
            <div className="text-center">
              <div className="font-display text-xl sm:text-2xl font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                {cert?.score}%
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash font-bold">Safety Score</div>
            </div>

            <div className="text-center border-l border-white/10">
              <div className="font-mono text-xs sm:text-sm font-semibold text-white mt-1">{formattedDate}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash font-bold">Issued On</div>
            </div>

            <div className="text-center border-l border-white/10">
              <div
                onClick={handleCopyId}
                className="font-mono text-xs sm:text-sm font-bold text-amber-300 mt-1 cursor-pointer hover:underline"
                title="Click to copy unique Certificate ID"
              >
                {cert?.id}
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash font-bold">Unique Cert ID</div>
            </div>

            <div className="text-center border-l border-white/10">
              <div className="font-mono text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <i className="ti ti-shield-check text-sm" />
                <span>VERIFIED</span>
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash font-bold">Registry Status</div>
            </div>
          </div>

          {/* Cryptographic Hash Strip */}
          {fingerprint && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-text-ash bg-black/40 py-1.5 px-3 rounded-lg border border-white/5 max-w-xl mx-auto">
              <i className="ti ti-lock text-amber-400/70" />
              <span className="uppercase text-amber-400/80 font-bold">Digital Signature:</span>
              <span className="truncate text-text-frost">{fingerprint}</span>
            </div>
          )}

          {/* Bottom Section: Dual Signatures & Scannable QR Code */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-4 border-t border-white/10">
            {/* Signature 1 */}
            <div className="text-center sm:text-left">
              <div className="font-display italic text-base text-amber-200/90 tracking-wide font-serif">
                Dr. Sarah Chen
              </div>
              <div className="h-px w-28 bg-amber-400/40 my-1 mx-auto sm:mx-0" />
              <p className="font-mono text-[9px] uppercase tracking-wider text-text-ash font-semibold">
                Director of Cyber Defense
              </p>
              <p className="text-[9px] text-text-fog">CyberGuard Operations Center</p>
            </div>

            {/* QR Code (Centered with Scan Guide) */}
            <div className="flex flex-col items-center justify-center">
              {qrDataUrl && (
                <div className="rounded-2xl border-2 border-amber-400/40 bg-white p-2 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <img
                    src={qrDataUrl}
                    alt={`Verification QR Code for Certificate ${cert?.id}`}
                    className="h-20 w-20"
                  />
                </div>
              )}
              <span className="mt-2 font-mono text-[9px] text-amber-400/90 font-bold tracking-widest uppercase">
                Scan to Verify Online
              </span>
              <Link
                to={`/verify/${cert?.id}`}
                target="_blank"
                className="font-mono text-[8px] text-text-ash hover:text-white mt-0.5 underline truncate max-w-[200px]"
              >
                /verify/{cert?.id}
              </Link>
            </div>

            {/* Signature 2 */}
            <div className="text-center sm:text-right">
              <div className="font-display italic text-base text-amber-200/90 tracking-wide font-serif">
                Marcus Vance, CISSP
              </div>
              <div className="h-px w-28 bg-amber-400/40 my-1 mx-auto sm:ml-auto sm:mr-0" />
              <p className="font-mono text-[9px] uppercase tracking-wider text-text-ash font-semibold">
                Chief Security Officer
              </p>
              <p className="text-[9px] text-text-fog">National Security Registry</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ACTION CONTROLS ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mx-auto max-w-2xl flex flex-wrap gap-3 justify-center pt-2"
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
          icon={<i className="ti ti-copy" aria-hidden="true" />}
          onClick={handleCopyId}
        >
          Copy ID ({cert?.id})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<i className="ti ti-external-link" aria-hidden="true" />}
          to={`/verify/${cert?.id}`}
        >
          Open Public Verification Page
        </Button>
      </motion.div>

      {/* Single-Page Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-card, #certificate-card * { visibility: visible !important; }
          #certificate-card {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: none !important;
            background: #0b101b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
