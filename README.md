<div align="center">

```
 ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
# Kavach (CyberGuard)

### *Cyber awareness. Human defence.*

**Experiential learning platform that transforms passive training into hands-on cyber defence practice.**

<br />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-39%20Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](src/test)
[![CI](https://github.com/TirthK17/CyberGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/TirthK17/CyberGuard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br />

[⚡ Quick Start](#-quick-start) • [🌟 Features](#-features) • [🏗️ Architecture](#️-architecture) • [🔑 Demo Credentials](#-demo-credentials) • [📚 Technical Docs](#-technical-documentation) • [⚠️ Limitations](#️-limitations)

</div>

---

## 📌 Overview

CyberGuard is a college minor cybersecurity awareness and defense portal built with **React 19, TypeScript 6, Vite 8, and Tailwind CSS v4**. It runs **100% offline with zero configuration** using a structured `localStorage` mock (`localDb`) that implements the Supabase client API, with an optional hybrid live-Supabase factory.

The platform provides:
- **Dual-perspective attack simulations** (view live victim and attacker perspective side-by-side or toggled)
- **Real-time cryptographic analysis tools** (Pwned Passwords via k-Anonymity, URL static heuristics, GPU crack estimator)
- **Interactive lessons, quizzes, and scored safety assessment** with cryptographically stable certificates
- **Simulated & live threat intelligence feed** (CISA KEV live catalog with local fallback)
- **Gamification system** (idempotent XP awards, 5-tier operator progression, badge unlock toasts)
- **Full multi-lingual support** (English, Hindi, and Gujarati with zero-network offline JSON bundles)
- **WCAG 2.1 Level AA accessibility** (skip links, live ARIA announcements, full keyboard navigation, `prefers-reduced-motion` compliance)

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/TirthK17/CyberGuard.git
cd CyberGuard

# 2. Install dependencies
npm install

# 3. Start development server (runs entirely offline)
npm run dev

# 4. Run test suite
npm test
```

Open `http://localhost:5173` in your browser. No database setup, backend daemon, or API keys required.

---

## 🔑 Demo Credentials

CyberGuard ships with seeded demo accounts in `localDb` using salted SHA-256 Web Crypto password hashes:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin (Security Lead)** | `admin@cyberguard.dev` | `CyberGuard2026!` | Access to Admin CMS, user roles, analytics & audit logs |
| **Operator (Cadet)** | `operator@cyberguard.dev` | `CyberGuard2026!` | Standard learner account with simulated training history |

> **Note:** Credentials are saved and verified entirely within your browser's `localStorage`. No credentials or passwords ever leave your machine.

---

## 🌟 Features

### 1. Interactive Attack Sandboxes (6 Simulations)
All sandboxes feature realistic state machines, dual victim/attacker consoles, streaming log terminals, and Beginner Clues mode:
1. **MITM Payment Sandbox** — ARP cache poisoning and SSL-strip interception on insecure public Wi-Fi.
2. **Phishing Email Sandbox** — Dual-pane email lure dissection with header inspection and credential harvesting simulation.
3. **Smishing Simulator** — SMS bank impersonation with branching decision trees and urgency cues.
4. **Ransomware Containment Drill** — Live encryptor simulation demonstrating infection vectors and the fatal risks of ransom payments.
5. **UPI Collect Scam Sandbox** — Realistic Indian mobile banking payment gateway exposing UPI PIN request deception.
6. **Quishing (Malicious QR) Sandbox** — Fake parking meter and payment QR code dissection with camera view and malicious payload inspector.

### 2. Client-Side Security Tools
- **Password Strength & Breach Exposure** — Combines Dropbox's `zxcvbn` engine with **HaveIBeenPwned k-Anonymity** (queries 5-character SHA-1 hash prefixes so passwords never leave the browser) and average-case GPU crack-time estimator.
- **URL & Phishing Analyzer** — Static heuristic parser inspecting multi-part ccTLDs (`.co.uk`, `.gov.in`), Punycode IDN homographs, userinfo `@` navigation trickery, bare IPs, and brand spoofing.
- **Cryptographic Passphrase Generator** — CSPRNG (`crypto.getRandomValues`) generator powered by the EFF 2,048-word mnemonic dictionary.
- **Wi-Fi Risk Auditor** — Protocol exposure scoring (Open vs WEP vs WPA2 vs WPA3) with rogue AP detection warnings.
- **Cyber Hygiene Hardening Checklist** — 8-point interactive system audit with persistent progress and XP rewards.

### 3. Gamification & Progression
- **Idempotent XP System** — Re-taking passed lessons, quizzes, or checklist items never double-awards XP (prevents XP farming).
- **5-Tier Operator Progression** — Novice (0 XP) → Operator (100 XP) → Analyst (300 XP) → Defender (600 XP) → Architect (1,000 XP).
- **Dynamic Badge Engine** — Evaluates completion metrics and triggers celebratory toasts and confetti bursts.
- **Daily Streak & Learning Paths** — Personalized persona tracks tailored for Students, Employees, and Senior Citizens.

### 4. Safety Assessment & Verifiable Certificates
- Scored 12-question safety assessment with randomized question banks.
- Certificate eligibility derived from the user's **best assessment score** (failing a retake never revokes an earned certificate).
- Stable collision-checked certificate IDs (`CG-YYYY-XXXXX`) stored in database.
- Public certificate verification page (`/verify/:id`) with scannable QR code and print-optimized landscape layout.

