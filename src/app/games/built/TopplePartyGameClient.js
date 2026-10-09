"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const TARGET_ITEMS = 10;
const MAX_TILT = 22; // max tilt degrees before toppling

export default function TopplePartyGameClient() {
  const { t } = useLanguage();

  const [placedItems, setPlacedItems] = useState([]); // [{ x, weight, emoji }, ...]
  const [currentEmoji, setCurrentEmoji] = useState("📦");
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
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

  const getRandomEmoji = () => {
    const list = ["📦", "🧱", "🍎", "🍉", "⚽️", "🧸", "🐸", "🐱", "🚗", "💎"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const startNewGame = useCallback(() => {
    setPlacedItems([]);
    setScore(0);
    setCurrentEmoji(getRandomEmoji());
    setIsGameOver(false);
    setIsWon(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Torque calculation: sum of (x * weight)
  // where x is -100 to +100 from center
  const totalTorque = placedItems.reduce((acc, item) => acc + item.x * item.weight, 0);
  const totalWeight = placedItems.reduce((acc, item) => acc + item.weight, 0) || 1;
  const rawTilt = totalTorque / Math.max(12, totalWeight);
  const tiltAngle = Math.max(-30, Math.min(30, rawTilt * 1.8));

  const handlePlace = (e) => {
    if (isGameOver || isWon) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Convert to relative beam position: -100 (left end) to +100 (right end)
    const relX = ((clickX - width / 2) / (width / 2)) * 100;
    const clampedX = Math.max(-95, Math.min(95, relX));
    const weight = Math.floor(Math.random() * 3) + 2; // 2 to 4 weight units

    const newItem = {
      id: Math.random(),
      x: clampedX,
      weight,
      emoji: currentEmoji,
    };

    const nextItems = [...placedItems, newItem];
    setPlacedItems(nextItems);

    const nextScore = score + 1;
    setScore(nextScore);
    setCurrentEmoji(getRandomEmoji());

    if (soundEnabled && stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0;
      stepAudioRef.current.play().catch(() => {});
    }

    // Check if toppled
    const nextTorque = nextItems.reduce((acc, item) => acc + item.x * item.weight, 0);
    const nextTotalW = nextItems.reduce((acc, item) => acc + item.weight, 0) || 1;
    const nextTilt = (nextTorque / Math.max(12, nextTotalW)) * 1.8;

    if (Math.abs(nextTilt) >= MAX_TILT) {
      setIsGameOver(true);
      if (soundEnabled && wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => {});
      }
    } else if (nextScore >= TARGET_ITEMS) {
      setIsWon(true);
      if (soundEnabled && winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      }
    }
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
          maxWidth: "520px",
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
            🎪 {t("Topple Party", "Topple Party")}
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

        {/* Status Tracker */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAF6F0",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "2px solid #231F20",
            fontWeight: "800",
            fontSize: "14px",
          }}
        >
          <span>
            {t("Benda Tertata:", "Items Placed:")} {score} / {TARGET_ITEMS}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{t("Berikutnya:", "Next:")}</span>
            <span style={{ fontSize: "20px" }}>{currentEmoji}</span>
          </span>
        </div>

        {/* Seesaw Game Canvas (SVG) */}
        <div
          onClick={handlePlace}
          style={{
            position: "relative",
            height: "260px",
            backgroundColor: "#FFFDF7",
            border: "2px dashed #231F20",
            borderRadius: "12px",
            overflow: "hidden",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <svg viewBox="0 0 400 260" style={{ width: "100%", height: "100%" }}>
            {/* Center Fulcrum */}
            <polygon points="200,170 175,235 225,235" fill="#231F20" />
            <circle cx="200" cy="170" r="10" fill="#F59E0B" stroke="#231F20" strokeWidth="3" />

            {/* Tilting Beam */}
            <g
              transform={`rotate(${tiltAngle}, 200, 170)`}
              style={{ transition: "transform 0.15s ease-out" }}
            >
              <rect x="40" y="166" width="320" height="10" rx="5" fill="#3B82F6" stroke="#231F20" strokeWidth="2" />

              {/* Placed Items */}
              {placedItems.map((item) => {
                const itemCanvasX = 200 + (item.x / 100) * 150;
                return (
                  <text
                    key={item.id}
                    x={itemCanvasX}
                    y={156}
                    textAnchor="middle"
                    fontSize="24"
                  >
                    {item.emoji}
                  </text>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Tip Text */}
        <p style={{ textAlign: "center", margin: 0, fontSize: "13px", color: "#6E5D4F", fontWeight: "700" }}>
          {t("Ketuk papan jungkat-jungkit untuk meletakkan benda secara seimbang!", "Tap on the seesaw beam to place items without toppling!")}
        </p>

        {/* Modals */}
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
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>💥</div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", color: "#231F20" }}>
                {t("Yah, Tumbang!", "Oops, Toppled!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 20px" }}>
                {t("Papan terlalu miring dan benda-benda terjatuh.", "The beam tilted too far and toppled over.")}
              </p>

              <button
                type="button"
                onClick={startNewGame}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "999px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontWeight: "900",
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {t("Coba Lagi", "Try Again")}
              </button>
            </div>
          </div>
        )}

        {isWon && (
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
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>🎉</div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", color: "#231F20" }}>
                {t("Pesta Keseimbangan Berhasil!", "Perfect Balance!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 20px" }}>
                {t("Kamu berhasil meletakkan semua benda dengan sangat seimbang!", "You successfully balanced all items on the beam!")}
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
