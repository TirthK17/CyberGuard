import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import {
  PhoneFrame,
  AttackerTerminal,
  SimHud,
  ScoreCard,
  RulesGrid,
  useSimulationFlow,
  type ScoreBreakdownItem,
  type DefenseRule,
} from "./shared";

interface UpiCollectScamSandboxProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "incoming_call"
  | "inspect_collect_request"
  | "pin_entry_trap"
  | "scam_exploited"
  | "defense_triumph"
  | "final_score";

const RULES: DefenseRule[] = [
  {
    icon: "ti-key",
    title: "UPI PIN is ONLY for Debiting",
    description: "You NEVER need to enter your UPI PIN to receive money. If an app asks for your PIN, money will LEAVE your account.",
    type: "dont",
  },
  {
    icon: "ti-arrow-up-right",
    title: "Collect Request = Money Out",
    description: "A 'Collect Request' or 'Payment Request' notification is an authorization to withdraw money from your account.",
    type: "dont",
  },
  {
    icon: "ti-phone-off",
    title: "Hang Up & Call 1930",
    description: "If a buyer or caller claims they 'cannot send money unless you click Pay', immediately hang up and report on cybercrime.gov.in.",
    type: "do",
  },
];

export function UpiCollectScamSandbox({ onComplete }: UpiCollectScamSandboxProps) {
  const {
    act,
    setAct,
    activeView,
    setActiveView,
    beginnerClues,
    toggleClues,
    isAttacked,
    isProtected,
    completeFlow,
    resetFlow,
  } = useSimulationFlow<Act>({
    initialAct: "incoming_call",
    totalActs: 5,
    onComplete,
  });

  const [inspectedDetails, setInspectedDetails] = useState(false);
  const [fakePinInput, setFakePinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [hasDeclined, setHasDeclined] = useState(false);

  // Generate Hacker Terminal Logs
  const getLogs = () => {
    const logs = [
      "[*] Initiated UPI Social Engineering Campaign: 'OLX Buyer Scam'",
      "[*] Scammer connected via spoofed phone call (pretending to be army officer / urgent buyer)",
      "[*] Target item: Second-hand laptop listed for INR 4,500",
    ];

    if (act === "incoming_call") {
      logs.push(
        "[>] Voice pitch: 'Sir, I transferred INR 4,500. Open PhonePe and accept payment request immediately!'",
        "[*] Triggered UPI Collect API: VPA request sent to target mobile number"
      );
    }

    if (act === "inspect_collect_request") {
      logs.push(
        "[+] VPA Collect notification delivered to victim device",
        "[>] Scammer shouting on call: 'Click Pay quickly sir, payment link will expire in 60 seconds!'"
      );
      if (inspectedDetails) {
        logs.push(
          "[!] WARNING: Victim opened collect request details and verified VPA! Vigilance alert."
        );
      }
    }

    if (act === "pin_entry_trap") {
      logs.push(
        "[!] VICTIM PROCEEDED TO UPI PIN SCREEN!",
        "[>] Waiting for victim to submit 4-digit bank authorization PIN..."
      );
    }

    if (act === "scam_exploited") {
      logs.push(
        "[PWNED] VICTIM SUBMITTED UPI PIN!",
        "[★] NPCI / Bank IMPS switch approved transaction: INR 4,500 debited from victim account",
        "[★] Funds immediately laundered across 3 mule accounts in Bihar / Mewat",
        "[ALERT] Scammer abruptly disconnected call and blocked victim number."
      );
    }

    if (act === "defense_triumph") {
      logs.push(
        "[SAFE] COLLECT REQUEST DECLINED BY VICTIM!",
        "[SAFE] Victim recognized that receiving money NEVER requires entering a UPI PIN.",
        "[SAFE] Scammer number flagged and reported to National Cybercrime Helpline 1930 / Chakshu.",
        "[SAFE] Zero rupees lost. Attack completely thwarted!"
      );
    }

    return logs;
  };

  const handleDecline = () => {
    setHasDeclined(true);
    setAct("defense_triumph");
    completeFlow(100, {
      scenario: "upi_collect_scam",
      declined_collect_request: true,
      inspected_details: inspectedDetails,
    });
  };

  const handleProceedToPin = () => {
    setAct("pin_entry_trap");
  };

  const handleSubmitPin = () => {
    if (!fakePinInput.trim() || fakePinInput.length < 4) {
      setPinError("Please enter a 4-digit demo PIN (e.g. 1234).");
      return;
    }
    setPinError(null);
    setAct("scam_exploited");
    completeFlow(20, {
      scenario: "upi_collect_scam",
      fell_for_collect_request: true,
      pin_entered: true,
    });
  };

  const handleReset = () => {
    resetFlow();
    setInspectedDetails(false);
    setFakePinInput("");
    setPinError(null);
    setHasDeclined(false);
  };

  const score = hasDeclined ? 100 : 20;

  const scoreBreakdown: ScoreBreakdownItem[] = hasDeclined
    ? [
        {
          type: "success",
          text: "Correctly recognized that receiving money via UPI never requires entering a UPI PIN or approving a Collect Request.",
        },
        {
          type: "success",
          text: "Refused urgency pressure from the scammer and declined the fraudulent payment request.",
        },
        ...(inspectedDetails
          ? [
              {
                type: "success" as const,
                text: "Thoroughly inspected the merchant request details and spotted the unverified VPA.",
              },
            ]
          : []),
      ]
    : [
        {
          type: "warning",
          text: "Fell for the scammer's verbal urgency pressure and approved a UPI Collect Request.",
        },
        {
          type: "warning",
          text: "Entered a UPI PIN thinking it would credit money, resulting in INR 4,500 being stolen from your bank account.",
        },
      ];

  return (
    <div className="space-y-6">
      {/* Simulation HUD */}
      <SimHud
        title="UPI 'Collect Request' Refund Scam"
        categoryLabel="UPI & Mobile Banking Fraud"
        currentActIndex={
          act === "incoming_call"
            ? 0
            : act === "inspect_collect_request"
            ? 1
            : act === "pin_entry_trap"
            ? 2
            : 3
        }
        totalActs={4}
        actLabel={
          act === "incoming_call"
            ? "Urgent Phone Call"
            : act === "inspect_collect_request"
            ? "Incoming Collect Request"
            : act === "pin_entry_trap"
            ? "UPI PIN Authorization Screen"
            : "Debrief & Analysis"
        }
        score={act === "final_score" || act === "defense_triumph" || act === "scam_exploited" ? score : undefined}
        beginnerClues={beginnerClues}
        onToggleClues={toggleClues}
        onReset={handleReset}
        activeView={activeView}
        onViewChange={setActiveView}
        victimLabel="PhonePe Screen"
        hackerLabel="Scammer C2 Log"
      />

      {/* Main Simulation Viewport */}
      {act === "final_score" ? (
        <ScoreCard
          score={score}
          scenarioTitle="UPI Collect Request Scam"
          goldenRule="UPI PIN is ONLY entered to SEND money or check balance. You NEVER need to enter a UPI PIN to receive money!"
          breakdown={scoreBreakdown}
          onRetry={handleReset}
          nextSimulationUrl="/simulations"
          nextSimulationLabel="Explore Next Simulation"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Victim Smartphone Screen (Left / Primary) */}
          <div
            className={`${
              activeView === "hacker" ? "hidden" : activeView === "split" ? "lg:col-span-7" : "lg:col-span-12"
            }`}
          >
            <PhoneFrame isAttacked={isAttacked} isProtected={isProtected}>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Simulated PhonePe / GPay App Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      पे
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-text-pure">PhonePe Payments</h3>
                      <p className="text-[10px] text-text-ash">UPI ID: rahul.sharma@ybl</p>
                    </div>
                  </div>
                  <Pill tone="primary" size="sm">UPI 2.0</Pill>
                </div>

                {/* Act 1: Urgent Incoming Call Banner */}
                {act === "incoming_call" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3"
                  >
                    <div className="flex items-center gap-2.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <i className="ti ti-phone-call text-lg animate-bounce" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Active Call: &quot;Major Vikram (OLX Buyer)&quot;
                      </span>
                    </div>

                    <p className="text-xs text-text-pure leading-relaxed italic bg-surface/60 p-3 rounded-xl border border-border">
                      &quot;Hello Rahul ji! I have transferred your ₹4,500 for the laptop. PhonePe just sent a notification to your screen. Open it immediately and click Pay to accept the money into your SBI account!&quot;
                    </p>

                    {beginnerClues && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 space-y-1">
                        <strong className="flex items-center gap-1 font-bold">
                          <i className="ti ti-bulb text-xs" /> Beginner Clue:
                        </strong>
                        <p>
                          Why would clicking &quot;Pay&quot; receive money? Scammers exploit hurry and confusion around the word &quot;Pay&quot;.
                        </p>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setAct("inspect_collect_request")}
                    >
                      <i className="ti ti-bell mr-1.5" />
                      View Incoming PhonePe Notification
                    </Button>
                  </motion.div>
                )}

                {/* Act 2: Incoming Collect Request Screen */}
                {act === "inspect_collect_request" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* The Fraudulent Collect Card */}
                    <div className="p-5 rounded-2xl bg-surface-elevated border-2 border-primary/40 shadow-lg space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center text-xl">
                        <i className="ti ti-arrow-down-left" />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-text-ash uppercase tracking-wider">
                          Incoming Payment Request
                        </span>
                        <h4 className="text-2xl font-bold font-display text-text-pure mt-0.5">
                          ₹4,500.00
                        </h4>
                        <p className="text-xs text-text-fog mt-1">
                          Requested by: <strong className="text-text-pure">Priya General Store</strong>
                        </p>
                        <p className="text-[11px] font-mono text-text-ash">priya.merch902@okaxis</p>
                      </div>

                      {/* Warning Notice */}
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 flex items-center gap-2 text-left">
                        <i className="ti ti-alert-triangle text-base text-red-400 shrink-0" />
                        <span>
                          Entering UPI PIN will <strong>DEDUCT</strong> ₹4,500 from your SBI Account (xx4819).
                        </span>
                      </div>

                      {beginnerClues && (
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 text-left space-y-1">
                          <strong className="flex items-center gap-1 font-bold">
                            <i className="ti ti-bulb text-xs" /> Critical Clue:
                          </strong>
                          <p>
                            Notice that the button says &quot;Pay ₹4,500&quot;—NOT &quot;Receive&quot;! When anyone sends you money, it credits directly without requiring your approval.
                          </p>
                        </div>
                      )}

                      {/* Inspect details button */}
                      <button
                        type="button"
                        onClick={() => setInspectedDetails(true)}
                        className="text-xs text-primary hover:underline font-medium cursor-pointer"
                      >
                        {inspectedDetails ? "✓ Details Verified (Untrusted VPA)" : "Inspect Request Details"}
                      </button>
                    </div>

                    {/* Action Choices */}
                    <div className="space-y-2 pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full font-bold"
                        onClick={handleDecline}
                      >
                        <i className="ti ti-shield-x mr-1.5" />
                        Decline Request &amp; Block Caller (Safe Choice)
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs text-text-ash hover:text-text-pure"
                        onClick={handleProceedToPin}
                      >
                        <span>Click &quot;Pay ₹4,500&quot; to test what happens</span>
                        <i className="ti ti-arrow-right ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Act 3: PIN Entry Trap Screen */}
                {act === "pin_entry_trap" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 text-center"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-2">
                      <span>NPCI UPI Switch</span>
                      <span className="font-mono text-emerald-400">SBI xx4819</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">
                        ENTER 4-DIGIT UPI PIN
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Authorizing transfer of <strong className="text-red-400">₹4,500.00</strong> to Priya General Store
                      </p>
                    </div>

                    {/* Fake PIN Input */}
                    <div className="max-w-[180px] mx-auto space-y-2">
                      <input
                        type="password"
                        maxLength={4}
                        value={fakePinInput}
                        onChange={(e) => setFakePinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full text-center text-2xl font-mono tracking-widest py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-red-500"
                        aria-label="Enter 4-digit UPI PIN"
                      />
                      {pinError && (
                        <p className="text-[11px] text-red-400 font-medium">{pinError}</p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleSubmitPin}
                        className="w-full font-bold"
                      >
                        Confirm &amp; Send ₹4,500
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDecline}
                        className="w-full text-emerald-400 hover:text-emerald-300"
                      >
                        <i className="ti ti-arrow-left mr-1.5" />
                        Wait! Cancel &amp; Decline Immediately
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Act 4: Scam Exploited / Debrief */}
                {act === "scam_exploited" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500/40 space-y-4 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
                      <i className="ti ti-cash-off" />
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-red-400">
                        ₹4,500 Debited From Your Account!
                      </h4>
                      <p className="text-xs text-text-fog mt-2 leading-relaxed">
                        You fell for the UPI Collect Request trick. The caller disconnected immediately and switched off their phone. Your ₹4,500 has been transferred to a scam mule account.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setAct("final_score")}
                    >
                      View Detailed Debrief &amp; Score
                    </Button>
                  </motion.div>
                )}

                {/* Act 4: Defense Triumph */}
                {act === "defense_triumph" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 space-y-4 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
                      <i className="ti ti-shield-check" />
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-emerald-400">
                        Fraudulent Request Declined!
                      </h4>
                      <p className="text-xs text-text-fog mt-2 leading-relaxed">
                        Outstanding vigilance! You recognized that <strong>receiving money NEVER requires entering a UPI PIN</strong>. The scammer was unable to touch a single rupee of your savings.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => setAct("final_score")}
                    >
                      View Score &amp; Rules Breakdown
                    </Button>
                  </motion.div>
                )}

                {/* Footer Tips */}
                <div className="pt-2 text-center text-[11px] text-text-ash border-t border-border/30">
                  <span>Helpline: <strong>1930</strong> (National Cybercrime Reporting Portal)</span>
                </div>
              </div>
            </PhoneFrame>
          </div>

          {/* Attacker C2 Terminal (Right) */}
          <div
            className={`${
              activeView === "victim" ? "hidden" : activeView === "split" ? "lg:col-span-5" : "lg:col-span-12"
            } space-y-4`}
          >
            <AttackerTerminal
              logs={getLogs()}
              title="SCAMMER CALL &amp; COLLECT FEED"
            />

            {/* Defense Rules Grid */}
            <RulesGrid rules={RULES} />
          </div>
        </div>
      )}
    </div>
  );
}