### 5. Internationalisation (i18n)
- Seamless offline multi-language support: **English (`en`)**, **Hindi (`hi`)**, and **Gujarati (`gu`)**.
- Built using `i18next` and `react-i18next` with bundled offline JSON resources.
- Optimized typography supporting Google Noto Sans Devanagari and Gujarati scripts.
- Accessible language switcher available in navigation bar, settings, and command palette (`Ctrl+K`).

### 6. Design System & Audio Synthesis
- macOS-inspired dark glassmorphism interface with custom ambient glow accents.
- Dynamic Sound Effects powered by Web Audio API synthesizers (alerts, key clicks, lock toggles, success chimes) with global persistence and mute control.
- Global command palette (`Ctrl+K`) and shortcut cheatsheet (`?`).

---

## 🏗️ Architecture

```
cyberguard/
├── docs/                        # Complete technical documentation suite
│   ├── architecture.md          # System design, data flow, audio & motion design
│   ├── data-model.md            # Schema definitions for all 8 tables
│   ├── adding-simulations.md    # Guide to authoring sandboxes using shared primitives
│   ├── adding-lessons.md        # Step-by-step module and quiz authoring
│   └── accessibility-checklist.md # WCAG 2.1 AA compliance audit
├── src/
│   ├── components/
│   │   ├── layout/              # DashboardShell, PublicNavbar, PublicFooter, RouteGuards
│   │   ├── simulations/         # 6 interactive attack sandboxes & shared simulation primitives
│   │   ├── tools/               # PasswordAnalyzer, UrlAnalyzer, WifiAuditor, HygieneChecklist
│   │   └── ui/                  # Accessible primitives (Button, Card, Pill, Modal, LanguageSwitcher)
│   ├── context/                 # AuthContext, ThemeContext, ToastContext, AccessibilityContext
│   ├── data/                    # EFF wordlist, CISA KEV snapshot, module datasets
│   ├── lib/                     # localDb, supabase factory, gamification, passwordAnalyzer, urlAnalyzer, sfx, i18n
│   ├── locales/                 # Offline translation bundles (en.json, hi.json, gu.json)
│   ├── pages/                   # User dashboard, simulations, tools, intelligence, assessment, certificates
│   │   └── admin/               # Admin CMS pages (courses, lessons, quizzes, users, reports)
│   └── test/                    # Vitest unit and integration test suite (39 tests)
└── supabase/
    └── schema.sql               # Optional PostgreSQL schema with strict RLS policies
```

---

## 📚 Technical Documentation

Detailed guides and specifications are located in the [`docs/`](docs/) directory:
- [**Architecture Guide**](docs/architecture.md) — Comprehensive architectural layers, state machines, sound synthesis, and code splitting.
- [**Data Model Specification**](docs/data-model.md) — Storage schema, indexes, and relations across all 8 collections.
- [**Adding New Simulations**](docs/adding-simulations.md) — Step-by-step tutorial on building new sandboxes using shared view switchers and terminal emitters.
- [**Adding New Lessons & Modules**](docs/adding-lessons.md) — Authoring guide for interactive modules, quizzes, and assessment questions.
- [**Accessibility Audit & Checklist**](docs/accessibility-checklist.md) — WCAG 2.1 AA audit covering contrast, focus management, screen readers, and reduced motion.

---

## 🔧 Development & Testing

```bash
# Run development server
npm run dev

# Run full Vitest test suite
npm test

# Run Vitest in interactive watch mode
npm run test:watch

# Run code linter (oxlint)
npm run lint

# TypeScript verification and production bundle
npm run build

# Preview production bundle locally
npm run preview
```

---

## ⚠️ Limitations

This is a college **minor project** with intentional educational boundaries:

1. **Client-side data persistence**: All accounts, progress, and certificates reside in `localStorage`. Clearing browser data resets local state.
2. **Offline-first evaluation**: Because logic executes client-side in demo mode, values could theoretically be altered via browser DevTools.
3. **Simulated incident response**: Incident reports generate structured emergency playbooks and containment drafts. No actual external firewall rules or police dispatches occur.
4. **Local certificate authority**: The `/verify/:id` route validates certificates issued within the local browser environment.
5. **Simulated threat intelligence**: Threat map coordinates and live telemetry display simulated events alongside CISA KEV snapshots.

---

## 🔮 Future Scope

- **Cloud Synchronization**: Optional multi-device synchronization via live Supabase/PostgreSQL backend with Row-Level Security.
- **Hardware Token Simulation**: Interactive FIDO2 / WebAuthn hardware security key drill.
- **Deepfake Audio/Video Detection**: Media forensic sandbox detecting AI-generated synthetic media lures.
- **Native Mobile Experience**: Cross-platform deployment via React Native or Progressive Web App (PWA) manifest.

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | React 19 + TypeScript 6 |
| **Build Tooling** | Vite 8 + Rolldown |
| **Styling & Design System** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Animation & Micro-interactions** | Framer Motion 13 |
| **Data Visualization** | Recharts 3 |
| **Internationalisation** | i18next + react-i18next (en, hi, gu) |
| **Testing** | Vitest 5 + JSDOM + Testing Library |
| **Icons & Media** | Lucide React + Tabler Icons + QR Code |
| **Sound Synthesis** | Web Audio API (Synthesized Oscillators) |
| **Database Layer** | Client-side `localDb` (Supabase API surface mock) |

---

## 📄 License

MIT © 2026 [TirthK17](https://github.com/TirthK17)

<div align="center">
  <sub>Built as a college minor project. For educational and cybersecurity awareness purposes only.</sub>
</div>
