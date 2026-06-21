"use client";

import styles from "./DPad.module.css";

/**
 * Floating D-pad anchored to the bottom-right corner.
 * Props:
 *  onUp / onDown / onLeft / onRight — click handlers
 *  onRotateLeft / onRotateRight     — optional, shown instead of left/right when provided (for 3D maze)
 *  upLabel / downLabel              — optional override for the up/down icons (e.g. "▲"/"▼")
 *  side  — "right" (default) | "left"
 */
export default function DPad({
  onUp,
  onDown,
  onLeft,
  onRight,
  onRotateLeft,
  onRotateRight,
  onCenter,
  centerLabel = "",
  upLabel    = "↑",
  downLabel  = "↓",
  leftLabel  = "←",
  rightLabel = "→",
  side       = "right",
}) {
  const left  = onRotateLeft  ?? onLeft;
  const right = onRotateRight ?? onRight;
  const lLbl  = onRotateLeft  ? "↺" : leftLabel;
  const rLbl  = onRotateRight ? "↻" : rightLabel;

  return (
    <div
      className={`${styles.dpad} ${side === "left" ? styles.left : styles.right}`}
      aria-label="Kontrol arah"
    >
      {/* Row: up */}
      <div className={styles.row}>
        <button
          className={`${styles.btn} ${styles.btnUp}`}
          onClick={onUp}
          onTouchStart={(e) => { e.preventDefault(); onUp?.(); }}
          aria-label="Atas / Maju"
        >
          {upLabel}
        </button>
      </div>

      {/* Row: left · centre · right */}
      <div className={styles.row}>
        <button
          className={`${styles.btn} ${styles.btnLeft}`}
          onClick={left}
          onTouchStart={(e) => { e.preventDefault(); left?.(); }}
          aria-label="Kiri"
        >
          {lLbl}
        </button>
        {/* centre — action button (e.g. bomb) when onCenter is provided */}
        {onCenter ? (
          <button
            className={`${styles.btn} ${styles.centerBtn}`}
            onClick={onCenter}
            onTouchStart={(e) => { e.preventDefault(); onCenter(); }}
            aria-label="Aksi"
          >
            {centerLabel}
          </button>
        ) : (
          <div className={styles.centre} aria-hidden="true" />
        )}
        <button
          className={`${styles.btn} ${styles.btnRight}`}
          onClick={right}
          onTouchStart={(e) => { e.preventDefault(); right?.(); }}
          aria-label="Kanan"
        >
          {rLbl}
        </button>
      </div>

      {/* Row: down */}
      <div className={styles.row}>
        <button
          className={`${styles.btn} ${styles.btnDown}`}
          onClick={onDown}
          onTouchStart={(e) => { e.preventDefault(); onDown?.(); }}
          aria-label="Bawah / Mundur"
        >
          {downLabel}
        </button>
      </div>
    </div>
  );
}
