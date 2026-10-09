"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Star,
  Search,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Compass,
  FileText,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import ActivityCard from "@/components/ActivityCard";
import ContinueShelf from "@/components/ContinueShelf";
import { addHistory } from "@/lib/activity-history";
import styles from "./page.module.css";

function BookCover({ title, src, color, isPriority = false, badge }) {
  const [error, setError] = useState(false);

  return (
    <div className={styles.coverBox} style={{ backgroundColor: color || "#faf8f5" }}>
      {error || !src ? (
        <div className={styles.coverFallback}>
          <BookOpen size={36} color="var(--color-primary)" />
          <span className={styles.coverFallbackTitle}>{title}</span>
        </div>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={title}
          className={styles.coverImage}
          loading={isPriority ? "eager" : "lazy"}
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      )}
      {badge && <span className={styles.cardLevelBadge}>{badge}</span>}
    </div>
  );
}

export default function BooksClient({
  stories = [],
  interactiveBooks = [],
  dbBooks = [],
  portals = [],
  liveLetsReadBooks = [],
  workbooks = [],
}) {
  const { t, tx, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("__all__");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalStory, setActiveModalStory] = useState(null);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [liveBooks, setLiveBooks] = useState(liveLetsReadBooks);
  const [visibleLiveCount, setVisibleLiveCount] = useState(24);
  const timeoutTimerRef = useRef(null);

  // Background fetch to ensure latest books from Let's Read Asia API
  useEffect(() => {
    let isMounted = true;
    async function updateBooks() {
      try {
        const res = await fetch("/api/books/letsread");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.books) && isMounted) {
            setLiveBooks(data.books);
          }
        }
      } catch (err) {
        // Fallback already preloaded
      }
    }
    updateBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize modal reader with browser history & URL
  useEffect(() => {
    const handlePopState = () => {
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
    const title = typeof story.title === "object" ? story.title[language] || story.title.id : story.title;
    addHistory({
      id: `book-${story.slug || story.id}`,
      type: "book",
      title,
      href: story.slug ? `/books/stories/${story.slug}` : story.readUrl || story.url,
      image: story.cover || "",
      label: "Buku Cerita",
    });
    try {
      if (story.slug) {
        window.history.pushState(
          { modal: true, slug: story.slug },
          "",
          `/books/stories/${story.slug}`
        );
      }
    } catch {}
  };

  const closeStoryModal = () => {
    setActiveModalStory(null);
    try {
      window.history.replaceState({}, "", "/books");
    } catch {}
  };

  // 1. Portals Filtering
  const filteredPortals = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "portals") return [];
    if (!searchQuery.trim()) return portals;
    const q = searchQuery.toLowerCase();
    return portals.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [portals, activeCategory, searchQuery]);

  // 2. Interactive Books Filtering
  const filteredInteractive = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "interactive") return [];
    return interactiveBooks.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (b.title[language] || b.title.id).toLowerCase();
      const desc = (b.description[language] || b.description.id).toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [interactiveBooks, activeCategory, searchQuery, language]);

  // 3. Curated Local Stories Filtering
  const filteredStories = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "stories") return [];
    return stories.filter((s) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (s.title[language] || s.title.id).toLowerCase();
      const desc = (s.description[language] || s.description.id).toLowerCase();
      const topics = (s.topics || []).map((tp) => tp.toLowerCase()).join(" ");
      return title.includes(q) || desc.includes(q) || topics.includes(q);
    });
  }, [stories, activeCategory, searchQuery, language]);

  // 4. Live Let's Read Asia Books Filtering
  const filteredLiveBooks = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "stories") return [];
    return liveBooks.filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (b.title || "").toLowerCase();
      const desc = (b.description || "").toLowerCase();
      const tags = (b.tags || []).join(" ").toLowerCase();
      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [liveBooks, activeCategory, searchQuery]);

  // 5. Workbooks Filtering
  const filteredWorkbooks = useMemo(() => {
    if (activeCategory !== "__all__" && activeCategory !== "workbooks") return [];
    return workbooks.filter((w) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const title = (w.title || "").toLowerCase();
      const desc = (w.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [workbooks, activeCategory, searchQuery]);

  // 6. Community DB Books
  const filteredCommunityBooks = useMemo(() => {
    if (activeCategory !== "__all__" || !searchQuery.trim())
      return activeCategory === "__all__" ? dbBooks : [];
    const q = searchQuery.toLowerCase();
    return dbBooks.filter((book) =>
      `${book.title} ${book.description} ${book.shelf || ""}`.toLowerCase().includes(q)
    );
  }, [dbBooks, activeCategory, searchQuery]);

  const totalResults =
    filteredPortals.length +
    filteredInteractive.length +
    filteredStories.length +
    filteredLiveBooks.length +
    filteredWorkbooks.length +
    filteredCommunityBooks.length;

  const modalTitle = activeModalStory
    ? typeof activeModalStory.title === "string"
      ? activeModalStory.title
      : activeModalStory.title[language] || activeModalStory.title.id
    : "";

  const modalUrl = activeModalStory
    ? activeModalStory.url || activeModalStory.readUrl
    : "";

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
            {tx("Cerita Let's Read", "Let's Read Stories")}
          </button>
          <button
            type="button"
            className={activeCategory === "portals" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("portals")}
            aria-pressed={activeCategory === "portals"}
          >
            <Compass size={16} /> {tx("Portal Edukasi", "Official Portals")}
          </button>
          <button
            type="button"
            className={activeCategory === "interactive" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("interactive")}
            aria-pressed={activeCategory === "interactive"}
          >
            {t("books.filterInteractive")}
          </button>
          <button
            type="button"
            className={activeCategory === "workbooks" ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setActiveCategory("workbooks")}
            aria-pressed={activeCategory === "workbooks"}
          >
            <FileText size={16} /> {tx("Worksheet", "Worksheets")}
          </button>
        </section>
      </div>

      {/* Empty State */}
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

      {/* Continue Reading History Shelf */}
      <ContinueShelf type="book" seeAllHref="#books-catalog" />

      <div id="books-catalog" />

      {/* 1. Educational Portals Section */}
      {filteredPortals.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>
                {tx("Portal Membaca Resmi & Perpustakaan", "Official Reading Portals")}
              </h2>
              <p className={styles.shelfSubtitle}>
                {tx(
                  "Akses ribuan buku kurikulum resmi Kemendikdasmen dan perpustakaan internasional Asia.",
                  "Access curated books from the Ministry of Education and international digital libraries."
                )}
              </p>
            </div>
            <span className={styles.shelfCount}>{filteredPortals.length}</span>
          </div>
          <div className={styles.portalGrid}>
            {filteredPortals.map((p) => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.portalCard}
              >
                <div className={styles.portalThumbBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.title}
                    className={styles.portalThumb}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className={styles.liveTagBadge}>Portal Resmi</span>
                </div>
                <div className={styles.portalBody}>
                  <h3 className={styles.portalTitle}>{p.title}</h3>
                  <div className={styles.portalSubtitle}>{p.subtitle}</div>
                  <p className={styles.portalDesc}>{p.description}</p>
                  <div className={styles.portalActionRow}>
                    <span>{tx("Buka Perpustakaan", "Open Library")}</span>
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 2. Interactive Learning Section */}
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

      {/* 3. Curated Let's Read Local Stories */}
      {filteredStories.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>{t("books.storiesSectionTitle")}</h2>
              <p className={styles.shelfSubtitle}>
                {tx(
                  "Baca langsung gratis dengan ilustrasi menarik dan pesan moral.",
                  "Read free illustrated stories with heartwarming moral lessons."
                )}
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
        </section>
      )}

      {/* 4. Dynamic Live Let's Read Asia Catalog */}
      {filteredLiveBooks.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>
                {tx("Perpustakaan Lengkap Let's Read Asia", "Full Let's Read Asia Library")}
              </h2>
              <p className={styles.shelfSubtitle}>
                {tx(
                  "Koleksi ratusan buku cerita bahasa Indonesia yang otomatis diperbarui dari The Asia Foundation.",
                  "Hundreds of Indonesian storybooks automatically updated from The Asia Foundation."
                )}
              </p>
            </div>
            <span className={styles.shelfCount}>{filteredLiveBooks.length}</span>
          </div>

          <div className={styles.storiesGrid}>
            {filteredLiveBooks.slice(0, visibleLiveCount).map((b) => (
              <div key={b.id} className={styles.storyCardWrapper}>
                <a
                  href={b.readUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openStoryModal({
                        id: b.id,
                        title: b.title,
                        readUrl: b.readUrl,
                        url: b.readUrl,
                        cover: b.cover,
                      });
                    }
                  }}
                  className={styles.storyCard}
                  aria-label={`${t("stories.readBook")}: ${b.title}`}
                >
                  <BookCover
                    title={b.title}
                    src={b.cover}
                    color="#faf8f5"
                    badge={b.tags?.[0] ? `#${b.tags[0]}` : "Let's Read"}
                  />

                  <div className={styles.storyInfo}>
                    <h3 className={styles.storyCardTitle}>{b.title}</h3>
                    <p className={styles.storyCardDesc}>
                      {b.description || tx("Buku cerita bergambar anak dari Let's Read Asia.", "Children's picture book from Let's Read Asia.")}
                    </p>
                    <div className={styles.cardActionRow}>
                      <span className={styles.readAction}>
                        <BookOpen size={14} />
                        {t("stories.readNow")}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {visibleLiveCount < filteredLiveBooks.length && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setVisibleLiveCount((prev) => prev + 24)}
                className={styles.resetFilterBtn}
              >
                {tx(
                  `Muat Lebih Banyak (${filteredLiveBooks.length - visibleLiveCount} Tersisa)`,
                  `Load More (${filteredLiveBooks.length - visibleLiveCount} Remaining)`
                )}
              </button>
            </div>
          )}

          {/* Attribution Box */}
          <div className={styles.attributionBox} style={{ marginTop: "24px" }}>
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

      {/* 5. Sena Kids Workbooks / Lembar Aktivitas Section */}
      {filteredWorkbooks.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>{tx("Worksheet & Lembar Aktivitas", "Worksheets & Activity Books")}</h2>
              <p className={styles.shelfSubtitle}>
                {tx("Lembar latihan belajar angka, membaca, dan motorik anak.", "Practice sheets for numbers, reading, and motor skills.")}
              </p>
            </div>
            <span className={styles.shelfCount}>{filteredWorkbooks.length}</span>
          </div>

          <div className={styles.storiesGrid}>
            {filteredWorkbooks.map((w) => (
              <div key={w.id} className={styles.storyCardWrapper}>
                <Link
                  href={w.readUrl}
                  className={styles.storyCard}
                  aria-label={`Buka: ${w.title}`}
                  onClick={() => {
                    addHistory({
                      id: `workbook-${w.id}`,
                      type: "book",
                      title: w.title,
                      href: w.readUrl,
                      image: w.cover || "",
                      label: "Worksheet",
                    });
                  }}
                >
                  <BookCover
                    title={w.title}
                    src={w.cover}
                    color="#f1f5f9"
                    badge="Worksheet"
                  />
                  <div className={styles.storyInfo}>
                    <h3 className={styles.storyCardTitle}>{w.title}</h3>
                    <p className={styles.storyCardDesc}>{w.description}</p>
                    <div className={styles.cardActionRow}>
                      <span className={styles.readAction}>
                        <FileText size={14} />
                        {tx("Buka Aktivitas", "Open Activity")}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Community / Database Books */}
      {filteredCommunityBooks.length > 0 && (
        <section className={styles.shelfSection}>
          <div className={styles.shelfHeader}>
            <div>
              <h2 className={styles.shelfTitle}>{tx("Pilihan Baru di Rak", "New on the Shelf")}</h2>
              <p className={styles.shelfSubtitle}>
                {tx("Buku tambahan yang dipilih oleh pengelola Sena Kids.", "Additional books selected by the Sena Kids team.")}
              </p>
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
                  {modalTitle}
                </h2>
                <div className={styles.modalActions}>
                  <a
                    href={modalUrl}
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
                        href={modalUrl}
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
                  src={modalUrl}
                  title={modalTitle}
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
