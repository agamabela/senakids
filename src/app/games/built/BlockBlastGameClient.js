"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const BOARD_SIZE = 8;

const PIECE_SHAPES = [
  // 1x1
  { id: "dot", cells: [[0, 0]], color: "#f59e0b" },
  // 1x2, 2x1
  { id: "h2", cells: [[0, 0], [1, 0]], color: "#10b981" },
  { id: "v2", cells: [[0, 0], [0, 1]], color: "#10b981" },
  // 1x3, 3x1
  { id: "h3", cells: [[0, 0], [1, 0], [2, 0]], color: "#3b82f6" },
  { id: "v3", cells: [[0, 0], [0, 1], [0, 2]], color: "#3b82f6" },
  // 1x4, 4x1
  { id: "h4", cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "#8b5cf6" },
  { id: "v4", cells: [[0, 0], [0, 1], [0, 2], [0, 3]], color: "#8b5cf6" },
  // 2x2 square
  { id: "sq2", cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "#ec4899" },
  // 3x3 square
  { id: "sq3", cells: [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ], color: "#ef4444" },
  // Small L
  { id: "l1", cells: [[0, 0], [0, 1], [1, 1]], color: "#14b8a6" },
  { id: "l2", cells: [[1, 0], [1, 1], [0, 1]], color: "#14b8a6" },
  { id: "l3", cells: [[0, 0], [1, 0], [0, 1]], color: "#14b8a6" },
  { id: "l4", cells: [[0, 0], [1, 0], [1, 1]], color: "#14b8a6" },
  // Big L (3x3)
  { id: "bl1", cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], color: "#f97316" },
  { id: "bl2", cells: [[2, 0], [2, 1], [2, 2], [1, 2], [0, 2]], color: "#f97316" },
  // T
  { id: "t1", cells: [[0, 0], [1, 0], [2, 0], [1, 1]], color: "#6366f1" },
  { id: "t2", cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#6366f1" },
];

function canPlacePiece(board, piece, startR, startC) {
  for (const [dc, dr] of piece.cells) {
    const r = startR + dr;
    const c = startC + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] !== null) return false;
  }
  return true;
}

function hasAnyValidMove(board, pieces) {
  const active = pieces.filter((p) => !p.used);
  if (active.length === 0) return true;

  for (const piece of active) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlacePiece(board, piece, r, c)) return true;
      }
    }
  }
  return false;
}

