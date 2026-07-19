"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./PlatformerGameClient.module.css";

/* ═══════════════════════════════════════════════════════════════════════════
 * LEVEL DATA
 * ---------------------------------------------------------------------------
 * Each level is a plain object so new levels can be added without touching the
 * game logic. Coordinates are in "world pixels". The world is scrolled by a
 * camera that follows the player.
 *
 *   width        total level width in px (height is fixed at WORLD_H)
 *   start        { x, y } player spawn (also the first checkpoint)
 *   platforms    [{ x, y, w, h }] solid ground/blocks (top surface is landable)
 *   coins        [{ x, y }] collectible stars
 *   creatures    [{ x, y, range }] friendly hoppers; patrol +/- range on X
 *   goal         { x, y } flag position; touch it to clear the level
 * ═══════════════════════════════════════════════════════════════════════════ */

const WORLD_H = 360;          // logical world height (matches canvas aspect)
const TILE = 40;              // ground thickness reference
const COIN_R = 12;            // coin radius
const PLAYER_W = 30;
const PLAYER_H = 34;
const CREATURE_W = 34;
const CREATURE_H = 30;

const LEVELS = [
  {
    name: { id: "Padang Rumput", en: "Grassy Field" },
    width: 2000,
    start: { x: 60, y: 260 },
    platforms: [
      { x: 0, y: 320, w: 700, h: 40 },
      { x: 780, y: 320, w: 500, h: 40 },
      { x: 1360, y: 320, w: 640, h: 40 },
      { x: 360, y: 240, w: 120, h: 24 },
      { x: 900, y: 240, w: 140, h: 24 },
      { x: 1150, y: 190, w: 120, h: 24 },
      { x: 1520, y: 240, w: 140, h: 24 },
    ],
    coins: [
      { x: 220, y: 280 }, { x: 400, y: 200 }, { x: 440, y: 200 },
      { x: 620, y: 280 }, { x: 940, y: 200 }, { x: 1190, y: 150 },
      { x: 1420, y: 280 }, { x: 1560, y: 200 }, { x: 1780, y: 280 },
    ],
    creatures: [
      { x: 560, y: 320 - CREATURE_H, range: 80 },
      { x: 1450, y: 320 - CREATURE_H, range: 100 },
    ],
    goal: { x: 1900, y: 320 - 90 },
  },
  {
    name: { id: "Bukit Melompat", en: "Hopping Hills" },
    width: 2400,
    start: { x: 60, y: 260 },
    platforms: [
      { x: 0, y: 320, w: 420, h: 40 },
      { x: 520, y: 300, w: 200, h: 60 },
      { x: 820, y: 260, w: 160, h: 100 },
      { x: 1080, y: 320, w: 300, h: 40 },
      { x: 1300, y: 220, w: 120, h: 24 },
      { x: 1500, y: 320, w: 360, h: 40 },
      { x: 1720, y: 230, w: 120, h: 24 },
      { x: 1960, y: 320, w: 440, h: 40 },
    ],
    coins: [
      { x: 240, y: 280 }, { x: 600, y: 260 }, { x: 880, y: 220 },
      { x: 900, y: 220 }, { x: 1150, y: 280 }, { x: 1350, y: 180 },
      { x: 1600, y: 280 }, { x: 1770, y: 190 }, { x: 2050, y: 280 },
      { x: 2200, y: 280 },
    ],
    creatures: [
      { x: 560, y: 300 - CREATURE_H, range: 70 },
      { x: 1150, y: 320 - CREATURE_H, range: 90 },
      { x: 2050, y: 320 - CREATURE_H, range: 110 },
    ],
    goal: { x: 2300, y: 320 - 90 },
  },
  {
    name: { id: "Langit Ceria", en: "Cheerful Sky" },
    width: 2800,
    start: { x: 60, y: 240 },
    platforms: [
      { x: 0, y: 300, w: 320, h: 60 },
      { x: 420, y: 250, w: 140, h: 24 },
      { x: 660, y: 210, w: 120, h: 24 },
      { x: 880, y: 260, w: 140, h: 24 },
      { x: 1120, y: 300, w: 260, h: 60 },
      { x: 1440, y: 240, w: 120, h: 24 },
      { x: 1640, y: 190, w: 120, h: 24 },
      { x: 1860, y: 260, w: 140, h: 24 },
      { x: 2080, y: 300, w: 260, h: 60 },
      { x: 2420, y: 240, w: 120, h: 24 },
      { x: 2600, y: 300, w: 200, h: 60 },
    ],
    coins: [
      { x: 180, y: 260 }, { x: 470, y: 210 }, { x: 700, y: 170 },
      { x: 920, y: 220 }, { x: 1200, y: 260 }, { x: 1480, y: 200 },
      { x: 1680, y: 150 }, { x: 1900, y: 220 }, { x: 2160, y: 260 },
      { x: 2460, y: 200 }, { x: 2660, y: 260 },
    ],
    creatures: [
      { x: 1180, y: 300 - CREATURE_H, range: 80 },
      { x: 2140, y: 300 - CREATURE_H, range: 90 },
      { x: 2640, y: 300 - CREATURE_H, range: 60 },
    ],
    goal: { x: 2720, y: 300 - 90 },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * PHYSICS & COLLISION MODULE
 * ---------------------------------------------------------------------------
 * Pure helpers, kept separate from rendering. All tuned to be forgiving:
 * floaty gravity, generous jump, coyote time, and no death state.
 * ═══════════════════════════════════════════════════════════════════════════ */

const PHYS = {
  gravity: 0.55,        // downward accel per frame
  moveSpeed: 3.2,       // horizontal run speed
  jumpForce: -11.5,     // initial jump velocity (negative = up)
  maxFall: 12,          // terminal velocity so falls stay gentle
  coyoteFrames: 8,      // grace frames to still jump after leaving ground
  bounceForce: -9,      // upward pop when bouncing on a creature
};

// Axis-aligned bounding-box overlap test
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Resolve the player against all platforms. Mutates the player object and
// returns whether the player is standing on ground this frame.
function collidePlatforms(p, platforms) {
  let onGround = false;

  // ── Horizontal pass ──
  p.x += p.vx;
  for (const pl of platforms) {
    if (aabb(p.x, p.y, PLAYER_W, PLAYER_H, pl.x, pl.y, pl.w, pl.h)) {
      if (p.vx > 0) p.x = pl.x - PLAYER_W;
      else if (p.vx < 0) p.x = pl.x + pl.w;
      p.vx = 0;
    }
  }

  // ── Vertical pass ──
  p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall);
  p.y += p.vy;
  for (const pl of platforms) {
    if (aabb(p.x, p.y, PLAYER_W, PLAYER_H, pl.x, pl.y, pl.w, pl.h)) {
      if (p.vy > 0) {
        p.y = pl.y - PLAYER_H; // land on top
        p.vy = 0;
        onGround = true;
      } else if (p.vy < 0) {
        p.y = pl.y + pl.h;     // bonk head
        p.vy = 0;
      }
    }
  }

  return onGround;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SOUND (Web Audio API generated tones — no asset files needed)
 * ═══════════════════════════════════════════════════════════════════════════ */

function makeAudio() {
  let ctx = null;
  const ensure = () => {
    if (!ctx) {
      const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
      if (!Ctx) return null;
      ctx = new Ctx();
    }
    return ctx;
  };
  const blip = (freq, dur = 0.12, type = "square", vol = 0.15) => {
    try {
      const c = ensure();
      if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + dur);
    } catch (e) {
      // audio not available, ignore
    }
  };
  return {
    jump: () => blip(520, 0.12, "square"),
    coin: () => blip(880, 0.1, "triangle", 0.18),
    bounce: () => blip(300, 0.16, "sawtooth"),
    goal: () => {
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => blip(f, 0.18, "square", 0.2), i * 120)
      );
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default function PlatformerGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const [screen, setScreen] = useState("intro"); // intro | playing | win
  const [levelIdx, setLevelIdx] = useState(0);
  const [coins, setCoins] = useState(0);
  const [cleared, setCleared] = useState(false);

  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const gameRef = useRef(null); // mutable game state (avoids re-renders per frame)

  // Lazily build the audio helper on the client only
  if (!audioRef.current && typeof window !== "undefined") {
    audioRef.current = makeAudio();
  }

  // Build fresh mutable state for a level
  const buildState = useCallback((idx) => {
    const lv = LEVELS[idx];
    return {
      player: { x: lv.start.x, y: lv.start.y, vx: 0, vy: 0, face: 1, anim: 0 },
      checkpoint: { x: lv.start.x, y: lv.start.y },
      coins: lv.coins.map((c) => ({ ...c, got: false })),
      creatures: lv.creatures.map((c) => ({
        ...c, ox: c.x, dir: 1, alive: true, squish: 0,
      })),
      camX: 0,
      collected: 0,
      confetti: [],
      done: false,
    };
  }, []);

  const startLevel = useCallback((idx) => {
    gameRef.current = buildState(idx);
    setLevelIdx(idx);
    setCoins(0);
    setCleared(false);
    setScreen("playing");
    setHasChanges(true);
  }, [buildState, setHasChanges]);

  // ── Keyboard input ──
  useEffect(() => {
    if (screen !== "playing") return;
    const down = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keysRef.current.left = true;
      if (["ArrowRight", "d", "D"].includes(e.key)) keysRef.current.right = true;
      if (["ArrowUp", "w", "W", " ", "Spacebar"].includes(e.key)) {
        keysRef.current.jump = true;
        e.preventDefault();
      }
    };
    const up = (e) => {
      if (["ArrowLeft", "a", "A"].includes(e.key)) keysRef.current.left = false;
      if (["ArrowRight", "d", "D"].includes(e.key)) keysRef.current.right = false;
      if (["ArrowUp", "w", "W", " ", "Spacebar"].includes(e.key)) keysRef.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [screen]);

  // ── Game loop ──
  useEffect(() => {
    if (screen !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const lv = LEVELS[levelIdx];

    // View is a fixed logical size; CSS scales the canvas element responsively.
    const VIEW_W = canvas.width;
    const VIEW_H = canvas.height;

    let coyote = 0;
    let jumpHeld = false;

    const step = () => {
      const g = gameRef.current;
      if (!g) return;
      const p = g.player;

      // ── Input → horizontal velocity ──
      const k = keysRef.current;
      p.vx = 0;
      if (k.left) { p.vx = -PHYS.moveSpeed; p.face = -1; }
      if (k.right) { p.vx = PHYS.moveSpeed; p.face = 1; }
      if (k.left || k.right) p.anim += 0.25;

      // ── Collisions + ground detection (physics module) ──
      const onGround = collidePlatforms(p, lv.platforms);
      if (onGround) coyote = PHYS.coyoteFrames;
      else if (coyote > 0) coyote -= 1;

      // ── Jump (with coyote time + must release to re-jump) ──
      if (k.jump && !jumpHeld && coyote > 0) {
        p.vy = PHYS.jumpForce;
        coyote = 0;
        jumpHeld = true;
        audioRef.current?.jump();
      }
      if (!k.jump) jumpHeld = false;

      // ── Fell in a gap → gently respawn at checkpoint (no death) ──
      if (p.y > WORLD_H + 80) {
        p.x = g.checkpoint.x;
        p.y = g.checkpoint.y;
        p.vx = 0;
        p.vy = 0;
      }

      // ── Coins ──
      for (const c of g.coins) {
        if (!c.got && aabb(p.x, p.y, PLAYER_W, PLAYER_H, c.x - COIN_R, c.y - COIN_R, COIN_R * 2, COIN_R * 2)) {
          c.got = true;
          g.collected += 1;
          setCoins(g.collected);
          audioRef.current?.coin();
        }
      }

      // ── Creatures: patrol + bounce-to-clear ──
      for (const cr of g.creatures) {
        if (!cr.alive) { cr.squish = Math.max(0, cr.squish - 0.08); continue; }
        cr.x += cr.dir * 0.8;
        if (cr.x > cr.ox + cr.range) cr.dir = -1;
        if (cr.x < cr.ox - cr.range) cr.dir = 1;

        if (aabb(p.x, p.y, PLAYER_W, PLAYER_H, cr.x, cr.y, CREATURE_W, CREATURE_H)) {
          const fallingOnto = p.vy > 0 && p.y + PLAYER_H - p.vy <= cr.y + 8;
          if (fallingOnto) {
            cr.alive = false;
            cr.squish = 1;
            p.vy = PHYS.bounceForce; // gentle bounce, forgiving
            audioRef.current?.bounce();
          } else {
            // Not scary: just nudge the player back, no damage
            p.x += p.face * -6;
          }
        }
      }

      // ── Goal ──
      if (!g.done && aabb(p.x, p.y, PLAYER_W, PLAYER_H, lv.goal.x, lv.goal.y, 40, 90)) {
        g.done = true;
        audioRef.current?.goal();
        // spawn confetti burst
        for (let i = 0; i < 60; i++) {
          g.confetti.push({
            x: lv.goal.x, y: lv.goal.y,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * -6 - 2,
            c: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"][i % 6],
            life: 60,
          });
        }
        setCleared(true);
        setTimeout(() => setScreen("win"), 1400);
      }

      // ── Confetti physics ──
      for (const f of g.confetti) {
        f.x += f.vx; f.y += f.vy; f.vy += 0.2; f.life -= 1;
      }
      g.confetti = g.confetti.filter((f) => f.life > 0);

      // ── Camera follows player, clamped to level bounds ──
      g.camX = Math.max(0, Math.min(p.x - VIEW_W / 2, lv.width - VIEW_W));

      draw(ctx, g, lv, VIEW_W, VIEW_H);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, levelIdx]);

  /* ═════════════════════════════════════════════════════════════════════════
   * RENDERING (canvas draw — kept separate from physics/update above)
   * ═════════════════════════════════════════════════════════════════════════ */
  const draw = (ctx, g, lv, VIEW_W, VIEW_H) => {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#7dd3fc");
    sky.addColorStop(1, "#e0f2fe");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // Parallax hills (move slower than foreground)
    const hillOff = -g.camX * 0.3;
    ctx.fillStyle = "#86efac";
    for (let i = -1; i < 6; i++) {
      const hx = hillOff % 400 + i * 400;
      ctx.beginPath();
      ctx.arc(hx + 200, VIEW_H, 200, Math.PI, 0);
      ctx.fill();
    }
    // Parallax clouds
    const cloudOff = -g.camX * 0.15;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = -1; i < 8; i++) {
      const cx = (cloudOff % 500) + i * 500;
      drawCloud(ctx, cx + 100, 60);
      drawCloud(ctx, cx + 320, 110);
    }

    ctx.save();
    ctx.translate(-g.camX, 0);

    // Platforms (chunky pixel blocks with grass top)
    for (const pl of lv.platforms) {
      ctx.fillStyle = "#8b5e3c";
      ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(pl.x, pl.y, pl.w, 10);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(pl.x, pl.y, pl.w, pl.h);
    }

    // Coins (spinning stars)
    for (const c of g.coins) {
      if (c.got) continue;
      drawStar(ctx, c.x, c.y, COIN_R, "#facc15");
    }

    // Creatures
    for (const cr of g.creatures) {
      if (cr.alive) {
        drawCreature(ctx, cr.x, cr.y, cr.dir);
      } else if (cr.squish > 0) {
        ctx.fillStyle = "#a78bfa";
        ctx.fillRect(cr.x, cr.y + CREATURE_H - 8, CREATURE_W, 8);
      }
    }

    // Goal flag
    drawFlag(ctx, lv.goal.x, lv.goal.y);

    // Player
    drawPlayer(ctx, g.player);

    // Confetti
    for (const f of g.confetti) {
      ctx.fillStyle = f.c;
      ctx.fillRect(f.x, f.y, 6, 6);
    }

    ctx.restore();
  };

  // ── Sprite helpers ──
  function drawCloud(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 26, y + 6, 26, 0, Math.PI * 2);
    ctx.arc(x + 56, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStar(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.strokeStyle = "#b45309";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a2) * (r / 2), Math.sin(a2) * (r / 2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawCreature(ctx, x, y, dir) {
    // round purple blob with feet + smile
    ctx.fillStyle = "#a78bfa";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, CREATURE_W, CREATURE_H, 12);
    ctx.fill();
    ctx.stroke();
    // eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 8, y + 8, 7, 7);
    ctx.fillRect(x + 19, y + 8, 7, 7);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 10 + (dir > 0 ? 2 : 0), y + 10, 3, 3);
    ctx.fillRect(x + 21 + (dir > 0 ? 2 : 0), y + 10, 3, 3);
    // smile
    ctx.beginPath();
    ctx.arc(x + CREATURE_W / 2, y + 20, 5, 0, Math.PI);
    ctx.stroke();
  }

  function drawFlag(ctx, x, y) {
    ctx.fillStyle = "#78716c";
    ctx.fillRect(x + 4, y, 6, 90);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 4);
    ctx.lineTo(x + 46, y + 16);
    ctx.lineTo(x + 10, y + 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(x + 7, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer(ctx, p) {
    const bob = Math.sin(p.anim) * 2;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    // body (round orange animal)
    ctx.fillStyle = "#fb923c";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(0, 0, PLAYER_W, PLAYER_H, 10);
    ctx.fill();
    ctx.stroke();
    // ears
    ctx.beginPath();
    ctx.roundRect(2, -8, 8, 12, 3);
    ctx.roundRect(PLAYER_W - 10, -8, 8, 12, 3);
    ctx.fill();
    ctx.stroke();
    // eyes (face direction)
    const ex = p.face > 0 ? 4 : 0;
    ctx.fillStyle = "#fff";
    ctx.fillRect(6 + ex, 8, 8, 8);
    ctx.fillRect(16 + ex, 8, 8, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(9 + ex, 10, 4, 4);
    ctx.fillRect(19 + ex, 10, 4, 4);
    // cheeks
    ctx.fillStyle = "#fda4af";
    ctx.fillRect(4, 20, 5, 4);
    ctx.fillRect(PLAYER_W - 9, 20, 5, 4);
    ctx.restore();
  }

  const currentLevel = LEVELS[levelIdx];

  /* ═════════════════════════════════════════════════════════════════════════
   * SCREENS
   * ═════════════════════════════════════════════════════════════════════════ */
  if (screen === "intro") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.bigEmoji}>🦊</div>
          <h1 className={styles.title}>{language === "id" ? "Petualangan Lompat" : "Hop Adventure"}</h1>
          <p className={styles.desc}>
            {language === "id"
              ? "Lari, lompat, kumpulkan bintang, dan capai bendera!"
              : "Run, jump, collect stars, and reach the flag!"}
          </p>
          <div className={styles.levelGrid}>
            {LEVELS.map((lv, i) => (
              <button
                key={i}
                className={`${styles.levelCard} ${styles[`tier${i + 1}`]}`}
                onClick={() => startLevel(i)}
              >
                <div className={styles.lvlNum}>{language === "id" ? "Level" : "Level"} {i + 1}</div>
                <div className={styles.lvlName}>{lv.name[language]}</div>
                <div className={styles.lvlDetail}>⭐ {lv.coins.length}</div>
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            {language === "id"
              ? "Panah ⬅➡ untuk gerak, ⬆ / Spasi untuk lompat"
              : "Arrows ⬅➡ to move, ⬆ / Space to jump"}
          </p>
        </div>
      </div>
    );
  }

  if (screen === "win") {
    const isLast = levelIdx >= LEVELS.length - 1;
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.bigEmoji}>🎉</div>
          <h1 className={styles.title}>{language === "id" ? "Hebat sekali!" : "Great job!"}</h1>
          <p className={styles.desc}>
            {language === "id"
              ? `Kamu menyelesaikan ${currentLevel.name.id} dan mengumpulkan ${coins} bintang!`
              : `You cleared ${currentLevel.name.en} and collected ${coins} stars!`}
          </p>
          <div className={styles.winButtons}>
            {!isLast && (
              <button className={styles.primaryBtn} onClick={() => startLevel(levelIdx + 1)}>
                ➡️ {language === "id" ? "Level Berikutnya" : "Next Level"}
              </button>
            )}
            <button className={styles.primaryBtn} onClick={() => startLevel(levelIdx)}>
              🔄 {language === "id" ? "Main Lagi" : "Play Again"}
            </button>
            <button className={styles.ghostBtn} onClick={() => setScreen("intro")}>
              🏆 {language === "id" ? "Pilih Level" : "Choose Level"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className={styles.container}>
      <div className={styles.hud}>
        <span className={styles.hudItem}>⭐ {coins}</span>
        <span className={styles.hudItem}>
          {language === "id" ? "Level" : "Level"} {levelIdx + 1} · {currentLevel.name[language]}
        </span>
        <button className={styles.ghostBtn} onClick={() => setScreen("intro")}>
          🏆 {language === "id" ? "Level" : "Levels"}
        </button>
      </div>

      <div className={styles.stage}>
        <canvas ref={canvasRef} width={640} height={360} className={styles.canvas} />
        {cleared && (
          <div className={styles.celebrate}>
            {language === "id" ? "Kamu berhasil!" : "You got it!"}
          </div>
        )}

        {/* Touch controls — large, bottom corners, for tablets */}
        <div className={styles.touchLeft}>
          <button
            className={styles.padBtn}
            onPointerDown={() => (keysRef.current.left = true)}
            onPointerUp={() => (keysRef.current.left = false)}
            onPointerLeave={() => (keysRef.current.left = false)}
            aria-label="left"
          >◀</button>
          <button
            className={styles.padBtn}
            onPointerDown={() => (keysRef.current.right = true)}
            onPointerUp={() => (keysRef.current.right = false)}
            onPointerLeave={() => (keysRef.current.right = false)}
            aria-label="right"
          >▶</button>
        </div>
        <div className={styles.touchRight}>
          <button
            className={`${styles.padBtn} ${styles.jumpBtn}`}
            onPointerDown={() => (keysRef.current.jump = true)}
            onPointerUp={() => (keysRef.current.jump = false)}
            onPointerLeave={() => (keysRef.current.jump = false)}
            aria-label="jump"
          >⬆</button>
        </div>
      </div>
    </div>
  );
}
