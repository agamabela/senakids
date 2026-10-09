// Web Audio API sound generator for Sena Kids 3D games (no external asset dependencies)

let audioCtx = null;

function getContext() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTone(freq = 440, duration = 0.1, type = "sine", volume = 0.15) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

// Pentatonic scale frequencies for melodic combos
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

export function playChime(index = 0) {
  const freq = PENTATONIC[Math.min(index, PENTATONIC.length - 1)] || 440;
  playTone(freq, 0.18, "triangle", 0.2);
}

export function playPerfect() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    [523.25, 659.25, 783.99].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.22, "sine", 0.15), i * 50);
    });
  } catch {}
}

export function playBounce() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function playBonk() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch {}
}

export function playWhoosh() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(480, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

export function playCatch() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    playTone(587.33, 0.08, "sine", 0.18);
    setTimeout(() => playTone(880, 0.12, "sine", 0.2), 60);
  } catch {}
}

export function playFanfare() {
  const notes = [
    { f: 523.25, d: 0.12 },
    { f: 659.25, d: 0.12 },
    { f: 783.99, d: 0.15 },
    { f: 1046.5, d: 0.35 },
  ];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n.f, n.d, "triangle", 0.22), i * 110);
  });
}

export function playGentleOver() {
  const notes = [
    { f: 440, d: 0.16 },
    { f: 392, d: 0.18 },
    { f: 329.63, d: 0.28 },
  ];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n.f, n.d, "sine", 0.15), i * 140);
  });
}

export function playHorn() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    o1.type = "sawtooth";
    o2.type = "triangle";
    o1.frequency.setValueAtTime(329.63, ctx.currentTime);
    o2.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o1.connect(gain);
    o2.connect(gain);
    gain.connect(ctx.destination);
    o1.start();
    o2.start();
    o1.stop(ctx.currentTime + 0.22);
    o2.stop(ctx.currentTime + 0.22);
  } catch {}
}

export function playEngineRev() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(75, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

export function playClatter() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    [160, 220, 180].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.08, "square", 0.07), i * 35);
    });
  } catch {}
}

export function playPop() {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {}
}
