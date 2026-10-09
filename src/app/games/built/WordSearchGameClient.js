"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const WORD_CATEGORIES = [
  {
    id: "hewan",
    name: { id: "Hewan", en: "Animals" },
    words: ["KUCING", "SINGA", "GAJAH", "KUDA", "BURUNG", "IKAN"],
    color: "#10b981",
  },
  {
    id: "buah",
    name: { id: "Buah-buahan", en: "Fruits" },
    words: ["APEL", "PISANG", "JERUK", "MANGGA", "MELON", "ANGGUR"],
    color: "#f59e0b",
  },
  {
    id: "warna",
    name: { id: "Warna", en: "Colors" },
    words: ["MERAH", "BIRU", "HIJAU", "KUNING", "UNGU", "PUTIH"],
    color: "#3b82f6",
  },
  {
    id: "benda",
    name: { id: "Benda Sekolah", en: "School Items" },
    words: ["BUKU", "PENSIL", "MEJA", "KURSI", "SEPATU", "PAPAN"],
    color: "#8b5cf6",
  },
];

const GRID_SIZE = 8;

function generateWordGrid(words) {
  const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(""));
  const placedWords = [];

  const directions = [
    [0, 1],   // horizontal right
    [1, 0],   // vertical down
    [1, 1],   // diagonal down-right
  ];

  for (const word of words) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const maxR = GRID_SIZE - (dr * (word.length - 1));
      const maxC = GRID_SIZE - (dc * (word.length - 1));

      if (maxR <= 0 || maxC <= 0) continue;

      const r = Math.floor(Math.random() * maxR);
      const c = Math.floor(Math.random() * maxC);

      // Check if fit
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const cur = grid[r + dr * i][c + dc * i];
        if (cur !== "" && cur !== char) {
          fits = false;
          break;
        }
      }

      if (fits) {
        const coords = [];
        for (let i = 0; i < word.length; i++) {
          grid[r + dr * i][c + dc * i] = word[i];
          coords.push({ r: r + dr * i, c: c + dc * i });
        }
        placedWords.push({ word, coords });
        placed = true;
      }
    }
  }

  // Fill random alphabet letters in empty spaces
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placedWords };
}

export default function WordSearchGameClient() {
  const { t, language } = useLanguage();

  const [category, setCategory] = useState(WORD_CATEGORIES[0]);
  const [grid, setGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isWon, setIsWon] = useState(false);

  const stepAudioRef = useRef(null);
  const winAudioRef = useRef(null);

  useEffect(() => {
    try {
      stepAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
    } catch {}
  }, []);

  const initGame = useCallback((cat) => {
    setCategory(cat);
    const { grid: newGrid, placedWords: newPlaced } = generateWordGrid(cat.words);
    setGrid(newGrid);
    setPlacedWords(newPlaced);
    setFoundWords([]);
    setSelectedCells([]);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initGame(WORD_CATEGORIES[0]);
  }, [initGame]);

  const handleCellClick = (r, c) => {
    if (isWon) return;

    if (soundEnabled && stepAudioRef.current) {
      stepAudioRef.current.currentTime = 0;
      stepAudioRef.current.play().catch(() => {});
    }

    const alreadyIndex = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);
    let nextSelected;
    if (alreadyIndex !== -1) {
      nextSelected = selectedCells.filter((_, idx) => idx !== alreadyIndex);
    } else {
      nextSelected = [...selectedCells, { r, c }];
    }
    setSelectedCells(nextSelected);

    // Check if current selection matches any word
    const selectedString = nextSelected.map((cell) => grid[cell.r][cell.c]).join("");
    const reversedString = [...selectedString].reverse().join("");

    for (const pw of placedWords) {
      if (
        (pw.word === selectedString || pw.word === reversedString) &&
        !foundWords.includes(pw.word)
      ) {
        if (soundEnabled && winAudioRef.current) {
          winAudioRef.current.currentTime = 0;
          winAudioRef.current.play().catch(() => {});
        }
        const updatedFound = [...foundWords, pw.word];
        setFoundWords(updatedFound);
        setSelectedCells([]);

        if (updatedFound.length >= placedWords.length) {
          setIsWon(true);
        }
        return;
      }
    }
  };

  const isCellFound = (r, c) => {
    return placedWords.some((pw) =>
      foundWords.includes(pw.word) && pw.coords.some((pos) => pos.r === r && pos.c === c)
    );
  };

  const isCellSelected = (r, c) => {
    return selectedCells.some((cell) => cell.r === r && cell.c === c);
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
            🔍 {t("Cari Kata", "Word Search")}
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

        {/* Category Tabs */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {WORD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => initGame(cat)}
              style={{
                flex: "1 0 auto",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "2px solid #231F20",
                backgroundColor: category.id === cat.id ? cat.color : "#FAF6F0",
                color: category.id === cat.id ? "#FFFFFF" : "#231F20",
                fontWeight: "800",
                fontSize: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {cat.name[language] || cat.name.id}
            </button>
          ))}
        </div>

        {/* Word Targets List */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            justifyContent: "center",
            padding: "8px",
            backgroundColor: "#FAF6F0",
            borderRadius: "10px",
            border: "2px solid #231F20",
          }}
        >
          {placedWords.map((pw) => {
            const found = foundWords.includes(pw.word);
            return (
              <span
                key={pw.word}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "900",
                  backgroundColor: found ? "#10B981" : "#FFFFFF",
                  color: found ? "#FFFFFF" : "#6E5D4F",
                  border: "1px solid #231F20",
                  textDecoration: found ? "line-through" : "none",
                }}
              >
                {found && <Check size={12} />}
                <span>{pw.word}</span>
              </span>
            );
          })}
        </div>

        {/* Grid Container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: "4px",
            padding: "8px",
            backgroundColor: "#FAF6F0",
            borderRadius: "12px",
            border: "2px solid #231F20",
            aspectRatio: "1",
          }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const found = isCellFound(r, c);
              const selected = isCellSelected(r, c);

              let bg = "#FFFFFF";
              let textCol = "#231F20";
              if (found) {
                bg = "#10B981";
                textCol = "#FFFFFF";
              } else if (selected) {
                bg = "#3B82F6";
                textCol = "#FFFFFF";
              }

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    backgroundColor: bg,
                    color: textCol,
                    borderRadius: "6px",
                    border: "1px solid #231F20",
                    fontWeight: "900",
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                    transition: "transform 0.08s ease, background 0.08s ease",
                    transform: selected ? "scale(0.92)" : "scale(1)",
                  }}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setSelectedCells([])}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "2px solid #231F20",
              backgroundColor: "#FAF6F0",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {t("Batal Pilih", "Clear Selection")}
          </button>

          <button
            type="button"
            onClick={() => initGame(category)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "2px solid #231F20",
              backgroundColor: "#FAF6F0",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            <span>{t("Acak Ulang", "Reshuffle")}</span>
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
                {t("Semua Kata Ditemukan!", "All Words Found!")}
              </h2>
              <p style={{ fontSize: "14px", color: "#6E5D4F", margin: "0 0 20px" }}>
                {t("Hebat! Kamu berhasil mencari semua kata dalam labirin huruf.", "Great job! You found every hidden word in the grid.")}
              </p>

              <button
                type="button"
                onClick={() => initGame(category)}
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
