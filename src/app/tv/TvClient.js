"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Tv, Clapperboard, Clock, Film, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Fallback playlist used when the database has no videos yet.
const fallbackPlaylist = [
  { id: "f1", title: "Belajar Huruf ABC", duration: "5:30", category: "Pendidikan", color: "var(--color-pink)", url: "" },
  { id: "f2", title: "Kisah Binatang di Hutan", duration: "12:00", category: "Dongeng", color: "var(--color-green)", url: "" },
  { id: "f3", title: "Lagu Anak: Balonku", duration: "3:45", category: "Musik", color: "var(--color-yellow)", url: "" },
  { id: "f4", title: "Eksperimen Gunung Meletus", duration: "8:20", category: "Sains", color: "var(--color-orange)", url: "" },
];

// Preferred ordering + emoji for known shows; others fall to the end.
const SHOW_ORDER = ["Nussa", "Omar & Hana", "Riko The Series", "Diva The Series", "Bluey", "Shimajiro", "Shaun the Sheep", "Kok Bisa"];
const SHOW_EMOJI = {
  "Nussa": "🧒", "Omar & Hana": "🎶", "Riko The Series": "🕌", "Diva The Series": "🐱",
  "Bluey": "🐶", "Shimajiro": "🐯", "Shaun the Sheep": "🐑", "Kok Bisa": "🔬",
};

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

function VideoCard({ item, isActive, onSelect }) {
  const thumbId = getYouTubeId(item.url);
  return (
    <button
      className={`${styles.vidCard} ${isActive ? styles.vidCardActive : ""}`}
      onClick={() => onSelect(item)}
      title={item.title}
    >
      <div className={styles.vidThumb} style={{ backgroundColor: item.color || "var(--color-primary)" }}>
        {thumbId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
            alt={item.title}
            loading="lazy"
          />
        ) : (
          <Film size={28} color="white" />
        )}
        <span className={styles.vidPlay}><PlayCircle size={34} /></span>
      </div>
      <div className={styles.vidTitle}>{item.title}</div>
    </button>
  );
}

function Shelf({ name, items, activeKey, onSelect }) {
  const rowRef = useRef(null);
  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <section className={styles.shelf}>
      <div className={styles.shelfHead}>
        <h3 className={styles.shelfTitle}>
          <span className={styles.shelfEmoji}>{SHOW_EMOJI[name] || "📺"}</span>
          {name}
          <span className={styles.shelfCount}>{items.length}</span>
        </h3>
        <div className={styles.shelfNav}>
          <button aria-label="scroll left" className={styles.navBtn} onClick={() => scrollBy(-1)}><ChevronLeft size={20} /></button>
          <button aria-label="scroll right" className={styles.navBtn} onClick={() => scrollBy(1)}><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className={styles.row} ref={rowRef}>
        {items.map((item) => (
          <VideoCard key={item.id || item.url} item={item} isActive={(item.url || item.id) === activeKey} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

export default function TvClient({ videos }) {
  const { t } = useLanguage();
  const playlist = videos && videos.length > 0 ? videos : fallbackPlaylist;

  const [active, setActive] = useState(playlist[0]);
  const [autoplay, setAutoplay] = useState(false);
  const stageRef = useRef(null);

  // group videos by category (show name)
  const groups = useMemo(() => {
    const g = {};
    for (const v of playlist) {
      const key = v.category || "Lainnya";
      (g[key] = g[key] || []).push(v);
    }
    const names = Object.keys(g).sort((a, b) => {
      const ia = SHOW_ORDER.indexOf(a), ib = SHOW_ORDER.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b);
    });
    return names.map((n) => [n, g[n]]);
  }, [playlist]);

  const activeYouTubeId = getYouTubeId(active?.url);
  const activeKey = active?.url || active?.id;

  const onSelect = (item) => {
    setActive(item);
    setAutoplay(true);
    if (stageRef.current) stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const embedSrc = activeYouTubeId
    ? `https://www.youtube-nocookie.com/embed/${activeYouTubeId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.cinemaHeader}>
        <Clapperboard size={32} className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>{t("tv.pageTitle")}</h1>
      </div>

      {/* Player stage */}
      <div className={styles.stage} ref={stageRef}>
        <motion.div className={styles.screenWrapper} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {embedSrc ? (
            <iframe
              key={activeYouTubeId + (autoplay ? "-a" : "")}
              className={styles.videoFrame}
              src={embedSrc}
              title={active?.title || "video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className={styles.screenPlaceholder}>
              <Film size={56} strokeWidth={1.5} className={styles.screenFilmIcon} />
              <div className={styles.screenLabel}>{active?.title || t("tv.screenLabel")}</div>
              <p className={styles.screenHint}>{t("tv.noVideoHint")}</p>
            </div>
          )}
        </motion.div>
        <div className={styles.screenDetails}>
          <h2 className={styles.videoTitle}>{active?.title || t("tv.videoTitle")}</h2>
          <div className={styles.videoTags}>
            {active?.category && <span className={styles.tag}>{SHOW_EMOJI[active.category] || "📺"} {active.category}</span>}
            {active?.duration && (
              <span className={styles.tag}>
                <Clock size={12} style={{ marginRight: 4, verticalAlign: "-1px" }} />
                {active.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Playlists grouped by show */}
      <div className={styles.shelves}>
        <h3 className={styles.shelvesHeading}><Tv size={20} /> {t("tv.playlistTitle")}</h3>
        {groups.map(([name, items]) => (
          <Shelf key={name} name={name} items={items} activeKey={activeKey} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
