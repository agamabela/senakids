"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./UrutkanBolaAngkaGameClient.module.css";

const BALLS = [1, 2, 3, 4, 5, 6];

export default function UrutkanBolaAngkaGameClient() {
  const { language } = useLanguage();
  const [balls, setBalls] = useState([]);
  const [selectedBall, setSelectedBall] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...BALLS].sort(() => Math.random() - 0.5);
    setBalls(shuffled);
    setMoves(0);
    setSelectedBall(null);
    setGameWon(false);
  };

  const handleBallClick = (index) => {
    if (selectedBall === null) {
      setSelectedBall(index);
    } else if (selectedBall === index) {
      setSelectedBall(null);
    } else {
      // Swap balls
      const newBalls = [...balls];
      [newBalls[selectedBall], newBalls[index]] = [newBalls[index], newBalls[selectedBall]];
      setBalls(newBalls);
      setMoves(moves + 1);
      setSelectedBall(null);
      setHasChanges(true);

      // Check if sorted
      const sorted = newBalls.every((ball, idx) => ball === idx + 1);
      if (sorted) {
        setGameWon(true);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>⚽ Urutkan Bola Angka</h1>
        <p>{language === "id" ? "Susun bola angka dari kecil ke besar!" : "Arrange the number balls from smallest to largest!"}</p>
      </div>

      <div className={styles.stats}>
        <span>{language === "id" ? "Moves" : "Moves"}: {moves}</span>
        <button className={styles.resetBtn} onClick={initializeGame}>
          🔄 {language === "id" ? "Mulai Ulang" : "Restart"}
        </button>
      </div>

      {gameWon && (
        <div className={styles.winMessage}>
          🎉 {language === "id" ? "Selamat! Urutan Benar!" : "Congratulations! Correct Order!"} 🎉
        </div>
      )}

      <div className={styles.ballsContainer}>
        {balls.map((num, index) => (
          <button
            key={`${num}-${index}`}
            className={`${styles.ball} ${selectedBall === index ? styles.selected : ''}`}
            onClick={() => handleBallClick(index)}
          >
            {num}
          </button>
        ))}
      </div>

      <div className={styles.instructions}>
        <p>{language === "id"
          ? "Petunjuk: Klik dua bola untuk menukar posisi mereka!"
          : "Hint: Click two balls to swap their positions!"}</p>
      </div>
    </div>
  );
}