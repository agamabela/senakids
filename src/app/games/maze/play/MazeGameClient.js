"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const CONFIGS = {
  easy: {
    width: 17,
    height: 17,
    treasureCount: 2,
    loopDensity: 0.04,
    moveDelay: 88,
    meteorInterval: 0,
  },
  medium: {
    width: 25,
    height: 25,
    treasureCount: 3,
    loopDensity: 0.07,
    moveDelay: 80,
    meteorInterval: 0,
  },
  hard: {
    width: 33,
    height: 33,
    treasureCount: 4,
    loopDensity: 0.1,
    moveDelay: 72,
    meteorInterval: 7000,
  },
  extreme: {
    width: 41,
    height: 41,
    treasureCount: 5,
    loopDensity: 0.13,
    moveDelay: 68,
    meteorInterval: 4500,
  },
};

const DIFFICULTY_LABELS = {
  easy: { id: "Mudah", en: "Easy" },
  medium: { id: "Sedang", en: "Medium" },
  hard: { id: "Sulit", en: "Hard" },
  extreme: { id: "Extreme", en: "Extreme" },
};

function generateMazeData({ width, height, treasureCount, loopDensity }) {
  const maze = Array(height)
    .fill(null)
    .map(() => Array(width).fill(1));

  // Eller / tree carving on odd cells
  for (let y = 1; y < height; y += 2) {
    let run = [];
    for (let x = 1; x < width; x += 2) {
      maze[y][x] = 0;
      run.push({ x, y });
      const isFirstRow = y === 1;
      if (x + 2 >= width || (!isFirstRow && Math.random() < 0.35)) {
        if (!isFirstRow) {
          const chosen = run[Math.floor(Math.random() * run.length)];
          maze[chosen.y - 1][chosen.x] = 0;
        }
        run = [];
      } else {
        maze[y][x + 1] = 0;
      }
    }
  }

  // Carve extra loops according to loopDensity
  const wallCandidates = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (maze[y][x] !== 1) continue;
      const horiz = maze[y][x - 1] !== 1 && maze[y][x + 1] !== 1;
      const vert = maze[y - 1][x] !== 1 && maze[y + 1][x] !== 1;
      if (horiz || vert) {
        wallCandidates.push({ x, y });
      }
    }
  }

  const numLoops = Math.floor(wallCandidates.length * loopDensity);
  const shuffledWalls = [...wallCandidates];
  for (let i = shuffledWalls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledWalls[i], shuffledWalls[j]] = [shuffledWalls[j], shuffledWalls[i]];
  }
  shuffledWalls.slice(0, numLoops).forEach(({ x, y }) => {
    maze[y][x] = 0;
  });

  // Start position (1,1) is home
  maze[1][1] = 2;

  // Compute BFS distance from (1,1)
  const distances = Array.from({ length: height }, () => Array(width).fill(-1));
  const queue = [{ x: 1, y: 1 }];
  distances[1][1] = 0;
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    const dist = distances[cur.y][cur.x] + 1;
    [
      { x: cur.x + 1, y: cur.y },
      { x: cur.x - 1, y: cur.y },
      { x: cur.x, y: cur.y + 1 },
      { x: cur.x, y: cur.y - 1 },
    ].forEach(({ x, y }) => {
      if (
        x < 0 ||
        y < 0 ||
        x >= width ||
        y >= height ||
        maze[y][x] === 1 ||
        distances[y][x] !== -1
      )
        return;
      distances[y][x] = dist;
      queue.push({ x, y });
    });
  }

  // Find candidate treasure cells
  const minDistance = Math.floor((width + height) * 0.25);
  const candidates = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maze[y][x] === 0 && (x !== 1 || y !== 1)) {
        if (distances[y][x] >= minDistance) {
          candidates.push({ x, y, distance: distances[y][x] });
        }
      }
    }
  }

  const sortedCandidates = (candidates.length
    ? candidates
    : (() => {
        const fallback = [];
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (maze[y][x] === 0 && (x !== 1 || y !== 1)) {
              fallback.push({ x, y, distance: distances[y][x] });
            }
          }
        }
        return fallback;
      })()
  ).sort((a, b) => b.distance - a.distance);

  const treasurePositions = [];
  const minSeparation = Math.floor((width + height) * 0.18);
  for (const c of sortedCandidates) {
    if (treasurePositions.length >= treasureCount) break;
    if (
      treasurePositions.every(
        (t) => Math.abs(c.x - t.x) + Math.abs(c.y - t.y) >= minSeparation
      )
    ) {
      treasurePositions.push({ x: c.x, y: c.y });
    }
  }

  if (treasurePositions.length < treasureCount) {
    sortedCandidates.slice(0, treasureCount).forEach((c) => {
      if (
        treasurePositions.length < treasureCount &&
        !treasurePositions.some((t) => t.x === c.x && t.y === c.y)
      ) {
        treasurePositions.push({ x: c.x, y: c.y });
      }
    });
  }

  treasurePositions.forEach(({ x, y }) => {
    maze[y][x] = 3;
  });

  return { maze, treasurePositions };
}

