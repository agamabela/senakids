"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import Dice from "@/components/Dice";
import styles from "./LudoGameClient.module.css";

const TILE = 30;
const SIZE = 15 * TILE;

// 52-cell main loop (validated orthogonal/diagonal-corner adjacency)
const MAIN = [
  [6,13],[6,12],[6,11],[6,10],[6,9],
  [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  [0,7],
  [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],
  [6,5],[6,4],[6,3],[6,2],[6,1],[6,0],
  [7,0],
  [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],
  [9,6],[10,6],[11,6],[12,6],[13,6],[14,6],
  [14,7],
  [14,8],[13,8],[12,8],[11,8],[10,8],[9,8],
  [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],
  [7,14],
  [6,14],
];

// player order: red(bottom), green(left), yellow(top), blue(right)
const PLAYERS = [
  {
    key: "red", color: "#e53935", dark: "#b71c1c", name: { id: "Merah", en: "Red" },
    start: 0,
    home: [[7,13],[7,12],[7,11],[7,10],[7,9]], goal: [7,8],
    base: [[2,11],[4,11],[2,13],[4,13]],
  },
  {
    key: "green", color: "#43a047", dark: "#1b5e20", name: { id: "Hijau", en: "Green" },
    start: 13,
    home: [[1,7],[2,7],[3,7],[4,7],[5,7]], goal: [6,7],
    base: [[2,2],[4,2],[2,4],[4,4]],
  },
  {
    key: "yellow", color: "#fbc02d", dark: "#f57f17", name: { id: "Kuning", en: "Yellow" },
    start: 26,
    home: [[7,1],[7,2],[7,3],[7,4],[7,5]], goal: [7,6],
    base: [[10,2],[12,2],[10,4],[12,4]],
  },
  {
    key: "blue", color: "#1e88e5", dark: "#0d47a1", name: { id: "Biru", en: "Blue" },
    start: 39,
    home: [[13,7],[12,7],[11,7],[10,7],[9,7]], goal: [8,7],
    base: [[10,11],[12,11],[10,13],[12,13]],
  },
];

const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const GOAL_PROGRESS = 56; // 0..50 main, 51..55 home, 56 goal

function cellOfProgress(pi, progress) {
  const p = PLAYERS[pi];
  if (progress >= GOAL_PROGRESS) return p.goal;
  if (progress >= 51) return p.home[progress - 51];
  return MAIN[(p.start + progress) % 52];
}

function mainIndexOf(pi, progress) {
  if (progress < 0 || progress > 50) return -1;
  return (PLAYERS[pi].start + progress) % 52;
}

export default function LudoGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("intro");
  const [roster, setRoster] = useState(["human", "bot", "bot", "bot"]);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((f) => f + 1), []);
  const rosterRef = useRef(roster);
  rosterRef.current = roster;

  const setCount = (n) => setRoster((cur) => {
    const next = [...cur];
    while (next.length < n) next.push("bot");
    next.length = n;
    if (next.every((x) => x === "bot")) next[0] = "human";
    return next;
  });
  const toggleType = (i) => setRoster((cur) => cur.map((x, j) => (j === i ? (x === "human" ? "bot" : "human") : x)));

  const canvasRef = useRef(null);
  const tokenHitsRef = useRef([]); // {pi, ti, x, y, r}

  // game refs
  const tokensRef = useRef([]);     // tokens[pi][ti] = progress (-1 base .. 56 goal)
  const turnRef = useRef(0);        // current player index
  const diceRef = useRef(null);     // last rolled value
  const rollingRef = useRef(false);
  const phaseRef = useRef("roll");  // "roll" | "rolling" | "move" | "over"
  const movableRef = useRef([]);    // token indices movable this roll
  const winnerRef = useRef(null);
  const msgRef = useRef("");
  const activeCountRef = useRef(4);

  const start = useCallback((rost) => {
    activeCountRef.current = rost.length;
    rosterRef.current = rost;
    tokensRef.current = PLAYERS.map(() => [-1, -1, -1, -1]);
    turnRef.current = 0;
    diceRef.current = null;
    rollingRef.current = false;
    phaseRef.current = "roll";
    movableRef.current = [];
    winnerRef.current = null;
    msgRef.current = "";
    setScreen("playing");
    rerender();
  }, [rerender]);

  const isActive = (pi) => pi < activeCountRef.current;
  const isAI = (pi) => rosterRef.current[pi] === "bot";

  const computeMovable = (pi, dice) => {
    const toks = tokensRef.current[pi];
    const out = [];
    toks.forEach((pr, ti) => {
      if (pr >= GOAL_PROGRESS) return;
      if (pr === -1) { if (dice === 6) out.push(ti); return; }
      if (pr + dice <= GOAL_PROGRESS) out.push(ti);
    });
    return out;
  };

  // returns {captured: bool} after applying move
  const applyMove = (pi, ti, dice) => {
    const toks = tokensRef.current[pi];
    let pr = toks[ti];
    if (pr === -1) pr = 0;            // come out of base onto start
    else pr = pr + dice;
    toks[ti] = pr;

    let captured = false;
    const mi = mainIndexOf(pi, pr);
    if (mi !== -1 && !SAFE.has(mi)) {
      for (let op = 0; op < PLAYERS.length; op++) {
        if (op === pi || !isActive(op)) continue;
        const ot = tokensRef.current[op];
        ot.forEach((opr, oti) => {
          if (opr >= 0 && opr <= 50 && mainIndexOf(op, opr) === mi) {
            ot[oti] = -1; // send home
            captured = true;
          }
        });
      }
    }
    return { captured };
  };

  const checkWin = (pi) => tokensRef.current[pi].every((p) => p >= GOAL_PROGRESS);

  const nextTurn = useCallback(() => {
    let n = turnRef.current;
    for (let i = 0; i < PLAYERS.length; i++) {
      n = (n + 1) % PLAYERS.length;
      if (isActive(n)) break;
    }
    turnRef.current = n;
    diceRef.current = null;
    movableRef.current = [];
    phaseRef.current = "roll";
    rerender();
  }, [rerender]);

  const finishTurn = useCallback((rolledSix, won) => {
    if (won) {
      winnerRef.current = turnRef.current;
      phaseRef.current = "over";
      setScreen("win");
      rerender();
      return;
    }
    if (rolledSix) {
      // same player rolls again
      diceRef.current = null;
      movableRef.current = [];
      phaseRef.current = "roll";
      rerender();
    } else {
      nextTurn();
    }
  }, [nextTurn, rerender]);

  const doMove = useCallback((ti) => {
    const pi = turnRef.current;
    const dice = diceRef.current;
    const { captured } = applyMove(pi, ti, dice);
    if (pi === 0) setHasChanges(true);
    const won = checkWin(pi);
    msgRef.current = captured
      ? t("Tangkap! Bidak lawan pulang.", "Capture! Sent a token home.")
      : "";
    finishTurn(dice === 6, won);
  }, [finishTurn, setHasChanges, t]);

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
      const mv = computeMovable(pi, dice);
      movableRef.current = mv;
      if (mv.length === 0) {
        msgRef.current = t("Tidak ada langkah.", "No moves.");
        phaseRef.current = "move";
        rerender();
        setTimeout(() => finishTurn(dice === 6, false), 700);
        return;
      }
      phaseRef.current = "move";
      msgRef.current = "";
      rerender();
      // auto-move if only one option (human convenience)
      if (mv.length === 1 && rosterRef.current[turnRef.current] === "human") {
        setTimeout(() => { if (phaseRef.current === "move") doMove(mv[0]); }, 350);
      }
    }, 650);
  }, [doMove, finishTurn, rerender, t]);

  // ── AI driver ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const pi = turnRef.current;
    if (!isAI(pi) || phaseRef.current === "over") return undefined;

    let timers = [];
    if (phaseRef.current === "roll") {
      timers.push(setTimeout(() => roll(), 600));
    } else if (phaseRef.current === "move" && movableRef.current.length > 0) {
      timers.push(setTimeout(() => {
        if (phaseRef.current !== "move") return;
        const dice = diceRef.current;
        const mv = movableRef.current;
        if (!mv.length) return;
        // score moves
        let best = mv[0], bestScore = -Infinity;
        for (const ti of mv) {
          const pr = tokensRef.current[pi][ti];
          const np = pr === -1 ? 0 : pr + dice;
          let score = np;
          // capture?
          const mi = mainIndexOf(pi, np);
          if (mi !== -1 && !SAFE.has(mi)) {
            for (let op = 0; op < PLAYERS.length; op++) {
              if (op === pi || !isActive(op)) continue;
              if (tokensRef.current[op].some((opr) => opr >= 0 && opr <= 50 && mainIndexOf(op, opr) === mi)) score += 1000;
            }
          }
          if (np >= GOAL_PROGRESS) score += 500;
          if (pr === -1) score += 60; // bring out on a 6
          if (score > bestScore) { bestScore = score; best = ti; }
        }
        doMove(best);
      }, 650));
    }
    return () => timers.forEach(clearTimeout);
  }, [screen, doMove, roll]);

  // ── Canvas render ──
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    let raf;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const now = Date.now();
      ctx.clearRect(0, 0, SIZE, SIZE);
      // background
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, SIZE, SIZE);

      // base corners
      PLAYERS.forEach((p, pi) => {
        if (!isActive(pi)) return;
        const corners = { red:[0,9], green:[0,0], yellow:[9,0], blue:[9,9] }[p.key];
        const bx = corners[0] * TILE, by = corners[1] * TILE;
        ctx.fillStyle = p.color;
        ctx.fillRect(bx, by, 6 * TILE, 6 * TILE);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx + TILE, by + TILE, 4 * TILE, 4 * TILE);
        ctx.fillStyle = p.color;
        ctx.fillRect(bx + 1.4 * TILE, by + 1.4 * TILE, 3.2 * TILE, 3.2 * TILE);
      });

      // main path cells
      const drawCell = (x, y, fill, stroke = "#cfcfcf") => {
        ctx.fillStyle = fill;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.strokeRect(x * TILE + 0.5, y * TILE + 0.5, TILE - 1, TILE - 1);
      };
      MAIN.forEach(([x, y], idx) => {
        let fill = "#ffffff";
        const owner = PLAYERS.find((p) => p.start === idx);
        if (owner) fill = owner.color;
        else if (SAFE.has(idx)) fill = "#eeeeee";
        drawCell(x, y, fill);
        if (SAFE.has(idx) && !owner) {
          ctx.fillStyle = "#bdbdbd";
          ctx.font = `${TILE * 0.7}px serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("★", x * TILE + TILE / 2, y * TILE + TILE / 2 + 1);
        }
      });
      // home columns + goal
      PLAYERS.forEach((p, pi) => {
        if (!isActive(pi)) return;
        p.home.forEach(([x, y]) => drawCell(x, y, p.color, p.dark));
        const [gx, gy] = p.goal;
        drawCell(gx, gy, p.color, p.dark);
      });
      // center cover
      ctx.fillStyle = "#37474f";
      ctx.beginPath();
      ctx.arc(7.5 * TILE, 7.5 * TILE, TILE * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // tokens
      tokenHitsRef.current = [];
      const humanTurn = rosterRef.current[turnRef.current] === "human";
      const movableSet = (humanTurn && phaseRef.current === "move")
        ? new Set(movableRef.current) : new Set();
      PLAYERS.forEach((p, pi) => {
        if (!isActive(pi)) return;
        const toks = tokensRef.current[pi];
        // group tokens by cell to offset overlaps
        toks.forEach((pr, ti) => {
          let cx, cy;
          if (pr === -1) {
            const [bxc, byc] = p.base[ti];
            cx = bxc * TILE + TILE / 2; cy = byc * TILE + TILE / 2;
          } else {
            const [x, y] = cellOfProgress(pi, pr);
            cx = x * TILE + TILE / 2; cy = y * TILE + TILE / 2;
          }
          const r = TILE * 0.34;
          const isMv = pi === turnRef.current && movableSet.has(ti);
          ctx.beginPath();
          ctx.arc(cx, cy + 2, r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.fill();
          ctx.lineWidth = isMv ? 3 : 1.5;
          ctx.strokeStyle = isMv ? "#fff200" : p.dark;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill();
          if (isMv) {
            const pulse = 1 + Math.sin(now * 0.008) * 0.12;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.35 * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,242,0,0.7)"; ctx.lineWidth = 2; ctx.stroke();
          }
          tokenHitsRef.current.push({ pi, ti, x: cx, y: cy, r: r * 1.4 });
        });
      });
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  // ── Canvas tap (human token selection) ──
  const onCanvasPointer = useCallback((e) => {
    if (rosterRef.current[turnRef.current] !== "human" || phaseRef.current !== "move") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = SIZE / rect.width;
    const px = (e.clientX - rect.left) * scale;
    const py = (e.clientY - rect.top) * scale;
    const mv = new Set(movableRef.current);
    const cur = turnRef.current;
    for (const h of tokenHitsRef.current) {
      if (h.pi !== cur || !mv.has(h.ti)) continue;
      const d = Math.hypot(px - h.x, py - h.y);
      if (d <= h.r) { doMove(h.ti); return; }
    }
  }, [doMove]);

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>🎲🟥🟩🟨🟦</div>
          <h1>{t("Ludo", "Ludo")}</h1>
          <p className={styles.introDesc}>
            {t("Keluarkan semua bidakmu dari markas, kelilingi papan, dan capai pusat lebih dulu!",
               "Get all your tokens out, travel around the board, and reach the center first!")}
          </p>
          <p className={styles.pickLabel}>{t("Jumlah pemain", "Number of players")}</p>
          <div className={styles.pickRow}>
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                className={`${styles.pickBtn} ${roster.length === n ? styles.pickActive : ""}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className={styles.playerList}>
            {roster.map((type, i) => (
              <div key={i} className={styles.playerRow}>
                <span className={styles.dot} style={{ background: PLAYERS[i].color }} />
                <span className={styles.pName}>{PLAYERS[i].name[language] ?? PLAYERS[i].name.id}</span>
                <button className={styles.typeBtn} onClick={() => toggleType(i)}>
                  {type === "human" ? `🧑 ${t("Orang", "Human")}` : `🤖 ${t("Bot", "Bot")}`}
                </button>
              </div>
            ))}
          </div>
          <button className={styles.btnPrimary} onClick={() => start(roster)}>
            ▶️ {t("Mulai Main", "Start Game")}
          </button>
          <p className={styles.controlHint}>
            {t("Ketuk dadu untuk lempar, lalu ketuk bidak yang menyala. Angka 6 untuk keluar markas & lempar lagi.",
               "Tap the dice to roll, then tap a glowing token. Roll a 6 to leave base & roll again.")}
          </p>
        </div>
      </div>
    );
  }

  // ── WIN ──
  if (screen === "win") {
    const w = winnerRef.current;
    const won = rosterRef.current[w] === "human";
    return (
      <div className={styles.introWrapper}>
        <div className={styles.introCard}>
          <div className={styles.introEmoji}>{won ? "🏆🎉" : "🤖"}</div>
          <h1>{PLAYERS[w].name[language] ?? PLAYERS[w].name.id} {t("Menang!", "Wins!")}</h1>
          <p className={styles.introDesc}>
            {won
              ? t("Semua bidak sampai di pusat. Hebat!", "All tokens reached the center. Great job!")
              : t("Bot menang. Coba lagi ya!", "A bot won. Try again!")}
          </p>
          <div className={styles.endButtons}>
            <button className={styles.btnPrimary} onClick={() => start(rosterRef.current)}>
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
  const cur = turnRef.current;
  const curP = PLAYERS[cur];
  const myTurn = rosterRef.current[cur] === "human";
  return (
    <div className={styles.gameWrapper}>
      <div className={styles.topBar}>
        <div className={styles.turnPill} style={{ background: curP.color }}>
          {(curP.name[language] ?? curP.name.id)} {myTurn ? `· ${t("giliranmu", "your turn")}` : "· 🤖"}
        </div>
        <div className={styles.msg}>{msgRef.current}</div>
        <button className={styles.menuPill} onClick={() => setScreen("intro")}>🔄 {t("Baru", "New")}</button>
      </div>

      <div className={styles.playArea}>
        <div className={styles.boardWrap}>
          <canvas ref={canvasRef} className={styles.canvas} onPointerDown={onCanvasPointer} />
        </div>

        <div className={styles.controls}>
          <Dice value={diceRef.current} rolling={rollingRef.current} onRoll={roll} disabled={!myTurn || phaseRef.current !== "roll"} />
          <div className={styles.rollHint}>
            {phaseRef.current === "rolling" ? t("Mengocok…", "Rolling…")
              : phaseRef.current === "move" && myTurn ? t("Ketuk bidak yang menyala", "Tap a glowing token")
              : myTurn ? t("Ketuk dadu untuk lempar!", "Tap the dice to roll!")
              : t("Menunggu…", "Waiting…")}
          </div>
        </div>
      </div>
    </div>
  );
}
