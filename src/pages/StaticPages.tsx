import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { contactApi, type ContactCategory, type ContactUrgency, type ContactMessage } from "@/lib/api/contact";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="eyebrow text-frost-glow">Our Purpose & Story</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        Why We Built CyberGuard
      </h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-fog">
        <p>
          Over 90% of online security issues happen not through complicated computer hacks,
          but by tricking everyday people — like clicking deceptive links, reusing weak passwords, or falling for urgent scam messages.
        </p>
        <p>
          Traditional training often fails because long, boring slideshows don't build real-world confidence.
          CyberGuard helps you build practical digital safety habits through realistic interactive practice,
          simple tools, and bite-sized lessons.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="font-display text-3xl font-bold text-frost-glow">91%</div>
          <p className="mt-2 text-xs sm:text-sm text-text-fog font-medium">Scams start with fake emails or texts</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="font-display text-3xl font-bold text-void-violet">100%</div>
          <p className="mt-2 text-xs sm:text-sm text-text-fog font-medium">Safe practice environment</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="font-display text-3xl font-bold text-success">3.4x</div>
          <p className="mt-2 text-xs sm:text-sm text-text-fog font-medium">Better memory with hands-on practice</p>
        </div>
      </div>

      <div className="mt-12">
        <Button to="/register" variant="primary" size="lg">Get Started with CyberGuard</Button>
      </div>
    </div>
  );
}

