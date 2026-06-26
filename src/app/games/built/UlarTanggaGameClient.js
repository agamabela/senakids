"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import Dice from "@/components/Dice";
import styles from "./UlarTanggaGameClient.module.css";

const PLAYER_COLORS = [
  { color: "#e5392f", dark: "#a31810", name: { id: "Merah", en: "Red" } },
  { color: "#3b82d6", dark: "#1e4f96", name: { id: "Biru", en: "Blue" } },
  { color: "#6cae3f", dark: "#3f7016", name: { id: "Hijau", en: "Green" } },
  { color: "#f4c020", dark: "#b8860b", name: { id: "Kuning", en: "Yellow" } },
];

const CELL_PALETTE = ["#f6a35c", "#f7c948", "#8fbf5a", "#56b4c4", "#ec7b5a", "#6c9bd9"];

const CLASSIC = {
  N: 100,
  ladders: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 },
  snakes: { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 },
};

const MIN_N = 50;
const MAX_N = 200;
const STEP_MS = 150;

function colsFor(N) { return Math.max(6, Math.ceil(Math.sqrt(N))); }
function numToCell(n, cols, rows) {
  const idx = n - 1;
  const r = Math.floor(idx / cols);
  const p = idx % cols;
  const col = r % 2 === 0 ? p : cols - 1 - p;
  return { x: col, y: rows - 1 - r };
}

function drawPawn(ctx, cx, cy, r, color, dark, hop = 0) {
  cy -= hop;
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.9, r * 0.85, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.32, r * 0.27, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.4, cy + r * 0.46);
  ctx.quadraticCurveTo(cx - r * 0.12, cy - r * 0.06, cx, cy - r * 0.06);
  ctx.quadraticCurveTo(cx + r * 0.12, cy - r * 0.06, cx + r * 0.4, cy + r * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.46, r * 0.46, r * 0.15, 0, 0, Math.PI * 2); ctx.fill();
}

