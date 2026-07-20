"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Audio helpers
// ---------------------------------------------------------------------------
// Two layers:
//   1. speak()  — real native voice via the Google Cloud TTS endpoint
//                 (/api/tts, id-ID-Neural2-C for Indonesian). No browser
//                 SpeechSynthesis — we want a natural native narrator.
//   2. sfx      — short generated tones via Web Audio (ding / boing / fanfare)
// ═══════════════════════════════════════════════════════════════════════════

// ── Shared AudioContext (also used to play the returned MP3) ────────────────
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

// ── Speech (native TTS narration) ──────────────────────────────────────────
let currentSource = null;

export async function speak(text, language = "id") {
  try {
    if (typeof window === "undefined" || !text) return;
    stopSpeaking();

    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) return;

    const data = await res.json();
    if (!data.audio) return;

    const c = ensureCtx();
    if (!c) return;

    // base64 -> ArrayBuffer -> decoded audio
    const binary = atob(data.audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const buffer = await c.decodeAudioData(bytes.buffer);

    const source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    source.onended = () => {
      if (currentSource === source) currentSource = null;
    };
    currentSource = source;
    source.start(0);
  } catch {
    // network / decode issues — instructions are always on screen too
  }
}

export function stopSpeaking() {
  try {
    if (currentSource) {
      currentSource.stop();
      currentSource = null;
    }
  } catch {
    /* already stopped */
  }
}

// ── Sound effects (generated tones) ────────────────────────────────────────
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
