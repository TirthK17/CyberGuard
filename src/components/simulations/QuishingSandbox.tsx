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

interface QuishingSandboxProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "inspect_physical_qr"
  | "camera_preview"
  | "phishing_checkout"
  | "card_compromised"
  | "defense_triumph"
  | "final_score";

const RULES: DefenseRule[] = [
  {
    icon: "ti-qrcode",
    title: "Check for Physical Stickers",
    description: "Inspect public QR codes on parking meters, tables, or kiosks. Scammers paste deceptive stickers over original signs.",
    type: "do",
  },
  {
    icon: "ti-link",
    title: "Preview Full URL Before Tapping",
    description: "Look at the domain name in your camera app preview before opening. Check if it matches the genuine official organization (.gov.in vs .top/.site).",
    type: "do",
  },
  {
    icon: "ti-credit-card-off",
    title: "Never Enter Card CVV on Shortened Links",
    description: "Public parking services rarely require full debit/credit card CVV on unauthenticated random websites.",
    type: "dont",
  },
];

export function QuishingSandbox({ onComplete }: QuishingSandboxProps) {
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
    initialAct: "inspect_physical_qr",
    totalActs: 5,
    onComplete,
  });

  const [inspectedPhysical, setInspectedPhysical] = useState(false);
  const [inspectedUrl, setInspectedUrl] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);

  // Attacker C2 Logs
  const getLogs = () => {
    const logs = [
      "[*] Quishing (QR Phishing) Campaign active: 'Metro City Smart Parking'",
      "[*] Physical rogue sticker deployed over municipal parking kiosk meter #42",
      "[*] QR payload points to reverse-proxy: 'https://smartparking-city-quickpay.top/checkout'",
    ];

    if (act === "inspect_physical_qr") {
      logs.push(
        "[>] Victim standing in front of municipal parking meter with mobile camera ready",
        "[*] Waiting for victim to scan weaponized QR code..."
      );
      if (inspectedPhysical) {
        logs.push(
          "[!] ALERT: Victim is touching the sign and inspecting the sticker edge! Tampering may be spotted."
        );
      }
    }

    if (act === "camera_preview") {
      logs.push(
        "[+] QR CODE SCANNED BY SMARTPHONE CAMERA!",
        `[>] Camera app previewing: 'https://smartparking-city-quickpay.top/checkout'`
      );
      if (inspectedUrl) {
        logs.push(
          "[!] VIGILANCE DETECTED: Victim expanded URL preview and scrutinized the .top top-level domain!"
        );
      }
    }

    if (act === "phishing_checkout") {
      logs.push(
        "[+] VICTIM OPENED MALICIOUS CHECKOUT PAGE!",
        "[*] Cloned layout of Municipal Transport Authority loaded",
        "[*] Injected JavaScript keylogger listening on card and CVV input fields..."
      );
      if (cardNumber) {
        logs.push(`[CAPTURED] Partial Card: ${cardNumber.slice(0, 4)} **** **** ****`);
      }
    }

    if (act === "card_compromised") {
      logs.push(
        "[PWNED] FULL CREDIT CARD & CVV INTERCEPTED!",
        `[★] Stolen Card Data exfiltrated to Telegram C2 bot`,
        `[★] Attempting immediate test charge: INR 10,000 at international merchant`,
        "[ALERT] Card cloned and stored in compromised breach database."
      );
    }

    if (act === "defense_triumph") {
      logs.push(
        "[SAFE] QUISHING ATTACK PREVENTED!",
        "[SAFE] Victim detected physical overlay sticker / malicious domain.",
        "[SAFE] Victim paid using official parking app directly and reported sticker to staff.",
        "[SAFE] Zero credentials captured. Attack foiled!"
      );
    }

    return logs;
  };

  const handleReportSticker = () => {
    setHasReported(true);
    setAct("defense_triumph");
    completeFlow(100, {
      scenario: "quishing_attack",
      reported_phishing_sticker: true,
      inspected_physical: inspectedPhysical,
      inspected_url: inspectedUrl,
    });
  };

  const handlePayOnPhishingSite = () => {
    if (!cardNumber.trim() || !cvv.trim()) {
      setInputError("Please enter demo card numbers or use demo autofill.");
      return;
    }
    setInputError(null);
    setAct("card_compromised");
    completeFlow(25, {
      scenario: "quishing_attack",
      submitted_card_credentials: true,
    });
  };

  const handleAutofillDemoCard = () => {
    setCardNumber("4532 8920 1192 3841");
    setCvv("839");
    setInputError(null);
  };

  const handleReset = () => {
    resetFlow();
    setInspectedPhysical(false);
    setInspectedUrl(false);
    setCardNumber("");
    setCvv("");
    setInputError(null);
    setHasReported(false);
  };

  const score = hasReported ? (inspectedPhysical && inspectedUrl ? 100 : 90) : 25;

  const scoreBreakdown: ScoreBreakdownItem[] = hasReported
    ? [
        {
          type: "success",
          text: "Identified the weaponized QR code sticker and avoided entering card details on the fraudulent site.",
        },
        {
          type: "success",
          text: "Reported the tampered meter sticker to parking authorities, preventing other citizens from being compromised.",
        },
        ...(inspectedUrl
          ? [
              {
                type: "success" as const,
                text: "Scrutinized the URL preview before tapping and caught the fake '.top' domain extension.",
              },
            ]
          : []),
      ]
    : [
        {
          type: "warning",
          text: "Scanned an unverified public QR code sticker and navigated directly to an unverified website.",
        },
        {
          type: "warning",
          text: "Entered card number and CVV on a deceptive domain, compromising your financial payment details.",
        },
      ];

  return (
    <div className="space-y-6">
      {/* Simulation HUD */}
      <SimHud
        title="Quishing: Weaponized QR Code Phishing"
        categoryLabel="Physical & Mobile Social Engineering"
        currentActIndex={
          act === "inspect_physical_qr"
            ? 0
            : act === "camera_preview"
            ? 1
            : act === "phishing_checkout"
            ? 2
            : 3
        }
        totalActs={4}
        actLabel={
          act === "inspect_physical_qr"
            ? "Inspect Parking Meter QR"
            : act === "camera_preview"
            ? "Camera Scan & URL Preview"
            : act === "phishing_checkout"
            ? "Deceptive Payment Portal"
            : "Debrief & Score"
        }
        score={act === "final_score" || act === "defense_triumph" || act === "card_compromised" ? score : undefined}
        beginnerClues={beginnerClues}
        onToggleClues={toggleClues}
        onReset={handleReset}
        activeView={activeView}
        onViewChange={setActiveView}
        victimLabel="Mobile Camera / Browser"
        hackerLabel="Reverse Proxy Terminal"
      />

      {/* Main Simulation Viewport */}
      {act === "final_score" ? (
        <ScoreCard
          score={score}
          scenarioTitle="Quishing: QR Code Phishing Attack"
          goldenRule="Always inspect public QR codes for physical sticker overlays, and verify the destination domain in your camera app preview before entering payment credentials!"
          breakdown={scoreBreakdown}
          onRetry={handleReset}
          nextSimulationUrl="/simulations"
          nextSimulationLabel="Explore Next Simulation"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Victim Screen (Left / Primary) */}
          <div
            className={`${
              activeView === "hacker" ? "hidden" : activeView === "split" ? "lg:col-span-7" : "lg:col-span-12"
            }`}
          >
            <PhoneFrame isAttacked={isAttacked} isProtected={isProtected}>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Act 1: Inspect Physical Meter QR Code */}
                {act === "inspect_physical_qr" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3 text-center">
                      <Pill tone="warn" size="sm">Parking Meter #42</Pill>
                      <h3 className="text-base font-bold text-text-pure">
                        Metro City Municipal Parking
                      </h3>
                      <p className="text-xs text-text-fog leading-relaxed">
                        You parked your car in a city downtown lot. A metallic sign on the parking meter displays a payment QR code.
                      </p>

                      {/* The QR Code Graphic with Sticker Overlay Indicator */}
                      <div className="relative inline-block mx-auto p-4 rounded-2xl bg-white text-zinc-950 shadow-inner">
                        <i className="ti ti-qrcode text-7xl block text-zinc-900" />
                        <span className="block text-[10px] font-mono font-bold mt-1 tracking-wider uppercase text-zinc-700">
                          Scan to Pay ₹50 Parking Fee
                        </span>

                        {inspectedPhysical && (
                          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-md animate-bounce">
                            ⚠️ Sticker Edges Detected!
                          </div>
                        )}
                      </div>

                      {beginnerClues && (
                        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 text-left space-y-1">
                          <strong className="flex items-center gap-1 font-bold">
                            <i className="ti ti-bulb text-xs" /> Beginner Clue:
                          </strong>
                          <p>
                            Physical stickers pasted over legitimate signs are the #1 quishing vector. Always inspect if the QR code is printed directly on the metal sign or pasted as a paper sticker.
                          </p>
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setInspectedPhysical(true)}
                          className="text-xs text-primary hover:underline font-medium cursor-pointer"
                        >
                          {inspectedPhysical
                            ? "✓ Examined Sign: A paper sticker is pasted over the original meter sign!"
                            : "Touch and inspect QR code physical edges"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => setAct("camera_preview")}
                      >
                        <i className="ti ti-camera mr-1.5" />
                        Open Mobile Camera to Scan QR Code
                      </Button>

                      {inspectedPhysical && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-emerald-400 hover:text-emerald-300 border-emerald-500/30"
                          onClick={handleReportSticker}
                        >
                          <i className="ti ti-shield-check mr-1.5" />
                          Spot Fake Sticker &amp; Pay via Official App
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Act 2: Camera Viewfinder with URL Preview */}
                {act === "camera_preview" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 text-center"
                  >
                    <div className="relative h-48 rounded-xl bg-zinc-900 border border-dashed border-zinc-700 flex flex-col items-center justify-center p-4">
                      {/* Viewfinder Target Reticle */}
                      <div className="w-28 h-28 border-2 border-emerald-400/80 rounded-2xl flex items-center justify-center relative">
                        <i className="ti ti-qrcode text-4xl text-emerald-400/80 animate-pulse" />
                        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400" />
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400" />
                        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400" />
                      </div>

                      {/* Camera URL Notification Popup */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-2 inset-x-2 p-2.5 rounded-xl bg-zinc-800/95 border border-zinc-700 text-left shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 font-semibold uppercase">
                            Website Detected
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">.top domain</span>
                        </div>
                        <p className="font-mono text-xs text-white truncate mt-0.5">
                          smartparking-city-quickpay.top/checkout
                        </p>
                      </motion.div>
                    </div>

                    {beginnerClues && (
                      <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 text-left space-y-1">
                        <strong className="flex items-center gap-1 font-bold">
                          <i className="ti ti-bulb text-xs" /> Suspicious Domain Clue:
                        </strong>
                        <p>
                          Genuine municipal government websites in India end with <strong>.gov.in</strong> or legitimate portal domains—never random top-level domains like <strong>.top</strong> or <strong>.click</strong>!
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full"
                        onClick={handleReportSticker}
                      >
                        <i className="ti ti-flag mr-1.5" />
                        Reject URL &amp; Report Scam Sticker
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs text-text-ash hover:text-text-pure"
                        onClick={() => {
                          setInspectedUrl(true);
                          setAct("phishing_checkout");
                        }}
                      >
                        <span>Open Link in Browser to Test</span>
                        <i className="ti ti-arrow-right ml-1.5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Act 3: Deceptive Browser Phishing Checkout */}
                {act === "phishing_checkout" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-surface-elevated border border-border space-y-3"
                  >
                    {/* Browser Address Bar */}
                    <div className="p-2 rounded-xl bg-background border border-border flex items-center justify-between text-xs font-mono">
                      <span className="text-red-400 flex items-center gap-1 text-[11px]">
                        <i className="ti ti-lock-open" />
                        smartparking-city-quickpay.top
                      </span>
                      <Pill tone="danger" size="sm">Untrusted</Pill>
                    </div>

                    <div className="text-center pb-1">
                      <h4 className="text-sm font-bold text-text-pure">
                        Metro City Parking Clearance
                      </h4>
                      <p className="text-xs text-text-ash">Fee: ₹50.00 (Slot #42)</p>
                    </div>

                    {/* Credit Card Input Trap */}
                    <div className="space-y-2 text-left">
                      <div>
                        <label className="text-[11px] font-medium text-text-ash block mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• ••••"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-text-pure focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-text-ash block mb-1">
                            Expiry
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            defaultValue="08/28"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-text-pure font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-text-ash block mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border text-text-pure font-mono"
                          />
                        </div>
                      </div>

                      {inputError && (
                        <p className="text-[11px] text-red-400 font-medium">{inputError}</p>
                      )}

                      <button
                        type="button"
                        onClick={handleAutofillDemoCard}
                        className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        Auto-fill Demo Card
                      </button>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full font-bold"
                        onClick={handlePayOnPhishingSite}
                      >
                        Pay ₹50 on Unverified Site
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-emerald-400 hover:text-emerald-300"
                        onClick={handleReportSticker}
                      >
                        <i className="ti ti-shield-check mr-1.5" />
                        Close Tab &amp; Report Fraudulent QR Code
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Act 4: Compromised Screen */}
                {act === "card_compromised" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500/40 space-y-4 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
                      <i className="ti ti-credit-card-off" />
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-red-400">
                        Payment Credentials Intercepted!
                      </h4>
                      <p className="text-xs text-text-fog mt-2 leading-relaxed">
                        The QR code directed you to an adversary reverse proxy. The attackers captured your complete 16-digit card number and CVV, attempting fraudulent transactions within seconds.
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
                        Weaponized QR Code Thwarted!
                      </h4>
                      <p className="text-xs text-text-fog mt-2 leading-relaxed">
                        Superb eye for detail! By inspecting physical tampering on the sign and vetting the destination URL before entering credentials, you kept your financial accounts completely secure.
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
                  <span>Helpline: <strong>1930</strong> • National Cyber Crime Portal</span>
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
              title="QUISHING HARVESTER FEED"
            />

            <RulesGrid rules={RULES} />
          </div>
        </div>
      )}
    </div>
  );
}
