"use client";

import { useEffect, useRef } from "react";
import styles from "./TraceStage.module.css";

const DONE_RATIO = 0.55;   // fraction of the path that must be traced

export default function TraceStage({ glyph, strokes, accent = "#3b82d6", resetKey = 0, onComplete }) {
  const canvasRef = useRef(null);
  const inkRef = useRef([]);          // array of paths (each = [{x,y}] in CSS px)
  const drawingRef = useRef(false);
  const samplesRef = useRef([]);      // normalized {nx, ny}
  const coveredRef = useRef(null);    // Uint8Array
  const doneRef = useRef(false);
  const geomRef = useRef({ pad: 0, bw: 1, bh: 1, hit: 20 });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // densify the skeleton into normalized samples whenever glyph/reset changes
  useEffect(() => {
    const samples = [];
    for (const stroke of strokes) {
      for (let i = 0; i < stroke.length - 1; i++) {
        const [x0, y0] = stroke[i], [x1, y1] = stroke[i + 1];
        const dist = Math.hypot(x1 - x0, y1 - y0);
        const steps = Math.max(2, Math.round(dist / 0.025));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          samples.push({ nx: x0 + (x1 - x0) * t, ny: y0 + (y1 - y0) * t });
        }
      }
    }
    samplesRef.current = samples;
    coveredRef.current = new Uint8Array(samples.length);
    inkRef.current = [];
    doneRef.current = false;
  }, [glyph, strokes, resetKey]);

  // render loop (DPR-aware, sizes to the element's actual box)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width, ch = rect.height;
      if (!cw || !ch) return;
      const dpr = window.devicePixelRatio || 1;
      const needW = Math.round(cw * dpr), needH = Math.round(ch * dpr);
      if (canvas.width !== needW) canvas.width = needW;
      if (canvas.height !== needH) canvas.height = needH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pad = Math.min(cw, ch) * 0.12;
      const bw = cw - pad * 2, bh = ch - pad * 2;
      const hit = Math.min(cw, ch) * 0.085;
      geomRef.current = { pad, bw, bh, hit };
      const mx = (nx) => pad + nx * bw;
      const my = (ny) => pad + ny * bh;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#fbfdff"; ctx.fillRect(0, 0, cw, ch);

      // thick light guide body
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#e6edf6";
      ctx.lineWidth = Math.min(cw, ch) * 0.1;
      for (const stroke of strokes) {
        ctx.beginPath(); ctx.moveTo(mx(stroke[0][0]), my(stroke[0][1]));
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(mx(stroke[i][0]), my(stroke[i][1]));
        ctx.stroke();
      }
      ctx.restore();

      // dotted centreline
      ctx.save();
      ctx.lineCap = "round";
      ctx.setLineDash([1, 13]);
      ctx.lineWidth = Math.min(cw, ch) * 0.022;
      ctx.strokeStyle = "#9fb3cd";
      for (const stroke of strokes) {
        ctx.beginPath(); ctx.moveTo(mx(stroke[0][0]), my(stroke[0][1]));
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(mx(stroke[i][0]), my(stroke[i][1]));
        ctx.stroke();
      }
      ctx.restore();

      // covered feedback (green)
      const samples = samplesRef.current, covered = coveredRef.current;
      if (covered) {
        ctx.fillStyle = "rgba(34,197,94,0.9)";
        for (let i = 0; i < samples.length; i++) {
          if (covered[i]) { ctx.beginPath(); ctx.arc(mx(samples[i].nx), my(samples[i].ny), Math.min(cw, ch) * 0.012, 0, Math.PI * 2); ctx.fill(); }
        }
      }

      // user ink
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = accent; ctx.lineWidth = Math.min(cw, ch) * 0.045;
      for (const path of inkRef.current) {
        if (path.length === 1) { ctx.beginPath(); ctx.arc(path[0].x, path[0].y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill(); continue; }
        ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
      ctx.restore();

      // start dots (numbered) + direction arrows
      strokes.forEach((stroke, idx) => {
        const s = stroke[0];
        const r = Math.min(cw, ch) * 0.03;
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.arc(mx(s[0]), my(s[1]), r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = `bold ${r * 1.3}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(idx + 1), mx(s[0]), my(s[1]) + 0.5);
        const a = stroke[stroke.length - 2], b = stroke[stroke.length - 1];
        if (a && b) {
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const tx = mx(b[0]), ty = my(b[1]); const sz = Math.min(cw, ch) * 0.04;
          ctx.fillStyle = "#16a34a";
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - sz * Math.cos(ang - 0.5), ty - sz * Math.sin(ang - 0.5));
          ctx.lineTo(tx - sz * Math.cos(ang + 0.5), ty - sz * Math.sin(ang + 0.5));
          ctx.closePath(); ctx.fill();
        }
      });
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [glyph, strokes, accent]);

  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const markCovered = (a, b) => {
    const samples = samplesRef.current, covered = coveredRef.current;
    if (!covered) return;
    const { pad, bw, bh, hit } = geomRef.current;
    const r2 = hit * hit;
    for (let i = 0; i < samples.length; i++) {
      if (covered[i]) continue;
      const sx = pad + samples[i].nx * bw, sy = pad + samples[i].ny * bh;
      let d2;
      if (!b) { d2 = (sx - a.x) ** 2 + (sy - a.y) ** 2; }
      else {
        const vx = b.x - a.x, vy = b.y - a.y;
        const len2 = vx * vx + vy * vy || 1;
        let t = ((sx - a.x) * vx + (sy - a.y) * vy) / len2;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const cx = a.x + vx * t, cy = a.y + vy * t;
        d2 = (sx - cx) ** 2 + (sy - cy) ** 2;
      }
      if (d2 <= r2) covered[i] = 1;
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
    drawingRef.current = true;
    const p = toLocal(e);
    inkRef.current.push([p]);
    markCovered(p);

    const onMove = (ev) => {
      if (!drawingRef.current) return;
      if (ev.cancelable) ev.preventDefault();
      const q = toLocal(ev);
      const cur = inkRef.current[inkRef.current.length - 1];
      if (!cur) { inkRef.current.push([q]); markCovered(q); return; }
      const prev = cur[cur.length - 1];
      cur.push(q);
      markCovered(prev || q, q);
    };
    const onUp = () => {
      drawingRef.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={down}
      />
    </div>
  );
}
