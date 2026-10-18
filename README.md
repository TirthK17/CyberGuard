<div align="center">

```
 ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
```

### *Cybersecurity Awareness, Simulation & Incident Defense Portal*

**Experiential learning platform that transforms passive training into hands-on cyber defence practice.**

<br />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![CI](https://github.com/TirthK17/CyberGuard/actions/workflows/ci.yml/badge.svg)](https://github.com/TirthK17/CyberGuard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br />

[⚡ Quick Start](#-quick-start) • [🌟 Features](#-features) • [🏗️ Architecture](#️-architecture) • [🔑 Demo Credentials](#-demo-credentials) • [⚠️ Limitations](#️-limitations)

</div>

---

## 📌 Overview

CyberGuard is a college minor project — a fully client-side cybersecurity awareness portal built with React 19, TypeScript 6, Vite 8, and Tailwind CSS v4. It runs **100% offline** using a localStorage-backed database (`localDb`) that mimics the Supabase API surface.

The platform features:
- **Dual-perspective attack simulations** (see the victim and attacker views simultaneously)
- **Interactive quizzes and a scored safety assessment** with certificates
- **Client-side security tools** (password entropy, URL analyzer, Wi-Fi risk, hygiene checklist)
- **Threat intelligence feed** (simulated data — clearly labelled)
- **Gamification** (XP, levels, badges, leaderboard)
- **Incident reporting** (client-side only — no data leaves the browser)

---

## ⚡ Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/TirthK17/CyberGuard.git
cd CyberGuard

# 2. Install dependencies
npm install

# 3. Start dev server (runs entirely offline)
npm run dev
```

Open `http://localhost:5173` in your browser. No account, no server, no API keys required.

---

## 🔑 Demo Credentials

The app ships with pre-seeded demo accounts. Use these on the login page:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@cyberguard.dev` | `CyberGuard2026!` |
| **User (Operator)** | `operator@cyberguard.dev` | `CyberGuard2026!` |

> **Note:** These accounts exist in the local database seed. All data is stored in your browser's `localStorage` only.

---

## 🌟 Features

### Learning & Training
- Module-based lessons with progress tracking
- Quizzes per module with XP rewards (idempotent — no XP farming)
- Scored Safety Assessment (12 questions, pass mark 61%, certificate on pass)

### Interactive Simulations
1. **MITM Payment Sandbox** — ARP-spoofed café Wi-Fi payment interception
2. **Phishing Email Sandbox** — Dual-view email lure with credential theft demonstration
3. **Smishing Simulator** — SMS-based bank fraud with decision branching
4. **Ransomware Containment Drill** — File-locking sequence with pay vs. isolate outcome

### Security Tools
- **Password Strength Analyzer** — Entropy calculator with GPU crack-time estimate
- **URL Analyzer** — Subdomain, TLD, punycode and extension checks
- **Passphrase Generator** — Cryptographically random word selection
- **Cyber Hygiene Checklist** — 8-point hardening audit with XP
- **Wi-Fi Risk Auditor** — Protocol-based exposure scoring
- **Breach Scanner** — *Demo data only, clearly labelled*

### Gamification
- XP system with 5 levels (Novice → Operator → Analyst → Defender → Architect)
- 9+ badge types with evaluation criteria
- Leaderboard (demo users clearly tagged)

### Other
- Incident report builder (draft only — no data is transmitted)
- Threat Intelligence page (simulated data with "Simulated" badges)
- Certificate with unique ID and `/verify/:id` public route
- Command palette (`Ctrl+K`)
- Dark/light theme toggle

---

## 🏗️ Architecture

```
src/
├── App.tsx                  # Router + layout wrappers
├── index.css                # Design tokens (Tailwind v4 @theme)
├── lib/
│   ├── localDb.ts           # 1,775-line localStorage Supabase mock
│   ├── supabase.ts          # Factory: real Supabase if env vars set, else localDb
│   ├── gamification.ts      # XP, level, badge evaluation
│   ├── constants.ts         # LEVELS, XP amounts, PASS_MARK, QUIZ_PASS
│   └── celebrate.ts         # canvas-confetti wrapper
├── context/
│   ├── AuthContext.tsx      # Auth state (localDb-backed)
│   ├── ThemeContext.tsx     # Dark/light theme
│   └── ToastContext.tsx     # Toast notifications
├── components/
│   ├── layout/              # DashboardShell, PublicNavbar, PublicFooter, RouteGuards
│   ├── simulations/         # 4 simulation sandboxes
│   └── ui/                  # Button, primitives, CyberGuardLogo
├── pages/                   # 20+ user pages
│   └── admin/               # 9 admin pages
├── hooks/
│   └── useContent.ts        # Generic async data fetcher
└── types/
    └── index.ts             # Shared TypeScript types
```

### Data Layer

CyberGuard uses a **single-source factory pattern** in `src/lib/supabase.ts`:

- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set → uses real Supabase client
- Otherwise → uses `localDb` (localStorage mock with identical API surface)

All existing imports use `supabase` and require no changes when switching modes.

### Supabase Schema

The `supabase/` folder contains `schema.sql` for setting up tables, RLS policies and seed data in a real Supabase project. This is **optional** — the app runs fully without it.

---

## 🔧 Development

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + production bundle
npm run lint       # oxlint
npm run preview    # Preview production build
```

### Environment Variables (optional — for Supabase mode)

Copy `.env.example` to `.env` and fill in your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these, the app runs in **offline-only mode** using `localDb`.

---

## 🚀 Deployment

The project includes `netlify.toml` for one-click Netlify deployment:

```bash
npm run build      # Output: dist/
# Deploy dist/ to Netlify, Vercel, or any static host
```

The `_redirects` rule in `netlify.toml` handles SPA client-side routing.

---

## ⚠️ Limitations

This is a college **minor project** with intentional constraints. Please read these before evaluating:

1. **Client-side data only.** All data (profiles, XP, progress, certificates) lives in the browser's `localStorage`. Clearing browser data resets everything. Data cannot be shared across devices or browsers.

2. **Data is user-editable.** Because `localStorage` is accessible via browser DevTools, a determined user can edit their XP, level, or any other field. There is no server-side validation in offline mode.

3. **Simulated threat data.** The Threat Intelligence page, live feed, attack map, and breach scanner show **simulated/demo data** — not real-time telemetry. This is clearly labelled in the UI.

4. **Simulated SOC actions.** The incident report page generates a draft report only. No ticket is dispatched, no firewall rule is created, and no external service is contacted. Suggested containment steps are educational recommendations, not automated actions.

5. **Demo leaderboard users.** The 8 seeded profiles (Sarah Chen, Marcus Vance, etc.) are fictional demo accounts that exist for UI demonstration. They are tagged "Demo" in the leaderboard.

6. **No email verification.** Account creation in offline mode is immediate with no email confirmation. The registration success screen says "Account created" — no verification email is sent.

7. **Supabase mode is experimental.** While a factory pattern exists in `supabase.ts`, the real Supabase path has not been fully tested with production data. Consider it a starting point.

8. **Certificates are locally issued.** The verify page (`/verify/:id`) works within the same browser/device. A certificate ID cannot be verified on another device.

---

## 🔮 Future Scope

- Real backend (Supabase or Firebase) with server-side validation
- Real-time leaderboard via WebSocket or Supabase Realtime
- Pwned Passwords k-anonymity API integration (Phase 4)
- CISA KEV real-time threat feed
- Internationalization (Hindi, Gujarati)
- React Native mobile app
- Accessibility audit to WCAG 2.1 AA
- Additional simulations: UPI refund scam, QR phishing, deepfake voice call

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 13 |
| Charts | Recharts 3 |
| Icons | Lucide React + Tabler Icons |
| Command Palette | cmdk |
| Confetti | canvas-confetti |
| Routing | React Router 7 |
| Data | localStorage (localDb) / Supabase |
| Linter | oxlint |
| CI | GitHub Actions |

---

## 📄 License

MIT © 2026 [TirthK17](https://github.com/TirthK17)

---

<div align="center">
  <sub>Built as a college minor project. Educational use only. No real security guarantees are implied.</sub>
</div>
