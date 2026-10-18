import { useState, useRef, useId } from "react";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface HashCalculationResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  sha256: string;
  sha1: string;
  isSimulated?: boolean;
  knownMalwareVerdict?: {
    name: string;
    description: string;
    threatLevel: "clean" | "malicious" | "test";
  };
}

const PRESET_HASHES: HashCalculationResult[] = [
  {
    fileName: "eicar_antivirus_test_file.com",
    fileSize: 68,
    fileType: "application/x-dosexec",
    sha256: "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
    sha1: "3395856ce81f2b7382dee72602f798b642f14140",
    isSimulated: true,
    knownMalwareVerdict: {
      name: "EICAR-Standard-AV-Test-File",
      description: "Official European Institute for Computer Antivirus Research benign test file used to test AV scanners without harm.",
      threatLevel: "test",
    },
  },
  {
    fileName: "wannacry_ransomware_dropper.exe",
    fileSize: 3514368,
    fileType: "application/x-msdownload",
    sha256: "ed01ebf83334a193707b0b0f70f7d44e352bc7987327a4f21d92f00fed60e408",
    sha1: "5ff465acf83e723360255522d82f76f2c81e0f83",
    isSimulated: true,
    knownMalwareVerdict: {
      name: "WannaCry / WanaCrypt0r 2.0 (MS17-010 EternalBlue Exploit)",
      description: "Severe nation-state worm & ransomware that infected over 200,000 systems globally across 150 countries in 2017.",
      threatLevel: "malicious",
    },
  },
  {
    fileName: "kernel32.dll",
    fileSize: 782336,
    fileType: "application/x-msdownload",
    sha256: "a6c9869260195ad8640ffdb5452d33458bfb0e6dfbd927f872f0bf237000bfca",
    sha1: "e9392e92c2dae72648714bb1a18ea728a556d113",
    isSimulated: true,
    knownMalwareVerdict: {
      name: "Microsoft Windows Core Operating System Component",
      description: "Authentic, signed core Windows dynamic link library responsible for memory management and process I/O.",
      threatLevel: "clean",
    },
  },
];

