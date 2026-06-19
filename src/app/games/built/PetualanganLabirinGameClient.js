"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./PetualanganLabirinGameClient.module.css";

// ─── Maze generator (recursive backtracker) ────────────────────────────────
function generateMaze(cols, rows) {
  // cols/rows must be odd for wall-based grid
  const W = cols % 2 === 0 ? cols + 1 : cols;
  const H = rows % 2 === 0 ? rows + 1 : rows;

  // 1 = wall, 0 = passage
  const grid = Array.from({ length: H }, () => Array(W).fill(1));

  const inBounds = (x, y) => x > 0 && y > 0 && x < W - 1 && y < H - 1;
  const dirs = [
    [0, -2], [0, 2], [-2, 0], [2, 0],
  ];

  function carve(x, y) {
    grid[y][x] = 0;
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0; // carve wall between
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  return { grid, W, H };
}

// Place N treasures in random open cells (not the start cell)
function placeTreasures(grid, W, H, n, startX, startY) {
  const open = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (grid[y][x] === 0 && !(x === startX && y === startY)) open.push({ x, y });

  const shuffled = [...open].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((p, i) => ({ ...p, id: i, collected: false }));
}

// ─── Level configs ─────────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: { id: "Mudah",    en: "Easy"    }, cols: 17, rows: 17, treasures: 2, vision: 9, tier: 1, showTrail: true  },
  { id: 2, name: { id: "Sedang",   en: "Medium"  }, cols: 25, rows: 25, treasures: 3, vision: 7, tier: 2, showTrail: true  },
  { id: 3, name: { id: "Sulit",    en: "Hard"    }, cols: 33, rows: 33, treasures: 4, vision: 6, tier: 3, showTrail: true  },
  { id: 4, name: { id: "Extreme",  en: "Extreme" }, cols: 41, rows: 41, treasures: 5, vision: 6, tier: 4, showTrail: false },
];

const CELL = 24; // px per cell

