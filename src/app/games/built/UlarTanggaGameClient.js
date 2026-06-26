"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./UlarTanggaGameClient.module.css";

const PLAYER_COLORS = [
  { color: "#e53935", dark: "#b71c1c", name: { id: "Merah", en: "Red" } },
  { color: "#1e88e5", dark: "#0d47a1", name: { id: "Biru", en: "Blue" } },
  { color: "#43a047", dark: "#1b5e20", name: { id: "Hijau", en: "Green" } },
  { color: "#fbc02d", dark: "#f57f17", name: { id: "Kuning", en: "Yellow" } },
];

const CLASSIC = {
  N: 100,
  ladders: { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 },
  snakes: { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 },
};

const MIN_N = 50;
const MAX_N = 200;

function colsFor(N) {
  return Math.max(6, Math.ceil(Math.sqrt(N)));
}
function numToCell(n, cols, rows) {
  const idx = n - 1;
  const r = Math.floor(idx / cols);
  const p = idx % cols;
  const col = r % 2 === 0 ? p : cols - 1 - p;
  const rowTop = rows - 1 - r;
  return { x: col, y: rowTop };
}

export default function UlarTanggaGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("setup"); // setup | build | playing | win
  const [numPlayers, setNumPlayers] = useState(2);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);

  // custom builder state
  const [cN, setCN] = useState(64);
  const [ladders, setLadders] = useState([]); // {from,to}
  const [snakes, setSnakes] = useState([]);
  const [lFrom, setLFrom] = useState("");
  const [lTo, setLTo] = useState("");
  const [sFrom, setSFrom] = useState("");
  const [sTo, setSTo] = useState("");
  const [buildErr, setBuildErr] = useState("");

  const canvasRef = useRef(null);

  // active game config + state refs
  const cfgRef = useRef(CLASSIC);
  const posRef = useRef([]);       // player positions (0..N)
  const turnRef = useRef(0);
  const diceRef = useRef(null);
  const phaseRef = useRef("roll"); // roll | over
  const winnerRef = useRef(null);
  const msgRef = useRef("");
  const npRef = useRef(2);

  const beginGame = useCallback((cfg, players) => {
    cfgRef.current = cfg;
    npRef.current = players;
    posRef.current = Array.from({ length: players }, () => 0);
    turnRef.current = 0;
    diceRef.current = null;
    phaseRef.current = "roll";
    winnerRef.current = null;
    msgRef.current = "";
    setScreen("playing");
    rerender();
  }, [rerender]);

  const startClassic = useCallback(() => beginGame(CLASSIC, numPlayers), [beginGame, numPlayers]);

  // ── custom builder helpers ──
  const usedFrom = useMemo(() => {
    const s = new Set();
    ladders.forEach((l) => s.add(l.from));
    snakes.forEach((k) => s.add(k.from));
    return s;
  }, [ladders, snakes]);

  const addLadder = () => {
    const f = parseInt(lFrom, 10), to = parseInt(lTo, 10);
    if (!f || !to) return setBuildErr(t("Isi kotak asal & tujuan tangga.", "Enter ladder start & end."));
    if (f < 1 || to > cN || f >= to) return setBuildErr(t("Tangga harus naik (asal < tujuan) di dalam papan.", "Ladder must go up (start < end) within the board."));
    if (f === 1 || to === cN) return setBuildErr(t("Jangan taruh di kotak pertama/terakhir.", "Avoid the first/last square."));
    if (usedFrom.has(f) || usedFrom.has(to)) return setBuildErr(t("Kotak itu sudah dipakai.", "That square is already used."));
    setLadders((a) => [...a, { from: f, to }]);
    setLFrom(""); setLTo(""); setBuildErr("");
  };
  const addSnake = () => {
    const f = parseInt(sFrom, 10), to = parseInt(sTo, 10);
    if (!f || !to) return setBuildErr(t("Isi kepala & ekor ular.", "Enter snake head & tail."));
    if (to < 1 || f > cN || f <= to) return setBuildErr(t("Ular harus turun (kepala > ekor) di dalam papan.", "Snake must go down (head > tail) within the board."));
    if (f === cN || to === 1) return setBuildErr(t("Jangan taruh di kotak pertama/terakhir.", "Avoid the first/last square."));
    if (usedFrom.has(f) || usedFrom.has(to)) return setBuildErr(t("Kotak itu sudah dipakai.", "That square is already used."));
    setSnakes((a) => [...a, { from: f, to }]);
    setSFrom(""); setSTo(""); setBuildErr("");
  };

  const startCustom = () => {
    if (cN < MIN_N || cN > MAX_N) return setBuildErr(t(`Jumlah kotak ${MIN_N}–${MAX_N}.`, `Squares must be ${MIN_N}–${MAX_N}.`));
    const cfg = {
      N: cN,
      ladders: Object.fromEntries(ladders.map((l) => [l.from, l.to])),
      snakes: Object.fromEntries(snakes.map((s) => [s.from, s.to])),
    };
    beginGame(cfg, numPlayers);
  };

  // ── gameplay ──
  const nextTurn = useCallback(() => {
    turnRef.current = (turnRef.current + 1) % npRef.current;
    diceRef.current = null;
    phaseRef.current = "roll";
    rerender();
  }, [rerender]);

  const roll = useCallback(() => {
    if (phaseRef.current !== "roll") return;
    const N = cfgRef.current.N;
    const dice = 1 + Math.floor(Math.random() * 6);
    diceRef.current = dice;
    const pi = turnRef.current;
    let pos = posRef.current[pi];
    let next = pos + dice;
    if (next > N) {
      msgRef.current = t("Terlalu jauh, tetap di tempat.", "Too far — stay put.");
      rerender();
      setTimeout(() => finishTurn(dice === 6, false), 800);
      return;
    }
    pos = next;
    let note = "";
    if (cfgRef.current.ladders[pos]) {
      pos = cfgRef.current.ladders[pos];
      note = t("🪜 Naik tangga!", "🪜 Up the ladder!");
    } else if (cfgRef.current.snakes[pos]) {
      pos = cfgRef.current.snakes[pos];
      note = t("🐍 Digigit ular!", "🐍 Snake bite!");
    }
    posRef.current[pi] = pos;
    if (pi === 0) setHasChanges(true);
    const won = pos === N;
    msgRef.current = won ? t("Sampai puncak!", "Reached the top!") : note;
    rerender();
    setTimeout(() => finishTurn(dice === 6, won), note || won ? 850 : 450);
  }, [rerender, setHasChanges, t]);

  const finishTurn = useCallback((rolledSix, won) => {
    if (won) {
      winnerRef.current = turnRef.current;
      phaseRef.current = "over";
      setScreen("win");
      rerender();
      return;
    }
    if (rolledSix) {
      diceRef.current = null;
      phaseRef.current = "roll";
      msgRef.current = t("Dapat 6 — lempar lagi!", "Got a 6 — roll again!");
      rerender();
    } else {
      nextTurn();
    }
  }, [nextTurn, rerender, t]);

  // ── AI ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const pi = turnRef.current;
    if (pi === 0 || phaseRef.current !== "roll") return undefined;
    const id = setTimeout(() => roll(), 700);
    return () => clearTimeout(id);
  }, [screen, roll]);

  // ── render board ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const { N, ladders: lad, snakes: sn } = cfgRef.current;
    const cols = colsFor(N);
    const rows = Math.ceil(N / cols);
    const TILE = Math.max(20, Math.floor(560 / cols));
    const W = cols * TILE, H = rows * TILE;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const center = (n) => {
      const { x, y } = numToCell(n, cols, rows);
      return { cx: x * TILE + TILE / 2, cy: y * TILE + TILE / 2 };
    };

    let raf;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const now = Date.now();
      ctx.clearRect(0, 0, W, H);

      // cells
      for (let n = 1; n <= N; n++) {
        const { x, y } = numToCell(n, cols, rows);
        const even = (x + y) % 2 === 0;
        ctx.fillStyle = n === N ? "#ffd54f" : (even ? "#e8f5e9" : "#c8e6c9");
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.strokeStyle = "#a5d6a7";
        ctx.strokeRect(x * TILE + 0.5, y * TILE + 0.5, TILE - 1, TILE - 1);
        ctx.fillStyle = "#33691e";
        ctx.font = `${Math.max(8, TILE * 0.26)}px 'Segoe UI', sans-serif`;
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillText(String(n), x * TILE + 3, y * TILE + 2);
      }

      // ladders
      Object.entries(lad).forEach(([from, to]) => {
        const a = center(+from), b = center(+to);
        const ang = Math.atan2(b.cy - a.cy, b.cx - a.cx);
        const off = TILE * 0.18;
        const ox = Math.cos(ang + Math.PI / 2) * off;
        const oy = Math.sin(ang + Math.PI / 2) * off;
        ctx.strokeStyle = "#8d6e63";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.cx + ox, a.cy + oy); ctx.lineTo(b.cx + ox, b.cy + oy);
        ctx.moveTo(a.cx - ox, a.cy - oy); ctx.lineTo(b.cx - ox, b.cy - oy);
        ctx.stroke();
        const dist = Math.hypot(b.cx - a.cx, b.cy - a.cy);
        const rungs = Math.max(2, Math.floor(dist / (TILE * 0.5)));
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#a1887f";
        for (let i = 1; i < rungs; i++) {
          const tt = i / rungs;
          const mx = a.cx + (b.cx - a.cx) * tt, my = a.cy + (b.cy - a.cy) * tt;
          ctx.beginPath();
          ctx.moveTo(mx + ox, my + oy); ctx.lineTo(mx - ox, my - oy); ctx.stroke();
        }
      });

      // snakes
      Object.entries(sn).forEach(([from, to]) => {
        const a = center(+from), b = center(+to);
        const dist = Math.hypot(b.cx - a.cx, b.cy - a.cy);
        const ang = Math.atan2(b.cy - a.cy, b.cx - a.cx);
        const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
        ctx.strokeStyle = "#7b1fa2";
        ctx.lineWidth = Math.max(4, TILE * 0.16);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.cx, a.cy);
        const waves = Math.max(2, Math.floor(dist / (TILE * 0.9)));
        for (let i = 1; i <= waves; i++) {
          const tt = i / waves;
          const amp = Math.sin(tt * Math.PI * waves) * TILE * 0.3;
          const mx = a.cx + (b.cx - a.cx) * tt + px * amp;
          const my = a.cy + (b.cy - a.cy) * tt + py * amp;
          ctx.lineTo(mx, my);
        }
        ctx.stroke();
        ctx.lineWidth = 1;
        // head at 'from'
        ctx.fillStyle = "#6a1b9a";
        ctx.beginPath(); ctx.arc(a.cx, a.cy, TILE * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(a.cx - 3, a.cy - 2, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a.cx + 3, a.cy - 2, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(a.cx - 3, a.cy - 2, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(a.cx + 3, a.cy - 2, 1, 0, Math.PI * 2); ctx.fill();
      });

      // tokens
      const byCell = {};
      for (let pi = 0; pi < npRef.current; pi++) {
        const pos = posRef.current[pi];
        if (pos < 1) continue;
        (byCell[pos] = byCell[pos] || []).push(pi);
      }
      Object.entries(byCell).forEach(([pos, list]) => {
        const { cx, cy } = center(+pos);
        list.forEach((pi, k) => {
          const ang = (k / list.length) * Math.PI * 2;
          const ox = list.length > 1 ? Math.cos(ang) * TILE * 0.18 : 0;
          const oy = list.length > 1 ? Math.sin(ang) * TILE * 0.18 : 0;
          const r = TILE * 0.26;
          const isTurn = pi === turnRef.current;
          ctx.beginPath(); ctx.arc(cx + ox, cy + oy + 2, r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fill();
          ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
          ctx.fillStyle = PLAYER_COLORS[pi].color; ctx.fill();
          ctx.lineWidth = isTurn ? 3 : 1.5;
          ctx.strokeStyle = isTurn ? "#fff" : PLAYER_COLORS[pi].dark;
          ctx.stroke();
          if (isTurn && phaseRef.current === "roll") {
            const pulse = 1 + Math.sin(now * 0.008) * 0.15;
            ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r * 1.4 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.stroke();
          }
        });
      });
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const PlayerPicker = () => (
    <>
      <p className={styles.pickLabel}>{t("Jumlah pemain", "Players")}</p>
      <div className={styles.pickRow}>
        {[2, 3, 4].map((n) => (
          <button key={n} className={`${styles.pickBtn} ${numPlayers === n ? styles.pickActive : ""}`} onClick={() => setNumPlayers(n)}>{n}</button>
        ))}
      </div>
    </>
  );

  // ── SETUP ──
  if (screen === "setup") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🐍🪜</div>
          <h1>{t("Ular Tangga", "Snakes & Ladders")}</h1>
          <p className={styles.introDesc}>
            {t("Lempar dadu, naik tangga, hindari ular, dan capai kotak terakhir lebih dulu!",
               "Roll the dice, climb ladders, dodge snakes, and reach the last square first!")}
          </p>
          <PlayerPicker />
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={startClassic}>
              🎲 {t("Main Klasik (100 kotak)", "Play Classic (100 squares)")}
            </button>
            <button className={styles.btnSecondary} onClick={() => { setScreen("build"); setBuildErr(""); }}>
              🛠️ {t("Buat Papan Sendiri", "Build Your Own Board")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BUILD (custom) ──
  if (screen === "build") {
    return (
      <div className={styles.buildWrapper}>
        <div className={styles.buildCard}>
          <h1>🛠️ {t("Buat Papan", "Build Board")}</h1>

          <div className={styles.field}>
            <label>{t("Jumlah kotak", "Number of squares")} ({MIN_N}–{MAX_N})</label>
            <input type="range" min={MIN_N} max={MAX_N} value={cN}
              onChange={(e) => setCN(+e.target.value)} />
            <input type="number" min={MIN_N} max={MAX_N} value={cN}
              onChange={(e) => setCN(Math.max(MIN_N, Math.min(MAX_N, +e.target.value || MIN_N)))}
              className={styles.numInput} />
          </div>

          <div className={styles.builderGrid}>
            {/* Ladders */}
            <div className={styles.builderCol}>
              <h3>🪜 {t("Tangga", "Ladders")}</h3>
              <div className={styles.addRow}>
                <input type="number" placeholder={t("dari", "from")} value={lFrom} onChange={(e) => setLFrom(e.target.value)} />
                <span>→</span>
                <input type="number" placeholder={t("ke", "to")} value={lTo} onChange={(e) => setLTo(e.target.value)} />
                <button onClick={addLadder}>+</button>
              </div>
              <ul className={styles.itemList}>
                {ladders.map((l, i) => (
                  <li key={i}><span>{l.from} → {l.to}</span>
                    <button onClick={() => setLadders((a) => a.filter((_, j) => j !== i))}>✕</button></li>
                ))}
                {ladders.length === 0 && <li className={styles.empty}>{t("Belum ada", "None yet")}</li>}
              </ul>
            </div>
            {/* Snakes */}
            <div className={styles.builderCol}>
              <h3>🐍 {t("Ular", "Snakes")}</h3>
              <div className={styles.addRow}>
                <input type="number" placeholder={t("kepala", "head")} value={sFrom} onChange={(e) => setSFrom(e.target.value)} />
                <span>→</span>
                <input type="number" placeholder={t("ekor", "tail")} value={sTo} onChange={(e) => setSTo(e.target.value)} />
                <button onClick={addSnake}>+</button>
              </div>
              <ul className={styles.itemList}>
                {snakes.map((s, i) => (
                  <li key={i}><span>{s.from} → {s.to}</span>
                    <button onClick={() => setSnakes((a) => a.filter((_, j) => j !== i))}>✕</button></li>
                ))}
                {snakes.length === 0 && <li className={styles.empty}>{t("Belum ada", "None yet")}</li>}
              </ul>
            </div>
          </div>

          <PlayerPicker />
          {buildErr && <p className={styles.buildErr}>{buildErr}</p>}
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={startCustom}>
              ▶️ {t("Mulai Main", "Start Game")}
            </button>
            <button className={styles.btnGhost} onClick={() => setScreen("setup")}>
              ← {t("Kembali", "Back")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WIN ──
  if (screen === "win") {
    const w = winnerRef.current;
    const won = w === 0;
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>{won ? "🏆🎉" : "🤖"}</div>
          <h1>{won ? t("Kamu Menang!", "You Win!") : `${PLAYER_COLORS[w].name[language] ?? PLAYER_COLORS[w].name.id} ${t("Menang", "Wins")}`}</h1>
          <p className={styles.introDesc}>
            {won ? t("Kamu sampai puncak lebih dulu. Hebat!", "You reached the top first. Awesome!")
                 : t("Coba lagi ya!", "Try again!")}
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={() => beginGame(cfgRef.current, npRef.current)}>
              🔄 {t("Main Lagi", "Play Again")}
            </button>
            <button className={styles.btnGhost} onClick={() => setScreen("setup")}>
              🏠 {t("Menu", "Menu")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const cur = turnRef.current;
  const myTurn = cur === 0;
  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.turnPill} style={{ background: PLAYER_COLORS[cur].color }}>
          {myTurn ? t("Giliranmu", "Your turn") : (PLAYER_COLORS[cur].name[language] ?? PLAYER_COLORS[cur].name.id)}
        </div>
        <div className={styles.msg}>{msgRef.current}</div>
        <button className={styles.menuPill} onClick={() => setScreen("setup")}>← {t("Menu", "Menu")}</button>
      </div>

      <div className={styles.boardWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      <div className={styles.controls}>
        <div className={`${styles.die} ${diceRef.current ? styles.dieRolled : ""}`}>
          {diceRef.current ? diceRef.current : "🎲"}
        </div>
        <button className={styles.rollBtn} disabled={!myTurn || phaseRef.current !== "roll"} onClick={roll}>
          {t("Lempar Dadu", "Roll Dice")}
        </button>
      </div>
    </div>
  );
}
