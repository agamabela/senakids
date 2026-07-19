"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./LetuskanBalonGameClient.module.css";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316"];

const LEVELS = [
  { name: { id: "Mudah", en: "Easy" }, minTarget: 2, maxTarget: 4, decoyMin: 1, decoyMax: 2, rounds: 4 },
  { name: { id: "Menengah", en: "Medium" }, minTarget: 3, maxTarget: 6, decoyMin: 2, decoyMax: 4, rounds: 5 },
  { name: { id: "Sulit", en: "Hard" }, minTarget: 5, maxTarget: 8, decoyMin: 3, decoyMax: 6, rounds: 6 },
  { name: { id: "Ekstrem", en: "Extreme" }, minTarget: 7, maxTarget: 11, decoyMin: 4, decoyMax: 8, rounds: 6 },
];

function makeRound(cfg) {
  const span = cfg.maxTarget - cfg.minTarget + 1;
  const target = Math.floor(Math.random() * span) + cfg.minTarget;
  const decoySpan = cfg.decoyMax - cfg.decoyMin + 1;
  const decoys = Math.floor(Math.random() * decoySpan) + cfg.decoyMin;
  const total = target + decoys;
  const balloons = Array.from({ length: total }).map((_, i) => ({
    id: i,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    left: 6 + Math.random() * 82,
    top: 8 + Math.random() * 78,
    size: 46 + Math.random() * 26,
    popped: false,
  }));
  return { target, balloons };
}

export default function LetuskanBalonGameClient() {
  const { language } = useLanguage();
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(1);
  const [{ target, balloons }, setState] = useState(() => makeRound(LEVELS[0]));
  const [popped, setPopped] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const currentLevel = LEVELS[level];

  const reset = useCallback(() => {
    setRound(1);
    setState(makeRound(currentLevel));
    setPopped(0);
    setScore(0);
    setDone(false);
  }, [currentLevel]);

  const advance = () => {
    setRound((r) => {
      if (r >= currentLevel.rounds) {
        setDone(true);
        return r;
      }
      setState(makeRound(currentLevel));
      setPopped(0);
      return r + 1;
    });
  };

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      const nl = LEVELS[level + 1];
      setLevel(level + 1);
      setRound(1);
      setState(makeRound(nl));
      setPopped(0);
      setScore(0);
      setDone(false);
    }
  };

  const popBalloon = (id) => {
    if (done) return;
    setHasChanges(true);
    const balloon = balloons.find((b) => b.id === id);
    if (!balloon || balloon.popped) return;
    if (popped >= target) return;

    const nextPopped = popped + 1;
    setState((prev) => ({
      ...prev,
      balloons: prev.balloons.map((b) => (b.id === id ? { ...b, popped: true } : b)),
    }));
    setPopped(nextPopped);

    if (nextPopped === target) {
      setScore((s) => s + 1);
      setTimeout(advance, 900);
    }
  };

  const remaining = target - popped;
  const canLevelUp = done && level < LEVELS.length - 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎈 {language === "id" ? "Letuskan Balon" : "Pop the Balloons"}</h1>
        <p>
          {language === "id"
            ? "Letuskan balon sesuai jumlah yang diminta!"
            : "Pop exactly the number of balloons asked!"}
        </p>
        <div className={styles.levelBadge}>
          {language === "id" ? "Level" : "Level"} {level + 1} · {currentLevel.name[language]}
        </div>
      </div>

      <div className={styles.stats}>
        <span>⭐ {language === "id" ? "Skor" : "Score"}: {score}</span>
        <span>🎯 {language === "id" ? "Ronde" : "Round"}: {Math.min(round, currentLevel.rounds)}/{currentLevel.rounds}</span>
        <button className={styles.resetBtn} onClick={reset}>
          🔄 {language === "id" ? "Ulang" : "Restart"}
        </button>
      </div>

      {done ? (
        <div className={styles.winMessage}>
          🎉 {language === "id" ? `Hebat! Skormu ${score}/${currentLevel.rounds}!` : `Great job! You scored ${score}/${currentLevel.rounds}!`} 🎉
        </div>
      ) : (
        <div className={styles.task}>
          {language === "id" ? "Letuskan" : "Pop"}{" "}
          <span className={styles.bigNum}>{target}</span>{" "}
          {language === "id" ? "balon" : "balloons"}
          {remaining > 0 && (
            <span className={styles.remaining}>
              {" "}({language === "id" ? "sisa" : "left"}: {remaining})
            </span>
          )}
        </div>
      )}

      {canLevelUp && (
        <div className={styles.controls}>
          <button className={styles.levelUpBtn} onClick={nextLevel}>
            📈 {language === "id" ? "Naik Level" : "Level Up"}
          </button>
        </div>
      )}

      <div className={styles.field}>
        {balloons.map((b) => (
          <button
            key={b.id}
            className={`${styles.balloon} ${b.popped ? styles.popped : ""}`}
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size}px`,
              height: `${b.size * 1.2}px`,
              backgroundColor: b.color,
            }}
            onClick={() => popBalloon(b.id)}
            disabled={b.popped || done}
            aria-label="balloon"
          />
        ))}
      </div>
    </div>
  );
}
