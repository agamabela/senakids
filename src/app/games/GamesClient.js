"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, Brain, Globe, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Category 1: Sena Kids Games
const senaKidsGames = [
  { title: { id: "Ular Tangga", en: "Snakes & Ladders" }, href: "/games/built/ular-tangga", image: "https://data.cabocil.com/assets/images/others/board-snake-and-ladder-v1.png", emoji: "🪜", color: "teal" },
  { title: { id: "Super Mario Bros", en: "Super Mario Bros" }, href: "/games/built/mario", emoji: "🍄", color: "red" },
  { title: { id: "Harvest Moon 2.0", en: "Harvest Moon 2.0" }, href: "/games/built/harvest-moon", emoji: "🌾", color: "green" },
  { title: { id: "Petualangan Labirin", en: "Maze Adventure" }, href: "/games/built/petualangan-labirin", image: "https://data.cabocil.com/assets/game-thumbnails/maze.png", emoji: "💎", color: "blue" },
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

// Category 4: Toy Theater
const toyTheaterGames = [
  { title: { id: "Basketball", en: "Basketball" }, href: "/games/toytheater/game?gamename=basketball", image: "https://toytheater.com/wp-content/uploads/basketball.gif", color: "orange" },
  { title: { id: "Fruit Fall", en: "Fruit Fall" }, href: "/games/toytheater/game?gamename=fruit-fall", image: "https://toytheater.com/wp-content/uploads/fruit_fall.gif", color: "red" },
  { title: { id: "Balloon Pop", en: "Balloon Pop" }, href: "/games/toytheater/game?gamename=balloon-pop", image: "https://toytheater.com/wp-content/uploads/balloon_pop.gif", color: "pink" },
  { title: { id: "Inch Worm", en: "Inch Worm" }, href: "/games/toytheater/game?gamename=inch-worm", image: "https://toytheater.com/wp-content/uploads/inch_worm-2.gif", color: "green" },
  { title: { id: "Subitizing Seeds", en: "Subitizing Seeds" }, href: "/games/toytheater/game?gamename=subitizing-seeds", image: "https://toytheater.com/wp-content/uploads/subitizing-_seeds.gif", color: "yellow" },
  { title: { id: "Fishing", en: "Fishing" }, href: "/games/toytheater/game?gamename=fishing", image: "https://toytheater.com/wp-content/uploads/fishing2.gif", color: "blue" },
  { title: { id: "Bingo", en: "Bingo" }, href: "/games/toytheater/game?gamename=bingo", image: "https://toytheater.com/wp-content/uploads/bingo.gif", color: "purple" },
  { title: { id: "Bowling", en: "Bowling" }, href: "/games/toytheater/game?gamename=bowling", image: "https://toytheater.com/wp-content/uploads/bowling.gif", color: "red" },
  { title: { id: "Marbles", en: "Marbles" }, href: "/games/toytheater/game?gamename=marbles", image: "https://toytheater.com/wp-content/uploads/marbles.gif", color: "teal" },
  { title: { id: "Cowboy", en: "Cowboy" }, href: "/games/toytheater/game?gamename=cowboy", image: "https://toytheater.com/wp-content/uploads/cowboy2.gif", color: "orange" },
  { title: { id: "Apple Island", en: "Apple Island" }, href: "/games/toytheater/game?gamename=apple-island", image: "https://toytheater.com/wp-content/uploads/apple_island-2.gif", color: "green" },
  { title: { id: "Kayak", en: "Kayak" }, href: "/games/toytheater/game?gamename=kayak", image: "https://toytheater.com/wp-content/uploads/kayak.gif", color: "blue" },
  { title: { id: "Feed Freddy", en: "Feed Freddy" }, href: "/games/toytheater/game?gamename=feed-freddy", image: "https://toytheater.com/wp-content/uploads/feed_freddy.gif", color: "yellow" },
  { title: { id: "Shake and Spill", en: "Shake and Spill" }, href: "/games/toytheater/game?gamename=shake-and-spill", image: "https://toytheater.com/wp-content/uploads/shake_spill.gif", color: "purple" },
  { title: { id: "Addition Mine", en: "Addition Mine" }, href: "/games/toytheater/game?gamename=addition-mine", image: "https://toytheater.com/wp-content/uploads/addition_mine.gif", color: "teal" },
  { title: { id: "Weightlifter", en: "Weightlifter" }, href: "/games/toytheater/game?gamename=weightlifter", image: "https://toytheater.com/wp-content/uploads/weightlifterl.gif", color: "red" },
  { title: { id: "Amazon Addition", en: "Amazon Addition" }, href: "/games/toytheater/game?gamename=amazon-addition", image: "https://toytheater.com/wp-content/uploads/amazon_addition.gif", color: "green" },
  { title: { id: "Popcorn", en: "Popcorn" }, href: "/games/toytheater/game?gamename=popcorn", image: "https://toytheater.com/wp-content/uploads/popcorn.gif", color: "yellow" },
  { title: { id: "Math Flash Cards", en: "Math Flash Cards" }, href: "/games/toytheater/game?gamename=math-flash-cards", image: "https://toytheater.com/wp-content/uploads/math_flash_cards.gif", color: "blue" },
];

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
