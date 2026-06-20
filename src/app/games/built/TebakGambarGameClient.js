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
  { id: 7, emoji: "🐘", answer: "Gajah", choices: ["Badak", "Gajah", "Kuda", "Singa"] },
  { id: 8, emoji: "🌈", answer: "Pelangi", choices: ["Awan", "Pelangi", "Hujan", "Petir"] },
  { id: 9, emoji: "🦋", answer: "Kupu-kupu", choices: ["Lebah", "Capung", "Kupu-kupu", "Lalat"] },
  { id: 10, emoji: "⚽", answer: "Bola", choices: ["Bola", "Balon", "Roda", "Donat"] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TebakGambarGameClient() {
  const { language } = useLanguage();
  // Shuffle puzzle order and each puzzle's choices once per session
  const [puzzles] = useState(() =>
    shuffle(PUZZLES).map((p) => ({ ...p, choices: shuffle(p.choices) }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const puzzle = puzzles[currentIndex];

  const handleAnswer = (choice) => {
    setSelectedAnswer(choice);
    setIsCorrect(choice === puzzle.answer);
    setHasChanges(true);
  };

  const nextPuzzle = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCurrentIndex((prev) => (prev + 1) % puzzles.length);
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
        {currentIndex + 1} / {puzzles.length}
      </div>
    </div>
  );
}