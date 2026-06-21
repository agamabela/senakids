"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
import styles from "./BombermanGameClient.module.css";

// Cell types
const FLOOR = 0;
const WALL = 1;  // indestructible
const CRATE = 2; // destructible

const LEVELS = [
  { id: 1, name: { id: "Mudah", en: "Easy" },     size: 9,  enemies: 2, range: 1, lives: 3, crate: 0.45 },
  { id: 2, name: { id: "Sedang", en: "Medium" },  size: 11, enemies: 3, range: 2, lives: 3, crate: 0.5 },
  { id: 3, name: { id: "Sulit", en: "Hard" },     size: 13, enemies: 4, range: 2, lives: 3, crate: 0.55 },
  { id: 4, name: { id: "Ekstrem", en: "Extreme" },size: 13, enemies: 6, range: 2, lives: 4, crate: 0.6 },
];

const BOMB_FUSE = 1800;     // ms before a bomb explodes
const BLAST_LIFE = 480;     // ms an explosion tile stays
const ENEMY_INTERVAL = 520; // ms between enemy moves
const TICK = 100;           // ms game tick

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a level: walls border + pillars, random crates, enemies far from start.
function buildLevel(cfg) {
  const N = cfg.size;
  const grid = Array.from({ length: N }, () => Array(N).fill(FLOOR));

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (x === 0 || y === 0 || x === N - 1 || y === N - 1) grid[y][x] = WALL;
      else if (x % 2 === 0 && y % 2 === 0) grid[y][x] = WALL; // pillars
    }
  }

  // Keep the player's starting corner clear
  const safe = new Set(["1,1", "1,2", "2,1"]);

  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) {
      if (grid[y][x] !== FLOOR) continue;
      if (safe.has(`${x},${y}`)) continue;
      if (Math.random() < cfg.crate) grid[y][x] = CRATE;
    }
  }

  // Spawn enemies on open floor far from the start
  const open = [];
  for (let y = 1; y < N - 1; y++)
    for (let x = 1; x < N - 1; x++)
      if (grid[y][x] === FLOOR && x + y > 5) open.push({ x, y });

  const enemyCells = shuffle(open).slice(0, cfg.enemies);
  const enemies = enemyCells.map((c, i) => ({ id: i, x: c.x, y: c.y, alive: true }));

  return { grid, N, enemies };
}

