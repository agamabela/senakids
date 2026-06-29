"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import styles from "./TraceStage.module.css";

function distToSeg(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const len2 = vx * vx + vy * vy || 1;
  let t = ((px - ax) * vx + (py - ay) * vy) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = ax + vx * t, cy = ay + vy * t;
  return Math.hypot(px - cx, py - cy);
}

const TraceStage = forwardRef(function TraceStage(
  { glyph, strokes, accent = "#3b82d6", resetKey = 0, level = "easy", reveal = false, onComplete },
  ref
) {
  const canvasRef = useRef(null);
  const inkRef = useRef([]);          // paths of {x,y} CSS px
  const drawingRef = useRef(false);
  const samplesRef = useRef([]);      // per stroke [{nx,ny}]
  const progRef = useRef([]);
  const activeRef = useRef(0);
  const totalRef = useRef(0);
  const doneRef = useRef(false);
  const geomRef = useRef({ pad: 0, bw: 1, bh: 1, hit: 24 });
  const levelRef = useRef(level); levelRef.current = level;
  const revealRef = useRef(reveal); revealRef.current = reveal;
  const onCompleteRef = useRef(onComplete); onCompleteRef.current = onComplete;

  useEffect(() => {
    const per = strokes.map((stroke) => {
      const arr = [];
      for (let i = 0; i < stroke.length - 1; i++) {
        const [x0, y0] = stroke[i], [x1, y1] = stroke[i + 1];
        const dist = Math.hypot(x1 - x0, y1 - y0);
        const steps = Math.max(2, Math.round(dist / 0.022));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          arr.push({ nx: x0 + (x1 - x0) * t, ny: y0 + (y1 - y0) * t });
        }
      }
      return arr;
    });
    samplesRef.current = per;
    progRef.current = new Array(per.length).fill(0);
    activeRef.current = 0;
    totalRef.current = per.reduce((n, s) => n + s.length, 0);
    inkRef.current = [];
    doneRef.current = false;
  }, [glyph, strokes, resetKey]);

  // hard-mode shape check (compares freehand drawing to the glyph)
  const check = () => {
    const per = samplesRef.current;
    const { pad, bw, bh } = geomRef.current;
    if (!per || !bw) return false;
    const targets = [];
    for (const s of per) for (const p of s) targets.push({ x: pad + p.nx * bw, y: pad + p.ny * bh });
    const ink = [];
    for (const path of inkRef.current) for (const p of path) ink.push(p);
    if (ink.length < 8 || !targets.length) return false;
    const R = Math.min(bw, bh) * 0.16;     // generous tolerance for free draw
    const R2 = R * R;
    // coverage: targets near some ink point
    let cov = 0;
    for (const tp of targets) {
      for (const ip of ink) { if ((tp.x - ip.x) ** 2 + (tp.y - ip.y) ** 2 <= R2) { cov++; break; } }
    }
    // precision: ink near some target (penalises scribbling elsewhere)
    let prec = 0;
    for (const ip of ink) {
      for (const tp of targets) { if ((tp.x - ip.x) ** 2 + (tp.y - ip.y) ** 2 <= R2) { prec++; break; } }
    }
    const coverage = cov / targets.length;
    const precision = prec / ink.length;
    const ok = coverage >= 0.65 && precision >= 0.55;
    if (ok && !doneRef.current) { doneRef.current = true; onCompleteRef.current?.(); }
    return ok;
  };
  useImperativeHandle(ref, () => ({ check }), []);

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
      const hit = Math.min(cw, ch) * 0.09;
      geomRef.current = { pad, bw, bh, hit };
      const mx = (nx) => pad + nx * bw;
      const my = (ny) => pad + ny * bh;
      const big = Math.min(cw, ch);
      const lv = levelRef.current;
      const showBody = lv === "easy" || revealRef.current;
      const showDots = lv === "easy" || lv === "medium" || revealRef.current;
      const showGuides = lv === "easy" || lv === "medium" || revealRef.current;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = "#fbfdff"; ctx.fillRect(0, 0, cw, ch);

      // thick light guide body
      if (showBody) {
        ctx.save();
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.strokeStyle = "#e6edf6"; ctx.lineWidth = big * 0.1;
        for (const stroke of strokes) {
          ctx.beginPath(); ctx.moveTo(mx(stroke[0][0]), my(stroke[0][1]));
          for (let i = 1; i < stroke.length; i++) ctx.lineTo(mx(stroke[i][0]), my(stroke[i][1]));
          ctx.stroke();
        }
        ctx.restore();
      }

      // dotted centreline
      if (showDots) {
        const faint = lv === "medium" && !revealRef.current;
        ctx.save();
        ctx.lineCap = "round";
        ctx.setLineDash([1, faint ? 16 : 13]);
        ctx.lineWidth = big * (faint ? 0.016 : 0.022);
        ctx.strokeStyle = faint ? "#c2cedd" : "#9fb3cd";
        for (const stroke of strokes) {
          ctx.beginPath(); ctx.moveTo(mx(stroke[0][0]), my(stroke[0][1]));
          for (let i = 1; i < stroke.length; i++) ctx.lineTo(mx(stroke[i][0]), my(stroke[i][1]));
          ctx.stroke();
        }
        ctx.restore();
      }

      // green progress feedback (only while actually tracing easy/medium)
      if ((lv === "easy" || lv === "medium") && !revealRef.current) {
        const per = samplesRef.current, prog = progRef.current;
        if (per && prog) {
          ctx.fillStyle = "rgba(34,197,94,0.95)";
          for (let si = 0; si < per.length; si++)
            for (let i = 0; i < prog[si]; i++)
              { ctx.beginPath(); ctx.arc(mx(per[si][i].nx), my(per[si][i].ny), big * 0.013, 0, Math.PI * 2); ctx.fill(); }
        }
      }

      // user ink
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = accent; ctx.lineWidth = big * 0.045;
      for (const path of inkRef.current) {
        if (path.length === 1) { ctx.beginPath(); ctx.arc(path[0].x, path[0].y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill(); continue; }
        ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
      }
      ctx.restore();

      // numbered start dots + arrows (easy/medium, or when revealing answer)
      if (showGuides) {
        const activeSt = activeRef.current;
        strokes.forEach((stroke, idx) => {
          const s = stroke[0];
          const done = progRef.current[idx] >= (samplesRef.current[idx]?.length || 0);
          const r = big * 0.032;
          ctx.fillStyle = done ? "#9ca3af" : (idx === activeSt ? "#f59e0b" : "#22c55e");
          ctx.beginPath(); ctx.arc(mx(s[0]), my(s[1]), r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = `bold ${r * 1.3}px sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(String(idx + 1), mx(s[0]), my(s[1]) + 0.5);
          const a = stroke[stroke.length - 2], b = stroke[stroke.length - 1];
          if (a && b) {
            const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
            const tx = mx(b[0]), ty = my(b[1]); const sz = big * 0.04;
            ctx.fillStyle = done ? "#9ca3af" : "#16a34a";
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(tx - sz * Math.cos(ang - 0.5), ty - sz * Math.sin(ang - 0.5));
            ctx.lineTo(tx - sz * Math.cos(ang + 0.5), ty - sz * Math.sin(ang + 0.5));
            ctx.closePath(); ctx.fill();
          }
        });
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [glyph, strokes, accent]);

  const toLocal = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const advance = (a, b) => {
    if (levelRef.current === "hard") return; // hard = free draw, checked on demand
    const per = samplesRef.current, prog = progRef.current;
    if (!per || !per.length) return;
    const { pad, bw, bh, hit } = geomRef.current;
    let active = activeRef.current;
    const px = (s) => ({ x: pad + s.nx * bw, y: pad + s.ny * bh });
    if (!b) {
      // tap (pointer down): advance at most ONE sample so a tap can't fill a stroke
      while (active < per.length && prog[active] >= per[active].length) active++;
      if (active < per.length) {
        const s = px(per[active][prog[active]]);
        if (Math.hypot(s.x - a.x, s.y - a.y) <= hit) prog[active]++;
      }
    } else {
      // drag: consume frontier samples the segment passes near, in order
      let moved = true;
      while (moved) {
        moved = false;
        if (active >= per.length) break;
        if (prog[active] >= per[active].length) { active++; moved = true; continue; }
        const s = px(per[active][prog[active]]);
        if (distToSeg(s.x, s.y, a.x, a.y, b.x, b.y) <= hit) { prog[active]++; moved = true; }
      }
    }
    activeRef.current = active;
    // complete only when EVERY stroke has been traced to (near) its end, in order
    if (!doneRef.current) {
      let complete = per.length > 0;
      for (let i = 0; i < per.length; i++) {
        if (prog[i] < per[i].length - 1) { complete = false; break; }
      }
      if (complete) { doneRef.current = true; onCompleteRef.current?.(); }
    }
  };

  const down = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    const p = toLocal(e);
    inkRef.current.push([p]);
    advance(p);
    const onMove = (ev) => {
      if (!drawingRef.current) return;
      if (ev.cancelable) ev.preventDefault();
      const q = toLocal(ev);
      const cur = inkRef.current[inkRef.current.length - 1];
      if (!cur) { inkRef.current.push([q]); advance(q); return; }
      const prev = cur[cur.length - 1];
      cur.push(q);
      advance(prev || q, q);
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
      <canvas ref={canvasRef} className={styles.canvas} onPointerDown={down} />
    </div>
  );
});

export default TraceStage;
