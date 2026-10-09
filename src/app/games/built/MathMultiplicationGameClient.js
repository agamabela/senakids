'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

export default function MathMultiplicationGameClient() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [numA, setNumA] = useState(2);
  const [numB, setNumB] = useState(3);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [level, setLevel] = useState(1); // 1: 1-5, 2: 1-9, 3: 1-12

  const audioCtxRef = useRef(null);

  const playTone = useCallback((freq, duration = 0.15, type = 'sine') => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }, []);

  const generateQuestion = useCallback(() => {
    setFeedback(null);
    let maxFactor = 5;
    if (level === 2) maxFactor = 9;
    if (level === 3) maxFactor = 12;

    const a = Math.floor(Math.random() * maxFactor) + 1;
    const b = Math.floor(Math.random() * maxFactor) + 1;
    setNumA(a);
    setNumB(b);

    const correctAnswer = a * b;
    const opts = new Set([correctAnswer]);

    while (opts.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = correctAnswer + delta;
      if (fake > 0 && fake !== correctAnswer) {
        opts.add(fake);
      }
    }

    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }, [level]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleSelect = (val) => {
    if (feedback) return;
    const correct = numA * numB;

    if (val === correct) {
      playTone(523, 0.1);
      setTimeout(() => playTone(659, 0.1), 100);
      setTimeout(() => playTone(784, 0.2), 200);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedback({ type: 'correct', msg: `Tepat sekali! ${numA} × ${numB} = ${correct} 🌟` });
    } else {
      playTone(220, 0.25, 'sawtooth');
      setStreak(0);
      setFeedback({ type: 'wrong', msg: `Kurang tepat. ${numA} × ${numB} = ${correct}. Coba lagi ya! 💪` });
    }

    setTimeout(() => {
      generateQuestion();
    }, 1800);
  };

  const icons = ['🍎', '⭐️', '🍪', '🎈', '🚗', '🐱', '🌸', '⚽️'];
  const currentIcon = icons[(numA + numB) % icons.length];

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
          <span style={{ fontWeight: 800, color: '#059669', fontSize: '1.2rem', backgroundColor: '#d1fae5', padding: '0.4rem 0.9rem', borderRadius: 999 }}>
            Skor: {score}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '3px solid #fde047',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { id: 1, label: 'Level 1 (1-5)' },
            { id: 2, label: 'Level 2 (1-9)' },
            { id: 3, label: 'Level 3 (1-12)' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setLevel(lvl.id);
                setStreak(0);
              }}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 999,
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: level === lvl.id ? '#ca8a04' : '#fef08a',
                color: level === lvl.id ? '#ffffff' : '#854d0e',
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>
          Tabel Perkalian Bergambar ✖️
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Lihat kelompok gambar di bawah untuk memahami perkalian dengan mudah!
        </p>

        {/* Math Equation Formula */}
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 900,
            color: '#1e293b',
            margin: '1rem 0 1.5rem',
            letterSpacing: '2px',
          }}
        >
          <span style={{ color: '#2563eb' }}>{numA}</span>
          <span style={{ color: '#94a3b8', margin: '0 0.8rem' }}>×</span>
          <span style={{ color: '#d97706' }}>{numB}</span>
          <span style={{ color: '#94a3b8', margin: '0 0.8rem' }}>=</span>
          <span style={{ color: '#059669' }}>?</span>
        </div>

        {/* Visual Groups / Array Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            backgroundColor: '#fefce8',
            border: '2px dashed #facc15',
            borderRadius: 16,
            marginBottom: '2rem',
            maxWidth: 700,
            margin: '0 auto 2rem',
          }}
        >
          {Array.from({ length: numA }).map((_, gIdx) => (
            <div
              key={gIdx}
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #fde047',
                borderRadius: 12,
                padding: '0.75rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 180,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              {Array.from({ length: numB }).map((_, itemIdx) => (
                <span key={itemIdx} style={{ fontSize: '1.6rem' }} title={`Item ${itemIdx + 1}`}>
                  {currentIcon}
                </span>
              ))}
              <div style={{ width: '100%', fontSize: '0.75rem', fontWeight: 800, color: '#ca8a04', marginTop: 4 }}>
                Kelompok {gIdx + 1} ({numB} item)
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '1.5rem' }}>
          Ada <strong>{numA}</strong> kelompok, masing-masing berisi <strong>{numB}</strong> benda. Berapa totalnya?
        </p>

        {/* Multiple Choice Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          {options.map((val) => (
            <button
              key={val}
              onClick={() => handleSelect(val)}
              style={{
                padding: '1rem',
                fontSize: '1.8rem',
                fontWeight: 900,
                borderRadius: 16,
                backgroundColor: '#f8fafc',
                border: '3px solid #cbd5e1',
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #94a3b8',
                transition: 'all 0.1s ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(3px)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {val}
            </button>
          ))}
        </div>

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