async function bufferToHex(buffer: ArrayBuffer): Promise<string> {
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function FileHashCheckerTab() {
  const toast = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [result, setResult] = useState<HashCalculationResult | null>(() => PRESET_HASHES[0]);

  const processFile = async (file: File) => {
    setIsComputing(true);
    try {
      const buffer = await file.arrayBuffer();

      // Compute SHA-256 and SHA-1 in parallel via Web Crypto
      const [sha256Buffer, sha1Buffer] = await Promise.all([
        crypto.subtle.digest("SHA-256", buffer),
        crypto.subtle.digest("SHA-1", buffer),
      ]);

      const sha256 = await bufferToHex(sha256Buffer);
      const sha1 = await bufferToHex(sha1Buffer);

      setResult({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        sha256,
        sha1,
        isSimulated: false,
      });

      toast({ title: "Checksum Computed", description: "Cryptographic hashes computed locally!", variant: "success" });
    } catch {
      toast({ title: "Read Error", description: "Failed to read file for hashing", variant: "error" });
    } finally {
      setIsComputing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${label} copied to clipboard!`, variant: "success" });
    } catch {
      toast({ title: "Copy Failed", description: "Could not access clipboard", variant: "error" });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2">
        <div className="flex items-start gap-3">
          <i className="ti ti-lock-square text-xl shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-300">
              Zero-Upload Local Privacy Guarantee
            </p>
            <p className="text-text-fog leading-relaxed">
              Files dropped or selected here are computed entirely in your browser using the <strong>Web Crypto API</strong>. Not a single byte of your file is ever uploaded or transmitted over the internet.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              Local File Cryptographic Hash &amp; Malware Verifier
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Calculate SHA-256 and SHA-1 checksums locally to verify file integrity and query threat registries like VirusTotal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Presets:</span>
            {PRESET_HASHES.map((p, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => setResult(p)}
                className="text-xs h-7 px-2"
              >
                {idx === 0 ? "EICAR Test File" : idx === 1 ? "WannaCry Dropper" : "Clean OS Binary"}
              </Button>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/50 bg-surface hover:bg-surface-elevated"
          }`}
        >
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center">
              <i className="ti ti-file-upload text-2xl text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-pure">
                Drop any file here, or click to browse
              </p>
              <p className="text-xs text-text-fog mt-1">
                Supports executables, PDFs, installers, documents, zip archives (computed in memory)
              </p>
            </div>
            <Button variant="secondary" size="sm" className="text-xs pointer-events-none">
              Choose File from Disk
            </Button>
          </div>
        </div>

        {/* Calculation Spinner */}
        {isComputing && (
          <div className="flex items-center justify-center gap-3 p-4 text-xs font-semibold text-primary">
            <i className="ti ti-loader animate-spin text-lg" aria-hidden="true" />
            <span>Hashing data in browser memory using Web Crypto SHA-256...</span>
          </div>
        )}

        {/* Hash Output Results */}
        <AnimatePresence mode="wait">
          {result && !isComputing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4 border-t border-border"
            >
              {/* File Info Pill */}
              <div className="p-4 rounded-xl bg-surface border border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <i className="ti ti-file-code text-xl text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-text-pure block truncate max-w-xs sm:max-w-md">
                      {result.fileName}
                    </span>
                    <span className="text-xs text-text-fog">
                      Size: {formatBytes(result.fileSize)} • Type: {result.fileType}
                    </span>
                  </div>
                </div>

                {result.isSimulated && (
                  <Pill tone="warn">Simulated Reference Sample</Pill>
                )}
              </div>

              {/* Known Signature Alert (if preset or recognized) */}
              {result.knownMalwareVerdict && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    result.knownMalwareVerdict.threatLevel === "malicious"
                      ? "bg-danger/10 border-danger/30 text-danger"
                      : result.knownMalwareVerdict.threatLevel === "test"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  }`}
                >
                  <i
                    className={`ti ${
                      result.knownMalwareVerdict.threatLevel === "malicious"
                        ? "ti-alert-octagon text-xl text-danger"
                        : result.knownMalwareVerdict.threatLevel === "test"
                        ? "ti-test-pipe text-xl text-amber-400"
                        : "ti-shield-check text-xl text-emerald-400"
                    } shrink-0 mt-0.5`}
                    aria-hidden="true"
                  />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-sm">{result.knownMalwareVerdict.name}</p>
                    <p className="text-text-fog leading-relaxed">{result.knownMalwareVerdict.description}</p>
                  </div>
                </div>
              )}

              {/* SHA-256 Box */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    SHA-256 Cryptographic Checksum
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.sha256, "SHA-256 hash")}
                    className="text-xs h-6 px-2 text-primary"
                  >
                    <i className="ti ti-copy mr-1" aria-hidden="true" /> Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border font-mono text-xs text-text-pure break-all select-all">
                  {result.sha256}
                </div>
              </div>

              {/* SHA-1 Box */}
              <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-fog">
                    Legacy SHA-1 Checksum
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.sha1, "SHA-1 hash")}
                    className="text-xs h-6 px-2 text-text-fog"
                  >
                    <i className="ti ti-copy mr-1" aria-hidden="true" /> Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-border font-mono text-xs text-text-dim break-all select-all">
                  {result.sha1}
                </div>
              </div>

              {/* Direct Threat Intelligence Lookup Actions */}
              <div className="p-5 rounded-2xl bg-surface border border-border space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-text-pure flex items-center gap-1.5">
                  <i className="ti ti-external-link text-sm" aria-hidden="true" /> Query Public Threat Databases (Zero File Upload)
                </h5>
                <p className="text-xs text-text-fog leading-relaxed">
                  Search whether antivirus vendors and sandbox telemetry have encountered this specific cryptographic hash previously:
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <a
                    href={`https://www.virustotal.com/gui/file/${result.sha256}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <i className="ti ti-search" aria-hidden="true" />
                    Query VirusTotal
                  </a>
                  <a
                    href={`https://bazaar.abuse.ch/sample/${result.sha256}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-text-pure text-xs font-bold hover:bg-surface transition-colors"
                  >
                    <i className="ti ti-virus" aria-hidden="true" />
                    MalwareBazaar Sample Lookup
                  </a>
                  <a
                    href={`https://www.hybrid-analysis.com/search?query=${result.sha256}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-elevated border border-border text-text-pure text-xs font-bold hover:bg-surface transition-colors"
                  >
                    <i className="ti ti-binary" aria-hidden="true" />
                    Hybrid Analysis Sandbox
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
