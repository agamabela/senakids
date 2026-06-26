"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
import styles from "./BombermanGameClient.module.css";

const FLOOR = 0;
const WALL = 1;
const CRATE = 2;

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" },     size: 9,  enemies: 2, range: 1, lives: 3, crate: 0.40 },
  { id: 2, name: { id: "Sedang", en: "Medium" },  size: 11, enemies: 3, range: 2, lives: 3, crate: 0.48 },
  { id: 3, name: { id: "Sulit", en: "Hard" },     size: 13, enemies: 4, range: 2, lives: 3, crate: 0.52 },
  { id: 4, name: { id: "Ekstrem", en: "Extreme" },size: 13, enemies: 6, range: 2, lives: 4, crate: 0.58 },
];

const BOMB_FUSE = 1800;
const BLAST_LIFE = 480;
const ENEMY_INTERVAL = 520;
const TICK = 100;
const SPAWN_INVULN = 1600;
const TILE = 32;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLevel(cfg) {
  const N = cfg.size;
  const grid = Array.from({ length: N }, () => Array(N).fill(FLOOR));
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (x === 0 || y === 0 || x === N - 1 || y === N - 1) grid[y][x] = WALL;
      else if (x % 2 === 0 && y % 2 === 0) grid[y][x] = WALL;
    }
  // Guaranteed escape corridor from the (1,1) spawn so a bomb dropped at
  // start is never an inescapable trap (clear both arms beyond blast range).
  const safe = new Set([
    "1,1", "2,1", "3,1", "4,1",
    "1,2", "1,3", "1,4",
    "2,2",
  ]);
  for (let y = 1; y < N - 1; y++)
    for (let x = 1; x < N - 1; x++) {
      if (grid[y][x] !== FLOOR || safe.has(`${x},${y}`)) continue;
      if (Math.random() < cfg.crate) grid[y][x] = CRATE;
    }
  const open = [];
  for (let y = 1; y < N - 1; y++)
    for (let x = 1; x < N - 1; x++)
      if (grid[y][x] === FLOOR && x + y > 6) open.push({ x, y });
  const enemyCells = shuffle(open).slice(0, cfg.enemies);
  const enemies = enemyCells.map((c, i) => ({ id: i, x: c.x, y: c.y }));
  return { grid, N, enemies };
}

