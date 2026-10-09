'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

export default function MathNegativeGameClient() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [mode, setMode] = useState('add_sub'); // 'add_sub', 'compare', 'find_line'
  const [targetNumber, setTargetNumber] = useState(0);
  const [selectedOnLine, setSelectedOnLine] = useState(null);

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
    setUserAnswer('');
    setSelectedOnLine(null);

    const modes = ['add_sub', 'compare', 'find_line'];
    const currentMode = modes[Math.floor(Math.random() * modes.length)];
    setMode(currentMode);

    if (currentMode === 'find_line') {
      const target = Math.floor(Math.random() * 21) - 10; // -10 to 10
      setTargetNumber(target);
      setQuestion({
        prompt: `Temukan angka ${target} pada garis bilangan di bawah!`,
        target,
      });
    } else if (currentMode === 'compare') {
      let a = Math.floor(Math.random() * 21) - 10;
      let b = Math.floor(Math.random() * 21) - 10;
      while (a === b) {
        b = Math.floor(Math.random() * 21) - 10;
      }
      const correct = a < b ? '<' : '>';
      setQuestion({
        a,
        b,
        correct,
        prompt: `Bandingkan dua bilangan berikut: ${a} ... ${b}`,
      });
    } else {
      // add_sub
      const op = Math.random() > 0.5 ? '+' : '-';
      let a = Math.floor(Math.random() * 15) - 7;
      let b = Math.floor(Math.random() * 9) + 1;
      const ans = op === '+' ? a + b : a - b;
      setQuestion({
        a,
        b,
        op,
        correct: ans,
        prompt: `Berapakah hasil dari: ${a} ${op} ${b} ?`,
      });
    }
  }, []);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const checkAnswer = (val) => {
    if (feedback) return;

    let isCorrect = false;
    if (mode === 'find_line') {
      isCorrect = Number(val) === question.target;
    } else if (mode === 'compare') {
      isCorrect = val === question.correct;
    } else {
      isCorrect = Number(val) === question.correct;
    }

    if (isCorrect) {
      playTone(587, 0.1);
      setTimeout(() => playTone(880, 0.25), 100);
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedback({ type: 'correct', msg: 'Benar sekali! Hebat! 🎉' });
    } else {
      playTone(220, 0.3, 'sawtooth');
      setStreak(0);
      const rightAns = mode === 'find_line' ? question.target : question.correct;
      setFeedback({ type: 'wrong', msg: `Kurang tepat. Jawabannya adalah ${rightAns}. Tetap semangat! 💪` });
    }

    setTimeout(() => {
      generateQuestion();
    }, 1800);
  };

  const lineNumbers = [];
  for (let i = -10; i <= 10; i++) {
    lineNumbers.push(i);
  }

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
          <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.2rem', backgroundColor: '#dbeafe', padding: '0.4rem 0.9rem', borderRadius: 999 }}>
            Skor: {score}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '3px solid #e0e7ff',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>
          Bilangan Negatif & Garis Bilangan 🧭
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Pahami konsep angka di bawah nol dengan garis bilangan interaktif!
        </p>

        {/* Visual Number Line */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #cbd5e1',
            borderRadius: 16,
            padding: '1.5rem 0.75rem',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <div style={{ minWidth: 680, position: 'relative' }}>
            <div style={{ height: 4, backgroundColor: '#3b82f6', position: 'relative', top: 22, zIndex: 1, borderRadius: 2 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
              {lineNumbers.map((num) => {
                const isSelected = selectedOnLine === num;
                const isZero = num === 0;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (mode === 'find_line') {
                        setSelectedOnLine(num);
                        checkAnswer(num);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: mode === 'find_line' ? 'pointer' : 'default',
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: isZero ? 14 : 10,
                        height: isZero ? 14 : 10,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#10b981' : isZero ? '#ef4444' : num < 0 ? '#6366f1' : '#3b82f6',
                        border: '2px solid #ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        marginBottom: 6,
                        transition: 'transform 0.15s ease',
                        transform: isSelected ? 'scale(1.5)' : 'scale(1)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: isZero ? '0.85rem' : '0.75rem',
                        fontWeight: isZero ? 900 : 700,
                        color: isZero ? '#ef4444' : num < 0 ? '#4338ca' : '#1e3a8a',
                      }}
                    >
                      {num}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Prompt */}
        {question && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0f172a',
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: 16,
                display: 'inline-block',
                border: '2px solid #bfdbfe',
              }}
            >
              {question.prompt}
            </div>
          </div>
        )}

        {/* Interactive Controls per Mode */}
        {mode === 'find_line' && (
          <p style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.1rem' }}>
            👆 Klik langsung titik pada garis bilangan di atas!
          </p>
        )}

        {mode === 'compare' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            {['<', '>'].map((op) => (
              <button
                key={op}
                onClick={() => checkAnswer(op)}
                style={{
                  width: 90,
                  height: 90,
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  borderRadius: 20,
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 6px 0 #3730a3',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(4px)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {op}
              </button>
            ))}
          </div>
        )}

        {mode === 'add_sub' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userAnswer !== '') {
                  checkAnswer(userAnswer);
                }
              }}
              placeholder="Jawaban..."
              style={{
                width: 140,
                padding: '0.8rem 1rem',
                fontSize: '1.4rem',
                fontWeight: 800,
                textAlign: 'center',
                borderRadius: 14,
                border: '3px solid #cbd5e1',
                outline: 'none',
              }}
            />
            <button
              onClick={() => userAnswer !== '' && checkAnswer(userAnswer)}
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '1.2rem',
                fontWeight: 800,
                borderRadius: 14,
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 0 #059669',
                cursor: 'pointer',
              }}
            >
              Kirim 🚀
            </button>
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
