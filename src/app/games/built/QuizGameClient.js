"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./QuizGameClient.module.css";

const QUIZZES = [
  {
    id: 1,
    question: "Apa warna langit?",
    questionEn: "What color is the sky?",
    options: ["Biru", "Merah", "Hijau", "Kuning"],
    answer: 0,
  },
  {
    id: 2,
    question: "Berapa 2 + 2?",
    questionEn: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    answer: 1,
  },
  {
    id: 3,
    question: "Hewan mana yang suka makan wortel?",
    questionEn: "Which animal likes to eat carrots?",
    options: ["Kucing", "Anjing", "Kelinci", "Ikan"],
    answer: 2,
  },
  {
    id: 4,
    question: "Apa bentuk matahari?",
    questionEn: "What shape is the sun?",
    options: ["Kotak", "Segitiga", "Bulat", "Bintang"],
    answer: 2,
  },
  {
    id: 5,
    question: "Air membeku pada suhu berapa?",
    questionEn: "At what temperature does water freeze?",
    options: ["0°C", "100°C", "50°C", "-10°C"],
    answer: 0,
  },
];

export default function QuizGameClient() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const quiz = QUIZZES[currentIndex];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setHasChanges(true);
    if (index === quiz.answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < QUIZZES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    const percentage = Math.round((score / QUIZZES.length) * 100);
    return (
      <div className={styles.container}>
        <div className={styles.resultCard}>
          <h1>🧠 Quiz Selesai!</h1>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreNumber}>{score}</span>
            <span className={styles.scoreTotal}>/ {QUIZZES.length}</span>
          </div>
          <p className={styles.percentage}>{percentage}% {language === "id" ? "Benar" : "Correct"}</p>
          <p className={styles.message}>
            {percentage >= 80
              ? "🌟 Hebat sekali!"
              : percentage >= 60
              ? "👍 Bagus!"
              : "💪 Tetap semangat!"}
          </p>
          <button className={styles.restartBtn} onClick={restartQuiz}>
            🔄 {language === "id" ? "Main Lagi" : "Play Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧠 Quiz</h1>
        <p>{language === "id" ? "Jawab pertanyaan dengan benar!" : "Answer the questions correctly!"}</p>
      </div>

      <div className={styles.progress}>
        {currentIndex + 1} / {QUIZZES.length}
      </div>

      <div className={styles.quizCard}>
        <div className={styles.question}>
          {language === "id" ? quiz.question : quiz.questionEn}
        </div>

        <div className={styles.options}>
          {quiz.options.map((option, index) => (
            <button
              key={index}
              className={`${styles.optionBtn} ${selectedAnswer === index ? (index === quiz.answer ? styles.correct : styles.wrong) : ''} ${selectedAnswer !== null && index === quiz.answer ? styles.correct : ''}`}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedAnswer !== null && (
          <button className={styles.nextBtn} onClick={nextQuestion}>
            {currentIndex < QUIZZES.length - 1
              ? (language === "id" ? "Berikutnya ▶️" : "Next ▶️")
              : (language === "id" ? "Lihat Hasil 📊" : "See Results 📊")}
          </button>
        )}
      </div>
    </div>
  );
}