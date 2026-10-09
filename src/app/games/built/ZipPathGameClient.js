"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const LEVELS = [
  {
    id: 1,
    size: 4,
    start: { r: 0, c: 0 },
    end: { r: 3, c: 3 },
    obstacles: [{ r: 1, c: 1 }, { r: 2, c: 2 }],
  },
  {
    id: 2,
    size: 5,
    start: { r: 0, c: 0 },
    end: { r: 4, c: 4 },
    obstacles: [{ r: 1, c: 2 }, { r: 2, c: 1 }, { r: 3, c: 3 }],
  },
  {
    id: 3,
    size: 5,
    start: { r: 0, c: 4 },
    end: { r: 4, c: 0 },
    obstacles: [{ r: 1, c: 1 }, { r: 2, c: 3 }, { r: 3, c: 2 }],
  },
];

export default function ZipPathGameClient() {
  const { t } = useLanguage();

  const [levelIdx, setLevelIdx] = useState(0);
  const currentLevel = LEVELS[levelIdx] || LEVELS[0];
  const size = currentLevel.size;

  const [path, setPath] = useState([currentLevel.start]);
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
    const lvl = LEVELS[idx] || LEVELS[0];
    setLevelIdx(idx);
    setPath([lvl.start]);
    setIsWon(false);
  }, []);

  const isObstacle = (r, c) => {
    return currentLevel.obstacles.some((o) => o.r === r && o.c === c);
  };

  const isVisited = (r, c) => {
    return path.some((p) => p.r === r && p.c === c);
  };

  const handleCellClick = (r, c) => {
    if (isWon) return;
    if (isObstacle(r, c)) return;

    const last = path[path.length - 1];

    // If clicking current last position, do nothing
    if (last.r === r && last.c === c) return;

    // If clicking previous position, undo
    if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
      setPath((prev) => prev.slice(0, prev.length - 1));
      if (soundEnabled && stepAudioRef.current) {
        stepAudioRef.current.currentTime = 0;
        stepAudioRef.current.play().catch(() => {});
      }
      return;
    }

    // Must be adjacent and not visited yet
    const isAdjacent = Math.abs(last.r - r) + Math.abs(last.c - c) === 1;
    if (!isAdjacent || isVisited(r, c)) return;

    const nextPath = [...path, { r, c }];
    setPath(nextPath);

    if (soundEnabled && stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0;
      stepAudioRef.current.play().catch(() => {});
    }

    // Check if reached destination
    if (r === currentLevel.end.r && c === currentLevel.end.c) {
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
          maxWidth: "460px",
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
            ⚡ {t("Zip Path", "Zip Path")}
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
              Tantangan {idx + 1}
            </button>
          ))}
        </div>

        {/* Grid Board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gap: "6px",
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
              const isStart = currentLevel.start.r === r && currentLevel.start.c === c;
              const isEnd = currentLevel.end.r === r && currentLevel.end.c === c;
              const obstacle = isObstacle(r, c);
              const visited = isVisited(r, c);
              const isCurrent = path[path.length - 1].r === r && path[path.length - 1].c === c;

              let bg = "#FFFFFF";
              if (obstacle) bg = "#6E5D4F";
              else if (visited) bg = "#3B82F6";
              else if (isStart) bg = "#10B981";
              else if (isEnd) bg = "#F59E0B";

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={obstacle}
                  style={{
                    backgroundColor: bg,
                    border: isCurrent ? "3px solid #F59E0B" : "2px solid #231F20",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                    cursor: obstacle ? "not-allowed" : "pointer",
                    boxShadow: visited ? "0 2px 6px rgba(59, 130, 246, 0.3)" : "none",
                  }}
                >
                  {isStart && !visited && "🟢"}
                  {isEnd && "🏁"}
                  {obstacle && "🧱"}
                  {visited && !isEnd && "⚡"}
                </button>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#6E5D4F", fontWeight: "700" }}>
            {t("Buat jalur dari titik awal menuju bendera finish!", "Create a path from the start point to the finish flag!")}
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
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>🏆</div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", color: "#231F20" }}>
                {t("Jalur Tersambung!", "Path Completed!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 20px" }}>
                {t("Kamu berhasil mencapai garis akhir dengan sukses!", "You reached the finish line successfully!")}
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
                {t("Lanjut Level Berikutnya", "Next Level")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
