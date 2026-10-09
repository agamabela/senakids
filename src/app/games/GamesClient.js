"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, Brain, Globe, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

import { TOY_THEATER_CATALOG } from "@/lib/toytheater-games";

// Category 1: Sena Kids Games
const senaKidsGames = [
  { title: { id: "Ski Free", en: "Ski Free" }, href: "/games/ski-free", image: "/images/ski-pagi-key-art-v2.png", emoji: "⛷️", color: "blue" },
  { title: { id: "Ular Tangga", en: "Snakes & Ladders" }, href: "/games/built/ular-tangga", image: "https://data.cabocil.com/assets/images/others/board-snake-and-ladder-v1.png", emoji: "🪜", color: "teal" },
  { title: { id: "Petualangan Labirin", en: "Maze Adventure" }, href: "/games/maze", image: "/images/games/maze/thumbnail.png", emoji: "💎", color: "blue" },
  { title: { id: "Block Blast", en: "Block Blast" }, href: "/games/built/block-blast", emoji: "🧱", color: "purple" },
  { title: { id: "Cari Kata", en: "Word Search" }, href: "/games/built/cari-kata", image: "/images/games/thumbnails/search-word.png", emoji: "🔍", color: "blue" },
  { title: { id: "Sambung Warna", en: "Color Connect" }, href: "/games/built/sambung-warna", emoji: "🟣", color: "pink" },
  { title: { id: "Zip Path", en: "Zip Path" }, href: "/games/built/zip-path", emoji: "⚡", color: "yellow" },
  { title: { id: "Topple Party", en: "Topple Party" }, href: "/games/built/topple-party", emoji: "⚖️", color: "teal" },
  { title: { id: "Labirin 3D", en: "3D Maze" }, href: "/games/built/labirin-3d", emoji: "🧊", color: "green" },
  { title: { id: "Si Bom Pintar", en: "Smart Bomber" }, href: "/games/built/bomberman", emoji: "💣", color: "orange" },
  { title: { id: "Astronot Terbang", en: "Rocket Flier" }, href: "/games/built/astronot-terbang", emoji: "🚀", color: "blue" },
  { title: { id: "Ular Pintar", en: "Smart Snake" }, href: "/games/built/ular-pintar", emoji: "🐍", color: "green" },
  { title: { id: "Ludo", en: "Ludo" }, href: "/games/built/ludo", emoji: "🎲", color: "purple" },
  { title: { id: "Petualangan Lompat", en: "Hop Adventure" }, href: "/games/built/petualangan-lompat", emoji: "🦊", color: "green" },
  { title: { id: "Pukul Tikus", en: "Whack-a-Mole" }, href: "/games/built/pukul-tikus", emoji: "🔨", color: "pink" },
  { title: { id: "Simon Bilang", en: "Simon Says" }, href: "/games/built/simon-bilang", emoji: "🎨", color: "purple" },
  { title: { id: "Letuskan Balon", en: "Pop the Balloons" }, href: "/games/built/letuskan-balon", emoji: "🎈", color: "teal" },
  { title: { id: "Drum", en: "Drum" }, href: "/games/built/drum", image: "https://data.cabocil.com/admin_uploads/admin/drum-game.png", emoji: "🥁", color: "purple" },
  { title: { id: "Piano", en: "Piano" }, href: "/games/built/piano", image: "https://data.cabocil.com/assets/game-thumbnails/simple_piano_v1.png", emoji: "🎹", color: "purple" },
  { title: { id: "Puzzle Gambar", en: "Jigsaw Puzzle" }, href: "/games/built/puzzle-gambar", image: "https://data.cabocil.com/assets/game-thumbnails/puzzle.png", emoji: "🧩", color: "orange" },
  { title: { id: "Menggambar Bebas", en: "Free Drawing" }, href: "/games/built/warna", emoji: "🎨", color: "orange" },
  { title: { id: "Mewarnai", en: "Coloring" }, href: "/games/built/mewarnai", emoji: "🖌️", color: "pink" },
];

