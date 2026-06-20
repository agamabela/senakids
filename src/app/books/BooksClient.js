"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Sparkles, ChevronRight } from "lucide-react";
import BookFlipCard from "@/components/BookFlipCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

export default function BooksClient({ shelves }) {
  const { t } = useLanguage();
  const [activeShelf, setActiveShelf] = useState("__all__");

  // Build filter chips dynamically from the real shelf names.
  const filters = useMemo(
    () => [{ key: "__all__", label: t("books.filterAll") }, ...shelves.map((s) => ({ key: s.title, label: s.title }))],
    [shelves, t]
  );

  const visibleShelves =
    activeShelf === "__all__" ? shelves : shelves.filter((s) => s.title === activeShelf);

  const totalBooks = shelves.reduce((sum, s) => sum + s.books.length, 0);

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
          <a href="#shelves" className={styles.readBtn}>
            <BookOpen size={20} /> {t("books.readNow")}
          </a>
        </div>
        <div className={styles.heroVisual}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            {/* Stacked books illustration */}
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tumpukan buku">
              <ellipse cx="100" cy="176" rx="68" ry="12" fill="#000" opacity="0.08" />
              {/* bottom book */}
              <rect x="40" y="132" width="120" height="26" rx="6" fill="#C87A65" />
              <rect x="40" y="132" width="120" height="8" rx="4" fill="#fff" opacity="0.25" />
              <rect x="48" y="140" width="6" height="18" fill="#fff" opacity="0.4" />
              {/* middle book */}
              <rect x="50" y="106" width="104" height="26" rx="6" fill="#7A8B99" />
              <rect x="50" y="106" width="104" height="8" rx="4" fill="#fff" opacity="0.25" />
              <rect x="58" y="114" width="6" height="18" fill="#fff" opacity="0.4" />
              {/* top book */}
              <rect x="60" y="80" width="86" height="26" rx="6" fill="#D9A05B" />
              <rect x="60" y="80" width="86" height="8" rx="4" fill="#fff" opacity="0.3" />
              <rect x="68" y="88" width="6" height="18" fill="#fff" opacity="0.45" />
              {/* open book on top */}
              <path d="M64 80 C78 70 96 70 100 76 C104 70 122 70 136 80 L136 82 C122 74 104 74 100 82 C96 74 78 74 64 82 Z" fill="#8BA888" />
              <path d="M100 76 L100 82" stroke="#5F7A5C" strokeWidth="2" />
              {/* sparkle */}
              <path d="M150 56 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#D9A05B" />
              <circle cx="54" cy="64" r="4" fill="#C5948E" />
            </svg>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Filters — generated from real shelves */}
      {filters.length > 1 && (
        <section className={styles.filterSection}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={activeShelf === f.key ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setActiveShelf(f.key)}
            >
              {f.key === "__all__" && <Sparkles size={16} />} {f.label}
            </button>
          ))}
        </section>
      )}

      {/* Magic Shelves from Database */}
      <div id="shelves" />
      {shelves.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "40px", color: "var(--color-muted-foreground)" }}>
          {t("books.emptyMessage")}
        </p>
      )}
      {visibleShelves.map((shelf) => (
        <section key={shelf.title} className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <h2 className={styles.shelfTitle}>{shelf.title}</h2>
            <span className={styles.shelfCount}>{shelf.books.length} buku</span>
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
