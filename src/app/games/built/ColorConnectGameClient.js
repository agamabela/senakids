"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const LEVELS = [
  {
    id: 1,
    size: 5,
    name: "5x5 Level 1",
    pairs: [
      { id: "red", color: "#EF4444", p1: { r: 0, c: 0 }, p2: { r: 4, c: 0 } },
      { id: "blue", color: "#3B82F6", p1: { r: 0, c: 1 }, p2: { r: 2, c: 3 } },
      { id: "green", color: "#10B981", p1: { r: 1, c: 1 }, p2: { r: 3, c: 3 } },
      { id: "yellow", color: "#F59E0B", p1: { r: 1, c: 4 }, p2: { r: 4, c: 4 } },
    ],
  },
  {
    id: 2,
    size: 5,
    name: "5x5 Level 2",
    pairs: [
      { id: "red", color: "#EF4444", p1: { r: 0, c: 0 }, p2: { r: 0, c: 4 } },
      { id: "blue", color: "#3B82F6", p1: { r: 1, c: 1 }, p2: { r: 4, c: 1 } },
      { id: "green", color: "#10B981", p1: { r: 2, c: 2 }, p2: { r: 4, c: 4 } },
      { id: "orange", color: "#F97316", p1: { r: 1, c: 3 }, p2: { r: 3, c: 3 } },
      { id: "purple", color: "#8B5CF6", p1: { r: 3, c: 0 }, p2: { r: 4, c: 2 } },
    ],
  },
  {
    id: 3,
    size: 6,
    name: "6x6 Level 3",
    pairs: [
      { id: "red", color: "#EF4444", p1: { r: 0, c: 0 }, p2: { r: 5, c: 0 } },
      { id: "blue", color: "#3B82F6", p1: { r: 0, c: 2 }, p2: { r: 3, c: 4 } },
      { id: "green", color: "#10B981", p1: { r: 1, c: 1 }, p2: { r: 4, c: 3 } },
      { id: "yellow", color: "#F59E0B", p1: { r: 0, c: 5 }, p2: { r: 5, c: 5 } },
      { id: "purple", color: "#8B5CF6", p1: { r: 2, c: 2 }, p2: { r: 4, c: 5 } },
    ],
  },
];