// Category 2: Sena Kids Exercises (Latihan Matematika, Logika, Memori)
const senaKidsExercises = [
  { title: { id: "Timbangan Angka", en: "Number Balance" }, href: "/games/built/timbangan-angka", image: "/images/games/thumbnails/numberbalance.png", emoji: "⚖️", color: "orange" },
  { title: { id: "Membandingkan", en: "Comparison" }, href: "/games/built/membandingkan", image: "/images/games/thumbnails/comparison.png", emoji: "⚖️", color: "blue" },
  { title: { id: "Pecahan Lingkaran", en: "Fractions" }, href: "/games/built/pecahan-lingkaran", emoji: "🥧", color: "teal" },
  { title: { id: "Penjumlahan", en: "Addition" }, href: "/games/built/penjumlahan", image: "/images/games/thumbnails/numbersadd.png", emoji: "➕", color: "green" },
  { title: { id: "Pengurangan", en: "Subtraction" }, href: "/games/built/pengurangan", image: "/images/games/thumbnails/numberssubstract.png", emoji: "➖", color: "red" },
  { title: { id: "Angka Negatif", en: "Negative Numbers" }, href: "/games/built/angka-negatif", image: "/images/games/thumbnails/negative-number.png", emoji: "🧭", color: "blue" },
  { title: { id: "Perkalian Dasar", en: "Multiplication" }, href: "/games/built/perkalian", image: "/images/games/thumbnails/perkalian.png", emoji: "✖️", color: "yellow" },
  { title: { id: "Kode Morse Memori", en: "Morse Memory" }, href: "/games/built/morse", image: "/images/games/thumbnails/morse.png", emoji: "📻", color: "purple" },
  { title: { id: "Memahami Koordinat", en: "Understand Coordinates" }, href: "/games/built/memahami-koordinat", emoji: "📍", color: "purple" },
  { title: { id: "Matematika Dasar", en: "Basic Math" }, href: "/games/built/berhitung", image: "https://data.cabocil.com/assets/game-thumbnails/mastermath.png", emoji: "🔢", color: "blue" },
  { title: { id: "Huruf ABC", en: "ABC Letters" }, href: "/games/built/huruf-abc", emoji: "🔤", color: "green" },
  { title: { id: "Lacak Huruf", en: "Trace Letters" }, href: "/games/built/lacak-huruf", emoji: "✏️", color: "blue" },
  { title: { id: "Lacak Angka", en: "Trace Numbers" }, href: "/games/built/lacak-angka", emoji: "🔢", color: "green" },
  { title: { id: "Membuat Jalur", en: "Build the Path" }, href: "/games/built/membuat-jalur", image: "https://data.cabocil.com/assets/game-thumbnails/flowchart.png", emoji: "🧭", color: "blue" },
  { title: { id: "Learn English 1", en: "Learn English 1" }, href: "/games/built/learn-english-1", image: "https://data.cabocil.com/assets/game-thumbnails/flashcard.png", emoji: "📘", color: "green" },
  { title: { id: "Flashcard Simple", en: "Simple Flashcards" }, href: "/games/built/flashcard-simple", image: "https://data.cabocil.com/assets/game-thumbnails/flashcard.png", emoji: "🃏", color: "orange" },
  { title: { id: "Tebak Gambar", en: "Guess the Picture" }, href: "/games/built/tebak-gambar", image: "https://data.cabocil.com/assets/game-thumbnails/flashcard.png", emoji: "🖼️", color: "pink" },
  { title: { id: "Mencocokkan Gambar", en: "Match Pictures" }, href: "/games/built/mencocokkan-gambar", image: "https://data.cabocil.com/assets/game-thumbnails/memmorycard.png", emoji: "🧠", color: "teal" },
  { title: { id: "Menyambung Pipa", en: "Connect the Pipes" }, href: "/games/built/menyabung-pipa", image: "https://data.cabocil.com/assets/game-thumbnails/waterpipe.png", emoji: "🔧", color: "yellow" },
  { title: { id: "Menyusun Gambar", en: "Picture Align" }, href: "/games/built/menyusun-gambar", image: "https://data.cabocil.com/assets/game-thumbnails/memmoryaligncard.png", emoji: "🧩", color: "blue" },
  { title: { id: "Mengurutkan Balok", en: "Order Blocks" }, href: "/games/built/mengurutkan-balok", image: "https://data.cabocil.com/assets/game-thumbnails/mengurutkanbalok.png", emoji: "🟦", color: "green" },
  { title: { id: "Urutkan Bola Angka", en: "Number Ball Order" }, href: "/games/built/urutkan-bola-angka", image: "https://data.cabocil.com/assets/game-thumbnails/numbersorting.png", emoji: "⚽", color: "orange" },
  { title: { id: "Quiz Pintar", en: "Smart Quiz" }, href: "/games/built/quiz", emoji: "🧠", color: "purple" },
];

