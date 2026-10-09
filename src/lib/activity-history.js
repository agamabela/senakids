"use client";

import { useState, useEffect, useCallback } from "react";

const HISTORY_STORAGE_KEY = "senakids_history_v2";
const HISTORY_COOKIE_KEY = "senakids_history";
const HISTORY_EVENT_NAME = "senakids-history-change";
const MAX_HISTORY_ITEMS = 24;

/**
 * Helper to safely write a compact list to cookies (30 days)
 * fulfilling cookie synchronization requested by the user.
 */
function syncCookie(items) {
  if (typeof document === "undefined") return;
  try {
    const compact = items.slice(0, 10).map((it) => ({
      id: it.id,
      t: it.type,
      h: it.href,
      n: it.title,
    }));
    const val = encodeURIComponent(JSON.stringify(compact));
    document.cookie = `${HISTORY_COOKIE_KEY}=${val}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {
    // Cookie failures in restricted webviews are silently ignored
  }
}

/**
 * Read all history items from localStorage (with cookie fallback).
 */
export function getHistory(filterType = "all") {
  if (typeof window === "undefined") return [];

  try {
    let items = [];
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } else {
      // Fallback check from cookie if localStorage is blank
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${HISTORY_COOKIE_KEY}=`));
      if (match) {
        const val = decodeURIComponent(match.split("=")[1] || "[]");
        const parsedCookie = JSON.parse(val);
        if (Array.isArray(parsedCookie)) {
          items = parsedCookie.map((c) => ({
            id: c.id,
            type: c.t,
            href: c.h,
            title: c.n,
            visitedAt: Date.now(),
          }));
        }
      }
    }

    if (filterType === "all") return items;
    return items.filter((item) => item.type === filterType);
  } catch {
    return [];
  }
}

/**
 * Add or update an activity item in the history.
 */
