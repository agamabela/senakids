"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./PukulTikusGameClient.module.css";

const HOLE_COUNT = 9;
const GAME_DURATION = 30; // seconds

export default function PukulTikusGameClient() {
  const { language } = useLanguage();
  const [activeHole, setActiveHole] = useState(-1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bonk, setBonk] = useState(-1);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const moleTimer = useRef(null);
  const countdown = useRef(null);

  const clearTimers = useCallback(() => {
    if (moleTimer.current) clearInterval(moleTimer.current);
    if (countdown.current) clearInterval(countdown.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startGame = () => {
    clearTimers();
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsPlaying(true);
    setActiveHole(-1);
    setHasChanges(true);

    moleTimer.current = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * HOLE_COUNT));
    }, 800);

    countdown.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setIsPlaying(false);
          setActiveHole(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const whack = (index) => {
    if (!isPlaying || index !== activeHole) return;
    setScore((s) => s + 1);
    setBonk(index);
    setActiveHole(-1);
    setTimeout(() => setBonk(-1), 250);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔨 {language === "id" ? "Pukul Tikus" : "Whack-a-Mole"}</h1>
        <p>{language === "id" ? "Pukul tikus secepat mungkin!" : "Bonk the moles as fast as you can!"}</p>
      </div>

      <div className={styles.stats}>
        <span>⭐ {language === "id" ? "Skor" : "Score"}: {score}</span>
        <span>⏱️ {language === "id" ? "Waktu" : "Time"}: {timeLeft}s</span>
        <button className={styles.resetBtn} onClick={startGame}>
          {isPlaying ? "🔄 " + (language === "id" ? "Ulang" : "Restart") : "▶️ " + (language === "id" ? "Mulai" : "Start")}
        </button>
      </div>

      {!isPlaying && timeLeft === 0 && (
        <div className={styles.winMessage}>
          🎉 {language === "id" ? `Selesai! Skormu ${score}!` : `Done! You scored ${score}!`} 🎉
        </div>
      )}

      <div className={styles.grid}>
        {Array.from({ length: HOLE_COUNT }).map((_, i) => (
          <button
            key={i}
            className={styles.hole}
            onClick={() => whack(i)}
            aria-label="hole"
          >
            <span
              className={`${styles.mole} ${activeHole === i ? styles.up : ""} ${bonk === i ? styles.bonk : ""}`}
            >
              {bonk === i ? "💥" : "🐹"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
