import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/primitives";
import { celebrate } from "@/lib/celebrate";

interface RansomwareContainmentDrillProps {
  onComplete: (score: number, meta: Record<string, unknown>) => void;
}

type Act =
  | "story_intro"
  | "file_opened"
  | "encryption_surge"
  | "ransom_note"
  | "incident_response"
  | "backup_restored"
  | "ransom_paid_trap"
  | "how_ransomware_works"
  | "final_score";

interface DesktopFile {
  name: string;
  size: string;
  type: string;
  encrypted: boolean;
}

export function RansomwareContainmentDrill({ onComplete }: RansomwareContainmentDrillProps) {
  const navigate = useNavigate();

  // Act & perspective states
  const [act, setAct] = useState<Act>("story_intro");
  const [activeView, setActiveView] = useState<"split" | "workstation" | "c2">("split");
  const [networkIsolated, setNetworkIsolated] = useState(false);
  const [processTerminated, setProcessTerminated] = useState(false);
  const [backupVerified, setBackupVerified] = useState(false);
  const [userChoice, setUserChoice] = useState<"isolate" | "pay" | "restart" | null>(null);
  const [scoreReported, setScoreReported] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(72 * 3600); // 72-hour countdown

  // Live files on victim desktop
  const [files, setFiles] = useState<DesktopFile[]>([
    { name: "Family_Vacation_Photos.zip", size: "4.2 GB", type: "Archive", encrypted: false },
    { name: "Final_Project_SourceCode.ts", size: "18 MB", type: "Code", encrypted: false },
    { name: "Tax_Returns_2025-2026.pdf", size: "3.1 MB", type: "Document", encrypted: false },
    { name: "Company_Payroll_Confidential.xlsx", size: "12 MB", type: "Spreadsheet", encrypted: false },
    { name: "Urgent_Overdue_Invoice_992.pdf.exe", size: "842 KB", type: "Executable", encrypted: false },
  ]);

  // Live encryption simulation during encryption_surge
  useEffect(() => {
    if (act === "encryption_surge" && !processTerminated) {
      const interval = setInterval(() => {
        setFiles((prev) => {
          const unencryptedIdx = prev.findIndex((f) => !f.encrypted && f.name !== "Urgent_Overdue_Invoice_992.pdf.exe");
          if (unencryptedIdx === -1) {
            clearInterval(interval);
            setTimeout(() => setAct("ransom_note"), 800);
            return prev;
          }
          const updated = [...prev];
          updated[unencryptedIdx] = { ...updated[unencryptedIdx], encrypted: true };
          return updated;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [act, processTerminated]);

  // Live countdown timer for the ransom note
  useEffect(() => {
    if (act === "ransom_note") {
      const timer = setInterval(() => {
        setCountdownSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [act]);

  // Attacker Server Logs
  const getC2Logs = () => {
    const logs = [
      "[*] Ransomware attacker server listening for infected computers...",
      "[*] Malware payload: Disguised invoice file (.pdf.exe)",
      "[*] Ready to receive signals when user double-clicks file...",
    ];

    if (act === "file_opened" || act === "encryption_surge") {
      logs.push(
        "[+] INFECTION STARTED: Victim opened the disguised file",
        "[+] Target: Windows 11 PC connected to home/office network",
        "[+] Malware action: Deleting local Windows restore points",
        "[+] SYSTEM RESTORE DISABLED: User cannot roll back system changes",
        "[+] ENCRYPTION STARTED: Scrambling files with secret attacker key"
      );
    }

    if (act === "encryption_surge") {
      logs.push(
        "[>] LOCKING: Personal documents, photos, and project files...",
        "[>] Renaming files to .DARKVAULT_LOCKED (cannot be opened)",
        "[>] Stealing private files to threaten public leak if ransom is not paid"
      );
    }

    if (act === "ransom_note") {
      logs.push(
        "[★] ALL FILES LOCKED: Displaying ransom demand screen to victim",
        "[★] Ransom demand: 0.85 Bitcoin ($48,500) demanded to unlock files",
        "[★] Countdown timer active: threatening to delete unlock keys if timer expires"
      );
    }

    if (networkIsolated) {
      logs.push(
        "[SAFE ALERT] VICTIM DISCONNECTED NETWORK / WI-FI!",
        "[-] Network spread stopped: virus cannot infect other devices on Wi-Fi!",
        "[-] Data theft connection severed."
      );
    }

    if (processTerminated) {
      logs.push(
        "[SAFE] SUSPICIOUS VIRUS TASK STOPPED!",
        "[-] File locking process halted by user intervention."
      );
    }

    if (userChoice === "pay") {
      logs.push(
        "[$$$] VICTIM PAID RANSOM MONEY!",
        "[!] Scammer reality: No unlock key provided (scammers took money and vanished).",
        "[-] Files remain locked despite paying. Never pay a ransomware demand!"
      );
    } else if (backupVerified) {
      logs.push(
        "[-] RANSOM REFUSED: Cleaned PC and restored all files safely from offline backup!",
        "[-] Scammer leverage: 0%. Total financial gain: $0."
      );
    }

    return logs;
  };

  const handleOpenFile = () => {
    setAct("file_opened");
    setTimeout(() => {
      setAct("encryption_surge");
    }, 1200);
  };

  const handleEmergencyIsolate = () => {
    setNetworkIsolated(true);
    setProcessTerminated(true);
    setUserChoice("isolate");
    setAct("incident_response");
  };

  const handlePayRansom = () => {
    setUserChoice("pay");
    setAct("ransom_paid_trap");
  };

  const handleRestoreBackup = () => {
    setBackupVerified(true);
    celebrate();
    setAct("backup_restored");
  };

  const calculateScore = () => {
    if (networkIsolated && backupVerified) {
      return 100;
    }
    if (networkIsolated) {
      return 85;
    }
    return 35;
  };

  const handleFinish = () => {
    const finalScore = calculateScore();
    if (!scoreReported) {
      setScoreReported(true);
      onComplete(finalScore, {
        action: "ransomware_drill_completed",
        score: finalScore,
        network_isolated: networkIsolated,
        backup_restored: backupVerified,
        paid_ransom: userChoice === "pay",
      });
    }
    setAct("final_score");
  };

  const handleReset = () => {
    setAct("story_intro");
    setNetworkIsolated(false);
    setProcessTerminated(false);
    setBackupVerified(false);
    setUserChoice(null);
    setScoreReported(false);
    setFiles([
      { name: "Family_Vacation_Photos.zip", size: "4.2 GB", type: "Archive", encrypted: false },
      { name: "Final_Project_SourceCode.ts", size: "18 MB", type: "Code", encrypted: false },
      { name: "Tax_Returns_2025-2026.pdf", size: "3.1 MB", type: "Document", encrypted: false },
      { name: "Company_Payroll_Confidential.xlsx", size: "12 MB", type: "Spreadsheet", encrypted: false },
      { name: "Urgent_Overdue_Invoice_992.pdf.exe", size: "842 KB", type: "Executable", encrypted: false },
    ]);
  };

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const score = calculateScore();
  const c2Logs = getC2Logs();
  const encryptedFileCount = files.filter((f) => f.encrypted).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── TOP MISSION HUD ── */}
      <div className="p-5 rounded-2xl bg-surface border border-primary/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-danger font-mono">
                Real-World Malware &amp; Extortion Sandbox
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-ash">
                Dual-Perspective Crisis Lab
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-pure">
              The Double-Click Disaster: Anatomy of a Ransomware Attack
            </h1>
            <p className="text-xs sm:text-sm text-text-fog mt-0.5">
              Ever wonder why ransomware terrorizes hospitals and companies? Experience the moment files start locking and learn how to stop the infection in its tracks!
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
                onClick={() => setActiveView("workstation")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "workstation" ? "bg-primary text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-device-desktop mr-1" /> Your Computer
              </button>
              <button
                onClick={() => setActiveView("c2")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  activeView === "c2" ? "bg-danger text-white shadow-sm" : "text-text-fog hover:text-text-pure"
                }`}
              >
                <i className="ti ti-skull mr-1" /> Scammer's Screen
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

        {/* Story Breadcrumbs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border text-xs">
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "story_intro" || act === "file_opened"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STAGE 1</span>
            The Deceptive File
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "encryption_surge"
              ? "bg-danger/15 border-danger text-danger font-bold animate-pulse"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STAGE 2</span>
            Active Encryption Surge
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "ransom_note" || act === "ransom_paid_trap"
              ? "bg-danger/20 border-danger text-danger font-black animate-bounce"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STAGE 3</span>
            The Extortion Note
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "incident_response" || act === "backup_restored"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-500"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STAGE 4</span>
            Air-Gap &amp; Cold Backup
          </div>
          <div className={`p-2 rounded-xl border text-center font-medium ${
            act === "how_ransomware_works" || act === "final_score"
              ? "bg-primary/15 border-primary text-primary"
              : "bg-surface text-text-fog border-border"
          }`}>
            <span className="block text-[10px] text-text-ash">STAGE 5</span>
            3-2-1 Defense Rules
          </div>
        </div>
      </div>

      {/* ── CORE PLAYGROUND: INFECTED WORKSTATION VS DARK WEB C2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT: INFECTED WORKSTATION DESKTOP ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "workstation" ? "lg:col-span-12 max-w-2xl mx-auto" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-pure flex items-center gap-1.5">
              <i className="ti ti-device-desktop text-primary text-sm" />
              VICTIM WORKSTATION (Finance &amp; Personal Laptop)
            </span>
            <span className="text-[11px] text-text-ash font-mono">
              Status: {networkIsolated ? "AIR-GAPPED 🟢" : "ONLINE 🔴"}
            </span>
          </div>

          {/* Desktop Window Shell */}
          <div className="rounded-2xl border-2 border-border bg-card shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between relative">
            
            {/* Top Window Bar */}
            <div className="bg-surface-elevated px-4 py-2.5 border-b border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="font-semibold text-text-high ml-2">File Explorer &bull; Desktop</span>
              </div>
              <span className="text-[11px] font-mono text-text-muted">C:\Users\Rahul\Desktop</span>
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="p-5 flex-1 bg-surface flex flex-col justify-between relative">
              <AnimatePresence mode="wait">

                {/* ── SCENE 1: THE INCOMING ATTACHMENT / DESKTOP SETUP ── */}
                {act === "story_intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1 text-text-high">
                      <div className="font-bold text-primary flex items-center gap-1.5">
                        <i className="ti ti-mail" /> New Download: &quot;Urgent_Overdue_Invoice_992.pdf.exe&quot;
                      </div>
                      <p className="text-[11px] text-text-low leading-relaxed">
                        You downloaded an email attachment claiming your phone bill or college fees are overdue. Notice the double extension: Windows hid the <code>.exe</code>, so it looks like a normal PDF icon!
                      </p>
                    </div>

                    {/* Desktop Files Grid */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Files On Your Computer:
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {files.map((file, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                              file.name.includes(".exe")
                                ? "border-danger/40 bg-danger/5 hover:border-danger hover:bg-danger/10"
                                : "border-border bg-card"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <i className={`ti ${
                                file.name.includes(".exe")
                                  ? "ti-file-type-pdf text-red-500 text-lg"
                                  : file.name.includes(".zip")
                                  ? "ti-file-zip text-amber-500 text-lg"
                                  : file.name.includes(".xlsx")
                                  ? "ti-file-spreadsheet text-emerald-500 text-lg"
                                  : "ti-file-code text-primary text-lg"
                              }`} />
                              <div>
                                <div className="font-semibold text-text-high">{file.name}</div>
                                <div className="text-[10px] text-text-muted">{file.size} &bull; {file.type}</div>
                              </div>
                            </div>

                            {file.name.includes(".exe") && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={handleOpenFile}
                                className="text-[11px] py-1 h-auto"
                              >
                                Double-Click to Open
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-text-muted pt-2">
                      💡 Click &quot;Double-Click to Open&quot; to see what happens when malware executes!
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 2: EXECUTING & ENCRYPTION SURGE ── */}
                {(act === "file_opened" || act === "encryption_surge") && (
                  <motion.div
                    key="surge"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Active Malware Alert Banner */}
                    <div className="p-3.5 rounded-xl bg-red-500/15 border-2 border-red-500/50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400 flex items-center gap-1.5">
                          <i className="ti ti-alert-octagon animate-spin" />
                          MALWARE EXECUTION ACTIVE (PID 4912)
                        </span>
                        <span className="text-[10px] font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold">
                          CPU: 99.4%
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-200">
                        The background process <code>svchost_updater.bin</code> is iterating through your hard drive, encrypting files with AES-256 and wiping backup shadow copies!
                      </p>
                    </div>

                    {/* Live Encrypting Files Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-text-muted">ENCRYPTED FILES:</span>
                        <span className="text-red-400 font-bold">{encryptedFileCount} / 4 FILES LOCKED</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                        {files.map((file, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                              file.encrypted
                                ? "border-red-500/60 bg-red-500/10 text-red-400 font-bold"
                                : "border-border bg-card text-text-high"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <i className={`ti ${file.encrypted ? "ti-lock text-red-500" : "ti-file"}`} />
                              <span>{file.name}{file.encrypted ? ".DARKVAULT_LOCKED" : ""}</span>
                            </div>
                            <span className="text-[10px]">
                              {file.encrypted ? "🔒 ENCRYPTED" : "Queued..."}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Emergency Interruption Option */}
                    <div className="pt-2">
                      <Button
                        variant="danger"
                        onClick={handleEmergencyIsolate}
                        className="w-full text-xs font-bold py-2.5 shadow-lg flex items-center justify-center gap-2"
                      >
                        <i className="ti ti-wifi-off" />
                        🚨 EMERGENCY: PULL THE NETWORK CABLE &amp; KILL PROCESS!
                      </Button>
                      <span className="text-[10px] text-text-muted block text-center mt-1">
                        (Or wait 3 seconds to see the full ransom screen)
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 3: THE BLOOD-RED RANSOM NOTE SCREEN ── */}
                {act === "ransom_note" && (
                  <motion.div
                    key="note"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-black border-4 border-red-600 text-white space-y-4 text-center shadow-2xl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-red-600/20 border-2 border-red-600 text-red-500 mx-auto flex items-center justify-center text-4xl animate-pulse">
                      <i className="ti ti-skull" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black tracking-widest text-red-500 font-mono">
                        ☠️ ALL YOUR FILES HAVE BEEN ENCRYPTED! ☠️
                      </h2>
                      <p className="text-xs text-zinc-300 mt-1">
                        DarkVault Ransomware Syndicate &bull; ID: #VICTIM-9941
                      </p>
                    </div>

                    {/* Ransom Demand Box */}
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-red-500/50 space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>RANSOM DEMAND:</span>
                        <span className="text-amber-400 font-bold text-sm">0.85 BITCOIN (~$48,500 USD)</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>TIME BEFORE KEY DESTRUCTION:</span>
                        <span className="text-red-500 font-black text-sm animate-pulse">
                          {formatCountdown(countdownSeconds)}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 text-left pt-1 border-t border-zinc-800">
                        Send Bitcoin to: <code>bc1q9x7h2km098fa110992388471az</code>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-300 text-left leading-relaxed space-y-1">
                      <p>
                        We have encrypted all your personal photos, tax records, and company payroll with military-grade <strong>AES-256 + RSA-4096</strong>.
                      </p>
                      <p className="text-red-400 font-semibold">
                        ⚠️ Do not rename files. Do not restart. Only our private key can restore your files.
                      </p>
                    </div>

                    {/* Crisis Decision Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleEmergencyIsolate}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <i className="ti ti-shield-check" /> 🛡️ Isolate Network &amp; Start Recovery
                      </button>

                      <button
                        onClick={handlePayRansom}
                        className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-400 border border-red-800/60 font-medium text-xs transition cursor-pointer"
                      >
                        Pay Ransom (0.85 BTC)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 4: RANSOM PAID TRAP (THE SCAM) ── */}
                {act === "ransom_paid_trap" && (
                  <motion.div
                    key="paid_trap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-red-950/20 border-2 border-red-500 text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 border-2 border-red-500 mx-auto flex items-center justify-center text-3xl">
                      <i className="ti ti-currency-bitcoin" />
                    </div>

                    <h2 className="text-base font-black text-danger">YOU PAID $48,500... BUT NOTHING HAPPENED!</h2>

                    <div className="p-4 rounded-xl bg-surface border border-red-500/30 text-left text-xs space-y-2 text-text-high">
                      <p className="font-bold text-danger">
                        The Painful Reality of Paying Ransomware:
                      </p>
                      <ul className="list-disc list-inside text-[11px] text-text-low space-y-1">
                        <li>Over <strong>42% of victims who pay never receive the decryption key</strong>. Criminals have zero customer support!</li>
                        <li>Even if you get a key, the malware often corrupts 20-30% of files beyond recovery.</li>
                        <li>Your payment funds human trafficking and international crime cartels.</li>
                        <li>You are now flagged on dark web forums as a &quot;willing payer,&quot; making you a prime target for a second attack within 6 months!</li>
                      </ul>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleEmergencyIsolate}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Learn How Incident Responders Actually Handle This &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── SCENE 5: INCIDENT RESPONSE TRIAGE ── */}
                {act === "incident_response" && (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                      <div className="font-bold text-emerald-500 flex items-center gap-1.5">
                        <i className="ti ti-check" /> Network Quarantined &amp; Malicious PID Killed!
                      </div>
                      <p className="text-[11px] text-text-low">
                        By pulling the network connection, you stopped the ransomware from jumping across your router to infect other computers and cloud shares!
                      </p>
                    </div>

                    {/* Step-by-Step IR Actions */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-text-high">Incident Response Containment Steps:</div>

                      <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="ti ti-wifi-off text-emerald-500 text-base" />
                          <div>
                            <span className="font-bold text-text-high block">1. Air-Gap Adapter</span>
                            <span className="text-[10px] text-text-muted">Network interface disabled</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-bold font-mono">COMPLETE ✓</span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="ti ti-cpu text-emerald-500 text-base" />
                          <div>
                            <span className="font-bold text-text-high block">2. Kill Malicious Process</span>
                            <span className="text-[10px] text-text-muted">SIGKILL sent to PID 4912</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-500 font-bold font-mono">TERMINATED ✓</span>
                      </div>

                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <i className="ti ti-database-import text-primary text-base" />
                          <div>
                            <span className="font-bold text-primary block">3. Restore from Immutable Cold Backup</span>
                            <span className="text-[10px] text-text-low">External offline drive (Air-Gapped)</span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleRestoreBackup}
                          className="text-xs"
                        >
                          Restore Files Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── SCENE 6: BACKUP RESTORED (THE VICTORY) ── */}
                {act === "backup_restored" && (
                  <motion.div
                    key="restored"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500 mx-auto flex items-center justify-center text-3xl">
                      <i className="ti ti-refresh" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-emerald-500">100% OF FILES RESTORED CLEANLY!</h2>
                      <p className="text-xs text-text-low mt-0.5">
                        Restored from immutable offline backup dated yesterday at 2:00 AM
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-emerald-500/30 text-left text-xs space-y-1.5 text-text-high">
                      <div className="font-bold text-emerald-400">🛡️ The Power of the 3-2-1 Backup Strategy:</div>
                      <p className="text-[11px] text-text-low leading-relaxed">
                        Because you maintained an offline copy of your hard drive disconnected from the internet, the hackers had <strong>ZERO leverage</strong> over you. You wiped the machine and recovered in minutes without paying a single rupee!
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => setAct("how_ransomware_works")}
                      className="w-full text-xs font-bold py-2.5"
                    >
                      Review Key Forensics &amp; Claim Score &rarr;
                    </Button>
                  </motion.div>
                )}

                {/* ── SCENE 7 & 8: FORENSIC DEBRIEF ── */}
                {(act === "how_ransomware_works" || act === "final_score") && (
                  <motion.div
                    key="forensic_view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-3xl">
                      <i className="ti ti-shield-check" />
                    </div>
                    <div className="text-sm font-bold text-text-high">Containment Triage Complete</div>
                    <p className="text-xs text-text-low max-w-[240px]">
                      Check the right panel for the technical forensic analysis and your final score!
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom System Bar */}
            <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center justify-between text-[11px] text-text-muted font-mono">
              <span>Endpoint: WORKSTATION-ENG-092</span>
              <span>Memory Integrity: {processTerminated ? "CLEAN" : "INFECTED"}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: DARK WEB C2 DASHBOARD & ATTACK VISUALIZATION ── */}
        <div className={`${
          activeView === "split" ? "lg:col-span-6" : activeView === "c2" ? "lg:col-span-12" : "hidden"
        } space-y-4`}>
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-danger flex items-center gap-1.5 font-mono">
              <i className="ti ti-terminal-2 text-danger text-base animate-pulse" />
              DARK WEB C2 CONSOLE (DarkVault Ransomware Operator)
            </span>
            <span className="text-[11px] font-mono text-text-muted">Tor: .onion gateway</span>
          </div>

          {/* Attacker C2 Terminal */}
          <div className="rounded-2xl border-2 border-danger/40 bg-zinc-950 shadow-2xl overflow-hidden text-xs font-mono">
            {/* Terminal Title Bar */}
            <div className="bg-zinc-900 px-4 py-2.5 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] text-zinc-400 ml-2">darkvault@c2-tor-node:~# ./lockbit_srv</span>
              </div>
              <span className="text-[10px] text-danger font-bold uppercase tracking-wider">
                {backupVerified ? "LEVERAGE DESTROYED" : "PAYLOAD ACTIVE"}
              </span>
            </div>

            {/* Terminal Logs */}
            <div className="p-4 space-y-2 h-[260px] overflow-y-auto bg-black/90 text-[11px] leading-relaxed scrollbar-thin">
              {c2Logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes("CRITICAL") || log.includes("REFUSED")
                      ? "text-emerald-400 font-bold"
                      : log.includes("DESTROYED") || log.includes("$$$")
                      ? "text-red-400 font-extrabold bg-red-950/40 p-1 rounded"
                      : log.includes("BEACON") || log.includes("ENCRYPTING")
                      ? "text-amber-300 font-bold"
                      : "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            {/* C2 Telemetry Footer */}
            <div className="p-3 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-zinc-500 block">ENCRYPTION CIPHER:</span>
                <span className="text-amber-400 font-bold">AES-256-CBC + RSA-4096</span>
              </div>
              <div>
                <span className="text-zinc-500 block">SHADOW COPIES:</span>
                <span className="text-danger font-bold">{act === "story_intro" ? "INTACT" : "WIPED (vssadmin)"}</span>
              </div>
            </div>
          </div>

          {/* ── EDUCATIONAL DEBRIEF: HOW RANSOMWARE REALLY WORKS ── */}
          {act === "how_ransomware_works" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-primary/30 bg-surface p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <i className="ti ti-bulb text-lg" />
                HOW RANSOMWARE WORKS &amp; HOW TO DEFEAT IT
              </div>

              <div className="text-xs text-text-low leading-relaxed space-y-3">
                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">1. The Double Extension Trick (.pdf.exe)</strong>
                  <p className="text-[11px]">
                    By default, Windows hides file extensions. Hackers name files <code>Invoice.pdf.exe</code> with a PDF icon so victims think it is an innocent document. Always enable &quot;Show file extensions&quot;!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">2. Why Pulling the Network Cable is Step #1</strong>
                  <p className="text-[11px]">
                    Ransomware is programmed to scan your Wi-Fi and corporate network to lock shared network drives, cloud sync folders, and other computers. Severing the connection contains the blast radius!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated border border-border space-y-1">
                  <strong className="text-text-high block text-xs">3. The 3-2-1 Backup Strategy (Cryptonite to Ransomware)</strong>
                  <p className="text-[11px]">
                    Maintain <strong>3</strong> copies of your data, on <strong>2</strong> different media, with <strong>1</strong> copy completely offline (cold storage / unplugged external drive). If ransomware hits, wipe the computer and restore.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleFinish}
                className="w-full text-xs font-bold py-2.5"
              >
                View Final Score &amp; Containment Certification &rarr;
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
                <h2 className="text-xl font-bold text-text-high">RANSOMWARE CONTAINMENT COMPLETE</h2>
                <div className="text-4xl font-black text-primary font-mono">
                  Score: {score}/100
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <Pill tone="primary" size="md">+{score} XP Earned</Pill>
                  <Pill tone={score >= 70 ? "emerald" : "danger"} size="md">
                    {score >= 70 ? "🛡️ Incident Triage: EXPERT" : "⚠️ Compromised: Needs Practice"}
                  </Pill>
                </div>
              </div>

              {/* Actionable Rules */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-bold text-text-high">
                  🛡️ 4 Golden Rules to Defeat Ransomware:
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-text-low">
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">1. Never Pay the Ransom:</strong>
                    Paying guarantees nothing, funds crime, and makes you a repeat target.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">2. Isolate Network Immediately:</strong>
                    Pull the ethernet cable or turn off Wi-Fi within seconds to prevent spread.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">3. Maintain Offline Backups:</strong>
                    Cloud sync folders can get encrypted too! Keep an unplugged external hard drive.
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-border">
                    <strong className="text-text-pure block mb-0.5">4. Check NoMoreRansom.org:</strong>
                    Before panicking, check if global law enforcement has released a free decryption key.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button variant="secondary" onClick={handleReset} className="flex-1 text-xs">
                  <i className="ti ti-rotate-clockwise mr-1.5" /> Replay Drill
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
