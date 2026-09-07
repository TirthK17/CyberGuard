import confetti from "canvas-confetti";

export function celebrate() {
  const colors = ["#4ee1c2", "#2fae94", "#f2f2f0"];
  const duration = 1400;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function celebrateBig() {
  confetti({
    particleCount: 140,
    spread: 90,
    origin: { y: 0.6 },
    colors: ["#4ee1c2", "#2fae94", "#f2f2f0"],
    disableForReducedMotion: true,
  });
}
