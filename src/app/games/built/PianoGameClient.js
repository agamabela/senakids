"use client";

import { useCallback, useEffect, useState } from "react";
import { useActivityStore } from "@/components/BackButton";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./PianoGameClient.module.css";

// Note layout for one octave (+ the next C). Semitone offset from C.
// Keyboard keys: white = A S D F G H J K, black = W E T Y U
const WHITE_KEYS = [
  { key: "A", name: "C", solfege: "Do", semitone: 0, color: "#ff6b6b" },
  { key: "S", name: "D", solfege: "Re", semitone: 2, color: "#ffa502" },
  { key: "D", name: "E", solfege: "Mi", semitone: 4, color: "#ffd93d" },
  { key: "F", name: "F", solfege: "Fa", semitone: 5, color: "#6bcb77" },
  { key: "G", name: "G", solfege: "Sol", semitone: 7, color: "#4d96ff" },
  { key: "H", name: "A", solfege: "La", semitone: 9, color: "#9b59b6" },
  { key: "J", name: "B", solfege: "Si", semitone: 11, color: "#a855f7" },
  { key: "K", name: "C", solfege: "Do", semitone: 12, color: "#f472b6" },
];

const BLACK_KEYS = [
  { key: "W", name: "C#", semitone: 1, afterWhite: 0 },
  { key: "E", name: "D#", semitone: 3, afterWhite: 1 },
  { key: "T", name: "F#", semitone: 6, afterWhite: 3 },
  { key: "Y", name: "G#", semitone: 8, afterWhite: 4 },
  { key: "U", name: "A#", semitone: 10, afterWhite: 5 },
];

const MIN_OCTAVE = 2;
const MAX_OCTAVE = 6;

// Equal-temperament frequency: A4 (octave 4, semitone 9) = 440Hz
function noteFrequency(octave, semitone) {
  const midi = 12 * (octave + 1) + semitone; // C4 -> 60
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playPianoSound(audioCtx, frequency) {
  const now = audioCtx.currentTime;

  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  const osc = audioCtx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.6, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(frequency * 2, now);
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.04, now + 0.5);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 1);

  osc.connect(gain);
  osc2.connect(gain2);
  gain2.connect(gain);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 1.5);
  osc2.stop(now + 1.5);
}