export default function UlarTanggaGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("setup"); // setup | build | playing | win
  const [roster, setRoster] = useState(["human", "bot"]);
  const [, setTick] = useState(0);
  const [botKey, setBotKey] = useState(0);
  const rerender = useCallback(() => setTick((x) => x + 1), []);
  const pokeBot = useCallback(() => setBotKey((x) => x + 1), []);

  // custom builder
  const [cN, setCN] = useState(64);
  const [ladders, setLadders] = useState([]);
  const [snakes, setSnakes] = useState([]);
  const [lFrom, setLFrom] = useState(""); const [lTo, setLTo] = useState("");
  const [sFrom, setSFrom] = useState(""); const [sTo, setSTo] = useState("");
  const [buildErr, setBuildErr] = useState("");

  const canvasRef = useRef(null);

  const cfgRef = useRef(CLASSIC);
  const posRef = useRef([]);
  const turnRef = useRef(0);
  const diceRef = useRef(null);
  const rollingRef = useRef(false);
  const phaseRef = useRef("roll");   // roll | rolling | animating | over
  const animatingRef = useRef(false);
  const hopRef = useRef(0);          // which player index is hopping
  const winnerRef = useRef(null);
  const msgRef = useRef("");
  const npRef = useRef(2);
  const rosterRef = useRef(roster);
  rosterRef.current = roster;

  const setCount = (n) => {
    setRoster((cur) => {
      const next = [...cur];
      while (next.length < n) next.push("bot");
      next.length = n;
      if (next.every((x) => x === "bot")) next[0] = "human";
      return next;
    });
  };
  const toggleType = (i) => setRoster((cur) => cur.map((x, j) => (j === i ? (x === "human" ? "bot" : "human") : x)));

  const beginGame = useCallback((cfg, rost) => {
    cfgRef.current = cfg;
    npRef.current = rost.length;
    rosterRef.current = rost;
    posRef.current = Array.from({ length: rost.length }, () => 0);
    turnRef.current = 0;
    diceRef.current = null;
    rollingRef.current = false;
    phaseRef.current = "roll";
    animatingRef.current = false;
    hopRef.current = -1;
    winnerRef.current = null;
    msgRef.current = "";
    setScreen("playing");
    rerender();
    pokeBot();
  }, [rerender, pokeBot]);

  const startClassic = useCallback(() => beginGame(CLASSIC, roster), [beginGame, roster]);

  const usedFrom = useMemo(() => {
    const s = new Set();
    ladders.forEach((l) => { s.add(l.from); s.add(l.to); });
    snakes.forEach((k) => { s.add(k.from); s.add(k.to); });
    return s;
  }, [ladders, snakes]);

  const addLadder = () => {
    const f = parseInt(lFrom, 10), to = parseInt(lTo, 10);
    if (!f || !to) return setBuildErr(t("Isi kotak asal & tujuan tangga.", "Enter ladder start & end."));
    if (f < 1 || to > cN || f >= to) return setBuildErr(t("Tangga naik (asal < tujuan) di dalam papan.", "Ladder goes up (start < end), within board."));
    if (f === 1 || to === cN) return setBuildErr(t("Hindari kotak pertama/terakhir.", "Avoid first/last square."));
    if (usedFrom.has(f) || usedFrom.has(to)) return setBuildErr(t("Kotak itu sudah dipakai.", "That square is already used."));
    setLadders((a) => [...a, { from: f, to }]); setLFrom(""); setLTo(""); setBuildErr("");
  };
  const addSnake = () => {
    const f = parseInt(sFrom, 10), to = parseInt(sTo, 10);
    if (!f || !to) return setBuildErr(t("Isi kepala & ekor ular.", "Enter snake head & tail."));
    if (to < 1 || f > cN || f <= to) return setBuildErr(t("Ular turun (kepala > ekor) di dalam papan.", "Snake goes down (head > tail), within board."));
    if (f === cN || to === 1) return setBuildErr(t("Hindari kotak pertama/terakhir.", "Avoid first/last square."));
    if (usedFrom.has(f) || usedFrom.has(to)) return setBuildErr(t("Kotak itu sudah dipakai.", "That square is already used."));
    setSnakes((a) => [...a, { from: f, to }]); setSFrom(""); setSTo(""); setBuildErr("");
  };
  const startCustom = () => {
    if (cN < MIN_N || cN > MAX_N) return setBuildErr(t(`Jumlah kotak ${MIN_N}–${MAX_N}.`, `Squares ${MIN_N}–${MAX_N}.`));
    beginGame({
      N: cN,
      ladders: Object.fromEntries(ladders.map((l) => [l.from, l.to])),
      snakes: Object.fromEntries(snakes.map((s) => [s.from, s.to])),
    }, roster);
  };

  // ── turn flow ──
  const finishTurn = useCallback((rolledSix, won) => {
    animatingRef.current = false;
    hopRef.current = -1;
    if (won) {
      winnerRef.current = turnRef.current;
      phaseRef.current = "over";
      setScreen("win");
      rerender();
      return;
    }
    if (rolledSix) {
      phaseRef.current = "roll";
      diceRef.current = null;
      msgRef.current = t("Dapat 6 — lempar lagi!", "Got a 6 — roll again!");
    } else {
      turnRef.current = (turnRef.current + 1) % npRef.current;
      phaseRef.current = "roll";
      diceRef.current = null;
      msgRef.current = "";
    }
    rerender();
    pokeBot();
  }, [rerender, t, pokeBot]);

  const settleLanding = useCallback((pi, dice) => {
    const cfg = cfgRef.current;
    let pos = posRef.current[pi];
    const lad = cfg.ladders[pos];
    const sn = cfg.snakes[pos];
    if (lad) {
      msgRef.current = t("🪜 Naik tangga!", "🪜 Up the ladder!");
      rerender();
      setTimeout(() => {
        posRef.current[pi] = lad; rerender();
        finishTurn(dice === 6, lad === cfg.N);
      }, 380);
      return;
    }
    if (sn) {
      msgRef.current = t("🐍 Digigit ular!", "🐍 Snake bite!");
      rerender();
      setTimeout(() => {
        posRef.current[pi] = sn; rerender();
        finishTurn(dice === 6, false);
      }, 380);
      return;
    }
    finishTurn(dice === 6, pos === cfg.N);
  }, [finishTurn, rerender, t]);

  const stepMove = useCallback((pi, remaining, dice) => {
    if (remaining <= 0) { settleLanding(pi, dice); return; }
    posRef.current[pi] += 1;
    hopRef.current = pi;
    rerender();
    setTimeout(() => stepMove(pi, remaining - 1, dice), STEP_MS);
  }, [rerender, settleLanding]);

  const roll = useCallback(() => {
    if (phaseRef.current !== "roll") return;
    phaseRef.current = "rolling";
    rollingRef.current = true;
    msgRef.current = "";
    rerender();
    setTimeout(() => {
      const dice = 1 + Math.floor(Math.random() * 6);
      diceRef.current = dice;
      rollingRef.current = false;
      const pi = turnRef.current;
      const N = cfgRef.current.N;
      if (rosterRef.current[pi] === "human") setHasChanges(true);
      if (posRef.current[pi] + dice > N) {
        msgRef.current = t("Terlalu jauh, tetap di tempat.", "Too far — stay put.");
        phaseRef.current = "animating";
        rerender();
        setTimeout(() => finishTurn(dice === 6, false), 700);
        return;
      }
      phaseRef.current = "animating";
      animatingRef.current = true;
      rerender();
      setTimeout(() => stepMove(pi, dice, dice), 250);
    }, 650);
  }, [finishTurn, rerender, setHasChanges, stepMove, t]);

  // ── bot driver ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const pi = turnRef.current;
    if (phaseRef.current !== "roll") return undefined;
    if (rosterRef.current[pi] !== "bot") return undefined;
    const id = setTimeout(() => roll(), 800);
    return () => clearTimeout(id);
  }, [botKey, screen, roll]);

  // ── canvas render ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const { N, ladders: lad, snakes: sn } = cfgRef.current;
    const cols = colsFor(N);
    const rows = Math.ceil(N / cols);
    const TILE = Math.max(22, Math.floor(620 / cols));
    const W = cols * TILE, H = rows * TILE;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const center = (n) => { const { x, y } = numToCell(n, cols, rows); return { cx: x * TILE + TILE / 2, cy: y * TILE + TILE / 2 }; };

    const drawLadder = (from, to) => {
      const a = center(from), b = center(to);
      const dx = b.cx - a.cx, dy = b.cy - a.cy;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist, ny = dx / dist;
      const off = TILE * 0.22;
      const railW = Math.max(5, TILE * 0.13);
      const rail = (s) => { ctx.beginPath(); ctx.moveTo(a.cx + nx * off * s, a.cy + ny * off * s); ctx.lineTo(b.cx + nx * off * s, b.cy + ny * off * s); };
      ctx.lineCap = "round";
      ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = "#000"; ctx.lineWidth = railW + 4; ctx.translate(0, 2);
      rail(1); ctx.stroke(); rail(-1); ctx.stroke(); ctx.restore();
      for (const s of [1, -1]) {
        ctx.strokeStyle = "#2f6b1e"; ctx.lineWidth = railW + 3; rail(s); ctx.stroke();
        ctx.strokeStyle = "#73c23c"; ctx.lineWidth = railW; rail(s); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = railW * 0.32; rail(s); ctx.stroke();
      }
      const rungs = Math.max(2, Math.round(dist / (TILE * 0.55)));
      for (let i = 1; i < rungs; i++) {
        const t = i / rungs, mx = a.cx + dx * t, my = a.cy + dy * t;
        const L = { x: mx + nx * off, y: my + ny * off }, R = { x: mx - nx * off, y: my - ny * off };
        ctx.strokeStyle = "#2f6b1e"; ctx.lineWidth = railW * 0.85 + 2;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(R.x, R.y); ctx.stroke();
        ctx.strokeStyle = "#8fd24f"; ctx.lineWidth = railW * 0.6;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(R.x, R.y); ctx.stroke();
      }
    };

    const drawSnake = (from, to) => {
      const a = center(from), b = center(to); // a = head (high number), b = tail (low)
      const dx = b.cx - a.cx, dy = b.cy - a.cy;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist, ny = dx / dist;
      const bend = (from % 2 ? 1 : -1) * Math.min(dist * 0.18, TILE * 1.4);
      const cpx = (a.cx + b.cx) / 2 + nx * bend, cpy = (a.cy + b.cy) / 2 + ny * bend;
      const bodyW = Math.max(11, TILE * 0.34);
      const spine = () => { ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.quadraticCurveTo(cpx, cpy, b.cx, b.cy); };
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      // shadow
      ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = "#000"; ctx.lineWidth = bodyW + 6; ctx.translate(0, 3); spine(); ctx.stroke(); ctx.restore();
      // dark outline
      ctx.strokeStyle = "#bd4f29"; ctx.lineWidth = bodyW + 5; spine(); ctx.stroke();
      // body gradient
      const g = ctx.createLinearGradient(a.cx, a.cy, b.cx, b.cy);
      g.addColorStop(0, "#f2965d"); g.addColorStop(1, "#e07a45");
      ctx.strokeStyle = g; ctx.lineWidth = bodyW; spine(); ctx.stroke();
      // belly highlight
      ctx.strokeStyle = "rgba(255,224,180,.5)"; ctx.lineWidth = bodyW * 0.38; spine(); ctx.stroke();

      // sample curve for spots + segment ticks
      const NS = 36, P = [];
      for (let i = 0; i <= NS; i++) {
        const t = i / NS, mt = 1 - t;
        P.push({ x: mt * mt * a.cx + 2 * mt * t * cpx + t * t * b.cx, y: mt * mt * a.cy + 2 * mt * t * cpy + t * t * b.cy });
      }
      ctx.strokeStyle = "rgba(150,70,30,.3)"; ctx.lineWidth = 1.5;
      for (let i = 4; i < NS - 1; i += 3) {
        const p = P[i], q = P[i + 1];
        let tx = q.x - p.x, ty = q.y - p.y; const tl = Math.hypot(tx, ty) || 1;
        const npx = -ty / tl, npy = tx / tl;
        ctx.beginPath(); ctx.moveTo(p.x + npx * bodyW * 0.42, p.y + npy * bodyW * 0.42); ctx.lineTo(p.x - npx * bodyW * 0.42, p.y - npy * bodyW * 0.42); ctx.stroke();
      }
      ctx.fillStyle = "rgba(165,78,32,.38)";
      for (let i = 5; i < NS - 2; i += 7) { ctx.beginPath(); ctx.arc(P[i].x, P[i].y, bodyW * 0.17, 0, Math.PI * 2); ctx.fill(); }

      // head, oriented along initial tangent (a -> control)
      let hx = cpx - a.cx, hy = cpy - a.cy; const hl = Math.hypot(hx, hy) || 1; hx /= hl; hy /= hl;
      const hr = bodyW * 0.95;
      ctx.save();
      ctx.translate(a.cx, a.cy);
      ctx.rotate(Math.atan2(hy, hx)); // +x points toward the body
      // forked tongue (front = -x)
      ctx.strokeStyle = "#e0152b"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-hr * 0.95, 0); ctx.lineTo(-hr * 1.75, 0); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-hr * 1.75, 0); ctx.lineTo(-hr * 2.1, -hr * 0.28);
      ctx.moveTo(-hr * 1.75, 0); ctx.lineTo(-hr * 2.1, hr * 0.28);
      ctx.stroke();
      // head
      ctx.fillStyle = "#bd4f29"; ctx.beginPath(); ctx.ellipse(-hr * 0.1, 0, hr * 1.12, hr * 0.95, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f2965d"; ctx.beginPath(); ctx.ellipse(-hr * 0.1, 0, hr * 0.98, hr * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      // nostrils
      ctx.fillStyle = "#7a2e12";
      ctx.beginPath(); ctx.arc(-hr * 0.85, -hr * 0.14, hr * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-hr * 0.85, hr * 0.14, hr * 0.08, 0, Math.PI * 2); ctx.fill();
      // eyes (big, on top, side by side)
      for (const sy of [-1, 1]) {
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-hr * 0.15, sy * hr * 0.45, hr * 0.38, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#bd4f29"; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath(); ctx.arc(-hr * 0.26, sy * hr * 0.45, hr * 0.17, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-hr * 0.32, sy * hr * 0.45 - hr * 0.05, hr * 0.06, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    };

    let raf;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const now = Date.now();
      ctx.clearRect(0, 0, W, H);
      // cells
      for (let n = 1; n <= N; n++) {
        const { x, y } = numToCell(n, cols, rows);
        ctx.fillStyle = n === N ? "#ffe082" : CELL_PALETTE[(x * 2 + y) % CELL_PALETTE.length];
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.5;
        ctx.strokeRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${Math.max(9, TILE * 0.3)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 2;
        ctx.fillText(String(n), x * TILE + TILE / 2, y * TILE + TILE / 2);
        ctx.shadowBlur = 0;
      }
      // start / finish labels
      const s1 = numToCell(1, cols, rows), sN = numToCell(N, cols, rows);
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.font = `700 ${TILE * 0.2}px sans-serif`;
      ctx.fillText("START", s1.x * TILE + TILE / 2, s1.y * TILE + TILE * 0.82);
      ctx.fillText("FINISH", sN.x * TILE + TILE / 2, sN.y * TILE + TILE * 0.82);

      Object.entries(lad).forEach(([f, to]) => drawLadder(+f, +to));
      Object.entries(sn).forEach(([f, to]) => drawSnake(+f, +to));

      // tokens
      const byCell = {};
      for (let pi = 0; pi < npRef.current; pi++) {
        const pos = posRef.current[pi];
        (byCell[pos] = byCell[pos] || []).push(pi);
      }
      Object.entries(byCell).forEach(([pos, list]) => {
        const p = +pos;
        const { cx, cy } = p < 1 ? { cx: -999, cy: -999 } : center(p);
        list.forEach((pi, k) => {
          if (p < 1) return;
          const ang = (k / list.length) * Math.PI * 2;
          const ox = list.length > 1 ? Math.cos(ang) * TILE * 0.2 : 0;
          const oy = list.length > 1 ? Math.sin(ang) * TILE * 0.2 : 0;
          const hop = (hopRef.current === pi) ? Math.abs(Math.sin(now * 0.02)) * TILE * 0.22 : 0;
          drawPawn(ctx, cx + ox, cy + oy, TILE * 0.3, PLAYER_COLORS[pi].color, PLAYER_COLORS[pi].dark, hop);
        });
      });
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const RosterPicker = () => (
    <div className={styles.roster}>
      <p className={styles.pickLabel}>{t("Jumlah pemain", "Players")}</p>
      <div className={styles.pickRow}>
        {[2, 3, 4].map((n) => (
          <button key={n} className={`${styles.pickBtn} ${roster.length === n ? styles.pickActive : ""}`} onClick={() => setCount(n)}>{n}</button>
        ))}
      </div>
      <div className={styles.playerList}>
        {roster.map((type, i) => (
          <div key={i} className={styles.playerRow}>
            <span className={styles.dot} style={{ background: PLAYER_COLORS[i].color }} />
            <span className={styles.pName}>{PLAYER_COLORS[i].name[language] ?? PLAYER_COLORS[i].name.id}</span>
            <button className={styles.typeBtn} onClick={() => toggleType(i)}>
              {type === "human" ? `🧑 ${t("Orang", "Human")}` : `🤖 ${t("Bot", "Bot")}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (screen === "setup") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.logo}><span className={styles.logoS}>ULAR</span><span className={styles.logoL}>&amp; TANGGA</span></div>
          <p className={styles.introDesc}>
            {t("Lempar dadu, naik tangga, hindari ular, dan capai kotak terakhir lebih dulu!",
               "Roll the dice, climb ladders, dodge snakes, and reach the last square first!")}
          </p>
          <RosterPicker />
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={startClassic}>🎲 {t("Main Klasik (100 kotak)", "Play Classic (100 squares)")}</button>
            <button className={styles.btnSecondary} onClick={() => { setScreen("build"); setBuildErr(""); }}>🛠️ {t("Buat Papan Sendiri", "Build Your Own Board")}</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "build") {
    return (
      <div className={styles.buildWrapper}>
        <div className={styles.buildCard}>
          <h1>🛠️ {t("Buat Papan", "Build Board")}</h1>
          <div className={styles.field}>
            <label>{t("Jumlah kotak", "Number of squares")} ({MIN_N}–{MAX_N})</label>
            <div className={styles.sliderRow}>
              <input type="range" min={MIN_N} max={MAX_N} value={cN} onChange={(e) => setCN(+e.target.value)} />
              <input type="number" min={MIN_N} max={MAX_N} value={cN}
                onChange={(e) => setCN(Math.max(MIN_N, Math.min(MAX_N, +e.target.value || MIN_N)))} className={styles.numInput} />
            </div>
          </div>
          <div className={styles.builderGrid}>
            <div className={styles.builderCol}>
              <h3>🪜 {t("Tangga", "Ladders")}</h3>
              <div className={styles.addRow}>
                <input type="number" placeholder={t("dari", "from")} value={lFrom} onChange={(e) => setLFrom(e.target.value)} />
                <span>→</span>
                <input type="number" placeholder={t("ke", "to")} value={lTo} onChange={(e) => setLTo(e.target.value)} />
                <button onClick={addLadder}>+</button>
              </div>
              <ul className={styles.itemList}>
                {ladders.map((l, i) => (<li key={i}><span>{l.from} → {l.to}</span><button onClick={() => setLadders((a) => a.filter((_, j) => j !== i))}>✕</button></li>))}
                {ladders.length === 0 && <li className={styles.empty}>{t("Belum ada", "None yet")}</li>}
              </ul>
            </div>
            <div className={styles.builderCol}>
              <h3>🐍 {t("Ular", "Snakes")}</h3>
              <div className={styles.addRow}>
                <input type="number" placeholder={t("kepala", "head")} value={sFrom} onChange={(e) => setSFrom(e.target.value)} />
                <span>→</span>
                <input type="number" placeholder={t("ekor", "tail")} value={sTo} onChange={(e) => setSTo(e.target.value)} />
                <button onClick={addSnake}>+</button>
              </div>
              <ul className={styles.itemList}>
                {snakes.map((s, i) => (<li key={i}><span>{s.from} → {s.to}</span><button onClick={() => setSnakes((a) => a.filter((_, j) => j !== i))}>✕</button></li>))}
                {snakes.length === 0 && <li className={styles.empty}>{t("Belum ada", "None yet")}</li>}
              </ul>
            </div>
          </div>
          <RosterPicker />
          {buildErr && <p className={styles.buildErr}>{buildErr}</p>}
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={startCustom}>▶️ {t("Mulai Main", "Start Game")}</button>
            <button className={styles.btnGhost} onClick={() => setScreen("setup")}>← {t("Kembali", "Back")}</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "win") {
    const w = winnerRef.current;
    const human = rosterRef.current[w] === "human";
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🏆🎉</div>
          <h1>{PLAYER_COLORS[w].name[language] ?? PLAYER_COLORS[w].name.id} {t("Menang!", "Wins!")}</h1>
          <p className={styles.introDesc}>{human ? t("Sampai puncak lebih dulu. Hebat!", "Reached the top first. Awesome!") : t("Bot menang. Coba lagi ya!", "Bot won. Try again!")}</p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={() => beginGame(cfgRef.current, rosterRef.current)}>🔄 {t("Main Lagi", "Play Again")}</button>
            <button className={styles.btnGhost} onClick={() => setScreen("setup")}>🏠 {t("Menu", "Menu")}</button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING
  const cur = turnRef.current;
  const curHuman = rosterRef.current[cur] === "human";
  const canRoll = curHuman && phaseRef.current === "roll";
  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.turnPill} style={{ background: PLAYER_COLORS[cur].color }}>
          {(PLAYER_COLORS[cur].name[language] ?? PLAYER_COLORS[cur].name.id)} {curHuman ? `· ${t("giliranmu", "your turn")}` : "· 🤖"}
        </div>
        <div className={styles.msg}>{msgRef.current}</div>
        <button className={styles.menuPill} onClick={() => setScreen("setup")}>🔄 {t("Baru", "New")}</button>
      </div>

      <div className={styles.boardWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <div className={styles.controls}>
        <Dice value={diceRef.current} rolling={rollingRef.current} onRoll={roll} disabled={!canRoll} />
        <div className={styles.rollHint}>
          {phaseRef.current === "rolling" ? t("Mengocok…", "Rolling…")
            : canRoll ? t("Ketuk dadu untuk lempar!", "Tap the dice to roll!")
            : t("Menunggu…", "Waiting…")}
        </div>
      </div>
    </div>
  );
}
