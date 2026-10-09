import { LETS_READ_STORIES } from "@/lib/content-registry";

// Stable truthful modification date for release snapshot
const RELEASE_DATE = new Date("2026-10-01T00:00:00.000Z");

export default function sitemap() {
  // Use explicit public site URL - never leak localhost into public sitemaps
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";

  const staticRoutes = [
    { url: `${baseUrl}/home`, lastModified: RELEASE_DATE, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/books`, lastModified: RELEASE_DATE, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/buku-cerita`, lastModified: RELEASE_DATE, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tv`, lastModified: RELEASE_DATE, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/games`, lastModified: RELEASE_DATE, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/games/maze`, lastModified: RELEASE_DATE, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/create`, lastModified: RELEASE_DATE, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/owly`, lastModified: RELEASE_DATE, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/belajar-membaca`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sejarah-sepeda`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/petualangan-tetes-air`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/mengenal-hujan`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/parents`, lastModified: RELEASE_DATE, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: RELEASE_DATE, changeFrequency: "monthly", priority: 0.6 },
  ];

  const storyRoutes = LETS_READ_STORIES.map((story) => ({
    url: `${baseUrl}/books/stories/${story.slug}`,
    lastModified: RELEASE_DATE,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const builtInGameSlugs = [
    "drum",
    "piano",
    "membuat-jalur",
    "flashcard-simple",
    "petualangan-labirin",
    "ular-tangga",
    "ski-pagi",
    "labirin-3d",
    "bomberman",
    "astronot-terbang",
    "ular-pintar",
    "ludo",
    "petualangan-lompat",
    "pukul-tikus",
    "simon-bilang",
    "letuskan-balon",
    "puzzle-gambar",
    "warna",
    "mewarnai",
    "berhitung",
    "huruf-abc",
    "lacak-huruf",
    "lacak-angka",
    "learn-english-1",
    "tebak-gambar",
    "mencocokkan-gambar",
    "menyabung-pipa",
    "menyusun-gambar",
    "mengurutkan-balok",
    "urutkan-bola-angka",
    "quiz",
    "block-blast",
    "cari-kata",
    "sambung-warna",
    "zip-path",
    "topple-party",
    "timbangan-angka",
    "membandingkan",
    "pecahan-lingkaran",
    "penjumlahan",
    "pengurangan",
    "angka-negatif",
    "perkalian",
    "morse",
    "memahami-koordinat",
  ];

  const gameRoutes = builtInGameSlugs.map((slug) => ({
    url: `${baseUrl}/games/built/${slug}`,
    lastModified: RELEASE_DATE,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...storyRoutes, ...gameRoutes];
}