export default function BlockBlastGameClient() {
  const { t } = useLanguage();

  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [trayPieces, setTrayPieces] = useState([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState(null);
  const [hoverPos, setHoverPos] = useState(null); // { r, c }
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const stepAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kiddoworld:blockblast:best");
      if (saved) setBestScore(parseInt(saved, 10) || 0);

      stepAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
      wrongAudioRef.current = new Audio("/game-assets/sounds/wrong.ogg");
    } catch {
      // Audio or storage not available
    }
  }, []);

  const spawnNewTray = useCallback(() => {
    const newBatch = [];
    for (let i = 0; i < 3; i++) {
      const randomPiece = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
      newBatch.push({ ...randomPiece, instanceId: Math.random(), used: false });
    }
    setTrayPieces(newBatch);
    setSelectedPieceIndex(null);
  }, []);

  const startNewGame = useCallback(() => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setScore(0);
    setCombo(0);
    setGameOver(false);
    spawnNewTray();
  }, [spawnNewTray]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      if (type === "place" && stepAudioRef.current) {
        stepAudioRef.current.currentTime = 0;
        stepAudioRef.current.play().catch(() => {});
      } else if (type === "clear" && winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play().catch(() => {});
      } else if (type === "over" && wrongAudioRef.current) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play().catch(() => {});
      }
    } catch {
      // Sound fail
    }
  };

  const handlePlace = (r, c) => {
    if (selectedPieceIndex === null || gameOver) return;
    const piece = trayPieces[selectedPieceIndex];
    if (!piece || piece.used) return;

    if (!canPlacePiece(board, piece, r, c)) {
      playSound("place");
      return;
    }

    // Place piece on board
    const nextBoard = board.map((row) => [...row]);
    for (const [dc, dr] of piece.cells) {
      nextBoard[r + dr][c + dc] = piece.color;
    }

    // Check completed rows & columns
    const fullRows = [];
    for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
      if (nextBoard[rowIdx].every((cell) => cell !== null)) {
        fullRows.push(rowIdx);
      }
    }

    const fullCols = [];
    for (let colIdx = 0; colIdx < BOARD_SIZE; colIdx++) {
      let full = true;
      for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
        if (nextBoard[rowIdx][colIdx] === null) {
          full = false;
          break;
        }
      }
      if (full) fullCols.push(colIdx);
    }

    // Clear completed lines
    for (const rowIdx of fullRows) {
      for (let colIdx = 0; colIdx < BOARD_SIZE; colIdx++) {
        nextBoard[rowIdx][colIdx] = null;
      }
    }
    for (const colIdx of fullCols) {
      for (let rowIdx = 0; rowIdx < BOARD_SIZE; rowIdx++) {
        nextBoard[rowIdx][colIdx] = null;
      }
    }

    // Score calculation
    const linesCleared = fullRows.length + fullCols.length;
    let addedScore = piece.cells.length * 10;
    let nextCombo = combo;

    if (linesCleared > 0) {
      nextCombo = combo + linesCleared;
      addedScore += linesCleared * 100 * nextCombo;
      playSound("clear");
    } else {
      nextCombo = 0;
      playSound("place");
    }

    const newScore = score + addedScore;
    setScore(newScore);
    setCombo(nextCombo);

    if (newScore > bestScore) {
      setBestScore(newScore);
      try {
        localStorage.setItem("kiddoworld:blockblast:best", String(newScore));
      } catch {}
    }

    // Update tray piece as used
    const nextTray = trayPieces.map((p, idx) =>
      idx === selectedPieceIndex ? { ...p, used: true } : p
    );

    setSelectedPieceIndex(null);
    setHoverPos(null);

    // If all 3 pieces are used, spawn next tray
    if (nextTray.every((p) => p.used)) {
      const newBatch = [];
      for (let i = 0; i < 3; i++) {
        const randomPiece = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
        newBatch.push({ ...randomPiece, instanceId: Math.random(), used: false });
      }
      setTrayPieces(newBatch);
      setBoard(nextBoard);

      // Check if moves are possible with new batch
      if (!hasAnyValidMove(nextBoard, newBatch)) {
        setGameOver(true);
        playSound("over");
      }
    } else {
      setTrayPieces(nextTray);
      setBoard(nextBoard);

      // Check if any moves remain
      if (!hasAnyValidMove(nextBoard, nextTray)) {
        setGameOver(true);
        playSound("over");
      }
    }
  };

  const selectedPiece = selectedPieceIndex !== null ? trayPieces[selectedPieceIndex] : null;

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
        {/* Top Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                backgroundColor: "#FAF6F0",
                border: "2px solid #231F20",
                borderRadius: "10px",
                padding: "4px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: "800", color: "#6E5D4F" }}>{t("SKOR", "SCORE")}</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#231F20" }}>{score}</div>
            </div>

            <div
              style={{
                backgroundColor: "#FAF6F0",
                border: "2px solid #231F20",
                borderRadius: "10px",
                padding: "4px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: "800", color: "#6E5D4F" }}>{t("TERBAIK", "BEST")}</div>
              <div style={{ fontSize: "16px", fontWeight: "900", color: "#F59E0B" }}>{bestScore}</div>
            </div>
          </div>

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

        {/* Combo Banner */}
        {combo > 1 && (
          <div
            style={{
              backgroundColor: "#F59E0B",
              color: "#FFFFFF",
              textAlign: "center",
              padding: "4px 10px",
              borderRadius: "999px",
              fontWeight: "900",
              fontSize: "13px",
              animation: "popIn 0.2s ease-out",
            }}
          >
            🔥 {combo}x COMBO!
          </div>
        )}

        {/* 8x8 Board */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1",
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "12px",
            padding: "6px",
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            gridGap: "4px",
            boxSizing: "border-box",
          }}
        >
          {board.map((row, r) =>
            row.map((cellColor, c) => {
              // Check if hover preview
              let isPreview = false;
              let isPreviewValid = false;
              if (selectedPiece && hoverPos) {
                const inPiece = selectedPiece.cells.some(
                  ([dc, dr]) => hoverPos.r + dr === r && hoverPos.c + dc === c
                );
                if (inPiece) {
                  isPreview = true;
                  isPreviewValid = canPlacePiece(board, selectedPiece, hoverPos.r, hoverPos.c);
                }
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handlePlace(r, c)}
                  onMouseEnter={() => setHoverPos({ r, c })}
                  style={{
                    backgroundColor: cellColor
                      ? cellColor
                      : isPreview
                      ? isPreviewValid
                        ? "rgba(16, 185, 129, 0.45)"
                        : "rgba(239, 68, 68, 0.35)"
                      : "#FFFFFF",
                    border: cellColor ? "2px solid #231F20" : "1px solid #E2D7CB",
                    borderRadius: "6px",
                    cursor: selectedPiece ? "pointer" : "default",
                    transition: "background-color 0.1s ease",
                  }}
                />
              );
            })
          )}
        </div>

        {/* Tray Pieces */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
            minHeight: "90px",
            backgroundColor: "#FAF6F0",
            border: "2px solid #231F20",
            borderRadius: "12px",
            padding: "8px",
            alignItems: "center",
          }}
        >
          {trayPieces.map((piece, idx) => {
            if (piece.used) return <div key={piece.instanceId} />;
            const isSelected = selectedPieceIndex === idx;

            // Compute piece bounding box
            const maxC = Math.max(...piece.cells.map(([c]) => c));
            const maxR = Math.max(...piece.cells.map(([, r]) => r));

            return (
              <div
                key={piece.instanceId}
                onClick={() => setSelectedPieceIndex(isSelected ? null : idx)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80px",
                  borderRadius: "8px",
                  border: isSelected ? "2px solid #3B82F6" : "2px dashed transparent",
                  backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${maxC + 1}, 14px)`,
                    gridTemplateRows: `repeat(${maxR + 1}, 14px)`,
                    gap: "2px",
                  }}
                >
                  {Array.from({ length: maxR + 1 }).map((_, r) =>
                    Array.from({ length: maxC + 1 }).map((_, c) => {
                      const hasCell = piece.cells.some(([pc, pr]) => pc === c && pr === r);
                      return (
                        <div
                          key={`${r}-${c}`}
                          style={{
                            width: "14px",
                            height: "14px",
                            backgroundColor: hasCell ? piece.color : "transparent",
                            borderRadius: "3px",
                            border: hasCell ? "1px solid #231F20" : "none",
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip text */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "#6E5D4F", margin: 0 }}>
          {selectedPiece
            ? t("Ketuk petak di papan untuk meletakkan balok!", "Tap a square on the board to place the block!")
            : t("Pilih satu balok dari kotak di bawah!", "Select a block from the tray below!")}
        </p>

        {/* Game Over Modal */}
        {gameOver && (
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
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "8px" }}>💥</div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", color: "#231F20" }}>
                {t("Permainan Selesai!", "Game Over!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 16px" }}>
                {t("Tidak ada ruang lagi untuk balok berikutnya.", "No more room for the remaining blocks.")}
              </p>

              <div
                style={{
                  backgroundColor: "#FAF6F0",
                  border: "2px solid #231F20",
                  borderRadius: "10px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#6E5D4F" }}>{t("Skor Akhir", "Final Score")}</div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#231F20" }}>{score}</div>
              </div>

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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <RotateCcw size={18} />
                <span>{t("Main Lagi", "Play Again")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
