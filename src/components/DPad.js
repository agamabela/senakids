"use client";

import styles from "./DPad.module.css";

/**
 * Floating D-pad anchored to the bottom-right corner.
 * Props:
 *  onUp / onDown / onLeft / onRight — handlers (fire once per press)
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

  // Single pointer handler so each press triggers exactly once on both
  // mouse and touch (avoids the touchstart + synthesized-click double fire
  // that made games move two tiles per tap).
  const press = (fn) => (e) => {
    e.preventDefault();
    fn?.();
  };

  return (
    <div
      className={`${styles.dpad} ${side === "left" ? styles.left : styles.right}`}
      aria-label="Kontrol arah"
    >
      {/* Row: up */}
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnUp}`}
          onPointerDown={press(onUp)}
          aria-label="Atas / Maju"
        >
          {upLabel}
        </button>
      </div>

      {/* Row: left · centre · right */}
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnLeft}`}
          onPointerDown={press(left)}
          aria-label="Kiri"
        >
          {lLbl}
        </button>
        {/* centre — action button (e.g. bomb) when onCenter is provided */}
        {onCenter ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.centerBtn}`}
            onPointerDown={press(onCenter)}
            aria-label="Aksi"
          >
            {centerLabel}
          </button>
        ) : (
          <div className={styles.centre} aria-hidden="true" />
        )}
        <button
          type="button"
          className={`${styles.btn} ${styles.btnRight}`}
          onPointerDown={press(right)}
          aria-label="Kanan"
        >
          {rLbl}
        </button>
      </div>

      {/* Row: down */}
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnDown}`}
          onPointerDown={press(onDown)}
          aria-label="Bawah / Mundur"
        >
          {downLabel}
        </button>
      </div>
    </div>
  );
}
