import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/primitives";

interface ShortcutDef {
  category: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutDef[] = [
  {
    category: "Global Navigation",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Open Spotlight Command Palette" },
      { keys: ["⌘", "K"], description: "Open Spotlight on macOS" },
      { keys: ["?"], description: "Open this keyboard shortcuts cheat-sheet" },
      { keys: ["Esc"], description: "Close active modal, drawer, or search" },
    ],
  },
  {
    category: "Quizzes & Knowledge Checks",
    shortcuts: [
      { keys: ["1", "–", "4"], description: "Select option 1 through 4" },
      { keys: ["A", "–", "D"], description: "Select option A through D" },
      { keys: ["Enter"], description: "Submit answer / Proceed to next question" },
    ],
  },
  {
    category: "Tabs & Controls",
    shortcuts: [
      { keys: ["←", "→"], description: "Navigate between tabs in segment controls" },
      { keys: ["Home", "End"], description: "Jump to first or last tab" },
      { keys: ["Tab"], description: "Move focus to next interactive element" },
    ],
  },
];

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing inside an input, textarea or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("cyberguard:open-shortcuts", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("cyberguard:open-shortcuts", handleCustomOpen);
    };
  }, []);

  return (
    <Modal
      id="keyboard-shortcuts-modal"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Keyboard Shortcuts Cheat-sheet"
      className="max-w-xl"
    >
      <div className="space-y-6 pt-2">
        <p className="text-xs text-text-fog">
          Navigate and interact with CyberGuard faster using system-wide keyboard shortcuts.
        </p>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                {group.category}
              </h3>
              <div className="rounded-xl border border-border bg-surface-elevated/40 p-2 divide-y divide-border">
                {group.shortcuts.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-2 text-xs"
                  >
                    <span className="text-text-pure font-medium">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-text-pure shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl bg-surface-elevated px-4 py-1.5 text-xs font-semibold text-text-pure border border-border hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </Modal>
  );
}