export default function BombermanGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [levelIdx, setLevelIdx] = useState(0);
  const [screen, setScreen] = useState("intro"); // intro | playing | win | lose
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);

  const cfg = LEVELS[levelIdx];

  // authoritative game state in refs (so the loop never reads stale state)
  const gridRef = useRef(null);
  const NRef = useRef(0);
  const playerRef = useRef({ x: 1, y: 1 });
  const enemiesRef = useRef([]);
  const bombsRef = useRef([]);      // {x,y,timer,range}
  const blastsRef = useRef([]);     // {x,y,life}
  const starsRef = useRef([]);      // {x,y}
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
    invulnRef.current = 0;
    statusRef.current = "playing";
    enemyAccRef.current = 0;
    setScreen("playing");
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
          break; // crate stops the blast
        }
      }
    }

    // add blast tiles
    for (const c of cells) blastsRef.current.push({ x: c.x, y: c.y, life: BLAST_LIFE });

    // chain other bombs caught in the blast
    bombsRef.current.forEach((b) => {
      if (b !== bomb && cells.some((c) => c.x === b.x && c.y === b.y)) b.timer = 0;
    });

    // kill enemies in the blast
    let killed = 0;
    enemiesRef.current = enemiesRef.current.filter((e) => {
      const dead = cells.some((c) => c.x === e.x && c.y === e.y);
      if (dead) killed++;
      return !dead;
    });
    if (killed) scoreRef.current += killed * 100;

    // player caught?
    if (cells.some((c) => c.x === playerRef.current.x && c.y === playerRef.current.y)) {
      hitPlayer();
    }

    // remove this bomb
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
    // collect star
    const si = starsRef.current.findIndex((s) => s.x === nx && s.y === ny);
    if (si !== -1) {
      starsRef.current.splice(si, 1);
      scoreRef.current += 50;
    }
    // ran into an enemy?
    if (enemiesRef.current.some((e) => e.x === nx && e.y === ny)) hitPlayer();
    rerender();
  }, [setHasChanges, hitPlayer, rerender]);

  const placeBomb = useCallback(() => {
    if (statusRef.current !== "playing") return;
    const p = playerRef.current;
    if (bombsRef.current.some((b) => b.x === p.x && b.y === p.y)) return;
    if (bombsRef.current.length >= 2) return; // max 2 bombs
    bombsRef.current.push({ x: p.x, y: p.y, timer: BOMB_FUSE, range: cfg.range });
    rerender();
  }, [cfg.range, rerender]);

  // Game loop
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const id = setInterval(() => {
      if (statusRef.current !== "playing") return;

      // bombs
      for (const b of [...bombsRef.current]) {
        b.timer -= TICK;
        if (b.timer <= 0) explode(b);
      }
      // blasts
      blastsRef.current = blastsRef.current.filter((bl) => (bl.life -= TICK) > 0);
      // invuln
      if (invulnRef.current > 0) invulnRef.current -= TICK;

      // enemy movement
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
            e.x = pick.x;
            e.y = pick.y;
          }
        });
        // enemy touched player?
        if (enemiesRef.current.some((e) => e.x === playerRef.current.x && e.y === playerRef.current.y)) {
          hitPlayer();
        }
      }
      rerender();
    }, TICK);
    return () => clearInterval(id);
  }, [screen, explode, hitPlayer, rerender]);

  // Keyboard
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
            {t("Panah/WASD untuk gerak, SPASI untuk bom. Di HP pakai tombol di layar.",
               "Arrows/WASD to move, SPACE for bomb. On mobile use the on-screen buttons.")}
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
  const grid = gridRef.current;
  const N = NRef.current;
  const p = playerRef.current;
  const blastSet = new Set(blastsRef.current.map((b) => `${b.x},${b.y}`));
  const bombMap = new Map(bombsRef.current.map((b) => [`${b.x},${b.y}`, b]));
  const starSet = new Set(starsRef.current.map((s) => `${s.x},${s.y}`));
  const enemyMap = new Map(enemiesRef.current.map((e) => [`${e.x},${e.y}`, e]));

  const cellContent = (x, y) => {
    const key = `${x},${y}`;
    if (blastSet.has(key)) return { cls: styles.blast, txt: "💥" };
    if (p.x === x && p.y === y) return { cls: styles.player, txt: invulnRef.current > 0 ? "😣" : "🤖" };
    if (enemyMap.has(key)) return { cls: styles.enemy, txt: "👾" };
    if (bombMap.has(key)) return { cls: styles.bomb, txt: "💣" };
    if (starSet.has(key)) return { cls: styles.star, txt: "⭐" };
    if (grid[y][x] === WALL) return { cls: styles.wall, txt: "" };
    if (grid[y][x] === CRATE) return { cls: styles.crate, txt: "" };
    return { cls: styles.floor, txt: "" };
  };

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.pill}>❤️ {livesRef.current}</div>
        <div className={styles.pill}>⭐ {scoreRef.current}</div>
        <div className={styles.pill}>👾 {enemiesRef.current.length}</div>
        <div className={styles.pillTier}>{t("Tingkat", "Level")}: {cfg.name[language] ?? cfg.name.id}</div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>← {t("Menu", "Menu")}</button>
      </div>

      <div className={styles.boardPanel}>
        <div
          className={styles.board}
          style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, width: `min(92vw, ${N * 40}px)` }}
        >
          {grid.map((row, y) =>
            row.map((_, x) => {
              const { cls, txt } = cellContent(x, y);
              return (
                <div key={`${x},${y}`} className={`${styles.cell} ${cls}`}>
                  {txt}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bomb button (bottom-left) */}
      <button className={styles.bombBtn} onClick={placeBomb} aria-label="Letakkan bom">
        💣
      </button>

      {/* Movement D-pad (bottom-right) */}
      <DPad
        onUp={() => move(0, -1)}
        onDown={() => move(0, 1)}
        onLeft={() => move(-1, 0)}
        onRight={() => move(1, 0)}
      />
    </div>
  );
}
