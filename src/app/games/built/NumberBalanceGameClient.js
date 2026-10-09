"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, CheckCircle, Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const LEVELS = [
  {
    id: "EASY",
    label: { id: "Mudah", en: "Easy" },
    desc: { id: "Angka kecil, 4 pilihan", en: "Small numbers, 4 choices" },
    targetRange: [10, 20],
    choicesCount: 4,
    partsCount: 2,
    color: "#10b981",
  },
  {
    id: "MEDIUM",
    label: { id: "Sedang", en: "Medium" },
    desc: { id: "Angka sedang, 6 pilihan", en: "Medium numbers, 6 choices" },
    targetRange: [20, 50],
    choicesCount: 6,
    partsCount: 3,
    color: "#f59e0b",
  },
  {
    id: "HARD",
    label: { id: "Sulit", en: "Hard" },
    desc: { id: "Angka besar, 8 pilihan", en: "Large numbers, 8 choices" },
    targetRange: [50, 100],
    choicesCount: 8,
    partsCount: 4,
    color: "#ef4444",
  },
];

export default function NumberBalanceGameClient() {
  const { t, language } = useLanguage();
  const [screen, setScreen] = useState("MENU"); // 'MENU' | 'PLAYING'
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]);
  const [targetWeight, setTargetWeight] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: "" });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const bgAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const clickAudioRef = useRef(null);

  useEffect(() => {
    try {
      bgAudioRef.current = new Audio("/game-assets/sounds/bg.ogg");
      bgAudioRef.current.loop = true;
      bgAudioRef.current.volume = 0.2;

      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
      wrongAudioRef.current = new Audio("/game-assets/sounds/wrong.ogg");
      clickAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
    } catch {
      // Audio fallback
    }

    return () => {
      bgAudioRef.current?.pause();
      winAudioRef.current?.pause();
      wrongAudioRef.current?.pause();
      clickAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!soundEnabled) {
      bgAudioRef.current?.pause();
    } else if (screen === "PLAYING") {
      bgAudioRef.current?.play().catch(() => {});
    }
  }, [soundEnabled, screen]);

  const generateRound = useCallback((lvl) => {
    const [min, max] = lvl.targetRange;
    const target = Math.floor(Math.random() * (max - min + 1)) + min;

    // Generate valid combination parts that sum to target
    let remaining = target;
    const parts = [];
    for (let i = 0; i < lvl.partsCount - 1; i++) {
      const maxPart = Math.max(1, remaining - (lvl.partsCount - i - 1));
      const part = Math.floor(Math.random() * Math.min(maxPart, Math.floor(target * 0.6))) + 1;
      parts.push(part);
      remaining -= part;
    }
    parts.push(remaining);

    // Generate decoy numbers
    const decoys = [];
    while (parts.length + decoys.length < lvl.choicesCount) {
      const decoy = Math.floor(Math.random() * Math.floor(target * 0.7)) + 1;
      decoys.push(decoy);
    }

    const allChoices = [...parts, ...decoys].sort(() => Math.random() - 0.5);

    setTargetWeight(target);
    setChoices(allChoices.map((v, id) => ({ id, value: v })));
    setSelectedIndices([]);
    setFeedback({ show: false, correct: false, message: "" });
  }, []);

  const startGame = (lvl) => {
    setCurrentLevel(lvl);
    setScreen("PLAYING");
    setStats({ correct: 0, total: 0 });
    generateRound(lvl);
  };

  const toggleChoice = (idx) => {
    if (feedback.show) return;
    if (soundEnabled && clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const currentWeight = selectedIndices.reduce(
    (sum, idx) => sum + (choices[idx]?.value || 0),
    0
  );

  const checkBalance = () => {
    if (selectedIndices.length === 0 || feedback.show) return;

    const isBalanced = currentWeight === targetWeight;
    setStats((prev) => ({
      correct: prev.correct + (isBalanced ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isBalanced) {
      if (soundEnabled && winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      }
      setFeedback({
        show: true,
        correct: true,
        message: t("Hebat! Timbangan seimbang!", "Awesome! The scale is balanced!"),
      });
      setTimeout(() => {
        generateRound(currentLevel);
      }, 1600);
    } else {
      if (soundEnabled && wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => {});
      }
      const msg =
        currentWeight < targetWeight
          ? t("Timbangan kurang berat di kanan!", "Too light on the right!")
          : t("Timbangan terlalu berat di kanan!", "Too heavy on the right!");
      setFeedback({ show: true, correct: false, message: msg });
      setTimeout(() => {
        setFeedback({ show: false, correct: false, message: "" });
      }, 1400);
    }
  };

  // Tilt angle calculation (-22 to +22 degrees)
  const diff = currentWeight - targetWeight;
  const tiltAngle = Math.max(-20, Math.min(20, diff * 1.5));

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
          maxWidth: "680px",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "2px solid #231F20",
          padding: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {screen === "MENU" ? (
            <Link
              href="/games"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "2px solid #231F20",
                backgroundColor: "#FFFFFF",
                fontWeight: "800",
                fontSize: "14px",
                color: "#231F20",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={18} />
              <span>{t("Kembali", "Back")}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setScreen("MENU")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "2px solid #231F20",
                backgroundColor: "#FFFFFF",
                fontWeight: "800",
                fontSize: "14px",
                color: "#231F20",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} />
              <span>{t("Menu", "Menu")}</span>
            </button>
          )}

          <h1
            style={{
              fontSize: "20px",
              fontWeight: "900",
              margin: 0,
              color: "#231F20",
              textAlign: "center",
            }}
          >
            ⚖️ {t("Timbangan Angka", "Number Balance")}
          </h1>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            style={{
              width: "40px",
              height: "40px",
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
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </header>

        {screen === "MENU" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
            <p style={{ textAlign: "center", color: "#6E5D4F", fontSize: "15px", margin: 0 }}>
              {t(
                "Pilih blok angka di sisi kanan agar timbangan seimbang dengan sisi kiri!",
                "Choose number blocks on the right so the scale balances with the left side!"
              )}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => startGame(lvl)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: "14px",
                    border: "2px solid #231F20",
                    backgroundColor: "#FAF6F0",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "transform 0.15s ease, background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F2EBE1")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FAF6F0")}
                >
                  <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "900", color: "#231F20" }}>
                      {lvl.label[language] || lvl.label.id}
                    </h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6E5D4F" }}>
                      {lvl.desc[language] || lvl.desc.id}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: lvl.color,
                      color: "#FFFFFF",
                      padding: "8px 16px",
                      borderRadius: "999px",
                      fontWeight: "900",
                      fontSize: "14px",
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{t("Main", "Play")}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Score & Level status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#FAF6F0",
                padding: "8px 14px",
                borderRadius: "10px",
                border: "2px solid #231F20",
                fontSize: "14px",
                fontWeight: "800",
              }}
            >
              <span>
                {t("Tingkat:", "Level:")}{" "}
                <b style={{ color: currentLevel.color }}>
                  {currentLevel.label[language] || currentLevel.label.id}
                </b>
              </span>
              <span>
                {t("Skor:", "Score:")} {stats.correct} / {stats.total}
              </span>
            </div>

            {/* Scale Viewport (SVG) */}
            <div
              style={{
                position: "relative",
                height: "240px",
                backgroundColor: "#FFFDF7",
                border: "2px dashed #231F20",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
                {/* Stand & Pivot */}
                <polygon points="200,140 180,220 220,220" fill="#231F20" />
                <circle cx="200" cy="140" r="10" fill="#F59E0B" stroke="#231F20" strokeWidth="3" />

                {/* Rotating Beam */}
                <g transform={`rotate(${tiltAngle}, 200, 140)`}>
                  <rect x="50" y="136" width="300" height="8" rx="4" fill="#231F20" />

                  {/* Left Pan Attachment */}
                  <line x1="80" y1="140" x2="60" y2="185" stroke="#231F20" strokeWidth="2" />
                  <line x1="80" y1="140" x2="100" y2="185" stroke="#231F20" strokeWidth="2" />
                  <ellipse cx="80" cy="185" rx="30" ry="8" fill="#FFD5A5" stroke="#231F20" strokeWidth="2" />
                  {/* Left Pan Box / Target */}
                  <rect x="62" y="155" width="36" height="30" rx="6" fill="#F59E0B" stroke="#231F20" strokeWidth="2" />
                  <text
                    x="80"
                    y="176"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="18"
                    fontWeight="900"
                  >
                    {targetWeight}
                  </text>

                  {/* Right Pan Attachment */}
                  <line x1="320" y1="140" x2="300" y2="185" stroke="#231F20" strokeWidth="2" />
                  <line x1="320" y1="140" x2="340" y2="185" stroke="#231F20" strokeWidth="2" />
                  <ellipse cx="320" cy="185" rx="30" ry="8" fill="#FFD5A5" stroke="#231F20" strokeWidth="2" />
                  {/* Right Pan Box / Selected sum */}
                  <rect x="302" y="155" width="36" height="30" rx="6" fill="#3B82F6" stroke="#231F20" strokeWidth="2" />
                  <text
                    x="320"
                    y="176"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="18"
                    fontWeight="900"
                  >
                    {currentWeight}
                  </text>
                </g>
              </svg>

              {/* Feedback Overlay */}
              {feedback.show && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: feedback.correct ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    padding: "16px",
                    textAlign: "center",
                    animation: "popIn 0.2s ease-out",
                  }}
                >
                  <span style={{ fontSize: "40px" }}>{feedback.correct ? "🎉" : "🤔"}</span>
                  <p style={{ fontSize: "18px", fontWeight: "900", margin: "8px 0 0" }}>{feedback.message}</p>
                </div>
              )}
            </div>

            {/* Instruction Banner */}
            <div
              style={{
                backgroundColor: "#FAF6F0",
                padding: "8px 12px",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "800",
                color: "#231F20",
              }}
            >
              {t("Pilih blok angka untuk mengisi sisi kanan:", "Select number blocks to fill the right side:")}
            </div>

            {/* Choices Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${choices.length <= 4 ? 4 : choices.length <= 6 ? 6 : 4}, 1fr)`,
                gap: "8px",
              }}
            >
              {choices.map((c, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleChoice(idx)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "10px",
                      border: "2px solid #231F20",
                      backgroundColor: isSelected ? "#3B82F6" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "#231F20",
                      fontSize: "20px",
                      fontWeight: "900",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.1s ease, background 0.1s ease",
                      transform: isSelected ? "scale(0.95)" : "scale(1)",
                      boxShadow: isSelected ? "none" : "0 3px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    {c.value}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setSelectedIndices([])}
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "10px",
                  border: "2px solid #231F20",
                  backgroundColor: "#FFFFFF",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "#231F20",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <RotateCcw size={16} />
                <span>{t("Reset", "Reset")}</span>
              </button>

              <button
                type="button"
                onClick={checkBalance}
                disabled={selectedIndices.length === 0}
                style={{
                  flex: 2,
                  height: "46px",
                  borderRadius: "10px",
                  border: "2px solid #231F20",
                  backgroundColor: selectedIndices.length > 0 ? "#10B981" : "#E2D7CB",
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: "15px",
                  cursor: selectedIndices.length > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: selectedIndices.length > 0 ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "none",
                }}
              >
                <CheckCircle size={18} />
                <span>{t("Cek Timbangan", "Check Balance")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
