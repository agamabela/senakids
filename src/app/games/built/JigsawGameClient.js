"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./JigsawGameClient.module.css";

// single difficulty: slice the picture into N x N simple square parts
const N = 3;

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

// slice the centered-square crop of the image into N x N plain square pieces
async function buildPieces(imgSrc) {
  const img = await loadImage(imgSrc);
  const S = Math.min(img.width, img.height);
  const offX = (img.width - S) / 2, offY = (img.height - S) / 2;
  const cell = Math.floor(S / N);
  const pieces = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const cv = document.createElement("canvas");
      cv.width = cell; cv.height = cell;
      const ctx = cv.getContext("2d");
      // draw this cell's portion of the (transparent-bg) picture
      ctx.drawImage(img, offX + c * cell, offY + r * cell, cell, cell, 0, 0, cell, cell);
      // clear rectangular outline so every part is visible & grabbable
      const lw = Math.max(2, cell * 0.03);
      ctx.lineWidth = lw + 2;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.strokeRect(lw / 2 + 1, lw / 2 + 1, cell - lw - 2, cell - lw - 2);
      ctx.lineWidth = lw;
      ctx.strokeStyle = "rgba(60,70,90,0.55)";
      ctx.strokeRect(lw / 2 + 1, lw / 2 + 1, cell - lw - 2, cell - lw - 2);
      pieces.push({ id: `${r}-${c}`, row: r, col: c, url: cv.toDataURL("image/png") });
    }
  }
  return pieces;
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
  const [imageSrc, setImageSrc] = useState(IMAGES[0]);
  const [pieces, setPieces] = useState([]);
  const [placed, setPlaced] = useState({});      // id -> true
  const [panel, setPanel] = useState([]);        // ids in panel
  const [drag, setDrag] = useState(null);        // {id, x, y}
  const [hover, setHover] = useState(null);      // {row,col,ok}
  const [shakeId, setShakeId] = useState(null);
  const [popId, setPopId] = useState(null);
  const [boardSize, setBoardSize] = useState(360);
  const [elapsed, setElapsed] = useState(0);

  const total = N * N;
  const placedCount = Object.keys(placed).length;

  const boardRef = useRef(null);
  const startRef = useRef(0);
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
  }, [screen]);

  // timer
  useEffect(() => {
    if (screen !== "playing") return undefined;
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 250);
    return () => clearInterval(id);
  }, [screen]);

  const startGame = useCallback(async (img) => {
    setImageSrc(img);
    setScreen("loading");
    try {
      const pcs = await buildPieces(img);
      setPieces(pcs);
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

  // keep a ref of placed for the pointer closure
  const placedRef = useRef(placed);
  placedRef.current = placed;

  // ── pointer drag ──
  const beginDrag = (id, e) => {
    e.preventDefault();
    setDrag({ id, x: e.clientX, y: e.clientY });

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
          <h1 className={styles.title}>🧩 {t("Puzzle Gambar", "Picture Puzzle")}</h1>
          <p className={styles.subtitle}>{t("Pilih gambar, lalu seret tiap bagian ke tempatnya!", "Pick a picture, then drag each part into place!")}</p>

          <p className={styles.pickLabel}>{t("Pilih Gambar", "Pick a Picture")}</p>
          <div className={styles.imageGrid}>
            {IMAGES.map((src) => (
              <button key={src} className={`${styles.imgThumb} ${imageSrc === src ? styles.imgActive : ""}`} onClick={() => setImageSrc(src)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="puzzle option" />
              </button>
            ))}
          </div>

          <button className={styles.startBtn} onClick={() => startGame(imageSrc)}>
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
            {t("Waktu", "Time")}: <strong>{fmtTime(elapsed)}</strong> · {total} {t("bagian", "parts")}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt="solved" className={styles.winImage} />
          <div className={styles.winBtns}>
            <button className={styles.startBtn} onClick={() => startGame(imageSrc)}>🔄 {t("Main Lagi", "Play Again")}</button>
            <button className={styles.ghostBtn} onClick={() => setScreen("start")}>🏠 {t("Menu", "Menu")}</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PLAYING ──
  const cell = boardSize / N;

  return (
    <div className={styles.gameWrap}>
      <div className={styles.clouds} aria-hidden />
      <div className={styles.topBar}>
        <button className={styles.menuPill} onClick={() => setScreen("start")}>🏠 {t("Menu", "Menu")}</button>
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
                style={{ left: p.col * cell, top: p.row * cell, width: cell, height: cell }}
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
            {panel.length === 0 && <p className={styles.panelEmpty}>{t("Semua bagian terpasang!", "All parts placed!")}</p>}
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
          style={{ left: drag.x - cell / 2, top: drag.y - cell / 2, width: cell, height: cell }}
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
