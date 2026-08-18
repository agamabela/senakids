"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

function IframePlayerContent() {
  const searchParams = useSearchParams();
  const gameUrl = searchParams.get("gameurl") || "";
  const title = searchParams.get("title") || "Game Interaktif";

  if (!gameUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <BackButton />
        </div>
        <div className={styles.emptyNotice}>
          <h2>Game URL Tidak Ditemukan</h2>
          <p>Silakan kembali ke menu game dan pilih permainan lain.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <BackButton />
        <h1 className={styles.gameTitle}>{title}</h1>
        <a 
          href={gameUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.openExternalBtn}
        >
          Buka Tab Baru
        </a>
      </div>
      <div className={styles.iframeWrapper}>
        <iframe
          src={gameUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.iframe}
        />
      </div>
    </div>
  );
}

export default function IframeGamePage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Memuat game...</div>}>
      <IframePlayerContent />
    </Suspense>
  );
}
