import { useState, useRef, useEffect, useId } from "react";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { Card, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { analyzeCustomUrl, type UrlAnalysisResult } from "@/lib/urlAnalyzer";
import { motion, AnimatePresence } from "framer-motion";

interface QrPreset {
  name: string;
  url: string;
  context: string;
  scenario: string;
}

const PRESET_SCENARIOS: QrPreset[] = [
  {
    name: "Parking Meter Quishing Scam",
    url: "http://city-parking-pay.quick-meter.shop/pay?meter=9821&fine=500.apk",
    context: "Physical QR sticker affixed over an official municipal parking meter",
    scenario: "Directs drivers to an unencrypted domain downloading an APK payload masquerading as a city payment app.",
  },
  {
    name: "Spoofed Microsoft 365 MFA Lure",
    url: "https://login.microsoft.com.account-reauth.ru/authenticator/session?token=49102",
    context: "Phishing email urging user to scan QR with phone to 'verify authenticator session'",
    scenario: "Exploits quishing to bypass corporate email security gateways by hiding phishing URLs inside image files.",
  },
  {
    name: "National Cyber Helpline (Official)",
    url: "https://cybercrime.gov.in/Webform/Helpline.aspx",
    context: "Official Government of India portal for reporting financial cyber fraud",
    scenario: "Legitimate HTTPS portal managed by the Indian Cyber Crime Coordination Centre (I4C).",
  },
];

export function QrSafetyScannerTab() {
  const toast = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [decodedText, setDecodedText] = useState(PRESET_SCENARIOS[0].url);
  const [analysis, setAnalysis] = useState<UrlAnalysisResult | null>(() =>
    analyzeCustomUrl(PRESET_SCENARIOS[0].url)
  );
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string>("");
  const [activeContext, setActiveContext] = useState<string>(PRESET_SCENARIOS[0].context);

  // Generate QR preview for the active decoded text
  useEffect(() => {
    if (decodedText) {
      QRCode.toDataURL(decodedText, { width: 220, margin: 2 })
        .then((url) => setQrImageDataUrl(url))
        .catch(() => setQrImageDataUrl(""));
    }
  }, [decodedText]);

  // Decode image from canvas using jsQR / BarcodeDetector
  const decodeImageElement = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      setDecodedText(code.data);
      setAnalysis(analyzeCustomUrl(code.data));
      setActiveContext("Decoded from uploaded image file");
      toast({ title: "QR Decoded", description: "QR Code payload successfully decoded!", variant: "success" });
    } else {
      toast({ title: "No QR Code", description: "No valid QR code detected in this image", variant: "info" });
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => decodeImageElement(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Camera scanner handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanningCamera(true);
      toast({ title: "Camera Active", description: "Point at a QR code to scan.", variant: "info" });
    } catch {
      toast({ title: "Camera Error", description: "Camera access denied or unavailable", variant: "error" });
      setIsScanningCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanningCamera(false);
  };

  // Camera animation frame loop for QR decoding
  useEffect(() => {
    let animId: number;
    const scanFrame = () => {
      if (isScanningCamera && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            setDecodedText(code.data);
            setAnalysis(analyzeCustomUrl(code.data));
            setActiveContext("Decoded from live camera stream");
            toast({ title: "QR Captured", description: "QR Code decoded from camera!", variant: "success" });
            stopCamera();
            return;
          }
        }
      }
      if (isScanningCamera) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (isScanningCamera) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isScanningCamera, toast]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const loadPreset = (preset: QrPreset) => {
    setDecodedText(preset.url);
    setAnalysis(analyzeCustomUrl(preset.url));
    setActiveContext(preset.context);
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
        <div className="flex items-start gap-3">
          <i className="ti ti-qrcode text-xl shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-200">
              What is Quishing (QR Phishing)?
            </p>
            <p className="text-text-fog leading-relaxed">
              Attackers place malicious QR stickers over legitimate payment kiosks, parking meters, and restaurant tables, or embed QR codes in emails to bypass corporate security gateways. Always inspect the destination URL before entering credentials or approving payments.
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-text-pure">
              QR Code Safety &amp; Quishing Scanner
            </h3>
            <p className="mt-1 text-xs text-text-fog">
              Scan or upload any QR code to safely unpack its encoded destination and inspect the web link for spoofing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-text-fog">Presets:</span>
            {PRESET_SCENARIOS.map((p, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => loadPreset(p)}
                className="text-xs h-7 px-2"
              >
                {idx === 0 ? "Parking Quish" : idx === 1 ? "M365 Phish" : "Gov Portal"}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Methods: File Upload or Camera */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Image Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary/50 bg-surface hover:bg-surface-elevated rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
          >
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <i className="ti ti-photo-up text-xl text-primary" aria-hidden="true" />
            </div>
            <p className="font-bold text-xs text-text-pure">Upload QR Image File</p>
            <p className="text-[11px] text-text-fog">PNG, JPG, WEBP, or screenshot</p>
          </div>

          {/* Camera Scanner Box */}
          <div className="border border-border bg-surface rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
              <i className="ti ti-camera text-xl text-primary" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="font-bold text-xs text-text-pure">Live Camera Scanner</p>
              <p className="text-[11px] text-text-fog">Scan real QR codes with your device webcam</p>
            </div>
            {isScanningCamera ? (
              <Button variant="danger" size="sm" onClick={stopCamera} className="text-xs h-8">
                <i className="ti ti-camera-off mr-1" aria-hidden="true" /> Stop Camera
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={startCamera} className="text-xs h-8">
                <i className="ti ti-video mr-1" aria-hidden="true" /> Start Live Scan
              </Button>
            )}
          </div>
        </div>

        {/* Live Camera Viewport */}
        {isScanningCamera && (
          <div className="relative rounded-2xl overflow-hidden border border-border bg-black max-w-sm mx-auto aspect-square flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-8 border-2 border-primary/80 rounded-xl pointer-events-none animate-pulse" />
            <span className="absolute bottom-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-mono">
              Aligning QR code in viewfinder...
            </span>
          </div>
        )}

        {/* Decoded QR Payload & Inspection Results */}
        <AnimatePresence mode="wait">
          {decodedText && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-4 border-t border-border"
            >
              {/* QR Code Graphic & Raw Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 rounded-xl bg-surface border border-border">
                {qrImageDataUrl && (
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white shrink-0 mx-auto sm:mx-0">
                    <img
                      src={qrImageDataUrl}
                      alt="Rendered QR Code Preview"
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[10px] font-mono text-zinc-600 mt-1">Rendered QR</span>
                  </div>
                )}

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-fog">
                      Decoded QR Target Payload
                    </span>
                    <span className="text-[10px] text-text-dim">{activeContext}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border font-mono text-xs text-text-pure break-all select-all">
                    {decodedText}
                  </div>
                </div>
              </div>

              {/* Security Inspection from analyzeCustomUrl */}
              {analysis && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      analysis.tone === "danger"
                        ? "bg-danger/10 border-danger/30 text-danger"
                        : analysis.tone === "warning"
                        ? "bg-warning/10 border-warning/30 text-warning"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center shrink-0">
                        <i
                          className={`ti ${
                            analysis.tone === "danger"
                              ? "ti-alert-octagon text-xl"
                              : analysis.tone === "warning"
                              ? "ti-alert-triangle text-xl"
                              : "ti-shield-check text-xl"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Quishing Safety Verdict</p>
                        <h4 className="font-display font-bold text-base sm:text-lg">{analysis.verdict}</h4>
                      </div>
                    </div>

                    <Pill tone={analysis.tone === "danger" ? "danger" : analysis.tone === "warning" ? "warn" : "success"}>
                      Threat Risk: {analysis.score} / 100
                    </Pill>
                  </div>

                  {/* Red flags */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-text-pure">
                      Payload Security Analysis
                    </h5>
                    <ul className="space-y-2" aria-label="QR payload analysis flags">
                      {analysis.flags.map((flag, idx) => (
                        <li
                          key={idx}
                          className="text-xs p-3 rounded-xl bg-surface border border-border text-text-fog flex items-start gap-2.5"
                        >
                          <i
                            className={`ti ${
                              analysis.tone === "danger"
                                ? "ti-x text-danger"
                                : analysis.tone === "warning"
                                ? "ti-alert-circle text-warning"
                                : "ti-check text-emerald-400"
                            } mt-0.5 shrink-0`}
                            aria-hidden="true"
                          />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
