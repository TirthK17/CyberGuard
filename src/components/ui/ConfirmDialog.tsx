import { useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "danger" | "primary" | "warn";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      setTimeout(() => confirmBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveRef.current?.focus();
      };
    }
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmTone === "danger"
                    ? "bg-danger/15 text-danger border border-danger/30"
                    : confirmTone === "warn"
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                    : "bg-primary/15 text-primary border border-primary/30"
                }`}
              >
                <i
                  className={`ti ${
                    confirmTone === "danger"
                      ? "ti-alert-triangle text-xl"
                      : confirmTone === "warn"
                      ? "ti-alert-circle text-xl"
                      : "ti-info-circle text-xl"
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 id={titleId} className="font-display text-base font-bold text-text-pure">
                  {title}
                </h3>
                <p id={descId} className="mt-1.5 text-xs sm:text-sm text-text-fog leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancel}
                className="text-xs"
              >
                {cancelLabel}
              </Button>
              <Button
                ref={confirmBtnRef}
                variant={confirmTone === "danger" ? "danger" : "primary"}
                size="sm"
                onClick={onConfirm}
                className="text-xs font-bold"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
