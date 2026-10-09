'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.',
  F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---',
  P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
};

const WORDS = ['KID', 'SOS', 'BOLA', 'BUKU', 'MAMA', 'PAPA', 'SENA', 'API', 'AIR'];

export default function MemoryMorseGameClient() {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [targetChar, setTargetChar] = useState('S');
  const [targetMorse, setTargetMorse] = useState('...');
  const [options, setOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [mode, setMode] = useState('guess_char'); // 'guess_char', 'trainer'
  const [customMorse, setCustomMorse] = useState('');

  const audioCtxRef = useRef(null);

  const playBeep = useCallback((duration) => {
    return new Promise((resolve) => {
      try {
        const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);

        setTimeout(resolve, duration * 1000 + 60);
      } catch {
        setTimeout(resolve, duration * 1000);
      }
    });
  }, []);

  const playMorseSound = useCallback(async (morseCode) => {
    if (isPlaying) return;
    setIsPlaying(true);

    for (const symbol of morseCode) {
      if (symbol === '.') {
        await playBeep(0.1);
      } else if (symbol === '-') {
        await playBeep(0.3);
      } else if (symbol === ' ') {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    setIsPlaying(false);
  }, [isPlaying, playBeep]);

  const generateQuestion = useCallback(() => {
    setFeedback(null);
    const chars = Object.keys(MORSE_MAP);
    const picked = chars[Math.floor(Math.random() * chars.length)];
    const morse = MORSE_MAP[picked];

    setTargetChar(picked);
    setTargetMorse(morse);

    const opts = new Set([picked]);
    while (opts.size < 4) {
      const r = chars[Math.floor(Math.random() * chars.length)];
      opts.add(r);
    }

    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));

    // Auto play morse code
    setTimeout(() => {
      playMorseSound(morse);
    }, 300);
  }, [playMorseSound]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleSelect = (char) => {
    if (feedback) return;

    if (char === targetChar) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      setFeedback({ type: 'correct', msg: `Tepat! Huruf '${char}' adalah "${targetMorse}" 📡` });
    } else {
      setStreak(0);
      setFeedback({ type: 'wrong', msg: `Kurang tepat. Huruf yang benar adalah '${targetChar}' ("${targetMorse}"). Coba lagi ya!` });
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
          <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.2rem', backgroundColor: '#e0f2fe', padding: '0.4rem 0.9rem', borderRadius: 999 }}>
            Skor: {score}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '3px solid #bae6fd',
          padding: '2rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('guess_char')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 999,
              fontSize: '0.9rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'guess_char' ? '#0284c7' : '#f0f9ff',
              color: mode === 'guess_char' ? '#ffffff' : '#0369a1',
            }}
          >
            🎮 Kuis Tebak Morse
          </button>
          <button
            onClick={() => setMode('trainer')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 999,
              fontSize: '0.9rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'trainer' ? '#0284c7' : '#f0f9ff',
              color: mode === 'trainer' ? '#ffffff' : '#0369a1',
            }}
          >
            📖 Kamus & Pelatih Morse
          </button>
        </div>

        {mode === 'guess_char' && (
          <>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>
              Kode Morse Memori 📻
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1.5rem' }}>
              Dengarkan atau lihat simbol titik (.) dan garis (-) untuk menebak hurufnya!
            </p>

            {/* Display Morse Visual & Sound Trigger */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: 20,
                padding: '2rem 1rem',
                maxWidth: 480,
                margin: '0 auto 2rem',
              }}
            >
              <div
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  letterSpacing: '8px',
                  color: '#0369a1',
                  marginBottom: '1rem',
                }}
              >
                {targetMorse}
              </div>

              <button
                onClick={() => playMorseSound(targetMorse)}
                disabled={isPlaying}
                style={{
                  padding: '0.8rem 1.8rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 999,
                  backgroundColor: isPlaying ? '#94a3b8' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 0 #0369a1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isPlaying ? '🔊 Memutar Bunyi...' : '▶️ Dengarkan Bunyi Morse'}
              </button>
            </div>

            {/* Multiple Choice Letters */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                maxWidth: 480,
                margin: '0 auto',
              }}
            >
              {options.map((char) => (
                <button
                  key={char}
                  onClick={() => handleSelect(char)}
                  style={{
                    padding: '1.2rem',
                    fontSize: '2rem',
                    fontWeight: 900,
                    borderRadius: 16,
                    backgroundColor: '#ffffff',
                    border: '3px solid #0284c7',
                    color: '#0369a1',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #bae6fd',
                    transition: 'all 0.1s ease',
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(3px)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {char}
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
          </>
        )}

        {mode === 'trainer' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem' }}>
              Kamus Huruf Alfabet Morse
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '0.6rem',
                marginBottom: '2rem',
              }}
            >
              {Object.entries(MORSE_MAP).map(([char, m]) => (
                <button
                  key={char}
                  onClick={() => playMorseSound(m)}
                  style={{
                    padding: '0.6rem 0.4rem',
                    borderRadius: 12,
                    border: '2px solid #e0f2fe',
                    backgroundColor: '#f0f9ff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0369a1' }}>{char}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', letterSpacing: 1 }}>{m}</span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
              Coba Bunyi Kata:
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {WORDS.map((w) => {
                const wMorse = w.split('').map((c) => MORSE_MAP[c]).join(' ');
                return (
                  <button
                    key={w}
                    onClick={() => playMorseSound(wMorse)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 12,
                      border: '2px solid #0284c7',
                      backgroundColor: '#ffffff',
                      color: '#0369a1',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    🔊 {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
