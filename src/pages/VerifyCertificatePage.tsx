import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface CertRecord {
  id: string;
  user_id: string;
  full_name: string;
  score: number;
  issued_at: string;
}

export function VerifyCertificatePage() {
  const { certId } = useParams<{ certId: string }>();
  const [cert, setCert] = useState<CertRecord | null>(null);
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
      .then(({ data }) => {
        if (data) {
          setCert(data as CertRecord);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas px-6 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 flex items-center gap-2"
      >
        <i className="ti ti-shield-check text-2xl text-primary" aria-hidden="true" />
        <span className="font-display text-xl font-bold text-text-pure">CyberGuard</span>
        <span className="text-text-fog text-sm">· Certificate Verification</span>
      </motion.div>

      {status === "loading" && (
        <div className="flex items-center gap-3 text-text-fog">
          <div
            className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent"
            aria-label="Verifying certificate…"
          />
          <span>Verifying certificate…</span>
        </div>
      )}

      {status === "valid" && cert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          {/* Valid banner */}
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-5 py-4 mb-6">
            <i className="ti ti-circle-check-filled text-2xl text-success flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-success">Certificate Valid</p>
              <p className="text-xs text-text-fog mt-0.5">This certificate was issued by CyberGuard and is on record.</p>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <Row label="Certificate ID" value={cert.id} mono />
            <Row label="Holder" value={cert.full_name} />
            <Row label="Score" value={`${cert.score}%`} />
            <Row label="Issued On" value={formattedDate} />
          </div>

          <p className="mt-4 text-center text-xs text-text-fog">
            This certificate was issued for successful completion of the CyberGuard Cyber Safety Assessment.
          </p>
        </motion.div>
      )}

      {status === "not_found" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg text-center"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 mb-6 justify-center">
            <i className="ti ti-circle-x-filled text-2xl text-danger flex-shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="text-sm font-bold text-danger">Certificate Not Found</p>
              <p className="text-xs text-text-fog mt-0.5">
                No certificate with ID <span className="font-mono text-text-pure">{certId ?? "—"}</span> was found in our records.
              </p>
            </div>
          </div>
          <p className="text-xs text-text-fog">
            This may mean the ID is incorrect, or the certificate was issued on a different device (certificates are stored locally in demo mode).
          </p>
        </motion.div>
      )}

      <Link
        to="/"
        className="mt-10 text-xs text-primary hover:underline"
      >
        ← Back to CyberGuard
      </Link>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-text-ash flex-shrink-0 w-28">{label}</span>
      <span className={`text-xs text-text-pure text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
