"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, RefreshCw, AlertCircle, X, BookOpen, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./StoryReader.module.css";

export default function StoryReaderClient({ story }) {
  const router = useRouter();
  const { t, tx, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const timerRef = useRef(null);
  const closeButtonRef = useRef(null);

  const title = story.title[language] || story.title.id;
  const description = story.description[language] || story.description.id;

  // Timeout guard for iframe loading (6 seconds)
  useEffect(() => {
    setIsLoading(true);
    setLoadTimedOut(false);

    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadTimedOut(true);
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [iframeKey]);

  // Handle escape to close & focus management
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleIframeLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(false);
    setLoadTimedOut(false);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setLoadTimedOut(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleClose = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push("/books");
    }
  };

  return (
    <div
      className={styles.readerContainer}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-title"
    >
      {/* Top Controls Bar */}
      <div className={styles.topBar}>
        <div className={styles.navLeft}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.backBtn}
            aria-label={t("stories.closeReader")}
            title={t("stories.closeReader")}
          >
            <ArrowLeft size={20} />
            <span>{tx("Kembali ke Buku", "Back to Books")}</span>
          </button>
        </div>

        <div className={styles.storyMetaHeader}>
          <h1 id="reader-title" className={styles.storyTitle}>
            {title}
          </h1>
          <span className={styles.levelBadge}>
            {t("stories.level", { level: story.readingLevel })}
          </span>
        </div>

        <div className={styles.navRight}>
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLinkBtn}
            title={t("stories.openOnLetsRead")}
          >
            <ExternalLink size={16} />
            <span>{t("stories.openOnLetsRead")}</span>
          </a>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            className={styles.closeBtn}
            aria-label={t("stories.closeReader")}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Reader Stage & Loading States */}
      <div className={styles.stage}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>{t("stories.loadingBook")}</p>
          </div>
        )}

        {loadTimedOut && (
          <div className={styles.timeoutFallback}>
            <AlertCircle size={44} className={styles.timeoutIcon} />
            <h2>{tx("Pemuatan Membutuhkan Waktu Lebih Lama", "Loading Taking Longer Than Usual")}</h2>
            <p>{t("stories.loadingSlowExplanation")}</p>
            <div className={styles.fallbackActions}>
              <button
                type="button"
                onClick={handleRetry}
                className={styles.retryBtn}
              >
                <RefreshCw size={16} />
                <span>{t("stories.retry")}</span>
              </button>
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openDirectBtn}
              >
                <ExternalLink size={16} />
                <span>{t("stories.openOnLetsRead")}</span>
              </a>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={story.url}
          title={title}
          className={styles.iframe}
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
        />
      </div>

      {/* Attribution Footer */}
      <div className={styles.readerFooter}>
        <ShieldCheck size={16} color="var(--color-primary)" />
        <p>
          {t("books.attributionText")}{" "}
          <a
            href="https://www.letsreadasia.org"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.authorLink}
          >
            {t("books.attributionLink")}
          </a>
          . {t("books.attributionLicense")}
        </p>
      </div>
    </div>
  );
}
