"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Play, Calculator, Music, PenTool } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const bookActivities = [
  {
    title: "Belajar Membaca",
    description: "Membaca rangkaian 3 huruf",
    emoji: "📚",
    href: "/belajar-membaca",
    color: "yellow",
  },
  {
    title: "Sejarah Sepeda",
    description: "Ensiklopedia untuk Anak",
    emoji: "🚲",
    href: "/sejarah-sepeda",
    color: "green",
  },
  {
    title: "Petualangan Tetes Air",
    description: "Kisah Siklus Air",
    emoji: "💧",
    href: "/petualangan-tetes-air",
    color: "blue",
  },
  {
    title: "Mengenal Hujan",
    description: "Proses Terjadinya Hujan",
    emoji: "🌧️",
    href: "/mengenal-hujan",
    color: "pink",
  },
];

const gameActivities = [
  {
    title: "Drum",
    description: "Tap untuk main!",
    iconName: "Music",
    href: "/games",
    color: "purple",
  },
  {
    title: "Membandingkan",
    description: "Tap untuk main!",
    iconName: "Calculator",
    href: "/games",
    color: "yellow",
  },
  {
    title: "Pengurangan",
    description: "Tap untuk main!",
    emoji: "➖",
    href: "/games",
    color: "blue",
  },
  {
    title: "Membuat Jalur",
    description: "Tap untuk main!",
    iconName: "Route",
    href: "/games",
    color: "green",
  },
  {
    title: "Timbang Angka",
    description: "Tap untuk main!",
    emoji: "⚖️",
    href: "/games",
    color: "orange",
  },
];

export default function Home() {
  const { t } = useLanguage();

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
        <button className={styles.bannerButton}>{t("home.supportButton")}</button>
      </motion.div>

      {/* Books Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.booksSection")}</h2>
          <button className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></button>
        </div>
        <div className={styles.cardGrid}>
          {bookActivities.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              {...activity}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.gamesSection")}</h2>
          <button className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></button>
        </div>
        <div className={styles.cardGrid}>
          {gameActivities.map((activity, index) => (
            <ActivityCard
              key={activity.title}
              {...activity}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* Footer Banner */}
      <footer className={styles.footerBanner}>
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
