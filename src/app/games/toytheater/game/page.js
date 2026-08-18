"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import styles from "../../iframe/page.module.css";

function ToyTheaterContent() {
  const searchParams = useSearchParams();
  const gameName = searchParams.get("gamename") || "";
  const title = gameName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const gameUrl = `https://toytheater.com/${gameName}/`;

  if (!gameName) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <BackButton />
        </div>
        <div className={styles.emptyNotice}>
          <h2>Game Toy Theater Tidak Ditemukan</h2>
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
          Toy Theater
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

export default function ToyTheaterPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Memuat game Toy Theater...</div>}>
      <ToyTheaterContent />
    </Suspense>
  );
}
