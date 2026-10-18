import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { CyberGuardLogoMark } from "@/components/ui/CyberGuardLogo";

export function CertificatePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const eligible = (profile?.awareness_score ?? 0) >= 61;
  const score = profile?.awareness_score ?? 0;
  const certId = `CG-${profile?.id?.slice(0, 8).toUpperCase() ?? "XXXXXXXX"}`;
  const issueDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
            Pass the Cyber Safety Test to earn your official certificate.
          </p>
        </motion.div>
        <EmptyState
          title="Certificate not yet unlocked"
          description="Score at least 61 on the Cyber Safety Test to earn your official CyberGuard Certificate."
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
            {profile?.full_name}
          </p>

          <p className="mt-3 max-w-md mx-auto text-xs leading-relaxed text-text-fog">
            for successfully demonstrating practical knowledge in spotting online scams,
            protecting accounts and passwords, and practicing safe digital habits.
          </p>

          {/* Telemetry Row */}
          <div className="relative mt-8 flex justify-center gap-8 border-t border-glass-edge pt-6">
            <div className="text-center">
              <div className="font-display text-2xl font-bold text-frost-glow">{score}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Safety Score</div>
            </div>
            <div className="h-10 w-px self-center bg-glass-edge" />
            <div className="text-center">
              <div className="font-mono text-sm font-semibold text-text-pure">{issueDate}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Issued On</div>
            </div>
            <div className="h-10 w-px self-center bg-glass-edge" />
            <div className="text-center">
              <div className="font-mono text-sm font-semibold text-void-violet">{certId}</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-text-ash">Certificate ID</div>
            </div>
          </div>

          <p className="mt-6 font-mono text-[9px] text-text-ash uppercase tracking-widest">
            Issued &amp; verified by CyberGuard
          </p>
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
          icon={<i className="ti ti-download" />}
          onClick={() => window.print()}
        >
          Download / Print
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<i className="ti ti-share" />}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "My CyberGuard Certificate", text: `I earned a Cybersecurity Awareness Certificate! Score: ${score}/100` });
            } else {
              navigator.clipboard.writeText(`Certificate ID: ${certId}`);
            }
          }}
        >
          Share Credential
        </Button>
      </motion.div>
    </div>
  );
}
