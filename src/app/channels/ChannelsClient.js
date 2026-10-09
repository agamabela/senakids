"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Tv, Search, X, Check, EyeOff, RotateCcw, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const STORAGE_KEY_SENA = "SENA:BLACKLIST_CHANNEL_MAP";
const STORAGE_KEY_CABOCIL = "CABOCIL:BLACKLIST_CHANNEL_MAP";

function ChannelAvatar({ name, imageUrl }) {
  const [error, setError] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (error || !imageUrl) {
    return (
      <div className={styles.channelAvatarFallback} aria-hidden="true">
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      className={styles.channelAvatar}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

export default function ChannelsClient({ initialChannels = [] }) {
  const { lang } = useLanguage();
  const tx = (id, en) => (lang === "en" ? en : id);

  const [channels] = useState(initialChannels);
  const [blacklistMap, setBlacklistMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load blacklist from localStorage on client mount
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY_SENA) ||
        localStorage.getItem(STORAGE_KEY_CABOCIL);
      if (stored) {
        setBlacklistMap(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read channels blacklist", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever blacklistMap updates
  const saveBlacklist = useCallback((newMap) => {
    setBlacklistMap(newMap);
    try {
      const json = JSON.stringify(newMap);
      localStorage.setItem(STORAGE_KEY_SENA, json);
      localStorage.setItem(STORAGE_KEY_CABOCIL, json);
      window.dispatchEvent(new Event("sena-channels-updated"));
    } catch (e) {
      console.warn("Could not save channels blacklist", e);
    }
  }, []);

  // Toggle single channel
  const toggleChannel = (channel) => {
    const isCurrentlyBlacklisted =
      Boolean(blacklistMap[channel.id]) || Boolean(blacklistMap[channel.name]);
    const updated = { ...blacklistMap };

    if (isCurrentlyBlacklisted) {
      delete updated[channel.id];
      delete updated[channel.name];
    } else {
      updated[channel.id] = true;
      updated[channel.name] = true;
    }
    saveBlacklist(updated);
  };

  // Enable all channels
  const enableAll = () => {
    saveBlacklist({});
  };

  // Disable all channels
  const disableAll = () => {
    const updated = {};
    for (const c of channels) {
      updated[c.id] = true;
      updated[c.name] = true;
    }
    saveBlacklist(updated);
  };

  // Extract all distinct tags
  const tagsList = useMemo(() => {
    const set = new Set();
    for (const c of channels) {
      for (const t of c.tags || []) {
        if (t) set.add(t);
      }
    }
    return ["all", ...Array.from(set).sort()];
  }, [channels]);

  // Filter channels based on search and tag
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTags = (c.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesTags) return false;
      }
      // Tag
      if (selectedTag !== "all") {
        if (!(c.tags || []).includes(selectedTag)) return false;
      }
      return true;
    });
  }, [channels, searchQuery, selectedTag]);

  // Counts
  const totalCount = channels.length;
  const activeCount = useMemo(() => {
    return channels.filter(
      (c) => !blacklistMap[c.id] && !blacklistMap[c.name]
    ).length;
  }, [channels, blacklistMap]);
  const disabledCount = totalCount - activeCount;
  const visibleCount = filteredChannels.length;

  return (
    <div className={styles.container}>
      {/* Header Card */}
      <section className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>
              <Tv size={28} color="var(--color-primary)" />
              {tx("Channel Pilihan", "Selected Channels")}
            </h1>
            <p className={styles.subtitle}>
              {tx(
                "Atur channel yang ingin ditampilkan. Nonaktifkan channel yang tidak ingin muncul di Sena TV.",
                "Choose which channels to show. Disable any channels you do not want to appear on Sena TV."
              )}
            </p>
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              onClick={enableAll}
              className={styles.actionBtn}
              aria-label={tx("Aktifkan Semua Channel", "Enable All Channels")}
            >
              <Check size={16} color="#10b981" />
              {tx("Aktifkan Semua", "Enable All")}
            </button>
            <button
              type="button"
              onClick={disableAll}
              className={styles.actionBtn}
              aria-label={tx("Nonaktifkan Semua Channel", "Disable All Channels")}
            >
              <EyeOff size={16} color="#ef4444" />
              {tx("Nonaktifkan Semua", "Disable All")}
            </button>
            <Link href="/tv" className={styles.actionBtnPrimary}>
              {tx("Buka Sena TV", "Watch Sena TV")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{tx("Total Channel", "Total Channels")}</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{tx("Aktif", "Active")}</span>
            <span className={`${styles.statValue} ${styles.statValueGreen}`}>
              {isLoaded ? activeCount : "..."}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{tx("Nonaktif", "Disabled")}</span>
            <span className={`${styles.statValue} ${styles.statValueRed}`}>
              {isLoaded ? disabledCount : "..."}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>{tx("Tampil", "Showing")}</span>
            <span className={styles.statValue}>{visibleCount}</span>
          </div>
        </div>
      </section>

      {/* Controls: Search & Tags */}
      <section className={styles.controlsSection} aria-label={tx("Pencarian & Filter Channel", "Search and Filter")}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tx("Cari nama channel...", "Search channel name...")}
            className={styles.searchInput}
            aria-label={tx("Cari nama channel", "Search channel name")}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={styles.clearSearchBtn}
              aria-label={tx("Hapus pencarian", "Clear search")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className={styles.tagsScroll} role="toolbar" aria-label={tx("Filter Kategori Tag", "Tag Filters")}>
          {tagsList.map((tag) => (
            <button
              key={tag}
              type="button"
              className={selectedTag === tag ? `${styles.tagBtn} ${styles.tagBtnActive}` : styles.tagBtn}
              onClick={() => setSelectedTag(tag)}
              aria-pressed={selectedTag === tag}
            >
              {tag === "all" ? tx("Semua Tag", "All Tags") : `#${tag}`}
            </button>
          ))}
        </div>
      </section>

      {/* Channels Grid */}
      {visibleCount === 0 ? (
        <div className={styles.emptyBox}>
          <div className={styles.emptyEmoji}>📺</div>
          <h2 className={styles.emptyTitle}>{tx("Channel Tidak Ditemukan", "No Channels Found")}</h2>
          <p className={styles.emptyText}>
            {tx("Coba gunakan kata kunci pencarian lain atau pilih tag lain.", "Try using another search query or selecting a different tag.")}
          </p>
        </div>
      ) : (
        <div className={styles.channelsGrid}>
          {filteredChannels.map((channel) => {
            const isDisabled = Boolean(blacklistMap[channel.id]) || Boolean(blacklistMap[channel.name]);
            const isEnabled = !isDisabled;

            return (
              <div
                key={channel.id}
                className={`${styles.channelCard} ${isDisabled ? styles.channelCardDisabled : ""}`}
              >
                <div className={styles.channelMain}>
                  <ChannelAvatar name={channel.name} imageUrl={channel.image_url} />
                  <div className={styles.channelMeta}>
                    <h2 className={styles.channelName} title={channel.name}>
                      {channel.name}
                    </h2>
                    <div className={styles.channelTags}>
                      {(channel.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tagBadge}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.switchContainer}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => toggleChannel(channel)}
                      aria-label={`${channel.name} ${isEnabled ? tx("Aktif", "Active") : tx("Nonaktif", "Disabled")}`}
                    />
                    <span className={styles.slider} />
                  </label>
                  <span className={styles.switchStatusText}>
                    {isEnabled ? tx("Aktif", "Active") : tx("Nonaktif", "Disabled")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
