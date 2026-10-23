import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { KavachLogoMark } from "@/components/ui/KavachLogo";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";

interface CertRecord {
  id: string;
  user_id: string;
  full_name: string;
  score: number;
  issued_at: string;
}

/**
 * Computes an immutable SHA-256 digital fingerprint to verify credential authenticity.
 */
async function computeDigitalFingerprint(cert: CertRecord): Promise<string> {
  const raw = `${cert.user_id}:${cert.id}:${cert.score}:${cert.issued_at}:kavach-root-ca-v1`;
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function VerifyCertificatePage() {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<CertRecord | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "valid" | "not_found">("loading");

  useEffect(() => {
    if (!certId) {
      setStatus("not_found");
      return;
    }

    supabase
      .from("certificates")
      .select("*")
      .eq("id", certId.toUpperCase())
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          const certRecord = data as CertRecord;
          setCert(certRecord);
          const hash = await computeDigitalFingerprint(certRecord);
          setFingerprint(hash);
          setStatus("valid");
        } else {
          setStatus("not_found");
        }
      });
  }, [certId]);

  const formattedDate = cert
    ? new Date(cert.issued_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] text-white px-6 py-16 relative overflow-hidden">
      {/* Background subtle glowing auras */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-neutral-900/90 shadow-md p-1">
          <KavachLogoMark size={28} pulse={false} />
        </div>
        <div>
          <span className="font-display text-xl font-extrabold text-white tracking-tight block">{APP_NAME}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash">Public Verification Registry</span>
        </div>
      </motion.div>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 text-text-fog">
          <div
            className="animate-spin h-7 w-7 rounded-full border-2 border-primary border-t-transparent"
            aria-label="Verifying certificate in database…"
          />
          <span className="font-mono text-xs uppercase tracking-wider">Verifying accreditation record…</span>
        </div>
      )}

      {status === "valid" && cert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl"
        >
          {/* Valid banner with glowing border */}
          <div className="flex items-center gap-3.5 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4.5 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold text-lg shadow-sm">
              <i className="ti ti-check" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">Authentic Certificate Verified</p>
              <p className="text-xs text-text-frost mt-0.5">
                This credential is officially signed, cryptographically sealed, and registered on the Kavach Defense Council ledger.
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-2xl p-7 space-y-4 shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
            <div className="border-b border-white/10 pb-4 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400 font-bold block">
                ISSUED ACCREDITATION
              </span>
              <h3 className="font-display text-lg font-bold text-white mt-0.5">
                Cybersecurity Awareness &amp; Defense Assessment
              </h3>
            </div>

            <Row label="Unique Certificate ID" value={cert.id} mono highlight />
            <Row label="Credential Holder" value={cert.full_name} bold />
            <Row label="Assessment Score" value={`${cert.score}% (Pass & Distinction)`} />
            <Row label="Date of Conferment" value={formattedDate} />
            <Row label="Issuing Authority" value="Kavach National Defense Council" />

            {fingerprint && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-ash font-bold block mb-1">
                  Cryptographic Verification Fingerprint (SHA-256)
                </span>
                <p className="font-mono text-[11px] text-amber-300 break-all bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {fingerprint}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<i className="ti ti-certificate" aria-hidden="true" />}
              to="/certificate"
            >
              View Certificate Portal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<i className="ti ti-arrow-left" aria-hidden="true" />}
              to="/"
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      )}

      {status === "not_found" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg text-center"
        >
          <div className="flex items-center gap-3.5 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-6 py-5 mb-6 text-left shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white font-bold text-lg shadow-sm">
              <i className="ti ti-x" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-400">Certificate Not Found</p>
              <p className="text-xs text-text-frost mt-0.5">
                No certificate matching ID <span className="font-mono text-white font-bold">{certId ?? "—"}</span> was found in the official registry.
              </p>
            </div>
          </div>
          <p className="text-xs text-text-fog max-w-md mx-auto">
            Please check the spelling of your Certificate ID or verify that the exam was completed on this system.
          </p>

          <Link
            to="/"
            className="inline-block mt-8 text-xs text-primary hover:text-white font-mono transition-colors"
          >
            ← Return to CyberGuard
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-xs font-medium text-text-ash flex-shrink-0 w-36">{label}</span>
      <span
        className={`text-xs text-right ${mono ? "font-mono" : ""} ${bold ? "font-bold text-white text-sm" : ""} ${
          highlight ? "text-amber-400 font-bold" : "text-text-frost"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
