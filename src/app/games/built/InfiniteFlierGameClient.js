"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./InfiniteFlierGameClient.module.css";

const W = 480;
const H = 320;
const GRAVITY = 0.36;
const FLAP = -7.2;
const PIPE_SPEED = 3.2;
const PIPE_GAP = 110;
const PIPE_MIN_Y = 60;
const PIPE_MAX_Y = H - PIPE_GAP - 60;
const PIPE_INTERVAL = 1500; // ms between pipes

// ─── Procedural canvas art helpers ───────────────────────────────────────────

function drawSky(ctx) {
  // gradient sky
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "#5ec8f0");
  grd.addColorStop(1, "#b8e8ff");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

function drawClouds(ctx, offset) {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  const clouds = [
    { x: 80, y: 50, r: 28 },
    { x: 200, y: 30, r: 20 },
    { x: 350, y: 65, r: 24 },
    { x: 460, y: 40, r: 18 },
  ];
  clouds.forEach(({ x, y, r }) => {
    const cx = ((x - offset * 0.3) % (W + 80) + W + 80) % (W + 80) - 40;
    ctx.beginPath();
    ctx.arc(cx, y, r, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.8, y - r * 0.3, r * 0.72, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.7, y + r * 0.1, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGround(ctx, offset) {
  // hills
  ctx.fillStyle = "#6abf4b";
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 4) {
    const wave = Math.sin((x + offset * 0.8) * 0.025) * 14 +
                 Math.sin((x + offset * 0.6) * 0.05) * 8;
    ctx.lineTo(x, H - 38 + wave);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();

  // darker ground strip
  ctx.fillStyle = "#5aa33b";
  ctx.fillRect(0, H - 22, W, 22);

  // dashed line (road)
  ctx.strokeStyle = "#4a8f30";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(0, H - 10);
  ctx.lineTo(W, H - 10);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPipe(ctx, topH, x, flash) {
  const pw = 44;
  const cap = 10;
  const grd = ctx.createLinearGradient(x, 0, x + pw, 0);
  grd.addColorStop(0, flash ? "#ffeb3b" : "#56a832");
  grd.addColorStop(0.35, flash ? "#fff176" : "#7bcc52");
  grd.addColorStop(1, flash ? "#f9a825" : "#3d8020");
  ctx.fillStyle = grd;

  // top pipe body
  ctx.fillRect(x, 0, pw, topH - cap);
  // top pipe cap
  ctx.fillRect(x - 4, topH - cap - 14, pw + 8, 14);

  // bottom pipe body
  const botTop = topH + PIPE_GAP;
  ctx.fillRect(x, botTop + cap, pw, H - botTop - cap);
  // bottom pipe cap
  ctx.fillRect(x - 4, botTop, pw + 8, 14);

  // shine stripe
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(x + 6, 0, 8, topH - cap);
  ctx.fillRect(x + 6, botTop + cap, 8, H - botTop - cap);
}

function drawStar(ctx, x, y, t) {
  const r = 12 + Math.sin(t * 0.06) * 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 0.03);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = Math.cos(angle) * rr;
    const py = Math.sin(angle) * rr;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffd54f";
  ctx.fill();
  ctx.strokeStyle = "#ff9800";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// Astronaut player: helmet + visor + suit + pack + thrusters
function drawAstronaut(ctx, px, py, vy, thrusting, t) {
  ctx.save();
  ctx.translate(px, py);
  // slight tilt based on velocity
  ctx.rotate(Math.max(-0.35, Math.min(0.35, vy * 0.04)));

  // thruster flames
  if (thrusting) {
    const flameH = 14 + Math.sin(t * 0.4) * 4;
    const flameGrd = ctx.createLinearGradient(-8, 18, 8, 18 + flameH);
    flameGrd.addColorStop(0, "#ff9800");
    flameGrd.addColorStop(1, "rgba(255,235,59,0)");
    ctx.fillStyle = flameGrd;
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(0, 18 + flameH);
    ctx.lineTo(8, 18);
    ctx.closePath();
    ctx.fill();
  }

  // jetpack
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.roundRect(6, 4, 12, 16, 3);
  ctx.fill();
  ctx.fillStyle = "#ff5722";
  ctx.fillRect(8, 16, 4, 4);
  ctx.fillRect(12, 16, 4, 4);

  // suit body
  const bodyGrd = ctx.createLinearGradient(-12, 0, 12, 0);
  bodyGrd.addColorStop(0, "#e0e0e0");
  bodyGrd.addColorStop(0.5, "#ffffff");
  bodyGrd.addColorStop(1, "#bdbdbd");
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.roundRect(-12, 2, 22, 18, 5);
  ctx.fill();

  // chest panel
  ctx.fillStyle = "#1565c0";
  ctx.fillRect(-6, 6, 10, 7);
  ctx.fillStyle = "#ff5722";
  ctx.fillRect(-4, 7, 3, 2);
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(-4, 10, 3, 2);

  // helmet
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(0, -4, 13, 0, Math.PI * 2);
  ctx.fill();

  // helmet outline
  ctx.strokeStyle = "#9e9e9e";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // visor
  const visorGrd = ctx.createLinearGradient(-7, -10, 7, 0);
  visorGrd.addColorStop(0, "#4dd0e1");
  visorGrd.addColorStop(1, "#0288d1");
  ctx.fillStyle = visorGrd;
  ctx.beginPath();
  ctx.ellipse(0, -4, 8, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // visor shine
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(-3, -7, 3, 2, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // left arm
  ctx.fillStyle = "#eeeeee";
  ctx.beginPath();
  ctx.ellipse(-16, 10, 5, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#9e9e9e";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InfiniteFlierGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const canvasRef = useRef(null);
  const [screen, setScreen] = useState("intro"); // intro | playing | dead
  const [bestScore, setBestScore] = useState(0);

  // game state in refs — animation loop reads these without stale closures
  const game = useRef({
    vy: 0, py: H / 2, px: 80,
    thrusting: false,
    offset: 0,
    pipes: [],
    stars: [],
    score: 0,
    t: 0,
    lastPipe: 0,
    alive: false,
    frame: 0,
  });

  const flap = useCallback(() => {
    const g = game.current;
    if (!g.alive) return;
    g.vy = FLAP;
    g.thrusting = true;
    setTimeout(() => { if (game.current.alive) game.current.thrusting = false; }, 180);
    setHasChanges(true);
  }, [setHasChanges]);

  useEffect(() => {
    if (screen !== "playing") return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    const g = game.current;
    g.vy = 0; g.py = H / 2; g.thrusting = false;
    g.offset = 0; g.pipes = []; g.stars = [];
    g.score = 0; g.t = 0; g.lastPipe = 0;
    g.alive = true; g.frame = 0;

    let lastTs = 0;
    let raf;

    const loop = (ts) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      g.t += dt;
      g.frame++;

      if (!g.alive) return;

      // physics
      g.vy += GRAVITY;
      g.py += g.vy;
      g.offset += PIPE_SPEED;

      // spawn pipes
      if (g.t - g.lastPipe > PIPE_INTERVAL) {
        g.lastPipe = g.t;
        const topH = PIPE_MIN_Y + Math.random() * (PIPE_MAX_Y - PIPE_MIN_Y);
        const px = W + 60;
        g.pipes.push({ x: px, topH, scored: false, flash: 0 });
        // maybe add a star in the gap
        if (Math.random() < 0.55) {
          g.stars.push({ x: px + 22, y: topH + PIPE_GAP / 2, alive: true });
        }
      }

      // move & score pipes
      for (const p of g.pipes) {
        p.x -= PIPE_SPEED;
        if (p.flash > 0) p.flash -= dt;
        if (!p.scored && p.x + 44 < g.px) {
          p.scored = true;
          g.score += 1;
        }
      }
      g.pipes = g.pipes.filter((p) => p.x > -60);

      // move stars
      for (const s of g.stars) s.x -= PIPE_SPEED;
      g.stars = g.stars.filter((s) => s.x > -20 && s.alive);

      // collect stars
      for (const s of g.stars) {
        const dx = g.px - s.x, dy = g.py - s.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          s.alive = false;
          g.score += 3;
        }
      }

      // collision — ceiling & floor
      if (g.py < 10 || g.py > H - 30) {
        g.alive = false;
        setBestScore((b) => Math.max(b, g.score));
        setScreen("dead");
        return;
      }

      // collision — pipes
      for (const p of g.pipes) {
        const pw = 44;
        const inX = g.px + 10 > p.x && g.px - 10 < p.x + pw;
        const inTop = g.py - 10 < p.topH;
        const inBot = g.py + 10 > p.topH + PIPE_GAP;
        if (inX && (inTop || inBot)) {
          g.alive = false;
          setBestScore((b) => Math.max(b, g.score));
          setScreen("dead");
          return;
        }
      }

      // ── draw ──
      drawSky(ctx);
      drawClouds(ctx, g.offset);
      for (const p of g.pipes) drawPipe(ctx, p.topH, p.x, p.flash > 0);
      drawGround(ctx, g.offset);
      for (const s of g.stars.filter((s) => s.alive)) drawStar(ctx, s.x, s.y, g.t);
      drawAstronaut(ctx, g.px, g.py, g.vy, g.thrusting, g.t);

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 38, 8, 76, 30, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`⭐ ${g.score}`, W / 2, 23);
    };

    raf = requestAnimationFrame(loop);

    // controls
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); flap(); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [screen, flap]);

  const startGame = () => setScreen("playing");

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvasFrame}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className={styles.canvas}
          onPointerDown={(e) => { e.preventDefault(); flap(); }}
        />

        {screen === "intro" && (
          <div className={styles.overlay}>
            <div className={styles.card}>
              <div className={styles.heroEmoji}>🚀</div>
              <h1 className={styles.title}>{t("Astronot Terbang!", "Rocket Flier!")}</h1>
              <p className={styles.desc}>
                {t(
                  "Ketuk / klik layar agar astronot naik. Hindari pipa dan kumpulkan bintang!",
                  "Tap / click to boost up. Dodge the pipes and collect stars!"
                )}
              </p>
              {bestScore > 0 && (
                <p className={styles.best}>🏆 {t("Rekor", "Best")}: {bestScore}</p>
              )}
              <button className={styles.startBtn} onClick={startGame}>
                {t("Mulai 🚀", "Start 🚀")}
              </button>
              <p className={styles.hint}>
                {t("Keyboard: Spasi / ↑ untuk terbang", "Keyboard: Space / ↑ to fly")}
              </p>
            </div>
          </div>
        )}

        {screen === "dead" && (
          <div className={styles.overlay}>
            <div className={styles.card}>
              <div className={styles.heroEmoji}>💥</div>
              <h1 className={styles.title}>{t("Nabrak!", "Crashed!")}</h1>
              <p className={styles.scoreLine}>
                {t("Skor", "Score")}: <strong>{game.current.score}</strong>
              </p>
              {game.current.score >= bestScore && bestScore > 0 && (
                <p className={styles.newBest}>🎉 {t("Rekor baru!", "New record!")}</p>
              )}
              <p className={styles.best}>🏆 {t("Rekor", "Best")}: {bestScore}</p>
              <button className={styles.startBtn} onClick={startGame}>
                🔄 {t("Main Lagi", "Play Again")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* tap zone when playing */}
      {screen === "playing" && (
        <button
          className={styles.tapZone}
          onPointerDown={(e) => { e.preventDefault(); flap(); }}
          aria-label={t("Terbang", "Fly")}
        >
          {t("Ketuk untuk terbang ✈️", "Tap to fly ✈️")}
        </button>
      )}
    </div>
  );
}
