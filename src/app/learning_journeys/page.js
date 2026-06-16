"use client";

import { motion } from "framer-motion";
import CountingGame from "@/components/CountingGame";
import AlphabetExplorer from "@/components/AlphabetExplorer";
import FloatingShapes from "@/components/FloatingShapes";
import styles from "./page.module.css";

export default function LearningJourneysPage() {
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
          <span className={styles.headerEmoji}>📚</span>
          <h1 className={styles.title}>
            Ayo <span className={styles.gradientPurple}>Belajar!</span>
          </h1>
          <p className={styles.subtitle}>
            Kenali angka, huruf, dan banyak hal seru lainnya! 🧠✨
          </p>
        </motion.div>

        {/* Counting Game Section */}
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>
            🔢 Petualangan Berhitung
          </h2>
          <p className={styles.sectionDesc}>
            Berapa banyak benda yang kamu lihat? Pilih angka yang benar!
          </p>
          <CountingGame />
        </motion.section>

        {/* Alphabet Section */}
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>
            🔤 Penjelajah Alfabet
          </h2>
          <p className={styles.sectionDesc}>
            Tekan huruf untuk melihat apa isinya!
          </p>
          <AlphabetExplorer />
        </motion.section>
      </div>
    </>
  );
}
