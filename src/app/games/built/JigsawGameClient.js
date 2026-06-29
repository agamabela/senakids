"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./JigsawGameClient.module.css";

const LEVELS = [
  { key: "easy", n: 4, id: "Mudah", en: "Easy", icon: "🟢" },
  { key: "medium", n: 8, id: "Sedang", en: "Medium", icon: "🟡" },
  { key: "hard", n: 10, id: "Sulit", en: "Hard", icon: "🔴" },
];

const IMAGES = [
  "/images/puzzle-1.png", "/images/puzzle-2.png", "/images/puzzle-3.png",
  "/images/puzzle-4.png", "/images/puzzle-5.png", "/images/puzzle-6.png",
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// random ±1 (tab / blank) for internal edges
const rnd = () => (Math.random() < 0.5 ? 1 : -1);

function generateEdges(N) {
  const e = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ t: 0, r: 0, b: 0, l: 0 })));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      e[r][c].t = r === 0 ? 0 : -e[r - 1][c].b;
      e[r][c].l = c === 0 ? 0 : -e[r][c - 1].r;
      e[r][c].r = c === N - 1 ? 0 : rnd();
      e[r][c].b = r === N - 1 ? 0 : rnd();
    }
  }
  return e;
}

// draw one edge from a->b with outward normal (ox,oy); dir 0 flat, +1 tab(out), -1 blank(in)
function edgeTo(ctx, ax, ay, bx, by, ox, oy, dir) {
  const dx = bx - ax, dy = by - ay;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  if (dir === 0) { ctx.lineTo(bx, by); return; }
  const P = (al, pe) => [ax + ux * al * L + ox * pe * L * dir, ay + uy * al * L + oy * pe * L * dir];
  let p = P(0.4, 0); ctx.lineTo(p[0], p[1]);
  const c1 = P(0.32, 0.05), c2 = P(0.30, 0.27), e1 = P(0.5, 0.27);
  ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e1[0], e1[1]);
  const c3 = P(0.70, 0.27), c4 = P(0.68, 0.05), e2 = P(0.6, 0);
  ctx.bezierCurveTo(c3[0], c3[1], c4[0], c4[1], e2[0], e2[1]);
  ctx.lineTo(bx, by);
}

function piecePath(ctx, m, s, e) {
  // m = margin (px), s = cell (px). content box [m,m]..[m+s,m+s]
  const x0 = m, y0 = m, x1 = m + s, y1 = m + s;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  edgeTo(ctx, x0, y0, x1, y0, 0, -1, e.t);   // top, outward up
  edgeTo(ctx, x1, y0, x1, y1, 1, 0, e.r);    // right, outward right
  edgeTo(ctx, x1, y1, x0, y1, 0, 1, e.b);    // bottom, outward down
  edgeTo(ctx, x0, y1, x0, y0, -1, 0, e.l);   // left, outward left
  ctx.closePath();
}

