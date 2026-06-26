"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Gamepad2, BookOpen } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const bookActivities = [
  {
    title: { id: "Belajar Membaca", en: "Learn to Read" },
    description: { id: "Membaca rangkaian 3 huruf", en: "Read three-letter words" },
    emoji: "📚",
    href: "/belajar-membaca",
    color: "yellow",
  },
  {
    title: { id: "Sejarah Sepeda", en: "History of Bicycles" },
    description: { id: "Ensiklopedia untuk Anak", en: "Encyclopedia for Kids" },
    emoji: "🚲",
    href: "/sejarah-sepeda",
    color: "green",
  },
  {
    title: { id: "Petualangan Tetes Air", en: "The Water Drop's Adventure" },
    description: { id: "Kisah Siklus Air", en: "The Water Cycle Story" },
    emoji: "💧",
    href: "/petualangan-tetes-air",
    color: "blue",
  },
  {
    title: { id: "Mengenal Hujan", en: "All About Rain" },
    description: { id: "Proses Terjadinya Hujan", en: "How Rain Happens" },
    emoji: "🌧️",
    href: "/mengenal-hujan",
    color: "pink",
  },
];

const letsReadBooks = [
  {
    title: { id: "Gadis Lentera", en: "The Lantern Girl" },
    description: { id: "Kisah Nora dan cahaya keberanian", en: "Nora and the light of courage" },
    emoji: "🏮",
    href: "/buku-cerita",
    color: "orange",
    cover: "https://lh3.googleusercontent.com/HI63_B-B1iII6oL3ubZ-79TjisVyHzHCWX2i09lbBsSrCBpUyl0J5wlo1X27mZoEqgV1hwws76x4W2O0vo1ATfr5dJORK26M6XKDqA=s512",
  },
  {
    title: { id: "Benih Istimewa", en: "The Special Seed" },
    description: { id: "Kesabaran membuahkan hasil", en: "Patience pays off" },
    emoji: "🌱",
    href: "/buku-cerita",
    color: "green",
    cover: "https://lh3.googleusercontent.com/d2j83Xjfl0jtYQbm0zk5jOhvm4W3WsDwhKdldcEuLON8yec0jbKWtEtaNVrVCqGPsVbQI5sYVlB_uoI9TF790L-zWIl-GDB9y5IYQA=s512",
  },
  {
    title: { id: "Kuat Seperti Ibu", en: "Strong Like Mom" },
    description: { id: "Kekuatan yang sesungguhnya", en: "What real strength means" },
    emoji: "💪",
    href: "/buku-cerita",
    color: "pink",
    cover: "https://lh3.googleusercontent.com/Hf4_Wn-ZwyzHQ7_2xf0EjBboCi_DA4jdtEI0gigxwH_Xsb01hBw55nWpLgVRAb2sRfvI13fHaPFmBBlF-cKL3AU58Gx29WHRFwV1IA=s512",
  },
  {
    title: { id: "Ayo Tumbuh!", en: "Grow, Grow, Grow!" },
    description: { id: "Merawat tanaman dengan sabar", en: "Caring for plants patiently" },
    emoji: "🌻",
    href: "/buku-cerita",
    color: "yellow",
    cover: "https://lh3.googleusercontent.com/QJO60yrveQ96fKjIsznYu3z7MSmEBA-NUd5sgNTQsESfVC2W5C3ltPh_Q66mvREKX4I4Uadp9Q0UHBZDXmxX2BPc_0DxlHPcUYIG=s512",
  },
  {
    title: { id: "Kolam Ikan Kakek", en: "Grandpa's Fish Pond" },
    description: { id: "Kasih sayang pada makhluk hidup", en: "Caring for living things" },
    emoji: "🐟",
    href: "/buku-cerita",
    color: "blue",
    cover: "https://lh3.googleusercontent.com/Cb2WZWP0CFcxYnJ6fRHs6qk1Nn8Y_jG2cgjxiQEUpSK8XIW_C3RDdB2IK9KZJ-X0RRdmeyLIF0-wtmneIMspl1Ezq-SiZNdDQ6Albg=s512",
  },
  {
    title: { id: "Vroom! Vroom!", en: "Vroom! Vroom!" },
    description: { id: "Petualangan kendaraan seru", en: "A fun vehicle adventure" },
    emoji: "🚗",
    href: "/buku-cerita",
    color: "purple",
    cover: "https://lh3.googleusercontent.com/bAdLD9j1sn95tJBqnYGGXoyfcDk52dws6gOCPJncmEJRGeODr1ageY8fsVLnX4nlP1zvZ8sHkC8_7pNxMhrvQZpv8uxSTHxJxVt3rg=s512",
  },
  {
    title: { id: "Mencari Ibu", en: "Looking for Mom" },
    description: { id: "Kiki si bebek tersesat", en: "Kiki the lost duckling" },
    emoji: "🦆",
    href: "/buku-cerita",
    color: "teal",
    cover: "https://lh3.googleusercontent.com/dy1n_jSxArehNamUBH71q48xTtqzwHJYODe7NwWwCTlyiWHJzjFHnpJIXSmfD6uhOFcO8V97ekgWBAGtN8WvKnuu-C9eOxgC1oVGpQY=s512",
  },
  {
    title: { id: "Tangan Ajaib", en: "Magic Hands" },
    description: { id: "Cinta di tangan Nenek", en: "Love in Grandma's hands" },
    emoji: "✨",
    href: "/buku-cerita",
    color: "orange",
    cover: "https://lh3.googleusercontent.com/k20sR0dLDGmXEukXboSOL3U98Rt4VhPyrli5rNA4M-qs6sg0abtKT9_X4tqZhwCurhM6Ak1sIugWcbkQ3tYWDfx7pIDxNwCFMXA4Y8M=s512",
  },
];

