"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useLanguage } from "@/components/LanguageProvider";
import { validateToyTheaterGame } from "@/lib/content-registry";
import styles from "../../iframe/page.module.css";

function ToyTheaterContent() {
  const searchParams = useSearchParams();
  const rawGameName = searchParams.get("gamename") || "";
  const { lang } = useLanguage();

  const isApproved = validateToyTheaterGame(rawGameName);

  if (!rawGameName || !isApproved) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <BackButton />
        </div>
        <div className={styles.emptyNotice} role="alert">
          <div className={styles.errorIcon}>🛡️</div>
          <h2>
            {lang === "en"
              ? "Toy Theater Game Not Found or Unapproved"
              : "Game Toy Theater Tidak Ditemukan atau Belum Disetujui"}
          </h2>
          <p>
            {lang === "en"
              ? "This mini-game is not on our curated educational allowlist."
              : "Permainan edukasi ini tidak ditemukan dalam daftar permainan aman yang disetujui."}
          </p>
          <div className={styles.actionRow}>
            <Link href="/games" className={styles.primaryActionBtn}>
              {lang === "en" ? "Back to Games" : "Kembali ke Menu Game"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cleanName = rawGameName.trim().toLowerCase();
  const title = cleanName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const gameUrl = `https://toytheater.com/${cleanName}/`;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.gameTitle}>{title}</h1>
        <div className={styles.barActions}>
          <a
            href={gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.openExternalBtn}
            title={lang === "en" ? "Open on Toy Theater in new tab" : "Buka di Toy Theater"}
            aria-label={lang === "en" ? "Open on Toy Theater in new tab" : "Buka di Toy Theater"}
          >
            <span>↗</span> Toy Theater
          </a>
        </div>
      </div>

      <div className={styles.embedNotice}>
        <span>
          {lang === "en"
            ? "Provided by Toy Theater. If interaction is unresponsive or blocked:"
            : "Disediakan oleh Toy Theater. Jika interaksi tidak responsif atau diblokir:"}
        </span>
        <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={styles.directLink}>
          {lang === "en" ? "Open directly on Toy Theater" : "Buka langsung di Toy Theater"} ↗
        </a>
        <span className={styles.divider}>•</span>
        <Link href="/contact" className={styles.directLink}>
          {lang === "en" ? "Report broken" : "Laporkan kendala"}
        </Link>
      </div>

      <div className={styles.iframeWrapper}>
        <iframe
          src={gameUrl}
          title={`Toy Theater - ${title}`}
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

export default function ToyTheaterPage() {
  const { lang } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className={styles.loading}>
          {lang === "en" ? "Loading Toy Theater game..." : "Memuat game Toy Theater..."}
        </div>
      }
    >
      <ToyTheaterContent />
    </Suspense>
  );
}
