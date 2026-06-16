"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Play, Calculator, Music, PenTool } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import styles from "./page.module.css";

const featuredChannels = [
  { name: "Sena Official", emoji: "🌿", color: "var(--color-green)" },
  { name: "Belajar Ceria", emoji: "🎨", color: "var(--color-yellow)" },
  { name: "Petualangan", emoji: "🚀", color: "var(--color-blue)" },
  { name: "Dunia Hewan", emoji: "🦁", color: "var(--color-orange)" },
  { name: "Sains Seru", emoji: "🔬", color: "var(--color-purple)" },
];

const bookActivities = [
  {
    title: "Belajar Membaca",
    description: "Membaca rangkaian 3 huruf",
    emoji: "📚",
    href: "/books",
    color: "yellow",
  },
  {
    title: "Sejarah Sepeda",
    description: "Ensiklopedia untuk Anak",
    emoji: "🚲",
    href: "/books",
    color: "green",
  },
  {
    title: "Petualangan Tetes Air",
    description: "Kisah Siklus Air",
    emoji: "💧",
    href: "/books",
    color: "blue",
  },
  {
    title: "Mengenal Hujan",
    description: "Proses Terjadinya Hujan",
    emoji: "🌧️",
    href: "/books",
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
            <h2 className={styles.bannerTitle}>Dukung Sena Kids</h2>
            <p className={styles.bannerSubtitle}>Bantu kami terus menghadirkan konten belajar ramah anak untuk keluarga Indonesia.</p>
          </div>
        </div>
        <button className={styles.bannerButton}>Mulai</button>
      </motion.div>

      {/* Featured Channels Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Channel Pilihan</h2>
          <button className={styles.seeAllBtn}>Lihat Semua <ChevronRight size={16} /></button>
        </div>
        <div className={styles.channelsList}>
          {featuredChannels.map((channel, i) => (
            <motion.div 
              key={channel.name} 
              className={styles.channelCircle}
              style={{ backgroundColor: channel.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              whileHover={{ scale: 1.1 }}
            >
              <span className={styles.channelEmoji}>{channel.emoji}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Books Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Jelajahi Buku</h2>
          <button className={styles.seeAllBtn}>Lihat Semua <ChevronRight size={16} /></button>
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
          <h2 className={styles.sectionTitle}>Jelajahi Permainan</h2>
          <button className={styles.seeAllBtn}>Lihat Semua <ChevronRight size={16} /></button>
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
        <p>Dibuat dengan penuh perhatian untuk anak-anak Indonesia. Sena Kids Web</p>
      </footer>
    </div>
  );
}
