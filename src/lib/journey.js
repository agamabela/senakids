const ACTIVITY_KEY = "senakids-activity-v1";
const CHALLENGE_KEY = "senakids-daily-challenge-v1";
const MAX_ITEMS = 8;

const routeDetails = (pathname) => {
  if (pathname.startsWith("/books/stories/")) {
    return { title: "Lanjutkan cerita", label: "Buku cerita", kind: "book", href: pathname };
  }
  if (pathname.startsWith("/books") || pathname.startsWith("/buku-cerita")) {
    return { title: "Pilih buku berikutnya", label: "Perpustakaan", kind: "book", href: pathname };
  }
  if (pathname.startsWith("/tv")) {
    return { title: "Lanjutkan menonton", label: "Sena TV", kind: "tv", href: pathname };
  }
  if (pathname.startsWith("/games/built/")) {
    return { title: "Lanjutkan permainan", label: "Game Sena Kids", kind: "game", href: pathname };
  }
  if (pathname.startsWith("/games")) {
    return { title: "Pilih permainan", label: "Katalog game", kind: "game", href: pathname };
  }
  if (pathname.startsWith("/owly")) {
    return { title: "Lanjutkan pelajaran Owly", label: "Owly", kind: "lesson", href: pathname };
  }
  return null;
};

export function readActivity() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ACTIVITY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.href && item?.title) : [];
  } catch {
    return [];
  }
}

export function recordActivity(pathname) {
  if (typeof window === "undefined") return;
  const next = routeDetails(pathname);
  if (!next) return;

  try {
    const items = readActivity().filter((item) => item.href !== next.href);
    window.localStorage.setItem(
      ACTIVITY_KEY,
      JSON.stringify([{ ...next, visitedAt: Date.now() }, ...items].slice(0, MAX_ITEMS))
    );
    window.dispatchEvent(new Event("senakids-activity-change"));
  } catch {
    // Private browsing can disable local storage. The dashboard remains usable without history.
  }
}

export function readDailyCompletion() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CHALLENGE_KEY);
  } catch {
    return null;
  }
}

export function saveDailyCompletion(dayKey) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHALLENGE_KEY, dayKey);
    window.dispatchEvent(new Event("senakids-daily-challenge-change"));
  } catch {
    // Completion is an optional local convenience, not required to use the challenge.
  }
}

export function todayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export const DAILY_ACTIVITIES = [
  {
    title: "Labirin permata",
    description: "Cari jalan menuju permata di Petualangan Labirin.",
    kind: "game",
    href: "/games/built/petualangan-labirin",
  },
  {
    title: "Cerita pilihan hari ini",
    description: "Baca cerita bergambar dan pilih bagian yang paling kamu suka.",
    kind: "book",
    href: "/books",
  },
  {
    title: "Irama sederhana",
    description: "Buat pola bunyi pendek dengan drum interaktif.",
    kind: "game",
    href: "/games/built/drum",
  },
  {
    title: "Petualangan Belajar",
    description: "Buka satu jalur belajar dan temukan pengetahuan seru hari ini.",
    kind: "lesson",
    href: "/learning-journeys",
  },
  {
    title: "Tonton dan ceritakan",
    description: "Pilih video edukasi, lalu ceritakan satu hal yang kamu ingat.",
    kind: "tv",
    href: "/tv",
  },
];

export function getDailyActivity(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return DAILY_ACTIVITIES[day % DAILY_ACTIVITIES.length];
}
