"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import DPad from "@/components/DPad";
import styles from "./SnakeGameClient.module.css";

const GRID = 17;
const TILE = 24;
const START_SPEED = 220;   // ms per step
const MIN_SPEED = 90;

// cute fruits drawn with simple pixel shapes
const FRUITS = ["apple", "cherry", "orange", "berry"];

function randCell(occupied) {
  const free = [];
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++)
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)];
}

export default function SnakeGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("intro");
  const [sceneKey, setSceneKey] = useState(0);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);

  const canvasRef = useRef(null);

  const snakeRef = useRef([]);
  const dirRef = useRef({ x: 1, y: 0 });
  const queueRef = useRef([]);       // queued direction changes
  const fruitRef = useRef(null);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const speedRef = useRef(START_SPEED);
  const statusRef = useRef("playing");

  const start = useCallback(() => {
    const mid = Math.floor(GRID / 2);
    snakeRef.current = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    dirRef.current = { x: 1, y: 0 };
    queueRef.current = [];
    scoreRef.current = 0;
    speedRef.current = START_SPEED;
    statusRef.current = "playing";
    const occ = new Set(snakeRef.current.map((s) => `${s.x},${s.y}`));
    const cell = randCell(occ);
    fruitRef.current = { ...cell, type: FRUITS[Math.floor(Math.random() * FRUITS.length)] };
    setScreen("playing");
    setSceneKey((k) => k + 1);
    rerender();
  }, [rerender]);

  const turn = useCallback((nx, ny) => {
    if (statusRef.current !== "playing") return;
    // base direction = last queued or current
    const last = queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : dirRef.current;
    // disallow direct reversal
    if (last.x === -nx && last.y === -ny) return;
    if (last.x === nx && last.y === ny) return;
    if (queueRef.current.length < 2) queueRef.current.push({ x: nx, y: ny });
  }, []);

  // ── Game step loop ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    let timer;
    const step = () => {
      if (statusRef.current !== "playing") return;
      if (queueRef.current.length) dirRef.current = queueRef.current.shift();
      const snake = snakeRef.current;
      const head = snake[0];
      const nh = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      // wall collision
      if (nh.x < 0 || nh.y < 0 || nh.x >= GRID || nh.y >= GRID) {
        statusRef.current = "lose";
        bestRef.current = Math.max(bestRef.current, scoreRef.current);
        setScreen("lose");
        return;
      }
      // self collision (ignore tail tip which will move, unless growing)
      const willEat = fruitRef.current && nh.x === fruitRef.current.x && nh.y === fruitRef.current.y;
      const body = willEat ? snake : snake.slice(0, -1);
      if (body.some((s) => s.x === nh.x && s.y === nh.y)) {
        statusRef.current = "lose";
        bestRef.current = Math.max(bestRef.current, scoreRef.current);
        setScreen("lose");
        return;
      }

      snake.unshift(nh);
      if (willEat) {
        scoreRef.current += 10;
        setHasChanges(true);
        speedRef.current = Math.max(MIN_SPEED, START_SPEED - Math.floor(scoreRef.current / 10) * 8);
        const occ = new Set(snake.map((s) => `${s.x},${s.y}`));
        const cell = randCell(occ);
        fruitRef.current = cell ? { ...cell, type: FRUITS[Math.floor(Math.random() * FRUITS.length)] } : null;
        if (!fruitRef.current) {
          statusRef.current = "win";
          bestRef.current = Math.max(bestRef.current, scoreRef.current);
          setScreen("win");
          return;
        }
      } else {
        snake.pop();
      }
      rerender();
      timer = setTimeout(step, speedRef.current);
    };
    timer = setTimeout(step, speedRef.current);
    return () => clearTimeout(timer);
  }, [screen, sceneKey, setHasChanges, rerender]);

  // ── Keyboard ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) { e.preventDefault(); turn(0, -1); }
      else if (["arrowdown", "s"].includes(k)) { e.preventDefault(); turn(0, 1); }
      else if (["arrowleft", "a"].includes(k)) { e.preventDefault(); turn(-1, 0); }
      else if (["arrowright", "d"].includes(k)) { e.preventDefault(); turn(1, 0); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, turn]);

  // ── 2D pixel renderer ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const px = GRID * TILE;
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const drawFruit = (f, now) => {
      const cx = f.x * TILE + TILE / 2;
      const cy = f.y * TILE + TILE / 2;
      const bob = Math.sin(now * 0.006) * 2;
      const colors = { apple: "#e53935", cherry: "#d81b60", orange: "#fb8c00", berry: "#5e35b1" };
      ctx.fillStyle = colors[f.type] || "#e53935";
      ctx.beginPath();
      ctx.arc(cx, cy + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      // shine
      ctx.fillStyle = "rgba(255,255,255,.55)";
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // leaf/stem
      ctx.fillStyle = "#6d4c41";
      ctx.fillRect(cx - 1, cy - 11 + bob, 2, 4);
      ctx.fillStyle = "#43a047";
      ctx.beginPath();
      ctx.ellipse(cx + 4, cy - 9 + bob, 4, 2.4, -0.6, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = Date.now();

      // board: checkerboard grass
      for (let y = 0; y < GRID; y++)
        for (let x = 0; x < GRID; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#aed581" : "#9ccc65";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }

      if (fruitRef.current) drawFruit(fruitRef.current, now);

      // snake
      const snake = snakeRef.current;
      snake.forEach((seg, i) => {
        const x = seg.x * TILE, y = seg.y * TILE;
        const isHead = i === 0;
        ctx.fillStyle = isHead ? "#2e7d32" : (i % 2 ? "#43a047" : "#4caf50");
        const pad = isHead ? 1 : 2;
        // rounded-ish body block
        ctx.fillRect(x + pad, y + pad, TILE - pad * 2, TILE - pad * 2);
        if (isHead) {
          // eyes facing direction
          const d = dirRef.current;
          ctx.fillStyle = "#fff";
          const ex = TILE / 2, ey = TILE / 2;
          const ox = d.x * 5, oy = d.y * 5;
          const px1 = x + ex - 4 + ox * 0.6, px2 = x + ex + 4 + ox * 0.6;
          const pyy = y + ey - 4 + oy * 0.6;
          ctx.beginPath(); ctx.arc(px1, pyy, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(px2, pyy, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#111";
          ctx.beginPath(); ctx.arc(px1 + d.x * 1.2, pyy + d.y * 1.2, 1.6, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(px2 + d.x * 1.2, pyy + d.y * 1.2, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      });
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [screen, sceneKey]);

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🐍🍎</div>
          <h1>{t("Ular Pintar", "Smart Snake")}</h1>
          <p className={styles.introDesc}>
            {t("Makan buah untuk tumbuh panjang! Jangan menabrak dinding atau tubuhmu sendiri.",
               "Eat fruit to grow longer! Don't hit the walls or your own tail.")}
          </p>
          <button className={styles.btnPrimary} onClick={start}>
            ▶️ {t("Mulai Main", "Start Game")}
          </button>
          <p className={styles.controlHint}>
            {t("Panah/WASD untuk gerak. Di HP pakai tombol di layar.",
               "Arrows/WASD to move. On mobile use the on-screen pad.")}
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
          <div className={styles.introEmoji}>{won ? "🏆🎉" : "🐍💥"}</div>
          <h1>{won ? t("Hebat!", "Awesome!") : t("Aduh!", "Oops!")}</h1>
          <p className={styles.introDesc}>
            {won ? t("Layar penuh! Skor: ", "You filled the board! Score: ")
                 : t("Coba lagi ya! Skor: ", "Try again! Score: ")}
            <strong>{scoreRef.current}</strong>
            <br />
            <span className={styles.best}>🏅 {t("Terbaik", "Best")}: {bestRef.current}</span>
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={start}>
              🔄 {t("Main Lagi", "Play Again")}
            </button>
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
        <div className={styles.pill}>⭐ {scoreRef.current}</div>
        <div className={styles.pill}>📏 {snakeRef.current.length}</div>
        <div className={styles.pill}>🏅 {bestRef.current}</div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>← {t("Menu", "Menu")}</button>
      </div>

      <div className={styles.viewport}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <DPad
        onUp={() => turn(0, -1)}
        onDown={() => turn(0, 1)}
        onLeft={() => turn(-1, 0)}
        onRight={() => turn(1, 0)}
      />
    </div>
  );
}
