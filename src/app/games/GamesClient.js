"use client";

import { motion } from "framer-motion";
import { Trophy, Play } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Helper function to extract color from zone if needed, or just default to blue
const getZoneColor = (title) => {
  if (title.includes("Puzzle")) return "var(--color-blue)";
  if (title.includes("Cepat")) return "var(--color-orange)";
  return "var(--color-green)";
};

export default function GamesClient({ zones }) {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      
      {/* Game Arcade Hero */}
      <motion.div 
        className={styles.arcadeHero}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={styles.arcadeGlow} />
        <div className={styles.heroContent}>
          <div className={styles.trophyIcon}>
            <Trophy size={32} />
          </div>
          <h1 className={styles.heroTitle}>{t("games.heroTitle")}</h1>
          <p className={styles.heroSubtitle}>{t("games.heroSubtitle")}</p>
          <button className={styles.playNowBtn}>
            <Play fill="currentColor" size={24} /> {t("games.playNow")}
          </button>
        </div>
      </motion.div>

      {/* Game Zones from DB */}
      {zones.length === 0 && <p style={{textAlign: 'center', marginTop: '40px', color: 'var(--color-muted-foreground)'}}>{t("games.emptyMessage")}</p>}
      {zones.map((zone, i) => (
        <section key={zone.title} className={styles.zoneSection}>
          <motion.div 
            className={styles.zoneHeader}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.zoneIndicator} style={{ backgroundColor: getZoneColor(zone.title) }} />
            <div>
              <h2 className={styles.zoneTitle}>{zone.title}</h2>
              <p className={styles.zoneDesc}>{t("games.zoneDesc")}</p>
            </div>
          </motion.div>
          
          <div className={styles.zoneGrid}>
            {zone.games.map((game, j) => (
              <ActivityCard key={game.id} {...game} delay={j * 0.1} />
            ))}
          </div>
        </section>
      ))}

    </div>
  );
}
