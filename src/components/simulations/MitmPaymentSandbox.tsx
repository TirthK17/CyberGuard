import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { celebrate } from "@/lib/celebrate";
import { simulationXp } from "@/lib/gamification";

interface MitmPaymentSandboxProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "story_intro"
  | "wifi_select"
  | "official_wifi_prompt"
  | "captive_snoop"
  | "payment_warning"
  | "inspect_certificate"
  | "hacker_tamper"
  | "critical_decision"
  | "decision_outcome"
  | "vpn_experiment"
  | "how_it_works"
  | "final_score";

export function MitmPaymentSandbox({ onComplete }: MitmPaymentSandboxProps) {
  const navigate = useNavigate();

  // Story & simulation states
  const [act, setAct] = useState<Act>("story_intro");
  const [activeView, setActiveView] = useState<"split" | "phone" | "hacker">("split");
  const [selectedWifi, setSelectedWifi] = useState<string | null>(null);
  const [vpnActive, setVpnActive] = useState(false);
  const [userDecision, setUserDecision] = useState<"cancel" | "pay" | "vpn" | null>(null);
  const [scoreReported, setScoreReported] = useState(false);

  // Terminal log stream for the hacker's view
  const getHackerLogs = () => {
    const baseLogs = [
      "[*] Fake Wi-Fi hotspot active and broadcasting",
      "[*] Rogue network SSID: 'Cafe_FREE_HighSpeed_WiFi'",
      "[*] Listening for nearby devices and network traffic...",
    ];

    if (selectedWifi === "official") {
      baseLogs.push(
        "[-] VICTIM CONNECTED TO ENCRYPTED OFFICIAL NETWORK",
        "[-] WPA2-Enterprise handshake established with official AP",
        "[-] Rogue AP bypassed: attacker cannot monitor traffic on this network."
      );
      return baseLogs;
    }

    if (selectedWifi === "fake") {
      baseLogs.push(
        "[+] DEVICE CONNECTED: Rahul's Phone (iPhone 15)",
        "[+] Traffic redirect active: device data now routes through attacker laptop",
        "[+] ATTACKER CAN NOW MONITOR INTERNET ACTIVITY"
      );
    }

    if (act === "captive_snoop" || act === "payment_warning" || act === "inspect_certificate") {
      baseLogs.push(
        "[>] SNOOPED: User opened 'rahulelectronics.in/cart'",
        "[>] SNOOPED: Item 'Pro Wireless Headphones' - Amount: ₹1,499",
        "[>] SNOOPED COOKIE: user login session token intercepted"
      );
    }

    if (act === "inspect_certificate") {
      baseLogs.push(
        "[!] ALERT: Victim opened Security Certificate Details!",
        "[!] Attacker fake certificate exposed: CN=hacker-proxy.local (Untrusted CA)",
        "[!] Victim may abort connection..."
      );
    } else if (act === "payment_warning" || act === "hacker_tamper") {
      baseLogs.push(
        "[!] ATTEMPTING TO BREAK ENCRYPTION: Serving fake security certificate",
        "[!] Warning shown on victim phone: 'Security Certificate Not Trusted'..."
      );
    }

    if (act === "hacker_tamper" || act === "critical_decision") {
      baseLogs.push(
        "[★] PAYMENT REQUEST INTERCEPTED: UPI Payment in progress",
        "[★] ORIGINAL DETAILS: ₹1,499 to 'rahul_electronics@upi'",
        "[★] TAMPERING DATA: Modifying amount from ₹1,499 to ₹9,499",
        "[★] TAMPERING DATA: Changing recipient to attacker's account",
        "[★] SENDING TAMPERED PAYMENT TO BANK..."
      );
    }

    // Outcome logs: user choice takes precedence
    if (userDecision === "pay") {
      baseLogs.push("[$$$] SUCCESS! Victim approved tampered amount: ₹9,499 credited to attacker mule!");
    } else if (vpnActive) {
      baseLogs.push(
        "[SAFE] VICTIM ACTIVATED VPN (ENCRYPTED TUNNEL)",
        "[BLOCKED] Attacker cannot read or tamper with encrypted traffic",
        "[BLOCKED] Raw data is scrambled: e4 9b 12 ff c0 88 23 11 04 a2 (unreadable)",
        "[-] ATTACK PREVENTED BY SECURE VPN ENCRYPTION"
      );
    } else if (userDecision === "cancel") {
      baseLogs.push("[-] VICTIM REJECTED TRANSACTION: Payment cancelled by user!");
    }

    return baseLogs;
  };

  const handleSelectWifi = (type: "fake" | "official") => {
    setSelectedWifi(type);
    if (type === "official") {
      setAct("official_wifi_prompt");
    } else {
      setAct("captive_snoop");
    }
  };

  const handleProceedToPayment = () => {
    setAct("payment_warning");
  };

  const handleWarningReaction = (reaction: "rush" | "inspect") => {
    if (reaction === "rush") {
      setAct("hacker_tamper");
    } else {
      setAct("inspect_certificate");
    }
  };

  const handleChooseAction = (choice: "cancel" | "pay" | "vpn") => {
    setUserDecision(choice);
    if (choice === "vpn") {
      setVpnActive(true);
      setAct("vpn_experiment");
    } else {
      setAct("decision_outcome");
      if (choice === "cancel") {
        celebrate();
      }
    }
  };

  const calculateFinalScore = () => {
    if (userDecision === "pay") {
      return 30;
    }
    if (selectedWifi === "official") {
      return 100;
    }
    if (userDecision === "cancel" || vpnActive) {
      return vpnActive ? 100 : 90;
    }
    return 30;
  };

  const handleFinish = () => {
    const score = calculateFinalScore();
    if (!scoreReported) {
      setScoreReported(true);
      onComplete(score, {
        action: "public_wifi_mitm_completed",
        score,
        used_vpn: vpnActive,
        cancelled_tampered_payment: userDecision === "cancel",
      });
    }
    setAct("final_score");
  };

  const handleReset = () => {
    setAct("story_intro");
    setSelectedWifi(null);
    setVpnActive(false);
    setUserDecision(null);
    setScoreReported(false);
  };

  const score = calculateFinalScore();
  const hackerLogs = getHackerLogs();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── TOP MISSION HUD ── */}
      <div className="p-5 rounded-2xl bg-surface border border-primary/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-danger font-mono">
                Real-World Cyber Threat Sandbox
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-ash">
                Public Wi-Fi &bull; Man-in-the-Middle (MITM)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-pure">
              The Café Wi-Fi Trap: What Hackers Actually See
            </h1>
            <p className="text-xs sm:text-sm text-text-fog mt-0.5">
              Ever wondered what really happens when you tap &quot;Free Wi-Fi&quot; in a public café or airport? Watch both screens side-by-side!
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
                onClick={() => setActiveView("phone")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "phone" ? "bg-primary text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-device-mobile mr-1" /> Your Phone
              </button>
              <button
                onClick={() => setActiveView("hacker")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "hacker" ? "bg-danger text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-terminal mr-1" /> Hacker&apos;s Screen
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-surface-elevated border border-border text-text-fog hover:text-text-pure transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ti ti-rotate-clockwise" /> Reset Story
            </button>
          </div>
        </div>

        {/* Story Breadcrumbs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border text-xs">
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "story_intro" || act === "wifi_select"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 1</span>
            The Tempting Wi-Fi
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "captive_snoop" || act === "payment_warning"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 2</span>
            Live Snooping
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "hacker_tamper" || act === "critical_decision"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 3</span>
            The Data Tampering
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "decision_outcome" || act === "vpn_experiment"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 4</span>
            Defense &amp; Outcome
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "how_it_works" || act === "final_score"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STEP 5</span>
            Golden Lessons
          </div>
        </div>
      </div>

      {/* ── CORE PLAYGROUND: DUAL PERSPECTIVE (PHONE VS HACKER TERMINAL) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN: YOUR SMARTPHONE (VICTIM'S EYES) ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "phone" ? "lg:col-span-12 max-w-md mx-auto" : "hidden"
        } flex flex-col items-center`}>
          
          <div className="w-full flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-bold text-text-pure flex items-center gap-1.5">
              <i className="ti ti-device-mobile text-primary text-sm" />
              YOUR PHONE SCREEN (Victim Perspective)
            </span>
            <span className="text-[11px] text-text-ash font-mono">Sitting at Café Table #4</span>
          </div>

          {/* Realistic Smartphone Chassis */}
          <div className="w-full max-w-[340px] rounded-[44px] border-4 border-zinc-700/80 bg-zinc-950 shadow-2xl p-3 text-white overflow-hidden relative min-h-[640px] flex flex-col justify-between">
            
            {/* Dynamic Island Notch */}
            <div className="relative z-20">
              <div className="w-28 h-4.5 bg-black rounded-full mx-auto mb-2 flex items-center justify-between px-3 border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <span className="w-10 h-1 rounded-full bg-zinc-800" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-3 text-[11px] text-zinc-300 font-medium">
                <span>8:47 PM</span>
                <div className="flex items-center gap-1.5">
                  {vpnActive && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-bold font-mono">
                      VPN ON
                    </span>
                  )}
                  {selectedWifi ? (
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <i className="ti ti-wifi text-xs" />
                      <span className="text-[10px]">Wi-Fi</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-red-400">
                      <i className="ti ti-antenna-bars-1 text-xs" />
                      <span className="text-[10px]">0MB Data</span>
                    </span>
                  )}
                  <i className="ti ti-battery-2 text-xs text-amber-400" />
                </div>
              </div>
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="flex-1 my-3 rounded-[32px] bg-zinc-900 border border-white/5 overflow-hidden flex flex-col relative text-zinc-100 p-4">
              <AnimatePresence mode="wait">

                {/* ── ACT 1: SITTING IN CAFE, 0 DATA, WI-FI LIST ── */}
                {(act === "story_intro" || act === "wifi_select") && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="text-center pt-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-xl">
                          <i className="ti ti-coffee" />
                        </div>
                        <h2 className="text-sm font-bold text-white mt-1.5">Urban Brews Café</h2>
                        <p className="text-[11px] text-zinc-400">
                          Checkout due for Wireless Headphones: <strong className="text-white">₹1,499</strong>
                        </p>
                      </div>

                      {/* Low Data Warning Card */}
                      <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs flex items-start gap-2.5">
                        <i className="ti ti-alert-triangle text-red-400 text-base shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-red-300 text-[11px]">Mobile Data Exhausted!</div>
                          <div className="text-[10px] text-zinc-300">
                            Your 1.5GB daily pack finished. You need internet to pay before your order is cancelled!
                          </div>
                        </div>
                      </div>

                      {/* Available Wi-Fi Networks */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                          Nearby Wi-Fi Networks:
                        </div>

                        {/* FAKE ROGUE WI-FI (THE TRAP) */}
                        <button
                          onClick={() => handleSelectWifi("fake")}
                          className="w-full text-left p-3 rounded-xl bg-zinc-800 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-zinc-700/80 transition-all cursor-pointer shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="ti ti-wifi text-emerald-400 text-base" />
                              <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                                Cafe_FREE_HighSpeed_WiFi
                              </span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase">
                              Open &bull; Fast
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                            <span>Signal: 100% (No Password)</span>
                            <span className="text-emerald-400 font-bold">Tap to Connect &rarr;</span>
                          </div>
                        </button>

                        {/* OFFICIAL WI-FI */}
                        <button
                          type="button"
                          onClick={() => handleSelectWifi("official")}
                          className="w-full text-left p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-sky-400 hover:bg-zinc-800 transition-all cursor-pointer shadow-sm group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <i className="ti ti-lock text-sky-400 text-sm" />
                              <span className="text-xs font-bold text-white group-hover:text-sky-300">Cafe_Official_Staff</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold uppercase">WPA2 Protected</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-between">
                            <span>Requires WPA2 Password</span>
                            <span className="text-sky-400 font-semibold">Tap for password access &rarr;</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-zinc-400 pb-1">
                      💡 Tip: Most people instantly tap the Open Free Wi-Fi without thinking twice!
                    </div>
                  </motion.div>
                )}

                {/* ── OFFICIAL WI-FI PROMPT SCENE ── */}
                {act === "official_wifi_prompt" && (
                  <motion.div
                    key="official_wifi"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3 pt-2 text-center">
                      <div className="w-14 h-14 rounded-full bg-sky-500/20 border-2 border-sky-500 text-sky-400 mx-auto flex items-center justify-center text-3xl">
                        <i className="ti ti-key" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">WPA2 Password Required</h2>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Network: &quot;Cafe_Official_Staff&quot;
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-elevated border border-border text-left text-xs space-y-2 text-zinc-300">
                        <p className="text-[11px] leading-relaxed">
                          Official café networks use encrypted authentication (WPA2/WPA3). In real life, you would ask the staff for the customer code, preventing rogue interception.
                        </p>
                        <p className="text-[11px] text-sky-300 font-semibold">
                          🛡️ Connecting to an encrypted network blocks MITM rogue hotspots!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Button
                        variant="primary"
                        onClick={() => handleSelectWifi("fake")}
                        className="w-full text-xs font-bold py-2.5"
                      >
                        Connect to Free Open Wi-Fi (Experience Rogue Attack Drill) &rarr;
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleChooseAction("cancel")}
                        className="w-full text-xs font-medium py-2"
                      >
                        Stay on Secure Cellular / Ask Barista (Safe Exit +100 Score)
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 2: CONNECTED & LIVE TRAFFIC SNOOPING ── */}
                {act === "captive_snoop" && (
                  <motion.div
                    key="snoop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      {/* Connection Success Banner */}
                      <div className="py-1 px-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Connected to Cafe_FREE_HighSpeed_WiFi
                      </div>

                      {/* Payment App Checkout View */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                              ⚡
                            </div>
                            <span className="text-xs font-bold text-white">PayFast UPI</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">Order #88391</span>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400">Order Summary:</div>
                          <div className="text-xs font-bold text-white">Rahul Electronics Online</div>
                          <div className="text-[11px] text-zinc-300">Wireless Noise-Canceling Headphones</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                          <span className="text-xs text-zinc-400">Total Price:</span>
                          <span className="text-base font-extrabold text-emerald-400 font-mono">₹1,499.00</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <i className="ti ti-eye" /> Notice the Hacker&apos;s Screen on the right!
                        </div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed">
                          Because you joined an open Wi-Fi, the attacker already intercepted your device IP, visited URL, and cart total!
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleProceedToPayment}
                      className="w-full text-xs font-bold py-2.5 shadow-md"
                    >
                      Proceed to Pay ₹1,499 <i className="ti ti-arrow-right ml-1" />
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 3: THE CRITICAL SECURITY WARNING ── */}
                {act === "payment_warning" && (
                  <motion.div
                    key="warning"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3 pt-2 text-center">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 mx-auto flex items-center justify-center text-3xl animate-bounce">
                        <i className="ti ti-shield-alert" />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-white">Connection Not Private!</h2>
                        <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                          SSL_ERROR_UNTRUSTED_CERT_AUTHORITY
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left text-xs space-y-1 text-zinc-300">
                        <p className="text-[11px] leading-relaxed">
                          Your phone is trying to establish a secure encrypted connection to <strong>rahulelectronics.in</strong>.
                        </p>
                        <p className="text-[11px] text-amber-300 font-semibold leading-relaxed">
                          ⚠️ However, someone on this Wi-Fi is intercepting the handshake and presenting a fake certificate!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleWarningReaction("inspect")}
                        className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <i className="ti ti-search" /> Inspect Security Certificate (Recommended)
                      </button>
                      <button
                        onClick={() => handleWarningReaction("rush")}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="ti ti-bolt" /> Ignore Warning &amp; Continue (Simulate Risk)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── INSPECT CERTIFICATE SCENE ── */}
                {act === "inspect_certificate" && (
                  <motion.div
                    key="inspect_cert"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <i className="ti ti-certificate text-danger text-xl" />
                        <div>
                          <h2 className="text-xs font-bold text-white">SSL Certificate Inspector</h2>
                          <span className="text-[10px] text-danger font-mono font-bold">STATUS: UNTRUSTED / FORGED</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-950 border border-danger/40 space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Requested Host:</span>
                          <span className="text-zinc-200">rahulelectronics.in</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Issued To (CN):</span>
                          <span className="text-danger font-bold">hacker-proxy.local</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Issuer Authority:</span>
                          <span className="text-danger font-bold">Self-Signed Root CA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Public Key:</span>
                          <span className="text-zinc-400">RSA 2048 (Attacker-Held)</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                        <strong className="block font-bold">Sharp eye! You caught the attacker!</strong>
                        <p className="text-zinc-300 text-[10px] leading-relaxed">
                          Because the certificate is self-signed and not from a trusted root like DigiCert or Let&apos;s Encrypt, you verified that an adversary is proxying and decrypting your payment stream!
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => handleChooseAction("cancel")}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <i className="ti ti-shield-check" /> Abort &amp; Disconnect From Rogue Hotspot (+Score)
                      </button>
                      <button
                        onClick={() => setAct("hacker_tamper")}
                        className="w-full py-1.5 px-3 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs transition"
                      >
                        Continue anyway to see how payment is tampered &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 4: THE TAMPERED PAYMENT (ATTACK ACTIVE) ── */}
                {(act === "hacker_tamper" || act === "critical_decision") && (
                  <motion.div
                    key="tamper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="text-center pt-1">
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          ⚠️ UPI Approval Screen
                        </span>
                        <h2 className="text-sm font-bold text-white mt-1">Approve Bank Auto-Debit</h2>
                      </div>

                      {/* Tampered Comparison Box */}
                      <div className="p-3.5 rounded-2xl bg-zinc-950 border-2 border-red-500/60 space-y-2">
                        <div className="flex justify-between items-center text-xs pb-1.5 border-b border-zinc-800">
                          <span className="text-zinc-400 text-[11px]">Original Cart Value:</span>
                          <span className="line-through text-zinc-500 font-mono">₹1,499</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-red-400 text-[11px] font-bold block">
                            AMOUNT REQUESTED FROM YOUR ACCOUNT:
                          </span>
                          <div className="text-2xl font-black text-red-400 font-mono animate-pulse">
                            ₹9,499.00
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-red-500/10 text-[10px] text-red-300">
                          <strong>Recipient:</strong> TechMule Services (attacker_wallet@upi)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 text-center">
                        The attacker altered the packet in transit! If you enter your UPI PIN, you will lose ₹9,499!
                      </div>
                    </div>

                    {/* 3 Real-World Decisions */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleChooseAction("cancel")}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <i className="ti ti-shield-check" /> 🛑 STOP &amp; Cancel Payment (Smart Choice)
                      </button>

                      <button
                        onClick={() => handleChooseAction("vpn")}
                        className="w-full py-2 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <i className="ti ti-lock" /> 🛡️ Turn On VPN &amp; Encrypt Traffic
                      </button>

                      <button
                        onClick={() => handleChooseAction("pay")}
                        className="w-full py-1.5 px-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-[11px] hover:bg-red-900/60 transition cursor-pointer"
                      >
                        Approve ₹9,499 (I Didn&apos;t Notice)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── ACT 5: DECISION OUTCOME ── */}
                {act === "decision_outcome" && (
                  <motion.div
                    key="outcome"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3"
                  >
                    {userDecision === "cancel" ? (
                      <div className="space-y-3 pt-2 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
                          <i className="ti ti-shield-check" />
                        </div>
                        <h2 className="text-base font-bold text-white">ATTACK BLOCKED!</h2>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left text-xs space-y-2 text-zinc-300">
                          <p className="text-emerald-400 font-semibold text-[11px]">
                            ✓ You refused to enter your PIN when the amount didn&apos;t match.
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            The attacker sitting 3 tables away failed to steal your ₹8,000 difference!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 mx-auto flex items-center justify-center text-3xl">
                          <i className="ti ti-skull" />
                        </div>
                        <h2 className="text-base font-bold text-red-400">₹9,499 TRANSFERRED!</h2>
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-left text-xs space-y-2 text-zinc-300">
                          <p className="text-red-400 font-semibold text-[11px]">
                            ✗ You rushed and approved the altered transaction!
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            The attacker intercepted your plaintext request and pocketed your college savings.
                          </p>
                          <div className="text-[10px] text-zinc-400 italic">
                            (No real money was transferred. This is a training drill.)
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_it_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Why Did This Happen? (Full Breakdown) &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 5: VPN EXPERIMENT OUTCOME ── */}
                {act === "vpn_experiment" && (
                  <motion.div
                    key="vpn_exp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between space-y-3 text-center"
                  >
                    <div className="space-y-3 pt-2">
                      <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary text-primary mx-auto flex items-center justify-center text-3xl animate-pulse">
                        <i className="ti ti-shield-lock" />
                      </div>
                      <h2 className="text-base font-bold text-white">VPN TUNNEL ACTIVATED!</h2>

                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-primary/30 text-left text-xs space-y-2 text-zinc-300">
                        <div className="text-primary font-bold text-[11px] flex items-center gap-1.5">
                          <i className="ti ti-lock" /> AES-256 WireGuard Encryption Active
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Your phone wrapped all data in an unbreakable cryptographic tunnel before sending it to the café router.
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold leading-relaxed">
                          Look at the Hacker&apos;s Screen on the right: They can only see scrambled noise!
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_it_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Continue to Public Wi-Fi Defense Rules &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── ACT 6 & 7: FORENSICS & FINAL SCORE ── */}
                {(act === "how_it_works" || act === "final_score") && (
                  <motion.div
                    key="forensics"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-3xl">
                      <i className="ti ti-certificate" />
                    </div>
                    <div className="text-sm font-bold text-white">Drill Complete</div>
                    <p className="text-xs text-zinc-400 max-w-[220px]">
                      Check your forensic breakdown and security awareness score on the right side!
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto" />
          </div>
        </div>

        {/* ── RIGHT COLUMN: THE HACKER'S LAPTOP SCREEN (WHAT THEY SNOOP) ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "hacker" ? "lg:col-span-12" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-danger flex items-center gap-1.5 font-mono">
              <i className="ti ti-terminal-2 text-danger text-base animate-pulse" />
              ATTACKER&apos;S LAPTOP (3 Tables Away in Café)
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Tool: RogueAP-MITM v4.2</span>
          </div>

          {/* Hacker Terminal Window */}
          <div className="rounded-2xl border-2 border-danger/40 bg-zinc-950 shadow-2xl overflow-hidden text-xs font-mono">
            {/* Terminal Title Bar */}
            <div className="bg-zinc-900 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] text-zinc-400 ml-2 font-mono">root@kali-pineapple:~# ./mitm_intercept</span>
              </div>
              <span className="text-[10px] text-danger font-bold uppercase tracking-wider">
                {vpnActive ? "ENCRYPTED - BLOCKED" : "SNIFFER ACTIVE"}
              </span>
            </div>

            {/* Terminal Output Log Feed */}
            <div className="p-4 space-y-2 h-[260px] overflow-y-auto bg-black/90 text-[11px] leading-relaxed scrollbar-thin">
              {hackerLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("CRITICAL") || log.includes("ERROR")
                      ? "text-emerald-400 font-bold"
                      : log.includes("TAMPERING") || log.includes("$$$")
                      ? "text-red-400 font-extrabold bg-red-950/30 p-1 rounded"
                      : log.includes("VICTIM") || log.includes("SNOOPED")
                      ? "text-amber-300"
                      : "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Live Packet Inspection Bar */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-zinc-500 block">ROGUE SSID BROADCAST:</span>
                <span className="text-emerald-400 font-bold">Cafe_FREE_HighSpeed_WiFi</span>
              </div>
              <div>
                <span className="text-zinc-500 block">VICTIM IP &amp; MAC:</span>
                <span className="text-zinc-300 font-mono">192.168.1.104 &bull; 8A:4F:92:B1</span>
              </div>
            </div>
          </div>

          {/* ── EXPLANATION CARDS (HOW MITM REALLY WORKS) ── */}
          {act === "how_it_works" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/30 bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <i className="ti ti-bulb text-lg" />
                HOW DOES A MAN-IN-THE-MIDDLE ATTACK ACTUALLY WORK?
              </div>

              <div className="text-xs text-text-low leading-relaxed space-y-3">
                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">1. The &quot;Evil Twin&quot; Wi-Fi Access Point</strong>
                  <p className="text-[11px]">
                    The hacker did not hack the café. They used a $30 portable Wi-Fi device to create an open network with the café&apos;s name. Your phone connected to the hacker, not the café!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">2. The Position in the Middle</strong>
                  <p className="text-[11px]">
                    Every single request from your phone went: <strong className="text-primary">Your Phone &rarr; Hacker&apos;s Laptop &rarr; Internet</strong>. They act as the middleman.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">3. The SSL/TLS Certificate Warning</strong>
                  <p className="text-[11px]">
                    To alter your payment, the hacker had to break your encryption. Your phone warned you: <em>&quot;Connection could not be securely verified&quot;</em>. Never ignore that warning!
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleFinish}
                className="w-full text-xs font-bold py-2.5"
              >
                View Final Score &amp; Survival Checklist &rarr;
              </Button>
            </motion.div>
          )}

          {/* ── FINAL SCORECARD & SURVIVAL CHEATSHEET ── */}
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
                <h2 className="text-xl font-bold text-text-high">DRILL COMPLETE</h2>
                <div className="text-4xl font-black text-primary font-mono">
                  Score: {score}/100
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <Pill tone="primary" size="md">+{simulationXp(score)} XP Earned</Pill>
                  <Pill tone={score >= 70 ? "emerald" : "warning"} size="md">
                    {score >= 70 ? "🛡️ Threat Neutralized" : "⚠️ Needs Defense Practice"}
                  </Pill>
                </div>
              </div>

              {/* Actionable Golden Rules */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-bold text-text-high">
                  🛡️ 4 Golden Rules for Public Wi-Fi:
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-text-low">
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">1. Never Pay on Open Wi-Fi:</strong>
                    Turn off Wi-Fi and use your 4G/5G mobile hotspot for payments and banking.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">2. Respect Certificate Warnings:</strong>
                    If your browser says &quot;Certificate invalid&quot;, someone is likely intercepting your traffic.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">3. Always Check the Final ₹ Amount:</strong>
                    Check the UPI PIN prompt or SMS OTP to ensure the amount matches your cart.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">4. Use a VPN on Public Networks:</strong>
                    A VPN encrypts your traffic so hackers sitting nearby only see meaningless scramble.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button variant="secondary" onClick={handleReset} className="flex-1 text-xs">
                  <i className="ti ti-rotate-clockwise mr-1.5" /> Replay Scenario
                </Button>
                <Button variant="primary" onClick={() => navigate("/simulations")} className="flex-1 text-xs">
                  More Defense Sandboxes <i className="ti ti-arrow-right ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