// Category 3: Games Lainnya (Pilihan Game Edukasi Luar)
const gamesLainnya = [
  { title: { id: "Golf", en: "Golf" }, href: "/games/iframe?gameurl=https://kindahardgolf.com&title=Golf", image: "https://data.cabocil.com/assets/game-thumbnails/golf.png", color: "green" },
  { title: { id: "Menyeberangkan Manusia & Monster", en: "Pass the River: Humans & Monsters" }, href: "/games/iframe?gameurl=https://plastelina.net/cannibals-missionaries-fullscreen&title=Menyeberangkan+Manusia+dan+Monster", image: "https://data.cabocil.com/assets/game-thumbnails/humanandmonsterpassthesea.png", color: "blue" },
  { title: { id: "Serigala, Domba dan Kubis", en: "Wolf, Sheep and Cabbage" }, href: "/games/iframe?gameurl=https://plastelina.net/wolf-sheep-cabbage-fullscreen&title=Serigala+Domba+dan+Kubis", image: "https://data.cabocil.com/assets/game-thumbnails/wolfsheepcabbage.png", color: "orange" },
  { title: { id: "Hour Of Code", en: "Hour Of Code" }, href: "/games/iframe?gameurl=https://game.rodocodo.com/hour-of-code&title=Hour+Of+Code", image: "https://data.cabocil.com/assets/game-thumbnails/rodocodo-hour-of-code.png", color: "purple" },
  { title: { id: "Genshin Music", en: "Genshin Music" }, href: "/games/iframe?gameurl=https://genshin-music.specy.app/zen-keyboard&title=Genshin+Music", image: "https://data.cabocil.com/assets/game-thumbnails/genshin_piano.png", color: "yellow" },
  { title: { id: "Scratch", en: "Scratch MIT" }, href: "https://scratch.mit.edu/", image: "https://images.seeklogo.com/logo-png/43/2/scratch-cat-logo-png_seeklogo-431721.png", isExternal: true, color: "orange" },
];

// Category 4: Toy Theater (Full 172 Games)
const toyTheaterGames = TOY_THEATER_CATALOG;

function CompactGameCard({ game, language }) {
  const title = typeof game.title === "object" ? (game.title[language] || game.title.id) : game.title;
  const isExternal = game.isExternal || false;

  const cardContent = (
    <div className={styles.gameCard}>
      <div className={styles.gameThumbWrapper} style={{ "--game-accent": `var(--color-${game.color || 'primary'})` }}>
        {game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.image} alt={title} className={styles.gameThumbImg} loading="lazy" />
        ) : (
          <span className={styles.gameThumbEmoji}>{game.emoji || "🎮"}</span>
        )}
      </div>
      <div className={styles.gameCardBottom}>
        <h3 className={styles.gameCardTitle}>{title}</h3>
      </div>
    </div>
  );

  if (isExternal) {
    return (
      <a href={game.href} target="_blank" rel="noopener noreferrer" className={styles.gameCardLink}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link href={game.href} className={styles.gameCardLink}>
      {cardContent}
    </Link>
  );
}

