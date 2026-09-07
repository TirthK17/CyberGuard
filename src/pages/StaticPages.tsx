import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="eyebrow text-frost-glow">Mission &amp; Architecture</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        Why We Built CyberGuard
      </h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-fog">
        <p>
          Over 90% of organizational cybersecurity compromises originate not from infrastructure zero-days,
          but from targeted human manipulation — clicking deceptive links, credential reuse, or falling for urgent social engineering lures.
        </p>
        <p>
          Traditional awareness programs fail because static annual slideshows don't build instinctual muscle memory.
          CyberGuard bridges the human-factor security gap through realistic simulation sandboxes, interactive threat telemetry,
          and continuous tactical training.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-2xl font-bold text-frost-glow">91%</div>
          <p className="mt-1 text-xs text-text-ash font-mono uppercase">Attacks start with phishing</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-2xl font-bold text-void-violet">100%</div>
          <p className="mt-1 text-xs text-text-ash font-mono uppercase">Zero-risk simulated environment</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-display text-2xl font-bold text-success">3.4x</div>
          <p className="mt-1 text-xs text-text-ash font-mono uppercase">Faster threat detection retention</p>
        </div>
      </div>

      <div className="mt-12">
        <Link to="/register">
          <Button variant="primary" size="lg">Join CyberGuard Free</Button>
        </Link>
      </div>
    </div>
  );
}

export function FeaturesPage() {
  const features = [
    { icon: "ti-book-2", title: "Defensive Curriculum", tag: "LEARN", text: "Comprehensive modules covering phishing, passphrases, MFA, malware, and MITM Wi-Fi attacks." },
    { icon: "ti-flask", title: "Simulation Sandboxes", tag: "PRACTICE", text: "Hands-on virtual scenarios reproducing deceptive emails, spoofed domains, and social engineering." },
    { icon: "ti-tools", title: "Security Toolkit", tag: "UTILITIES", text: "Live password entropy meters, phishing header analyzers, and personal cyber hygiene audits." },
    { icon: "ti-alert-octagon", title: "Incident Intake Station", tag: "RESPONSE", text: "Report suspicious lures directly to automated triage directives and earn defense XP." },
    { icon: "ti-radar", title: "Threat Radar & CVEs", tag: "INTEL", text: "Real-time threat feed tracking emerging zero-days, ransomware variants, and mobile smishing." },
    { icon: "ti-award", title: "Verified Credentials", tag: "ACCREDIT", text: "Cryptographically verified digital certificates and performance badges logged to your profile." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="eyebrow text-frost-glow">Complete Capabilities</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        The CyberGuard Defense Ecosystem
      </h1>
      <p className="mt-3 text-sm text-text-fog max-w-xl">
        Everything required to transform individuals and organizations from security liabilities into hardened human firewalls.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass rounded-2xl p-6 transition-[border-color,transform] duration-200 hover:border-glass-edge-strong hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-void-violet/30 bg-void-violet/15 text-frost-glow">
                <i className={`ti ${f.icon} text-lg`} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-ash">{f.tag}</span>
            </div>
            <h3 className="mt-5 font-display text-base font-semibold text-text-pure">{f.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-fog">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { TopicsPage } from "./TopicsPage";

export function HowItWorksPage() {
  const steps = [
    { step: "01", title: "Analyze & Learn", text: "Absorb interactive lesson blocks highlighting real vulnerabilities and attacker methods." },
    { step: "02", title: "Practice in Sandboxes", text: "Walk through safe, simulated incidents where mistakes carry zero operational risk." },
    { step: "03", title: "Verify via Scenario Quizzes", text: "Test rapid retention and decision-making on real-world incident simulations." },
    { step: "04", title: "Audit & Claim Certification", text: "Complete personal cyber hygiene audits, track XP on leaderboards, and claim digital certificates." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="eyebrow text-frost-glow">The CyberGuard Methodology</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        How CyberGuard Works
      </h1>

      <div className="mt-12 space-y-5">
        {steps.map((s) => (
          <div key={s.step} className="glass rounded-2xl p-6 flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-void-violet/30 bg-void-violet/15 font-mono text-sm font-bold text-frost-glow">
              {s.step}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-text-pure">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-text-fog">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <p className="eyebrow text-frost-glow text-center">Communications</p>
      <h1 className="gradient-heading mt-2 font-display text-3xl font-bold tracking-tight text-center">
        Get in Touch
      </h1>
      <p className="mt-2 text-xs text-text-fog text-center">
        Questions regarding enterprise deployments, academic research, or portal customization?
      </p>

      <div className="glass-modal mt-8 p-8">
        {sent ? (
          <div className="py-8 text-center space-y-3">
            <i className="ti ti-circle-check-filled text-4xl text-success" />
            <h3 className="font-display text-lg font-bold text-text-pure">Message Transmitted</h3>
            <p className="text-xs text-text-fog">A member of our defense team will contact you shortly.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon">Name</label>
              <input required placeholder="Alex Rivera" className="input" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon">Email Address</label>
              <input required type="email" placeholder="alex@organization.com" className="input" />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-text-moon">Message</label>
              <textarea required placeholder="How can we assist with your cybersecurity training project?" rows={4} className="input resize-none" />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3">
              Transmit Inquiry
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
