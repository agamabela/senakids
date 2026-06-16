'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';

/* ──────────────────────────────────────────────
   Preset palette — 8 bright, kid-friendly colors
   ────────────────────────────────────────────── */
const COLORS = [
  { name: 'Red',    hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Green',  hex: '#10B981' },
  { name: 'Blue',   hex: '#3B82F6' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Pink',   hex: '#EC4899' },
  { name: 'Black',  hex: '#1E1B4B' },
];

/* Three brush sizes — value is the lineWidth in px */
const SIZES = [
  { label: 'Small',  value: 4  },
  { label: 'Medium', value: 8  },
  { label: 'Large',  value: 16 },
];

/* Background / eraser colour must match the canvas fill */
const CANVAS_BG = '#FFFFFF';

export default function DrawingCanvas() {
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
  /** Get pointer position relative to canvas */
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();

    /* Support both mouse and touch events */
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
    ctx.lineWidth   = brushSize;
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const ctx = ctxRef.current;
    if (ctx) ctx.closePath();
  };

  /* ─────────────────────────────────
     Tool actions
     ───────────────────────────────── */
  const handleColorPick = (hex) => {
    setActiveColor(hex);
    setIsEraser(false);
  };

  const handleSizePick = (size) => {
    setBrushSize(size);
  };

  const toggleEraser = () => {
    setIsEraser((prev) => !prev);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, rect.width, canvas.offsetHeight);
  };

  /* ─────────────────────────────────
     Render
     ───────────────────────────────── */
  return (
    <div className={styles.wrapper}>
      {/* Title */}
      <h2 className={styles.heading}>🎨 Let&rsquo;s Draw!</h2>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar} role="toolbar" aria-label="Drawing tools">
        {/* Color picker */}
        <div className={styles.colorGroup} role="radiogroup" aria-label="Brush color">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              aria-label={c.name}
              aria-pressed={activeColor === c.hex && !isEraser}
              className={`${styles.colorBtn} ${
                activeColor === c.hex && !isEraser ? styles.colorBtnSelected : ''
              }`}
              style={{ backgroundColor: c.hex }}
              onClick={() => handleColorPick(c.hex)}
            />
          ))}
        </div>

        <span className={styles.divider} aria-hidden="true" />

        {/* Brush size */}
        <div className={styles.sizeGroup} role="radiogroup" aria-label="Brush size">
          {SIZES.map((s) => (
            <button
              key={s.value}
              aria-label={`${s.label} brush`}
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
          ))}
        </div>

        <span className={styles.divider} aria-hidden="true" />

        {/* Eraser & Clear */}
        <div className={styles.actionGroup}>
          <button
            aria-label="Eraser"
            aria-pressed={isEraser}
            className={`${styles.eraserBtn} ${isEraser ? styles.eraserBtnSelected : ''}`}
            onClick={toggleEraser}
          >
            🧹
          </button>

          <button
            aria-label="Clear canvas"
            className={styles.clearBtn}
            onClick={clearCanvas}
          >
            🗑️ Clear
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
