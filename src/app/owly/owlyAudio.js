"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Audio helpers
// ---------------------------------------------------------------------------
// Two independent layers, both with graceful fallbacks:
//   1. speak()  — spoken instructions via the browser SpeechSynthesis API
//   2. sfx      — short generated tones via Web Audio (ding / boing / fanfare)
// No asset files are required, so this works fully offline.
// ═══════════════════════════════════════════════════════════════════════════

// ── Speech (instructions / Owly's voice) ──────────────────────────────────
export function speak(text, lang = "id") {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "id" ? "id-ID" : "en-US";
    u.rate = 0.85; // a touch slower for young children
    u.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    // speech not available — instructions are always on screen too
  }
}

export function stopSpeaking() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

// ── Sound effects (generated tones) ────────────────────────────────────────
let ctx = null;
function ensureCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  return ctx;
}

function tone(freq, dur = 0.15, type = "sine", vol = 0.18, delay = 0) {
  try {
    const c = ensureCtx();
    if (!c) return;
    const start = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(start);
    osc.stop(start + dur);
  } catch {
    /* audio unavailable — ignore */
  }
}

export const sfx = {
  // happy rising "ding" for correct answers
  correct: () => {
    tone(659, 0.12, "triangle", 0.2, 0);
    tone(988, 0.18, "triangle", 0.2, 0.1);
  },
  // gentle, non-scary "boing" for wrong answers (never punishing)
  wrong: () => {
    tone(320, 0.18, "sine", 0.15, 0);
    tone(240, 0.22, "sine", 0.15, 0.12);
  },
  // little pop for tapping / collecting
  pop: () => tone(880, 0.08, "square", 0.12),
  // sparkle chime for stars / gems
  sparkle: () => {
    tone(1046, 0.09, "triangle", 0.16, 0);
    tone(1318, 0.12, "triangle", 0.16, 0.08);
  },
  // celebratory fanfare for finishing a lesson
  fanfare: () => {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone(f, 0.22, "square", 0.2, i * 0.13)
    );
  },
};
