"use client";

import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import styles from "./AmbientSound.module.css";

export default function AmbientSound() {
  const { tx } = useLanguage();
  const audioRef = useRef(null);
  const [status, setStatus] = useState("off");
  const [quiet, setQuiet] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const syncQuiet = () => {
      let enabled = false;
      try { enabled = localStorage.getItem("senakids_quiet_mode") === "true"; } catch {}
      setQuiet(enabled);
      if (enabled) {
        requestRef.current++;
        audioRef.current?.pause();
        setStatus("off");
      }
    };
    syncQuiet();
    window.addEventListener("senakids:quiet-mode", syncQuiet);
    window.addEventListener("storage", syncQuiet);
    return () => {
      window.removeEventListener("senakids:quiet-mode", syncQuiet);
      window.removeEventListener("storage", syncQuiet);
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || quiet) return;
    const request = ++requestRef.current;
    if (status === "playing" || status === "loading") {
      audio.pause();
      setStatus("off");
      return;
    }
    setStatus("loading");
    audio.volume = 0.35;
    try {
      // Start directly from the click to preserve mobile playback permission.
      await audio.play();
      if (request === requestRef.current && !audio.paused) setStatus("playing");
    } catch {
      if (request === requestRef.current) setStatus("error");
    }
  };

  const label = quiet
    ? tx("Musik dimatikan oleh Mode Tenang", "Music muted by Quiet Mode")
    : status === "loading"
      ? tx("Memuat musik… Ketuk untuk membatalkan", "Loading music… Tap to cancel")
      : status === "playing"
        ? tx("Matikan musik latar", "Turn off background music")
        : tx("Nyalakan musik latar", "Turn on background music");

  return (
    <>
      <audio ref={audioRef} src="/audio/sena-playtime.wav" preload="none" loop
        onError={() => setStatus("error")}
        onPause={() => setStatus((current) => current === "playing" ? "off" : current)} />
      <div className={styles.control}>
        <button type="button" className={`${styles.toggle} ${status === "playing" ? styles.on : ""}`}
          onClick={toggleMusic} aria-label={label} title={label}
          aria-pressed={status === "playing"} disabled={quiet}>
          {status === "playing" ? <Music size={22} /> : <VolumeX size={22} />}
        </button>
        <span className={styles.feedback} role="status">
          {status === "loading" && tx("Memuat musik…", "Loading music…")}
          {status === "error" && tx("Musik belum bisa diputar. Ketuk untuk mencoba lagi.", "Music could not play. Tap to retry.")}
        </span>
      </div>
    </>
  );
}
