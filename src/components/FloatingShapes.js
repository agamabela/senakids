'use client';

import styles from './FloatingShapes.module.css';

/**
 * Decorative floating shapes rendered as a fixed background layer.
 * Uses a mix of emoji characters and CSS-drawn blobs with varied
 * animations (float, spin, morph) at low opacity.
 */

const SHAPES = [
  /* ── Emoji shapes ── */
  { type: 'emoji', content: '⭐', top: '8%',  left: '5%',   size: 48, delay: 0,    anim: 'float'   },
  { type: 'emoji', content: '☁️', top: '15%', left: '78%',  size: 64, delay: 1.2,  anim: 'float'   },
  { type: 'emoji', content: '🌿', top: '55%', left: '90%',  size: 40, delay: 2.5,  anim: 'float'   },
  { type: 'emoji', content: '🍃', top: '72%', left: '12%',  size: 36, delay: 0.8,  anim: 'float'   },
  { type: 'emoji', content: '☁️', top: '82%', left: '65%',  size: 56, delay: 3.0,  anim: 'float'   },
  /* ── CSS blob shapes (earthy palette) ── */
  { type: 'blob',  top: '25%', left: '88%',  size: 60, delay: 1.8,  color: '#C5948E', anim: 'morph'   },
  { type: 'blob',  top: '40%', left: '3%',   size: 72, delay: 0.4,  color: '#8BA888', anim: 'morph'   },
  { type: 'blob',  top: '65%', left: '45%',  size: 50, delay: 2.2,  color: '#9A8A9E', anim: 'float'   },
  /* ── CSS circle shapes ── */
  { type: 'circle', top: '10%', left: '42%', size: 34, delay: 1.5,  color: '#D9A05B', anim: 'spin'    },
  { type: 'circle', top: '88%', left: '30%', size: 44, delay: 3.4,  color: '#7A8B99', anim: 'float'   },
];

export default function FloatingShapes() {
  return (
    <div className={styles.container} aria-hidden="true">
      {SHAPES.map((shape, i) => {
        /* Pick the right animation class */
        const animClass =
          shape.anim === 'spin'
            ? styles.spinSlow
            : shape.anim === 'morph'
            ? styles.blobMorph
            : styles.float;

        const sharedStyle = {
          top: shape.top,
          left: shape.left,
          width: shape.size,
          height: shape.size,
          animationDelay: `${shape.delay}s`,
        };

        /* ── Emoji shape ── */
        if (shape.type === 'emoji') {
          return (
            <span
              key={i}
              className={`${styles.shape} ${animClass}`}
              style={{ ...sharedStyle, fontSize: shape.size * 0.7 }}
            >
              {shape.content}
            </span>
          );
        }

        /* ── CSS blob shape ── */
        if (shape.type === 'blob') {
          return (
            <span
              key={i}
              className={`${styles.shape} ${styles.blob} ${animClass}`}
              style={{
                ...sharedStyle,
                background: shape.color,
              }}
            />
          );
        }

        /* ── CSS circle shape ── */
        return (
          <span
            key={i}
            className={`${styles.shape} ${styles.circle} ${animClass}`}
            style={{
              ...sharedStyle,
              background: shape.color,
            }}
          />
        );
      })}
    </div>
  );
}
