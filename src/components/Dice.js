"use client";

import { useEffect, useState } from "react";
import styles from "./Dice.module.css";

// pip layout on a 3x3 grid (index 0..8)
const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/**
 * Clickable, animated dice.
 * Props:
 *  value    — final face (1..6) or null
 *  rolling  — when true, tumbles through random faces
 *  onRoll   — called when the die is clicked (if enabled)
 *  disabled — blocks interaction
 *  size     — px
 */
export default function Dice({ value, rolling, onRoll, disabled, size = 66 }) {
  const [face, setFace] = useState(value || 1);

  useEffect(() => {
    if (rolling) {
      const id = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 80);
      return () => clearInterval(id);
    }
    if (value) setFace(value);
    return undefined;
  }, [rolling, value]);

  const pips = PIPS[face] || [];
  const clickable = !disabled && !rolling && typeof onRoll === "function";

  return (
    <button
      type="button"
      className={`${styles.die} ${rolling ? styles.rolling : ""} ${clickable ? styles.clickable : ""}`}
      onClick={() => clickable && onRoll()}
      disabled={disabled}
      style={{ width: size, height: size }}
      aria-label="Dadu"
    >
      <span className={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={styles.cell}>
            {pips.includes(i) && <span className={styles.pip} />}
          </span>
        ))}
      </span>
    </button>
  );
}
