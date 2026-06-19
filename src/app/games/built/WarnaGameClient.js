"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./WarnaGameClient.module.css";

const COLORS = [
  { id: "red", name: { id: "Merah", en: "Red" }, hex: "#EF4444", emoji: "🍎" },
  { id: "orange", name: { id: "Oranye", en: "Orange" }, hex: "#F97316", emoji: "🍊" },
  { id: "yellow", name: { id: "Kuning", en: "Yellow" }, hex: "#EAB308", emoji: "🍋" },
  { id: "green", name: { id: "Hijau", en: "Green" }, hex: "#22C55E", emoji: "🥬" },
  { id: "blue", name: { id: "Biru", en: "Blue" }, hex: "#3B82F6", emoji: "🟦" },
  { id: "purple", name: { id: "Ungu", en: "Purple" }, hex: "#A855F7", emoji: "🍇" },
  { id: "pink", name: { id: "Merah Muda", en: "Pink" }, hex: "#EC4899", emoji: "🌸" },
  { id: "brown", name: { id: "Coklat", en: "Brown" }, hex: "#92400E", emoji: "🍫" },
];

const MODE = {
  LEARN: "learn",
  MATCH: "match",
  SORT: "sort",
};

export default function WarnaGameClient() {
  const { language } = useLanguage();
  const [currentMode, setCurrentMode] = useState(MODE.LEARN);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [shuffledColors, setShuffledColors] = useState([]);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const currentColor = COLORS[currentIndex];

  useEffect(() => {
    setShuffledColors([...COLORS].sort(() => Math.random() - 0.5));
    setSelectedColors([]);
    setIsCorrect(null);
  }, [currentMode]);

  const speak = () => {
    if ("speechSynthesis" in window) {
      const text = currentColor.name[language];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "id" ? "id-ID" : "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleColorClick = (color) => {
    setHasChanges(true);
    
    if (currentMode === MODE.LEARN) {
      setCurrentIndex(COLORS.findIndex(c => c.id === color.id));
      return;
    }

    if (currentMode === MODE.MATCH) {
      if (color.id === currentColor.id) {
        setIsCorrect(true);
        setScore(score + 10 + (streak * 2));
        setStreak(streak + 1);
        setTimeout(() => {
          setCurrentIndex(Math.floor(Math.random() * COLORS.length));
          setShuffledColors([...COLORS].sort(() => Math.random() - 0.5));
          setIsCorrect(null);
        }, 1000);
      } else {
        setIsCorrect(false);
        setStreak(0);
        setTimeout(() => setIsCorrect(null), 500);
      }
    }

    if (currentMode === MODE.SORT) {
      const expected = COLORS[selectedColors.length];
      if (color.id === expected.id) {
        const newSelected = [...selectedColors, color];
        setSelectedColors(newSelected);
        setScore(score + 10);
        
        if (newSelected.length === COLORS.length) {
          setTimeout(() => {
            alert(language === "id" ? "🎉 Selesai! Kamu luar biasa!" : "🎉 Done! You're amazing!");
            setSelectedColors([]);
            setScore(0);
            setShuffledColors([...COLORS].sort(() => Math.random() - 0.5));
          }, 500);
        }
      }
    }
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % COLORS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎨 Warna</h1>
        <p>{language === "id" ? "Belajar warna-warna yang indah!" : "Learn beautiful colors!"}</p>
      </div>

      <div className={styles.modeNav}>
        {Object.values(MODE).map((mode) => (
          <button
            key={mode}
            className={`${styles.modeBtn} ${currentMode === mode ? styles.active : ""}`}
            onClick={() => { setCurrentMode(mode); setCurrentIndex(0); setScore(0); setStreak(0); }}
          >
            {mode === MODE.LEARN && (language === "id" ? "📖 Belajar" : "📖 Learn")}
            {mode === MODE.MATCH && (language === "id" ? "🎯 Cocokkan" : "🎯 Match")}
            {mode === MODE.SORT && (language === "id" ? "🃏 Urutkan" : "🃏 Sort")}
          </button>
        ))}
      </div>

      <div className={styles.stats}>
        <span>⭐ {score}</span>
        {currentMode !== MODE.LEARN && <span>🔥 {streak}</span>}
      </div>

      {currentMode === MODE.LEARN && (
        <div className={styles.learnSection}>
          <div className={styles.mainCard}>
            <button className={styles.navBtn} onClick={prev}>←</button>
            <div className={styles.colorCard} style={{ backgroundColor: currentColor.hex }} onClick={speak}>
              <span className={styles.colorEmoji}>{currentColor.emoji}</span>
              <span className={styles.colorName}>{currentColor.name[language]}</span>
              <span className={styles.speakHint}>🔊</span>
            </div>
            <button className={styles.navBtn} onClick={next}>→</button>
          </div>
          <div className={styles.allColors}>
            {COLORS.map((color) => (
              <button
                key={color.id}
                className={`${styles.colorDot} ${currentColor.id === color.id ? styles.active : ""}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setCurrentIndex(COLORS.findIndex(c => c.id === color.id))}
              />
            ))}
          </div>
        </div>
      )}

      {currentMode === MODE.MATCH && (
        <div className={styles.matchSection}>
          <div className={styles.targetCard} style={{ backgroundColor: currentColor.hex }}>
            <span className={styles.targetEmoji}>{currentColor.emoji}</span>
            <span className={styles.targetName}>{currentColor.name[language]}</span>
          </div>
          <div className={styles.options}>
            {shuffledColors.map((color) => (
              <button
                key={color.id}
                className={`${styles.optionBtn} ${isCorrect === true ? styles.correct : ""} ${isCorrect === false && color.id === currentColor.id ? styles.showCorrect : ""}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorClick(color)}
              >
                {color.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentMode === MODE.SORT && (
        <div className={styles.sortSection}>
          <div className={styles.slots}>
            {COLORS.map((color, i) => (
              <div
                key={color.id}
                className={`${styles.slot} ${selectedColors[i] ? styles.filled : ""}`}
                style={{ backgroundColor: selectedColors[i]?.hex || "#f3f4f6" }}
              >
                {selectedColors[i]?.emoji || (i + 1)}
              </div>
            ))}
          </div>
          <p className={styles.sortHint}>
            {language === "id" ? "Klik warna urut dari Merah ke Ungu!" : "Click colors in order from Red to Purple!"}
          </p>
          <div className={styles.sortOptions}>
            {shuffledColors.map((color) => (
              <button
                key={color.id}
                className={styles.sortBtn}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorClick(color)}
                disabled={selectedColors.some(c => c.id === color.id)}
              >
                {color.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}