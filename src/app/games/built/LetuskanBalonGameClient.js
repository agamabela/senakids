"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./LetuskanBalonGameClient.module.css";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899", "#f97316"];
const MAX_ROUNDS = 5;

function makeRound() {
  const target = Math.floor(Math.random() * 6) + 3; // 3..8 balloons to pop
  const total = target + Math.floor(Math.random() * 4) + 2; // extra decoy balloons
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
  const [round, setRound] = useState(1);
  const [{ target, balloons }, setState] = useState(makeRound);
  const [popped, setPopped] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const reset = useCallback(() => {
    setRound(1);
    setState(makeRound());
    setPopped(0);
    setScore(0);
    setDone(false);
  }, []);

  const advance = () => {
    if (round >= MAX_ROUNDS) {
      setDone(true);
      return;
    }
    setRound((r) => r + 1);
    setState(makeRound());
    setPopped(0);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎈 {language === "id" ? "Letuskan Balon" : "Pop the Balloons"}</h1>
        <p>
          {language === "id"
            ? "Letuskan balon sesuai jumlah yang diminta!"
            : "Pop exactly the number of balloons asked!"}
        </p>
      </div>

      <div className={styles.stats}>
        <span>⭐ {language === "id" ? "Skor" : "Score"}: {score}</span>
        <span>🎯 {language === "id" ? "Ronde" : "Round"}: {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS}</span>
        <button className={styles.resetBtn} onClick={reset}>
          🔄 {language === "id" ? "Ulang" : "Restart"}
        </button>
      </div>

      {done ? (
        <div className={styles.winMessage}>
          🎉 {language === "id" ? `Hebat! Skormu ${score}/${MAX_ROUNDS}!` : `Great job! You scored ${score}/${MAX_ROUNDS}!`} 🎉
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
