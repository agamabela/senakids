"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./BingoLabyrinthGameClient.module.css";

const GRID_SIZE = 8;
const CELL_SIZE = 50;

// Pool of hand-made levels. Each session we shuffle this pool and play 3,
// so the game never starts with the same maze twice.
const LEVEL_POOL = [
  {
    name: { id: "Jalan ke Rumah", en: "Way Home" },
    start: { x: 0, y: 0 },
    end: { x: 7, y: 7 },
    walls: [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 },
      { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
      { x: 2, y: 4 }, { x: 2, y: 5 },
    ],
  },
  {
    name: { id: "Pulang Sekolah", en: "After School" },
    start: { x: 0, y: 7 },
    end: { x: 7, y: 0 },
    walls: [
      { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 },
      { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 3 },
      { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
    ],
  },
  {
    name: { id: "Lewat Taman", en: "Through the Park" },
    start: { x: 0, y: 4 },
    end: { x: 7, y: 4 },
    walls: [
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 4, y: 7 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 },
    ],
  },
  {
    name: { id: "Jalan Berliku", en: "Winding Road" },
    start: { x: 0, y: 0 },
    end: { x: 7, y: 6 },
    walls: [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
      { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 },
      { x: 5, y: 5 }, { x: 5, y: 6 },
    ],
  },
  {
    name: { id: "Dekat Pasar", en: "Near the Market" },
    start: { x: 7, y: 0 },
    end: { x: 0, y: 7 },
    walls: [
      { x: 5, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 },
      { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 1, y: 6 },
    ],
  },
  {
    name: { id: "Belakang Sekolah", en: "Behind School" },
    start: { x: 0, y: 7 },
    end: { x: 7, y: 7 },
    walls: [
      { x: 1, y: 7 }, { x: 1, y: 6 }, { x: 1, y: 5 },
      { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 },
      { x: 5, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 },
    ],
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SenaLabyrinthGameClient() {
  const { language } = useLanguage();
  const canvasRef = useRef(null);
  // Randomize the 3 levels for this session
  const [levels, setLevels] = useState(() => shuffle(LEVEL_POOL).slice(0, 3));
  const [currentLevel, setCurrentLevel] = useState(0);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bingoPos, setSenaPos] = useState(null);
  const [gameState, setGameState] = useState("drawing");
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const level = levels[currentLevel];
  const isWall = (x, y) => level.walls.some((w) => w.x === x && w.y === y);

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  // Blink timer for the start marker
  useEffect(() => {
    const id = setInterval(() => setBlinkOn((b) => !b), 450);
    return () => clearInterval(id);
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isClient) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;

        ctx.fillStyle = (x + y) % 2 === 0 ? "#90EE90" : "#98FB98";
        ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);

        if (isWall(x, y)) {
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          ctx.strokeStyle = "#654321";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cellX + 5, cellY + 10);
          ctx.lineTo(cellX + CELL_SIZE - 5, cellY + 10);
          ctx.moveTo(cellX + 5, cellY + 25);
          ctx.lineTo(cellX + CELL_SIZE - 5, cellY + 25);
          ctx.moveTo(cellX + 5, cellY + 40);
          ctx.lineTo(cellX + CELL_SIZE - 5, cellY + 40);
          ctx.stroke();
        }

        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
      }
    }

    // Drawn path
    if (path.length > 0) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      path.forEach((point, i) => {
        const px = point.x * CELL_SIZE + CELL_SIZE / 2;
        const py = point.y * CELL_SIZE + CELL_SIZE / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      path.forEach((point) => {
        const px = point.x * CELL_SIZE + CELL_SIZE / 2;
        const py = point.y * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── START marker: blinking red/yellow beacon ──
    const sx = level.start.x * CELL_SIZE + CELL_SIZE / 2;
    const sy = level.start.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.save();
    // outer glow ring
    ctx.fillStyle = blinkOn ? "rgba(239,68,68,0.30)" : "rgba(250,204,21,0.30)";
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fill();
    // main beacon
    ctx.fillStyle = blinkOn ? "#ef4444" : "#facc15";
    ctx.beginPath();
    ctx.arc(sx, sy, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    // little school icon dot
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏫", sx, sy + 1);
    ctx.restore();

    // ── FINISH marker: black & white checkered flag ──
    const ex = level.end.x * CELL_SIZE + CELL_SIZE / 2;
    const ey = level.end.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.save();
    // pole
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ex - 12, ey - 16);
    ctx.lineTo(ex - 12, ey + 18);
    ctx.stroke();
    // checkered flag 4x3 of 6px squares
    const fx = ex - 12;
    const fy = ey - 16;
    const sq = 6;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? "#111" : "#fff";
        ctx.fillRect(fx + c * sq, fy + r * sq, sq, sq);
      }
    }
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    ctx.strokeRect(fx, fy, sq * 4, sq * 3);
    // little home icon under flag
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏠", ex + 6, ey + 12);
    ctx.restore();

    const drawSena = (x, y, scale = 1) => {
      const centerX = x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = y * CELL_SIZE + CELL_SIZE / 2;
      const size = 35 * scale;

      ctx.fillStyle = "#8BA888";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 5, size / 2, size / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY - size / 3, size / 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#8BA888";
      ctx.beginPath();
      ctx.moveTo(centerX - size / 3, centerY - size / 2);
      ctx.lineTo(centerX - size / 2, centerY - size / 1.5);
      ctx.lineTo(centerX - size / 6, centerY - size / 2.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX + size / 3, centerY - size / 2);
      ctx.lineTo(centerX + size / 2, centerY - size / 1.5);
      ctx.lineTo(centerX + size / 6, centerY - size / 2.5);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(centerX, centerY - size / 4, size / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(centerX - size / 6, centerY - size / 3, 3, 0, Math.PI * 2);
      ctx.arc(centerX + size / 6, centerY - size / 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - size / 8, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#8BA888";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX + size / 2, centerY + 5);
      ctx.quadraticCurveTo(centerX + size / 1.5, centerY, centerX + size / 1.5, centerY - size / 3);
      ctx.stroke();
    };

    if (bingoPos) {
      drawSena(bingoPos.x, bingoPos.y);
    } else if (gameState === "drawing" || gameState === "won") {
      drawSena(level.start.x, level.start.y, 0.7);
    }
  }, [path, bingoPos, level, isWall, gameState, isClient, blinkOn]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  const getGridPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: -1, y: -1 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    return { x, y };
  };

  const beginAt = (pos) => {
    if (isWall(pos.x, pos.y)) return;
    setHasChanges(true);
    const pathIndex = path.findIndex((p) => p.x === pos.x && p.y === pos.y);
    if (pathIndex !== -1 && pathIndex < path.length - 1) {
      setIsDrawing(true);
      setPath(path.slice(0, pathIndex + 1));
      return;
    }
    if (path.length === 0 && pos.x === level.start.x && pos.y === level.start.y) {
      setIsDrawing(true);
      setPath([pos]);
    } else if (path.length > 0) {
      const lastPoint = path[path.length - 1];
      const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);
      if (distance <= 2) {
        setIsDrawing(true);
        if (distance === 2) {
          const newPath = [...path];
          newPath.push({ x: (lastPoint.x + pos.x) / 2, y: (lastPoint.y + pos.y) / 2 });
          newPath.push(pos);
          setPath(newPath);
        } else {
          setPath((prev) => [...prev, pos]);
        }
      } else if (pos.x === level.start.x && pos.y === level.start.y) {
        setIsDrawing(true);
        setPath([pos]);
      }
    }
  };

  const moveTo = (pos) => {
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return;
    if (isWall(pos.x, pos.y)) return;
    const lastPoint = path[path.length - 1];
    const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);
    if (distance === 1) {
      setPath((prev) => [...prev, pos]);
    } else if (distance === 2) {
      const midX = Math.round((lastPoint.x + pos.x) / 2);
      const midY = Math.round((lastPoint.y + pos.y) / 2);
      if (!isWall(midX, midY)) setPath((prev) => [...prev, { x: midX, y: midY }, pos]);
    }
  };

  const handleMouseDown = (e) => {
    if (gameState !== "drawing") return;
    beginAt(getGridPos(e));
  };
  const handleMouseMove = (e) => {
    if (!isDrawing || gameState !== "drawing") return;
    moveTo(getGridPos(e));
  };
  const handleMouseUp = () => setIsDrawing(false);

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (gameState !== "drawing") return;
    beginAt(getGridPos(e.touches[0]));
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || gameState !== "drawing") return;
    moveTo(getGridPos(e.touches[0]));
  };
  const handleTouchEnd = () => setIsDrawing(false);

  const runPath = () => {
    if (path.length < 2) return;
    if (path[path.length - 1].x !== level.end.x || path[path.length - 1].y !== level.end.y) {
      alert(language === "id" ? "Jalur harus berakhir di rumah (🏁)!" : "Path must end at home (🏁)!");
      return;
    }
    setGameState("moving");
    let step = 0;
    setSenaPos(path[0]);
    const interval = setInterval(() => {
      step++;
      if (step >= path.length) {
        clearInterval(interval);
        setGameState("won");
        return;
      }
      setSenaPos(path[step]);
    }, 300);
  };

  const resetLevel = () => {
    setPath([]);
    setSenaPos(null);
    setGameState("drawing");
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      // new shuffled session
      setLevels(shuffle(LEVEL_POOL).slice(0, 3));
      setCurrentLevel(0);
    }
    resetLevel();
  };

  const getLevelName = (levelObj) => levelObj.name[language] || levelObj.name.id;

  if (!mounted) return null;

  if (showIntro) {
    return (
      <div className={styles.gameWrapper}>
        <div className={styles.introCard}>
          <div className={styles.bingoArt}>
            <div className={styles.bingoHead}></div>
            <div className={styles.bingoBody}></div>
            <div className={styles.bingoEar1}></div>
            <div className={styles.bingoEar2}></div>
          </div>
          <h1>{language === "id" ? "🏃 Sena Pulang ke Rumah!" : "🏃 Sena Goes Home!"}</h1>
          <p>{language === "id" ? "Bantu Sena pulang dari sekolah 🏫 ke rumah 🏠!" : "Help Sena get from school 🏫 to home 🏠!"}</p>
          <div className={styles.instructions}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>{language === "id" ? "Gambar jalur dari 🏫 (sekolah) ke 🏁 (rumah)" : "Draw a path from 🏫 (school) to 🏁 (home)"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>{language === "id" ? "Ketuk \"Gas!\" agar Sena berlari" : "Tap \"Go!\" to make Sena run"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span>{language === "id" ? "Maze selalu acak setiap bermain!" : "Mazes are random every time you play!"}</span>
            </div>
          </div>
          <button className={styles.startButton} onClick={() => setShowIntro(false)}>
            {language === "id" ? "Gas! 🎮" : "Let's Go! 🎮"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.header}>
        <div>
          <h1>{language === "id" ? "🏃 Sena Pulang ke Rumah" : "🏃 Sena Goes Home"}</h1>
          <p>{language === "id" ? "Level" : "Level"} {currentLevel + 1}: {getLevelName(level)}</p>
        </div>
        <div className={styles.levelNav}>
          {levels.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentLevel(i); resetLevel(); }}
              className={currentLevel === i ? styles.activeLevel : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.gameArea}>
        {isClient && (
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className={styles.canvas}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}
      </div>

      <div className={styles.controls}>
        {gameState === "drawing" && (
          <>
            <button className={styles.resetButton} onClick={resetLevel}>
              {language === "id" ? "🔄 Hapus" : "🔄 Clear"}
            </button>
            <button className={styles.goButton} onClick={runPath} disabled={path.length < 2}>
              {language === "id" ? "Gas! 🏃" : "Go! 🏃"}
            </button>
          </>
        )}
        {gameState === "won" && (
          <div className={styles.winMessage}>
            <span>{language === "id" ? "🎉 Sampai rumah! 🎉" : "🎉 Made it home! 🎉"}</span>
            <button className={styles.nextButton} onClick={nextLevel}>
              {currentLevel < levels.length - 1
                ? (language === "id" ? "Level Berikutnya ➡️" : "Next Level ➡️")
                : (language === "id" ? "Maze Baru 🔄" : "New Mazes 🔄")}
            </button>
          </div>
        )}
      </div>

      <div className={styles.hint}>
        {gameState === "drawing" && (language === "id"
          ? "Gambar jalur mulai dari 🏫 sekolah yang berkedip!"
          : "Draw a path starting from the blinking 🏫 school!")}
      </div>
    </div>
  );
}
