"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const ROUNDS_PER_GAME = 10;

const LEVELS = [
  { id: "lvl1", label: { id: "Level 1 (Bilangan ≤ 10)", en: "Level 1 (Numbers ≤ 10)" }, max: 10 },
  { id: "lvl2", label: { id: "Level 2 (Bilangan ≤ 20)", en: "Level 2 (Numbers ≤ 20)" }, max: 20 },
  { id: "lvl3", label: { id: "Level 3 (Bilangan ≤ 50)", en: "Level 3 (Numbers ≤ 50)" }, max: 50 },
  { id: "lvl4", label: { id: "Level 4 (Bilangan ≤ 100)", en: "Level 4 (Numbers ≤ 100)" }, max: 100 },
];

export default function MathSubtractionGameClient() {
  const { t, language } = useLanguage();

  const [level, setLevel] = useState(LEVELS[0]);
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(3);
  const [options, setOptions] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, correct: false, selected: null });
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stepAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    try {
      stepAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
      wrongAudioRef.current = new Audio("/game-assets/sounds/wrong.ogg");
    } catch {}
  }, []);

  const generateQuestion = useCallback((lvl) => {
    const a = Math.floor(Math.random() * (lvl.max - 2)) + 2; // at least 2
    const b = Math.floor(Math.random() * a) + 1; // b <= a, so a - b >= 0
    const diff = a - b;

    setNumA(a);
    setNumB(b);

    const decoys = new Set();
    while (decoys.size < 3) {
      const offset = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 4) + 1);
      const val = diff + offset;
      if (val >= 0 && val !== diff) {
        decoys.add(val);
      }
    }

    const allOpts = [diff, ...Array.from(decoys)].sort(() => Math.random() - 0.5);
    setOptions(allOpts);
    setFeedback({ show: false, correct: false, selected: null });
  }, []);

  const startNewGame = useCallback((lvl = level) => {
    setLevel(lvl);
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    generateQuestion(lvl);
  }, [level, generateQuestion]);

  useEffect(() => {
    startNewGame(LEVELS[0]);
  }, [startNewGame]);

  const handleSelectOption = (opt) => {
    if (feedback.show || isGameOver) return;

    const correctDiff = numA - numB;
    const isCorrect = opt === correctDiff;

    if (isCorrect) {
      setScore((s) => s + 1);
      if (soundEnabled && winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      }
    } else {
      if (soundEnabled && wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => {});
      }
    }

    setFeedback({ show: true, correct: isCorrect, selected: opt });

    setTimeout(() => {
      if (round >= ROUNDS_PER_GAME) {
        setIsGameOver(true);
      } else {
        setRound((r) => r + 1);
        generateQuestion(level);
      }
    }, 1200);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF6F0",
        padding: "16px",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
        color: "#231F20",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "2px solid #231F20",
          padding: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link
            href="/games"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "38px",
              padding: "0 14px",
              borderRadius: "10px",
              border: "2px solid #231F20",
              backgroundColor: "#FFFFFF",
              fontWeight: "800",
              fontSize: "13px",
              color: "#231F20",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} />
            <span>{t("Menu", "Menu")}</span>
          </Link>

          <h1 style={{ fontSize: "18px", fontWeight: "900", margin: 0, color: "#231F20" }}>
            ➖ {t("Latihan Pengurangan", "Subtraction Practice")}
          </h1>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "2px solid #231F20",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </header>

        {/* Level Selector */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => startNewGame(lvl)}
              style={{
                flex: "1 0 auto",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "2px solid #231F20",
                backgroundColor: level.id === lvl.id ? "#EF4444" : "#FAF6F0",
                color: level.id === lvl.id ? "#FFFFFF" : "#231F20",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {lvl.label[language] || lvl.label.id}
            </button>
          ))}
        </div>

        {/* Status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            fontWeight: "800",
            color: "#6E5D4F",
          }}
        >
          <span>
            {t("Soal:", "Question:")} {round} / {ROUNDS_PER_GAME}
          </span>
          <span>
            {t("Skor:", "Score:")} {score}
          </span>
        </div>

        {/* Problem Card */}
        <div
          style={{
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "14px",
            padding: "24px 16px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "44px",
              fontWeight: "900",
              color: "#231F20",
            }}
          >
            <span>{numA}</span>
            <span style={{ color: "#EF4444" }}>−</span>
            <span>{numB}</span>
            <span>=</span>
            <span
              style={{
                display: "inline-block",
                minWidth: "60px",
                borderBottom: "4px solid #231F20",
                color: feedback.show ? (feedback.correct ? "#10B981" : "#EF4444") : "#F59E0B",
              }}
            >
              {feedback.show ? feedback.selected : "?"}
            </span>
          </div>

          {/* Visual Apples / Objects */}
          {numA <= 10 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", maxWidth: "240px", marginTop: "4px" }}>
              {Array.from({ length: numA }).map((_, i) => {
                const isCrossedOut = i >= numA - numB;
                return (
                  <span
                    key={i}
                    style={{
                      fontSize: "20px",
                      opacity: isCrossedOut ? 0.35 : 1,
                      textDecoration: isCrossedOut ? "line-through" : "none",
                    }}
                  >
                    🍎
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Multiple Choice Options */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {options.map((opt) => {
            const isSelected = feedback.selected === opt;
            const isCorrect = opt === numA - numB;

            let bg = "#FFFFFF";
            let color = "#231F20";
            if (feedback.show) {
              if (isCorrect) {
                bg = "#10B981";
                color = "#FFFFFF";
              } else if (isSelected) {
                bg = "#EF4444";
                color = "#FFFFFF";
              }
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={feedback.show}
                style={{
                  height: "56px",
                  borderRadius: "12px",
                  border: "2px solid #231F20",
                  backgroundColor: bg,
                  color,
                  fontSize: "24px",
                  fontWeight: "900",
                  cursor: feedback.show ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.06)",
                  transition: "transform 0.1s ease, background 0.15s ease",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Game Over Modal */}
        {isGameOver && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "16px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "340px",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "2px solid #231F20",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>🏆</div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", color: "#231F20" }}>
                {t("Latihan Selesai!", "Practice Finished!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 16px" }}>
                {t("Kamu menjawab benar:", "You answered correctly:")} <b>{score} / {ROUNDS_PER_GAME}</b>
              </p>

              <button
                type="button"
                onClick={() => startNewGame(level)}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "999px",
                  backgroundColor: "#10B981",
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("Main Lagi", "Play Again")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
