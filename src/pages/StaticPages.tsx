import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

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
        <Link to="/register">
          <Button variant="primary" size="lg">Get Started with CyberGuard</Button>
        </Link>
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
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <p className="eyebrow text-frost-glow text-center">Contact Us</p>
      <h1 className="gradient-heading mt-2 font-display text-3xl font-bold tracking-tight text-center">
        Get in Touch
      </h1>
      <p className="mt-2 text-sm text-text-fog text-center leading-relaxed">
        Have a question, feedback, or need help with CyberGuard? We'd love to hear from you.
      </p>

      <div className="glass-modal mt-8 p-8">
        {sent ? (
          <div className="py-8 text-center space-y-3">
            <i className="ti ti-circle-check-filled text-4xl text-success" />
            <h3 className="font-display text-lg font-bold text-text-pure">Message Sent!</h3>
            <p className="text-sm text-text-fog">Thanks for reaching out. We will get back to you as soon as possible.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">Your Name</label>
              <input required placeholder="Alex Rivera" className="input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">Email Address</label>
              <input required type="email" placeholder="alex@example.com" className="input" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs sm:text-sm font-semibold text-text-moon">Your Message</label>
              <textarea required placeholder="How can we help you or your team stay safe online?" rows={4} className="input resize-none" />
            </div>
            <Button type="submit" variant="primary" className="w-full py-3 text-base">
              Send Message
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