export default function ColorConnectGameClient() {
  const { t } = useLanguage();

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
  const size = currentLevel.size;

  const [paths, setPaths] = useState({}); // { [pairId]: [{r, c}, ...] }
  const [activePairId, setActivePairId] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stepAudioRef = useRef(null);
  const winAudioRef = useRef(null);

  useEffect(() => {
    try {
      stepAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
    } catch {}
  }, []);

  const resetLevel = useCallback((idx) => {
    setLevelIdx(idx);
    setPaths({});
    setActivePairId(null);
    setIsWon(false);
  }, []);

  const getCellDot = (r, c) => {
    for (const pair of currentLevel.pairs) {
      if (
        (pair.p1.r === r && pair.p1.c === c) ||
        (pair.p2.r === r && pair.p2.c === c)
      ) {
        return pair;
      }
    }
    return null;
  };

  const getCellPathOwner = (r, c) => {
    for (const [pairId, cellList] of Object.entries(paths)) {
      if (cellList.some((cell) => cell.r === r && cell.c === c)) {
        return currentLevel.pairs.find((p) => p.id === pairId);
      }
    }
    return null;
  };

  const checkVictory = (currentPaths) => {
    // Check if every pair has connected p1 to p2
    const allConnected = currentLevel.pairs.every((pair) => {
      const p = currentPaths[pair.id];
      if (!p || p.length < 2) return false;
      const start = p[0];
      const end = p[p.length - 1];
      const match1 =
        start.r === pair.p1.r && start.c === pair.p1.c && end.r === pair.p2.r && end.c === pair.p2.c;
      const match2 =
        start.r === pair.p2.r && start.c === pair.p2.c && end.r === pair.p1.r && end.c === pair.p1.c;
      return match1 || match2;
    });

    if (allConnected) {
      setIsWon(true);
      if (soundEnabled && winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      }
    }
  };

  const handleCellClick = (r, c) => {
    if (isWon) return;

    const dot = getCellDot(r, c);

    if (!activePairId) {
      if (dot) {
        setActivePairId(dot.id);
        setPaths((prev) => ({
          ...prev,
          [dot.id]: [{ r, c }],
        }));
        if (soundEnabled && stepAudioRef.current) {
          stepAudioRef.current.currentTime = 0;
          stepAudioRef.current.play().catch(() => {});
        }
      }
      return;
    }

    // Currently drawing a path for activePairId
    const currentPath = paths[activePairId] || [];
    const last = currentPath[currentPath.length - 1];
    if (!last) return;

    // Check adjacency (cardinal neighbors only)
    const isAdjacent = Math.abs(last.r - r) + Math.abs(last.c - c) === 1;
    if (!isAdjacent) {
      // Tap existing dot to switch active pair
      if (dot && dot.id !== activePairId) {
        setActivePairId(dot.id);
        setPaths((prev) => ({ ...prev, [dot.id]: [{ r, c }] }));
      }
      return;
    }

    // Check if hitting another pair's dot
    if (dot && dot.id !== activePairId) return;

    // Check if cell is occupied by another pair's path
    for (const [pId, list] of Object.entries(paths)) {
      if (pId !== activePairId && list.some((cell) => cell.r === r && cell.c === c)) {
        return; // blocked by another path
      }
    }

    const nextPath = [...currentPath, { r, c }];
    const nextPaths = { ...paths, [activePairId]: nextPath };
    setPaths(nextPaths);

    if (soundEnabled && stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0;
      stepAudioRef.current.play().catch(() => {});
    }

    // If reached the target dot
    const targetPair = currentLevel.pairs.find((p) => p.id === activePairId);
    if (dot && dot.id === activePairId && nextPath.length > 1) {
      setActivePairId(null);
      checkVictory(nextPaths);
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
            🎨 {t("Sambung Warna", "Color Connect")}
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
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => resetLevel(idx)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "2px solid #231F20",
                backgroundColor: levelIdx === idx ? "#3B82F6" : "#FAF6F0",
                color: levelIdx === idx ? "#FFFFFF" : "#231F20",
                fontWeight: "800",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Level {idx + 1}
            </button>
          ))}
        </div>

        {/* Grid Viewport */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gap: "4px",
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "12px",
            padding: "8px",
            aspectRatio: "1",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const dot = getCellDot(r, c);
              const pathOwner = getCellPathOwner(r, c);
              const isCellActive = activePairId && paths[activePairId]?.some((p) => p.r === r && p.c === c);

              let bg = "#FFFFFF";
              if (pathOwner) {
                bg = pathOwner.color + "44"; // transparent path tint
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    backgroundColor: bg,
                    border: isCellActive ? `2px solid ${pathOwner?.color || "#231F20"}` : "1px solid #E2D7CB",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {dot && (
                    <div
                      style={{
                        width: "60%",
                        height: "60%",
                        borderRadius: "50%",
                        backgroundColor: dot.color,
                        border: "2px solid #231F20",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
                  {pathOwner && !dot && (
                    <div
                      style={{
                        width: "30%",
                        height: "30%",
                        borderRadius: "50%",
                        backgroundColor: pathOwner.color,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#6E5D4F", fontWeight: "700" }}>
            {t("Hubungkan lingkaran warna yang sama!", "Connect the dots of the same color!")}
          </p>

          <button
            type="button"
            onClick={() => resetLevel(levelIdx)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "2px solid #231F20",
              backgroundColor: "#FAF6F0",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            <span>{t("Reset", "Reset")}</span>
          </button>
        </div>

        {/* Victory Modal */}
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
                {t("Semua Warna Terhubung!", "All Colors Connected!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 20px" }}>
                {t("Luar biasa! Jalur warna berhasil tersambung dengan rapi.", "Awesome! You completed all the colored paths.")}
              </p>

              <button
                type="button"
                onClick={() => resetLevel((levelIdx + 1) % LEVELS.length)}
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
                {t("Level Berikutnya", "Next Level")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
