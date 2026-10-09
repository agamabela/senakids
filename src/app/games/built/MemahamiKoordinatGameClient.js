'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const GRID_SIZE = 6; // 0 to 5 on X and Y

export default function MemahamiKoordinatGameClient() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [target, setTarget] = useState({ x: 2, y: 3 });
  const [mode, setMode] = useState('find_spot'); // 'find_spot' (click grid given (x,y)), 'guess_coords' (read coords of icon)
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const audioCtxRef = useRef(null);

  const playTone = useCallback((freq, duration = 0.15) => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // audio fallback
    }
  }, []);

  const generateQuestion = useCallback(() => {
    setFeedback(null);
    const newX = Math.floor(Math.random() * GRID_SIZE);
    const newY = Math.floor(Math.random() * GRID_SIZE);
    setTarget({ x: newX, y: newY });

    const newMode = Math.random() > 0.5 ? 'find_spot' : 'guess_coords';
    setMode(newMode);

    if (newMode === 'guess_coords') {
      const correctStr = `(${newX}, ${newY})`;
      const opts = new Set([correctStr]);
      while (opts.size < 4) {
        const rx = Math.floor(Math.random() * GRID_SIZE);
        const ry = Math.floor(Math.random() * GRID_SIZE);
        opts.add(`(${rx}, ${ry})`);
      }
      setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    }
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleCellClick = (x, y) => {
    if (mode !== 'find_spot' || feedback) return;

    if (x === target.x && y === target.y) {
      playTone(587, 0.12);
      setTimeout(() => playTone(880, 0.25), 120);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedback({ type: 'correct', msg: `Tepat sekali! Titik (${x}, ${y}) ditemukan! 🎯` });
    } else {
      playTone(220, 0.3);
      setStreak(0);
      setFeedback({ type: 'wrong', msg: `Kamu mengklik (${x}, ${y}), seharusnya (${target.x}, ${target.y}). Ingat: X mendatar, Y tegak!` });
    }

    setTimeout(() => {
      generateQuestion();
    }, 1800);
  };

  const handleChoiceClick = (choiceStr) => {
    if (feedback) return;
    const correctStr = `(${target.x}, ${target.y})`;

    if (choiceStr === correctStr) {
      playTone(587, 0.12);
      setTimeout(() => playTone(880, 0.25), 120);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedback({ type: 'correct', msg: `Luar biasa! Koordinat bintang adalah ${correctStr}! 🌟` });
    } else {
      playTone(220, 0.3);
      setStreak(0);
      setFeedback({ type: 'wrong', msg: `Kurang tepat. Koordinat bintang adalah ${correctStr}. Coba lagi ya!` });
    }

    setTimeout(() => {
      generateQuestion();
    }, 1800);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link
          href="/games"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 999,
            backgroundColor: '#f1f5f9',
            color: '#334155',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          ← Kembali ke Games
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>
            🔥 Streak: {streak}
          </span>
          <span style={{ fontWeight: 800, color: '#9333ea', fontSize: '1.2rem', backgroundColor: '#f3e8ff', padding: '0.4rem 0.9rem', borderRadius: 999 }}>
            Skor: {score}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '3px solid #e9d5ff',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>
          Memahami Koordinat Kartesius 📍
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Pahami koordinat <strong>(X, Y)</strong>: Sumbu X mendatar ke kanan, sumbu Y tegak ke atas!
        </p>

        {/* Prompt */}
        <div
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#581c87',
            padding: '1rem',
            backgroundColor: '#faf5ff',
            borderRadius: 16,
            display: 'inline-block',
            border: '2px solid #e9d5ff',
            marginBottom: '1.5rem',
          }}
        >
          {mode === 'find_spot'
            ? `Klik kotak dengan koordinat: (${target.x}, ${target.y})`
            : `Berapa koordinat bintang ⭐️ pada kotak di bawah?`}
        </div>

        {/* Coordinate Grid */}
        <div style={{ display: 'inline-block', position: 'relative', margin: '0 auto 1.5rem', padding: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 50px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 50px)`,
              gap: 4,
              backgroundColor: '#f8fafc',
              padding: 8,
              borderRadius: 12,
              border: '2px solid #cbd5e1',
            }}
          >
            {/* Draw from Y = GRID_SIZE - 1 down to 0 so 0 is at bottom */}
            {Array.from({ length: GRID_SIZE }).map((_, rowIdx) => {
              const y = GRID_SIZE - 1 - rowIdx;
              return Array.from({ length: GRID_SIZE }).map((_, x) => {
                const isTarget = target.x === x && target.y === y;
                const showStar = mode === 'guess_coords' && isTarget;

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: showStar ? '#fef08a' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      cursor: mode === 'find_spot' ? 'pointer' : 'default',
                      transition: 'background-color 0.1s ease',
                    }}
                    title={`(${x}, ${y})`}
                  >
                    {showStar ? '⭐️' : ''}
                  </button>
                );
              });
            })}
          </div>

          {/* Axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8, marginTop: 6 }}>
            {Array.from({ length: GRID_SIZE }).map((_, x) => (
              <span key={x} style={{ width: 50, textAlign: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6' }}>
                X={x}
              </span>
            ))}
          </div>
        </div>

        {/* Choice buttons if guess_coords */}
        {mode === 'guess_coords' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              maxWidth: 360,
              margin: '0 auto',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChoiceClick(opt)}
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  borderRadius: 16,
                  backgroundColor: '#ffffff',
                  border: '3px solid #9333ea',
                  color: '#581c87',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #d8b4fe',
                  transition: 'all 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(3px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '1.15rem',
              backgroundColor: feedback.type === 'correct' ? '#dcfce7' : '#fee2e2',
              color: feedback.type === 'correct' ? '#166534' : '#991b1b',
              border: `2px solid ${feedback.type === 'correct' ? '#86efac' : '#fca5a5'}`,
            }}
          >
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
}