export default function PianoGameClient() {
  const { lang } = useLanguage();
  const tx = (id, en) => (lang === "en" ? en : id);

  const [audioCtx, setAudioCtx] = useState(null);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [started, setStarted] = useState(false);
  const [octave, setOctave] = useState(4);
  const [lastNote, setLastNote] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const getAudioContext = useCallback(() => {
    if (audioCtx) return audioCtx;
    if (typeof window === "undefined") return null;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioCtx(ctx);
    return ctx;
  }, [audioCtx]);

  useEffect(() => {
    return () => {
      if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
    };
  }, [audioCtx]);

  const playNote = useCallback(
    (semitone, label) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      setStarted(true);
      setHasChanges(true);
      const freq = noteFrequency(octave, semitone);
      playPianoSound(ctx, freq);
      if (label) setLastNote(label);
    },
    [getAudioContext, setHasChanges, octave]
  );

  const shiftOctave = useCallback((dir) => {
    setOctave((o) => Math.min(MAX_OCTAVE, Math.max(MIN_OCTAVE, o + dir)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const allKeys = [...WHITE_KEYS, ...BLACK_KEYS];

    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      if (key === "Z") {
        event.preventDefault();
        shiftOctave(-1);
        return;
      }
      if (key === "X") {
        event.preventDefault();
        shiftOctave(1);
        return;
      }
      const k = allKeys.find((pk) => pk.key === key);
      if (k) {
        event.preventDefault();
        if (activeKeys.has(key)) return; // avoid auto-repeat retrigger
        setActiveKeys((prev) => new Set([...prev, key]));
        playNote(k.semitone, k.solfege || k.name);
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toUpperCase();
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNote, shiftOctave, activeKeys]);

  return (
    <div className={styles.pianoGameWrapper}>
      <header className={styles.pianoHeader}>
        <h1>🎹 {tx("Piano Interaktif", "Interactive Piano")}</h1>
        <p>
          {tx(
            "Tekan tuts di layar atau gunakan keyboard A S D F G H J K (putih) dan W E T Y U (hitam). Tombol Z / X untuk ubah oktaf!",
            "Tap keys on screen or use keyboard keys A S D F G H J K (white) and W E T Y U (black). Use Z / X to shift octaves!"
          )}
        </p>
      </header>

      {/* Control bar */}
      <div className={styles.controlBar} role="toolbar" aria-label={tx("Kontrol Piano", "Piano Controls")}>
        <button
          type="button"
          className={styles.octaveBtn}
          onClick={() => shiftOctave(-1)}
          disabled={octave <= MIN_OCTAVE}
          aria-label={tx("Turunkan nada oktaf", "Lower octave")}
        >
          ⬇️ {tx("Turun Oktaf", "Lower Octave")}
        </button>
        <div className={styles.octaveDisplay} aria-live="polite">
          <span className={styles.octaveLabel}>{tx("Oktaf", "Octave")}</span>
          <span className={styles.octaveValue}>{octave}</span>
        </div>
        <button
          type="button"
          className={styles.octaveBtn}
          onClick={() => shiftOctave(1)}
          disabled={octave >= MAX_OCTAVE}
          aria-label={tx("Naikkan nada oktaf", "Raise octave")}
        >
          ⬆️ {tx("Naik Oktaf", "Raise Octave")}
        </button>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowLabels((s) => !s)}
          aria-pressed={showLabels}
        >
          {showLabels
            ? tx("🔤 Sembunyikan Label", "🔤 Hide Labels")
            : tx("🔤 Tampilkan Label", "🔤 Show Labels")}
        </button>
        <div className={styles.nowPlaying} aria-live="polite" aria-atomic="true">
          {lastNote ? `🎵 ${lastNote}` : "🎵 —"}
        </div>
      </div>

      {/* Realistic keyboard */}
      <div className={styles.pianoContainer}>
        <div className={styles.keyboard} role="region" aria-label={tx("Papan Tuts Piano", "Piano Keyboard")}>
          {WHITE_KEYS.map((wk, index) => (
            <div key={`${wk.key}-${index}`} className={styles.whiteKeyWrap}>
              <button
                type="button"
                className={`${styles.whiteKey} ${activeKeys.has(wk.key) ? styles.whiteKeyActive : ""}`}
                onClick={() => playNote(wk.semitone, wk.solfege)}
                onMouseDown={() => playNote(wk.semitone, wk.solfege)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  playNote(wk.semitone, wk.solfege);
                }}
                aria-label={`${tx("Nada", "Note")} ${wk.solfege} (${wk.name}${octave}) - ${tx("Tombol", "Key")} ${wk.key}`}
              >
                {showLabels && <span className={styles.solfege}>{wk.solfege}</span>}
                <span className={styles.keyLabel}>{wk.key}</span>
              </button>
              {/* Black key sitting between this white key and the next */}
              {BLACK_KEYS.filter((bk) => bk.afterWhite === index).map((bk) => (
                <button
                  key={bk.key}
                  type="button"
                  className={`${styles.blackKey} ${activeKeys.has(bk.key) ? styles.blackKeyActive : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    playNote(bk.semitone, bk.name);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    playNote(bk.semitone, bk.name);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playNote(bk.semitone, bk.name);
                  }}
                  aria-label={`${tx("Nada Hitam", "Black Note")} ${bk.name}${octave} - ${tx("Tombol", "Key")} ${bk.key}`}
                >
                  <span className={styles.blackKeyLabel}>{bk.key}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Colorful Do-Re-Mi pads for little kids */}
      <div className={styles.doremiRow} role="group" aria-label={tx("Papan Nada Warna-Warni", "Colorful Note Pads")}>
        {WHITE_KEYS.map((wk, i) => (
          <button
            key={`pad-${i}`}
            type="button"
            className={styles.doremiPad}
            style={{ background: wk.color }}
            onClick={() => playNote(wk.semitone, wk.solfege)}
            aria-label={`${tx("Mainkan nada", "Play note")} ${wk.solfege}`}
          >
            <span className={styles.doremiText}>{wk.solfege}</span>
          </button>
        ))}
      </div>

      {!started && (
        <div className={styles.hintBox} role="status">
          {tx(
            "Klik tuts atau tekan keyboard untuk mulai bermain musik ceria! 🎶",
            "Click keys or press keyboard keys to start playing playful music! 🎶"
          )}
        </div>
      )}
    </div>
  );
}
