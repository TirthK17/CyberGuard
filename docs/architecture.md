# CyberGuard Architecture & System Design

## 1. Overview
**CyberGuard** is an offline-first, client-side cybersecurity awareness, training, and simulation portal engineered for college students, employees, and everyday citizens in India. It requires **zero cloud configuration** out of the box and operates with 100% feature parity in pure browser storage mode.

---

## 2. Technology Stack
- **Frontend Framework:** React 19 (`createRoot`, React Hooks, Suspense)
- **Language & Compiler:** TypeScript 6 (`strict: true`, typed props and database interfaces)
- **Build & Dev Tool:** Vite 8 (`@vitejs/plugin-react`, Rollup manual chunks for vendor splitting)
- **Styling & Design Tokens:** Tailwind CSS v4 (`@theme inline`, HSL tailored color variables, macOS glassmorphism)
- **Animation System:** Framer Motion (`useReducedMotion()`, spring presets, shared layout transitions)
- **Sound Synthesizer:** Procedural Web Audio API (`src/lib/sfx.ts`, 0 bytes of external audio files)
- **Command Palette:** `cmdk` (Spotlight-style global launcher with fuzzy search, recent items, and shortcuts)
- **Charts & Telemetry:** Recharts (responsive radar, radial progress, and trend analytics)
- **Internationalization:** `i18next` & `react-i18next` (Offline bundles for English, Hindi, and Gujarati)
- **Linting & Code Quality:** `oxlint` (high-speed Rust-based linter)

---

## 3. Core Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│  - User Layout / Admin Layout (Persistent Navigation Shell) │
│  - Spotlight Command Palette (cmdk) & Shortcuts Modal       │
│  - Attack Sandboxes & Procedural Terminal (AttackerTerminal)│
│  - Multilingual Interfaces (en, hi, gu)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  State & Context Providers                  │
│  - AuthContext (Salted SHA-256 Auth, Session Storage)       │
│  - ThemeContext (macOS Light/Dark, Accents, Hacker Mode)    │
│  - AccessibilityContext (Motion Reduction & WCAG AA)        │
│  - ToastContext & CelebrationModal (Event Bus)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                   Data & Persistence Layer                  │
│  - localDb.ts (Supabase-compatible query engine)            │
│  - Web Crypto API (SHA-256 password salting, UUIDv4)        │
│  - LocalStorage (Persisted profiles, progress, certificates)│
│  - Optional: supabase.ts client factory                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Subsystems

### 4.1 Client-Side Data Layer (`localDb.ts`)
`localDb` implements a subset of `@supabase/supabase-js`'s PostgREST query builder:
- Methods: `.from(table).select(cols).eq(col, val).order(col, opts).limit(n).insert(rows).update(patch).delete()`
- Auth client: `.auth.signInWithPassword()`, `.auth.signUp()`, `.auth.signOut()`, `.auth.getUser()`
- Passwords are never stored in plaintext: salted with `crypto.getRandomValues()` and hashed with `crypto.subtle.digest("SHA-256")`.

### 4.2 Web Audio Sound Synthesizer (`sfx.ts`)
Generates 5 distinct procedural audio chimes using the browser's native `AudioContext`:
- `click`: high-frequency micro-click (1200Hz -> 800Hz, 30ms)
- `alert`: dual-tone alarm chord (880Hz + 660Hz)
- `success`: major triad arpeggio (C5 -> E5 -> G5)
- `buzz`: low sawtooth error pulse (150Hz)
- `lock`: dual metallic latch clicks (400Hz -> 200Hz)
All sounds strictly adhere to autoplay policies and a global persistent mute toggle.

### 4.3 Motion & Accessibility System
- `useReducedMotion()` wraps all intensive transitions.
- Global `@media (prefers-reduced-motion: reduce)` and `.reduce-motion` styles enforce `animation-duration: 0.01ms`.
- Accessible skip-to-content links and ARIA focus rings across all themes.

### 4.4 Code Splitting & Chunking
`vite.config.ts` partitions vendor libraries into dedicated bundles:
- `vendor-react`: `react`, `react-dom`, `react-router-dom`
- `vendor-motion`: `framer-motion`
- `vendor-recharts`: `recharts`
- `vendor-utils`: `cmdk`, `canvas-confetti`, `zxcvbn`, `qrcode`
Dynamic route imports (`React.lazy`) ensure low initial bundle size and rapid Time to Interactive (TTI).
