"use client";

import { useActivityStore } from "@/components/BackButton";
import { useEffect } from "react";
import styles from "./MarioGameClient.module.css";

export default function MarioGameClient() {
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  useEffect(() => {
    setHasChanges(true);
  }, [setHasChanges]);

  return (
    <div className={styles.marioGameWrapper}>
      <div className={styles.marioHeader}>
        <div>
          <h1>Super Mario Bros</h1>
          <p>Mainkan petualangan klasik Super Mario Bros secara langsung di browser Anda!</p>
        </div>
      </div>
      <div className={styles.iframeContainer}>
        <iframe
          src="/games/mario/index.html"
          title="Super Mario Bros"
          className={styles.marioIframe}
          allowFullScreen
          scrolling="no"
        />
      </div>
      <div className={styles.controlsInfo}>
        <h3>Kontrol Permainan:</h3>
        <p><strong>Tombol Arah / Arrow Keys</strong>: Bergerak / Menunduk (Kiri/Kanan untuk bergerak, Bawah untuk merunduk)</p>
        <p><strong>Tombol Space / Arrow Up</strong>: Melompat</p>
        <p><strong>Tombol Shift / Ctrl</strong>: Berlari cepat / Menembak bola api</p>
        <p><strong>Tombol P</strong>: Jeda (Pause)</p>
        <p><strong>Tombol M</strong>: Matikan Suara (Mute)</p>
      </div>
    </div>
  );
}
