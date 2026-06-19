"use client";

import { motion } from "framer-motion";
import { Trophy, Play } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const builtGames = [
  { title: "Drum", description: "Tap untuk main!", emoji: "🥁", href: "/games/built/drum", color: "purple" },
  { title: "Membuat Jalur", description: "Bangun rute yang benar.", emoji: "🧭", href: "/games/built/membuat-jalur", color: "blue" },
  { title: "Learn English 1", description: "Kata sederhana dan suara.", emoji: "📘", href: "/games/built/learn-english-1", color: "green" },
  { title: "Flashcard Simple", description: "Ingat gambar dan kata.", emoji: "🃏", href: "/games/built/flashcard-simple", color: "orange" },
  { title: "Tebak Gambar", description: "Tebak apa yang ditampilkan.", emoji: "🖼️", href: "/games/built/tebak-gambar", color: "pink" },
  { title: "Mencocokkan Gambar", description: "Pasangkan gambar yang sama.", emoji: "🧠", href: "/games/built/mencocokkan-gambar", color: "teal" },
  { title: "Menyabung Pipa", description: "Sambungkan aliran air.", emoji: "🔧", href: "/games/built/menyabung-pipa", color: "yellow" },
  { title: "Menyusun Gambar", description: "Susun potongan menjadi utuh.", emoji: "🧩", href: "/games/built/menyusun-gambar", color: "blue" },
  { title: "Mengurutkan Balok", description: "Urutkan balok dengan benar.", emoji: "🟦", href: "/games/built/mengurutkan-balok", color: "green" },
  { title: "Urutkan Bola Angka", description: "Susun angka dari kecil ke besar.", emoji: "⚽", href: "/games/built/urutkan-bola-angka", color: "orange" },
  { title: "Quiz", description: "Jawab pertanyaan seru.", emoji: "🧠", href: "/games/built/quiz", color: "purple" },
  { title: "Berhitung", description: "Soal matematika seru!", emoji: "🔢", href: "/games/built/berhitung", color: "blue" },
  { title: "Mewarnai", description: "Warnai gambar yang indah!", emoji: "🎨", href: "/games/built/mewarnai", color: "pink" },
  { title: "Huruf ABC", description: "Belajar huruf dan suara!", emoji: "🔤", href: "/games/built/huruf-abc", color: "green" },
  { title: "Warna", description: "Belajar warna-warna!", emoji: "🎨", href: "/games/built/warna", color: "orange" },
  { title: "Piano", description: "Main piano interaktif!", emoji: "🎹", href: "/games/built/piano", color: "purple" },
  { title: "Petualangan Labirin", description: "Kumpulkan bintang di labirin!", emoji: "🧑‍🚀", href: "/games/built/petualangan-labirin", color: "blue" },
];

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
      <section className={styles.zoneSection}>
        <motion.div 
          className={styles.zoneHeader}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.zoneIndicator} style={{ backgroundColor: getZoneColor("Built-in") }} />
          <div>
            <h2 className={styles.zoneTitle}>{t("games.builtInTitle")}</h2>
            <p className={styles.zoneDesc}>{t("games.builtInDesc")}</p>
          </div>
        </motion.div>

        <div className={styles.zoneGrid}>
          {builtGames.map((game, j) => (
            <ActivityCard key={game.href} {...game} delay={j * 0.05} />
          ))}
        </div>
      </section>

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
