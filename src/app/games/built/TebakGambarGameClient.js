"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./TebakGambarGameClient.module.css";

const PUZZLES = [
  { id: 1, emoji: "🐱", answer: "Kucing", choices: ["Kucing", "Anjing", "Kuda", "Ayam"] },
  { id: 2, emoji: "🚗", answer: "Mobil", choices: ["Motor", "Mobil", "Bus", "Sepeda"] },
  { id: 3, emoji: "🍎", answer: "Apel", choices: ["Pisang", "Jeruk", "Apel", "anggur"] },
  { id: 4, emoji: "🌞", answer: "Matahari", choices: ["Bulan", "Matahari", "Bintang", "awan"] },
  { id: 5, emoji: "🏠", answer: "Rumah", choices: ["Sekolah", "Rumah", "Toko", "Museum"] },
  { id: 6, emoji: "🐶", answer: "Anjing", choices: ["Kucing", "Anjing", "Babi", "Sapi"] },
];

export default function TebakGambarGameClient() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const puzzle = PUZZLES[currentIndex];

  const handleAnswer = (choice) => {
    setSelectedAnswer(choice);
    setIsCorrect(choice === puzzle.answer);
    setHasChanges(true);
  };

  const nextPuzzle = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentIndex((prev) => (prev + 1) % PUZZLES.length);
    setHasChanges(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🖼️ Tebak Gambar</h1>
        <p>{language === "id" ? "Apa gambar ini?" : "What is this picture?"}</p>
      </div>

      <div className={styles.puzzleCard}>
        <div className={styles.emoji}>{puzzle.emoji}</div>

        <div className={styles.choices}>
          {puzzle.choices.map((choice) => (
            <button
              key={choice}
              className={`${styles.choiceBtn} ${selectedAnswer === choice ? (isCorrect ? styles.correct : styles.wrong) : ''} ${selectedAnswer && choice === puzzle.answer ? styles.correct : ''}`}
              onClick={() => handleAnswer(choice)}
              disabled={selectedAnswer !== null}
            >
              {choice}
            </button>
          ))}
        </div>

        {isCorrect !== null && (
          <div className={`${styles.result} ${isCorrect ? styles.resultCorrect : styles.resultWrong}`}>
            {isCorrect ? (language === "id" ? "✅ Benar!" : "✅ Correct!") : (language === "id" ? "❌ Coba lagi!" : "❌ Try again!")}
          </div>
        )}

        {selectedAnswer && (
          <button className={styles.nextBtn} onClick={nextPuzzle}>
            {language === "id" ? "Soal Berikutnya ▶️" : "Next Puzzle ▶️"}
          </button>
        )}
      </div>

      <div className={styles.progress}>
        {currentIndex + 1} / {PUZZLES.length}
      </div>
    </div>
  );
}