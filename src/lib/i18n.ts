import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import hi from "../locales/hi.json";
import gu from "../locales/gu.json";

export type SupportedLanguage = "en" | "hi" | "gu";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];

const STORAGE_KEY = "cyberguard-language";

export function getSavedLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi" || saved === "gu") {
      return saved;
    }
  } catch {
    // Ignore localStorage access failures
  }
  return "en";
}

const initialLng = getSavedLanguage();

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLng;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: initialLng,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already safeguards against XSS
  },
});

export function changeLanguage(lng: SupportedLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Ignore
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lng;
  }
  i18n.changeLanguage(lng);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cyberguard:language-changed", { detail: lng }));
  }
}

export default i18n;
