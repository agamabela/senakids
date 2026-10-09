"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, X, Gamepad2, BookOpen, Tv, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityHistory } from "@/lib/activity-history";
import styles from "./ContinueShelf.module.css";

const typeIcons = {
  game: Gamepad2,
  book: BookOpen,
  tv: Tv,
  lesson: Sparkles,
};

function CardThumbnail({ item }) {
  const [hasError, setHasError] = useState(false);
  const Icon = typeIcons[item.type] || Gamepad2;

  if (item.image && !hasError) {
    return (
      <div className={styles.thumbBox}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          className={styles.thumbImg}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.thumbBox}
      style={{
        backgroundColor: item.color
          ? `var(--color-${item.color}-light, var(--color-surface-muted))`
          : "var(--color-surface-muted)",
      }}
    >
      <span className={styles.thumbFallback}>
        {item.emoji || <Icon size={24} color="var(--color-primary)" />}
      </span>
    </div>
  );
}

export default function ContinueShelf({
  type = "all",
  title,
  seeAllHref,
  maxItems = 10,
}) {
  const { tx, language } = useLanguage();
  const { history, isLoaded, removeItem } = useActivityHistory(type);

  if (!isLoaded || history.length === 0) {
    return null;
  }

  const items = history.slice(0, maxItems);

  // Dynamic titles based on category
  const defaultTitle =
    type === "game"
      ? tx("Lanjutkan Permainan", "Continue Playing")
      : type === "book"
      ? tx("Lanjutkan Membaca", "Continue Reading")
      : type === "tv"
      ? tx("Lanjutkan Menonton", "Continue Watching")
      : tx("Lanjutkan Aktivitas", "Continue Activities");

  const shelfTitle = title || defaultTitle;
  const continueKicker = tx("Lanjut", "Continue");

  return (
    <section className={styles.shelfContainer} aria-label={shelfTitle}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h2 className={styles.shelfTitle}>{shelfTitle}</h2>
        </div>

        {seeAllHref && (
          <div className={styles.actionsArea}>
            <Link href={seeAllHref} className={styles.seeAllLink}>
              <span>{tx("Lihat Semua", "See All")}</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>

      <div className={styles.cardsScroll} role="region" tabIndex={0} aria-label={`${shelfTitle} list`}>
        {items.map((item) => (
          <Link
            key={item.id || item.href}
            href={item.href}
            className={styles.continueCard}
            title={`${continueKicker}: ${item.title}`}
          >
            <CardThumbnail item={item} />

            <div className={styles.textBox}>
              <span className={styles.kicker}>
                {continueKicker} {item.label ? `• ${item.label}` : ""}
              </span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
            </div>

            <button
              type="button"
              className={styles.dismissBtn}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeItem(item.id || item.href);
              }}
              title={tx("Hapus dari riwayat", "Remove from history")}
              aria-label={`${tx("Hapus", "Remove")} ${item.title}`}
            >
              <X size={12} />
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
}
