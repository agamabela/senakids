"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Progress state (XP / Gems / Hearts / Streak / Crowns)
// ---------------------------------------------------------------------------
// A tiny zustand store persisted to localStorage. Kept intentionally forgiving:
// hearts refill on a new day and losing all hearts never blocks play (per GDD
// "no fail state"). Crowns store the best result earned per lesson.
// ═══════════════════════════════════════════════════════════════════════════

import { create } from "zustand";

const KEY = "owly-progress-v1";
const MAX_HEARTS = 5;

const todayStr = () => new Date().toISOString().slice(0, 10);

const defaultState = {
  xp: 0,
  gems: 0,
  hearts: MAX_HEARTS,
  streak: 0,
  crowns: {},        // { "1.1": "gold" | "silver" | "bronze" }
  lastPlayed: null,  // ISO date string
  heartsDay: todayStr(),
};

function load() {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...defaultState };
    const saved = { ...defaultState, ...JSON.parse(raw) };
    // Refill hearts once per calendar day.
    if (saved.heartsDay !== todayStr()) {
      saved.hearts = MAX_HEARTS;
      saved.heartsDay = todayStr();
    }
    return saved;
  } catch {
    return { ...defaultState };
  }
}

function persist(state) {
  if (typeof window === "undefined") return;
  try {
    const { xp, gems, hearts, streak, crowns, lastPlayed, heartsDay } = state;
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ xp, gems, hearts, streak, crowns, lastPlayed, heartsDay })
    );
  } catch {
    // ignore quota / private-mode errors
  }
}

const CROWN_RANK = { bronze: 1, silver: 2, gold: 3 };

export const useOwlyProgress = create((set, get) => ({
  ...defaultState,
  hydrated: false,

  // Load persisted values on the client (call once from the page).
  hydrate: () => {
    if (get().hydrated) return;
    set({ ...load(), hydrated: true });
  },

  addXp: (amount) => {
    set((s) => {
      const next = { ...s, xp: s.xp + amount };
      persist(next);
      return next;
    });
  },

  addGems: (amount) => {
    set((s) => {
      const next = { ...s, gems: s.gems + amount };
      persist(next);
      return next;
    });
  },

  loseHeart: () => {
    set((s) => {
      const next = { ...s, hearts: Math.max(0, s.hearts - 1) };
      persist(next);
      return next;
    });
  },

  // Record a finished lesson: bump streak (once per day), keep the best crown.
  finishLesson: (lessonId, crownKey, xpEarned, gemsEarned) => {
    set((s) => {
      const today = todayStr();
      let streak = s.streak;
      if (s.lastPlayed !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        streak = s.lastPlayed === yesterday ? s.streak + 1 : 1;
      }
      const prev = s.crowns[lessonId];
      const keepBest = !prev || CROWN_RANK[crownKey] > CROWN_RANK[prev] ? crownKey : prev;
      const next = {
        ...s,
        xp: s.xp + xpEarned,
        gems: s.gems + gemsEarned,
        streak,
        lastPlayed: today,
        crowns: { ...s.crowns, [lessonId]: keepBest },
      };
      persist(next);
      return next;
    });
  },

  reset: () => {
    const fresh = { ...defaultState };
    persist(fresh);
    set(fresh);
  },
}));

export { MAX_HEARTS };