function buildLevel(levelIdx) {
  const cfg = LEVELS[levelIdx];
  const { grid, W, H } = generateMaze(cfg.cols, cfg.rows);
  const startX = 1;
  const startY = 1;
  const treasures = placeTreasures(grid, W, H, cfg.treasures, startX, startY);
  return { grid, W, H, startX, startY, treasures };
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function PetualanganLabirinGameClient() {
  const { language } = useLanguage();

  const [screen, setScreen]           = useState("intro"); // intro | playing | win
  const [levelIdx, setLevelIdx]       = useState(0);
  const [state, setState]             = useState(null);
  const [playerPos, setPlayerPos]     = useState({ x: 1, y: 1 });
  const [treasures, setTreasures]     = useState([]);
  const [trail, setTrail]             = useState(new Set());
  const [steps, setSteps]             = useState(0);
  const [startTime, setStartTime]     = useState(null);
  const [elapsed, setElapsed]         = useState(0);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  const cfg = LEVELS[levelIdx];

  // ── Start / reset a level ─────────────────────────────────────────────
  const startLevel = useCallback((idx) => {
    const lvl = buildLevel(idx);
    setState(lvl);
    setPlayerPos({ x: lvl.startX, y: lvl.startY });
    setTreasures(lvl.treasures);
    setTrail(new Set([`${lvl.startX},${lvl.startY}`]));
    setSteps(0);
    setElapsed(0);
    const now = Date.now();
    setStartTime(now);
    setScreen("playing");
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "playing") {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, startTime]);

  // ── Move logic ────────────────────────────────────────────────────────
  const move = useCallback((dx, dy) => {
    if (!state || screen !== "playing") return;
    setPlayerPos(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx < 0 || ny < 0 || nx >= state.W || ny >= state.H) return prev;
      if (state.grid[ny][nx] === 1) return prev;

      const key = `${nx},${ny}`;
      setTrail(t => {
        const next = new Set(t);
        next.add(key);
        return next;
      });
      setSteps(s => s + 1);

      // collect treasure
      setTreasures(prev => {
        const updated = prev.map(tr =>
          tr.x === nx && tr.y === ny && !tr.collected
            ? { ...tr, collected: true }
            : tr
        );
        if (updated.every(tr => tr.collected)) {
          setTimeout(() => setScreen("win"), 200);
        }
        return updated;
      });

      return { x: nx, y: ny };
    });
  }, [state, screen]);

  // ── Keyboard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "playing") return;
    const handler = (e) => {
      const map = {
        ArrowUp: [0, -1], ArrowDown: [0, 1],
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
        W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
      };
      if (map[e.key]) {
        e.preventDefault();
        move(...map[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move, screen]);

  // ── Canvas draw ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !state || screen !== "playing") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { grid, W, H } = state;
    const vr = cfg.vision; // vision radius in cells

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // viewport: center on player, show vr*2+1 cells each axis
    const vpW = vr * 2 + 1;
    const vpH = vr * 2 + 1;
    const offsetX = playerPos.x - vr;
    const offsetY = playerPos.y - vr;

    for (let vy = 0; vy < vpH; vy++) {
      for (let vx = 0; vx < vpW; vx++) {
        const gx = offsetX + vx;
        const gy = offsetY + vy;

        const px = vx * CELL;
        const py = vy * CELL;

        // distance from player (for fog falloff)
        const dist = Math.sqrt((vx - vr) ** 2 + (vy - vr) ** 2);
        const fogAlpha = Math.min(1, dist / (vr + 0.5));

        if (gx < 0 || gy < 0 || gx >= W || gy >= H) {
          // out of bounds — beige fog
          ctx.fillStyle = "#c9b799";
          ctx.fillRect(px, py, CELL, CELL);
        } else {
          const cell = grid[gy][gx];
          const key = `${gx},${gy}`;
          const isTrail = cfg.showTrail && trail.has(key);

          if (cell === 1) {
            // wall — tan/brown color
            ctx.fillStyle = "#a89371";
            ctx.fillRect(px, py, CELL, CELL);
            // wall texture: slight shading
            const grd = ctx.createLinearGradient(px, py, px + CELL, py + CELL);
            grd.addColorStop(0, "rgba(0,0,0,0.08)");
            grd.addColorStop(1, "rgba(0,0,0,0.02)");
            ctx.fillStyle = grd;
            ctx.fillRect(px, py, CELL, CELL);
          } else {
            // floor — beige base
            ctx.fillStyle = "#d9cdb3";
            ctx.fillRect(px, py, CELL, CELL);
            // bright green path
            if (isTrail) {
              ctx.fillStyle = "#b8d96f";
              ctx.fillRect(px, py, CELL, CELL);
            }
          }

          // treasure
          const tr = treasures.find(t => t.x === gx && t.y === gy && !t.collected);
          if (tr && dist < vr) {
            ctx.font = `${CELL - 4}px serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⭐", px + CELL / 2, py + CELL / 2);
          }
        }

        // fog of war gradient overlay (lighter, more subtle)
        if (fogAlpha > 0) {
          ctx.fillStyle = `rgba(201,183,153,${fogAlpha * 0.75})`;
          ctx.fillRect(px, py, CELL, CELL);
        }
      }
    }

    // player — always at center of viewport
    const cx = vr * CELL + CELL / 2;
    const cy = vr * CELL + CELL / 2;
    ctx.font = `${CELL - 2}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧑‍🚀", cx, cy);

    // edge vignette (lighter fog color)
    const radGrd = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    radGrd.addColorStop(0, "rgba(217,205,179,0)");
    radGrd.addColorStop(1, "rgba(201,183,153,0.5)");
    ctx.fillStyle = radGrd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [state, playerPos, treasures, trail, cfg, screen]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const collected = treasures.filter(t => t.collected).length;

  // ── INTRO ─────────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🧑‍🚀</div>
          <h1>{language === "id" ? "Petualangan Labirin" : "Maze Adventure"}</h1>
          <p className={styles.introDesc}>
            {language === "id"
              ? "Bantu astronot menemukan semua bintang di labirin luar angkasa!"
              : "Help the astronaut collect all stars in the space maze!"}
          </p>
          <div className={styles.levelGrid}>
            {LEVELS.map((lv, i) => (
              <button
                key={lv.id}
                className={`${styles.levelCard} ${styles[`tier${lv.tier}`]}`}
                onClick={() => { setLevelIdx(i); startLevel(i); }}
              >
                <div className={styles.tierBadge}>Tier {lv.tier}</div>
                <div className={styles.lvlName}>{lv.name[language] ?? lv.name.id}</div>
                <div className={styles.lvlDetail}>
                  {lv.cols}×{lv.rows} · {lv.treasures} ⭐ · 👁 {lv.vision}
                </div>
              </button>
            ))}
          </div>
          <p className={styles.controlHint}>
            {language === "id"
              ? "Gunakan tombol panah ⬆⬇⬅➡ atau WASD untuk bergerak"
              : "Use arrow keys ⬆⬇⬅➡ or WASD to move"}
          </p>
        </div>
      </div>
    );
  }

  // ── WIN ───────────────────────────────────────────────────────────────
  if (screen === "win") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.winCard}>
          <div className={styles.winEmoji}>🎉</div>
          <h1>{language === "id" ? "Selamat!" : "You Win!"}</h1>
          <p>
            {language === "id"
              ? `Kamu mengumpulkan semua ${cfg.treasures} bintang!`
              : `You collected all ${cfg.treasures} stars!`}
          </p>
          <div className={styles.winStats}>
            <div className={styles.winStat}>
              <span className={styles.winStatVal}>{fmt(elapsed)}</span>
              <span className={styles.winStatLbl}>{language === "id" ? "Waktu" : "Time"}</span>
            </div>
            <div className={styles.winStat}>
              <span className={styles.winStatVal}>{steps}</span>
              <span className={styles.winStatLbl}>{language === "id" ? "Langkah" : "Steps"}</span>
            </div>
          </div>
          <div className={styles.winActions}>
            <button className={styles.btnPrimary} onClick={() => startLevel(levelIdx)}>
              🔄 {language === "id" ? "Main Lagi" : "Play Again"}
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => { setLevelIdx(i => (i + 1) % LEVELS.length); startLevel((levelIdx + 1) % LEVELS.length); }}
            >
              ➡️ {language === "id" ? "Level Berikutnya" : "Next Level"}
            </button>
            <button className={styles.btnGhost} onClick={() => setScreen("intro")}>
              🗺️ {language === "id" ? "Pilih Level" : "Choose Level"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ───────────────────────────────────────────────────────────
  const vpSize = (cfg.vision * 2 + 1) * CELL;

  return (
    <div className={styles.gameWrapper}>
      {/* HUD */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          <span className={styles.hudBadge}>{cfg.name[language] ?? cfg.name.id}</span>
          <span className={styles.hudSteps}>👟 {steps}</span>
        </div>
        <div className={styles.hudCenter}>
          {Array.from({ length: cfg.treasures }, (_, i) => (
            <span key={i} className={i < collected ? styles.starOn : styles.starOff}>⭐</span>
          ))}
        </div>
        <div className={styles.hudRight}>
          <span className={styles.hudTimer}>⏱ {fmt(elapsed)}</span>
          <button className={styles.hudBtn} onClick={() => setScreen("intro")}>🗺️</button>
          <button className={styles.hudBtn} onClick={() => startLevel(levelIdx)}>🔄</button>
        </div>
      </div>

      {/* Canvas viewport */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={vpSize}
          height={vpSize}
          className={styles.canvas}
        />
      </div>

      {/* On-screen joystick */}
      <div className={styles.joystick}>
        <div className={styles.jRow}>
          <button className={styles.jBtn} onClick={() => move(0, -1)}>⬆</button>
        </div>
        <div className={styles.jRow}>
          <button className={styles.jBtn} onClick={() => move(-1, 0)}>⬅</button>
          <button className={`${styles.jBtn} ${styles.jCenter}`}>🧑‍🚀</button>
          <button className={styles.jBtn} onClick={() => move(1, 0)}>➡</button>
        </div>
        <div className={styles.jRow}>
          <button className={styles.jBtn} onClick={() => move(0, 1)}>⬇</button>
        </div>
      </div>

      <div className={styles.hint}>
        {language === "id"
          ? "Kumpulkan semua ⭐ untuk menang!"
          : "Collect all ⭐ to win!"}
      </div>
    </div>
  );
}
