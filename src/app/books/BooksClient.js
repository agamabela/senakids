"use client";

import { motion } from "framer-motion";
import { BookOpen, Star, Sparkles, Filter, ChevronRight } from "lucide-react";
import BookFlipCard from "@/components/BookFlipCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const featuredBook = {
  color: "var(--color-yellow)",
  emoji: "🌟"
};

export default function BooksClient({ shelves }) {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      
      {/* Featured Book Hero */}
      <motion.section 
        className={styles.heroSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Star size={16} fill="currentColor" /> {t("books.featuredBadge")}
          </div>
          <h1 className={styles.heroTitle}>{t("books.featuredTitle")}</h1>
          <p className={styles.heroSubtitle}>{t("books.featuredDescription")}</p>
          <button className={styles.readBtn}>
            <BookOpen size={20} /> {t("books.readNow")}
          </button>
        </div>
        <div className={styles.heroVisual} style={{ backgroundColor: featuredBook.color }}>
          <motion.div 
            className={styles.heroEmoji}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            {featuredBook.emoji}
          </motion.div>
        </div>
      </motion.section>

      {/* Category Filters */}
      <section className={styles.filterSection}>
        <button className={styles.filterBtnActive}><Sparkles size={16} /> {t("books.filterAll")}</button>
        <button className={styles.filterBtn}>{t("books.filterAnimals")}</button>
        <button className={styles.filterBtn}>{t("books.filterSpace")}</button>
        <button className={styles.filterBtn}>{t("books.filterFairy")}</button>
        <button className={styles.filterBtnIcon}><Filter size={16} /></button>
      </section>

      {/* Magic Shelves from Database */}
      {shelves.length === 0 && <p style={{textAlign: 'center', marginTop: '40px', color: 'var(--color-muted-foreground)'}}>{t("books.emptyMessage")}</p>}
      {shelves.map((shelf, i) => (
        <section key={shelf.title} className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <h2 className={styles.shelfTitle}>{shelf.title}</h2>
            <button className={styles.seeAllBtn}>
              {t("books.shelfButton")} <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.shelfTrack}>
            {shelf.books.map((book, j) => (
              <div className={styles.bookWrapper} key={book.id}>
                <BookFlipCard {...book} delay={j * 0.1} />
              </div>
            ))}
          </div>
          <div className={styles.shelfWood} />
        </section>
      ))}

    </div>
  );
}
