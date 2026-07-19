"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./PukulTikusGameClient.module.css";

const HOLE_COUNT = 9;

const LEVELS = [
  { name: { id: "Mudah", en: "Easy" }, moleInterval: 1100, duration: 30, target: 8 },
  { name: { id: "Menengah", en: "Medium" }, moleInterval: 850, duration: 30, target: 12 },
  { name: { id: "Sulit", en: "Hard" }, moleInterval: 650, duration: 30, target: 16 },
  { name: { id: "Ekstrem", en: "Extreme" }, moleInterval: 450, duration: 30, target: 20 },
];

export default function PukulTikusGameClient() {
  const { language } = useLanguage();
  const [level, setLevel] = useState(0);
  const [activeHole, setActiveHole] = useState(-1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].duration);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bonk, setBonk] = useState(-1);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const moleTimer = useRef(null);
  const countdown = useRef(null);

  const currentLevel = LEVELS[level];

  const clearTimers = useCallback(() => {
    if (moleTimer.current) clearInterval(moleTimer.current);
    if (countdown.current) clearInterval(countdown.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const startGame = () => {
    clearTimers();
    setScore(0);
    setTimeLeft(currentLevel.duration);
    setIsPlaying(true);
    setFinished(false);
    setActiveHole(-1);
    setHasChanges(true);

    moleTimer.current = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * HOLE_COUNT));
    }, currentLevel.moleInterval);

    countdown.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setIsPlaying(false);
          setFinished(true);
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

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      clearTimers();
      setLevel(level + 1);
      setScore(0);
      setTimeLeft(LEVELS[level + 1].duration);
      setIsPlaying(false);
      setFinished(false);
      setActiveHole(-1);
    }
  };

  const reachedTarget = score >= currentLevel.target;
  const canLevelUp = finished && reachedTarget && level < LEVELS.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔨 {language === "id" ? "Pukul Tikus" : "Whack-a-Mole"}</h1>
        <p>{language === "id" ? "Pukul tikus secepat mungkin!" : "Bonk the moles as fast as you can!"}</p>
        <div className={styles.levelBadge}>
          {language === "id" ? "Level" : "Level"} {level + 1} · {currentLevel.name[language]}
        </div>
      </div>

      <div className={styles.stats}>
        <span>⭐ {language === "id" ? "Skor" : "Score"}: {score}</span>
        <span>🎯 {language === "id" ? "Target" : "Target"}: {currentLevel.target}</span>
        <span>⏱️ {language === "id" ? "Waktu" : "Time"}: {timeLeft}s</span>
        <button className={styles.resetBtn} onClick={startGame}>
          {isPlaying ? "🔄 " + (language === "id" ? "Ulang" : "Restart") : "▶️ " + (language === "id" ? "Mulai" : "Start")}
        </button>
      </div>

      {finished && (
        <div className={styles.winMessage}>
          {reachedTarget
            ? "🎉 " + (language === "id" ? `Kena target! Skormu ${score}!` : `Target reached! You scored ${score}!`) + " 🎉"
            : (language === "id" ? `Selesai! Skormu ${score}. Coba lagi!` : `Done! You scored ${score}. Try again!`)}
        </div>
      )}

      {canLevelUp && (
        <div className={styles.controls}>
          <button className={styles.levelUpBtn} onClick={nextLevel}>
            📈 {language === "id" ? "Naik Level" : "Level Up"}
          </button>
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
