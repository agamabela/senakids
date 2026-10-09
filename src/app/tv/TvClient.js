"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  PlayCircle,
  Clock,
  Sparkles,
  Film,
  Search,
  X,
  Filter,
  ChevronDown,
  Layers,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { CURATED_TV_VIDEOS } from "@/lib/content-registry";
import { addHistory } from "@/lib/activity-history";
import ContinueShelf from "@/components/ContinueShelf";
import styles from "./page.module.css";

const SHOW_ORDER = [
  "Nussa",
  "Riko The Series",
  "Kok Bisa",
  "Diva The Series",
  "Omar & Hana",
  "Shimajiro",
  "Bluey",
  "Lagu Anak",
];

const SHOW_EMOJI = {
  Nussa: "🧒",
  "Riko The Series": "🤖",
  "Kok Bisa": "🔬",
  "Diva The Series": "🐱",
  "Omar & Hana": "🎶",
  Shimajiro: "🐯",
  Bluey: "🐶",
  "Lagu Anak": "🎵",
};

const TOPICS = [
  { id: "all", label: { id: "Semua Topik", en: "All Topics" } },
  { id: "moral", label: { id: "Karakter & Moral", en: "Character & Moral" }, keywords: ["kebaikan", "sikap", "adab", "kebiasaan", "syukur", "tolong"] },
  { id: "sains", label: { id: "Sains & Alam", en: "Science & Nature" }, keywords: ["sains", "alam", "teknologi", "hujan", "bumi", "dinosaurus", "gravitasi"] },
  { id: "lagu", label: { id: "Musik & Lagu", en: "Music & Songs" }, keywords: ["lagu", "musik", "bernyanyi"] },
  { id: "keluarga", label: { id: "Keluarga & Teman", en: "Family & Friends" }, keywords: ["keluarga", "pertemanan", "sahabat", "ayah", "ibu"] },
];

const AGE_RANGES = [
  { id: "all", label: { id: "Semua Usia", en: "All Ages" } },
  { id: "toddler", label: { id: "3–5 Tahun", en: "Ages 3–5" }, maxAge: 5 },
  { id: "early", label: { id: "6–8 Tahun", en: "Ages 6–8" }, minAge: 6, maxAge: 8 },
  { id: "older", label: { id: "9+ Tahun", en: "Ages 9+" }, minAge: 9 },
];

const DURATIONS = [
  { id: "all", label: { id: "Semua Durasi", en: "All Durations" } },
  { id: "short", label: { id: "< 5 Menit", en: "< 5 Mins" }, maxSec: 300 },
  { id: "medium", label: { id: "5–10 Menit", en: "5–10 Mins" }, minSec: 300, maxSec: 600 },
  { id: "long", label: { id: "> 10 Menit", en: "> 10 Mins" }, minSec: 600 },
];

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

