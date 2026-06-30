"use client";

import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import styles from "./AmbientSound.module.css";

const KEY = "senakids-ambience";

/**
 * Gentle kids + nature background ambience, fully synthesized with the Web Audio
 * API (no audio files, no licensing concerns). Layers:
 *  - a soft warm chord pad that slowly swells
 *  - light filtered "wind"
 *  - occasional bird chirps
 *  - sparse, playful music-box notes (pentatonic)
 * Audio can only start after a user gesture, so it's controlled by a toggle.
 */
export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const ref = useRef({});

  // load saved preference
  useEffect(() => {
    try { if (localStorage.getItem(KEY) === "on") setOn(true); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    if (!on) { teardown(); return undefined; }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return undefined;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 2.5);

    // ── warm chord pad ──
    const padGain = ctx.createGain();
    padGain.gain.value = 0.16;
    padGain.connect(master);
    const chord = [196.0, 261.63, 329.63]; // G3 · C4 · E4
    const padOsc = chord.map((f) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.33;
      o.connect(g); g.connect(padGain);
      o.start();
      return o;
    });
    const swell = ctx.createOscillator();
    swell.type = "sine";
    swell.frequency.value = 0.06;
    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.07;
    swell.connect(swellGain); swellGain.connect(padGain.gain);
    swell.start();

    // ── soft wind (filtered noise) ──
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf; noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 480;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.04;
    noise.connect(lp); lp.connect(windGain); windGain.connect(master);
    noise.start();
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.08;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.025;
    windLfo.connect(windLfoGain); windLfoGain.connect(windGain.gain);
    windLfo.start();

    // ── bird chirps ──
    const chirp = () => {
      const t0 = ctx.currentTime;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const start = t0 + i * 0.13;
        const o = ctx.createOscillator();
        o.type = "sine";
        const f = 1900 + Math.random() * 1300;
        o.frequency.setValueAtTime(f, start);
        o.frequency.exponentialRampToValueAtTime(f * 0.62, start + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(0.05, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        o.connect(g); g.connect(master);
        o.start(start); o.stop(start + 0.22);
      }
    };

    // ── playful music-box note (pentatonic) ──
    const penta = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5 D5 E5 G5 A5
    const note = () => {
      const t0 = ctx.currentTime;
      const f = penta[Math.floor(Math.random() * penta.length)];
      const o = ctx.createOscillator();
      o.type = "triangle"; o.frequency.value = f;
      const o2 = ctx.createOscillator();
      o2.type = "sine"; o2.frequency.value = f * 2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 1.4);
      const g2 = ctx.createGain(); g2.gain.value = 0.3; g2.connect(g);
      o.connect(g); o2.connect(g2); g.connect(master);
      o.start(t0); o.stop(t0 + 1.5);
      o2.start(t0); o2.stop(t0 + 1.5);
    };

    const timers = [];
    const loopChirp = () => { chirp(); timers.push(setTimeout(loopChirp, 3500 + Math.random() * 5500)); };
    const loopNote = () => { note(); timers.push(setTimeout(loopNote, 5000 + Math.random() * 8000)); };
    timers.push(setTimeout(loopChirp, 2500));
    timers.push(setTimeout(loopNote, 4500));

    ref.current = { ctx, master, oscs: [...padOsc, swell, windLfo], noise, timers };

    // resume if the context started suspended (e.g. restored "on" before a gesture)
    if (ctx.state === "suspended") {
      const resume = () => { ctx.resume(); window.removeEventListener("pointerdown", resume); window.removeEventListener("keydown", resume); };
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
    }

    function teardown() {}
    return () => {
      const s = ref.current;
      if (!s.ctx) return;
      s.timers.forEach(clearTimeout);
      try {
        s.master.gain.cancelScheduledValues(s.ctx.currentTime);
        s.master.gain.linearRampToValueAtTime(0, s.ctx.currentTime + 0.5);
      } catch {}
      setTimeout(() => {
        try { s.oscs.forEach((o) => o.stop()); } catch {}
        try { s.noise.stop(); } catch {}
        try { s.ctx.close(); } catch {}
      }, 600);
      ref.current = {};
    };
  }, [on]);

  return (
    <button
      type="button"
      className={`${styles.toggle} ${on ? styles.on : ""}`}
      onClick={() => setOn((v) => !v)}
      aria-label={on ? "Matikan musik" : "Nyalakan musik"}
      title={on ? "Matikan musik latar" : "Nyalakan musik latar"}
    >
      {on ? <Music size={20} /> : <VolumeX size={20} />}
    </button>
  );
}