const gameActivities = [
  { title: { id: "Drum", en: "Drum" }, description: { id: "Ketuk untuk main!", en: "Tap to play!" }, emoji: "🥁", href: "/games/built/drum", color: "purple" },
  { title: { id: "Membuat Jalur", en: "Build the Path" }, description: { id: "Bangun rute yang benar.", en: "Build the right route." }, emoji: "🧭", href: "/games/built/membuat-jalur", color: "blue" },
  { title: { id: "Flashcard Simple", en: "Simple Flashcards" }, description: { id: "Ingat gambar dan kata.", en: "Remember pictures and words." }, emoji: "🃏", href: "/games/built/flashcard-simple", color: "orange" },
  { title: { id: "Piano", en: "Piano" }, description: { id: "Main piano interaktif!", en: "Play the interactive piano!" }, emoji: "🎹", href: "/games/built/piano", color: "purple" },
  { title: { id: "Petualangan Labirin", en: "Maze Adventure" }, description: { id: "Kumpulkan permata!", en: "Collect the gems!" }, emoji: "🧑‍🚀", href: "/games/built/petualangan-labirin", color: "blue" },
];

export default function Home() {
  const { t, language } = useLanguage();
  const L = (o) => (o && typeof o === "object" ? (o[language] ?? o.id) : o);
  const tx = (id, en) => (language === "id" ? id : en);

  return (
    <div className={styles.container}>
      
      {/* Top Support Banner */}
      <motion.div 
        className={styles.supportBanner}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.bannerLeft}>
          <div className={styles.heartIcon}>
            <Heart fill="currentColor" size={24} />
          </div>
          <div>
            <h2 className={styles.bannerTitle}>{t("home.supportTitle")}</h2>
            <p className={styles.bannerSubtitle}>{t("home.supportSubtitle")}</p>
          </div>
        </div>
        <a href="https://saweria.co/senakids" target="_blank" rel="noopener noreferrer" className={styles.bannerButton}>
          {t("home.supportButton")}
        </a>
      </motion.div>

      {/* Books Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.booksSection")}</h2>
          <Link href="/books" className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.cardGrid}>
          {bookActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* Let's Read Asia Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📖 {tx("Buku Cerita", "Story Books")}</h2>
          <Link href="/buku-cerita" className={styles.seeAllBtn}>
            {tx("Lihat Semua", "See All")} <ChevronRight size={16} />
          </Link>
        </div>
        <p className={styles.sectionSubtitle}>{tx("Cerita anak — baca langsung di sini!", "Children's stories — read right here!")}</p>
        <div className={styles.letsReadGrid}>
          {letsReadBooks.map((book, index) => (
            <motion.div
              key={book.title.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={book.href} className={styles.letsReadCard}>
                <div className={styles.letsReadCover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover} alt={L(book.title)} className={styles.coverImage} />
                  <div className={styles.readBadge}>
                    <BookOpen size={12} />
                    {tx("Baca", "Read")}
                  </div>
                </div>
                <div className={styles.letsReadInfo}>
                  <h3 className={styles.letsReadTitle}>{L(book.title)}</h3>
                  <p className={styles.letsReadDesc}>{L(book.description)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.gamesSection")}</h2>
          <Link href="/games" className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.cardGrid}>
          {gameActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* CTA to Games */}
      <motion.div
        className={styles.ctaSection}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Gamepad2 size={40} />
        <h2>{tx("Lihat Semua Permainan", "See All Games")}</h2>
        <p>{tx("Ada banyak game seru yang menanti!", "Lots of fun games are waiting!")}</p>
        <Link href="/games" className={styles.ctaButton}>
          {tx("Jelajahi Permainan →", "Explore Games →")}
        </Link>
      </motion.div>

      {/* Footer Banner */}
      <footer className={styles.footerBanner}>
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
