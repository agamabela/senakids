"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Star,
  Search,
  ChevronRight,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import ActivityCard from "@/components/ActivityCard";
import styles from "./page.module.css";

export default function BooksClient({
  stories = [],
  interactiveBooks = [],
  dbBooks = [],
}) {
  const { t, tx, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("__all__");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalStory, setActiveModalStory] = useState(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const timeoutTimerRef = useRef(null);

  // Synchronize modal reader with browser history & URL
  useEffect(() => {
    const handlePopState = (event) => {
      if (activeModalStory) {
        setActiveModalStory(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [activeModalStory]);

  // Loading timeout guard for modal reader (6s)
  useEffect(() => {
    if (!activeModalStory) return;

    setIsIframeLoading(true);
    setLoadTimedOut(false);

    timeoutTimerRef.current = setTimeout(() => {
      setIsIframeLoading(false);
      setLoadTimedOut(true);
    }, 6000);

    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [activeModalStory]);

  const openStoryModal = (story) => {
    setActiveModalStory(story);
    // Push state so back button closes modal
    try {
      window.history.pushState(
        { modal: true, slug: story.slug },
        "",
        `/books/stories/${story.slug}`
      );
    } catch {}
  };

  const closeStoryModal = () => {
    setActiveModalStory(null);
    try {
      window.history.replaceState({}, "", "/books");
    } catch {}
  };

  // Filter items based on activeCategory and searchQuery
  const filteredStories = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "stories") {
      return [];
    }
    return stories.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (s.title[language] || s.title.id).toLowerCase();
      const desc = (s.description[language] || s.description.id).toLowerCase();
      const topics = (s.topics || []).map((tp) => tp.toLowerCase()).join(" ");
      return title.includes(q) || desc.includes(q) || topics.includes(q);
    });
  }, [stories, activeCategory, searchQuery, language]);

  const filteredInteractive = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "interactive") {
      return [];
    }
    return interactiveBooks.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (b.title[language] || b.title.id).toLowerCase();
      const desc = (b.description[language] || b.description.id).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [interactiveBooks, activeCategory, searchQuery, language]);

  const totalResults = filteredStories.length + filteredInteractive.length;
  const filteredCommunityBooks = useMemo(() => {
    if (activeCategory !== "__all__" || !searchQuery.trim()) return activeCategory === "__all__" ? dbBooks : [];
    const q = searchQuery.toLowerCase();
    return dbBooks.filter((book) => `${book.title} ${book.description} ${book.shelf || ""}`.toLowerCase().includes(q));
  }, [dbBooks, activeCategory, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Featured Book Hero */}
      <motion.section
        className={styles.heroSection}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Star size={16} fill="currentColor" /> {t("books.featuredBadge")}
          </div>
          <h1 className={styles.heroTitle}>{t("books.featuredTitle")}</h1>
          <p className={styles.heroSubtitle}>{t("books.featuredDescription")}</p>
          <a href="#katalog" className={styles.readBtn}>
            <BookOpen size={20} /> {t("books.readNow")}
          </a>
        </div>
        <div className={styles.heroVisual}>
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Tumpukan buku cerita ramah anak"
          >
            <ellipse cx="100" cy="176" rx="68" ry="12" fill="#000" opacity="0.08" />
            <rect x="40" y="132" width="120" height="26" rx="6" fill="#C87A65" />
            <rect x="40" y="132" width="120" height="8" rx="4" fill="#fff" opacity="0.25" />
            <rect x="50" y="106" width="104" height="26" rx="6" fill="#7A8B99" />
            <rect x="50" y="106" width="104" height="8" rx="4" fill="#fff" opacity="0.25" />
            <rect x="60" y="80" width="86" height="26" rx="6" fill="#D9A05B" />
            <path
              d="M64 80 C78 70 96 70 100 76 C104 70 122 70 136 80 L136 82 C122 74 104 74 100 82 C96 74 78 74 64 82 Z"
              fill="#8BA888"
            />
            <circle cx="54" cy="64" r="4" fill="#C5948E" />
          </svg>
        </div>
      </motion.section>

      {/* Search & Filter Bar */}
      <div id="katalog" className={styles.controlHeader}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("books.searchPlaceholder")}
            className={styles.searchInput}
            aria-label={t("books.searchPlaceholder")}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={styles.clearSearchBtn}
              aria-label={t("common.clear")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <section className={styles.filterSection} aria-label={tx("Kategori Buku", "Book Categories")}>
          <button
            type="button"
            className={activeCategory === "__all__" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("__all__")}
            aria-pressed={activeCategory === "__all__"}
          >
            <BookOpen size={16} /> {t("books.filterAll")}
          </button>
          <button
            type="button"
            className={activeCategory === "stories" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("stories")}
            aria-pressed={activeCategory === "stories"}
          >
            {t("books.filterStories")}
          </button>
          <button
            type="button"
            className={activeCategory === "interactive" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("interactive")}
            aria-pressed={activeCategory === "interactive"}
          >
            {t("books.filterInteractive")}
          </button>
        </section>
      </div>

      {/* Child-Friendly Empty State */}
      {totalResults === 0 && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyEmoji}>🌟</div>
          <h2 className={styles.emptyTitle}>{t("books.emptySearch")}</h2>
          <p className={styles.emptyText}>{t("books.emptyMessage")}</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("__all__");
              setSearchQuery("");
            }}
            className={styles.resetFilterBtn}
          >
            {tx("Tampilkan Semua Buku", "Show All Books")}
          </button>
        </div>
      )}

      {/* Interactive Learning Section */}
      {filteredInteractive.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <h2 className={styles.shelfTitle}>{t("books.interactiveSectionTitle")}</h2>
            <span className={styles.shelfCount}>
              {t("books.shelfCount", { count: filteredInteractive.length })}
            </span>
          </div>
          <div className={styles.interactiveGrid}>
            {filteredInteractive.map((book, idx) => (
              <ActivityCard
                key={book.id}
                title={book.title[language] || book.title.id}
                description={book.description[language] || book.description.id}
                emoji={book.emoji}
                href={book.href}
                color={book.color}
                delay={idx * 0.05}
              />
            ))}
          </div>
        </section>
      )}

      {filteredCommunityBooks.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>{tx("Pilihan Baru di Rak", "New on the Shelf")}</h2>
              <p className={styles.shelfSubtitle}>{tx("Buku tambahan yang dipilih oleh pengelola Sena Kids.", "Additional books selected by the Sena Kids team.")}</p>
            </div>
            <span className={styles.shelfCount}>{filteredCommunityBooks.length}</span>
          </div>
          <div className={styles.interactiveGrid}>
            {filteredCommunityBooks.map((book) => (
              <ActivityCard
                key={book.id}
                title={book.title}
                description={book.description}
                emoji={book.emoji || "📖"}
                href={book.pdfUrl || book.href || "/books"}
                color={book.color || "green"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Let's Read Asia Storybooks Section */}
      {filteredStories.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>{t("books.storiesSectionTitle")}</h2>
              <p className={styles.shelfSubtitle}>
                {tx("Baca langsung gratis dengan ilustrasi menarik dan pesan moral.", "Read free illustrated stories with heartwarming moral lessons.")}
              </p>
            </div>
            <span className={styles.shelfCount}>
              {t("books.shelfCount", { count: filteredStories.length })}
            </span>
          </div>

          <div className={styles.storiesGrid}>
            {filteredStories.map((story, index) => {
              const title = story.title[language] || story.title.id;
              const desc = story.description[language] || story.description.id;

              return (
                <div key={story.id} className={styles.storyCardWrapper}>
                  <Link
                    href={`/books/stories/${story.slug}`}
                    onClick={(e) => {
                      // Open smooth modal on desktop, synchronizing URL
                      if (window.innerWidth > 640) {
                        e.preventDefault();
                        openStoryModal(story);
                      }
                    }}
                    className={styles.storyCard}
                    aria-label={`${t("stories.readBook")}: ${title}`}
                  >
                    <div className={styles.coverBox} style={{ backgroundColor: story.color }}>
                      <Image
                        src={story.cover}
                        alt={title}
                        width={300}
                        height={220}
                        className={styles.coverImage}
                        loading={index < 2 ? "eager" : "lazy"}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span className={styles.cardLevelBadge}>
                        {t("stories.level", { level: story.readingLevel })}
                      </span>
                    </div>

                    <div className={styles.storyInfo}>
                      <h3 className={styles.storyCardTitle}>{title}</h3>
                      <p className={styles.storyCardDesc}>{desc}</p>
                      <div className={styles.cardActionRow}>
                        <span className={styles.readAction}>
                          <BookOpen size={14} />
                          {t("stories.readNow")}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Attribution Box */}
          <div className={styles.attributionBox}>
            <ShieldCheck size={18} color="var(--color-primary)" />
            <p>
              {t("books.attributionText")}{" "}
              <a
                href="https://www.letsreadasia.org"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attributionLink}
              >
                {t("books.attributionLink")}
              </a>
              . {t("books.attributionLicense")}
            </p>
          </div>
        </section>
      )}

      {/* Modal Reader synchronized with URL & Back Button */}
      <AnimatePresence>
        {activeModalStory && (
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={(e) => e.target === e.currentTarget && closeStoryModal()}
          >
            <motion.div
              className={styles.modalDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-story-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.modalHeader}>
                <h2 id="modal-story-title" className={styles.modalTitle}>
                  {activeModalStory.title[language] || activeModalStory.title.id}
                </h2>
                <div className={styles.modalActions}>
                  <a
                    href={activeModalStory.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalExternalLink}
                    title={t("stories.openOnLetsRead")}
                  >
                    <ExternalLink size={16} />
                    <span>{t("stories.openOnLetsRead")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={closeStoryModal}
                    className={styles.modalCloseBtn}
                    aria-label={t("stories.closeReader")}
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className={styles.modalIframeWrapper}>
                {isIframeLoading && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <p>{t("stories.loadingBook")}</p>
                  </div>
                )}

                {loadTimedOut && (
                  <div className={styles.modalTimeoutFallback}>
                    <AlertCircle size={40} color="var(--color-orange)" />
                    <h3>{tx("Pemuatan Membutuhkan Waktu", "Loading Taking a While")}</h3>
                    <p>{t("stories.loadingSlowExplanation")}</p>
                    <div className={styles.modalFallbackActions}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsIframeLoading(true);
                          setLoadTimedOut(false);
                        }}
                        className={styles.modalRetryBtn}
                      >
                        <RefreshCw size={14} />
                        {t("stories.retry")}
                      </button>
                      <a
                        href={activeModalStory.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.modalDirectBtn}
                      >
                        <ExternalLink size={14} />
                        {t("stories.openOnLetsRead")}
                      </a>
                    </div>
                  </div>
                )}

                <iframe
                  src={activeModalStory.url}
                  title={activeModalStory.title[language] || activeModalStory.title.id}
                  className={styles.modalIframe}
                  onLoad={() => {
                    setIsIframeLoading(false);
                    setLoadTimedOut(false);
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
