"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./MencocokkanGambarGameClient.module.css";

const ITEMS = [
  { id: 1, emoji: "🐱" },
  { id: 2, emoji: "🐶" },
  { id: 3, emoji: "🐰" },
  { id: 4, emoji: "🐸" },
  { id: 5, emoji: "🦋" },
  { id: 6, emoji: "🐠" },
];

export default function MencocokkanGambarGameClient() {
  const { language } = useLanguage();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...ITEMS, ...ITEMS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uniqueId: index }));
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
  };

  const handleCardClick = (uniqueId) => {
    if (flippedCards.length === 2 || matchedPairs.includes(uniqueId)) return;
    setHasChanges(true);

    const newFlipped = [...flippedCards, uniqueId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const first = cards.find(c => c.uniqueId === newFlipped[0]);
      const second = cards.find(c => c.uniqueId === newFlipped[1]);

      if (first.id === second.id) {
        setMatchedPairs([...matchedPairs, first.id]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const isWon = matchedPairs.length === ITEMS.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧠 Mencocokkan Gambar</h1>
        <p>{language === "id" ? "Cari pasangan gambar yang sama!" : "Find matching pairs!"}</p>
      </div>

      <div className={styles.stats}>
        <span>{language === "id" ? "Moves" : "Moves"}: {moves}</span>
        <button className={styles.resetBtn} onClick={initializeGame}>
          🔄 {language === "id" ? "Mulai Ulang" : "Restart"}
        </button>
      </div>

      {isWon && (
        <div className={styles.winMessage}>
          🎉 {language === "id" ? "Selamat! Kamu Menang!" : "Congratulations! You Won!"} 🎉
        </div>
      )}

      <div className={styles.grid}>
        {cards.map((card) => {
          const isFlipped = flippedCards.includes(card.uniqueId) || matchedPairs.includes(card.id);
          return (
            <button
              key={card.uniqueId}
              className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}
              onClick={() => handleCardClick(card.uniqueId)}
              disabled={isFlipped}
            >
              {isFlipped ? card.emoji : "❓"}
            </button>
          );
        })}
      </div>
    </div>
  );
}