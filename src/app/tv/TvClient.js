"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Tv, PlayCircle, ChevronLeft, ChevronRight, Clock, Sparkles, Film } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Rich curated educational kid videos (YouTube embeds)
const defaultPlaylists = [
  // Nussa
  { id: "n1", title: "Nussa: Belajar Ikhlas & Berbagi", duration: "6:40", category: "Nussa", color: "var(--color-orange)", url: "https://www.youtube.com/watch?v=0h9V6wZ_eXQ" },
  { id: "n2", title: "Nussa: Berani Berubah Menjadi Baik", duration: "7:12", category: "Nussa", color: "var(--color-orange)", url: "https://www.youtube.com/watch?v=kYJjQn-mU1Y" },
  { id: "n3", title: "Nussa: Adab Makan & Minum", duration: "5:25", category: "Nussa", color: "var(--color-orange)", url: "https://www.youtube.com/watch?v=wX-y4T3Y8y8" },
  
  // Omar & Hana
  { id: "oh1", title: "Omar & Hana: Sayang Ibu Ayah", duration: "4:15", category: "Omar & Hana", color: "var(--color-pink)", url: "https://www.youtube.com/watch?v=QZ0D23Y6zqk" },
  { id: "oh2", title: "Omar & Hana: Mari Bersyukur Setiap Hari", duration: "5:02", category: "Omar & Hana", color: "var(--color-pink)", url: "https://www.youtube.com/watch?v=Zf0W8dJg-Gk" },
  { id: "oh3", title: "Omar & Hana: Tolong Menolong Sesama", duration: "4:48", category: "Omar & Hana", color: "var(--color-pink)", url: "https://www.youtube.com/watch?v=k_qT-mZ6Z3g" },

  // Riko The Series
  { id: "r1", title: "Riko The Series: Robot Pintar Penolong", duration: "8:30", category: "Riko The Series", color: "var(--color-blue)", url: "https://www.youtube.com/watch?v=6QoX7V-09m0" },
  { id: "r2", title: "Riko The Series: Sains & Gravitasi Bumi", duration: "7:55", category: "Riko The Series", color: "var(--color-blue)", url: "https://www.youtube.com/watch?v=x7K4w_9k8xY" },
  { id: "r3", title: "Riko The Series: Mengapa Ada Pelangi?", duration: "6:18", category: "Riko The Series", color: "var(--color-blue)", url: "https://www.youtube.com/watch?v=VzW5u-nZ66U" },

  // Diva The Series
  { id: "d1", title: "Diva The Series: Mengenal Huruf & Angka", duration: "6:05", category: "Diva The Series", color: "var(--color-teal)", url: "https://www.youtube.com/watch?v=Kz49u398rL8" },
  { id: "d2", title: "Diva The Series: Berbagi Mainan dengan Teman", duration: "5:40", category: "Diva The Series", color: "var(--color-teal)", url: "https://www.youtube.com/watch?v=uK7l3F9yv4Y" },

  // Kok Bisa (Sains Anak)
  { id: "kb1", title: "Kok Bisa: Kenapa Langit Berwarna Biru?", duration: "4:50", category: "Kok Bisa", color: "var(--color-yellow)", url: "https://www.youtube.com/watch?v=9_n3qZ9qWlU" },
  { id: "kb2", title: "Kok Bisa: Bagaimana Proses Terjadinya Hujan?", duration: "5:15", category: "Kok Bisa", color: "var(--color-yellow)", url: "https://www.youtube.com/watch?v=uD5Z-u4vYQ0" },
  { id: "kb3", title: "Kok Bisa: Kenapa Dinosaurus Bisa Punah?", duration: "6:20", category: "Kok Bisa", color: "var(--color-yellow)", url: "https://www.youtube.com/watch?v=vV7Y1q9mJgQ" },

  // Bluey
  { id: "bl1", title: "Bluey: Petualangan Seru di Halaman", duration: "7:10", category: "Bluey", color: "var(--color-blue)", url: "https://www.youtube.com/watch?v=8H2u08c9r3k" },
  { id: "bl2", title: "Bluey: Bermain Bersama Bingo", duration: "6:45", category: "Bluey", color: "var(--color-blue)", url: "https://www.youtube.com/watch?v=4yWz3n5x10o" },

  // Lagu Anak
  { id: "la1", title: "Lagu Anak: Menanam Jagung di Kebun Kita", duration: "3:30", category: "Lagu Anak", color: "var(--color-green)", url: "https://www.youtube.com/watch?v=w1v42D9_K8s" },
  { id: "la2", title: "Lagu Anak: Bangun Tidur Kuterus Mandi", duration: "2:55", category: "Lagu Anak", color: "var(--color-green)", url: "https://www.youtube.com/watch?v=m7L3mZq_e8U" },
];

