import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { celebrate } from "@/lib/celebrate";

interface PhishingMailSandboxProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "story_intro"
  | "email_inspect"
  | "fake_login"
  | "two_factor_steal"
  | "account_takeover"
  | "defense_triumph"
  | "what_is_phishing"
  | "final_score";

export function PhishingMailSandbox({ onComplete }: PhishingMailSandboxProps) {
  const navigate = useNavigate();

  // State machine
  const [act, setAct] = useState<Act>("story_intro");
  const [activeView, setActiveView] = useState<"split" | "victim" | "hacker">("split");
  const [inspectedSender, setInspectedSender] = useState(false);
  const [inspectedLink, setInspectedLink] = useState(false);
  const [showUrlBreakdown, setShowUrlBreakdown] = useState(false);
  const [fakeEmailInput, setFakeEmailInput] = useState("rahul.sharma@gmail.com");
  const [fakePasswordInput, setFakePasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [hasReported, setHasReported] = useState(false);
  const [scoreReported, setScoreReported] = useState(false);

  // Hacker Live Action Logs
  const getHackerLogs = () => {
    const logs = [
      "[*] Fake login website active on server",
      "[*] Registered lookalike domain: 'google-accounts-security.auth-portal.net'",
      "[*] Cloned genuine Google login design",
      "[*] Scam campaign: 'Urgent Account Warning'",
    ];

    if (act === "email_inspect") {
      logs.push(
        "[>] Phishing email delivered to victim inbox",
        "[>] Email opened: victim viewed message"
      );
    }

    if (inspectedSender || inspectedLink) {
      logs.push(
        "[!] ALERT: Victim is inspecting sender address and links! High vigilance detected."
      );
    }

    if (act === "fake_login") {
      logs.push(
        "[+] LINK CLICKED: Victim reached fake login page",
        `[CAPTURED] Account email: ${fakeEmailInput || "rahul.sharma@gmail.com"}`,
        fakePasswordInput
          ? `[CAPTURED] Password: ${"*".repeat(fakePasswordInput.length)} (${fakePasswordInput})`
          : "[WAITING] Waiting for user to enter password..."
      );
    }

    if (act === "two_factor_steal") {
      logs.push(
        "[★] PASSWORD STOLEN: Testing credentials on genuine service in background...",
        "[!] TWO-FACTOR PROMPT TRIGGERED: Prompting user for security code...",
        "[>] Displaying fake OTP screen to steal the code..."
      );
      if (otpInput) {
        logs.push(`[★] CODE CAPTURED: ${otpInput}`);
      }
    }

    if (act === "account_takeover") {
      logs.push(
        "[!] STOLEN CODE VALIDATED WITH REAL GOOGLE SERVER!",
        "[★] LOGIN SESSION HIJACKED: Attacker gained full account access",
        "[ALERT] ATTACKER LOGGED IN AS VICTIM!",
        "[*] Action: Changed recovery email & phone number",
        "[*] Action: Accessing private photos, files, & emails",
        "[*] Action: Sending fake emergency money requests to contacts"
      );
    }

    if (act === "defense_triumph") {
      logs.push(
        "[SAFE] PHISHING ATTEMPT BLOCKED!",
        "[SAFE] Victim reported fake link for removal",
        "[SAFE] Fake website flagged with red warning screen",
        "[SAFE] Zero passwords or data stolen. Attack failed!"
      );
    }

    return logs;
  };

  const handleReportPhishing = () => {
    setHasReported(true);
    setAct("defense_triumph");
    celebrate();
  };

  const handleOpenFakeLogin = () => {
    setAct("fake_login");
  };

  const handleSubmitFakePassword = () => {
    if (!fakePasswordInput) {
      setFakePasswordInput("P@ssw0rd2026!");
    }
    setAct("two_factor_steal");
  };

  const handleSubmitOtp = () => {
    if (!otpInput) {
      setOtpInput("849201");
    }
    setAct("account_takeover");
  };

  const calculateScore = () => {
    if (hasReported) {
      return inspectedSender && inspectedLink ? 100 : 90;
    }
    return 30;
  };

  const handleFinish = () => {
    const finalScore = calculateScore();
    if (!scoreReported) {
      setScoreReported(true);
      onComplete(finalScore, {
        action: "phishing_simulation_completed",
        score: finalScore,
        inspected_sender: inspectedSender,
        inspected_link: inspectedLink,
        reported_phishing: hasReported,
      });
    }
    setAct("final_score");
  };

  const handleReset = () => {
    setAct("story_intro");
    setInspectedSender(false);
    setInspectedLink(false);
    setShowUrlBreakdown(false);
    setFakePasswordInput("");
    setOtpInput("");
    setHasReported(false);
    setScoreReported(false);
  };

  const score = calculateScore();
  const hackerLogs = getHackerLogs();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── TOP MISSION HUD ── */}
      <div className="p-5 rounded-2xl bg-surface border border-primary/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
                Threat Sandbox: Spear-Phishing Drill
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-ash">
                Dual-Perspective Investigation
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-pure">
              The Midnight Alert: Anatomy of a Phishing Trap
            </h1>
            <p className="text-xs sm:text-sm text-text-fog mt-0.5">
              Experience a sophisticated spear-phishing attack. Watch both the victim&apos;s mailbox and the hacker&apos;s credential-harvesting terminal in real time!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="p-1 rounded-xl bg-surface-elevated border border-border flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveView("split")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "split" ? "bg-primary text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-columns mr-1" /> Dual Split Screen
              </button>
              <button
                onClick={() => setActiveView("victim")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "victim" ? "bg-primary text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-mail mr-1" /> Victim&apos;s Screen
              </button>
              <button
                onClick={() => setActiveView("hacker")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "hacker" ? "bg-danger text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-terminal mr-1" /> Hacker&apos;s C2
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-elevated border border-border text-text-fog hover:text-text-pure transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ti ti-rotate-clockwise" /> Reset Simulation
            </button>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border text-xs">
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "story_intro" || act === "email_inspect"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">ACT 1</span>
            The Urgent Hook
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "fake_login"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">ACT 2</span>
            Cloned Login Page
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "two_factor_steal" || act === "account_takeover"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">ACT 3</span>
            2FA Bypass &amp; Takeover
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "defense_triumph"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">ACT 4</span>
            Defense Triumph
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "what_is_phishing" || act === "final_score"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">ACT 5</span>
            Mastery &amp; Lessons
          </div>
        </div>
      </div>

      {/* ── CORE PLAYGROUND: VICTIM WEBMAIL VS HACKER C2 CONSOLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT: VICTIM'S COMPUTER / BROWSER INTERFACE ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "victim" ? "lg:col-span-12 max-w-2xl mx-auto" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-pure flex items-center gap-1.5">
              <i className="ti ti-device-laptop text-primary text-sm" />
              VICTIM&apos;S WORKSTATION (Your Browser)
            </span>
            <span className="text-[11px] text-text-ash font-mono">Friday &bull; 4:52 PM</span>
          </div>

          {/* Browser Window Chrome */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
            {/* Browser Top Tab & Address Bar */}
            <div className="bg-surface-elevated px-4 py-2.5 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-xs font-medium text-text-muted ml-2 flex items-center gap-1">
                    <i className="ti ti-mail text-primary" /> Webmail &bull; Inbox (1 Urgent)
                  </span>
                </div>
                <span className="text-[10px] text-text-muted font-mono">Chrome v124</span>
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-xl border border-border text-xs font-mono">
                <i className={`ti ${act === "fake_login" || act === "two_factor_steal" ? "ti-lock-open text-danger" : "ti-lock text-emerald-500"}`} />
                <span className="text-text-muted text-[11px]">https://</span>
                <span className={`font-bold ${act === "fake_login" || act === "two_factor_steal" ? "text-danger" : "text-text-high"}`}>
                  {act === "fake_login" || act === "two_factor_steal" || act === "account_takeover"
                    ? "google-accounts-security.auth-portal.net/signin"
                    : "mail.google.com/mail/u/0/#inbox"}
                </span>
                {act === "fake_login" && (
                  <span className="ml-auto text-[9px] bg-danger/10 text-danger px-1.5 py-0.5 rounded font-sans font-bold">
                    ⚠️ NOT GOOGLE.COM
                  </span>
                )}
              </div>
            </div>

            {/* SCREEN CONTENT AREA */}
            <div className="p-5 flex-1 bg-surface flex flex-col justify-between">
              <AnimatePresence mode="wait">

                {/* ── SCENE 1: THE URGENT PHISHING EMAIL INBOX ── */}
                {(act === "story_intro" || act === "email_inspect") && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Urgency Situation Banner */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2 text-text-high">
                      <i className="ti ti-clock-hour-4 text-amber-500 text-base shrink-0 mt-0.5" />
                      <div>
                        <strong>It&apos;s Friday, 4:52 PM.</strong> You are packing your backpack to leave. Suddenly your inbox dings with a terrifying high-priority alert!
                      </div>
                    </div>

                    {/* Email Card Container */}
                    <div className="p-4 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                      {/* Email Header Info */}
                      <div className="border-b border-border pb-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-black text-sm">
                              G
                            </div>
                            <div>
                              <div className="text-xs font-bold text-text-high">Google Workspace Security Team</div>
                              <div className="text-[11px] text-text-muted">To: rahul.sharma@gmail.com</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-text-muted">4:52 PM (Just now)</span>
                        </div>

                        {/* Subject */}
                        <div className="text-sm font-black text-red-500 flex items-center gap-1.5">
                          <i className="ti ti-alert-triangle" />
                          [CRITICAL ALERT] Unauthorized Login Attempt: Account Termination in 2 Hours!
                        </div>

                        {/* Inspection Controls */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => setInspectedSender(!inspectedSender)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                              inspectedSender
                                ? "bg-primary text-white border-primary"
                                : "bg-surface-elevated text-primary border-primary/30 hover:bg-primary/10"
                            }`}
                          >
                            <i className="ti ti-user-search" />
                            {inspectedSender ? "Sender Details Revealed" : "🔍 Inspect Sender Address"}
                          </button>

                          <button
                            onClick={() => {
                              setInspectedLink(true);
                              setShowUrlBreakdown(!showUrlBreakdown);
                            }}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                              showUrlBreakdown
                                ? "bg-primary text-white border-primary"
                                : "bg-surface-elevated text-primary border-primary/30 hover:bg-primary/10"
                            }`}
                          >
                            <i className="ti ti-link" />
                            {showUrlBreakdown ? "Hide URL Analysis" : "🔗 Hover / Inspect Link Destination"}
                          </button>
                        </div>

                        {/* Sender Forensic Reveal */}
                        {inspectedSender && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs space-y-1 font-mono"
                          >
                            <div className="text-[11px] text-red-400 font-bold">
                              DISPLAY NAME: &quot;Google Workspace Security&quot;
                            </div>
                            <div className="text-[11px] text-danger font-extrabold">
                              ACTUAL SENDER: support@google-security-verify.net
                            </div>
                            <div className="text-[10px] text-text-muted font-sans">
                              🚩 <strong>Red Flag:</strong> Notice the domain is <code>.net</code> with a hyphen, NOT <code>google.com</code>!
                            </div>
                          </motion.div>
                        )}

                        {/* Link Forensic Reveal */}
                        {showUrlBreakdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 font-mono"
                          >
                            <div className="text-[11px] text-amber-500 font-bold">
                              DISGUISED BUTTON TEXT: &quot;https://accounts.google.com/security&quot;
                            </div>
                            <div className="text-[11px] text-danger font-extrabold">
                              REAL DESTINATION: https://google-accounts-security.auth-portal.net/signin
                            </div>
                            <div className="text-[10px] text-text-muted font-sans">
                              🚩 <strong>The Subdomain Trick:</strong> Phishers put &quot;google-accounts&quot; in front, but the real owner domain is <code>auth-portal.net</code>!
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Email Body */}
                      <div className="text-xs text-text-low leading-relaxed space-y-2.5">
                        <p>Dear Rahul,</p>
                        <p>
                          Our automated security shield detected an unauthorized sign-in to your Google Account from:
                        </p>
                        <div className="p-2.5 rounded-xl bg-surface-elevated border border-border font-mono text-[11px] space-y-1">
                          <div>📍 Location: St. Petersburg, Russia</div>
                          <div>🖥️ IP Address: 185.220.101.4 (TOR Exit Node)</div>
                          <div>⏰ Time: Today, 4:51 PM</div>
                        </div>
                        <p className="text-red-500 font-semibold">
                          ⚠️ If this was not you, you MUST confirm your identity within 2 hours or your account, emails, and cloud files will be permanently locked!
                        </p>
                      </div>

                      {/* Call-to-Action Link */}
                      <div className="pt-2 text-center">
                        <button
                          onClick={handleOpenFakeLogin}
                          className="w-full py-3 px-4 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <i className="ti ti-shield-lock" />
                          Resolve Threat: Secure My Account Now &rarr;
                        </button>
                        <span className="text-[10px] text-text-muted mt-1 block">
                          (Clicking simulates what happens when an unsuspecting victim clicks the link)
                        </span>
                      </div>
                    </div>

                    {/* Bottom Defense Options */}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="primary"
                        onClick={handleReportPhishing}
                        className="flex-1 text-xs py-2 bg-emerald-600 hover:bg-emerald-500"
                      >
                        <i className="ti ti-flag mr-1" /> 🚨 Report Phishing to SOC / Google
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 2: THE CLONED FAKE LOGIN PAGE (CREDENTIAL HARVESTING) ── */}
                {act === "fake_login" && (
                  <motion.div
                    key="fake_login"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-sm mx-auto text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-black text-base mx-auto">
                      G
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-high">Sign in with Google</h2>
                      <p className="text-xs text-text-muted mt-0.5">to continue to Account Security Verification</p>
                    </div>

                    {/* Cloned Form */}
                    <div className="p-4 rounded-2xl bg-surface-elevated border border-border text-left space-y-3 shadow-md">
                      <div>
                        <label className="text-[11px] text-text-muted block mb-1">Email or phone</label>
                        <input
                          type="text"
                          value={fakeEmailInput}
                          onChange={(e) => setFakeEmailInput(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-xs text-text-high font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-text-muted block mb-1">Enter your password</label>
                        <input
                          type="password"
                          placeholder="Type password..."
                          value={fakePasswordInput}
                          onChange={(e) => setFakePasswordInput(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg bg-surface border border-danger text-xs text-text-high font-mono"
                        />
                      </div>

                      <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-[10px] text-danger">
                        👀 <strong>Watch the Hacker Terminal on the right!</strong> Every key you type is streamed directly to the attacker&apos;s logger.
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleSubmitFakePassword}
                        className="w-full text-xs font-bold py-2 bg-blue-600 hover:bg-blue-500"
                      >
                        Next &rarr;
                      </Button>
                    </div>

                    <div className="text-[10px] text-text-muted">
                      Look closely at the browser address bar above: It is NOT accounts.google.com!
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 3: THE 2FA OTP STEAL ── */}
                {act === "two_factor_steal" && (
                  <motion.div
                    key="two_factor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-sm mx-auto text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-xl mx-auto">
                      <i className="ti ti-device-mobile-message" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-high">2-Step Verification</h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        Google sent an SMS with a 6-digit code to &bull;&bull;&bull;&bull; 9201
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated border border-border text-left space-y-3 shadow-md">
                      <div>
                        <label className="text-[11px] text-text-muted block mb-1">Enter 6-digit code (G - xxxxxx)</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="849201"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-surface border border-danger text-center text-lg font-mono font-bold tracking-widest text-text-high"
                        />
                      </div>

                      <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 text-[10px] text-danger leading-relaxed">
                        ⚠️ <strong>The 2FA Trap:</strong> The fake page relays this OTP to the REAL Google in real time, generates an authorized session cookie, and takes over your account!
                      </div>

                      <Button
                        variant="primary"
                        onClick={handleSubmitOtp}
                        className="w-full text-xs font-bold py-2 bg-blue-600 hover:bg-blue-500"
                      >
                        Verify &amp; Restore Account &rarr;
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 4: COMPLETE ACCOUNT TAKEOVER ── */}
                {act === "account_takeover" && (
                  <motion.div
                    key="takeover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-center pt-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-500 mx-auto flex items-center justify-center text-3xl animate-pulse">
                      <i className="ti ti-user-x" />
                    </div>
                    <h2 className="text-base font-bold text-danger">ACCOUNT HIJACKED!</h2>
                    
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-left text-xs space-y-2 text-text-high">
                      <p className="font-bold text-red-400">
                        What just happened to your account:
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-text-low space-y-1">
                        <li>The phisher stolen both your password AND your live 2FA session token.</li>
                        <li>They changed your recovery phone and recovery email. You are now permanently locked out.</li>
                        <li>They downloaded your personal emails, tax docs, and cloud photos.</li>
                        <li>They started sending phishing links to your entire college / office contact list!</li>
                      </ul>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("what_is_phishing")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Why Did This Work &amp; How to Stop It? &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── SCENE 5: DEFENSE TRIUMPH (USER REPORTED PHISHING) ── */}
                {act === "defense_triumph" && (
                  <motion.div
                    key="triumph"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-center pt-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 mx-auto flex items-center justify-center text-3xl">
                      <i className="ti ti-shield-check" />
                    </div>
                    <h2 className="text-base font-bold text-emerald-500">PHISHING ATTEMPT CRUSHED!</h2>

                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left text-xs space-y-2 text-text-high">
                      <p className="font-bold text-emerald-400">
                        🛡️ Outstanding Reflexes!
                      </p>
                      <p className="text-[11px] leading-relaxed text-text-low">
                        You didn&apos;t panic from the 2-hour deadline. You inspected the sender (<code>.net</code> instead of <code>google.com</code>) and reported the domain.
                      </p>
                      <div className="p-2.5 rounded-xl bg-surface-elevated border border-emerald-500/20 text-[11px] text-text-pure">
                        <strong>Global Impact:</strong> Your report flagged the attacker&apos;s domain in Google SafeBrowsing, protecting thousands of other potential victims worldwide!
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("what_is_phishing")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Learn the 4 Red Flags of Phishing &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── SCENE 6 & 7: FORENSIC MODE ── */}
                {(act === "what_is_phishing" || act === "final_score") && (
                  <motion.div
                    key="forensics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-3xl">
                      <i className="ti ti-shield-star" />
                    </div>
                    <div className="text-sm font-bold text-text-high">Investigation Debrief</div>
                    <p className="text-xs text-text-low max-w-[240px]">
                      Check the right panel for the complete forensic analysis and your final score!
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span>Security Status: {hasReported ? "PROTECTED" : "SUSPICIOUS THREAT"}</span>
              <span>TLS 1.3 / AES-256</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: HACKER'S C2 DASHBOARD & ATTACK VISUALIZATION ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "hacker" ? "lg:col-span-12" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-danger flex items-center gap-1.5 font-mono">
              <i className="ti ti-terminal-2 text-danger text-base animate-pulse" />
              ATTACKER&apos;S C2 DASHBOARD (Evilginx Live Sniffer)
            </span>
            <span className="text-[11px] font-mono text-text-muted">Target: rahul.sharma</span>
          </div>

          {/* Attacker Terminal */}
          <div className="rounded-2xl border-2 border-danger/40 bg-zinc-950 shadow-2xl overflow-hidden text-xs font-mono">
            {/* Terminal Title Bar */}
            <div className="bg-zinc-900 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] text-zinc-400 ml-2">root@c2-phish-ops:~# evilginx2</span>
              </div>
              <span className="text-[10px] text-danger font-bold uppercase tracking-wider">
                {hasReported ? "SERVER BLACKLISTED" : "LISTENING (PORT 443)"}
              </span>
            </div>

            {/* Terminal Logs */}
            <div className="p-4 space-y-2 h-[260px] overflow-y-auto bg-black/90 text-[11px] leading-relaxed scrollbar-thin">
              {hackerLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("CRITICAL") || log.includes("$$$")
                      ? "text-red-400 font-extrabold bg-red-950/40 p-1 rounded"
                      : log.includes("BLOCKED")
                      ? "text-emerald-400 font-bold"
                      : log.includes("KEYLOGGER") || log.includes("CAPTURED")
                      ? "text-amber-300 font-bold"
                      : "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Telemetry Footer */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-zinc-500 block">SPOOFED DOMAIN:</span>
                <span className="text-amber-400 font-bold">auth-portal.net</span>
              </div>
              <div>
                <span className="text-zinc-500 block">HARVESTED TOKENS:</span>
                <span className="text-zinc-300">{act === "account_takeover" ? "SID, HSID, 2FA_OTP" : "None"}</span>
              </div>
            </div>
          </div>

          {/* ── EDUCATIONAL DEBRIEF: WHAT CAN PHISHING DO? ── */}
          {act === "what_is_phishing" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/30 bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <i className="ti ti-bulb text-lg" />
                WHAT IS PHISHING &amp; WHAT CAN IT ACTUALLY DO?
              </div>

              <div className="text-xs text-text-low leading-relaxed space-y-3">
                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">1. What is Phishing?</strong>
                  <p className="text-[11px]">
                    Phishing is social engineering where an attacker impersonates a trusted entity (Google, your bank, your boss) to manipulate you into handing over sensitive passwords, OTPs, or money.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">2. The Psychological Weapon: Artificial Urgency</strong>
                  <p className="text-[11px]">
                    Notice how the email demanded action within <strong>2 hours</strong>. Criminals intentionally create panic so your rational brain turns off and you click without inspecting!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">3. Even 2FA Can Be Bypassed (Adversary-in-the-Middle)</strong>
                  <p className="text-[11px]">
                    As you saw, modern phishing tools don&apos;t just steal passwords—they relay OTPs in real time to steal your authenticated session cookie.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleFinish}
                className="w-full text-xs font-bold py-2.5"
              >
                Claim Score &amp; Anti-Phishing Rules &rarr;
              </Button>
            </motion.div>
          )}

          {/* ── FINAL SCORECARD & SURVIVAL RULES ── */}
          {act === "final_score" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-primary/30 bg-surface p-6 shadow-md space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-3xl text-primary">
                  <i className={`ti ${score >= 70 ? "ti-shield-check" : "ti-alert-triangle"}`} />
                </div>
                <h2 className="text-xl font-bold text-text-high">PHISHING DEFENSE COMPLETE</h2>
                <div className="text-4xl font-black text-primary font-mono">
                  Score: {score}/100
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <Pill tone="primary" size="md">+{score} XP Earned</Pill>
                  <Pill tone={score >= 70 ? "emerald" : "danger"} size="md">
                    {score >= 70 ? "🛡️ Phishing Reflex: EXCELLENT" : "⚠️ Compromised: Needs Practice"}
                  </Pill>
                </div>
              </div>

              {/* Actionable Rules */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-bold text-text-high">
                  🛡️ 4 Golden Rules to Never Get Phished:
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-text-low">
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">1. Never Click Email Links:</strong>
                    If you get an account alert, open a new tab and type <code>google.com</code> manually.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">2. Check the Root Domain:</strong>
                    Look before the last slash: <code>google.com</code> is safe, but <code>google.auth-portal.net</code> belongs to the attacker!
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">3. Urgency = Red Flag:</strong>
                    Any email demanding action in &quot;2 hours&quot; or &quot;immediate account deletion&quot; is 99% a scam.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">4. Use Passkeys &amp; Security Keys:</strong>
                    FIDO2 Passkeys cannot be phished because your browser verifies the real domain cryptographically!
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button variant="secondary" onClick={handleReset} className="flex-1 text-xs">
                  <i className="ti ti-rotate-clockwise mr-1.5" /> Replay Scenario
                </Button>
                <Button variant="primary" onClick={() => navigate("/simulations")} className="flex-1 text-xs">
                  More Threat Sandboxes <i className="ti ti-arrow-right ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
