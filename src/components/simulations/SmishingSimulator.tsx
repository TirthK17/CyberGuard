import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { celebrate } from "@/lib/celebrate";
import { AttackerTerminal, ScoreCard } from "./shared";

interface SmishingSimulatorProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "sms_arrives"
  | "inspect_sms"
  | "fake_portal"
  | "otp_trick"
  | "money_drained"
  | "fraud_blocked"
  | "fake_helpline"
  | "helpline_disconnected"
  | "how_smishing_works"
  | "final_score";

export function SmishingSimulator({ onComplete }: SmishingSimulatorProps) {

  // State machine
  const [act, setAct] = useState<Act>("sms_arrives");
  const [activeView, setActiveView] = useState<"split" | "phone" | "scammer">("split");
  const [inspectedSender, setInspectedSender] = useState(false);
  const [inspectedLink, setInspectedLink] = useState(false);
  const [fakeCustId, setFakeCustId] = useState("98410294");
  const [fakePin, setFakePin] = useState("");
  const [fakeOtp, setFakeOtp] = useState("");
  const [credError, setCredError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [userChoice, setUserChoice] = useState<"block" | "pay" | "call" | null>(null);
  const [scoreReported, setScoreReported] = useState(false);

  // Scammer Syndicate Dashboard Logs
  const getScammerLogs = () => {
    const logs = [
      "[Scammer System] Automated message sent to target phone",
      "[Fake Sender] Showing 'HDFC Bank' to look authentic",
      "[Scammer Lure] Threatening sudden unauthorized charge of ₹48,999 to induce panic",
    ];

    if (act === "inspect_sms") {
      logs.push(
        "[Status] Fake text delivered to your phone",
        "[Scammer Goal] Trying to rush you so you click before checking"
      );
    }

    if (inspectedSender || inspectedLink) {
      logs.push(
        "[Alert] You are inspecting the link and sender details! Scammer is getting worried."
      );
    }

    if (act === "fake_portal") {
      logs.push(
        "[Bait Taken] You opened the fake website 'hdfc-fraud-cancel.secure-portal.net'",
        `[Data Captured] Customer ID: ${fakeCustId || "98410294"}`,
        fakePin
          ? `[Password Stolen] PIN/Password captured: ${"*".repeat(fakePin.length)}`
          : "[Waiting] Awaiting victim PIN or password..."
      );
    }

    if (act === "otp_trick") {
      logs.push(
        "[Credentials Stolen] Scammer is now logging into genuine bank with your password!",
        "[Scammer Transfer] Scammer initiates ₹48,999 transfer from your real account",
        "[Real Bank OTP] Bank generates a real security OTP and sends it to your phone",
        "[The Deception] Fake website lies and tells you to type the OTP to 'CANCEL' the transaction"
      );
      if (fakeOtp) {
        logs.push(`[Live Capture] OTP captured: ${fakeOtp}`);
      }
    }

    if (act === "money_drained") {
      logs.push(
        "[Trap Succeeded] You entered the OTP: 841920",
        "[Transfer Completed] ₹48,999 debited from account and transferred away",
        "[Result] Scammer got the money. Real banks cannot instantly reverse this once OTP is shared."
      );
    }

    if (act === "fraud_blocked") {
      logs.push(
        "[Scam Blocked!] You stopped and read the real OTP text: 'Debit of ₹48,999'",
        "[Safe Action] You contacted the real bank using the number on your card",
        "[Protection] Card frozen and fake link reported",
        "[Result] ZERO MONEY LOST! You beat the scammer."
      );
    }

    if (act === "fake_helpline") {
      logs.push(
        "[Call Trapped] You called the fake phone number from the message",
        "[Fake Operator] Scammer answered pretending to be bank customer support",
        "[Social Trick] Scammer is talking politely to convince you to read out your OTP"
      );
    }

    if (act === "helpline_disconnected") {
      logs.push(
        "[Target Escaped] Victim disconnected the call before giving OTP! No money stolen, but target dialled our number."
      );
    }

    return logs;
  };

  const handleOpenFakePortal = () => {
    setAct("fake_portal");
  };

  const handleSubmitCredentials = () => {
    if (!fakePin.trim()) {
      setCredError("Please enter your PIN or click 'Use Demo PIN'.");
      return;
    }
    setCredError(null);
    setAct("otp_trick");
  };

  const handleSubmitOtp = () => {
    if (!fakeOtp.trim()) {
      setOtpError("Please enter the 6-digit OTP or click 'Use Demo OTP'.");
      return;
    }
    setOtpError(null);
    setUserChoice("pay");
    setAct("money_drained");
  };

  const handleBlockScam = () => {
    setUserChoice("block");
    setAct("fraud_blocked");
    celebrate();
  };

  const handleCallFakeHelpline = () => {
    setUserChoice("call");
    setAct("fake_helpline");
  };

  const handleHangUpFakeHelpline = () => {
    setUserChoice("call");
    setAct("helpline_disconnected");
  };

  const calculateScore = () => {
    if (userChoice === "block") {
      return inspectedSender && inspectedLink ? 100 : 90;
    }
    if (userChoice === "call") {
      return 60;
    }
    return 30;
  };

  const handleFinish = () => {
    const finalScore = calculateScore();
    if (!scoreReported) {
      setScoreReported(true);
      onComplete(finalScore, {
        action: "smishing_simulation_completed",
        simulation_slug: "social-engineering-call",
        score: finalScore,
        inspected_sender: inspectedSender,
        inspected_link: inspectedLink,
        blocked_fraud: userChoice === "block",
        called_fake_helpline: userChoice === "call",
      });
    }
    setAct("final_score");
  };

  const handleReset = () => {
    setAct("sms_arrives");
    setInspectedSender(false);
    setInspectedLink(false);
    setFakeCustId("98410294");
    setFakePin("");
    setFakeOtp("");
    setCredError(null);
    setOtpError(null);
    setUserChoice(null);
    setScoreReported(false);
  };

  const score = calculateScore();
  const scammerLogs = getScammerLogs();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── TOP MISSION HUD ── */}
      <div className="p-5 rounded-2xl bg-surface border border-primary/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                Practice Scenario: Fake Bank SMS Scam
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-ash">
                Interactive Walkthrough
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-pure">
              The Fake Bank Alert: SMS &amp; OTP Scam
            </h1>
            <p className="text-xs sm:text-sm text-text-fog mt-0.5">
              Experience how scammers create panic with fake debit alerts. Watch your phone and see what happens behind the scenes in real time.
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
                <i className="ti ti-columns mr-1" /> Split View
              </button>
              <button
                onClick={() => setActiveView("phone")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "phone" ? "bg-primary text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-device-mobile mr-1" /> Phone View
              </button>
              <button
                onClick={() => setActiveView("scammer")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "scammer" ? "bg-danger text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-terminal mr-1" /> Scammer&apos;s View
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-elevated border border-border text-text-fog hover:text-text-pure transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ti ti-rotate-clockwise" /> Reset
            </button>
          </div>
        </div>

        {/* Phase Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border text-xs">
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "sms_arrives" || act === "inspect_sms"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 1</span>
            Fake Alert SMS
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "fake_portal"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 2</span>
            Fake Bank Site
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "otp_trick" || act === "fake_helpline"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 3</span>
            The OTP Trap
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "fraud_blocked" || act === "money_drained"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 4</span>
            Your Decision
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "how_smishing_works" || act === "final_score"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 5</span>
            Key Safety Rules
          </div>
        </div>
      </div>

      {/* ── CORE PLAYGROUND: SMARTPHONE VS SCAMMER SYNDICATE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT: VICTIM'S SMARTPHONE ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "phone" ? "lg:col-span-12 max-w-md mx-auto" : "hidden"
        } flex flex-col items-center`}>
          
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-text-pure flex items-center gap-1.5">
              <i className="ti ti-device-mobile text-primary text-sm" />
              YOUR SMARTPHONE (Victim View)
            </span>
            <span className="text-[11px] text-text-ash font-mono">Tuesday &bull; 9:15 PM</span>
          </div>

          {/* Smartphone Chassis */}
          <div className="w-full max-w-[340px] rounded-[44px] border-4 border-zinc-700/80 bg-zinc-950 shadow-2xl p-3 text-white overflow-hidden relative min-h-[640px] flex flex-col justify-between">
            
            {/* Dynamic Island Notch */}
            <div className="relative z-20">
              <div className="w-28 h-4.5 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3 border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <span className="w-10 h-1 rounded-full bg-zinc-800" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-3 text-[11px] text-zinc-300 font-medium">
                <span>9:15 PM</span>
                <div className="flex items-center gap-1.5">
                  <i className="ti ti-wifi text-xs text-zinc-300" />
                  <span className="text-[10px]">5G</span>
                  <i className="ti ti-battery-3 text-xs text-zinc-300" />
                </div>
              </div>
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="flex-1 my-3 rounded-[32px] bg-zinc-900 border border-white/5 overflow-hidden flex flex-col relative text-zinc-100 p-4">
              <AnimatePresence mode="wait">

                {/* ── ACT 1: PANIC SMS IN INBOX ── */}
                {(act === "sms_arrives" || act === "inspect_sms") && (
                  <motion.div
                    key="sms"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      {/* Scenario Hook Banner */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2 text-zinc-200">
                        <i className="ti ti-bell-ringing text-amber-400 text-base shrink-0 mt-0.5" />
                        <div>
                          <strong>Tuesday, 9:15 PM:</strong> You just finished dinner. Your phone buzzes with a high-priority bank debit alert!
                        </div>
                      </div>

                      {/* SMS Chat Card */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 shadow-md">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                              🏦
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1">
                                VK-HDFCBK
                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">
                                  SMS
                                </span>
                              </div>
                              <div className="text-[10px] text-zinc-400">Official Sender Mask</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400">9:15 PM</span>
                        </div>

                        {/* Message Bubble */}
                        <div className="p-3 rounded-xl bg-zinc-800/90 text-xs text-zinc-200 leading-relaxed space-y-2">
                          <div className="font-bold text-red-400 text-[11px] flex items-center gap-1">
                            <i className="ti ti-alert-triangle" /> DEBIT ALERT: ₹48,999.00
                          </div>
                          <p className="text-[11px]">
                            Rs 48,999.00 has been debited from your A/c XX4102 via Flipkart Online.
                          </p>
                          <p className="text-[11px] font-semibold text-amber-300">
                            If this was NOT done by you, immediately CANCEL the transaction within 10 minutes at:
                          </p>
                          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 font-mono text-[10px] text-primary break-all">
                            http://hdfc-fraud-cancel.secure-portal.net
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            Or call Toll-Free Helpline: 1800-420-9912
                          </p>
                        </div>
                      </div>

                      {/* Clue Inspection Controls */}
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setInspectedSender(!inspectedSender)}
                            className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                              inspectedSender
                                ? "bg-primary text-white border-primary"
                                : "bg-zinc-800 text-primary border-primary/30"
                            }`}
                          >
                            <i className="ti ti-search" />
                            {inspectedSender ? "Header Inspected" : "🔍 Inspect Sender ID"}
                          </button>
                          <button
                            onClick={() => setInspectedLink(!inspectedLink)}
                            className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                              inspectedLink
                                ? "bg-primary text-white border-primary"
                                : "bg-zinc-800 text-primary border-primary/30"
                            }`}
                          >
                            <i className="ti ti-link" />
                            {inspectedLink ? "URL Inspected" : "🔗 Inspect URL Domain"}
                          </button>
                        </div>

                        {/* Inspector Clues */}
                        {inspectedSender && (
                          <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-[10px] text-red-300">
                            🚩 <strong>Sender Spoofing:</strong> Criminals lease bulk SMS gateways to send SMS with names like &quot;VK-HDFCBK&quot;! Just because the name says your bank does NOT mean it is genuine.
                          </div>
                        )}

                        {inspectedLink && (
                          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                            🚩 <strong>Fake Domain:</strong> Look at the root: <code>secure-portal.net</code>! The real bank website is <code>hdfcbank.com</code>.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* What to do next? */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] text-center text-zinc-400 italic">
                        You didn&apos;t spend ₹48,999! You are panicking to stop the money loss.
                      </p>

                      <button
                        onClick={handleOpenFakePortal}
                        className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <i className="ti ti-world" /> Tap Link to Cancel ₹48,999 Charge &rarr;
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={handleCallFakeHelpline}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-zinc-700 transition cursor-pointer"
                        >
                          📞 Call Number in SMS
                        </button>
                        <button
                          onClick={handleBlockScam}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                        >
                          🛑 Turn Card Over &amp; Call Real Bank
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 2: CLONED MOBILE BANKING PORTAL ── */}
                {act === "fake_portal" && (
                  <motion.div
                    key="portal"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs flex items-center justify-center mx-auto mb-1">
                          HDFC
                        </div>
                        <h2 className="text-xs font-bold text-white">Emergency Fraud Cancellation</h2>
                        <p className="text-[10px] text-zinc-400">Cancel Unauthorized Transactions</p>
                      </div>

                      {/* Fake Login Form */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1">Customer ID / Registered Mobile</label>
                          <input
                            type="text"
                            value={fakeCustId}
                            onChange={(e) => setFakeCustId(e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-white"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-zinc-400">4-Digit ATM PIN / Password</label>
                            <button
                              type="button"
                              onClick={() => {
                                setFakePin("8492");
                                setCredError(null);
                              }}
                              className="text-[10px] text-primary hover:underline cursor-pointer"
                            >
                              Use Demo PIN (8492)
                            </button>
                          </div>
                          <input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            value={fakePin}
                            onChange={(e) => {
                              setFakePin(e.target.value);
                              if (credError) setCredError(null);
                            }}
                            className={`w-full h-8 px-2.5 rounded-lg bg-zinc-900 border text-xs font-mono text-white tracking-widest text-center ${
                              credError ? "border-danger" : "border-red-500/80"
                            }`}
                          />
                          {credError && (
                            <span className="text-[10px] text-danger mt-1 block">{credError}</span>
                          )}
                        </div>

                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                          👀 <strong>Look at the Scammer Terminal on the right!</strong> Your customer ID and PIN are being captured live.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Button
                        variant="primary"
                        onClick={handleSubmitCredentials}
                        className="w-full text-xs font-bold py-2 bg-primary hover:bg-primary-hover"
                      >
                        Submit to Reverse ₹48,999 Charge &rarr;
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 3: THE DEVASTATING "CANCELLATION OTP" TRAP ── */}
                {act === "otp_trick" && (
                  <motion.div
                    key="otp_trick"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      {/* Real SMS Notification Pops down */}
                      <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="p-3 rounded-xl bg-zinc-950 border-2 border-amber-500/70 shadow-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                          <span>🔔 REAL BANK SMS JUST ARRIVED</span>
                          <span>9:17 PM</span>
                        </div>
                        <p className="text-[11px] text-white leading-tight font-mono">
                          &quot;OTP is <strong>841920</strong> for DEBIT of <strong>Rs 48,999.00</strong> to Binance Crypto. NEVER share OTP with anyone.&quot;
                        </p>
                      </motion.div>

                      {/* Fake Web Form Asking for "Reversal OTP" */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-center">
                        <div className="text-xs font-bold text-white">Enter OTP to CANCEL Transfer</div>
                        <p className="text-[10px] text-zinc-400">
                          Enter the 6-digit code received on your phone to reverse the transaction.
                        </p>

                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-400">6-Digit SMS Code</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFakeOtp("841920");
                              setOtpError(null);
                            }}
                            className="text-[10px] text-primary hover:underline cursor-pointer"
                          >
                            Use Demo OTP (841920)
                          </button>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="841920"
                          value={fakeOtp}
                          onChange={(e) => {
                            setFakeOtp(e.target.value);
                            if (otpError) setOtpError(null);
                          }}
                          className={`w-full h-10 px-3 rounded-lg bg-zinc-900 border text-center text-lg font-mono font-bold tracking-widest text-white ${
                            otpError ? "border-danger" : "border-danger/80"
                          }`}
                        />
                        {otpError && (
                          <span className="text-[10px] text-danger mt-1 block text-center">{otpError}</span>
                        )}

                        <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 text-left space-y-1">
                          <strong>⚠️ SPOT THE FATAL TRICK:</strong>
                          <p className="text-[10px]">
                            Look at the real SMS above: The OTP is to <strong>AUTHORIZE</strong> a transfer, not cancel it! The website lied. Banks NEVER send an OTP to cancel or receive money!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* The Critical Decision */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleBlockScam}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <i className="ti ti-shield-check" /> 🛑 STOP! Don&apos;t Enter OTP &bull; Fraud Detected!
                      </button>

                      <button
                        onClick={handleSubmitOtp}
                        className="w-full py-1.5 px-3 rounded-xl bg-red-950/60 border border-red-800 text-red-400 text-[11px] transition cursor-pointer"
                      >
                        Enter 841920 to &quot;Cancel&quot; (Fell for Trap)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 4A: MONEY DRAINED ── */}
                {act === "money_drained" && (
                  <motion.div
                    key="drained"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3 text-center pt-3"
                  >
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500 mx-auto flex items-center justify-center text-3xl animate-pulse">
                        <i className="ti ti-alert-triangle" />
                      </div>
                      <h2 className="text-base font-bold text-danger">₹48,999 DEBITED FROM YOUR ACCOUNT!</h2>

                      <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-left text-xs space-y-2 text-zinc-200">
                        <p className="font-bold text-red-400">
                          How the Smishing Trap Succeeded:
                        </p>
                        <ul className="list-disc list-inside text-[11px] text-zinc-300 space-y-1">
                          <li>The initial ₹48,999 debit SMS was completely fake—it was just bait to make you panic.</li>
                          <li>When you entered your Customer ID &amp; PIN, the scammers logged into your real bank.</li>
                          <li>The scammers initiated a REAL transfer of ₹48,999.</li>
                          <li>When you typed the OTP into the fake site, you approved their real transfer!</li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_smishing_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Why Did This Happen &amp; How to Prevent It? &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 4B: FRAUD BLOCKED (HERO OUTCOME) ── */}
                {act === "fraud_blocked" && (
                  <motion.div
                    key="blocked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3 text-center pt-3"
                  >
                    <div className="space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 mx-auto flex items-center justify-center text-3xl">
                        <i className="ti ti-shield-check" />
                      </div>
                      <h2 className="text-base font-bold text-emerald-400">FRAUD PREVENTED 100%!</h2>

                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left text-xs space-y-2 text-zinc-200">
                        <p className="font-bold text-emerald-400">
                          🛡️ Brilliant Cybersecurity Reflexes!
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          You remembered the golden rule: <strong>Banks NEVER require an OTP to cancel a transaction!</strong>
                        </p>
                        <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/20 text-[11px] text-zinc-300">
                          <strong>Immediate Action Taken:</strong> You called the official number printed on your physical debit card, locked online transactions, and reported the fake SMS to Cyber Crime (1930).
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_smishing_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Continue to Golden Anti-Smishing Rules &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 4C: FAKE HELPLINE CALL TRAP ── */}
                {act === "fake_helpline" && (
                  <motion.div
                    key="fake_call"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3 text-center pt-2"
                  >
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500 mx-auto flex items-center justify-center text-2xl animate-pulse">
                        <i className="ti ti-phone-call" />
                      </div>
                      <h2 className="text-sm font-bold text-white">Call Connected: 1800-420-9912</h2>

                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 text-left text-xs space-y-2 text-zinc-200">
                        <div className="font-bold text-amber-400">
                          🎭 &quot;Agent Vikram&quot; (Scammer Operator):
                        </div>
                        <p className="text-[11px] italic bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                          &quot;Sir, I can see a suspicious debit of ₹48,999 on your debit card right now! Don&apos;t worry, I am canceling it. I just sent an SMS with a cancellation code. Please read out the 6-digit OTP to reverse it immediately...&quot;
                        </p>
                        <p className="text-[10px] text-red-400 font-semibold">
                          ⚠️ Never call the phone number inside an unverified SMS! Scammers run their own fake call centers with friendly operators.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleHangUpFakeHelpline}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <i className="ti ti-phone-off" /> Hang Up Scam Call
                    </button>
                  </motion.div>
                )}

                {/* ── ACT 4D: HELPLINE DISCONNECTED IN TIME ── */}
                {act === "helpline_disconnected" && (
                  <motion.div
                    key="helpline_disconnected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3 text-center pt-2"
                  >
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500 mx-auto flex items-center justify-center text-2xl">
                        <i className="ti ti-phone-off" />
                      </div>
                      <h2 className="text-sm font-bold text-amber-400">CALL TERMINATED JUST IN TIME!</h2>

                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 text-left text-xs space-y-2 text-zinc-200">
                        <p className="font-bold text-amber-300">
                          ⚠️ Close Call: Partial Safety Reflex
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          You hung up before reading your OTP to the scam operator, preventing total fund loss.
                        </p>
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/20 text-[11px] text-zinc-300">
                          <strong>Key Lesson:</strong> Never dial phone numbers included in suspicious debit alerts. Always look up the official bank hotline printed on the back of your physical payment card.
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_smishing_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Continue to Golden Anti-Smishing Rules &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 5 & 6: FORENSIC MODE ── */}
                {(act === "how_smishing_works" || act === "final_score") && (
                  <motion.div
                    key="forensic_view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-3xl">
                      <i className="ti ti-shield-check" />
                    </div>
                    <div className="text-sm font-bold text-white">Investigation Complete</div>
                    <p className="text-xs text-zinc-400 max-w-[220px]">
                      Check the right panel for the technical breakdown and your final security score!
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom Home Bar */}
            <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto" />
          </div>
        </div>

        {/* ── RIGHT: SCAMMER SYNDICATE C2 & TECHNICAL FORENSICS ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "scammer" ? "lg:col-span-12" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-danger flex items-center gap-1.5 font-mono">
              <i className="ti ti-terminal-2 text-danger text-base animate-pulse" />
              SCAMMER SYNDICATE BOT (Bulk SMS &amp; OTP Harvester)
            </span>
            <span className="text-[11px] font-mono text-text-muted">Tool: SmishMaster v4.8</span>
          </div>

          {/* Scammer Terminal Window */}
          <AttackerTerminal
            logs={scammerLogs}
            title="SCAMMER SYNDICATE BOT: SMISHMASTER v4.8"
          />

          {/* ── EDUCATIONAL DEBRIEF: HOW SMISHING ACTUALLY WORKS ── */}
          {act === "how_smishing_works" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/30 bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <i className="ti ti-bulb text-lg" />
                HOW DOES MOBILE SMISHING ACTUALLY WORK?
              </div>

              <div className="text-xs text-text-low leading-relaxed space-y-3">
                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">1. The Fake Sender ID (Header Spoofing)</strong>
                  <p className="text-[11px]">
                    Scammers use international bulk SMS gateways that allow custom alphanumeric sender IDs. Even if your phone groups it with your genuine bank SMS, the message can be forged!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">2. The &quot;Cancellation OTP&quot; Trap</strong>
                  <p className="text-[11px]">
                    Banks generate OTPs for <strong>ONE PURPOSE ONLY: to APPROVE a transaction</strong>. There is no such thing as an &quot;OTP to cancel a debit&quot; or an &quot;OTP to receive a refund&quot;.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">3. The Fake Call Center</strong>
                  <p className="text-[11px]">
                    Scammers include toll-free numbers in SMS messages. Calling them connects you straight to a scam call center where operators use smooth, persuasive scripts to coax your OTP.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleFinish}
                className="w-full text-xs font-bold py-2.5"
              >
                Claim Score &amp; Anti-Smishing Rules &rarr;
              </Button>
            </motion.div>
          )}

          {/* ── FINAL SCORECARD & SURVIVAL RULES ── */}
          {act === "final_score" && (
            <ScoreCard
              score={score}
              scenarioTitle="Mobile Smishing Defense"
              goldenRule="Never share an OTP to 'cancel' a charge or receive a refund; OTPs only authorize debits from your bank account."
              breakdown={[
                ...(userChoice === "block"
                  ? [
                      {
                        type: "success" as const,
                        text: "Blocked and reported the spoofed SMS without entering credentials or calling the fake helpline.",
                      },
                      ...(inspectedSender && inspectedLink
                        ? [
                            {
                              type: "success" as const,
                              text: "Recognized that alphanumeric sender IDs can be spoofed by bulk messaging gateways.",
                            },
                          ]
                        : []),
                    ]
                  : [
                      {
                        type: "warning" as const,
                        text: "Fell for the 'cancellation OTP' trick and surrendered a 6-digit transaction approval code.",
                      },
                      {
                        type: "warning" as const,
                        text: "Allowed an unauthorized debit of ₹49,999 to proceed.",
                      },
                    ]),
              ]}
              onRetry={handleReset}
              nextSimulationUrl="/simulations"
              nextSimulationLabel="More Threat Sandboxes"
            />
          )}

        </div>
      </div>
    </div>
  );
}
