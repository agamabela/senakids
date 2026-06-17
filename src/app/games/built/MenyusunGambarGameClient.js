"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./MenyusunGambarGameClient.module.css";

const EMOJI = "🌸";
const GRID_SIZE = 3;

export default function MenyusunGambarGameClient() {
  const { language } = useLanguage();
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [moves, setMoves] = useState(0);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const allPieces = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      allPieces.push(i);
    }
    const shuffled = [...allPieces].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setMoves(0);
    setSelectedPiece(null);
  };

  const handlePieceClick = (index) => {
    if (selectedPiece === null) {
      setSelectedPiece(index);
    } else if (selectedPiece === index) {
      setSelectedPiece(null);
    } else {
      // Swap pieces
      const newPieces = [...pieces];
      [newPieces[selectedPiece], newPieces[index]] = [newPieces[index], newPieces[selectedPiece]];
      setPieces(newPieces);
      setMoves(moves + 1);
      setSelectedPiece(null);
      setHasChanges(true);

      // Check if solved
      const solved = newPieces.every((piece, idx) => piece === idx);
      if (solved) {
        setTimeout(() => {
          alert(language === "id" ? "Selamat! Puzzle selesai!" : "Congratulations! Puzzle solved!");
        }, 100);
      }
    }
  };

  const getPieceStyle = (pieceIndex) => {
    const originalIndex = pieces[pieceIndex];
    const row = Math.floor(originalIndex / GRID_SIZE);
    const col = originalIndex % GRID_SIZE;
    return {
      backgroundPosition: `-${col * 100 / (GRID_SIZE - 1)}% -${row * 100 / (GRID_SIZE - 1)}%`,
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧩 Menyusun Gambar</h1>
        <p>{language === "id" ? "Susun potongan gambar menjadi utuh!" : "Arrange the pieces to complete the picture!"}</p>
      </div>

      <div className={styles.stats}>
        <span>{language === "id" ? "Moves" : "Moves"}: {moves}</span>
        <button className={styles.resetBtn} onClick={initializeGame}>
          🔄 {language === "id" ? "Mulai Ulang" : "Restart"}
        </button>
      </div>

      <div className={styles.puzzleArea}>
        <div className={styles.piecesGrid}>
          {pieces.map((piece, index) => (
            <button
              key={index}
              className={`${styles.piece} ${selectedPiece === index ? styles.selected : ''}`}
              onClick={() => handlePieceClick(index)}
            >
              <span className={styles.pieceNumber}>{piece + 1}</span>
            </button>
          ))}
        </div>

        <div className={styles.targetGrid}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
            <div key={i} className={styles.targetCell}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.instructions}>
        <p>{language === "id"
          ? "Petunjuk: Klik dua potongan untuk menukar posisi mereka!"
          : "Hint: Click two pieces to swap their positions!"}</p>
      </div>
    </div>
  );
}