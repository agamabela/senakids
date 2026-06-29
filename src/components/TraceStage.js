"use client";

import { useEffect, useRef } from "react";
import styles from "./TraceStage.module.css";

const W = 300, H = 340, PAD = 30;
const BW = W - PAD * 2, BH = H - PAD * 2;
const HIT_R = 34;          // how close ink must be to count
const DONE_RATIO = 0.5;    // fraction of guide that must be traced

const mapX = (x) => PAD + x * BW;
const mapY = (y) => PAD + y * BH;

export default function TraceStage({ glyph, strokes, accent = "#3b82d6", resetKey = 0, onComplete }) {
  const canvasRef = useRef(null);
  const inkRef = useRef([]);          // array of paths (each = [{x,y}])
  const drawingRef = useRef(false);
  const samplesRef = useRef([]);      // {x,y}
  const coveredRef = useRef(null);    // Uint8Array
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // build densified guide samples whenever the glyph/strokes change or reset
  useEffect(() => {
    const samples = [];
    for (const stroke of strokes) {
      for (let i = 0; i < stroke.length - 1; i++) {
        const [x0, y0] = stroke[i], [x1, y1] = stroke[i + 1];
        const ax = mapX(x0), ay = mapY(y0), bx = mapX(x1), by = mapY(y1);
        const dist = Math.hypot(bx - ax, by - ay);
        const steps = Math.max(2, Math.round(dist / 7));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          samples.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
        }
      }
    }
    samplesRef.current = samples;
    coveredRef.current = new Uint8Array(samples.length);
    inkRef.current = [];
    doneRef.current = false;
  }, [glyph, strokes, resetKey]);

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    let raf;

    const arrow = (ctx, fromPt, toPt, color) => {
      const ang = Math.atan2(toPt[1] - fromPt[1], toPt[0] - fromPt[0]);
      const tx = mapX(toPt[0]), ty = mapY(toPt[1]);
      const sz = 11;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx - sz * Math.cos(ang - 0.5), ty - sz * Math.sin(ang - 0.5));
      ctx.lineTo(tx - sz * Math.cos(ang + 0.5), ty - sz * Math.sin(ang + 0.5));
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      // background
      ctx.fillStyle = "#fbfdff";
      ctx.fillRect(0, 0, W, H);

      // faint glyph silhouette (correct shape reference)
      ctx.save();
      ctx.fillStyle = "rgba(60,80,120,0.09)";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.font = `900 ${Math.round(BH * 0.92)}px "Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif`;
      ctx.fillText(glyph, PAD + BW / 2, PAD + BH * 0.88);
      ctx.restore();

      // dotted guide along skeleton
      ctx.save();
      ctx.lineCap = "round";
      ctx.setLineDash([1, 13]);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#c4d0e0";
      for (const stroke of strokes) {
        ctx.beginPath();
        ctx.moveTo(mapX(stroke[0][0]), mapY(stroke[0][1]));
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(mapX(stroke[i][0]), mapY(stroke[i][1]));
        ctx.stroke();
      }
      ctx.restore();

      // covered samples (green feedback)
      const samples = samplesRef.current, covered = coveredRef.current;
      if (covered) {
        ctx.fillStyle = "rgba(34,197,94,0.85)";
        for (let i = 0; i < samples.length; i++) {
          if (covered[i]) { ctx.beginPath(); ctx.arc(samples[i].x, samples[i].y, 3.4, 0, Math.PI * 2); ctx.fill(); }
        }
      }

      // user ink
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = accent; ctx.lineWidth = 13;
      ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 3;
      for (const path of inkRef.current) {
        if (path.length < 2) {
          if (path.length === 1) { ctx.beginPath(); ctx.arc(path[0].x, path[0].y, 6.5, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill(); }
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
      ctx.restore();

      // stroke order: start dots (numbered) + end arrows
      strokes.forEach((stroke, idx) => {
        const s = stroke[0];
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.arc(mapX(s[0]), mapY(s[1]), 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(idx + 1), mapX(s[0]), mapY(s[1]) + 0.5);
        const a = stroke[stroke.length - 2], b = stroke[stroke.length - 1];
        if (a && b) arrow(ctx, a, b, "#16a34a");
      });
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [glyph, strokes, accent]);

  // pointer drawing
  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  const markCovered = (p) => {
    const samples = samplesRef.current, covered = coveredRef.current;
    if (!covered) return;
    for (let i = 0; i < samples.length; i++) {
      if (!covered[i] && Math.hypot(samples[i].x - p.x, samples[i].y - p.y) <= HIT_R) covered[i] = 1;
    }
    if (!doneRef.current) {
      let c = 0;
      for (let i = 0; i < covered.length; i++) c += covered[i];
      if (covered.length && c / covered.length >= DONE_RATIO) {
        doneRef.current = true;
        onCompleteRef.current?.();
      }
    }
  };
  const down = (e) => {
    e.preventDefault();
    try { canvasRef.current.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    drawingRef.current = true;
    const p = toLocal(e);
    inkRef.current.push([p]);
    markCovered(p);
  };
  const move = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = toLocal(e);
    let cur = inkRef.current[inkRef.current.length - 1];
    if (!cur) { cur = [p]; inkRef.current.push(cur); }
    else cur.push(p);
    markCovered(p);
  };
  const up = () => { drawingRef.current = false; };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
    />
  );
}