const SHOW_ORDER = ["Nussa", "Omar & Hana", "Riko The Series", "Diva The Series", "Kok Bisa", "Bluey", "Lagu Anak"];
const SHOW_EMOJI = {
  "Nussa": "🧒", 
  "Omar & Hana": "🎶", 
  "Riko The Series": "🤖", 
  "Diva The Series": "🐱",
  "Kok Bisa": "🔬",
  "Bluey": "🐶", 
  "Lagu Anak": "🎵",
};

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
        <span className={styles.vidPlay}><PlayCircle size={36} /></span>
      </div>
      <div className={styles.vidTitle}>{item.title}</div>
      {item.duration && <div className={styles.vidDuration}>{item.duration}</div>}
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
    <section className={styles.shelf} id={`channel-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={styles.shelfHead}>
        <h3 className={styles.shelfTitle}>
          <span className={styles.shelfEmoji}>{SHOW_EMOJI[name] || "📺"}</span>
          {name}
          <span className={styles.shelfCount}>{items.length} video</span>
        </h3>
        <div className={styles.shelfNav}>
          <button aria-label={`Scroll ${name} left`} className={styles.navBtn} onClick={() => scrollBy(-1)}>
            <ChevronLeft size={18} />
          </button>
          <button aria-label={`Scroll ${name} right`} className={styles.navBtn} onClick={() => scrollBy(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className={styles.row} ref={rowRef}>
        {items.map((item) => (
          <VideoCard 
            key={item.id || item.url} 
            item={item} 
            isActive={(item.url || item.id) === activeKey} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </section>
  );
}

export default function TvClient({ videos = [] }) {
  const { language } = useLanguage();
  const tx = (id, en) => (language === "id" ? id : en);

  // Combine database videos with curated defaults if database is empty
  const playlist = videos && videos.length > 0 ? videos : defaultPlaylists;

  const [active, setActive] = useState(playlist[0]);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [autoplay, setAutoplay] = useState(false);
  const stageRef = useRef(null);

  // Group videos by category/channel
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

  const channelsList = useMemo(() => {
    return [
      { id: "all", label: tx("Semua Channel", "All Channels"), emoji: "✨" },
      ...groups.map(([name, items]) => ({
        id: name,
        label: name,
        emoji: SHOW_EMOJI[name] || "📺",
        count: items.length,
      }))
    ];
  }, [groups, language]);

  const activeYouTubeId = getYouTubeId(active?.url);
  const activeKey = active?.url || active?.id;

  const onSelect = (item) => {
    setActive(item);
    setAutoplay(true);
    if (stageRef.current) {
      stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const visibleGroups = useMemo(() => {
    if (selectedChannel === "all") return groups;
    return groups.filter(([name]) => name === selectedChannel);
  }, [groups, selectedChannel]);

  const embedSrc = activeYouTubeId
    ? `https://www.youtube-nocookie.com/embed/${activeYouTubeId}?rel=0&modestbranding=1${autoplay ? "&autoplay=1" : ""}`
    : null;

  return (
    <div className={styles.container}>
      
      {/* Header Banner */}
      <div className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Tv size={28} className={styles.headerIcon} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>{tx("TV Anak Sena Kids", "Sena Kids TV")}</h1>
            <p className={styles.headerSubtitle}>
              {tx("Tonton video edukasi, dongeng islami, dan lagu anak yang aman dan mendidik.", "Watch safe, educational videos, stories, and songs for kids.")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className={styles.tvLayout}>
        
        {/* Left / Top Channel Sidebar */}
        <aside className={styles.channelSidebar}>
          <div className={styles.sidebarTitleBox}>
            <span className={styles.sidebarTitle}>{tx("Channel Pilihan", "Channels")}</span>
          </div>
          <div className={styles.channelList}>
            {channelsList.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`${styles.channelBtn} ${isSelected ? styles.channelBtnActive : ""}`}
                >
                  <span className={styles.channelEmoji}>{ch.emoji}</span>
                  <span className={styles.channelLabel}>{ch.label}</span>
                  {ch.count && <span className={styles.channelBadge}>{ch.count}</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className={styles.mainContent}>
          
          {/* Cinema Stage Player */}
          <div className={styles.stage} ref={stageRef}>
            <motion.div 
              className={styles.screenWrapper} 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }}
            >
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
                  <Film size={48} strokeWidth={1.5} className={styles.screenFilmIcon} />
                  <div className={styles.screenLabel}>{active?.title || tx("Pilih Video", "Select a Video")}</div>
                  <p className={styles.screenHint}>{tx("Klik video di bawah untuk memutar.", "Click any video below to start playing.")}</p>
                </div>
              )}
            </motion.div>

            {/* Video metadata under player */}
            <div className={styles.screenDetails}>
              <div className={styles.screenDetailsTop}>
                <h2 className={styles.videoTitle}>{active?.title || tx("Video Anak", "Kids Video")}</h2>
              </div>
              <div className={styles.videoTags}>
                {active?.category && (
                  <span className={styles.tag}>
                    {SHOW_EMOJI[active.category] || "📺"} {active.category}
                  </span>
                )}
                {active?.duration && (
                  <span className={styles.tag}>
                    <Clock size={12} style={{ marginRight: 4, verticalAlign: "-1px" }} />
                    {active.duration}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Video Shelves */}
          <div className={styles.shelves}>
            {visibleGroups.map(([name, items]) => (
              <Shelf 
                key={name} 
                name={name} 
                items={items} 
                activeKey={activeKey} 
                onSelect={onSelect} 
              />
            ))}
          </div>

        </main>
      </div>

    </div>
  );
}