export default function GamesClient({ zones = [] }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("sena-games");

  const tx = (id, en) => (language === "id" ? id : en);

  const navCategories = [
    { id: "sena-games", label: tx("Game Sena Kids", "Sena Kids Games") },
    { id: "sena-exercises", label: tx("Latihan Sena Kids", "Sena Kids Exercises") },
    { id: "games-lainnya", label: tx("Games Lainnya", "Other Games") },
    { id: "games-toytheater", label: "Toy Theater" },
  ];

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Gamepad2 size={28} className={styles.headerIcon} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>{tx("Games & Latihan Sena Kids", "Sena Kids Games & Exercises")}</h1>
            <p className={styles.headerSubtitle}>
              {tx("Mainkan game seru atau pilih latihan untuk mengasah kemampuanmu.", "Play fun games or choose exercises to sharpen your skills.")}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation */}
      <nav className={styles.stickyCategoryNav} aria-label="Game categories">
        {navCategories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              onClick={() => setActiveTab(cat.id)}
              className={`${styles.navPill} ${isActive ? styles.navPillActive : ""}`}
              aria-current={isActive ? "true" : undefined}
            >
              {cat.label}
            </a>
          );
        })}
      </nav>

      {/* Section 1: Sena Kids Games */}
      <section id="sena-games" className={styles.gameSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBox}>
            <Gamepad2 size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>{tx("Game Sena Kids", "Sena Kids Games")}</h2>
            <p className={styles.sectionDesc}>
              {tx("Permainan untuk dimainkan bebas, bersama teman atau sendiri.", "Games to play freely, with friends or by yourself.")}
            </p>
          </div>
        </div>

        <div className={styles.squareGrid}>
          {senaKidsGames.map((game) => (
            <CompactGameCard key={game.href} game={game} language={language} />
          ))}
        </div>
      </section>

      {/* Section 2: Sena Kids Exercises */}
      <section id="sena-exercises" className={styles.gameSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBox}>
            <Brain size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>{tx("Latihan Sena Kids", "Sena Kids Exercises")}</h2>
            <p className={styles.sectionDesc}>
              {tx("Latihan interaktif untuk matematika, bahasa, memori, dan logika.", "Interactive exercises for math, language, memory, and logic.")}
            </p>
          </div>
        </div>

        <div className={styles.squareGrid}>
          {senaKidsExercises.map((game) => (
            <CompactGameCard key={game.href} game={game} language={language} />
          ))}
        </div>
      </section>

      {/* Section 3: Games Lainnya */}
      <section id="games-lainnya" className={styles.gameSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBox}>
            <Globe size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>{tx("Games Lainnya", "Other Games")}</h2>
            <p className={styles.sectionDesc}>
              {tx("Pilihan game edukasi interaktif dari situs lain.", "Curated interactive educational games from external sources.")}
            </p>
          </div>
        </div>

        <div className={styles.squareGrid}>
          {gamesLainnya.map((game) => (
            <CompactGameCard key={game.href} game={game} language={language} />
          ))}
        </div>
      </section>

      {/* Section 4: Toy Theater */}
      <section id="games-toytheater" className={styles.gameSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIconBox}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Toy Theater</h2>
            <p className={styles.sectionDesc}>
              {tx("Koleksi game edukasi mini seru dari Toy Theater.", "Collection of fun mini educational games from Toy Theater.")}
            </p>
          </div>
        </div>

        <div className={styles.squareGrid}>
          {toyTheaterGames.map((game) => (
            <CompactGameCard key={game.href} game={game} language={language} />
          ))}
        </div>
      </section>

      {/* Custom Database Zones (if any created in Admin) */}
      {zones.map((zone) => (
        <section key={zone.title} className={styles.gameSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIconBox}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 className={styles.sectionTitle}>{zone.title}</h2>
              <p className={styles.sectionDesc}>{tx("Game kustom dari koleksi admin.", "Custom games from the collection.")}</p>
            </div>
          </div>

          <div className={styles.squareGrid}>
            {zone.games.map((game) => (
              <CompactGameCard key={game.id || game.href} game={game} language={language} />
            ))}
          </div>
        </section>
      ))}

    </div>
  );
}
