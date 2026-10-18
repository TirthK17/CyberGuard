import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordAnalyzerTab } from "@/components/tools/PasswordAnalyzerTab";
import { PhishingInspectorTab } from "@/components/tools/PhishingInspectorTab";
import { EmailHeaderAnalyzerTab } from "@/components/tools/EmailHeaderAnalyzerTab";
import { FileHashCheckerTab } from "@/components/tools/FileHashCheckerTab";
import { QrSafetyScannerTab } from "@/components/tools/QrSafetyScannerTab";
import { SuspiciousMessageTab } from "@/components/tools/SuspiciousMessageTab";
import { WifiAuditorTab } from "@/components/tools/WifiAuditorTab";
import { BreachScannerTab } from "@/components/tools/BreachScannerTab";
import { CyberHygieneAuditTab } from "@/components/tools/CyberHygieneAuditTab";

export type ToolTabId =
  | "password"
  | "phish"
  | "header"
  | "hash"
  | "qr"
  | "sms"
  | "wifi"
  | "breach"
  | "hygiene";

interface TabDefinition {
  id: ToolTabId;
  label: string;
  icon: string;
  category: "Identity & Auth" | "Web & Messages" | "Network & Files" | "Habits";
}

const TABS: TabDefinition[] = [
  { id: "password", label: "Passwords", icon: "ti-key", category: "Identity & Auth" },
  { id: "phish", label: "Link Inspector", icon: "ti-link", category: "Web & Messages" },
  { id: "header", label: "Email Headers", icon: "ti-mail-check", category: "Web & Messages" },
  { id: "sms", label: "Scam Messages", icon: "ti-message-alert", category: "Web & Messages" },
  { id: "qr", label: "QR Safety", icon: "ti-qrcode", category: "Web & Messages" },
  { id: "hash", label: "File Hashes", icon: "ti-file-code", category: "Network & Files" },
  { id: "wifi", label: "Wi-Fi Safety", icon: "ti-wifi", category: "Network & Files" },
  { id: "breach", label: "Breach Check", icon: "ti-spy", category: "Identity & Auth" },
  { id: "hygiene", label: "Safety Checklist", icon: "ti-list-check", category: "Habits" },
];

export function SecurityToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTabId>("password");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="pb-2 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Security Tool Suite
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-pure sm:text-3xl mt-0.5">
            Practical Safety Tools
          </h1>
          <p className="mt-1 text-xs text-text-fog max-w-2xl">
            Audit password strength with real k-anonymity breach checks, inspect suspicious links &amp; email headers, verify file hashes, scan QR codes, and assess everyday cyber hygiene.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Security Tools Navigation"
          className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface border border-border"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-fog hover:text-text-pure hover:bg-surface-elevated"
                }`}
              >
                <i className={`ti ${tab.icon} text-xs`} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "password" && <PasswordAnalyzerTab />}
          {activeTab === "phish" && <PhishingInspectorTab />}
          {activeTab === "header" && <EmailHeaderAnalyzerTab />}
          {activeTab === "sms" && <SuspiciousMessageTab />}
          {activeTab === "qr" && <QrSafetyScannerTab />}
          {activeTab === "hash" && <FileHashCheckerTab />}
          {activeTab === "wifi" && <WifiAuditorTab />}
          {activeTab === "breach" && <BreachScannerTab />}
          {activeTab === "hygiene" && <CyberHygieneAuditTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SecurityToolsPage;
