"use client";

import { motion } from "framer-motion";
import { Trophy, Play } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const builtGames = [
  { title: { id: "Drum", en: "Drum" }, description: { id: "Ketuk untuk main!", en: "Tap to play!" }, emoji: "🥁", href: "/games/built/drum", color: "purple" },
  { title: { id: "Membuat Jalur", en: "Build the Path" }, description: { id: "Bangun rute yang benar.", en: "Build the right route." }, emoji: "🧭", href: "/games/built/membuat-jalur", color: "blue" },
  { title: { id: "Learn English 1", en: "Learn English 1" }, description: { id: "Kata sederhana dan suara.", en: "Simple words and sounds." }, emoji: "📘", href: "/games/built/learn-english-1", color: "green" },
  { title: { id: "Flashcard Simple", en: "Simple Flashcards" }, description: { id: "Ingat gambar dan kata.", en: "Remember pictures and words." }, emoji: "🃏", href: "/games/built/flashcard-simple", color: "orange" },
  { title: { id: "Tebak Gambar", en: "Guess the Picture" }, description: { id: "Tebak apa yang ditampilkan.", en: "Guess what's shown." }, emoji: "🖼️", href: "/games/built/tebak-gambar", color: "pink" },
  { title: { id: "Mencocokkan Gambar", en: "Match the Pictures" }, description: { id: "Pasangkan gambar yang sama.", en: "Pair up matching pictures." }, emoji: "🧠", href: "/games/built/mencocokkan-gambar", color: "teal" },
  { title: { id: "Menyabung Pipa", en: "Connect the Pipes" }, description: { id: "Sambungkan aliran air.", en: "Connect the water flow." }, emoji: "🔧", href: "/games/built/menyabung-pipa", color: "yellow" },
  { title: { id: "Menyusun Gambar", en: "Picture Puzzle" }, description: { id: "Susun potongan menjadi utuh.", en: "Put the pieces together." }, emoji: "🧩", href: "/games/built/menyusun-gambar", color: "blue" },
  { title: { id: "Mengurutkan Balok", en: "Order the Blocks" }, description: { id: "Urutkan balok dengan benar.", en: "Sort the blocks correctly." }, emoji: "🟦", href: "/games/built/mengurutkan-balok", color: "green" },
  { title: { id: "Urutkan Bola Angka", en: "Number Ball Order" }, description: { id: "Susun angka dari kecil ke besar.", en: "Order numbers small to big." }, emoji: "⚽", href: "/games/built/urutkan-bola-angka", color: "orange" },
  { title: { id: "Quiz", en: "Quiz" }, description: { id: "Jawab pertanyaan seru.", en: "Answer fun questions." }, emoji: "🧠", href: "/games/built/quiz", color: "purple" },
  { title: { id: "Berhitung", en: "Counting" }, description: { id: "Soal matematika seru!", en: "Fun math problems!" }, emoji: "🔢", href: "/games/built/berhitung", color: "blue" },
  { title: { id: "Mewarnai", en: "Coloring" }, description: { id: "Warnai gambar yang indah!", en: "Color beautiful pictures!" }, emoji: "🎨", href: "/games/built/mewarnai", color: "pink" },
  { title: { id: "Huruf ABC", en: "ABC Letters" }, description: { id: "Belajar huruf dan suara!", en: "Learn letters and sounds!" }, emoji: "🔤", href: "/games/built/huruf-abc", color: "green" },
  { title: { id: "Menggambar Bebas", en: "Free Drawing" }, description: { id: "Gambar apa saja sesukamu!", en: "Draw anything you like!" }, emoji: "🎨", href: "/games/built/warna", color: "orange" },
  { title: { id: "Piano", en: "Piano" }, description: { id: "Main piano interaktif!", en: "Play the interactive piano!" }, emoji: "🎹", href: "/games/built/piano", color: "purple" },
  { title: { id: "Petualangan Labirin", en: "Maze Adventure" }, description: { id: "Kumpulkan permata di labirin!", en: "Collect gems in the maze!" }, emoji: "💎", href: "/games/built/petualangan-labirin", color: "blue" },
  { title: { id: "Labirin 3D", en: "3D Maze" }, description: { id: "Jelajah labirin 3D & kumpulkan permata!", en: "Explore a 3D maze & collect gems!" }, emoji: "🧊", href: "/games/built/labirin-3d", color: "green" },
  { title: { id: "Si Bom Pintar", en: "Smart Bomber" }, description: { id: "Letakkan bom & kalahkan monster!", en: "Drop bombs & beat the monsters!" }, emoji: "💣", href: "/games/built/bomberman", color: "orange" },
  { title: { id: "Astronot Terbang", en: "Rocket Flier" }, description: { id: "Terbang, hindari pipa, kumpulkan bintang!", en: "Fly, dodge pipes, collect stars!" }, emoji: "🚀", href: "/games/built/astronot-terbang", color: "blue" },
  { title: { id: "Ular Pintar", en: "Smart Snake" }, description: { id: "Makan buah & tumbuh panjang, jangan menabrak!", en: "Eat fruit & grow, don't crash!" }, emoji: "🐍", href: "/games/built/ular-pintar", color: "green" },
  { title: { id: "Ludo", en: "Ludo" }, description: { id: "Balapan bidak mengelilingi papan, capai pusat dulu!", en: "Race your tokens to the center first!" }, emoji: "🎲", href: "/games/built/ludo", color: "purple" },
  { title: { id: "Ular Tangga", en: "Snakes & Ladders" }, description: { id: "Naik tangga, hindari ular — atau buat papanmu sendiri!", en: "Climb ladders, dodge snakes — or build your own board!" }, emoji: "🪜", href: "/games/built/ular-tangga", color: "teal" },
  { title: { id: "Lacak Huruf", en: "Trace Letters" }, description: { id: "Tulis huruf A-Z dengan menelusuri titik!", en: "Write letters A-Z by tracing the dots!" }, emoji: "✏️", href: "/games/built/lacak-huruf", color: "blue" },
  { title: { id: "Lacak Angka", en: "Trace Numbers" }, description: { id: "Tulis angka 0-9 dengan menelusuri titik!", en: "Write numbers 0-9 by tracing the dots!" }, emoji: "🔢", href: "/games/built/lacak-angka", color: "green" },
];

// Helper function to extract color from zone if needed, or just default to blue
const getZoneColor = (title) => {
  if (title.includes("Puzzle")) return "var(--color-blue)";
  if (title.includes("Cepat")) return "var(--color-orange)";
  return "var(--color-green)";
};

export default function GamesClient({ zones }) {
  const { t, language } = useLanguage();
  const L = (o) => (o && typeof o === "object" ? (o[language] ?? o.id) : o);

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
          <button
            className={styles.playNowBtn}
            onClick={() => {
              if (typeof document !== "undefined") {
                document.getElementById("built-games")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <Play fill="currentColor" size={24} /> {t("games.playNow")}
          </button>
        </div>
      </motion.div>

      {/* Game Zones from DB */}
      <section className={styles.zoneSection} id="built-games">
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
            <ActivityCard key={game.href} {...game} title={L(game.title)} description={L(game.description)} delay={j * 0.05} />
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
