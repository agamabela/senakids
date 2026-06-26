"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Tv, Clapperboard, Star, Clock, Film } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Fallback playlist used when the database has no videos yet.
const fallbackPlaylist = [
  { id: "f1", title: "Belajar Huruf ABC", duration: "5:30", category: "Pendidikan", color: "var(--color-pink)", url: "" },
  { id: "f2", title: "Kisah Binatang di Hutan", duration: "12:00", category: "Dongeng", color: "var(--color-green)", url: "" },
  { id: "f3", title: "Lagu Anak: Balonku", duration: "3:45", category: "Musik", color: "var(--color-yellow)", url: "" },
  { id: "f4", title: "Eksperimen Gunung Meletus", duration: "8:20", category: "Sains", color: "var(--color-orange)", url: "" },
];

// Extract a YouTube video id from common URL formats.
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function TvClient({ videos }) {
  const { t } = useLanguage();

  const playlist = videos && videos.length > 0 ? videos : fallbackPlaylist;
  const [activeIndex, setActiveIndex] = useState(0);

  const active = playlist[activeIndex] || playlist[0];
  const activeYouTubeId = getYouTubeId(active?.url);
  const activeThumb = activeYouTubeId
    ? `https://img.youtube.com/vi/${activeYouTubeId}/hqdefault.jpg`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.cinemaHeader}>
        <Clapperboard size={32} className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>{t("tv.pageTitle")}</h1>
      </div>

      <div className={styles.layout}>
        {/* Main Screen */}
        <div className={styles.mainScreenArea}>
          <motion.div
            className={styles.screenWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeYouTubeId ? (
              <iframe
                key={activeYouTubeId}
                className={styles.videoFrame}
                src={`https://www.youtube-nocookie.com/embed/${activeYouTubeId}?rel=0&modestbranding=1`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.screenPlaceholder}>
                <Film size={56} strokeWidth={1.5} className={styles.screenFilmIcon} />
                <div className={styles.screenLabel}>
                  {active?.title || t("tv.screenLabel")}
                </div>
                <p className={styles.screenHint}>
                  {t("tv.noVideoHint")}
                </p>
              </div>
            )}
          </motion.div>

          <div className={styles.screenDetails}>
            <h2 className={styles.videoTitle}>{active?.title || t("tv.videoTitle")}</h2>
            <p className={styles.videoDesc}>{t("tv.videoDesc")}</p>
            <div className={styles.videoTags}>
              {active?.category && <span className={styles.tag}>{active.category}</span>}
              {active?.duration && (
                <span className={styles.tag}>
                  <Clock size={12} style={{ marginRight: 4, verticalAlign: "-1px" }} />
                  {active.duration}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div className={styles.playlistArea}>
          <h3 className={styles.playlistTitle}>
            <Tv size={20} /> {t("tv.playlistTitle")}
          </h3>

          <div className={styles.ticketList}>
            {playlist.map((item, i) => {
              const isActive = i === activeIndex;
              const thumbId = getYouTubeId(item.url);
              return (
                <motion.button
                  key={item.id || item.title}
                  className={`${styles.ticketCard} ${isActive ? styles.ticketActive : ""}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: -4 }}
                  onClick={() => setActiveIndex(i)}
                >
                  <div
                    className={styles.ticketLeft}
                    style={{ backgroundColor: item.color || "var(--color-primary)" }}
                  >
                    {thumbId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://img.youtube.com/vi/${thumbId}/default.jpg`}
                        alt={item.title}
                        className={styles.ticketThumb}
                      />
                    ) : (
                      <Star fill="white" color="white" size={24} />
                    )}
                  </div>
                  <div className={styles.ticketBody}>
                    <h4 className={styles.ticketTitle}>{item.title}</h4>
                    <div className={styles.ticketMeta}>
                      <span>{item.category}</span>
                      {item.duration && (
                        <span className={styles.duration}>
                          <Clock size={12} /> {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.ticketRight}>
                    <PlayCircle
                      size={24}
                      color={isActive ? "var(--color-primary)" : "var(--color-muted-foreground)"}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
