"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useLanguage } from "@/components/LanguageProvider";
import { validateGameUrl } from "@/lib/content-registry";
import styles from "./page.module.css";

function IframePlayerContent() {
  const searchParams = useSearchParams();
  const rawGameUrl = searchParams.get("gameurl") || "";
  const title = searchParams.get("title") || "Game Interaktif";
  const { lang, t } = useLanguage();

  const validation = validateGameUrl(rawGameUrl);

  if (!rawGameUrl || !validation.allowed) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <BackButton />
        </div>
        <div className={styles.emptyNotice} role="alert">
          <div className={styles.errorIcon}>🛡️</div>
          <h2>
            {lang === "en" ? "Game Not Permitted or Missing" : "Game Tidak Diizinkan atau Tidak Ditemukan"}
          </h2>
          <p>
            {validation.error ||
              (lang === "en"
                ? "This external game is not on our approved child-safe allowlist."
                : "Tautan game eksternal ini tidak terdaftar dalam daftar aman Sena Kids.")}
          </p>
          <div className={styles.actionRow}>
            <Link href="/games" className={styles.primaryActionBtn}>
              {lang === "en" ? "Browse Safe Games" : "Kembali ke Daftar Game"}
            </Link>
            <Link href="/contact" className={styles.secondaryActionBtn}>
              {lang === "en" ? "Report Issue" : "Laporkan Masalah"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const safeUrl = validation.url;
  const origin = validation.origin;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.gameTitle}>{title}</h1>
        <div className={styles.barActions}>
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openExternalBtn}
            title={lang === "en" ? "Open game in new window" : "Buka game di jendela baru"}
            aria-label={lang === "en" ? "Open game in new window" : "Buka game di jendela baru"}
          >
            <span>↗</span> {lang === "en" ? "Open New Tab" : "Buka Tab Baru"}
          </a>
        </div>
      </div>

      <div className={styles.embedNotice}>
        <span>
          {lang === "en"
            ? `Hosted safely by ${origin}. If the game doesn't load or displays a black screen:`
            : `Dihosting aman oleh ${origin}. Jika game tidak tampil atau layar hitam:`}
        </span>
        <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={styles.directLink}>
          {lang === "en" ? "Play directly" : "Mainkan langsung"} ↗
        </a>
        <span className={styles.divider}>•</span>
        <Link href="/contact" className={styles.directLink}>
          {lang === "en" ? "Report broken" : "Laporkan kendala"}
        </Link>
      </div>

      <div className={styles.iframeWrapper}>
        <iframe
          src={safeUrl}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="autoplay; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          className={styles.iframe}
        />
      </div>
    </div>
  );
}

export default function IframeGamePage() {
  const { lang } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className={styles.loading}>
          {lang === "en" ? "Loading safe game..." : "Memuat permainan ramah anak..."}
        </div>
      }
    >
      <IframePlayerContent />
    </Suspense>
  );
}