export function FeaturesPage() {
  const features = [
    { icon: "ti-book-2", title: "Easy Lessons", tag: "LEARN", text: "Step-by-step guides covering phishing, strong passwords, two-factor login, suspicious downloads, and safe public Wi-Fi." },
    { icon: "ti-flask", title: "Interactive Scenarios", tag: "PRACTICE", text: "Safe hands-on simulations where you can inspect fake emails, scam text messages, and fake payment sites without any danger." },
    { icon: "ti-tools", title: "Safety Tools", tag: "TOOLS", text: "Test your password strength, inspect suspicious links, check Wi-Fi safety, and run a quick security checklist." },
    { icon: "ti-alert-octagon", title: "Report a Scam", tag: "SUPPORT", text: "Get immediate help, emergency phone numbers, and step-by-step recovery steps if you think you've been targeted." },
    { icon: "ti-radar", title: "Recent Scam Alerts", tag: "ALERTS", text: "Stay informed about the latest fake apps, banking scams, and text fraud currently circulating." },
    { icon: "ti-award", title: "Certificates & Badges", tag: "ACHIEVE", text: "Earn verified completion certificates and achievement badges as you complete lessons and build cyber safety skills." },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="eyebrow text-frost-glow">Explore Features</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        Everything You Need to Stay Safe
      </h1>
      <p className="mt-3 text-base text-text-fog max-w-xl leading-relaxed">
        Simple lessons, hands-on practice, and safety tools to protect your accounts and personal data.
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
              <span className="text-xs font-semibold uppercase tracking-wider text-text-ash">{f.tag}</span>
            </div>
            <h3 className="mt-5 font-display text-base sm:text-lg font-bold text-text-pure">{f.title}</h3>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-text-fog">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { TopicsPage } from "./TopicsPage";

export function HowItWorksPage() {
  const steps = [
    { step: "01", title: "Learn the Basics", text: "Read short, easy-to-understand lessons explaining common scams and how to spot red flags." },
    { step: "02", title: "Practice in Safe Sandboxes", text: "Walk through realistic fake emails and scam messages in a completely safe, zero-risk environment." },
    { step: "03", title: "Check Your Knowledge", text: "Take quick quizzes based on everyday real-world scenarios to test your understanding and build confidence." },
    { step: "04", title: "Use Tools & Earn Your Certificate", text: "Test your passwords, run personal safety checks, and download your official CyberGuard certificate." },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="eyebrow text-frost-glow">Simple 4-Step Process</p>
      <h1 className="gradient-heading mt-2 font-display text-4xl font-bold tracking-tight">
        How CyberGuard Works
      </h1>

      <div className="mt-12 space-y-5">
        {steps.map((s) => (
          <div key={s.step} className="glass rounded-2xl p-6 flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-void-violet/30 bg-void-violet/15 text-base font-bold text-frost-glow">
              {s.step}
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-fog">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const { user, profile } = useAuth();
  const [category, setCategory] = useState<ContactCategory>("suggestion");
  const [urgency, setUrgency] = useState<ContactUrgency>("medium");
  const [name, setName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Please complete all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await contactApi.submitMessage({
        name,
        email,
        category,
        urgency,
        subject,
        message,
        userId: user?.id,
      });
      setSubmittedTicket(ticket);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to dispatch message";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setSubject("");
    setMessage("");
    setError(null);
  };

  const categories: { id: ContactCategory; label: string; icon: string; desc: string }[] = [
    { id: "suggestion", label: "Suggestion / Idea", icon: "ti-bulb", desc: "Feature request or curriculum suggestion" },
    { id: "bug", label: "Bug Report", icon: "ti-bug", desc: "Found an error, broken drill, or UI glitch" },
    { id: "vulnerability", label: "Threat / Flaw", icon: "ti-shield-alert", desc: "Report scam pattern or security vulnerability" },
    { id: "inquiry", label: "General Inquiry", icon: "ti-message-circle", desc: "Questions, partnerships, or team training" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <i className="ti ti-headset" />
          Community Operations & Bug Desk
        </span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-text-pure">
          Send Feedback & Bug Reports
        </h1>
        <p className="mt-2 text-sm text-text-fog max-w-lg mx-auto leading-relaxed">
          Found a bug or have a suggestion to make Kavach even better? Send it directly to our administration desk.
        </p>
      </div>

      <div className="macos-window mt-8 p-0 shadow-2xl border border-border">
        {/* Window Titlebar */}
        <div className="macos-titlebar px-4 py-2.5">
          <div className="macos-traffic-lights">
            <span className="macos-dot macos-dot-close" />
            <span className="macos-dot macos-dot-minimize" />
            <span className="macos-dot macos-dot-expand" />
          </div>
          <span className="text-[11px] font-medium text-text-ash">
            kavach-dispatch://contact-support
          </span>
          <div className="w-10" />
        </div>

        <div className="p-6 sm:p-8">
          {submittedTicket ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div className="h-16 w-16 mx-auto rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success text-3xl">
                <i className="ti ti-check" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-surface-elevated border border-border text-primary">
                  {submittedTicket.id}
                </span>
                <h3 className="font-display text-xl font-bold text-text-pure mt-3">
                  Report Received Successfully!
                </h3>
                <p className="text-xs text-text-fog mt-1 max-w-md mx-auto leading-relaxed">
                  Your message has been encrypted and securely delivered to the CyberGuard Security Administration team.
                  Only authorized admins have clearance to inspect and triage these submissions.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface-elevated p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between text-text-fog">
                  <span>Category:</span>
                  <span className="font-semibold text-text-pure capitalize">{submittedTicket.category}</span>
                </div>
                <div className="flex justify-between text-text-fog">
                  <span>Priority:</span>
                  <span className="font-semibold text-text-pure capitalize">{submittedTicket.urgency}</span>
                </div>
                <div className="flex justify-between text-text-fog">
                  <span>Subject:</span>
                  <span className="font-semibold text-text-pure truncate max-w-[200px]">{submittedTicket.subject}</span>
                </div>
                <div className="flex justify-between text-text-fog">
                  <span>Status:</span>
                  <span className="font-semibold text-amber-500 uppercase tracking-wide text-[10px]">Under Admin Review</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="secondary" onClick={handleReset} className="text-xs cursor-pointer">
                  Send Another Submission
                </Button>
              </div>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2">
                  <i className="ti ti-alert-triangle text-sm" />
                  <span>{error}</span>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-text-pure">
                  What would you like to submit?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        category === c.id
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-surface-elevated text-text-fog hover:text-text-pure hover:border-border/80"
                      }`}
                    >
                      <i className={`ti ${c.icon} text-lg mb-1`} />
                      <span className="text-[11px] font-semibold leading-tight">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority / Urgency */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-pure">
                  Priority / Impact Level
                </label>
                <div className="flex items-center gap-2">
                  {(["low", "medium", "high", "critical"] as ContactUrgency[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        urgency === level
                          ? level === "critical"
                            ? "bg-danger/20 border-danger text-danger"
                            : level === "high"
                            ? "bg-amber-500/20 border-amber-500 text-amber-500"
                            : "bg-primary/20 border-primary text-primary"
                          : "bg-surface-elevated border-border text-text-fog hover:text-text-pure"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-pure" htmlFor="contact-name">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text-pure" htmlFor="contact-email">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-pure" htmlFor="contact-subject">
                  Subject / Summary
                </label>
                <input
                  id="contact-subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    category === "bug"
                      ? "e.g. Button unresponsive in phishing simulation drill"
                      : category === "suggestion"
                      ? "e.g. Suggestion to add WhatsApp voice scam simulation"
                      : category === "vulnerability"
                      ? "e.g. Discovered fake recharge scam circulating on SMS"
                      : "e.g. Question about team training certification"
                  }
                  className="input w-full"
                />
              </div>

              {/* Details Message */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-text-pure" htmlFor="contact-message">
                  {category === "bug" ? "Steps to Reproduce & Details" : "Detailed Message"}
                </label>
                <textarea
                  id="contact-message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === "bug"
                      ? "Please describe what happened, what you expected, and your device or browser..."
                      : "Share full details, suggestions, or links..."
                  }
                  rows={4}
                  className="input w-full resize-none"
                />
              </div>

              <div className="rounded-lg bg-surface-elevated border border-border p-3 text-[11px] text-text-fog flex items-center gap-2">
                <i className="ti ti-lock text-sm text-primary" />
                <span>
                  <strong>Admin Privacy Guaranteed:</strong> Only verified CyberGuard Administrators have access to review and resolve contact submissions.
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                loading={submitting}
              >
                <i className="ti ti-send text-sm" />
                Submit to Admin Desk
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
