# WCAG 2.1 AA Accessibility Compliance Checklist

CyberGuard is designed and tested against **WCAG 2.1 Level AA** guidelines to ensure all learners, including those using screen readers, keyboard-only navigation, or with reduced motion preferences, have an equal experience.

---

## 1. Compliance Checklist & Audit

### 1.1 Non-Text Content & Contrast (WCAG 1.1.1, 1.4.3)
- [x] All functional icon buttons have explicit `aria-label` attributes (e.g. search, theme toggle, drawer triggers).
- [x] Decorative icons and graphical background elements carry `aria-hidden="true"`.
- [x] Contrast ratio exceeds 4.5:1 for standard body text and 3:1 for large headers and interactive borders in both macOS Light and Dark themes.
- [x] Verified high-contrast mode via **Hacker Terminal Mode** for maximum visual clarity.

### 1.2 Keyboard Accessibility (WCAG 2.1.1, 2.1.2)
- [x] Global **Skip to Main Content** link at the top of every layout page (`#main-content`).
- [x] All interactive cards, table rows, and toggles use native `<button>` or `<a href>` elements.
- [x] Global keyboard shortcut cheat-sheet triggered by pressing `?` key.
- [x] Spotlight command palette accessible via `⌘K` or `Ctrl+K`.
- [x] Multiple-choice quiz options support numeric keys `1`, `2`, `3`, `4` and letters `A`, `B`, `C`, `D` with `Enter` to advance.
- [x] Dialogs and drawers trap keyboard focus and dismiss gracefully on `Escape`.

### 1.3 Motion & Sensory Adaptations (WCAG 2.2.2, 2.3.3)
- [x] Respects OS-level `prefers-reduced-motion: reduce` across all animations and transitions.
- [x] Dedicated **Reduce Motion** user toggle in Settings that overrides OS preferences.
- [x] All Framer Motion animations wrap in `useReducedMotion()`.
- [x] Background floating orbs and ambient gradients disable transforms under reduced motion.

### 1.4 Dynamic Regions & Assistive Technology (WCAG 4.1.2, 4.1.3)
- [x] Dynamic alerts and terminal logs use `role="log"` and `aria-live="polite"` to prevent screen reader flooding.
- [x] Form validation errors and login alerts use `role="alert"`.
- [x] Segmented controls and tab switchers implement `role="tablist"`, `role="tab"`, and `aria-selected`.
- [x] Modal dialogs implement `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
