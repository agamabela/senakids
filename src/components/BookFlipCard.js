"use client";

import { motion } from "framer-motion";
import { Download, BookOpen } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./BookFlipCard.module.css";

export default function BookFlipCard({ title, description, emoji, pdfUrl, color, delay = 0 }) {
  const { t } = useLanguage();
  const backgroundStyle = { backgroundColor: color || "var(--color-card)" };

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <div className={styles.card}>
        <div className={styles.inner}>
          <div className={styles.face} style={backgroundStyle}>
            <div className={styles.emoji}>
              {emoji || <BookOpen size={56} />}
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <div className={styles.hint}>
              {pdfUrl ? t("bookFlip.hoverHint") : t("bookFlip.uploadHint")}
            </div>
          </div>

          <div className={`${styles.face} ${styles.back}`}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noreferrer" className={styles.pdfButton}>
                <Download size={16} /> {t("bookFlip.openPdf")}
              </a>
            ) : (
              <div className={styles.noPdf}>{t("bookFlip.noPdf")}</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
