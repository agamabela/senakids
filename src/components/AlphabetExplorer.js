'use client';

import { useState } from 'react';
import styles from './AlphabetExplorer.module.css';

/* Letter data: uppercase, word, and emoji for each letter */
const LETTER_DATA = [
  { letter: 'A', word: 'Apple', emoji: '🍎' },
  { letter: 'B', word: 'Butterfly', emoji: '🦋' },
  { letter: 'C', word: 'Cat', emoji: '🐱' },
  { letter: 'D', word: 'Dog', emoji: '🐶' },
  { letter: 'E', word: 'Elephant', emoji: '🐘' },
  { letter: 'F', word: 'Fish', emoji: '🐠' },
  { letter: 'G', word: 'Grapes', emoji: '🍇' },
  { letter: 'H', word: 'House', emoji: '🏠' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦' },
  { letter: 'J', word: 'Jellyfish', emoji: '🪼' },
  { letter: 'K', word: 'Kite', emoji: '🪁' },
  { letter: 'L', word: 'Lion', emoji: '🦁' },
  { letter: 'M', word: 'Moon', emoji: '🌙' },
  { letter: 'N', word: 'Nest', emoji: '🪺' },
  { letter: 'O', word: 'Octopus', emoji: '🐙' },
  { letter: 'P', word: 'Penguin', emoji: '🐧' },
  { letter: 'Q', word: 'Queen', emoji: '👸' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈' },
  { letter: 'S', word: 'Star', emoji: '⭐' },
  { letter: 'T', word: 'Tiger', emoji: '🐯' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️' },
  { letter: 'V', word: 'Violin', emoji: '🎻' },
  { letter: 'W', word: 'Whale', emoji: '🐋' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵' },
  { letter: 'Y', word: 'Yacht', emoji: '⛵' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓' },
];

/* Rainbow color cycle for tiles */
const RAINBOW_COLORS = [
  'var(--color-purple)',
  'var(--color-pink)',
  'var(--color-red)',
  'var(--color-orange)',
  'var(--color-yellow)',
  'var(--color-green)',
  'var(--color-teal)',
  'var(--color-blue)',
];

export default function AlphabetExplorer() {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const selected = selectedIndex !== null ? LETTER_DATA[selectedIndex] : null;

  return (
    <section className={styles.container} aria-label="Alphabet Explorer">
      {/* ── Title ── */}
      <h2 className={styles.title}>Alphabet Explorer 🔤</h2>
      <p className={styles.subtitle}>Tap a letter to learn!</p>

      {/* ── Letter Grid ── */}
      <div className={styles.grid} role="list">
        {LETTER_DATA.map((item, index) => {
          const isSelected = selectedIndex === index;
          const bgColor = RAINBOW_COLORS[index % RAINBOW_COLORS.length];

          return (
            <button
              key={item.letter}
              role="listitem"
              className={`${styles.tile} ${isSelected ? styles.tileSelected : ''}`}
              style={{ '--tile-color': bgColor }}
              onClick={() => setSelectedIndex(isSelected ? null : index)}
              aria-pressed={isSelected}
              aria-label={`Letter ${item.letter}`}
            >
              {item.letter}
            </button>
          );
        })}
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <div className={styles.detailPanel} key={selected.letter}>
          {/* Big emoji */}
          <span className={styles.detailEmoji} aria-hidden="true">
            {selected.emoji}
          </span>

          {/* Uppercase / lowercase */}
          <div className={styles.detailLetters}>
            <span className={styles.detailUpper}>{selected.letter}</span>
            <span className={styles.detailLower}>{selected.letter.toLowerCase()}</span>
          </div>

          {/* Word */}
          <p className={styles.detailWord}>
            <span className={styles.detailWordHighlight}>{selected.letter}</span>
            {' is for '}
            <strong>{selected.word}</strong> {selected.emoji}
          </p>
        </div>
      )}
    </section>
  );
}
