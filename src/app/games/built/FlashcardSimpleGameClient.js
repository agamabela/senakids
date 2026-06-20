"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./FlashcardSimpleGameClient.module.css";

const FLASHCARDS = [
  { id: 1, emoji: "🍎", front: "Apple", back: "Apel" },
  { id: 2, emoji: "🍌", front: "Banana", back: "Pisang" },
  { id: 3, emoji: "🍊", front: "Orange", back: "Jeruk" },
  { id: 4, emoji: "🍇", front: "Grape", back: "Anggur" },
  { id: 5, emoji: "🍓", front: "Strawberry", back: "Stroberi" },
  { id: 6, emoji: "🍉", front: "Watermelon", back: "Semangka" },
  { id: 7, emoji: "🥝", front: "Kiwi", back: "Kiwi" },
  { id: 8, emoji: "🍑", front: "Peach", back: "Persik" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardSimpleGameClient() {
  const { language } = useLanguage();
  const [cards] = useState(() => shuffle(FLASHCARDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const card = cards[currentIndex];

  const handleFlip = () => {
    setFlipped(!flipped);
    setHasChanges(true);
  };

  const nextCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setHasChanges(true);
  };

  const prevCard = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setHasChanges(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🃏 Flashcard Simple</h1>
        <p>{language === "id" ? "Klik kartu untuk membalik!" : "Click the card to flip!"}</p>
      </div>

      <div className={styles.cardContainer} onClick={handleFlip}>
        <div className={`${styles.card} ${flipped ? styles.flipped : ''}`}>
          <div className={styles.cardFront}>
            <div className={styles.emoji}>{card.emoji}</div>
            <span className={styles.word}>{card.front}</span>
          </div>
          <div className={styles.cardBack}>
            <div className={styles.emoji}>{card.emoji}</div>
            <span className={styles.word}>{card.back}</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevCard}>
          ◀️ Prev
        </button>
        <div className={styles.counter}>
          {currentIndex + 1} / {cards.length}
        </div>
        <button className={styles.navBtn} onClick={nextCard}>
          Next ▶️
        </button>
      </div>

      <div className={styles.instruction}>
        {language === "id"
          ? "Kartu menunjukkan kata dalam bahasa Inggris. Klik untuk melihat terjemahan bahasa Indonesia!"
          : "The card shows a word in English. Click to see the Indonesian translation!"}
      </div>
    </div>
  );
}