export default function MazeGameClient({ initialDifficulty = "easy" }) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const difficultyKey = CONFIGS[initialDifficulty] ? initialDifficulty : "easy";
  const [difficulty, setDifficulty] = useState(difficultyKey);
  const config = CONFIGS[difficulty] || CONFIGS.easy;

  const [gameState, setGameState] = useState("playing"); // 'playing' | 'won'
  const [maze, setMaze] = useState([]);
  const [treasurePositions, setTreasurePositions] = useState([]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [collectedTreasures, setCollectedTreasures] = useState([]);
  const [movingDirection, setMovingDirection] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [meteor, setMeteor] = useState(null); // { x, y, phase: 'warning' | 'impact' }
  const [statusMessage, setStatusMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const activeKeys = useRef(new Set());
  const lastMoveTime = useRef(0);
  const animFrameId = useRef(null);
  const viewportRef = useRef(null);

  const [cellSize, setCellSize] = useState(20);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // Audio elements
  const bgAudioRef = useRef(null);
  const stepAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Synthesizer fallback for sounds
  const playSynthSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (!ctx || ctx.state === "suspended") {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "step") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "gem") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === "win") {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "triangle";
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          const start = ctx.currentTime + idx * 0.1;
          g.gain.setValueAtTime(0.25, start);
          g.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
          o.start(start);
          o.stop(start + 0.36);
        });
      }
    } catch {
      // Audio context not allowed or failed
    }
  }, [soundEnabled]);

  // Audio setup
  useEffect(() => {
    try {
      bgAudioRef.current = new Audio("/game-assets/sounds/bg.ogg");
      bgAudioRef.current.loop = true;
      bgAudioRef.current.volume = 0.2;

      stepAudioRef.current = new Audio("/game-assets/sounds/step.ogg");
      stepAudioRef.current.volume = 0.4;

      winAudioRef.current = new Audio("/game-assets/sounds/win.ogg");
      winAudioRef.current.volume = 0.8;
    } catch {
      // Ignore initial audio load failure
    }

    return () => {
      bgAudioRef.current?.pause();
      stepAudioRef.current?.pause();
      winAudioRef.current?.pause();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Update background audio when soundEnabled changes
  useEffect(() => {
    if (!soundEnabled) {
      bgAudioRef.current?.pause();
    } else if (gameState === "playing") {
      bgAudioRef.current?.play().catch(() => {});
    }
  }, [soundEnabled, gameState]);

  // Maze initialization
  const initMaze = useCallback((diffKey) => {
    setDifficulty(diffKey);
    const targetConfig = CONFIGS[diffKey] || CONFIGS.easy;
    const { maze: newMaze, treasurePositions: newTreasures } = generateMazeData(targetConfig);

    setMaze(newMaze);
    setTreasurePositions(newTreasures);
    setPlayer({ x: 1, y: 1 });
    playerRef.current = { x: 1, y: 1 };
    setCollectedTreasures([]);
    setGameState("playing");
    setMeteor(null);
    setStatusMessage("");
    setMovingDirection(null);
    setIsMoving(false);
    activeKeys.current.clear();

    if (soundEnabled) {
      winAudioRef.current?.pause();
      if (winAudioRef.current) winAudioRef.current.currentTime = 0;
      bgAudioRef.current?.play().catch(() => {});
    }
  }, [soundEnabled]);

  useEffect(() => {
    initMaze(difficultyKey);
  }, [difficultyKey, initMaze]);

  // Collision check
  const isWall = useCallback(
    (x, y) => {
      if (!maze.length) return true;
      if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) return true;
      return maze[y][x] === 1;
    },
    [maze]
  );

  // Single step movement
  const moveDirection = useCallback(
    (dir) => {
      if (gameState !== "playing") return;
      const deltas = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0],
      };
      const [dx, dy] = deltas[dir] || [0, 0];

      setPlayer((prev) => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (isWall(nx, ny)) return prev;

        // Step sound
        if (soundEnabled && stepAudioRef.current) {
          stepAudioRef.current.currentTime = 0;
          stepAudioRef.current.play().catch(() => playSynthSound("step"));
        } else if (soundEnabled) {
          playSynthSound("step");
        }
        setIsMoving(true);

        // Treasure collection
        if (maze[ny] && maze[ny][nx] === 3) {
          const coordKey = `${nx},${ny}`;
          setCollectedTreasures((collected) => {
            if (collected.includes(coordKey)) return collected;
            const updated = [...collected, coordKey];

            if (soundEnabled) playSynthSound("gem");

            if (updated.length >= treasurePositions.length) {
              setTimeout(() => {
                setGameState("won");
                setMovingDirection(null);
                setIsMoving(false);
                activeKeys.current.clear();
                bgAudioRef.current?.pause();
                if (soundEnabled) {
                  winAudioRef.current?.play().catch(() => playSynthSound("win"));
                }
              }, 120);
            }
            return updated;
          });

          // Clear gem cell on maze map
          setMaze((prevMaze) => {
            const next = prevMaze.map((row) => [...row]);
            next[ny][nx] = 0;
            return next;
          });
        }

        return { x: nx, y: ny };
      });
    },
    [gameState, isWall, maze, soundEnabled, playSynthSound, treasurePositions.length]
  );

  // Get current active direction from keys
  const getActiveDirection = useCallback(() => {
    const keys = activeKeys.current;
    if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("w") || keys.has("W")) return "up";
    if (keys.has("ArrowDown") || keys.has("KeyS") || keys.has("s") || keys.has("S")) return "down";
    if (keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("a") || keys.has("A")) return "left";
    if (keys.has("ArrowRight") || keys.has("KeyD") || keys.has("d") || keys.has("D")) return "right";
    return null;
  }, []);

  // Continuous animation loop for smooth movement
  const gameLoop = useCallback(() => {
    const now = Date.now();
    const delay = config.moveDelay;
    const dir = getActiveDirection();

    if (dir && now - lastMoveTime.current >= delay) {
      moveDirection(dir);
      lastMoveTime.current = now;
    }
    setMovingDirection(dir);
    setIsMoving(Boolean(dir));

    if (gameState === "playing") {
      animFrameId.current = requestAnimationFrame(gameLoop);
    }
  }, [config.moveDelay, gameState, getActiveDirection, moveDirection]);

  // Setup keyboard event listeners
  useEffect(() => {
    const allowed = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "KeyW", "KeyA", "KeyS", "KeyD", "w", "a", "s", "d", "W", "A", "S", "D"
    ];

    const onKeyDown = (e) => {
      if (gameState !== "playing") return;
      if (allowed.includes(e.code) || allowed.includes(e.key)) {
        e.preventDefault();
        activeKeys.current.add(e.code || e.key);
      }
    };

    const onKeyUp = (e) => {
      if (allowed.includes(e.code) || allowed.includes(e.key)) {
        e.preventDefault();
        activeKeys.current.delete(e.code || e.key);
      }
    };

    const onBlur = () => {
      activeKeys.current.clear();
      setIsMoving(false);
      setMovingDirection(null);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [gameState]);

  // Run game loop
  useEffect(() => {
    if (maze.length && gameState === "playing") {
      animFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [gameLoop, maze.length, gameState]);

  // D-Pad touch handlers
  const handleDirStart = (dir) => {
    const keyMap = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
    };
    activeKeys.current.add(keyMap[dir]);
  };

  const handleDirEnd = (dir) => {
    const keyMap = {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
    };
    activeKeys.current.delete(keyMap[dir]);
  };

  // Meteor hazard timer for hard and extreme
  useEffect(() => {
    let warningTimeout;
    let clearImpactTimeout;

    if (gameState !== "playing" || !config.meteorInterval) return;

    const intervalId = setInterval(() => {
      const targetPos = { ...playerRef.current };
      if (targetPos.x === 1 && targetPos.y === 1) return; // Don't target home

      setMeteor({ ...targetPos, phase: "warning" });
      setStatusMessage(
        t(
          "Meteor datang! Keluar dari petak bertanda.",
          "Meteor incoming! Move away from the marked tile."
        )
      );

      warningTimeout = setTimeout(() => {
        setMeteor({ ...targetPos, phase: "impact" });
        const cur = playerRef.current;
        if (cur.x === targetPos.x && cur.y === targetPos.y) {
          playerRef.current = { x: 1, y: 1 };
          setPlayer({ x: 1, y: 1 });
          activeKeys.current.clear();
          setMovingDirection(null);
          setIsMoving(false);
          setStatusMessage(
            t(
              "Terkena meteor! Kembali ke awal. Hartamu tetap tersimpan.",
              "Hit by meteor! Returned to start. Your gems are safe."
            )
          );
        } else {
          setStatusMessage(
            t(
              "Berhasil menghindar! Lanjutkan mencari harta.",
              "Evaded the meteor! Continue searching for gems."
            )
          );
        }

        clearImpactTimeout = setTimeout(() => {
          setMeteor(null);
        }, 550);
      }, 1400);
    }, config.meteorInterval);

    return () => {
      clearInterval(intervalId);
      clearTimeout(warningTimeout);
      clearTimeout(clearImpactTimeout);
    };
  }, [gameState, config.meteorInterval, t]);

  // Resize handler for viewport and cell size
  useEffect(() => {
    if (gameState !== "playing") return;

    const updateSize = () => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
      const size = Math.max(16, Math.min(28, Math.floor(Math.min(rect.width, rect.height) / 17)));
      setCellSize(size);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [gameState, maze.length]);

  // Coordinates translation calculations
  const totalMazeWidth = config.width * cellSize;
  const totalMazeHeight = config.height * cellSize;
  const targetCamX = player.x * cellSize + cellSize / 2 - viewport.width / 2;
  const targetCamY = player.y * cellSize + cellSize / 2 - viewport.height / 2;

  // Off-screen treasure compass indicators
  const offscreenIndicators = treasurePositions
    .filter((pos) => !collectedTreasures.includes(`${pos.x},${pos.y}`))
    .map((pos) => {
      if (!viewport.width || !viewport.height) return null;
      const dx = (pos.x - player.x) * cellSize;
      const dy = (pos.y - player.y) * cellSize;
      const screenX = viewport.width / 2 + dx;
      const screenY = viewport.height / 2 + dy;
      const marginX = Math.max(viewport.width / 2 - 28, 1);
      const marginY = Math.max(viewport.height / 2 - 28, 1);

      if (
        screenX >= 28 &&
        screenX <= viewport.width - 28 &&
        screenY >= 28 &&
        screenY <= viewport.height - 28
      ) {
        return null;
      }

      const scale = 1 / Math.max(Math.abs(dx) / marginX, Math.abs(dy) / marginY);
      return {
        key: `${pos.x},${pos.y}`,
        left: viewport.width / 2 + dx * scale,
        top: viewport.height / 2 + dy * scale,
        rotation: (180 / Math.PI) * Math.atan2(dy, dx) + 90,
      };
    })
    .filter(Boolean);

  // Character sprite selection based on movingDirection
  const getCharSprite = () => {
    if (!isMoving || !movingDirection) return "/game-assets/images/char-idle.gif";
    switch (movingDirection) {
      case "up":
        return "/game-assets/images/char-move-up.gif";
      case "down":
        return "/game-assets/images/char-move-down.gif";
      case "left":
        return "/game-assets/images/char-move-left.gif";
      case "right":
        return "/game-assets/images/char-move-right.gif";
      default:
        return "/game-assets/images/char-idle.gif";
    }
  };

  const handleReturnMenu = () => {
    bgAudioRef.current?.pause();
    router.push("/games/maze");
  };

  const difficultyTitle = DIFFICULTY_LABELS[difficulty]?.[language] || DIFFICULTY_LABELS[difficulty]?.id || "Mudah";

  return (
    <div className={styles.gamePage}>
      <div className={styles.container}>
        {/* Top HUD */}
        <header className={styles.hud}>
          <div className={styles.hudGroup}>
            <div className={styles.hudBadge}>
              <span aria-hidden="true">💎</span>
              <span>
                {collectedTreasures.length} / {treasurePositions.length}
              </span>
            </div>
            <div className={styles.hudBadge}>
              <span>{t("Tingkat:", "Level:")}</span>
              <span>{difficultyTitle}</span>
            </div>
          </div>

          <div className={styles.hudGroup}>
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={styles.audioButton}
              aria-label={soundEnabled ? t("Matikan Suara", "Mute Audio") : t("Nyalakan Suara", "Unmute Audio")}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              type="button"
              onClick={handleReturnMenu}
              className={styles.menuButton}
            >
              <ArrowLeft size={16} />
              <span>Menu</span>
            </button>
          </div>
        </header>

        {/* Maze Viewport */}
        <main className={styles.viewportCard}>
          {maze.length > 0 && (
            <div ref={viewportRef} className={styles.mazeViewport}>
              <div
                className={styles.mazeCanvas}
                style={{
                  width: `${totalMazeWidth}px`,
                  height: `${totalMazeHeight}px`,
                  gridTemplateColumns: `repeat(${config.width}, ${cellSize}px)`,
                  transform: `translate(${-targetCamX}px, ${-targetCamY}px)`,
                }}
              >
                {maze.map((row, y) =>
                  row.map((cellType, x) => {
                    const isTreasure =
                      treasurePositions.some((tp) => tp.x === x && tp.y === y) &&
                      !collectedTreasures.includes(`${x},${y}`);
                    const isHome = cellType === 2;
                    const isPlayerHere = player.x === x && player.y === y;
                    const isMeteorHere = meteor?.x === x && meteor?.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`${styles.cell} ${cellType === 1 ? styles.wall : styles.path}`}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                        }}
                      >
                        {isTreasure && (
                          <span
                            className={styles.gemIcon}
                            style={{
                              fontSize: `${Math.max(10, Math.floor(cellSize * 0.72))}px`,
                            }}
                          >
                            💎
                          </span>
                        )}

                        {isHome && (
                          <span
                            className={styles.homeIcon}
                            style={{
                              fontSize: `${Math.max(10, Math.floor(cellSize * 0.72))}px`,
                            }}
                          >
                            🏠
                          </span>
                        )}

                        {isMeteorHere && (
                          <span
                            aria-hidden="true"
                            className={
                              meteor.phase === "warning"
                                ? styles.hazardWarning
                                : styles.hazardImpact
                            }
                          >
                            {meteor.phase === "warning" ? "!" : "☄"}
                          </span>
                        )}

                        {isPlayerHere && (
                          <img
                            src={getCharSprite()}
                            alt="Player"
                            className={styles.character}
                            style={{
                              width: `${cellSize}px`,
                              height: `${cellSize}px`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Off-screen treasure compass arrows */}
              {offscreenIndicators.map((ind) => (
                <span
                  key={ind.key}
                  role="img"
                  aria-label="Arah harta"
                  className={styles.compassArrow}
                  style={{
                    left: `${ind.left}px`,
                    top: `${ind.top}px`,
                    transform: `translate(-50%, -50%) rotate(${ind.rotation}deg)`,
                  }}
                >
                  ↑
                </span>
              ))}
            </div>
          )}
        </main>

        {/* Announcer / Status message */}
        <p role="status" aria-live="polite" className={styles.statusMessage}>
          {config.meteorInterval
            ? statusMessage ||
              t(
                "Hindari petak bertanda sebelum meteor jatuh. Harta tetap tersimpan.",
                "Avoid marked tiles before meteors hit. Your gems stay safe."
              )
            : t(
                "Gunakan tombol panah atau kontrol di bawah. Cari semua harta!",
                "Use arrow keys or controls below. Find all treasures!"
              )}
        </p>

        {/* Touch Controls D-Pad */}
        <footer className={styles.controlsSection}>
          <div className={styles.dpadBox}>
            <div className={styles.dpadGrid}>
              <div />
              <button
                type="button"
                aria-label="Bergerak ke atas"
                onMouseDown={() => handleDirStart("up")}
                onMouseUp={() => handleDirEnd("up")}
                onMouseLeave={() => handleDirEnd("up")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirStart("up");
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirEnd("up");
                }}
                onTouchCancel={() => handleDirEnd("up")}
                className={`${styles.dpadBtn} ${movingDirection === "up" ? styles.dpadActive : ""}`}
              >
                ↑
              </button>
              <div />

              <button
                type="button"
                aria-label="Bergerak ke kiri"
                onMouseDown={() => handleDirStart("left")}
                onMouseUp={() => handleDirEnd("left")}
                onMouseLeave={() => handleDirEnd("left")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirStart("left");
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirEnd("left");
                }}
                onTouchCancel={() => handleDirEnd("left")}
                className={`${styles.dpadBtn} ${movingDirection === "left" ? styles.dpadActive : ""}`}
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Bergerak ke bawah"
                onMouseDown={() => handleDirStart("down")}
                onMouseUp={() => handleDirEnd("down")}
                onMouseLeave={() => handleDirEnd("down")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirStart("down");
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirEnd("down");
                }}
                onTouchCancel={() => handleDirEnd("down")}
                className={`${styles.dpadBtn} ${movingDirection === "down" ? styles.dpadActive : ""}`}
              >
                ↓
              </button>

              <button
                type="button"
                aria-label="Bergerak ke kanan"
                onMouseDown={() => handleDirStart("right")}
                onMouseUp={() => handleDirEnd("right")}
                onMouseLeave={() => handleDirEnd("right")}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDirStart("right");
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDirEnd("right");
                }}
                onTouchCancel={() => handleDirEnd("right")}
                className={`${styles.dpadBtn} ${movingDirection === "right" ? styles.dpadActive : ""}`}
              >
                →
              </button>
            </div>
          </div>
        </footer>

        {/* Victory Modal */}
        {gameState === "won" && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.victoryCard}>
              <div className={styles.victoryIcon} aria-hidden="true">
                🎉
              </div>
              <h2 className={styles.victoryTitle}>
                {t("Kemenangan!", "Victory!")}
              </h2>
              <p className={styles.victoryDesc}>
                {t(
                  "Kamu berhasil menemukan semua harta karun di dalam labirin!",
                  "You found all the treasures hidden in the maze!"
                )}
              </p>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => initMaze(difficulty)}
                  className={styles.replayBtn}
                >
                  <RotateCcw size={18} />
                  <span>{t("Main Lagi", "Play Again")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnMenu}
                  className={styles.backMenuBtn}
                >
                  <ArrowLeft size={16} />
                  <span>{t("Kembali ke Menu", "Back to Menu")}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
