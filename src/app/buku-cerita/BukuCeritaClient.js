"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, X, RefreshCw, AlertCircle, ShieldCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { LETS_READ_STORIES } from "@/lib/content-registry";
import styles from "./page.module.css";

export default function BukuCeritaPage() {
  const { t, tx, language } = useLanguage();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const timeoutTimerRef = useRef(null);

  // Synchronize modal reader with browser history & URL
  useEffect(() => {
    const handlePopState = () => {
      if (selectedBook) {
        setSelectedBook(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedBook]);

  // Escape to close
  useEffect(() => {
    if (!selectedBook) return;
    const closeOnEscape = (event) => event.key === "Escape" && closeReader();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedBook]);

  // Loading timeout guard (6s)
  useEffect(() => {
    if (!selectedBook) return;
    setIsLoading(true);
    setLoadTimedOut(false);

    timeoutTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadTimedOut(true);
    }, 6000);

    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [selectedBook, iframeKey]);

  const openReader = (book) => {
    setSelectedBook(book);
    try {
      window.history.pushState(
        { modal: true, slug: book.slug },
        "",
        `/books/stories/${book.slug}`
      );
    } catch {}
  };

  const closeReader = () => {
    setSelectedBook(null);
    try {
      window.history.replaceState({}, "", "/buku-cerita");
    } catch {}
  };

  const handleRetry = () => {
    setIsLoading(true);
    setLoadTimedOut(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn} aria-label={t("common.back")}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className={styles.title}>{t("stories.pageTitle")}</h1>
          <p className={styles.subtitle}>{t("stories.pageSubtitle")}</p>
        </div>
      </div>

      <div className={styles.bookGrid}>
        {LETS_READ_STORIES.map((book, index) => {
          const title = book.title[language] || book.title.id;
          const desc = book.description[language] || book.description.id;

          return (
            <motion.div
              key={book.id}
              className={styles.bookCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <button
                type="button"
                onClick={() => openReader(book)}
                className={styles.cardButton}
                aria-label={`${t("stories.readBook")}: ${title}`}
              >
                <div className={styles.bookCover} style={{ backgroundColor: book.color }}>
                  <Image
                    src={book.cover}
                    alt={title}
                    width={320}
                    height={220}
                    className={styles.coverImg}
                    loading={index < 3 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className={styles.levelBadge}>
                    {t("stories.level", { level: book.readingLevel })}
                  </span>
                </div>
                <div className={styles.bookInfo}>
                  <h2 className={styles.bookTitle}>{title}</h2>
                  <p className={styles.bookAuthor}>Let&apos;s Read Asia (The Asia Foundation)</p>
                  <p className={styles.bookDesc}>{desc}</p>
                  <span className={styles.externalLink}>
                    <BookOpen size={14} />
                    {t("stories.readNow")}
                  </span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className={styles.attribution}>
        <ShieldCheck size={18} color="var(--color-primary)" />
        <p>
          {t("books.attributionText")}{" "}
          <a
            href="https://www.letsreadasia.org"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attrLink}
          >
            {t("books.attributionLink")}
          </a>
          . {t("books.attributionLicense")}
        </p>
      </div>

      {/* Synchronized Modal Reader */}
      <AnimatePresence>
        {selectedBook && (
          <div
            className={styles.readerOverlay}
            role="presentation"
            onMouseDown={(event) => event.target === event.currentTarget && closeReader()}
          >
            <motion.div
              className={styles.readerModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-modal-title"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.readerHeader}>
                <h2 id="reader-modal-title" className={styles.readerTitle}>
                  {selectedBook.title[language] || selectedBook.title.id}
                </h2>
                <div className={styles.readerActions}>
                  <a
                    href={selectedBook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.readerExternal}
                  >
                    <ExternalLink size={16} />
                    <span>{t("stories.openOnLetsRead")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={closeReader}
                    className={styles.closeBtn}
                    aria-label={t("stories.closeReader")}
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className={styles.iframeWrapper}>
                {isLoading && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <p>{t("stories.loadingBook")}</p>
                  </div>
                )}

                {loadTimedOut && (
                  <div className={styles.timeoutBox}>
                    <AlertCircle size={44} color="var(--color-orange)" />
                    <h3>{tx("Pemuatan Membutuhkan Waktu", "Loading Taking a While")}</h3>
                    <p>{t("stories.loadingSlowExplanation")}</p>
                    <div className={styles.timeoutActions}>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className={styles.retryBtn}
                      >
                        <RefreshCw size={14} />
                        {t("stories.retry")}
                      </button>
                      <a
                        href={selectedBook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.openDirectBtn}
                      >
                        <ExternalLink size={14} />
                        {t("stories.openOnLetsRead")}
                      </a>
                    </div>
                  </div>
                )}

                <iframe
                  key={iframeKey}
                  src={selectedBook.url}
                  title={selectedBook.title[language] || selectedBook.title.id}
                  className={styles.iframe}
                  onLoad={() => {
                    setIsLoading(false);
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
