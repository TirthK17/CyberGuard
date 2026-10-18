import { useState, useEffect, useCallback } from "react";

/**
 * Synthesizes short interface sound effects using the Web Audio API without any external audio files.
 * Respects user preferences and global mute state.
 */

export type SfxType = "alert" | "click" | "success" | "buzz" | "lock";

const SFX_MUTED_KEY = "cyberguard_sfx_muted";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSfxMuted(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem(SFX_MUTED_KEY);
  // Default is muted (true) as required by "default off"
  return saved === null ? true : saved === "true";
}

export function setSfxMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SFX_MUTED_KEY, String(muted));
  window.dispatchEvent(
    new CustomEvent("cyberguard:sfx-mute-changed", { detail: { muted } })
  );
}

export function playSfx(type: SfxType): void {
  if (isSfxMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (type) {
    case "click": {
      // Tactile quick low pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }

    case "alert": {
      // Dual-tone urgent alert
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(660, now + 0.08);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(330, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
      break;
    }

    case "success": {
      // Ascending major chord chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
      break;
    }

    case "buzz": {
      // Low square buzz for errors / invalid actions
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
      break;
    }

    case "lock": {
      // Double tactile click like a padlock tumbler
      [0, 0.045].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + delay;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.03);
      });
      break;
    }
  }
}

export function useSfx() {
  const [muted, setMuted] = useState<boolean>(() => isSfxMuted());

  useEffect(() => {
    const handleMuteChange = (e: Event) => {
      const custom = e as CustomEvent<{ muted: boolean }>;
      if (custom.detail) {
        setMuted(custom.detail.muted);
      }
    };
    window.addEventListener("cyberguard:sfx-mute-changed", handleMuteChange);
    return () =>
      window.removeEventListener("cyberguard:sfx-mute-changed", handleMuteChange);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
  }, [muted]);

  const play = useCallback((type: SfxType) => {
    playSfx(type);
  }, []);

  return { isMuted: muted, toggleMute, playSfx: play };
}
