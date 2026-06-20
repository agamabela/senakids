"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./WarnaGameClient.module.css";

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#FACC15",
  "#22C55E", "#10B981", "#06B6D4", "#3B82F6",
  "#6366F1", "#A855F7", "#EC4899", "#F472B6",
  "#92400E", "#78350F", "#1E1B4B", "#000000",
];

const SIZES = [
  { label: "S", value: 6 },
  { label: "M", value: 14 },
  { label: "L", value: 28 },
  { label: "XL", value: 48 },
];

const CANVAS_BG = "#FFFFFF";

export default function WarnaGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [activeColor, setActiveColor] = useState(COLORS[7]);
  const [brushSize, setBrushSize] = useState(SIZES[1].value);
  const [isEraser, setIsEraser] = useState(false);
  const [isRainbow, setIsRainbow] = useState(false);
  const hueRef = useRef(0);

  const t = (id, en) => (language === "id" ? id : en);

  const setupCanvas = useCallback((preserve = true) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    // preserve existing drawing across resizes
    let snapshot = null;
    if (preserve && canvas.width > 0) {
      snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d").drawImage(canvas, 0, 0);
    }

    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (snapshot) {
      ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, rect.width, rect.height);
    }
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    setupCanvas(false);
    const handleResize = () => setupCanvas(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = e.touches ? e.touches[0] : e;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const strokeColor = () => {
    if (isEraser) return CANVAS_BG;
    if (isRainbow) {
      hueRef.current = (hueRef.current + 8) % 360;
      return `hsl(${hueRef.current}, 85%, 55%)`;
    }
    return activeColor;
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    isDrawing.current = true;
    setHasChanges(true);
    const { x, y } = getPos(e);
    lastPos.current = { x, y };
    // draw a dot so a tap leaves a mark
    ctx.beginPath();
    ctx.fillStyle = strokeColor();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = brushSize;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasChanges(false);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "gambar-sena-kids.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const pickColor = (hex) => {
    setActiveColor(hex);
    setIsEraser(false);
    setIsRainbow(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎨 {t("Menggambar Bebas", "Free Drawing")}</h1>
        <p>{t("Gambar apa saja sesukamu!", "Draw anything you like!")}</p>
      </div>

      {/* Color palette */}
      <div className={styles.palette}>
        {COLORS.map((hex) => (
          <button
            key={hex}
            className={`${styles.colorBtn} ${activeColor === hex && !isEraser && !isRainbow ? styles.colorActive : ""}`}
            style={{ backgroundColor: hex }}
            onClick={() => pickColor(hex)}
            aria-label={`Warna ${hex}`}
          />
        ))}
        <button
          className={`${styles.colorBtn} ${styles.rainbowBtn} ${isRainbow ? styles.colorActive : ""}`}
          onClick={() => { setIsRainbow(true); setIsEraser(false); }}
          aria-label="Pelangi"
        >
          🌈
        </button>
      </div>

      {/* Tools */}
      <div className={styles.tools}>
        <div className={styles.sizeGroup}>
          {SIZES.map((s) => (
            <button
              key={s.value}
              className={`${styles.sizeBtn} ${brushSize === s.value ? styles.sizeActive : ""}`}
              onClick={() => setBrushSize(s.value)}
              aria-label={`${t("Ukuran", "Size")} ${s.label}`}
            >
              <span className={styles.sizeDot} style={{ width: Math.min(s.value, 28), height: Math.min(s.value, 28) }} />
            </button>
          ))}
        </div>

        <div className={styles.actionGroup}>
          <button
            className={`${styles.toolBtn} ${isEraser ? styles.toolActive : ""}`}
            onClick={() => { setIsEraser((p) => !p); setIsRainbow(false); }}
          >
            🧽 {t("Hapus", "Erase")}
          </button>
          <button className={styles.toolBtn} onClick={clearCanvas}>
            🗑️ {t("Bersihkan", "Clear")}
          </button>
          <button className={`${styles.toolBtn} ${styles.saveBtn}`} onClick={saveCanvas}>
            💾 {t("Simpan", "Save")}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className={styles.canvasWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div>
  );
}
