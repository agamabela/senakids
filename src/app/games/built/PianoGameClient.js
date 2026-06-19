"use client";

import { useCallback, useEffect, useState } from "react";
import { useActivityStore } from "@/components/BackButton";
import styles from "./PianoGameClient.module.css";

// Piano keys: C4 to C5 (one octave + C)
const pianoKeys = [
  { key: "A", note: "C4", freq: 261.63, color: "#ff6b6b" },
  { key: "W", note: "C#4", freq: 277.18, color: "#ffa502", isBlack: true },
  { key: "S", note: "D4", freq: 293.66, color: "#ffa502" },
  { key: "E", note: "D#4", freq: 311.13, color: "#ffd93d", isBlack: true },
  { key: "D", note: "E4", freq: 329.63, color: "#ffd93d" },
  { key: "F", note: "F4", freq: 349.23, color: "#6bcb77" },
  { key: "T", note: "F#4", freq: 369.99, color: "#6bcb77", isBlack: true },
  { key: "G", note: "G4", freq: 392.0, color: "#4d96ff" },
  { key: "Y", note: "G#4", freq: 415.3, color: "#4d96ff", isBlack: true },
  { key: "H", note: "A4", freq: 440.0, color: "#4d96ff" },
  { key: "U", note: "A#4", freq: 466.16, color: "#a855f7", isBlack: true },
  { key: "J", note: "B4", freq: 493.88, color: "#a855f7" },
  { key: "K", note: "C5", freq: 523.25, color: "#f472b6" },
];

function playPianoSound(audioCtx, frequency) {
  const now = audioCtx.currentTime;

  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  // Create oscillator for piano-like tone
  const osc = audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, now);

  // Piano envelope: quick attack, medium decay
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.6, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.3, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

  // Add harmonics for richer sound
  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(frequency * 2, now);
  const gain2 = audioCtx.createGain();
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.5);
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
  const [audioCtx, setAudioCtx] = useState(null);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [started, setStarted] = useState(false);
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
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close();
      }
    };
  }, [audioCtx]);

  const playNote = useCallback(
    (freq) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      setStarted(true);
      setHasChanges(true);
      playPianoSound(ctx, freq);
    },
    [getAudioContext, setHasChanges]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      const pianoKey = pianoKeys.find((k) => k.key === key);
      if (pianoKey) {
        event.preventDefault();
        setActiveKeys((prev) => new Set([...prev, key]));
        playNote(pianoKey.freq);
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
  }, [playNote]);

  // Calculate positions for black keys
  const whiteKeys = pianoKeys.filter((k) => !k.isBlack);
  const getBlackKeyPosition = (note) => {
    const index = whiteKeys.findIndex((k) => k.note === note);
    return index;
  };

  return (
    <div className={styles.pianoGameWrapper}>
      <div className={styles.pianoHeader}>
        <h1>🎹 Piano</h1>
        <p>Tekan tombol keyboard A S D F G H J K atau W E T Y U untuk memainkan piano!</p>
      </div>

      <div className={styles.pianoContainer}>
        <div className={styles.keyboard}>
          {whiteKeys.map((key, index) => (
            <div key={key.note}>
              <div
                className={`${styles.whiteKey} ${
                  activeKeys.has(key.key) ? styles.whiteKeyActive : ""
                }`}
                onClick={() => playNote(key.freq)}
              >
                <span className={styles.keyLabel}>{key.key}</span>
                <span className={styles.keyNote}>{key.note}</span>
              </div>
              {/* Black key after this white key */}
              {index < whiteKeys.length - 1 && (
                <>
                  {(() => {
                    const nextWhiteNote = whiteKeys[index + 1].note;
                    const blackNote = nextWhiteNote.slice(0, 2) + "#" + nextWhiteNote.slice(2);
                    const blackKey = pianoKeys.find((k) => k.note === blackNote);
                    if (blackKey) {
                      return (
                        <div
                          className={`${styles.blackKey} ${
                            activeKeys.has(blackKey.key) ? styles.blackKeyActive : ""
                          }`}
                          style={{
                            left: `${(index + 1) * 74 - 25}px`,
                          }}
                          onClick={() => playNote(blackKey.freq)}
                        >
                          <span className={styles.blackKeyLabel}>{blackKey.key}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Colorful keys for kids */}
      <div className={styles.colorfulKeys}>
        {pianoKeys.slice(0, 7).map((key) => (
          <button
            key={key.key}
            type="button"
            className={`${styles.colorKey} ${
              key.color.includes("red")
                ? styles.colorKeyRed
                : key.color.includes("orange")
                ? styles.colorKeyOrange
                : key.color.includes("yellow")
                ? styles.colorKeyYellow
                : key.color.includes("green")
                ? styles.colorKeyGreen
                : key.color.includes("blue")
                ? styles.colorKeyBlue
                : styles.colorKeyPurple
            }`}
            onClick={() => playNote(key.freq)}
            style={{
              background:
                key.color === "#ff6b6b"
                  ? "linear-gradient(145deg, #ff6b6b, #ee5a5a)"
                  : key.color === "#ffa502"
                  ? "linear-gradient(145deg, #ffa502, #ff7f00)"
                  : key.color === "#ffd93d"
                  ? "linear-gradient(145deg, #ffd93d, #ffc107)"
                  : key.color === "#6bcb77"
                  ? "linear-gradient(145deg, #6bcb77, #4caf50)"
                  : "linear-gradient(145deg, #4d96ff, #3b82f6)",
            }}
          >
            🎵
          </button>
        ))}
      </div>

      {!started && (
        <div className={styles.hintBox}>
          Klik tombol manapun atau tekan tombol keyboard untuk mulai!
        </div>
      )}
    </div>
  );
}