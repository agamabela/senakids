"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const ROUNDS_PER_GAME = 10;

const ICONS = ["🍎", "⭐️", "🐟", "🌸", "🚗", "🎈", "🐸"];

export default function MathComparisonGameClient() {
  const { t } = useLanguage();

  const [level, setLevel] = useState("easy"); // 'easy' | 'medium' | 'hard'
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [currentIcon, setCurrentIcon] = useState("🍎");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, correct: false, chosen: "" });
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
    const max = lvl === "easy" ? 10 : lvl === "medium" ? 30 : 100;
    const min = lvl === "easy" ? 1 : 10;

    let a = Math.floor(Math.random() * (max - min + 1)) + min;
    let b = Math.floor(Math.random() * (max - min + 1)) + min;

    // 25% chance of being equal
    if (Math.random() < 0.25) {
      b = a;
    }

    setNumA(a);
    setNumB(b);
    setCurrentIcon(ICONS[Math.floor(Math.random() * ICONS.length)]);
    setFeedback({ show: false, correct: false, chosen: "" });
  }, []);

  const startNewGame = useCallback((lvl = level) => {
    setLevel(lvl);
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    generateQuestion(lvl);
  }, [level, generateQuestion]);

  useEffect(() => {
    startNewGame("easy");
  }, [startNewGame]);

  const handleAnswer = (chosen) => {
    if (feedback.show || isGameOver) return;

    let correctSymbol = "=";
    if (numA < numB) correctSymbol = "<";
    else if (numA > numB) correctSymbol = ">";

    const isCorrect = chosen === correctSymbol;

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

    setFeedback({ show: true, correct: isCorrect, chosen });

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
            ⚖️ {t("Membandingkan", "Number Comparison")}
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

        {/* Level Switcher */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
          {[
            { id: "easy", name: t("Mudah (1-10)", "Easy (1-10)") },
            { id: "medium", name: t("Sedang (10-30)", "Medium (10-30)") },
            { id: "hard", name: t("Sulit (10-100)", "Hard (10-100)") },
          ].map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => startNewGame(lvl.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "2px solid #231F20",
                backgroundColor: level === lvl.id ? "#3B82F6" : "#FAF6F0",
                color: level === lvl.id ? "#FFFFFF" : "#231F20",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {lvl.name}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
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

        {/* Comparison Arena */}
        <div
          style={{
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "14px",
            padding: "20px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            gap: "10px",
          }}
        >
          {/* Card A */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              border: "2px solid #231F20",
              borderRadius: "12px",
              padding: "16px 8px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#231F20" }}>{numA}</span>
            {numA <= 10 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px", maxWidth: "90px" }}>
                {Array.from({ length: numA }).map((_, i) => (
                  <span key={i} style={{ fontSize: "14px" }}>{currentIcon}</span>
                ))}
              </div>
            )}
          </div>

          {/* Target Symbol Box */}
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "12px",
              backgroundColor: feedback.show
                ? feedback.correct
                  ? "#10B981"
                  : "#EF4444"
                : "#FFFFFF",
              border: "2px solid #231F20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "900",
              color: feedback.show ? "#FFFFFF" : "#6E5D4F",
            }}
          >
            {feedback.show ? feedback.chosen : "?"}
          </div>

          {/* Card B */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              border: "2px solid #231F20",
              borderRadius: "12px",
              padding: "16px 8px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "36px", fontWeight: "900", color: "#231F20" }}>{numB}</span>
            {numB <= 10 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px", maxWidth: "90px" }}>
                {Array.from({ length: numB }).map((_, i) => (
                  <span key={i} style={{ fontSize: "14px" }}>{currentIcon}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Option Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { symbol: "<", label: t("Lebih Kecil (<)", "Less Than (<)") },
            { symbol: "=", label: t("Sama Dengan (=)", "Equal To (=)") },
            { symbol: ">", label: t("Lebih Besar (>)", "Greater Than (>)") },
          ].map((opt) => (
            <button
              key={opt.symbol}
              type="button"
              onClick={() => handleAnswer(opt.symbol)}
              disabled={feedback.show}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                height: "64px",
                borderRadius: "12px",
                border: "2px solid #231F20",
                backgroundColor: "#FFFFFF",
                fontSize: "24px",
                fontWeight: "900",
                color: "#231F20",
                cursor: feedback.show ? "default" : "pointer",
                boxShadow: "0 3px 6px rgba(0,0,0,0.06)",
                transition: "transform 0.1s ease, background 0.1s ease",
              }}
            >
              <span>{opt.symbol}</span>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#6E5D4F" }}>{opt.label}</span>
            </button>
          ))}
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
