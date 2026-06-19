"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./BerhitungGameClient.module.css";

const LEVELS = [
  { min: 1, max: 10, ops: ["+"], name: { id: "Mudah", en: "Easy" } },
  { min: 1, max: 20, ops: ["+", "-"], name: { id: "Menengah", en: "Medium" } },
  { min: 1, max: 50, ops: ["+", "-", "*"], name: { id: "Sulit", en: "Hard" } },
];

const generateProblem = (levelConfig) => {
  const op = levelConfig.ops[Math.floor(Math.random() * levelConfig.ops.length)];
  let a, b, answer;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * levelConfig.max) + levelConfig.min;
      b = Math.floor(Math.random() * levelConfig.max) + levelConfig.min;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * levelConfig.max * 2) + levelConfig.min;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "*":
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
  }

  const displayOp = op === "*" ? "×" : op;
  return { a, b, op: displayOp, answer, userAnswer: null, correct: null };
};

export default function BerhitungGameClient() {
  const { language } = useLanguage();
  const [level, setLevel] = useState(0);
  const [problem, setProblem] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [options, setOptions] = useState([]);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const currentLevel = LEVELS[level];

  const generateOptions = (correct) => {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const val = correct + offset;
      if (val >= 0 && val !== correct) {
        opts.add(val);
      }
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  };

  const newProblem = useCallback(() => {
    const newProblem = generateProblem(currentLevel);
    setProblem({ ...newProblem, userAnswer: null, correct: null });
    setOptions(generateOptions(newProblem.answer));
  }, [currentLevel]);

  useEffect(() => {
    newProblem();
  }, [level, newProblem]);

  const handleAnswer = (answer) => {
    setHasChanges(true);
    const isCorrect = answer === problem.answer;
    
    setProblem(prev => ({ ...prev, userAnswer: answer, correct: isCorrect }));
    
    if (isCorrect) {
      setScore(score + 10 + (streak * 2));
      setStreak(streak + 1);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        newProblem();
      }, 1000);
    } else {
      setStreak(0);
    }
  };

  const nextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(level + 1);
      setScore(0);
      setStreak(0);
    }
  };

  const reset = () => {
    setScore(0);
    setStreak(0);
    newProblem();
  };

  if (!problem) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🔢 Berhitung</h1>
          <p>{language === "id" ? "Selesaikan soal matematika!" : "Solve math problems!"}</p>
        </div>
        <div className={styles.levelBadge}>
          {currentLevel.name[language]}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{language === "id" ? "Skor" : "Score"}</span>
          <span className={styles.statValue}>{score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{language === "id" ? "Beruntun" : "Streak"}</span>
          <span className={styles.statValue}>🔥 {streak}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{language === "id" ? "Level" : "Level"}</span>
          <span className={styles.statValue}>{level + 1}</span>
        </div>
      </div>

      <div className={styles.problemCard}>
        <div className={styles.problem}>
          <span className={styles.number}>{problem.a}</span>
          <span className={styles.operator}>{problem.op}</span>
          <span className={styles.number}>{problem.b}</span>
          <span className={styles.operator}>=</span>
          <span className={styles.question}>?</span>
        </div>
      </div>

      <div className={styles.options}>
        {options.map((option, i) => (
          <button
            key={i}
            className={`${styles.option} ${problem.userAnswer === option && problem.correct === false ? styles.wrong : ""} ${problem.userAnswer === option && problem.correct === true ? styles.correct : ""}`}
            onClick={() => handleAnswer(option)}
            disabled={problem.userAnswer !== null}
          >
            {option}
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.btn} onClick={reset}>
          🔄 {language === "id" ? "Reset" : "Reset"}
        </button>
        <button className={styles.btn} onClick={newProblem} disabled={problem.userAnswer === null}>
          ➡️ {language === "id" ? "Lewati" : "Skip"}
        </button>
        {level < LEVELS.length - 1 && (
          <button className={styles.btn} onClick={nextLevel}>
            📈 {language === "id" ? "Level Atas" : "Level Up"}
          </button>
        )}
      </div>

      {showCelebration && (
        <div className={styles.celebration}>
          <div className={styles.celebrationContent}>
            <span className={styles.celebrationEmoji}>🎉</span>
            <span className={styles.celebrationText}>
              {language === "id" ? "Bagus!" : "Great!"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}