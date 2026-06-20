"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./PetualanganLabirinGameClient.module.css";

// ─── Maze generator (recursive backtracker, iterative to avoid stack limits) ─
function generateMaze(cols, rows) {
  const W = cols % 2 === 0 ? cols + 1 : cols;
  const H = rows % 2 === 0 ? rows + 1 : rows;
  const grid = Array.from({ length: H }, () => Array(W).fill(1));
  const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
  const inBounds = (x, y) => x > 0 && y > 0 && x < W - 1 && y < H - 1;

  const stack = [{ x: 1, y: 1 }];
  grid[1][1] = 0;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const opts = [];
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (inBounds(nx, ny) && grid[ny][nx] === 1) opts.push([dx, dy, nx, ny]);
    }
    if (opts.length) {
      const [dx, dy, nx, ny] = opts[Math.floor(Math.random() * opts.length)];
      grid[cur.y + dy / 2][cur.x + dx / 2] = 0;
      grid[ny][nx] = 0;
      stack.push({ x: nx, y: ny });
    } else {
      stack.pop();
    }
  }
  return { grid, W, H };
}

function placeTreasures(grid, W, H, n, startX, startY) {
  const open = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (grid[y][x] === 0 && !(x === startX && y === startY)) open.push({ x, y });
  // prefer cells far from the start so kids must explore
  open.sort((a, b) => {
    const da = Math.abs(a.x - startX) + Math.abs(a.y - startY);
    const db = Math.abs(b.x - startX) + Math.abs(b.y - startY);
    return db - da;
  });
  const pool = open.slice(0, Math.max(n * 3, 8));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n).map((p, i) => ({ ...p, id: i, collected: false }));
}

// ─── Level configs ─────────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, name: { id: "Mudah",   en: "Easy"   }, cols: 13, rows: 13, gems: 3, reveal: 3, tier: 1 },
  { id: 2, name: { id: "Sedang",  en: "Medium" }, cols: 19, rows: 19, gems: 4, reveal: 3, tier: 2 },
  { id: 3, name: { id: "Sulit",   en: "Hard"   }, cols: 27, rows: 27, gems: 4, reveal: 2, tier: 3 },
  { id: 4, name: { id: "Ekstrem", en: "Extreme"}, cols: 35, rows: 35, gems: 5, reveal: 2, tier: 4 },
];

const BOARD_W = 660;
const BOARD_H = 470;

function buildLevel(levelIdx) {
  const cfg = LEVELS[levelIdx];
  const { grid, W, H } = generateMaze(cfg.cols, cfg.rows);
  const startX = 1;
  const startY = 1;
  const treasures = placeTreasures(grid, W, H, cfg.gems, startX, startY);
  return { grid, W, H, startX, startY, treasures };
}

// soft "blip" used for footsteps / pickups
function playBlip(freq, dur = 0.08, type = "sine", vol = 0.12) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!playBlip._ctx) playBlip._ctx = new Ctx();
    const ctx = playBlip._ctx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) {
    /* ignore */
  }
}

