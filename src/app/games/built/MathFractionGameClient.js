"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const ROUNDS_PER_GAME = 10;

const FRACTION_CONFIGS = [
  { total: 2, numerators: [1] },
  { total: 3, numerators: [1, 2] },
  { total: 4, numerators: [1, 2, 3] },
  { total: 6, numerators: [1, 2, 3, 5] },
  { total: 8, numerators: [1, 3, 5, 7] },
];

export default function MathFractionGameClient() {
  const { t } = useLanguage();

  const [totalSlices, setTotalSlices] = useState(4);
  const [shadedSlices, setShadedSlices] = useState(2);
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

  const generateQuestion = useCallback(() => {
    const config = FRACTION_CONFIGS[Math.floor(Math.random() * FRACTION_CONFIGS.length)];
    const total = config.total;
    const num = config.numerators[Math.floor(Math.random() * config.numerators.length)];

    setTotalSlices(total);
    setShadedSlices(num);

    const correctChoice = `${num}/${total}`;
    const decoys = new Set();
    while (decoys.size < 3) {
      const randConfig = FRACTION_CONFIGS[Math.floor(Math.random() * FRACTION_CONFIGS.length)];
      const randNum = Math.floor(Math.random() * (randConfig.total - 1)) + 1;
      const str = `${randNum}/${randConfig.total}`;
      if (str !== correctChoice) {
        decoys.add(str);
      }
    }

    const allOptions = [correctChoice, ...Array.from(decoys)].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setFeedback({ show: false, correct: false, selected: null });
  }, []);

  const startNewGame = useCallback(() => {
    setRound(1);
    setScore(0);
    setIsGameOver(false);
    generateQuestion();
  }, [generateQuestion]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleSelectOption = (opt) => {
    if (feedback.show || isGameOver) return;

    const isCorrect = opt === `${shadedSlices}/${totalSlices}`;

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
        generateQuestion();
      }
    }, 1300);
  };

  // Helper to render SVG pie slice paths
  const renderSlices = () => {
    const cx = 100;
    const cy = 100;
    const r = 80;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    return Array.from({ length: totalSlices }).map((_, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const isShaded = i < shadedSlices;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

      return (
        <path
          key={i}
          d={pathData}
          fill={isShaded ? "#3B82F6" : "#FFFFFF"}
          stroke="#231F20"
          strokeWidth="3"
        />
      );
    });
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
            🥧 {t("Pecahan Lingkaran", "Fraction Circle")}
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

        {/* Progress Tracker */}
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

        {/* Visual Fraction Pie Container */}
        <div
          style={{
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "14px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <svg viewBox="0 0 200 200" style={{ width: "170px", height: "170px" }}>
            {renderSlices()}
          </svg>

          <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#6E5D4F" }}>
            {t(
              `Berapa pecahan dari bagian yang berwarna biru?`,
              `What fraction of the circle is colored blue?`
            )}
          </p>
        </div>

        {/* Options Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {options.map((opt) => {
            const isSelected = feedback.selected === opt;
            const isCorrect = opt === `${shadedSlices}/${totalSlices}`;

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
                  fontSize: "22px",
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
                onClick={startNewGame}
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