function parseDurationSeconds(durStr) {
  if (!durStr || typeof durStr !== "string") return 0;
  const parts = durStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function VideoCard({ item, isActive, onSelect }) {
  const thumbId = getYouTubeId(item.url);
  return (
    <button
      className={`${styles.vidCard} ${isActive ? styles.vidCardActive : ""}`}
      onClick={() => onSelect(item)}
      title={item.title}
      aria-label={`Pilih video: ${item.title}`}
    >
      <div className={styles.vidThumb} style={{ backgroundColor: item.color || "var(--color-primary)" }}>
        {thumbId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${thumbId}/mqdefault.jpg`}
            alt={item.title}
            loading="lazy"
          />
        ) : (
          <Film size={28} color="white" />
        )}
        <span className={styles.vidPlay}>
          <PlayCircle size={36} />
        </span>
      </div>
      <div className={styles.vidInfo}>
        <div className={styles.vidTitle}>{item.title}</div>
        <div className={styles.vidMeta}>
          {item.category && <span className={styles.vidCategory}>{item.category}</span>}
          {item.duration && (
            <span className={styles.vidDuration}>
              <Clock size={11} />
              {item.duration}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function TvClient({ videos = [] }) {
  const { lang } = useLanguage();
  const tx = (id, en) => (lang === "en" ? en : id);

  // Keep the reviewed library available while allowing editors to add new shows.
  // Database entries use a separate id prefix so an editorial item cannot replace
  // a reviewed item with the same numeric id.
  const rawPlaylist = useMemo(() => [
    ...CURATED_TV_VIDEOS,
    ...(videos || []).map((video) => ({ ...video, id: `editor-${video.id}` })),
  ], [videos]);

  // State
  const [active, setActive] = useState(rawPlaylist[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [visibleCount, setVisibleCount] = useState(18); // Render 18 cards initially
  const [blacklistMap, setBlacklistMap] = useState({});
  const stageRef = useRef(null);

  // Load blacklist from localStorage & listen for changes
  useEffect(() => {
    const loadBlacklist = () => {
      try {
        const stored =
          localStorage.getItem("SENA:BLACKLIST_CHANNEL_MAP") ||
          localStorage.getItem("CABOCIL:BLACKLIST_CHANNEL_MAP");
        if (stored) {
          setBlacklistMap(JSON.parse(stored));
        } else {
          setBlacklistMap({});
        }
      } catch (e) {
        console.warn("Could not read channels blacklist", e);
      }
    };
    loadBlacklist();
    window.addEventListener("sena-channels-updated", loadBlacklist);
    window.addEventListener("storage", loadBlacklist);
    return () => {
      window.removeEventListener("sena-channels-updated", loadBlacklist);
      window.removeEventListener("storage", loadBlacklist);
    };
  }, []);

  // Helper to determine if channel is disabled
  const isChannelDisabled = (v) => {
    const name = v.category || v.channel || "";
    return Boolean(
      blacklistMap[name] ||
      (v.channelId && blacklistMap[v.channelId])
    );
  };

  // Normalize items
  const normalizedVideos = useMemo(() => {
    return rawPlaylist.map((v) => {
      const durSec = v.durationSeconds || parseDurationSeconds(v.duration);
      return {
        ...v,
        durationSeconds: durSec,
        category: v.category || v.channel || "Lainnya",
      };
    });
  }, [rawPlaylist]);

  // Filter out blacklisted channels
  const activeVideos = useMemo(() => {
    return normalizedVideos.filter((v) => !isChannelDisabled(v));
  }, [normalizedVideos, blacklistMap]);

  // Fallback active video if currently selected video gets disabled
  useEffect(() => {
    if (active && isChannelDisabled(active)) {
      if (activeVideos.length > 0) {
        setActive(activeVideos[0]);
      }
    } else if (!active && activeVideos.length > 0) {
      setActive(activeVideos[0]);
    }
  }, [active, activeVideos, blacklistMap]);

  // Channels list (shows only non-disabled channels)
  const channelsList = useMemo(() => {
    const counts = {};
    for (const v of activeVideos) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    }
    const names = Object.keys(counts).sort((a, b) => {
      const ia = SHOW_ORDER.indexOf(a),
        ib = SHOW_ORDER.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b);
    });

    return [
      { id: "all", label: tx("Semua Channel", "All Channels"), emoji: "✨", count: activeVideos.length },
      ...names.map((name) => ({
        id: name,
        label: name,
        emoji: SHOW_EMOJI[name] || "📺",
        count: counts[name],
      })),
    ];
  }, [activeVideos, lang]);

  // Filtering
  const filteredVideos = useMemo(() => {
    return activeVideos.filter((v) => {
      // Channel
      if (selectedChannel !== "all" && v.category !== selectedChannel) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q);
        const matchesCat = (v.category || "").toLowerCase().includes(q);
        const matchesTopics = (v.topics || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCat && !matchesTopics) return false;
      }

      // Topic Filter
      if (selectedTopic !== "all") {
        const topicDef = TOPICS.find((t) => t.id === selectedTopic);
        if (topicDef && topicDef.keywords) {
          const text = `${v.title} ${v.category} ${(v.topics || []).join(" ")}`.toLowerCase();
          const matches = topicDef.keywords.some((k) => text.includes(k));
          if (!matches) return false;
        }
      }

      // Age Filter
      if (selectedAge !== "all") {
        const ageDef = AGE_RANGES.find((a) => a.id === selectedAge);
        if (ageDef) {
          const vAge = v.minAge || 4;
          if (ageDef.maxAge && vAge > ageDef.maxAge) return false;
          if (ageDef.minAge && vAge < ageDef.minAge) return false;
        }
      }

      // Duration Filter
      if (selectedDuration !== "all") {
        const durDef = DURATIONS.find((d) => d.id === selectedDuration);
        if (durDef) {
          const sec = v.durationSeconds || 0;
          if (durDef.maxSec && sec > durDef.maxSec) return false;
          if (durDef.minSec && sec < durDef.minSec) return false;
        }
      }

      return true;
    });
  }, [normalizedVideos, selectedChannel, searchQuery, selectedTopic, selectedAge, selectedDuration]);

  // Paginated view
  const visibleVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const activeYouTubeId = getYouTubeId(active?.url);
  const activeKey = active?.url || active?.id;

  const onSelect = (item) => {
    setActive(item);
    setIsPlaying(true);
    const thumbId = getYouTubeId(item.url);
    addHistory({
      id: `tv-${item.id || item.url}`,
      type: "tv",
      title: item.title,
      href: "/tv",
      image: thumbId ? `https://i.ytimg.com/vi/${thumbId}/hqdefault.jpg` : "",
      emoji: "📺",
      label: item.category || "Sena TV",
    });
    if (stageRef.current) {
      stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleResetFilters = () => {
    setSelectedChannel("all");
    setSearchQuery("");
    setSelectedTopic("all");
    setSelectedAge("all");
    setSelectedDuration("all");
    setVisibleCount(18);
  };

  const embedSrc = activeYouTubeId && isPlaying
    ? `https://www.youtube-nocookie.com/embed/${activeYouTubeId}?rel=0&modestbranding=1&autoplay=1`
    : null;

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <header className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Tv size={28} className={styles.headerIcon} aria-hidden="true" />
          </div>
          <div>
            <h1 className={styles.headerTitle}>{tx("TV Edukasi Ramah Anak", "Safe Kids TV")}</h1>
            <p className={styles.headerSubtitle}>
              {tx(
                "Tonton video edukasi, dongeng budi pekerti, dan lagu anak aman tanpa pelacak iklan.",
                "Watch educational videos, character stories, and nursery rhymes safely without behavioral ads."
              )}
            </p>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className={styles.tvLayout}>
        {/* Left Channel Sidebar */}
        <aside className={styles.channelSidebar} aria-label={tx("Pilih Channel", "Select Channel")}>
          <div className={styles.sidebarTitleBox}>
            <span className={styles.sidebarTitle}>{tx("Channel Pilihan", "Channels")}</span>
            <Link href="/channels" className={styles.manageChannelsLink} title={tx("Atur Channel Pilihan", "Manage Channels")}>
              <Settings size={12} />
              <span>{tx("Atur", "Manage")}</span>
            </Link>
          </div>
          <div className={styles.channelList}>
            {channelsList.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChannel(ch.id);
                    setVisibleCount(18);
                  }}
                  className={`${styles.channelBtn} ${isSelected ? styles.channelBtnActive : ""}`}
                  aria-pressed={isSelected}
                >
                  <span className={styles.channelEmoji}>{ch.emoji}</span>
                  <span className={styles.channelLabel}>{ch.label}</span>
                  {ch.count !== undefined && <span className={styles.channelBadge}>{ch.count}</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className={styles.mainContent}>
          {/* Continue Watching History Shelf */}
          <ContinueShelf type="tv" seeAllHref="#tv-catalog" />

          {/* Cinema Stage Player */}
          <section className={styles.stage} ref={stageRef} aria-label={tx("Pemutar Video", "Video Player")}>
            <motion.div
              className={styles.screenWrapper}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {embedSrc ? (
                <iframe
                  key={activeYouTubeId}
                  className={styles.videoFrame}
                  src={embedSrc}
                  title={active?.title || "Video Edukasi Anak"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  {activeYouTubeId && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://i.ytimg.com/vi/${activeYouTubeId}/hqdefault.jpg`}
                      alt={active?.title || "Thumbnail Video"}
                      className={styles.placeholderImg}
                    />
                  )}
                  <div className={styles.placeholderOverlay}>
                    <button
                      className={styles.bigPlayBtn}
                      onClick={() => setIsPlaying(true)}
                      aria-label={`${tx("Putar video:", "Play video:")} ${active?.title}`}
                    >
                      <PlayCircle size={64} className={styles.playIcon} />
                      <span className={styles.playText}>
                        {tx("Putar Video Ini", "Play Video Now")}
                      </span>
                    </button>
                    <div className={styles.privacyBadge}>
                      <ShieldCheck size={14} />
                      <span>{tx("Mode Terlindungi (Bebas Iklan Perilaku)", "Enhanced Privacy Mode")}</span>
                    </div>
                  </div>
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
                <span className={styles.tag}>
                  {tx("Usia", "Age")} {active?.minAge || 4}+
                </span>
              </div>
            </div>
          </section>

          {/* Search & Filter Controls Bar */}
          <section className={styles.filterSection} aria-label={tx("Pencarian & Filter Video", "Video Search & Filters")}>
            {/* Search Input */}
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(18);
                }}
                placeholder={tx("Cari video edukasi anak...", "Search kids educational videos...")}
                className={styles.searchInput}
                aria-label={tx("Cari video edukasi anak", "Search kids educational videos")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.clearBtn}
                  aria-label={tx("Hapus pencarian", "Clear search")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Pills: Topics, Age, Duration */}
            <div className={styles.filterPillGroups}>
              {/* Topic Filters */}
              <div className={styles.pillGroup} role="group" aria-label={tx("Filter Topik", "Topic Filter")}>
                <span className={styles.filterLabel}>{tx("Topik:", "Topic:")}</span>
                {TOPICS.map((topic) => {
                  const isSel = selectedTopic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic.id);
                        setVisibleCount(18);
                      }}
                      className={`${styles.filterPill} ${isSel ? styles.filterPillActive : ""}`}
                      aria-pressed={isSel}
                    >
                      {topic.label[lang] || topic.label.id}
                    </button>
                  );
                })}
              </div>

              {/* Age Filters */}
              <div className={styles.pillGroup} role="group" aria-label={tx("Filter Usia", "Age Filter")}>
                <span className={styles.filterLabel}>{tx("Usia:", "Age:")}</span>
                {AGE_RANGES.map((age) => {
                  const isSel = selectedAge === age.id;
                  return (
                    <button
                      key={age.id}
                      onClick={() => {
                        setSelectedAge(age.id);
                        setVisibleCount(18);
                      }}
                      className={`${styles.filterPill} ${isSel ? styles.filterPillActive : ""}`}
                      aria-pressed={isSel}
                    >
                      {age.label[lang] || age.label.id}
                    </button>
                  );
                })}
              </div>

              {/* Duration Filters */}
              <div className={styles.pillGroup} role="group" aria-label={tx("Filter Durasi", "Duration Filter")}>
                <span className={styles.filterLabel}>{tx("Durasi:", "Duration:")}</span>
                {DURATIONS.map((dur) => {
                  const isSel = selectedDuration === dur.id;
                  return (
                    <button
                      key={dur.id}
                      onClick={() => {
                        setSelectedDuration(dur.id);
                        setVisibleCount(18);
                      }}
                      className={`${styles.filterPill} ${isSel ? styles.filterPillActive : ""}`}
                      aria-pressed={isSel}
                    >
                      {dur.label[lang] || dur.label.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Count & Active Filter indicator */}
            <div className={styles.resultsInfoRow}>
              <span className={styles.resultsCount}>
                {tx(
                  `Menampilkan ${Math.min(visibleVideos.length, filteredVideos.length)} dari ${filteredVideos.length} video`,
                  `Showing ${Math.min(visibleVideos.length, filteredVideos.length)} of ${filteredVideos.length} videos`
                )}
              </span>
              {(searchQuery ||
                selectedChannel !== "all" ||
                selectedTopic !== "all" ||
                selectedAge !== "all" ||
                selectedDuration !== "all") && (
                <button onClick={handleResetFilters} className={styles.resetFiltersBtn}>
                  <X size={14} />
                  <span>{tx("Reset Semua Filter", "Reset All Filters")}</span>
                </button>
              )}
            </div>
          </section>

          {/* Videos Grid with initial 18 cards */}
          {visibleVideos.length > 0 ? (
            <section className={styles.catalogSection} aria-label={tx("Daftar Video", "Video Catalog")}>
              <div className={styles.videoGrid}>
                {visibleVideos.map((item) => (
                  <VideoCard
                    key={item.id || item.url}
                    item={item}
                    isActive={(item.url || item.id) === activeKey}
                    onSelect={onSelect}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {filteredVideos.length > visibleCount && (
                <div className={styles.loadMoreRow}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 18)}
                    className={styles.loadMoreBtn}
                  >
                    <Layers size={18} />
                    <span>
                      {tx(
                        `Muat Lebih Banyak Video (${filteredVideos.length - visibleCount} tersisa)`,
                        `Load More Videos (${filteredVideos.length - visibleCount} remaining)`
                      )}
                    </span>
                  </button>
                </div>
              )}
            </section>
          ) : (
            <div className={styles.emptyResults} role="status">
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>
                {tx("Tidak Menemukan Video yang Cocok", "No Videos Found")}
              </h3>
              <p className={styles.emptyText}>
                {tx(
                  "Coba gunakan kata kunci pencarian lain atau ubah filter usia dan channel di atas.",
                  "Try different keywords or adjust the channel, topic, or age filters above."
                )}
              </p>
              <button onClick={handleResetFilters} className={styles.resetSearchBtn}>
                {tx("Lihat Semua Video", "View All Videos")}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
