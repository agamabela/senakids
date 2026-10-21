import { LETS_READ_STORIES } from "@/lib/content-registry";
import { BLOG_POSTS } from "@/lib/blog-posts.mjs";
import { getSiteUrl } from "@/lib/site-url";


export default function sitemap() {
  // Use explicit public site URL - never leak localhost into public sitemaps
  const baseUrl = getSiteUrl();

  const staticRoutes = [
    { url: `${baseUrl}/learning-journeys`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/games/ski-free`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/books`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/buku-cerita`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tv`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/channels`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/games`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/games/maze`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/create`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/owly`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/belajar-membaca`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sejarah-sepeda`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/petualangan-tetes-air`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/mengenal-hujan`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/parents`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(BLOG_POSTS[0].datePublished), changeFrequency: "weekly", priority: 0.8 },
  ];

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.datePublished),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const storyRoutes = LETS_READ_STORIES.map((story) => ({
    url: `${baseUrl}/books/stories/${story.slug}`,
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
    "the-aviator",
    "toy-car",
  ];

  const gameRoutes = builtInGameSlugs.map((slug) => ({
    url: `${baseUrl}/games/built/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...storyRoutes, ...gameRoutes];
}
