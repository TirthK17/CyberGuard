import { beforeEach } from "vitest";
import { webcrypto } from "node:crypto";

// ── Polyfill Web Crypto API in jsdom ──────────────────────────────────────────
if (!window.crypto || !window.crypto.subtle) {
  Object.defineProperty(window, "crypto", {
    value: webcrypto,
    writable: true,
  });
}

// ── Mock window.matchMedia for theme & reduced-motion ─────────────────────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ── Mock Web Audio API for sound synthesis (sfx.ts) ───────────────────────────
class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    };
  }
  close() {
    return Promise.resolve();
  }
}

// @ts-expect-error -- Web Audio mock
window.AudioContext = MockAudioContext;
// @ts-expect-error -- Web Audio mock
window.webkitAudioContext = MockAudioContext;

// ── Ensure localStorage is fresh between test files ───────────────────────────
beforeEach(() => {
  localStorage.clear();
});