export default function BombermanGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [levelIdx, setLevelIdx] = useState(0);
  const [screen, setScreen] = useState("intro");
  const [sceneKey, setSceneKey] = useState(0);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);

  const cfg = LEVELS[levelIdx];
  const canvasRef = useRef(null);

  // game state refs
  const gridRef = useRef(null);
  const NRef = useRef(0);
  const playerRef = useRef({ x: 1, y: 1 });
  const enemiesRef = useRef([]);
  const bombsRef = useRef([]);
  const blastsRef = useRef([]);
  const starsRef = useRef([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const invulnRef = useRef(0);
  const statusRef = useRef("playing");
  const enemyAccRef = useRef(0);

  const start = useCallback((idx) => {
    const c = LEVELS[idx];
    const { grid, N, enemies } = buildLevel(c);
    gridRef.current = grid;
    NRef.current = N;
    playerRef.current = { x: 1, y: 1 };
    enemiesRef.current = enemies;
    bombsRef.current = [];
    blastsRef.current = [];
    starsRef.current = [];
    livesRef.current = c.lives;
    scoreRef.current = 0;
    invulnRef.current = SPAWN_INVULN;
    statusRef.current = "playing";
    enemyAccRef.current = 0;
    setScreen("playing");
    setSceneKey((k) => k + 1);
    rerender();
  }, [rerender]);

  const isBlocked = (x, y) => {
    const g = gridRef.current;
    if (!g) return true;
    if (x < 0 || y < 0 || x >= NRef.current || y >= NRef.current) return true;
    if (g[y][x] === WALL || g[y][x] === CRATE) return true;
    if (bombsRef.current.some((b) => b.x === x && b.y === y)) return true;
    return false;
  };

  const hitPlayer = useCallback(() => {
    if (invulnRef.current > 0) return;
    livesRef.current -= 1;
    invulnRef.current = 1500;
    if (livesRef.current <= 0) {
      statusRef.current = "lose";
      setScreen("lose");
    } else {
      playerRef.current = { x: 1, y: 1 };
    }
  }, []);

  const explode = useCallback((bomb) => {
    const g = gridRef.current;
    const N = NRef.current;
    const cells = [{ x: bomb.x, y: bomb.y }];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    for (const [dx, dy] of dirs) {
      for (let r = 1; r <= bomb.range; r++) {
        const nx = bomb.x + dx * r;
        const ny = bomb.y + dy * r;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N) break;
        if (g[ny][nx] === WALL) break;
        cells.push({ x: nx, y: ny });
        if (g[ny][nx] === CRATE) {
          g[ny][nx] = FLOOR;
          if (Math.random() < 0.25) starsRef.current.push({ x: nx, y: ny });
          break;
        }
      }
    }
    for (const c of cells) blastsRef.current.push({ x: c.x, y: c.y, life: BLAST_LIFE });
    bombsRef.current.forEach((b) => {
      if (b !== bomb && cells.some((c) => c.x === b.x && c.y === b.y)) b.timer = 0;
    });
    let killed = 0;
    enemiesRef.current = enemiesRef.current.filter((e) => {
      const dead = cells.some((c) => c.x === e.x && c.y === e.y);
      if (dead) killed++;
      return !dead;
    });
    if (killed) scoreRef.current += killed * 100;
    if (cells.some((c) => c.x === playerRef.current.x && c.y === playerRef.current.y)) hitPlayer();
    bombsRef.current = bombsRef.current.filter((b) => b !== bomb);
    if (enemiesRef.current.length === 0 && statusRef.current === "playing") {
      statusRef.current = "win";
      setScreen("win");
    }
  }, [hitPlayer]);

  const move = useCallback((dx, dy) => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    const nx = p.x + dx;
    const ny = p.y + dy;
    if (isBlocked(nx, ny)) return;
    p.x = nx;
    p.y = ny;
    setHasChanges(true);
    const si = starsRef.current.findIndex((s) => s.x === nx && s.y === ny);
    if (si !== -1) {
      starsRef.current.splice(si, 1);
      scoreRef.current += 50;
    }
    if (enemiesRef.current.some((e) => e.x === nx && e.y === ny)) hitPlayer();
    rerender();
  }, [setHasChanges, hitPlayer, rerender]);

  const placeBomb = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    if (bombsRef.current.some((b) => b.x === p.x && b.y === p.y)) return;
    if (bombsRef.current.length >= 2) return;
    bombsRef.current.push({ x: p.x, y: p.y, timer: BOMB_FUSE, range: cfg.range });
    rerender();
  }, [cfg.range, rerender]);

  // ── Game logic loop ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const id = setInterval(() => {
      if (statusRef.current !== "playing") return;
      for (const b of [...bombsRef.current]) {
        b.timer -= TICK;
        if (b.timer <= 0) explode(b);
      }
      blastsRef.current = blastsRef.current.filter((bl) => (bl.life -= TICK) > 0);
      if (invulnRef.current > 0) invulnRef.current -= TICK;
      enemyAccRef.current += TICK;
      if (enemyAccRef.current >= ENEMY_INTERVAL) {
        enemyAccRef.current = 0;
        const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        enemiesRef.current.forEach((e) => {
          const opts = dirs
            .map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy }))
            .filter((c) => !isBlocked(c.x, c.y) && !enemiesRef.current.some((o) => o !== e && o.x === c.x && o.y === c.y));
          if (opts.length && Math.random() < 0.85) {
            const pick = opts[Math.floor(Math.random() * opts.length)];
            e.x = pick.x; e.y = pick.y;
          }
        });
        if (enemiesRef.current.some((e) => e.x === playerRef.current.x && e.y === playerRef.current.y)) hitPlayer();
      }
      rerender();
    }, TICK);
    return () => clearInterval(id);
  }, [screen, explode, hitPlayer, rerender]);

  // ── Keyboard ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); move(0, -1); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); move(0, 1); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); move(-1, 0); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); move(1, 0); }
      else if (k === " " || k === "enter") { e.preventDefault(); placeBomb(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, move, placeBomb]);

  // ── 2D pixel-art renderer ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const N = NRef.current;
    const grid = gridRef.current;
    const px = N * TILE;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    // smooth render positions for player + enemies (pixel space)
    const prender = { x: playerRef.current.x * TILE, y: playerRef.current.y * TILE };
    const erender = new Map();

    const px2 = (v) => Math.round(v);

    const drawFloor = (gx, gy) => {
      const checker = (gx + gy) % 2 === 0;
      ctx.fillStyle = checker ? "#7cb342" : "#8bc34a";
      ctx.fillRect(gx * TILE, gy * TILE, TILE, TILE);
      // little grass blades
      ctx.fillStyle = checker ? "#689f38" : "#7cb342";
      ctx.fillRect(gx * TILE + 6, gy * TILE + 22, 3, 5);
      ctx.fillRect(gx * TILE + 20, gy * TILE + 10, 3, 5);
    };

    const drawWall = (gx, gy) => {
      const x = gx * TILE, y = gy * TILE;
      ctx.fillStyle = "#6b7785";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "#7c8a99";
      ctx.fillRect(x + 2, y + 2, TILE - 4, 10);
      ctx.fillStyle = "#566270";
      ctx.fillRect(x + 2, y + TILE - 8, TILE - 4, 6);
      // brick seams
      ctx.fillStyle = "#4d5763";
      ctx.fillRect(x, y + TILE / 2 - 1, TILE, 2);
      ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE / 2);
      ctx.fillRect(x + TILE / 4, y + TILE / 2, 2, TILE / 2);
    };

    const drawCrate = (gx, gy) => {
      const x = gx * TILE, y = gy * TILE;
      drawFloor(gx, gy);
      ctx.fillStyle = "#c0863c";
      ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
      ctx.fillStyle = "#a86c28";
      ctx.fillRect(x + 3, y + 3, TILE - 6, 5);
      ctx.strokeStyle = "#7a4d18";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + TILE - 4, y + TILE - 4);
      ctx.moveTo(x + TILE - 4, y + 4); ctx.lineTo(x + 4, y + TILE - 4);
      ctx.stroke();
    };

    const drawStar = (gx, gy, now) => {
      const cx = gx * TILE + TILE / 2;
      const cy = gy * TILE + TILE / 2 + Math.sin(now * 0.005) * 3;
      const r = 9, ri = 4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(now * 0.002);
      ctx.fillStyle = "#ffd54f";
      ctx.strokeStyle = "#ffb300";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        const rr = i % 2 === 0 ? r : ri;
        ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(ang) * rr, Math.sin(ang) * rr);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const drawBomb = (b, now) => {
      const cx = b.x * TILE + TILE / 2;
      const cy = b.y * TILE + TILE / 2;
      const pulse = 1 + Math.sin(now * 0.012) * 0.12;
      const r = 11 * pulse;
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(cx, cy + 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4d4d4d";
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 1, 3, 0, Math.PI * 2);
      ctx.fill();
      // fuse
      ctx.strokeStyle = "#8d6e63";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 5, cy - r + 2);
      ctx.lineTo(cx + 9, cy - r - 4);
      ctx.stroke();
      ctx.fillStyle = Math.floor(now / 120) % 2 ? "#ff9800" : "#ffeb3b";
      ctx.beginPath();
      ctx.arc(cx + 9, cy - r - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBlast = (bl) => {
      const cx = bl.x * TILE + TILE / 2;
      const cy = bl.y * TILE + TILE / 2;
      const f = bl.life / BLAST_LIFE;
      const r = (TILE / 2) * (0.6 + f * 0.5);
      ctx.fillStyle = `rgba(255,152,0,${0.45 + f * 0.4})`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,235,59,${0.5 + f * 0.4})`;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.4 * f})`;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill();
    };

    const drawPlayer = (rx, ry, now) => {
      if (invulnRef.current > 0 && Math.floor(now / 120) % 2 === 0) return;
      const x = rx, y = ry;
      // body
      ctx.fillStyle = "#42a5f5";
      ctx.fillRect(x + 9, y + 14, 14, 13);
      ctx.fillStyle = "#1e88e5";
      ctx.fillRect(x + 9, y + 23, 14, 4);
      // head
      ctx.fillStyle = "#eceff1";
      ctx.fillRect(x + 8, y + 5, 16, 11);
      ctx.fillStyle = "#cfd8dc";
      ctx.fillRect(x + 8, y + 13, 16, 3);
      // eyes
      ctx.fillStyle = "#222";
      ctx.fillRect(x + 12, y + 8, 3, 4);
      ctx.fillRect(x + 18, y + 8, 3, 4);
      // antenna
      ctx.fillStyle = "#90a4ae";
      ctx.fillRect(x + 15, y + 1, 2, 5);
      ctx.fillStyle = "#ff5252";
      ctx.fillRect(x + 14, y - 2, 4, 4);
    };

    const drawEnemy = (rx, ry, now, id) => {
      const x = rx, y = ry;
      const bob = Math.abs(Math.sin(now * 0.006 + id)) * 3;
      // body
      ctx.fillStyle = "#ab47bc";
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2 - bob, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8e24aa";
      ctx.fillRect(x + 8, y + TILE / 2 - bob, 16, 8);
      // feet
      ctx.fillStyle = "#6a1b9a";
      ctx.fillRect(x + 9, y + 24 - bob, 5, 4);
      ctx.fillRect(x + 18, y + 24 - bob, 5, 4);
      // eyes
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x + 12, y + 13 - bob, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 20, y + 13 - bob, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath(); ctx.arc(x + 13, y + 13 - bob, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 21, y + 13 - bob, 2, 0, Math.PI * 2); ctx.fill();
    };

    let raf;
    const lerp = (a, b, f) => a + (b - a) * f;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = Date.now();

      // tiles
      for (let gy = 0; gy < N; gy++)
        for (let gx = 0; gx < N; gx++) {
          const cell = grid[gy][gx];
          if (cell === WALL) drawWall(gx, gy);
          else if (cell === CRATE) drawCrate(gx, gy);
          else drawFloor(gx, gy);
        }

      // stars
      starsRef.current.forEach((s) => drawStar(s.x, s.y, now));
      // bombs
      bombsRef.current.forEach((b) => drawBomb(b, now));

      // enemies (smooth)
      const liveIds = new Set(enemiesRef.current.map((e) => e.id));
      for (const id of [...erender.keys()]) if (!liveIds.has(id)) erender.delete(id);
      enemiesRef.current.forEach((e) => {
        let r = erender.get(e.id);
        if (!r) { r = { x: e.x * TILE, y: e.y * TILE }; erender.set(e.id, r); }
        r.x = lerp(r.x, e.x * TILE, 0.25);
        r.y = lerp(r.y, e.y * TILE, 0.25);
        drawEnemy(px2(r.x), px2(r.y), now, e.id);
      });

      // player (smooth)
      prender.x = lerp(prender.x, playerRef.current.x * TILE, 0.3);
      prender.y = lerp(prender.y, playerRef.current.y * TILE, 0.3);
      drawPlayer(px2(prender.x), px2(prender.y), now);

      // blasts on top
      blastsRef.current.forEach((bl) => drawBlast(bl));
    };
    frame();

    return () => cancelAnimationFrame(raf);
  }, [screen, sceneKey]);

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>💣🤖</div>
          <h1>{t("Si Bom Pintar", "Smart Bomber")}</h1>
          <p className={styles.introDesc}>
            {t("Letakkan bom untuk menghancurkan peti dan kalahkan semua monster!",
               "Drop bombs to smash crates and defeat all the monsters!")}
          </p>
          <div className={styles.levelGrid}>
            {LEVELS.map((lv, i) => (
              <button key={lv.id} className={`${styles.levelCard} ${styles[`tier${lv.id}`]}`} onClick={() => { setLevelIdx(i); start(i); }}>
                <div className={styles.tierBadge}>Level {lv.id}</div>
                <div className={styles.lvlName}>{lv.name[language] ?? lv.name.id}</div>
                <div className={styles.lvlDetail}>{lv.size}×{lv.size} · 👾 {lv.enemies}</div>
              </button>
            ))}
          </div>
          <p className={styles.controlHint}>
            {t("Panah/WASD untuk gerak, SPASI untuk bom. Di HP pakai tombol di layar (💣 di tengah).",
               "Arrows/WASD to move, SPACE for bomb. On mobile use the on-screen pad (💣 in the center).")}
          </p>
        </div>
      </div>
    );
  }

  // ── WIN / LOSE ──
  if (screen === "win" || screen === "lose") {
    const won = screen === "win";
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>{won ? "🏆🎉" : "💥😵"}</div>
          <h1>{won ? t("Menang!", "You Win!") : t("Kalah!", "Game Over!")}</h1>
          <p className={styles.introDesc}>
            {won ? t("Semua monster kalah! Skor: ", "All monsters defeated! Score: ")
                 : t("Coba lagi ya! Skor: ", "Try again! Score: ")}
            <strong>{scoreRef.current}</strong>
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={() => start(levelIdx)}>
              🔄 {t("Main Lagi", "Play Again")}
            </button>
            {won && (
              <button className={styles.btnSecondary} onClick={() => { const n = (levelIdx + 1) % LEVELS.length; setLevelIdx(n); start(n); }}>
                ➡️ {t("Level Berikutnya", "Next Level")}
              </button>
            )}
            <button className={styles.btnGhost} onClick={() => setScreen("intro")}>
              🏠 {t("Menu", "Menu")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.pill}>❤️ {livesRef.current}</div>
        <div className={styles.pill}>⭐ {scoreRef.current}</div>
        <div className={styles.pill}>👾 {enemiesRef.current.length}</div>
        <div className={styles.pillTier}>{t("Tingkat", "Level")}: {cfg.name[language] ?? cfg.name.id}</div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>← {t("Menu", "Menu")}</button>
      </div>

      <div className={styles.viewport}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* D-pad with bomb in the center */}
      <DPad
        onUp={() => move(0, -1)}
        onDown={() => move(0, 1)}
        onLeft={() => move(-1, 0)}
        onRight={() => move(1, 0)}
        onCenter={placeBomb}
        centerLabel="💣"
      />
    </div>
  );
}
