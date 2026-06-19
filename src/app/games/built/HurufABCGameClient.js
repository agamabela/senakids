"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./HurufABCGameClient.module.css";

const ALPHABET = [
  { letter: "A", emoji: "🍎", word: { id: "Apel", en: "Apple" } },
  { letter: "B", emoji: "🐦", word: { id: "Burung", en: "Bird" } },
  { letter: "C", emoji: "🐱", word: { id: "Kucing", en: "Cat" } },
  { letter: "D", emoji: "🐶", word: { id: "Anjing", en: "Dog" } },
  { letter: "E", emoji: "🐘", word: { id: "Gajah", en: "Elephant" } },
  { letter: "F", emoji: "🐸", word: { id: "Katak", en: "Frog" } },
  { letter: "G", emoji: "🍇", word: { id: "Anggur", en: "Grape" } },
  { letter: "H", emoji: "🐴", word: { id: "Kuda", en: "Horse" } },
  { letter: "I", emoji: "🦁", word: { id: "Singa", en: "Lion" } },
  { letter: "J", emoji: "🧒", word: { id: "Anak", en: "Kid" } },
  { letter: "K", emoji: "🍌", word: { id: "Pisang", en: "Banana" } },
  { letter: "L", emoji: "🍋", word: { id: "Lemon", en: "Lemon" } },
  { letter: "M", emoji: "🥭", word: { id: "Mangga", en: "Mango" } },
  { letter: "N", emoji: "🥜", word: { id: "Kacang", en: "Nut" } },
  { letter: "O", emoji: "🥚", word: { id: "Telur", en: "Egg" } },
  { letter: "P", emoji: "🐼", word: { id: "Panda", en: "Panda" } },
  { letter: "Q", emoji: "👑", word: { id: "Mahkota", en: "Queen" } },
  { letter: "R", emoji: "🌈", word: { id: "Pelangi", en: "Rainbow" } },
  { letter: "S", emoji: "🐍", word: { id: "Ular", en: "Snake" } },
  { letter: "T", emoji: "🐢", word: { id: "Kura-kura", en: "Turtle" } },
  { letter: "U", emoji: "☂️", word: { id: "Payung", en: "Umbrella" } },
  { letter: "V", emoji: "🚐", word: { id: "Van", en: "Van" } },
  { letter: "W", emoji: "🐋", word: { id: "Paus", en: "Whale" } },
  { letter: "X", emoji: "❌", word: { id: "Silang", en: "Cross" } },
  { letter: "Y", emoji: "🟡", word: { id: "Kuning", en: "Yellow" } },
  { letter: "Z", emoji: "🦓", word: { id: "Zebra", en: "Zebra" } },
];

const LEVELS = [
  { name: { id: "A-E", en: "A-E" }, start: 0, end: 5 },
  { name: { id: "F-J", en: "F-J" }, start: 5, end: 10 },
  { name: { id: "K-O", en: "K-O" }, start: 10, end: 15 },
  { name: { id: "P-Z", en: "P-Z" }, start: 15, end: 26 },
];

export default function HurufABCGameClient() {
  const { language } = useLanguage();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const level = LEVELS[currentLevel];
  const currentItems = ALPHABET.slice(level.start, level.end);
  const currentItem = currentItems[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
  }, [currentLevel]);

  const next = () => {
    setHasChanges(true);
    if (currentIndex < currentItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(prev => new Set([...prev, currentLevel]));
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const speak = () => {
    const text = `${currentItem.letter}, ${currentItem.word[language]}`;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "id" ? "id-ID" : "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const levelItems = ALPHABET.slice(level.start, level.end);
  const isLevelComplete = completed.has(currentLevel);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🔤 Belajar Huruf</h1>
        <p>{language === "id" ? "Klik untuk dengar suara!" : "Click to hear!"}</p>
      </div>

      <div className={styles.levelNav}>
        {LEVELS.map((l, i) => (
          <button
            key={i}
            className={`${styles.levelBtn} ${currentLevel === i ? styles.active : ""} ${completed.has(i) ? styles.completed : ""}`}
            onClick={() => { setCurrentLevel(i); setCurrentIndex(0); }}
          >
            {l.name[language]}
            {completed.has(i) && <span className={styles.check}>✓</span>}
          </button>
        ))}
      </div>

      {isLevelComplete && (
        <div className={styles.completionBanner}>
          🎉 {language === "id" ? "Hebat! Selesai level ini!" : "Great! Level complete!"} 🎉
        </div>
      )}

      <div className={styles.mainCard}>
        <button className={styles.navBtn} onClick={prev} disabled={currentIndex === 0}>
          ←
        </button>

        <div className={styles.card} onClick={speak}>
          <div className={styles.letter}>{currentItem.letter}</div>
          <div className={styles.emoji}>{currentItem.emoji}</div>
          <div className={styles.word}>{currentItem.word[language]}</div>
          <div className={styles.speakHint}>
            <span>🔊</span>
            {language === "id" ? "Klik untuk dengar" : "Click to listen"}
          </div>
        </div>

        <button className={styles.navBtn} onClick={next} disabled={currentIndex === currentItems.length - 1}>
          →
        </button>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar}>
          {levelItems.map((_, i) => (
            <div
              key={i}
              className={`${styles.progressDot} ${i === currentIndex ? styles.active : ""} ${i < currentIndex ? styles.done : ""}`}
            />
          ))}
        </div>
        <span>{currentIndex + 1} / {currentItems.length}</span>
      </div>

      <button
        className={styles.showAllBtn}
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? "📖" : "🎯"} {showAll ? (language === "id" ? "Tutup" : "Close") : (language === "id" ? "Lihat Semua" : "View All")}
      </button>

      {showAll && (
        <div className={styles.allLetters}>
          {levelItems.map((item, i) => (
            <button
              key={i}
              className={`${styles.miniCard} ${i === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(i)}
            >
              <span className={styles.miniLetter}>{item.letter}</span>
              <span className={styles.miniEmoji}>{item.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}