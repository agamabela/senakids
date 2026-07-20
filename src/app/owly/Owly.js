"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — the mascot. A generated owl illustration that reacts with different
// animation states (idle / happy / cheer / celebrate / think). The personality
// comes from motion + the speech bubble. No emoji.
// ═══════════════════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import { owlyMascot } from "./owlyImage";
import styles from "./Owly.module.css";

const VARIANTS = {
  idle: { rotate: [0, -3, 0, 3, 0], y: [0, -2, 0], transition: { duration: 4, repeat: Infinity } },
  happy: { scale: [1, 1.15, 1], y: [0, -14, 0], transition: { duration: 0.6 } },
  cheer: { rotate: [0, -8, 8, -8, 0], transition: { duration: 0.6 } },
  celebrate: { rotate: [0, 360], scale: [1, 1.2, 1], transition: { duration: 0.9 } },
  think: { rotate: [0, -6, 0], transition: { duration: 1.2, repeat: Infinity } },
};

const MASCOT_SRC = owlyMascot("square_hd");

export default function Owly({ state = "idle", message, size = 96 }) {
  return (
    <div className={styles.wrap}>
      <motion.img
        src={MASCOT_SRC}
        alt="Owly the owl"
        className={styles.owl}
        style={{ width: size, height: size }}
        animate={VARIANTS[state] || VARIANTS.idle}
        draggable={false}
      />
      {message && (
        <motion.div
          key={message}
          className={styles.bubble}
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
