<div align="center">

```
 ██████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██╗   ██╗ █████╗ ██████╗ ██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔════╝ ██║   ██║██╔══██╗██╔══██╗██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║  ███╗██║   ██║███████║██████╔╝██║  ██║
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║   ██║██╔══██║██╔══██╗██║  ██║
╚██████╗   ██║   ██████╔╝███████╗██║  ██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
```
# Kavach (CyberGuard)

### *Cyber awareness. Human defence.*

**Enterprise-grade experiential cybersecurity awareness and defense platform backed by Supabase and deployed on Netlify.**

<br />

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://netlify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<br />

[⚡ Quick Start](#-quick-start) • [🌟 Features](#-features) • [🏗️ Architecture](#️-architecture) • [🔐 Security & RLS](#-security--rls) • [🚀 Deployment](#-deployment-to-netlify) • [📄 License](#-license)

</div>

---

## 📌 Overview

**CyberGuard (Kavach)** is a full-stack cybersecurity awareness and incident readiness platform built with **React 19, TypeScript, Vite 8, Tailwind CSS v4, and Supabase (Postgres, Auth, Realtime, and Row Level Security)**.

It provides a state-of-the-art interactive training ecosystem:
- **Dual-perspective attack simulations** (MITM Public Wi-Fi, Phishing Header Analysis, Ransomware Containment, UPI Collect Payment Gateway, Quishing, Smishing).
- **Client-Side Cryptographic Tools** (Pwned Passwords via k-Anonymity SHA-1 prefixes, Static URL Phishing Heuristics, GPU Crack Estimator, Wi-Fi Auditor).
- **Interactive Training Modules & Quizzes** with real-time server-verified progress tracking.
- **12-Question Cybersecurity Assessment** with anti-cheat server score evaluation and permanent verifiable certificates (`CG-YYYY-XXXXX`).
- **Incident Reporting Registry** (`INC-YYYY-XXXXX`) generating SOC containment playbooks.
- **Live Leaderboard** synchronized across connected users in real time via Supabase Realtime WebSocket channels.
- **Role-Based Admin Console** for user management, course editing, quiz authoring, and platform analytics.
- **Full Multi-Lingual Support** in English, Hindi, and Gujarati.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v20 or higher
- **Supabase Project**: Free tier or self-hosted Supabase instance

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/TirthK17/CyberGuard.git
cd CyberGuard

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Open `.env` and configure your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Database Initialization
1. In your **Supabase Dashboard**, navigate to the **SQL Editor**.
2. Run `supabase/schema.sql` to generate all tables, triggers, strict RLS policies, and RPC functions.
3. Run `supabase/seed.sql` to populate courses, lessons, quizzes, simulations, badges, and threat bulletins.

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🏗️ Architecture

```
cyberguard/
├── src/
│   ├── components/
│   │   ├── intro/               # Brand intro animation & sound synthesis
│   │   ├── layout/              # DashboardShell, Navbar, Footer, ProtectedRoute, AdminRoute
│   │   ├── simulations/         # 6 interactive attack sandboxes & shared terminal emitters
│   │   ├── tools/               # PasswordAnalyzer, UrlAnalyzer, WifiAuditor, HygieneChecklist
│   │   └── ui/                  # UI components, MissingEnvScreen, Dialogs, LanguageSwitcher
│   ├── context/                 # AuthContext (Supabase Auth), ThemeContext, ToastContext
│   ├── hooks/                   # useContent (React Query data access & Realtime sync)
│   ├── lib/
│   │   ├── api/                 # Typed data-access layer (auth, content, drills, incidents, admin)
│   │   ├── supabase.ts          # Typed Supabase client with environment detection
│   │   ├── queryClient.ts       # TanStack Query client & caching defaults
│   │   ├── gamification.ts      # Server-authoritative XP and activity logging
│   │   └── sfx.ts               # Web Audio API synthesizers
│   ├── pages/                   # User dashboard, simulations, tools, assessment, certificates
│   │   └── admin/               # Admin CMS (users, courses, lessons, quizzes, simulations, reports)
│   └── types/
│       ├── database.ts          # Supabase Postgres schema types
│       └── index.ts             # Domain application types
├── supabase/
│   ├── schema.sql               # Idempotent database schema with RLS, triggers & RPCs
│   ├── seed.sql                 # Production seed dataset
│   └── migrations/              # Versioned SQL migrations
└── netlify.toml                 # Netlify deployment configuration, CSP & security headers
```

---

## 🔐 Security & Row-Level Security (RLS)

CyberGuard implements defense-in-depth:
1. **Server-Authoritative Gamification**: All XP awards, streak updates, and tier calculations execute via PostgreSQL `SECURITY DEFINER` RPC functions (`award_xp`). Clients cannot spoof their points or level directly.
2. **Server-Generated Unique Identifiers**: Certificate IDs (`CG-YYYY-XXXXX`) and Incident IDs (`INC-YYYY-XXXXX`) are computed server-side via atomic database sequence counters.
3. **Verified Admin Privileges**: The `is_admin()` SQL function verifies the authenticated caller's role against `public.profiles` on the server before granting write access to courseware or user roles.
4. **Safe Leaderboard View**: The `public.leaderboard` view exposes rank, full name, XP, and badges, strictly withholding user emails, session tokens, and sensitive metadata.
5. **No Service Keys on Client**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used in browser bundles.
6. **Strict HTTP Security Headers**: Netlify injects Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 🚀 Deployment to Netlify

1. Push your repository to **GitHub**.
2. Log into **[Netlify](https://app.netlify.com)** and select **Add new site > Import an existing project**.
3. Select your repository `TirthK17/CyberGuard`.
4. Build settings are automatically detected from `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Under **Site configuration > Environment variables**, add:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase public anon key
6. In **Supabase Dashboard > Authentication > URL Configuration**:
   - Set **Site URL** to your Netlify domain (e.g. `https://your-site.netlify.app`).
   - Add your Netlify domain to **Redirect URLs**: `https://your-site.netlify.app/**` alongside `http://localhost:5173/**` and `http://localhost:5174/**`.
7. Trigger Deploy.

---

## 📄 License

MIT © 2026 [TirthK17](https://github.com/TirthK17)
