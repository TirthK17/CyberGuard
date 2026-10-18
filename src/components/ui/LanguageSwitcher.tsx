import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, changeLanguage, type SupportedLanguage } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import { playSfx } from "../../lib/sfx";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "segmented" | "compact";
  className?: string;
}

export function LanguageSwitcher({ variant = "dropdown", className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language?.slice(0, 2) as SupportedLanguage) || "en";
  const activeOption = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    changeLanguage(code);
    playSfx("click");
    setIsOpen(false);
  };

  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label={t("settings.languageTitle", "Display Language")}
        className={cn("grid grid-cols-1 sm:grid-cols-3 gap-2.5", className)}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLang;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-surface-elevated text-text-fog hover:border-border-strong hover:text-text-pure"
              )}
            >
              <div>
                <div className="font-semibold text-sm leading-tight text-text-pure">{lang.nativeName}</div>
                <div className="text-xs text-text-ash mt-0.5">{lang.name}</div>
              </div>
              {isSelected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <i className="ti ti-check text-xs" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown / Compact mode
  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current: ${activeOption.nativeName}`}
        title={`Change Language (${activeOption.nativeName})`}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-xs text-text-fog hover:text-text-pure hover:border-border-strong transition-colors cursor-pointer",
          variant === "compact" ? "h-7 px-2" : "h-8 px-2.5"
        )}
      >
        <i className="ti ti-language text-sm text-primary" aria-hidden="true" />
        <span className="font-medium">{activeOption.nativeName}</span>
        <i className={`ti ti-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Available languages"
          className="absolute right-0 mt-1.5 w-36 rounded-xl border border-border bg-surface/95 backdrop-blur-xl p-1 shadow-lg z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLang;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text-pure hover:bg-surface-elevated"
                )}
              >
                <div>
                  <span className="block">{lang.nativeName}</span>
                  <span className="block text-[10px] text-text-ash">{lang.name}</span>
                </div>
                {isSelected && <i className="ti ti-check text-xs text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
