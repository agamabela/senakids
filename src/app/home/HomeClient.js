"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ChevronRight,
  Gamepad2,
  BookOpen,
  Sparkles,
  Tv,
  ExternalLink,
} from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import { LETS_READ_STORIES } from "@/lib/content-registry";
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

const gameActivities = [
  {
    title: { id: "Drum", en: "Drum" },
    description: { id: "Ketuk untuk main!", en: "Tap to play!" },
    emoji: "🥁",
    href: "/games/built/drum",
    color: "purple",
  },
  {
    title: { id: "Membuat Jalur", en: "Build the Path" },
    description: { id: "Bangun rute yang benar.", en: "Build the right route." },
    emoji: "🧭",
    href: "/games/built/membuat-jalur",
    color: "blue",
  },
  {
    title: { id: "Flashcard Simple", en: "Simple Flashcards" },
    description: { id: "Ingat gambar dan kata.", en: "Remember pictures and words." },
    emoji: "🃏",
    href: "/games/built/flashcard-simple",
    color: "orange",
  },
  {
    title: { id: "Piano Interaktif", en: "Interactive Piano" },
    description: { id: "Main nada musik ceria.", en: "Play cheerful music notes." },
    emoji: "🎹",
    href: "/games/built/piano",
    color: "purple",
  },
  {
    title: { id: "Petualangan Labirin", en: "Maze Adventure" },
    description: { id: "Kumpulkan permata!", en: "Collect the gems!" },
    emoji: "🧑‍🚀",
    href: "/games/built/petualangan-labirin",
    color: "blue",
  },
];

export default function Home() {
  const { t, lang } = useLanguage();
  const L = (o) => (o && typeof o === "object" ? (o[lang] ?? o.id) : o);

  // Take only 6 featured stories on homepage for fast loading & compact mobile view
  const featuredStories = LETS_READ_STORIES.slice(0, 6);

  return (
    <div className={styles.container}>
      {/* Hero / Value Proposition Section */}
      <section className={styles.heroSection} aria-label={t("home.heroH1")}>
        <div className={styles.heroPill}>
          <Sparkles size={16} aria-hidden="true" />
          <span>{t("home.valueProposition")}</span>
        </div>
        <h1 className={styles.heroH1}>{t("home.heroH1")}</h1>
        <p className={styles.heroSubtitle}>{t("home.heroSubtitle")}</p>

        <div className={styles.heroActions}>
          <Link href="/books" className={styles.primaryHeroBtn}>
            <BookOpen size={20} aria-hidden="true" />
            <span>{t("home.startReading")}</span>
          </Link>
          <Link href="/games" className={styles.secondaryHeroBtn}>
            <Gamepad2 size={20} aria-hidden="true" />
            <span>{t("home.exploreGames")}</span>
          </Link>
          <Link href="/tv" className={styles.tertiaryHeroBtn}>
            <Tv size={20} aria-hidden="true" />
            <span>{lang === "en" ? "Watch TV" : "Nonton TV"}</span>
          </Link>
        </div>
      </section>

      {/* Support / Saweria Banner */}
      <aside className={styles.supportBanner} aria-label={t("home.supportTitle")}>
        <div className={styles.bannerLeft}>
          <div className={styles.heartIcon}>
            <Heart fill="currentColor" size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className={styles.bannerTitle}>{t("home.supportTitle")}</h2>
            <p className={styles.bannerSubtitle}>{t("home.supportSubtitle")}</p>
          </div>
        </div>
        <a
          href="https://saweria.co/senakids"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bannerButton}
          aria-label={`${t("home.supportButton")} - Saweria (${t("home.supportExternalNotice")})`}
        >
          <span>{t("home.supportButton")}</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </aside>

      {/* Interactive Books Section */}
      <section className={styles.section} aria-labelledby="interactive-books-heading">
        <div className={styles.sectionHeader}>
          <h2 id="interactive-books-heading" className={styles.sectionTitle}>
            {t("home.booksSection")}
          </h2>
          <Link href="/books" className={styles.seeAllBtn}>
            <span>{t("home.seeAll")}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.cardGrid}>
          {bookActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.05 * index}
            />
          ))}
        </div>
      </section>

      {/* Featured Let's Read Stories Section */}
      <section className={styles.section} aria-labelledby="stories-section-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="stories-section-heading" className={styles.sectionTitle}>
              {t("home.storiesSection")}
            </h2>
            <p className={styles.sectionSubtitle}>
              {lang === "en"
                ? "Illustrated storybooks curated from Let's Read Asia. Read directly here!"
                : "Cerita anak bergambar pilihan dari Let's Read Asia, baca langsung di sini!"}
            </p>
          </div>
          <Link href="/books" className={styles.seeAllBtn}>
            <span>{t("home.seeAll")}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.letsReadGrid}>
          {featuredStories.map((story, index) => (
            <Link
              key={story.slug}
              href={`/books/stories/${story.slug}`}
              className={styles.letsReadCard}
            >
              <div className={styles.letsReadCover}>
                <Image
                  src={story.cover}
                  alt={L(story.title)}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={styles.coverImage}
                />
                <div className={styles.readBadge}>
                  <BookOpen size={12} aria-hidden="true" />
                  <span>{lang === "en" ? "Read" : "Baca"}</span>
                </div>
              </div>
              <div className={styles.letsReadInfo}>
                <h3 className={styles.letsReadTitle}>{L(story.title)}</h3>
                <p className={styles.letsReadDesc}>{L(story.description)}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.viewMoreStoriesRow}>
          <Link href="/books" className={styles.viewAllStoriesBtn}>
            <BookOpen size={18} aria-hidden="true" />
            <span>
              {lang === "en"
                ? "Explore All 16 Storybooks & Books"
                : "Lihat Semua 16 Cerita & Ensiklopedia"}
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Built-in Games Section */}
      <section className={styles.section} aria-labelledby="games-section-heading">
        <div className={styles.sectionHeader}>
          <h2 id="games-section-heading" className={styles.sectionTitle}>
            {t("home.gamesSection")}
          </h2>
          <Link href="/games" className={styles.seeAllBtn}>
            <span>{t("home.seeAll")}</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.cardGrid}>
          {gameActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.05 * index}
            />
          ))}
        </div>
      </section>

      {/* CTA to Games */}
      <section className={styles.ctaSection} aria-label={lang === "en" ? "Games Directory" : "Katalog Permainan"}>
        <Gamepad2 size={40} color="var(--color-forest)" aria-hidden="true" />
        <h2>{lang === "en" ? "Discover More Fun Games!" : "Lihat Semua Permainan Seru!"}</h2>
        <p>
          {lang === "en"
            ? "Explore logic puzzles, creative instruments, and educational challenges safe for kids."
            : "Tersedia game logika, alat musik ceria, dan teka-teki edukatif ramah anak."}
        </p>
        <Link href="/games" className={styles.ctaButton}>
          <Gamepad2 size={20} aria-hidden="true" />
          <span>{lang === "en" ? "Explore Games" : "Jelajahi Permainan"}</span>
        </Link>
      </section>
    </div>
  );
}
