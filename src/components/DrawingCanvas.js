'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import styles from './DrawingCanvas.module.css';

/* ──────────────────────────────────────────────
   Preset palette — 8 bright, kid-friendly colors
   ────────────────────────────────────────────── */
const COLORS = [
  { key: 'red',    name: { id: 'Merah', en: 'Red' },       hex: '#EF4444' },
  { key: 'orange', name: { id: 'Oranye', en: 'Orange' },   hex: '#F97316' },
  { key: 'yellow', name: { id: 'Kuning', en: 'Yellow' },   hex: '#F59E0B' },
  { key: 'green',  name: { id: 'Hijau', en: 'Green' },     hex: '#10B981' },
  { key: 'blue',   name: { id: 'Biru', en: 'Blue' },       hex: '#3B82F6' },
  { key: 'purple', name: { id: 'Ungu', en: 'Purple' },     hex: '#8B5CF6' },
  { key: 'pink',   name: { id: 'Merah Muda', en: 'Pink' }, hex: '#EC4899' },
  { key: 'black',  name: { id: 'Hitam', en: 'Black' },     hex: '#1E1B4B' },
];

/* Three brush sizes — value is the lineWidth in px */
const SIZES = [
  { key: 'small',  label: { id: 'Kecil', en: 'Small' },   value: 4  },
  { key: 'medium', label: { id: 'Sedang', en: 'Medium' }, value: 8  },
  { key: 'large',  label: { id: 'Besar', en: 'Large' },   value: 16 },
];

/* Background / eraser colour must match the canvas fill */
const CANVAS_BG = '#FFFFFF';

export default function DrawingCanvas() {
  const { lang, t } = useLanguage();

  /* ── refs ── */
  const canvasRef   = useRef(null);
  const wrapRef     = useRef(null);
  const ctxRef      = useRef(null);
  const isDrawing   = useRef(false);

  /* ── state ── */
  const [activeColor, setActiveColor] = useState(COLORS[0].hex);
  const [brushSize, setBrushSize]     = useState(SIZES[1].value);
  const [isEraser, setIsEraser]       = useState(false);

  /* ─────────────────────────────────
     Initialise / resize canvas
     ───────────────────────────────── */
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap   = wrapRef.current;
    if (!canvas || !wrap) return;

    /* Match the internal pixel buffer to the displayed size */
    const rect = wrap.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;

    canvas.width  = rect.width * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, rect.width, canvas.offsetHeight);

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    setupCanvas();

    /* Re-setup on window resize so the canvas stays sharp */
    const handleResize = () => setupCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  /* ─────────────────────────────────
     Drawing helpers
     ───────────────────────────────── */
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();

    const source = e.touches ? e.touches[0] : e;
    return {
      x: source.clientX - rect.left,
      y: source.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;

    isDrawing.current = true;
    const { x, y } = getPos(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = isEraser ? CANVAS_BG : activeColor;
    ctx.lineWidth   = isEraser ? brushSize * 2 : brushSize;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    if (ctx) ctx.closePath();
    isDrawing.current = false;
  };

  /* ─────────────────────────────────
     Toolbar actions
     ───────────────────────────────── */
  const handleColorPick = (hex) => {
    setIsEraser(false);
    setActiveColor(hex);
  };

  const handleSizePick = (val) => {
    setBrushSize(val);
  };

  const toggleEraser = () => {
    setIsEraser((prev) => !prev);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;

    const confirmMsg = t("create.clearConfirm") || (lang === 'en' ? 'Clear the canvas?' : 'Hapus seluruh gambar?');
    if (window.confirm(confirmMsg)) {
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  /* ─────────────────────────────────
     Render
     ───────────────────────────────── */
  return (
    <div className={styles.wrapper}>
      {/* Title */}
      <h2 className={styles.heading}>🎨 {t("create.canvasHeading") || (lang === 'en' ? "Let's Draw!" : "Ayo Menggambar!")}</h2>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar} role="toolbar" aria-label={lang === 'en' ? "Drawing tools" : "Alat menggambar"}>
        {/* Color picker */}
        <div className={styles.colorGroup} role="radiogroup" aria-label={t("create.brushColor") || (lang === 'en' ? "Brush color" : "Warna kuas")}>
          {COLORS.map((c) => {
            const colorLabel = c.name[lang] || c.name.id;
            return (
              <button
                key={c.hex}
                aria-label={colorLabel}
                title={colorLabel}
                aria-pressed={activeColor === c.hex && !isEraser}
                className={`${styles.colorBtn} ${
                  activeColor === c.hex && !isEraser ? styles.colorBtnSelected : ''
                }`}
                style={{ backgroundColor: c.hex }}
                onClick={() => handleColorPick(c.hex)}
              />
            );
          })}
        </div>

        <span className={styles.divider} aria-hidden="true" />

        {/* Brush size */}
        <div className={styles.sizeGroup} role="radiogroup" aria-label={t("create.brushSize") || (lang === 'en' ? "Brush size" : "Ukuran kuas")}>
          {SIZES.map((s) => {
            const sizeLabel = s.label[lang] || s.label.id;
            return (
              <button
                key={s.value}
                aria-label={`${sizeLabel} (${s.value}px)`}
                title={sizeLabel}
                aria-pressed={brushSize === s.value}
                className={`${styles.sizeBtn} ${
                  brushSize === s.value ? styles.sizeBtnSelected : ''
                }`}
                onClick={() => handleSizePick(s.value)}
              >
                <span
                  className={styles.sizeDot}
                  style={{ width: s.value, height: s.value }}
                />
              </button>
            );
          })}
        </div>

        <span className={styles.divider} aria-hidden="true" />

        {/* Eraser & Clear */}
        <div className={styles.actionGroup}>
          <button
            aria-label={t("create.eraser") || (lang === 'en' ? "Eraser" : "Penghapus")}
            title={t("create.eraser") || (lang === 'en' ? "Eraser" : "Penghapus")}
            aria-pressed={isEraser}
            className={`${styles.eraserBtn} ${isEraser ? styles.eraserBtnSelected : ''}`}
            onClick={toggleEraser}
          >
            🧹
          </button>

          <button
            aria-label={t("create.clearCanvas") || (lang === 'en' ? "Clear canvas" : "Hapus gambar")}
            title={t("create.clearCanvas") || (lang === 'en' ? "Clear canvas" : "Hapus gambar")}
            className={styles.clearBtn}
            onClick={clearCanvas}
          >
            🗑️ {lang === 'en' ? "Clear" : "Hapus"}
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className={styles.canvasWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          /* Mouse events */
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          /* Touch events */
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div>
  );
}
