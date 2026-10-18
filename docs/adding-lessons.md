# Guide: Creating Modules & Lessons

## 1. Overview
CyberGuard curriculum is structured into **Modules (Courses)** and ordered **Lessons**. Each completed lesson awards idempotent XP and updates the learner's overall safety score.

---

## 2. Curriculum Data Structure

Lessons are defined with markdown-compatible formatting and interactive quiz checks:

```typescript
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string; // Markdown formatted educational instructions
  order_index: number;
  points: number; // e.g. 15 XP
  takeawayRule: string;
}
```

---

## 3. Adding a Lesson via Code or Admin Portal

### Method A: Admin Portal (Zero-Code)
1. Log in as an admin (e.g. `operator@cyberguard.dev`).
2. Navigate to `/admin/lessons`.
3. Click **Add New Lesson**, select the target module, type the markdown content, and specify the XP award amount.
4. Click **Publish Lesson**. The lesson immediately becomes available offline across the platform.

### Method B: Default Seed Data
1. Open `src/lib/localDb.ts`.
2. Locate `DEFAULT_LESSONS`.
3. Add a new lesson object with a unique UUID:
```typescript
{
  id: "les-new-01",
  course_id: "mod-phishing",
  title: "Spotting Punycode & Lookalike Domains",
  content: "Attackers register internationalized domain names (IDNs) like `xn--...` to visually spoof legitimate websites...",
  order_index: 4,
  points: 15,
}
```

---

## 4. Best Practices for Educational Content
- **Action-Oriented:** Start each lesson with practical rules rather than abstract definitions.
- **Micro-Clues:** Highlight visual red flags (e.g., urgency language, mismatched return-paths, spoofed characters).
- **Golden Rules:** Always end with a single memorable takeaway rule (e.g., *"UPI PIN is strictly for sending money, never for receiving."*).
- **Multilingual Support:** When adding core scam awareness modules, provide corresponding translations in `src/locales/en.json`, `src/locales/hi.json`, and `src/locales/gu.json`.