export default function PetualanganLabirinGameClient() {
  const { language } = useLanguage();

  const [screen, setScreen]       = useState("intro");
  const [levelIdx, setLevelIdx]   = useState(0);
  const [state, setState]         = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [treasures, setTreasures] = useState([]);
  const [explored, setExplored]   = useState(new Set());
  const [steps, setSteps]         = useState(0);
  const canvasRef = useRef(null);

  const cfg = LEVELS[levelIdx];

  const revealAround = useCallback((set, cx, cy, grid, W, H, r) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        if (Math.abs(dx) + Math.abs(dy) > r + 1) continue;
        set.add(`${x},${y}`);
      }
    }
  }, []);

  const startLevel = useCallback((idx) => {
    const lvl = buildLevel(idx);
    setState(lvl);
    setPlayerPos({ x: lvl.startX, y: lvl.startY });
    setTreasures(lvl.treasures);
    const set = new Set();
    revealAround(set, lvl.startX, lvl.startY, lvl.grid, lvl.W, lvl.H, LEVELS[idx].reveal);
    setExplored(set);
    setSteps(0);
    setScreen("playing");
  }, [revealAround]);

  const move = useCallback((dx, dy) => {
    if (!state || screen !== "playing") return;
    setPlayerPos((prev) => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx < 0 || ny < 0 || nx >= state.W || ny >= state.H) return prev;
      if (state.grid[ny][nx] === 1) return prev;

      playBlip(180 + Math.random() * 40, 0.06, "triangle", 0.08); // footstep

      setExplored((old) => {
        const set = new Set(old);
        revealAround(set, nx, ny, state.grid, state.W, state.H, cfg.reveal);
        return set;
      });
      setSteps((s) => s + 1);

      setTreasures((old) => {
        let picked = false;
        const updated = old.map((tr) => {
          if (tr.x === nx && tr.y === ny && !tr.collected) {
            picked = true;
            return { ...tr, collected: true };
          }
          return tr;
        });
        if (picked) playBlip(880, 0.18, "sine", 0.18);
        if (updated.every((tr) => tr.collected)) {
          playBlip(1320, 0.4, "sine", 0.2);
          setTimeout(() => setScreen("win"), 250);
        }
        return updated;
      });

      return { x: nx, y: ny };
    });
  }, [state, screen, cfg, revealAround]);

  useEffect(() => {
    if (screen !== "playing") return;
    const handler = (e) => {
      const map = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
        W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
      };
      if (map[e.key]) { e.preventDefault(); move(...map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move, screen]);

  // ── Canvas draw: full board with persistent fog of war ──
  useEffect(() => {
    if (!canvasRef.current || !state || screen !== "playing") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { grid, W, H } = state;

    const cell = Math.floor(Math.min(BOARD_W, BOARD_H) / Math.max(W, H));
    const mazeW = cell * W;
    const mazeH = cell * H;
    const ox = Math.floor((BOARD_W - mazeW) / 2);
    const oy = Math.floor((BOARD_H - mazeH) / 2);

    // page-beige background
    ctx.fillStyle = "#e7dcc0";
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const px = ox + x * cell;
        const py = oy + y * cell;
        const seen = explored.has(`${x},${y}`);
        if (seen) {
          if (grid[y][x] === 1) {
            ctx.fillStyle = "#8aa54e"; // explored wall — olive green
          } else {
            ctx.fillStyle = "#f1ead0"; // explored floor — pale cream
          }
        } else {
          ctx.fillStyle = "#ddd0ad"; // unexplored fog — flat beige
        }
        ctx.fillRect(px, py, cell, cell);
      }
    }

    // gems act as beacons — visible even through fog (dark teal squares)
    treasures.forEach((tr) => {
      if (tr.collected) return;
      const px = ox + tr.x * cell;
      const py = oy + tr.y * cell;
      const seen = explored.has(`${tr.x},${tr.y}`);
      ctx.fillStyle = seen ? "#1f7a6b" : "#39786e";
      const inset = Math.max(2, cell * 0.18);
      ctx.fillRect(px + inset, py + inset, cell - inset * 2, cell - inset * 2);
      // little shine
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(px + inset + 1, py + inset + 1, Math.max(1, (cell - inset * 2) / 3), Math.max(1, (cell - inset * 2) / 3));
    });

    // player — white rounded blob with eyes
    const cx = ox + playerPos.x * cell + cell / 2;
    const cy = oy + playerPos.y * cell + cell / 2;
    const r = cell * 0.42;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#333";
    const er = Math.max(1, cell * 0.07);
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.1, er, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.35, cy - r * 0.1, er, 0, Math.PI * 2);
    ctx.fill();
  }, [state, playerPos, treasures, explored, screen]);

  const collected = treasures.filter((t) => t.collected).length;
  const diffName = (lv) => lv.name[language] ?? lv.name.id;

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🐭💎</div>
          <h1>{language === "id" ? "Petualangan Labirin" : "Maze Adventure"}</h1>
          <p className={styles.introDesc}>
            {language === "id"
              ? "Jelajahi labirin dan kumpulkan semua permata yang berkilau!"
              : "Explore the maze and collect all the shiny gems!"}
          </p>
          <div className={styles.levelGrid}>
            {LEVELS.map((lv, i) => (
              <button
                key={lv.id}
                className={`${styles.levelCard} ${styles[`tier${lv.tier}`]}`}
                onClick={() => { setLevelIdx(i); startLevel(i); }}
              >
                <div className={styles.tierBadge}>Tier {lv.tier}</div>
                <div className={styles.lvlName}>{diffName(lv)}</div>
                <div className={styles.lvlDetail}>{lv.cols}×{lv.rows} · {lv.gems} 💎</div>
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

  // ── WIN ──
  if (screen === "win") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.winCard}>
          <div className={styles.winEmoji}>🎉💎</div>
          <h1>{language === "id" ? "Selamat!" : "You Win!"}</h1>
          <p>
            {language === "id"
              ? `Kamu mengumpulkan semua ${cfg.gems} permata!`
              : `You collected all ${cfg.gems} gems!`}
          </p>
          <div className={styles.winStats}>
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
              onClick={() => { const n = (levelIdx + 1) % LEVELS.length; setLevelIdx(n); startLevel(n); }}
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

  // ── PLAYING ──
  return (
    <div className={styles.gameWrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.gemPill}>💎 {collected} / {cfg.gems}</div>
        <div className={styles.tierPill}>
          {language === "id" ? "Tingkat" : "Level"}: {diffName(cfg)}
        </div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>
          ← {language === "id" ? "Menu" : "Menu"}
        </button>
      </div>

      {/* Board */}
      <div className={styles.boardPanel}>
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className={styles.canvas}
        />
      </div>

      {/* Arrow controls */}
      <div className={styles.padCard}>
        <button className={`${styles.padBtn} ${styles.padUp}`} onClick={() => move(0, -1)} aria-label="Atas">↑</button>
        <button className={`${styles.padBtn} ${styles.padLeft}`} onClick={() => move(-1, 0)} aria-label="Kiri">←</button>
        <button className={`${styles.padBtn} ${styles.padDown}`} onClick={() => move(0, 1)} aria-label="Bawah">↓</button>
        <button className={`${styles.padBtn} ${styles.padRight}`} onClick={() => move(1, 0)} aria-label="Kanan">→</button>
      </div>
    </div>
  );
}
