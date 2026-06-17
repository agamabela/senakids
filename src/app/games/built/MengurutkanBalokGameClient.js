"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./MengurutkanBalokGameClient.module.css";

const NUM_BLOCKS = 5;

export default function MengurutkanBalokGameClient() {
  const { language } = useLanguage();
  const [blocks, setBlocks] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const numbers = Array.from({ length: NUM_BLOCKS }, (_, i) => i + 1);
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setBlocks(shuffled);
    setMoves(0);
    setGameWon(false);
  };

  const handleBlockClick = (index) => {
    if (index === 0) return;
    setHasChanges(true);

    // Move block to front
    const newBlocks = [...blocks];
    const [clickedBlock] = newBlocks.splice(index, 1);
    newBlocks.unshift(clickedBlock);
    setBlocks(newBlocks);
    setMoves(moves + 1);

    // Check if sorted
    const sorted = newBlocks.every((block, idx) => block === idx + 1);
    if (sorted) {
      setGameWon(true);
    }
  };

  const isSorted = blocks.every((block, idx) => block === idx + 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🟦 Mengurutkan Balok</h1>
        <p>{language === "id" ? "Urutkan balok dari yang terkecil!" : "Sort the blocks from smallest to largest!"}</p>
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

      <div className={styles.gameArea}>
        <div className={styles.blocksContainer}>
          {blocks.map((num, index) => (
            <button
              key={`${num}-${index}`}
              className={styles.block}
              onClick={() => handleBlockClick(index)}
              style={{
                width: `${40 + num * 15}px`,
                height: `${40 + num * 15}px`,
                backgroundColor: isSorted ? '#22c55e' : '#3b82f6'
              }}
            >
              {num}
            </button>
          ))}
        </div>

        <div className={styles.targetOrder}>
          <span>{language === "id" ? "Target:" : "Target:"}</span>
          <div className={styles.targetBlocks}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={styles.targetBlock}>{n}</div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.instructions}>
        <p>{language === "id"
          ? "Petunjuk: Klik balok untuk memindahkan ke depan. Susun dari 1 sampai 5!"
          : "Hint: Click a block to move it to the front. Arrange from 1 to 5!"}</p>
      </div>
    </div>
  );
}