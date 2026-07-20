"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./BingoLabyrinthGameClient.module.css";

const GRID_SIZE = 8;
const CELL_SIZE = 50;

const LEVELS = [
  {
    name: { id: "Jalan Taman", en: "Garden Path" },
    nameKey: "gardenPath",
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
    name: { id: "Petualangan Taman", en: "Park Adventure" },
    nameKey: "parkAdventure",
    start: { x: 0, y: 7 },
    end: { x: 7, y: 0 },
    walls: [
      { x: 2, y: 7 }, { x: 2, y: 6 }, { x: 2, y: 5 },
      { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 4, y: 3 },
      { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
    ],
  },
  {
    name: { id: "Seru di Pantai", en: "Beach Fun" },
    nameKey: "beachFun",
    start: { x: 0, y: 4 },
    end: { x: 7, y: 4 },
    walls: [
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 4, y: 7 }, { x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 },
    ],
  },
];

export default function SenaLabyrinthGameClient() {
  const { t, language } = useLanguage();
  const canvasRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bingoPos, setSenaPos] = useState(null);
  const [gameState, setGameState] = useState("drawing");
  const [showIntro, setShowIntro] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  const level = LEVELS[currentLevel];
  const isWall = (x, y) => level.walls.some((w) => w.x === x && w.y === y);

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
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

        if ((x + y) % 2 === 0) {
          ctx.fillStyle = "#90EE90";
        } else {
          ctx.fillStyle = "#98FB98";
        }
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

    if (path.length > 0) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      path.forEach((point, i) => {
        const px = point.x * CELL_SIZE + CELL_SIZE / 2;
        const py = point.y * CELL_SIZE + CELL_SIZE / 2;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
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

    ctx.fillStyle = "#4CAF50";
    ctx.beginPath();
    ctx.arc(
      level.start.x * CELL_SIZE + CELL_SIZE / 2,
      level.start.y * CELL_SIZE + CELL_SIZE / 2,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", level.start.x * CELL_SIZE + CELL_SIZE / 2, level.start.y * CELL_SIZE + CELL_SIZE / 2);

    ctx.fillStyle = "#FF6B6B";
    ctx.beginPath();
    ctx.arc(
      level.end.x * CELL_SIZE + CELL_SIZE / 2,
      level.end.y * CELL_SIZE + CELL_SIZE / 2,
      15,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText("E", level.end.x * CELL_SIZE + CELL_SIZE / 2, level.end.y * CELL_SIZE + CELL_SIZE / 2);

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
  }, [path, bingoPos, level, isWall, gameState, isClient]);

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

  const handleMouseDown = (e) => {
    if (gameState !== "drawing") return;
    const pos = getGridPos(e);
    // Skip if on wall
    if (isWall(pos.x, pos.y)) return;

    // Check if clicking on any existing path point - if so, continue from there
    const pathIndex = path.findIndex(p => p.x === pos.x && p.y === pos.y);
    if (pathIndex !== -1 && pathIndex < path.length - 1) {
      // Clicked on middle of path - truncate to that point and continue
      setIsDrawing(true);
      setPath(path.slice(0, pathIndex + 1));
      return;
    }

    // Allow starting from S position OR anywhere if path is empty
    if (path.length === 0 && pos.x === level.start.x && pos.y === level.start.y) {
      setIsDrawing(true);
      setPath([pos]);
    } else if (path.length > 0) {
      // Allow continuing from last point OR from anywhere if close enough (within 2 cells)
      const lastPoint = path[path.length - 1];
      const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);
      if (distance <= 2) {
        setIsDrawing(true);
        // If not adjacent, we need to add intermediate points
        if (distance === 2) {
          const newPath = [...path];
          // Add intermediate point
          const midX = (lastPoint.x + pos.x) / 2;
          const midY = (lastPoint.y + pos.y) / 2;
          newPath.push({ x: midX, y: midY });
          newPath.push(pos);
          setPath(newPath);
        } else {
          setPath((prev) => [...prev, pos]);
        }
      } else if (pos.x === level.start.x && pos.y === level.start.y) {
        // Clear and start fresh from S
        setIsDrawing(true);
        setPath([pos]);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || gameState !== "drawing") return;
    const pos = getGridPos(e);
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return;
    if (isWall(pos.x, pos.y)) return;

    const lastPoint = path[path.length - 1];
    const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);

    if (distance === 1) {
      // Directly adjacent - add directly
      setPath((prev) => [...prev, pos]);
    } else if (distance === 2) {
      // Skip one cell - add intermediate point then current
      const midX = Math.round((lastPoint.x + pos.x) / 2);
      const midY = Math.round((lastPoint.y + pos.y) / 2);
      if (!isWall(midX, midY)) {
        setPath((prev) => [...prev, { x: midX, y: midY }, pos]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (gameState !== "drawing") return;
    const touch = e.touches[0];
    const pos = getGridPos(touch);
    // Skip if on wall
    if (isWall(pos.x, pos.y)) return;

    // Check if tapping on any existing path point - if so, continue from there
    const pathIndex = path.findIndex(p => p.x === pos.x && p.y === pos.y);
    if (pathIndex !== -1 && pathIndex < path.length - 1) {
      // Tapped on middle of path - truncate to that point and continue
      setIsDrawing(true);
      setPath(path.slice(0, pathIndex + 1));
      return;
    }

    // Allow starting from S position OR anywhere if path is empty
    if (path.length === 0 && pos.x === level.start.x && pos.y === level.start.y) {
      setIsDrawing(true);
      setPath([pos]);
    } else if (path.length > 0) {
      // Allow continuing from last point OR from anywhere if close enough (within 2 cells)
      const lastPoint = path[path.length - 1];
      const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);
      if (distance <= 2) {
        setIsDrawing(true);
        // If not adjacent, we need to add intermediate points
        if (distance === 2) {
          const newPath = [...path];
          // Add intermediate point
          const midX = (lastPoint.x + pos.x) / 2;
          const midY = (lastPoint.y + pos.y) / 2;
          newPath.push({ x: midX, y: midY });
          newPath.push(pos);
          setPath(newPath);
        } else {
          setPath((prev) => [...prev, pos]);
        }
      } else if (pos.x === level.start.x && pos.y === level.start.y) {
        // Clear and start fresh from S
        setIsDrawing(true);
        setPath([pos]);
      }
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDrawing || gameState !== "drawing") return;
    const touch = e.touches[0];
    const pos = getGridPos(touch);
    if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) return;
    if (isWall(pos.x, pos.y)) return;

    const lastPoint = path[path.length - 1];
    const distance = Math.abs(pos.x - lastPoint.x) + Math.abs(pos.y - lastPoint.y);

    if (distance === 1) {
      // Directly adjacent - add directly
      setPath((prev) => [...prev, pos]);
    } else if (distance === 2) {
      // Skip one cell - add intermediate point then current
      const midX = Math.round((lastPoint.x + pos.x) / 2);
      const midY = Math.round((lastPoint.y + pos.y) / 2);
      if (!isWall(midX, midY)) {
        setPath((prev) => [...prev, { x: midX, y: midY }, pos]);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const runPath = () => {
    if (path.length < 2) return;
    if (path[path.length - 1].x !== level.end.x || path[path.length - 1].y !== level.end.y) {
      alert(language === "id" ? "Jalur harus berakhir di tanda E (Selesai)!" : "Path must end at the E (End) marker!");
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
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel((prev) => prev + 1);
      resetLevel();
    } else {
      setCurrentLevel(0);
      resetLevel();
    }
  };

  const startGame = () => {
    setShowIntro(false);
  };

  const getLevelName = (levelObj) => {
    return levelObj.name[language] || levelObj.name.id;
  };

  if (!mounted) {
    return null;
  }

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
          <h1>{language === "id" ? "🏃 Petualangan Sena!" : "🏃 Sena's Adventure!"}</h1>
          <p>{language === "id" ? "Bantu Sena menemukan jalan keluar maze!" : "Help Sena find the path through the maze!"}</p>
          <div className={styles.instructions}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <span>{language === "id" ? "Gambar jalur dari S (Mulai) ke E (Selesai)" : "Draw a path from S (Start) to E (End)"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <span>{language === "id" ? "Ketuk \"Gas!\" agar Sena berlari" : "Tap \"Go!\" to make Sena run along the path"}</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <span>{language === "id" ? "Selesaikan 3 level!" : "Complete all 3 levels!"}</span>
            </div>
          </div>
          <button className={styles.startButton} onClick={startGame}>
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
          <h1>{language === "id" ? "🏃 Petualangan Sena" : "🏃 Sena's Adventure"}</h1>
          <p>{language === "id" ? "Level" : "Level"} {currentLevel + 1}: {getLevelName(level)}</p>
        </div>
        <div className={styles.levelNav}>
          <button onClick={() => { setCurrentLevel(0); resetLevel(); }} className={currentLevel === 0 ? styles.activeLevel : ""}>1</button>
          <button onClick={() => { setCurrentLevel(1); resetLevel(); }} className={currentLevel === 1 ? styles.activeLevel : ""}>2</button>
          <button onClick={() => { setCurrentLevel(2); resetLevel(); }} className={currentLevel === 2 ? styles.activeLevel : ""}>3</button>
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
            <span>{language === "id" ? "🎉 Kerja bagus! 🎉" : "🎉 Great Job! 🎉"}</span>
            <button className={styles.nextButton} onClick={nextLevel}>
              {currentLevel < LEVELS.length - 1
                ? (language === "id" ? "Level Berikutnya ➡️" : "Next Level ➡️")
                : (language === "id" ? "Main Lagi 🔄" : "Play Again 🔄")}
            </button>
          </div>
        )}
      </div>

      <div className={styles.hint}>
        {gameState === "drawing" && (language === "id"
          ? "Gambar jalur mulai dari tanda S hijau!"
          : "Draw a path starting from the green S marker!")}
      </div>
    </div>
  );
}