export function addHistory({
  id,
  type = "game",
  title,
  href,
  image = "",
  emoji = "",
  color = "primary",
  label = "",
}) {
  if (typeof window === "undefined" || !href || !title) return;

  try {
    const itemId = id || `${type}-${href}`;
    const all = getHistory("all");

    // Remove existing entry for deduplication
    const filtered = all.filter((it) => it.id !== itemId && it.href !== href);

    const newItem = {
      id: itemId,
      type,
      title: typeof title === "object" ? title.id || title.en : String(title),
      href,
      image: image || "",
      emoji: emoji || (type === "game" ? "🎮" : type === "book" ? "📖" : "📺"),
      color: color || "primary",
      label:
        label ||
        (type === "game"
          ? "Game"
          : type === "book"
          ? "Buku"
          : type === "tv"
          ? "Sena TV"
          : "Aktivitas"),
      visitedAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    syncCookie(updated);

    // Notify listeners in same tab
    window.dispatchEvent(new Event(HISTORY_EVENT_NAME));
  } catch {
    // LocalStorage quota or private mode protection
  }
}

/**
 * Remove an item by ID or href.
 */
export function removeHistoryItem(idOrHref) {
  if (typeof window === "undefined" || !idOrHref) return;

  try {
    const all = getHistory("all");
    const updated = all.filter(
      (it) => it.id !== idOrHref && it.href !== idOrHref
    );

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    syncCookie(updated);
    window.dispatchEvent(new Event(HISTORY_EVENT_NAME));
  } catch {}
}

/**
 * Clear history (optionally by category).
 */
export function clearHistory(filterType = "all") {
  if (typeof window === "undefined") return;

  try {
    if (filterType === "all") {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      syncCookie([]);
    } else {
      const all = getHistory("all");
      const updated = all.filter((it) => it.type !== filterType);
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      syncCookie(updated);
    }
    window.dispatchEvent(new Event(HISTORY_EVENT_NAME));
  } catch {}
}

/**
 * React hook to reactively subscribe to activity history.
 */
export function useActivityHistory(filterType = "all") {
  const [history, setHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setHistory(getHistory(filterType));
    setIsLoaded(true);
  }, [filterType]);

  useEffect(() => {
    refresh();

    const handleCustomChange = () => refresh();
    const handleStorageChange = (e) => {
      if (e.key === HISTORY_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(HISTORY_EVENT_NAME, handleCustomChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(HISTORY_EVENT_NAME, handleCustomChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refresh]);

  const removeItem = useCallback((idOrHref) => {
    removeHistoryItem(idOrHref);
  }, []);

  const clearAll = useCallback(() => {
    clearHistory(filterType);
  }, [filterType]);

  return { history, isLoaded, removeItem, clearAll, refresh };
}

const BUILT_GAME_NAMES = {
  drum: { title: "Drum", emoji: "🥁", color: "purple" },
  "membuat-jalur": { title: "Membuat Jalur", emoji: "🧭", color: "blue" },
  "learn-english-1": { title: "Learn English 1", emoji: "📘", color: "green" },
  "flashcard-simple": { title: "Flashcard Simple", emoji: "🃏", color: "orange" },
  "tebak-gambar": { title: "Tebak Gambar", emoji: "🖼️", color: "pink" },
  "mencocokkan-gambar": { title: "Mencocokkan Gambar", emoji: "🧠", color: "teal" },
  "menyabung-pipa": { title: "Menyambung Pipa", emoji: "🔧", color: "yellow" },
  "menyusun-gambar": { title: "Menyusun Gambar", emoji: "🧩", color: "blue" },
  "mengurutkan-balok": { title: "Mengurutkan Balok", emoji: "🟦", color: "green" },
  "urutkan-bola-angka": { title: "Urutkan Bola Angka", emoji: "⚽", color: "orange" },
  quiz: { title: "Quiz Pintar", emoji: "🧠", color: "purple" },
  berhitung: { title: "Matematika Dasar", emoji: "🔢", color: "blue" },
  mewarnai: { title: "Mewarnai", emoji: "🖌️", color: "pink" },
  "huruf-abc": { title: "Huruf ABC", emoji: "🔤", color: "green" },
  warna: { title: "Menggambar Bebas", emoji: "🎨", color: "orange" },
  piano: { title: "Piano", emoji: "🎹", color: "purple" },
  "petualangan-labirin": { title: "Petualangan Labirin", emoji: "💎", color: "blue" },
  "labirin-3d": { title: "Labirin 3D", emoji: "🧊", color: "green" },
  bomberman: { title: "Si Bom Pintar", emoji: "💣", color: "orange" },
  "astronot-terbang": { title: "Astronot Terbang", emoji: "🚀", color: "blue" },
  "ular-pintar": { title: "Ular Pintar", emoji: "🐍", color: "green" },
  ludo: { title: "Ludo", emoji: "🎲", color: "purple" },
  "ular-tangga": { title: "Ular Tangga", emoji: "🪜", color: "teal" },
  "lacak-huruf": { title: "Lacak Huruf", emoji: "✏️", color: "blue" },
  "lacak-angka": { title: "Lacak Angka", emoji: "🔢", color: "green" },
  "puzzle-gambar": { title: "Puzzle Gambar", emoji: "🧩", color: "orange" },
  "pukul-tikus": { title: "Pukul Tikus", emoji: "🔨", color: "pink" },
  "simon-bilang": { title: "Simon Bilang", emoji: "🎨", color: "purple" },
  "letuskan-balon": { title: "Letuskan Balon", emoji: "🎈", color: "teal" },
  "petualangan-lompat": { title: "Petualangan Lompat", emoji: "🦊", color: "green" },
  "ski-free": { title: "Ski Free", emoji: "⛷️", color: "blue" },
  "timbangan-angka": { title: "Timbangan Angka", emoji: "⚖️", color: "orange" },
  "block-blast": { title: "Block Blast", emoji: "🧱", color: "purple" },
  "cari-kata": { title: "Cari Kata", emoji: "🔍", color: "blue" },
  "sambung-warna": { title: "Sambung Warna", emoji: "🟣", color: "pink" },
  "zip-path": { title: "Zip Path", emoji: "⚡", color: "yellow" },
  "topple-party": { title: "Topple Party", emoji: "⚖️", color: "teal" },
  membandingkan: { title: "Membandingkan", emoji: "⚖️", color: "blue" },
  "pecahan-lingkaran": { title: "Pecahan Lingkaran", emoji: "🥧", color: "teal" },
  penjumlahan: { title: "Penjumlahan", emoji: "➕", color: "green" },
  pengurangan: { title: "Pengurangan", emoji: "➖", color: "red" },
  "angka-negatif": { title: "Angka Negatif", emoji: "🧭", color: "blue" },
  perkalian: { title: "Perkalian Dasar", emoji: "✖️", color: "yellow" },
  morse: { title: "Kode Morse Memori", emoji: "📻", color: "purple" },
  "memahami-koordinat": { title: "Memahami Koordinat", emoji: "📍", color: "purple" },
};

/**
 * Automatically inspect a visited pathname and record high-fidelity history
 * even when the user lands via direct URL, bookmark, or page reload.
 */
export function autoRecordRoute(pathname) {
  if (typeof window === "undefined" || !pathname) return;

  // 1. Built-in games
  if (pathname.startsWith("/games/built/")) {
    const slug = pathname.replace("/games/built/", "").split("/")[0].split("?")[0];
    const info = BUILT_GAME_NAMES[slug];
    const title = info?.title || slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    addHistory({
      id: `game-${pathname}`,
      type: "game",
      title,
      href: pathname,
      emoji: info?.emoji || "🎮",
      color: info?.color || "primary",
      label: "Game",
    });
    return;
  }

  // 2. Specific landmark games
  if (pathname.startsWith("/games/maze")) {
    addHistory({
      id: "game-maze",
      type: "game",
      title: "Petualangan Labirin",
      href: "/games/maze",
      image: "/images/games/maze/thumbnail.png",
      emoji: "💎",
      color: "blue",
      label: "Game",
    });
    return;
  }

  if (pathname.startsWith("/games/ski-free")) {
    addHistory({
      id: "game-ski-free",
      type: "game",
      title: "Ski Free",
      href: "/games/ski-free",
      image: "/images/ski-pagi-key-art-v2.png",
      emoji: "⛷️",
      color: "blue",
      label: "Game",
    });
    return;
  }

  // 3. Creative Canvas
  if (pathname.startsWith("/create")) {
    addHistory({
      id: "game-create",
      type: "game",
      title: "Kanvas Seni & Mewarnai",
      href: "/create",
      emoji: "🎨",
      color: "pink",
      label: "Aktivitas",
    });
    return;
  }

  // 4. Books and interactive stories
  if (pathname.startsWith("/books/stories/")) {
    const slug = pathname.replace("/books/stories/", "").split("/")[0].split("?")[0];
    const formatted = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    addHistory({
      id: `book-${slug}`,
      type: "book",
      title: formatted,
      href: pathname,
      emoji: "📖",
      color: "forest",
      label: "Buku Cerita",
    });
    return;
  }

  if (pathname.startsWith("/belajar-membaca")) {
    addHistory({
      id: "book-belajar-membaca",
      type: "book",
      title: "Belajar Membaca Fonik",
      href: "/belajar-membaca",
      emoji: "🔤",
      color: "teal",
      label: "Buku",
    });
    return;
  }

  if (pathname.startsWith("/petualangan-tetes-air")) {
    addHistory({
      id: "book-petualangan-tetes-air",
      type: "book",
      title: "Petualangan Tetes Air",
      href: "/petualangan-tetes-air",
      emoji: "💧",
      color: "blue",
      label: "Buku Cerita",
    });
    return;
  }

  if (pathname.startsWith("/mengenal-hujan")) {
    addHistory({
      id: "book-mengenal-hujan",
      type: "book",
      title: "Mengenal Hujan",
      href: "/mengenal-hujan",
      emoji: "🌧️",
      color: "pink",
      label: "Buku Cerita",
    });
    return;
  }

  if (pathname.startsWith("/sejarah-sepeda")) {
    addHistory({
      id: "book-sejarah-sepeda",
      type: "book",
      title: "Sejarah Sepeda",
      href: "/sejarah-sepeda",
      emoji: "🚲",
      color: "amber",
      label: "Buku Cerita",
    });
    return;
  }

  // 5. Owly lesson
  if (pathname.startsWith("/owly")) {
    addHistory({
      id: "lesson-owly",
      type: "lesson",
      title: "Belajar bersama Owly",
      href: "/owly",
      emoji: "🦉",
      color: "amber",
      label: "Pelajaran",
    });
  }
}
