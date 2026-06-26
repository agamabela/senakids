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

// pixel-space ladder between cell-centres a and b
function drawLadderShape(ctx, a, b, TILE) {
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
}

// pixel-space snake; head at a, tail at b
function drawSnakeShape(ctx, a, b, TILE, seed = 0) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const nx = -uy, ny = ux;
  const headHalf = Math.max(8, TILE * 0.24);
  const tailHalf = Math.max(2.5, TILE * 0.07);
  const amp = Math.min(TILE * 0.5, dist * 0.16);
  const cycles = dist > TILE * 4 ? 2.5 : 1.5;
  const dir = seed % 2 ? 1 : -1;
  const NS = 60;
  const P = [];
  for (let i = 0; i <= NS; i++) {
    const t = i / NS;
    const env = Math.sin(t * Math.PI);
    const o = dir * amp * env * Math.sin(t * Math.PI * cycles);
    P.push({ x: a.cx + ux * dist * t + nx * o, y: a.cy + uy * dist * t + ny * o, t });
  }
  const L = [], R = [], NN = [];
  for (let i = 0; i <= NS; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[Math.min(NS, i + 1)];
    let tx = p1.x - p0.x, ty = p1.y - p0.y; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    const npx = -ty, npy = tx;
    NN.push({ x: npx, y: npy });
    const hw = headHalf + (tailHalf - headHalf) * P[i].t;
    L.push({ x: P[i].x + npx * hw, y: P[i].y + npy * hw });
    R.push({ x: P[i].x - npx * hw, y: P[i].y - npy * hw });
  }
  const tubePath = () => {
    ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y);
    for (let i = 1; i <= NS; i++) ctx.lineTo(L[i].x, L[i].y);
    for (let i = NS; i >= 0; i--) ctx.lineTo(R[i].x, R[i].y);
    ctx.closePath();
  };
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.save(); ctx.translate(0, 3); ctx.globalAlpha = 0.16; tubePath(); ctx.fillStyle = "#000"; ctx.fill(); ctx.restore();
  const g = ctx.createLinearGradient(a.cx, a.cy, b.cx, b.cy);
  g.addColorStop(0, "#f0985c"); g.addColorStop(1, "#dd7038");
  tubePath(); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = "#b04a26"; ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= NS; i++) { const hw = (headHalf + (tailHalf - headHalf) * P[i].t) * 0.5; const x = P[i].x + NN[i].x * hw, y = P[i].y + NN[i].y * hw; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  for (let i = NS; i >= 0; i--) { const hw = (headHalf + (tailHalf - headHalf) * P[i].t) * 0.5; ctx.lineTo(P[i].x - NN[i].x * hw, P[i].y - NN[i].y * hw); }
  ctx.closePath(); ctx.fillStyle = "rgba(255,224,180,.5)"; ctx.fill();
  ctx.strokeStyle = "rgba(150,65,25,.32)"; ctx.lineWidth = 2;
  for (let i = 4; i < NS - 2; i += 3) {
    const hw = headHalf + (tailHalf - headHalf) * P[i].t;
    ctx.beginPath();
    ctx.moveTo(P[i].x + NN[i].x * hw * 0.9, P[i].y + NN[i].y * hw * 0.9);
    ctx.quadraticCurveTo(P[i + 1].x, P[i + 1].y, P[i].x - NN[i].x * hw * 0.9, P[i].y - NN[i].y * hw * 0.9);
    ctx.stroke();
  }
  const ha = Math.atan2(P[1].y - P[0].y, P[1].x - P[0].x);
  const hr = headHalf * 1.5;
  ctx.save();
  ctx.translate(a.cx, a.cy); ctx.rotate(ha);
  ctx.strokeStyle = "#e0152b"; ctx.lineWidth = 2.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-hr * 0.85, 0); ctx.lineTo(-hr * 1.6, 0); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-hr * 1.6, 0); ctx.lineTo(-hr * 1.95, -hr * 0.26);
  ctx.moveTo(-hr * 1.6, 0); ctx.lineTo(-hr * 1.95, hr * 0.26);
  ctx.stroke();
  ctx.fillStyle = "#b04a26"; ctx.beginPath(); ctx.ellipse(-hr * 0.05, 0, hr * 1.1, hr * 0.92, 0, 0, Math.PI * 2); ctx.fill();
  const hg = ctx.createLinearGradient(0, -hr, 0, hr);
  hg.addColorStop(0, "#f6a268"); hg.addColorStop(1, "#e07a40");
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(-hr * 0.05, 0, hr * 0.96, hr * 0.78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8a3c18";
  ctx.beginPath(); ctx.arc(-hr * 0.82, -hr * 0.14, hr * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-hr * 0.82, hr * 0.14, hr * 0.07, 0, Math.PI * 2); ctx.fill();
  for (const sy of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-hr * 0.12, sy * hr * 0.44, hr * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#b04a26"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.arc(-hr * 0.22, sy * hr * 0.44, hr * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-hr * 0.28, sy * hr * 0.44 - hr * 0.05, hr * 0.06, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// draw the numbered board cells
function drawBoardCells(ctx, N, cols, rows, TILE) {
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
  const s1 = numToCell(1, cols, rows), sN = numToCell(N, cols, rows);
  ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.font = `700 ${TILE * 0.2}px sans-serif`;
  ctx.fillText("START", s1.x * TILE + TILE / 2, s1.y * TILE + TILE * 0.82);
  ctx.fillText("FINISH", sN.x * TILE + TILE / 2, sN.y * TILE + TILE * 0.82);
}

// inverse of numToCell: grid (col,rowTop) -> cell number
function colRowToNum(col, rowTop, cols, rows) {
  const r = rows - 1 - rowTop;
  const p = r % 2 === 0 ? col : cols - 1 - col;
  return r * cols + p + 1;
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
  const [tool, setTool] = useState("ladder"); // ladder | snake | erase
  const [buildErr, setBuildErr] = useState("");

  const canvasRef = useRef(null);
  const buildCanvasRef = useRef(null);
  const dragRef = useRef(null);        // { start, x, y } during a drag
  const laddersRef = useRef(ladders); laddersRef.current = ladders;
  const snakesRef = useRef(snakes); snakesRef.current = snakes;
  const toolRef = useRef(tool); toolRef.current = tool;
  const cNRef = useRef(cN); cNRef.current = cN;

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

  const usedCells = useMemo(() => {
    const s = new Set();
    ladders.forEach((l) => { s.add(l.from); s.add(l.to); });
    snakes.forEach((k) => { s.add(k.from); s.add(k.to); });
    return s;
  }, [ladders, snakes]);

  // ── drag-to-place builder ──
  const buildGeom = () => {
    const N = cNRef.current;
    const cols = colsFor(N);
    const rows = Math.ceil(N / cols);
    const TILE = Math.max(20, Math.floor(460 / cols));
    return { N, cols, rows, TILE, W: cols * TILE, H: rows * TILE };
  };

  const cellFromEvent = (e) => {
    const canvas = buildCanvasRef.current;
    if (!canvas) return null;
    const { cols, rows, W, H, N } = buildGeom();
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (W / rect.width);
    const py = (e.clientY - rect.top) * (H / rect.height);
    const TILE = W / cols;
    const col = Math.floor(px / TILE), rowTop = Math.floor(py / TILE);
    if (col < 0 || col >= cols || rowTop < 0 || rowTop >= rows) return null;
    const n = colRowToNum(col, rowTop, cols, rows);
    return n >= 1 && n <= N ? n : null;
  };

  const removeAtCell = (n) => {
    setLadders((a) => a.filter((l) => l.from !== n && l.to !== n));
    setSnakes((a) => a.filter((s) => s.from !== n && s.to !== n));
  };

  const placeLink = (a, b) => {
    if (a == null || b == null || a === b) { dragRef.current = null; rerender(); return; }
    const N = cNRef.current;
    if (usedCells.has(a) || usedCells.has(b)) {
      setBuildErr(t("Kotak itu sudah dipakai.", "That square is already used."));
      dragRef.current = null; rerender(); return;
    }
    if (tool === "ladder") {
      const from = Math.min(a, b), to = Math.max(a, b);
      if (from === N || to === 1) { setBuildErr(""); dragRef.current = null; rerender(); return; }
      setLadders((arr) => [...arr, { from, to }]);
    } else if (tool === "snake") {
      const head = Math.max(a, b), tail = Math.min(a, b);
      setSnakes((arr) => [...arr, { from: head, to: tail }]);
    }
    setBuildErr("");
    dragRef.current = null;
    rerender();
  };

  const onBuildDown = (e) => {
    e.preventDefault();
    const n = cellFromEvent(e);
    if (n == null) return;
    if (toolRef.current === "erase") { removeAtCell(n); return; }
    const rect = buildCanvasRef.current.getBoundingClientRect();
    const { W, H } = buildGeom();
    dragRef.current = { start: n, x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
    rerender();
  };
  const onBuildMove = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const rect = buildCanvasRef.current.getBoundingClientRect();
    const { W, H } = buildGeom();
    dragRef.current.x = (e.clientX - rect.left) * (W / rect.width);
    dragRef.current.y = (e.clientY - rect.top) * (H / rect.height);
  };
  const onBuildUp = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const start = dragRef.current.start;
    const end = cellFromEvent(e);
    placeLink(start, end);
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
    const drawLadder = (from, to) => drawLadderShape(ctx, center(from), center(to), TILE);
    const drawSnake = (from, to) => drawSnakeShape(ctx, center(from), center(to), TILE, from);

    let raf;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const now = Date.now();
      ctx.clearRect(0, 0, W, H);
      drawBoardCells(ctx, N, cols, rows, TILE);

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

  // ── build-mode interactive board ──
  useEffect(() => {
    if (screen !== "build") return undefined;
    const canvas = buildCanvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const { N, cols, rows, TILE, W, H } = buildGeom();
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      const center = (n) => { const { x, y } = numToCell(n, cols, rows); return { cx: x * TILE + TILE / 2, cy: y * TILE + TILE / 2 }; };
      ctx.clearRect(0, 0, W, H);
      drawBoardCells(ctx, N, cols, rows, TILE);
      laddersRef.current.forEach((l) => { if (l.from <= N && l.to <= N) drawLadderShape(ctx, center(l.from), center(l.to), TILE); });
      snakesRef.current.forEach((s) => { if (s.from <= N && s.to <= N) drawSnakeShape(ctx, center(s.from), center(s.to), TILE, s.from); });
      const d = dragRef.current;
      if (d) {
        const a = center(d.start);
        const sc = numToCell(d.start, cols, rows);
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
        ctx.strokeRect(sc.x * TILE + 2, sc.y * TILE + 2, TILE - 4, TILE - 4);
        ctx.setLineDash([7, 6]); ctx.lineWidth = 4;
        ctx.strokeStyle = toolRef.current === "snake" ? "#dd7038" : "#2f6b1e";
        ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(d.x, d.y); ctx.stroke();
        ctx.setLineDash([]);
      }
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
              <input type="range" min={MIN_N} max={MAX_N} step={1} value={cN} onChange={(e) => setCN(+e.target.value)} />
              <input type="number" min={MIN_N} max={MAX_N} value={cN}
                onChange={(e) => setCN(Math.max(MIN_N, Math.min(MAX_N, +e.target.value || MIN_N)))} className={styles.numInput} />
            </div>
          </div>

          <div className={styles.toolRow}>
            <button className={`${styles.toolBtn} ${tool === "ladder" ? styles.toolActive : ""}`} onClick={() => setTool("ladder")}>🪜 {t("Tangga", "Ladder")}</button>
            <button className={`${styles.toolBtn} ${tool === "snake" ? styles.toolActive : ""}`} onClick={() => setTool("snake")}>🐍 {t("Ular", "Snake")}</button>
            <button className={`${styles.toolBtn} ${tool === "erase" ? styles.toolActive : ""}`} onClick={() => setTool("erase")}>🧽 {t("Hapus", "Erase")}</button>
          </div>
          <p className={styles.buildHint}>
            {tool === "erase"
              ? t("Ketuk tangga/ular untuk menghapus.", "Tap a ladder/snake to remove it.")
              : tool === "snake"
              ? t("Seret dari kepala ke ekor untuk membuat ular.", "Drag from head to tail to make a snake.")
              : t("Seret dari kotak bawah ke kotak atas untuk membuat tangga.", "Drag from a lower square to a higher one to make a ladder.")}
          </p>

          <div className={styles.buildBoardWrap}>
            <canvas
              ref={buildCanvasRef}
              className={styles.buildCanvas}
              onPointerDown={onBuildDown}
              onPointerMove={onBuildMove}
              onPointerUp={onBuildUp}
              onPointerLeave={onBuildUp}
            />
          </div>

          <div className={styles.countRow}>
            <span>🪜 {ladders.length}</span>
            <span>🐍 {snakes.length}</span>
            <button className={styles.clearBtn} onClick={() => { setLadders([]); setSnakes([]); setBuildErr(""); }}>
              🗑️ {t("Bersihkan", "Clear")}
            </button>
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
