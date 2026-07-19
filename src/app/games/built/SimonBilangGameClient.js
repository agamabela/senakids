"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./SimonBilangGameClient.module.css";

const PADS = [
  { id: 0, color: "#ef4444", freq: 329.63 },
  { id: 1, color: "#22c55e", freq: 392.0 },
  { id: 2, color: "#3b82f6", freq: 261.63 },
  { id: 3, color: "#eab308", freq: 493.88 },
];

export default function SimonBilangGameClient() {
  const { language } = useLanguage();
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [active, setActive] = useState(-1);
  const [isShowing, setIsShowing] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const audioCtx = useRef(null);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const playTone = (freq) => {
    try {
      if (!audioCtx.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx.current = new Ctx();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // audio not available, ignore
    }
  };

  const flashPad = (id) => {
    setActive(id);
    playTone(PADS[id].freq);
    const t = setTimeout(() => setActive(-1), 350);
    timers.current.push(t);
  };

  const playSequence = useCallback((seq) => {
    setIsShowing(true);
    clearTimers();
    seq.forEach((id, i) => {
      const t = setTimeout(() => {
        flashPad(id);
        if (i === seq.length - 1) {
          const end = setTimeout(() => setIsShowing(false), 500);
          timers.current.push(end);
        }
      }, (i + 1) * 700);
      timers.current.push(t);
    });
  }, [clearTimers]);

  const nextRound = useCallback((current) => {
    const next = [...current, Math.floor(Math.random() * PADS.length)];
    setSequence(next);
    setUserStep(0);
    playSequence(next);
  }, [playSequence]);

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setStarted(true);
    setHasChanges(true);
    nextRound([]);
  };

  const handlePad = (id) => {
    if (isShowing || gameOver || !started) return;
    flashPad(id);

    if (id !== sequence[userStep]) {
      setGameOver(true);
      setStarted(false);
      return;
    }

    if (userStep + 1 === sequence.length) {
      setScore((s) => s + 1);
      const t = setTimeout(() => nextRound(sequence), 800);
      timers.current.push(t);
    } else {
      setUserStep((s) => s + 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎨 {language === "id" ? "Simon Bilang" : "Simon Says"}</h1>
        <p>{language === "id" ? "Ingat dan ulangi urutan warna!" : "Remember and repeat the color sequence!"}</p>
      </div>

      <div className={styles.stats}>
        <span>⭐ {language === "id" ? "Skor" : "Score"}: {score}</span>
        <button className={styles.resetBtn} onClick={startGame}>
          {started ? "🔄 " + (language === "id" ? "Ulang" : "Restart") : "▶️ " + (language === "id" ? "Mulai" : "Start")}
        </button>
      </div>

      {gameOver && (
        <div className={styles.winMessage}>
          {language === "id" ? `Yah, salah! Skormu ${score}. Coba lagi!` : `Oops! You scored ${score}. Try again!`}
        </div>
      )}

      {isShowing && !gameOver && (
        <div className={styles.hint}>{language === "id" ? "Perhatikan..." : "Watch..."}</div>
      )}

      <div className={styles.board}>
        {PADS.map((pad) => (
          <button
            key={pad.id}
            className={`${styles.pad} ${active === pad.id ? styles.padActive : ""}`}
            style={{ backgroundColor: pad.color }}
            onClick={() => handlePad(pad.id)}
            disabled={isShowing || !started}
            aria-label={`pad-${pad.id}`}
          />
        ))}
      </div>
    </div>
  );
}
