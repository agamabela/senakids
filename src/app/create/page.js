"use client";

import { motion } from "framer-motion";
import DrawingCanvas from "@/components/DrawingCanvas";
import FloatingShapes from "@/components/FloatingShapes";
import styles from "./page.module.css";

export default function CreatePage() {
  return (
    <>
      <FloatingShapes />
      <div className={styles.container}>
        {/* Page Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.headerEmoji}>🎨</span>
          <h1 className={styles.title}>
            Let&apos;s <span className={styles.gradientTeal}>Create!</span>
          </h1>
          <p className={styles.subtitle}>
            Grab a brush and let your imagination run wild! 🖌️✨
          </p>
        </motion.div>

        {/* Drawing Canvas Section */}
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>
            🖼️ Masterpiece Maker
          </h2>
          <p className={styles.sectionDesc}>
            Pick a color, choose a brush size, and draw whatever you like!
          </p>
          <DrawingCanvas />
        </motion.section>
      </div>
    </>
  );
}