async function buildPieces(imgSrc, N) {
  const img = await loadImage(imgSrc);
  const S = Math.min(img.width, img.height);
  const offX = (img.width - S) / 2, offY = (img.height - S) / 2;
  const cell = Math.floor(S / N);
  const margin = Math.round(cell * 0.3);
  const edges = generateEdges(N);
  const pieces = [];
  const cw = cell + margin * 2;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cv = document.createElement("canvas");
      cv.width = cw; cv.height = cw;
      const ctx = cv.getContext("2d");
      ctx.save();
      piecePath(ctx, margin, cell, edges[r][c]);
      ctx.clip();
      // draw the centered-square-cropped source so this cell + its tabs align
      ctx.drawImage(img, offX + c * cell - margin, offY + r * cell - margin, cw, cw, 0, 0, cw, cw);
      ctx.restore();
      // inner shading + light outline for definition
      ctx.save();
      piecePath(ctx, margin, cell, edges[r][c]);
      ctx.lineWidth = Math.max(1.2, cell * 0.025);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.stroke();
      ctx.lineWidth = Math.max(0.6, cell * 0.012);
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.stroke();
      ctx.restore();
      pieces.push({ id: `${r}-${c}`, row: r, col: c, url: cv.toDataURL("image/png") });
    }
  }
  return { pieces, marginRatio: margin / cell };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function JigsawGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("start"); // start | loading | playing | win
  const [levelKey, setLevelKey] = useState("easy");
  const [imageSrc, setImageSrc] = useState(IMAGES[0]);
  const [pieces, setPieces] = useState([]);
  const [marginRatio, setMarginRatio] = useState(0.3);
  const [placed, setPlaced] = useState({});      // id -> true
  const [panel, setPanel] = useState([]);        // ids in panel
  const [drag, setDrag] = useState(null);        // {id, x, y, ox, oy}
  const [hover, setHover] = useState(null);      // {row,col,ok}
  const [shakeId, setShakeId] = useState(null);
  const [popId, setPopId] = useState(null);
  const [boardSize, setBoardSize] = useState(360);
  const [elapsed, setElapsed] = useState(0);

  const N = LEVELS.find((l) => l.key === levelKey).n;
  const total = N * N;
  const placedCount = Object.keys(placed).length;

  const boardRef = useRef(null);
  const startRef = useRef(0);
  const dragRef = useRef(null);
  const pieceMap = useRef({});

  pieceMap.current = {};
  for (const p of pieces) pieceMap.current[p.id] = p;

  // measure board
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const el = boardRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setBoardSize(el.clientWidth));
    ro.observe(el);
    setBoardSize(el.clientWidth);
    return () => ro.disconnect();
  }, [screen, N]);

  // timer
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 250);
    return () => clearInterval(id);
  }, [screen]);

  const startGame = useCallback(async (lvl, img) => {
    setLevelKey(lvl); setImageSrc(img);
    setScreen("loading");
    const n = LEVELS.find((l) => l.key === lvl).n;
    try {
      const { pieces: pcs, marginRatio: mr } = await buildPieces(img, n);
      setPieces(pcs);
      setMarginRatio(mr);
      setPlaced({});
      setPanel(shuffle(pcs.map((p) => p.id)));
      setDrag(null); setHover(null); setElapsed(0);
      startRef.current = Date.now();
      setScreen("playing");
    } catch {
      setScreen("start");
    }
  }, []);

  const reshuffle = () => setPanel((p) => shuffle(p));

  // ── pointer drag ──
  const beginDrag = (id, e) => {
    e.preventDefault();
    const targetRect = e.currentTarget.getBoundingClientRect();
    const cell = boardSize / N;
    const disp = cell * (1 + 2 * marginRatio);
    // grab offset relative to a board-sized piece centered under the finger
    const ox = disp / 2, oy = disp / 2;
    dragRef.current = { id, ox, oy };
    setDrag({ id, x: e.clientX, y: e.clientY, ox, oy });

    const onMove = (ev) => {
      if (ev.cancelable) ev.preventDefault();
      const x = ev.clientX, y = ev.clientY;
      setDrag((d) => (d ? { ...d, x, y } : d));
      const rect = boardRef.current?.getBoundingClientRect();
      if (rect) {
        const cc = rect.width / N;
        const col = Math.floor((x - rect.left) / cc);
        const row = Math.floor((y - rect.top) / cc);
        if (row >= 0 && row < N && col >= 0 && col < N) {
          const cid = `${row}-${col}`;
          setHover({ row, col, ok: cid === id && !placedRef.current[cid] });
        } else setHover(null);
      }
    };
    const onUp = (ev) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const x = ev.clientX, y = ev.clientY;
      const rect = boardRef.current?.getBoundingClientRect();
      let dropped = false;
      if (rect) {
        const cc = rect.width / N;
        const col = Math.floor((x - rect.left) / cc);
        const row = Math.floor((y - rect.top) / cc);
        const cid = `${row}-${col}`;
        if (cid === id && !placedRef.current[cid]) {
          dropped = true;
          setPlaced((p) => ({ ...p, [id]: true }));
          setPanel((p) => p.filter((q) => q !== id));
          setPopId(id); setTimeout(() => setPopId(null), 380);
          setHasChanges(true);
        }
      }
      if (!dropped) { setShakeId(id); setTimeout(() => setShakeId(null), 450); }
      setDrag(null); setHover(null);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // keep a ref of placed for the pointer closure
  const placedRef = useRef(placed);
  placedRef.current = placed;

  // win check
  useEffect(() => {
    if (screen === "playing" && total > 0 && placedCount === total) {
      setElapsed(Date.now() - startRef.current);
      const tm = setTimeout(() => setScreen("win"), 600);
      return () => clearTimeout(tm);
    }
    return undefined;
  }, [placedCount, total, screen]);

  // ── START ──
  if (screen === "start") {
    return (
      <div className={styles.startWrap}>
        <div className={styles.clouds} aria-hidden />
        <div className={styles.startCard}>
          <h1 className={styles.title}>🧩 {t("Puzzle Gambar", "Jigsaw Puzzle")}</h1>
          <p className={styles.subtitle}>{t("Pilih gambar & tingkat, lalu susun puzzle-nya!", "Pick a picture & level, then solve the puzzle!")}</p>

          <p className={styles.pickLabel}>{t("Pilih Gambar", "Pick a Picture")}</p>
          <div className={styles.imageGrid}>
            {IMAGES.map((src) => (
              <button key={src} className={`${styles.imgThumb} ${imageSrc === src ? styles.imgActive : ""}`} onClick={() => setImageSrc(src)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="puzzle option" />
              </button>
            ))}
          </div>

          <p className={styles.pickLabel}>{t("Pilih Tingkat", "Pick a Level")}</p>
          <div className={styles.levelRow}>
            {LEVELS.map((lv) => (
              <button key={lv.key} className={`${styles.levelBtn} ${levelKey === lv.key ? styles.levelActive : ""}`} onClick={() => setLevelKey(lv.key)}>
                <span className={styles.levelIcon}>{lv.icon}</span>
                <span>{t(lv.id, lv.en)}</span>
                <span className={styles.levelN}>{lv.n}×{lv.n}</span>
              </button>
            ))}
          </div>

          <button className={styles.startBtn} onClick={() => startGame(levelKey, imageSrc)}>
            ▶️ {t("Mulai Main", "Start Game")}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "loading") {
    return (
      <div className={styles.startWrap}>
        <div className={styles.clouds} aria-hidden />
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <p>{t("Menyiapkan puzzle…", "Preparing puzzle…")}</p>
        </div>
      </div>
    );
  }

  // ── WIN ──
  if (screen === "win") {
    return (
      <div className={styles.startWrap}>
        <Confetti />
        <div className={styles.startCard}>
          <div className={styles.winEmoji}>🏆🎉</div>
          <h1 className={styles.title}>{t("Hebat! Selesai!", "Awesome! Solved!")}</h1>
          <p className={styles.subtitle}>
            {t("Waktu", "Time")}: <strong>{fmtTime(elapsed)}</strong> · {total} {t("keping", "pieces")}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="solved" className={styles.winImage} />
          <div className={styles.winBtns}>
            <button className={styles.startBtn} onClick={() => startGame(levelKey, imageSrc)}>🔄 {t("Main Lagi", "Play Again")}</button>
            <button className={styles.ghostBtn} onClick={() => setScreen("start")}>🏠 {t("Menu", "Menu")}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const cell = boardSize / N;
  const marginD = cell * marginRatio;
  const disp = cell + marginD * 2;

  return (
    <div className={styles.gameWrap}>
      <div className={styles.clouds} aria-hidden />
      <div className={styles.topBar}>
        <button className={styles.menuPill} onClick={() => setScreen("start")}>🏠 {t("Menu", "Menu")}</button>
        <div className={styles.levelMini}>
          {LEVELS.map((lv) => (
            <button key={lv.key} className={`${styles.levelMiniBtn} ${levelKey === lv.key ? styles.levelMiniActive : ""}`} onClick={() => startGame(lv.key, imageSrc)}>{lv.n}×{lv.n}</button>
          ))}
        </div>
        <div className={styles.counter}>🧩 {placedCount} / {total}</div>
        <div className={styles.timer}>⏱️ {fmtTime(elapsed)}</div>
        <button className={styles.shuffleBtn} onClick={reshuffle}>🔀 {t("Acak", "Shuffle")}</button>
      </div>

      <div className={styles.play}>
        {/* Board */}
        <div className={styles.boardOuter}>
          <div ref={boardRef} className={styles.board} style={{ touchAction: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt="ghost" className={styles.ghost} />
            <div className={styles.slots} style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
              {Array.from({ length: total }).map((_, i) => {
                const row = Math.floor(i / N), col = i % N;
                const isHover = hover && hover.row === row && hover.col === col;
                return (
                  <div
                    key={i}
                    className={`${styles.slot} ${isHover ? (hover.ok ? styles.slotOk : styles.slotBad) : ""}`}
                  />
                );
              })}
            </div>
            {/* placed pieces */}
            {pieces.filter((p) => placed[p.id]).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.url}
                alt=""
                className={`${styles.placed} ${popId === p.id ? styles.pop : ""}`}
                style={{ left: p.col * cell - marginD, top: p.row * cell - marginD, width: disp, height: disp }}
              />
            ))}
          </div>
        </div>

        {/* Pieces panel */}
        <div className={styles.panel}>
          <div className={styles.panelInner}>
            {panel.map((id) => {
              const p = pieceMap.current[id];
              if (!p) return null;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={id}
                  src={p.url}
                  alt=""
                  data-pid={id}
                  draggable={false}
                  className={`${styles.panelPiece} ${shakeId === id ? styles.shake : ""} ${drag && drag.id === id ? styles.hidden : ""}`}
                  onPointerDown={(e) => beginDrag(id, e)}
                />
              );
            })}
            {panel.length === 0 && <p className={styles.panelEmpty}>{t("Semua keping terpasang!", "All pieces placed!")}</p>}
          </div>
        </div>
      </div>

      {/* floating dragged piece */}
      {drag && pieceMap.current[drag.id] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pieceMap.current[drag.id].url}
          alt=""
          className={styles.floating}
          style={{ left: drag.x - disp / 2, top: drag.y - disp / 2, width: disp, height: disp }}
        />
      )}
    </div>
  );
}

function Confetti() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      s: 6 + Math.random() * 8,
      vy: 2 + Math.random() * 3.5,
      vx: -1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
    }));
    let raf, t0 = Date.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (Date.now() - t0 > 6000) cancelAnimationFrame(raf);
    };
    loop();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className={styles.confetti} />;
}
