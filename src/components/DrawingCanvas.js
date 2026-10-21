'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { commitDrawing, undoDrawing, redoDrawing } from '@/lib/drawing-history.mjs';
import styles from './DrawingCanvas.module.css';

const COLORS = [
  ['Merah', 'Red', '#EF4444'], ['Oranye', 'Orange', '#F97316'],
  ['Kuning', 'Yellow', '#F59E0B'], ['Hijau', 'Green', '#10B981'],
  ['Biru', 'Blue', '#3B82F6'], ['Ungu', 'Purple', '#8B5CF6'],
  ['Merah Muda', 'Pink', '#EC4899'], ['Hitam', 'Black', '#1E1B4B'],
];
const TOOLS = [['brush', 'Kuas', 'Brush'], ['eraser', 'Penghapus', 'Eraser'],
  ['★', 'Stempel bintang', 'Star stamp'], ['●', 'Stempel lingkaran', 'Circle stamp'], ['♥', 'Stempel hati', 'Heart stamp']];

function paint(ctx, action) {
  if (action.tool === 'clear') {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 900, 500); return;
  }
  ctx.fillStyle = ctx.strokeStyle = action.tool === 'eraser' ? '#fff' : action.color;
  const first = action.points[0];
  if (!['brush', 'eraser'].includes(action.tool)) {
    ctx.font = `${action.size * 5}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(action.tool, first.x, first.y); return;
  }
  ctx.lineWidth = action.tool === 'eraser' ? action.size * 2 : action.size;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.arc(first.x, first.y, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(first.x, first.y);
  action.points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y)); ctx.stroke();
}

export default function DrawingCanvas() {
  const { tx } = useLanguage();
  const canvasRef = useRef(null);
  const strokeRef = useRef(null);
  const [history, setHistory] = useState({ actions: [], future: [] });
  const [draft, setDraft] = useState(null);
  const [color, setColor] = useState(COLORS[0][2]);
  const [size, setSize] = useState(8);
  const [tool, setTool] = useState('brush');
  const [cursor, setCursor] = useState({ x: 450, y: 250 });
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [exportUrl, setExportUrl] = useState('');

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    paint(ctx, { tool: 'clear' });
    history.actions.forEach((action) => paint(ctx, action));
    if (draft) paint(ctx, draft);
    if (focused) {
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.strokeRect(cursor.x - 10, cursor.y - 10, 20, 20);
    }
  }, [history, draft, focused, cursor]);

  const pointAt = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 900 / rect.width, y: (event.clientY - rect.top) * 500 / rect.height };
  };
  const start = (event) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFocused(false);
    strokeRef.current = { tool, color, size, points: [pointAt(event)] };
    setDraft(strokeRef.current);
  };
  const move = (event) => {
    if (!strokeRef.current || !['brush', 'eraser'].includes(strokeRef.current.tool)) return;
    strokeRef.current = { ...strokeRef.current, points: [...strokeRef.current.points, pointAt(event)] };
    setDraft(strokeRef.current);
  };
  const finish = () => {
    if (!strokeRef.current) return;
    const action = strokeRef.current;
    setHistory((current) => commitDrawing(current, action));
    strokeRef.current = null; setDraft(null);
  };
  const keyboard = (event) => {
    const shifts = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    if (shifts[event.key]) {
      event.preventDefault(); const [x, y] = shifts[event.key];
      setCursor((p) => ({ x: Math.max(10, Math.min(890, p.x + x)), y: Math.max(10, Math.min(490, p.y + y)) }));
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      setHistory((current) => commitDrawing(current, { tool, color, size, points: [cursor] }));
    }
  };
  const save = () => {
    const image = document.createElement('canvas'); image.width = 900; image.height = 500;
    const ctx = image.getContext('2d'); paint(ctx, { tool: 'clear' });
    history.actions.forEach((action) => paint(ctx, action));
    setExportUrl(image.toDataURL('image/png'));
    setMessage(tx('Gambar PNG siap diunduh. Simpan sebelum meninggalkan halaman.', 'Your PNG is ready to download. Save before leaving this page.'));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="group" aria-label={tx('Alat menggambar', 'Drawing tools')}>
        <div className={styles.colorGroup} role="group" aria-label={tx('Warna kuas', 'Brush color')}>
          {COLORS.map(([id, en, hex]) => <button key={hex} type="button" aria-label={tx(id, en)} title={tx(id, en)}
            aria-pressed={color === hex} className={`${styles.colorBtn} ${color === hex ? styles.colorBtnSelected : ''}`}
            style={{ backgroundColor: hex }} onClick={() => setColor(hex)} />)}
        </div>
        <div className={styles.sizeGroup} role="group" aria-label={tx('Ukuran kuas', 'Brush size')}>
          {[4, 8, 16].map((value, index) => <button key={value} type="button" aria-label={`${tx(['Kecil', 'Sedang', 'Besar'][index], ['Small', 'Medium', 'Large'][index])} (${value}px)`}
            aria-pressed={size === value} className={`${styles.sizeBtn} ${size === value ? styles.sizeBtnSelected : ''}`} onClick={() => setSize(value)}>
            <span className={styles.sizeDot} style={{ width: value, height: value }} /></button>)}
        </div>
        <div className={styles.actionGroup}>
          {TOOLS.map(([value, id, en]) => <button key={value} type="button" className={styles.toolBtn} aria-pressed={tool === value}
            onClick={() => setTool(value)}>{tx(id, en)}</button>)}
          <button type="button" className={styles.toolBtn} disabled={!history.actions.length} onClick={() => setHistory(undoDrawing)}>{tx('Urungkan', 'Undo')}</button>
          <button type="button" className={styles.toolBtn} disabled={!history.future.length} onClick={() => setHistory(redoDrawing)}>{tx('Ulangi', 'Redo')}</button>
          <button type="button" className={styles.toolBtn} disabled={!history.actions.length} onClick={() => setHistory((current) => commitDrawing(current, { tool: 'clear' }))}>{tx('Bersihkan kanvas', 'Clear canvas')}</button>
          <button type="button" className={styles.toolBtn} onClick={save}>{tx('Simpan gambar', 'Save drawing')}</button>
        </div>
      </div>
      <p id="drawing-help" className={styles.help}>{tx('Gambar atau ketuk untuk memberi stempel. Dengan keyboard: panah memindahkan posisi, Spasi atau Enter memberi tanda. Simpan gambar sebelum keluar.', 'Draw or tap to stamp. Keyboard: arrows move the cursor, Space or Enter makes a mark. Save before leaving.')}</p>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} width={900} height={500} className={styles.canvas} tabIndex={0}
          aria-label={tx('Kanvas menggambar', 'Drawing canvas')} aria-describedby="drawing-help"
          onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}
          onLostPointerCapture={finish} onKeyDown={keyboard} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
          {tx('Gunakan browser yang mendukung kanvas untuk menggambar.', 'Use a canvas-enabled browser to draw.')}
        </canvas>
      </div>
      <p role="status" className={styles.help}>{message}</p>
      {exportUrl && <a className={styles.toolBtn} href={exportUrl} download="sena-kids-gambarku.png">{tx("Unduh PNG", "Download PNG")}</a>}
    </div>
  );
}
