/**
 * Sena Kids Content Registry & Security Governance
 * 
 * Provides centralized, editorial-reviewed content metadata and strict
 * origin allowlists for external embeds, TV videos, and Let's Read stories.
 */

// Approved external iframe origins (Strict HTTPS)
export const ALLOWED_EXTERNAL_ORIGINS = [
  "https://kindahardgolf.com",
  "https://plastelina.net",
  "https://game.rodocodo.com",
  "https://genshin-music.specy.app",
  "https://toytheater.com",
  "https://www.toytheater.com",
  "https://letsreadasia.org",
  "https://www.letsreadasia.org",
];

// Approved Toy Theater game identifiers
export const APPROVED_TOYTHEATER_GAMES = [
  "basketball",
  "fruit-fall",
  "balloon-pop",
  "inch-worm",
  "subitizing-seeds",
  "fishing",
  "bingo",
  "bowling",
  "marbles",
  "cowboy",
  "apple-island",
  "kayak",
  "feed-freddy",
  "shake-and-spill",
  "addition-mine",
  "weightlifter",
  "amazon-addition",
  "popcorn",
  "math-flash-cards",
];

/**
 * Validates whether an external game URL belongs to an approved HTTPS origin.
 * Rejects javascript:, data:, file:, http:, or unknown domain targets.
 */
export function validateGameUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { allowed: false, error: "URL tidak valid atau kosong" };
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") {
      return { allowed: false, error: "Hanya protokol HTTPS aman yang diizinkan" };
    }

    const origin = parsed.origin.toLowerCase();
    const isAllowed = ALLOWED_EXTERNAL_ORIGINS.some(
      (allowed) => origin === allowed.toLowerCase()
    );

    if (!isAllowed) {
      return {
        allowed: false,
        error: `Domain ${origin} belum masuk dalam daftar domain yang disetujui untuk anak-anak`,
      };
    }

    return { allowed: true, url: parsed.toString(), origin };
  } catch (err) {
    return { allowed: false, error: "Format URL tidak valid" };
  }
}

/**
 * Validates a toy theater game name
 */
export function validateToyTheaterGame(gameName) {
  if (!gameName || typeof gameName !== "string") return false;
  const clean = gameName.trim().toLowerCase();
  return APPROVED_TOYTHEATER_GAMES.includes(clean);
}

// ==========================================
// 1. Curated Let's Read Asia Storybooks
// ==========================================
export const LETS_READ_STORIES = [
  {
    id: "b2dfb64f-5b97-4697-86f3-f1f583e08553",
    slug: "jangan-sampai-ibu-tahu",
    title: { id: "Jangan Sampai Ibu Tahu", en: "Don't Let Mom Know" },
    description: {
      id: "Rowa ingin memelihara binatang, tetapi Ibu selalu melarang.",
      en: "Rowa wants a pet, but Mom always says no.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ec7bc4ff-67a2-4cd8-8c55-edce3039011a.png",
    url: "https://www.letsreadasia.org/read/b2dfb64f-5b97-4697-86f3-f1f583e08553?bookLang=6260074016145408",
    color: "#C25732",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Hewan", "Keluarga", "Kasih Sayang"],
    enabled: true,
  },
  {
    id: "f6f494dc-18f3-4352-a128-7857ef65fbcb",
    slug: "tangan-tangan-ajaib",
    title: { id: "Tangan-Tangan Ajaib", en: "Magic Hands" },
    description: {
      id: "Tangan Kakek bisa membuat kejutan dan menyulap hal biasa menjadi luar biasa.",
      en: "Grandpa's hands can make wonderful surprises and turn everyday things into magic.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5948a5e4-c050-4fa2-9b8c-2a7c1f09c903.png",
    url: "https://www.letsreadasia.org/read/f6f494dc-18f3-4352-a128-7857ef65fbcb?bookLang=6260074016145408",
    color: "#3D7843",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Keluarga", "Kreativitas"],
    enabled: true,
  },
  {
    id: "95199e3a-5387-495f-82bd-2f1d52b6eeda",
    slug: "kapan-kapal-datang",
    title: { id: "Kapan Kapal Datang", en: "When Will the Ship Arrive?" },
    description: {
      id: "Ela menunggu kapal perintis yang membawa sepatu barunya.",
      en: "Ela waits for the pioneer ship carrying her brand new shoes.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/6637613c-e7c8-4f83-bdef-cec376961d3b.png",
    url: "https://www.letsreadasia.org/read/95199e3a-5387-495f-82bd-2f1d52b6eeda?bookLang=6260074016145408",
    color: "#2A6F97",
    readingLevel: 2,
    minAge: 6,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Petualangan", "Kesabaran"],
    enabled: true,
  },
  {
    id: "6388940d-11a3-470b-8ae6-85080ebb60dd",
    slug: "setelah-kami-pindah",
    title: { id: "Setelah Kami Pindah", en: "After We Moved" },
    description: {
      id: "Ikuti petualangan tinggal di rumah baru yang sering berguncang.",
      en: "An adventure living in a new house that often rumbles.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/b58422bf-a795-460e-969e-71f7afbdf815.png",
    url: "https://www.letsreadasia.org/read/6388940d-11a3-470b-8ae6-85080ebb60dd?bookLang=6260074016145408",
    color: "#8A4F7D",
    readingLevel: 2,
    minAge: 5,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Keluarga", "Adaptasi"],
    enabled: true,
  },
  {
    id: "c1c6efc0-84ff-46ae-b05c-d483b73fc844",
    slug: "yang-penting-selesai",
    title: { id: "Yang Penting Selesai", en: "Finishing Is What Matters" },
    description: {
      id: "Aku harus menata banyak kue sebelum melihat anak sapi di rumah Nenek.",
      en: "Finishing the cakes before visiting Grandma's calf.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/398ef646-a846-4d81-9257-609250c6f5d2.png",
    url: "https://www.letsreadasia.org/read/c1c6efc0-84ff-46ae-b05c-d483b73fc844?bookLang=6260074016145408",
    color: "#A85368",
    readingLevel: 2,
    minAge: 5,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Tanggung Jawab", "Keluarga"],
    enabled: true,
  },
  {
    id: "216a0037-d8b1-489e-94ef-0e1d9d30bc31",
    slug: "kue-jadah-tujuh-warna",
    title: { id: "Kue Jadah Tujuh Warna", en: "Seven-Colored Jadah Cake" },
    description: {
      id: "Ajeng penasaran seperti apa rasa kue jadah tujuh warna.",
      en: "Ajeng wonders what the seven-colored traditional jadah cake tastes like.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ab0ba2df-806c-448e-bb8c-1fc1b62a6dd6.png",
    url: "https://www.letsreadasia.org/read/216a0037-d8b1-489e-94ef-0e1d9d30bc31?bookLang=6260074016145408",
    color: "#BD5B32",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Tradisi", "Kuliner"],
    enabled: true,
  },
  {
    id: "82d7d3f1-2ab2-4933-b99a-d2d3e7258321",
    slug: "takut",
    title: { id: "Takut", en: "Afraid" },
    description: {
      id: "Tiki ingin bermain di taman bermain di tengah hutan.",
      en: "Tiki wants to play at the playground deep in the forest.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/53132d2a-4932-41c0-97ad-75a81e3ec488.png",
    url: "https://www.letsreadasia.org/read/82d7d3f1-2ab2-4933-b99a-d2d3e7258321?bookLang=6260074016145408",
    color: "#2F7C77",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Keberanian", "Hewan"],
    enabled: true,
  },
  {
    id: "12f23f06-d786-4901-bbf8-51a0ceeab3b4",
    slug: "tolong-mintakan-durian",
    title: { id: "Tolong Mintakan Durian", en: "Please Ask for a Durian" },
    description: {
      id: "Tapir ingin meminta durian kepada Paman Harimau, tetapi takut.",
      en: "Tapir wants to ask Uncle Tiger for a durian, but is afraid.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ed45b036-aa46-4151-928a-d6a53fbb8b43.png",
    url: "https://www.letsreadasia.org/read/12f23f06-d786-4901-bbf8-51a0ceeab3b4?bookLang=6260074016145408",
    color: "#72AB79",
    readingLevel: 2,
    minAge: 5,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Hewan", "Keberanian"],
    enabled: true,
  },
  {
    id: "f319a94e-6dd0-4d7d-b1a0-09c1080c38f5",
    slug: "sempat-tidak-ya",
    title: { id: "Sempat Tidak, ya", en: "Is There Enough Time?" },
    description: {
      id: "Sebuah cerita tentang mencari waktu untuk hal-hal yang penting.",
      en: "A thoughtful story about making time for things that matter.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/71328334-8e56-4b71-a11a-f51591b3a9e5.png",
    url: "https://www.letsreadasia.org/read/f319a94e-6dd0-4d7d-b1a0-09c1080c38f5?bookLang=6260074016145408",
    color: "#A8681A",
    readingLevel: 2,
    minAge: 6,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Waktu", "Kebiasaan Baik"],
    enabled: true,
  },
  {
    id: "fa998b7a-149c-44a6-ac6b-245e7196d587",
    slug: "menggambar-kakek",
    title: { id: "Menggambar Kakek", en: "Drawing Grandpa" },
    description: {
      id: "Isa harus menggambar Kakek, tetapi belum pernah bertemu dengannya.",
      en: "Isa has to draw Grandpa, but has never met him.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/1c43a9c6-002a-4516-a31a-d14546da5e1e.png",
    url: "https://www.letsreadasia.org/read/fa998b7a-149c-44a6-ac6b-245e7196d587?bookLang=6260074016145408",
    color: "#784E7B",
    readingLevel: 2,
    minAge: 5,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Keluarga", "Seni"],
    enabled: true,
  },
  {
    id: "e62469e6-6d1f-4657-9e84-4ceb30b8e2c5",
    slug: "mencari-kuroki",
    title: { id: "Mencari Kuroki", en: "Looking for Kuroki" },
    description: {
      id: "Raya mencari Kuroki yang tidak ada di dekat kolam setelah hujan reda.",
      en: "Raya searches for Kuroki by the pond after the rain clears.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/47d6d30a-be48-47fc-a37b-da153360b4d0.png",
    url: "https://www.letsreadasia.org/read/e62469e6-6d1f-4657-9e84-4ceb30b8e2c5?bookLang=6260074016145408",
    color: "#2E6A8E",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Sahabat", "Hewan"],
    enabled: true,
  },
  {
    id: "99051e6f-3081-4a97-9d55-7bffd5d53e3d",
    slug: "gara-gara-hujan",
    title: { id: "Gara-gara Hujan", en: "Because of the Rain" },
    description: {
      id: "Perjalanan menuju pertandingan bulu tangkis di saat hujan deras.",
      en: "A rainy adventure on the way to a badminton match.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/15c6cc22-cd52-46a6-8a07-54e19ff38858.png",
    url: "https://www.letsreadasia.org/read/99051e6f-3081-4a97-9d55-7bffd5d53e3d?bookLang=6260074016145408",
    color: "#2A6F97",
    readingLevel: 2,
    minAge: 6,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Olahraga", "Semangat"],
    enabled: true,
  },
  {
    id: "8f0e6b5e-b518-4011-b296-d795634ced03",
    slug: "ketika-musim-ulat-jati",
    title: { id: "Ketika Musim Ulat Jati", en: "Teak Caterpillar Season" },
    description: {
      id: "Nono mencari cara melindungi diri dari ulat jati saat payungnya rusak.",
      en: "Nono finds a clever way to protect himself during caterpillar season.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5462fd0d-ccbe-476a-84d2-547f31e22cbd.png",
    url: "https://www.letsreadasia.org/read/8f0e6b5e-b518-4011-b296-d795634ced03?bookLang=6260074016145408",
    color: "#3D7843",
    readingLevel: 2,
    minAge: 6,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Alam", "Kecerdikan"],
    enabled: true,
  },
  {
    id: "9dd061fa-4441-4290-a52c-e81682042916",
    slug: "cacing-untuk-memancing",
    title: { id: "Cacing untuk Memancing", en: "Worms for Fishing" },
    description: {
      id: "Nino harus mencari cacing untuk memancing setelah tongkatnya patah.",
      en: "Nino looks for earthworms to fish after his fishing rod breaks.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/3b1aa54c-5ae7-4fd8-8b98-40c51c8a822e.png",
    url: "https://www.letsreadasia.org/read/9dd061fa-4441-4290-a52c-e81682042916?bookLang=6260074016145408",
    color: "#BD5B32",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Alam", "Kegigihan"],
    enabled: true,
  },
  {
    id: "0a56cbe6-8b75-4d93-b078-025933f26c9a",
    slug: "ada-sesuatu-di-kamar-mandi",
    title: { id: "Ada Sesuatu di Kamar Mandi", en: "Something Is in the Bathroom" },
    description: {
      id: "Saat listrik padam, Feri melihat sepasang mata di kamar mandi.",
      en: "During a blackout, Feri notices a mysterious pair of glowing eyes.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/20b7ea01-4597-4e05-b410-6e44583e1282.png",
    url: "https://www.letsreadasia.org/read/0a56cbe6-8b75-4d93-b078-025933f26c9a?bookLang=6260074016145408",
    color: "#2E6A8E",
    readingLevel: 2,
    minAge: 5,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Imajinasi", "Rasa Ingin Tahu"],
    enabled: true,
  },
  {
    id: "304c2b92-a109-46c4-98ea-dae7c66ec3e0",
    slug: "mencari-emak",
    title: { id: "Mencari Emak", en: "Looking for Mother" },
    description: {
      id: "Mona bersepeda ke kampung sebelah untuk mengantarkan tas rias Emak.",
      en: "Mona rides her bicycle to deliver Mother's bag to the next village.",
    },
    cover: "https://storage.googleapis.com/lets-read-asia/assets/images/753a086c-3cfd-4c3c-8a27-738115933c0d.png",
    url: "https://www.letsreadasia.org/read/304c2b92-a109-46c4-98ea-dae7c66ec3e0?bookLang=6260074016145408",
    color: "#A85368",
    readingLevel: 1,
    minAge: 4,
    author: "Let's Read Asia",
    publisher: "The Asia Foundation",
    license: "CC BY 4.0",
    topics: ["Keluarga", "Tolong Menolong"],
    enabled: true,
  },
];

// ==========================================
// 2. Interactive Learning Books
// ==========================================
export const INTERACTIVE_LEARNING_BOOKS = [
  {
    id: "learn-to-read",
    slug: "belajar-membaca",
    title: { id: "Belajar Membaca", en: "Learn to Read" },
    description: {
      id: "Latihan membaca rangkaian 3 huruf untuk pemula",
      en: "Three-letter word reading practice for beginners",
    },
    emoji: "📚",
    href: "/belajar-membaca",
    color: "yellow",
    readingLevel: 1,
    minAge: 4,
    skills: ["Membaca", "Fonik"],
    enabled: true,
  },
  {
    id: "bicycle-history",
    slug: "sejarah-sepeda",
    title: { id: "Sejarah Sepeda", en: "History of Bicycles" },
    description: {
      id: "Ensiklopedia seru tentang evolusi sepeda dari masa ke masa",
      en: "Fun illustrated encyclopedia of bicycle evolution",
    },
    emoji: "🚲",
    href: "/sejarah-sepeda",
    color: "green",
    readingLevel: 2,
    minAge: 6,
    skills: ["Sains", "Sejarah"],
    enabled: true,
  },
  {
    id: "water-drop-adventure",
    slug: "petualangan-tetes-air",
    title: { id: "Petualangan Tetes Air", en: "The Water Drop's Adventure" },
    description: {
      id: "Kisah edukatif memahami siklus air di bumi",
      en: "An educational journey through the natural water cycle",
    },
    emoji: "💧",
    href: "/petualangan-tetes-air",
    color: "blue",
    readingLevel: 2,
    minAge: 5,
    skills: ["Sains", "Alam"],
    enabled: true,
  },
  {
    id: "understanding-rain",
    slug: "mengenal-hujan",
    title: { id: "Mengenal Hujan", en: "All About Rain" },
    description: {
      id: "Penjelasan ramah anak proses terjadinya awan dan hujan",
      en: "Kid-friendly explanation of how clouds and rain form",
    },
    emoji: "🌧️",
    href: "/mengenal-hujan",
    color: "pink",
    readingLevel: 1,
    minAge: 4,
    skills: ["Sains", "Geografi"],
    enabled: true,
  },
];

// Helper to look up a storybook by its slug or ID
export function getStoryBySlug(slugOrId) {
  if (!slugOrId) return null;
  const target = slugOrId.toLowerCase();
  return (
    LETS_READ_STORIES.find(
      (s) => s.slug.toLowerCase() === target || s.id.toLowerCase() === target
    ) || null
  );
}

// ==========================================
// 3. Curated TV Channels & Educational Videos
// ==========================================
export const CURATED_TV_VIDEOS = [
  // Nussa
  {
    id: "n1",
    title: "Nussa: Belajar Ikhlas & Berbagi",
    channel: "Nussa",
    duration: "6:40",
    durationSeconds: 400,
    category: "Nussa",
    color: "var(--color-orange)",
    youtubeId: "0h9V6wZ_eXQ",
    url: "https://www.youtube.com/watch?v=0h9V6wZ_eXQ",
    minAge: 4,
    topics: ["Budi Pekerti", "Berbagi"],
    language: "id",
    enabled: true,
  },
  {
    id: "n2",
    title: "Nussa: Berani Berubah Menjadi Baik",
    channel: "Nussa",
    duration: "7:12",
    durationSeconds: 432,
    category: "Nussa",
    color: "var(--color-orange)",
    youtubeId: "kYJjQn-mU1Y",
    url: "https://www.youtube.com/watch?v=kYJjQn-mU1Y",
    minAge: 4,
    topics: ["Kebaikan", "Sikap"],
    language: "id",
    enabled: true,
  },
  {
    id: "n3",
    title: "Nussa: Adab Makan & Minum",
    channel: "Nussa",
    duration: "5:25",
    durationSeconds: 325,
    category: "Nussa",
    color: "var(--color-orange)",
    youtubeId: "wX-y4T3Y8y8",
    url: "https://www.youtube.com/watch?v=wX-y4T3Y8y8",
    minAge: 3,
    topics: ["Adab", "Kebiasaan Baik"],
    language: "id",
    enabled: true,
  },

  // Omar & Hana
  {
    id: "oh1",
    title: "Omar & Hana: Sayang Ibu Ayah",
    channel: "Omar & Hana",
    duration: "4:15",
    durationSeconds: 255,
    category: "Omar & Hana",
    color: "var(--color-pink)",
    youtubeId: "QZ0D23Y6zqk",
    url: "https://www.youtube.com/watch?v=QZ0D23Y6zqk",
    minAge: 3,
    topics: ["Keluarga", "Lagu"],
    language: "id",
    enabled: true,
  },
  {
    id: "oh2",
    title: "Omar & Hana: Mari Bersyukur Setiap Hari",
    channel: "Omar & Hana",
    duration: "5:02",
    durationSeconds: 302,
    category: "Omar & Hana",
    color: "var(--color-pink)",
    youtubeId: "Zf0W8dJg-Gk",
    url: "https://www.youtube.com/watch?v=Zf0W8dJg-Gk",
    minAge: 3,
    topics: ["Syukur", "Lagu"],
    language: "id",
    enabled: true,
  },
  {
    id: "oh3",
    title: "Omar & Hana: Tolong Menolong Sesama",
    channel: "Omar & Hana",
    duration: "4:48",
    durationSeconds: 288,
    category: "Omar & Hana",
    color: "var(--color-pink)",
    youtubeId: "k_qT-mZ6Z3g",
    url: "https://www.youtube.com/watch?v=k_qT-mZ6Z3g",
    minAge: 3,
    topics: ["Tolong Menolong", "Pertemanan"],
    language: "id",
    enabled: true,
  },

  // Riko The Series
  {
    id: "r1",
    title: "Riko The Series: Robot Pintar Penolong",
    channel: "Riko The Series",
    duration: "8:30",
    durationSeconds: 510,
    category: "Riko The Series",
    color: "var(--color-blue)",
    youtubeId: "6QoX7V-09m0",
    url: "https://www.youtube.com/watch?v=6QoX7V-09m0",
    minAge: 5,
    topics: ["Sains", "Teknologi"],
    language: "id",
    enabled: true,
  },
  {
    id: "r2",
    title: "Riko The Series: Sains & Gravitasi Bumi",
    channel: "Riko The Series",
    duration: "7:55",
    durationSeconds: 475,
    category: "Riko The Series",
    color: "var(--color-blue)",
    youtubeId: "x7K4w_9k8xY",
    url: "https://www.youtube.com/watch?v=x7K4w_9k8xY",
    minAge: 5,
    topics: ["Sains", "Fisika"],
    language: "id",
    enabled: true,
  },
  {
    id: "r3",
    title: "Riko The Series: Mengapa Ada Pelangi?",
    channel: "Riko The Series",
    duration: "6:18",
    durationSeconds: 378,
    category: "Riko The Series",
    color: "var(--color-blue)",
    youtubeId: "VzW5u-nZ66U",
    url: "https://www.youtube.com/watch?v=VzW5u-nZ66U",
    minAge: 4,
    topics: ["Sains", "Alam"],
    language: "id",
    enabled: true,
  },

  // Diva The Series
  {
    id: "d1",
    title: "Diva The Series: Mengenal Huruf & Angka",
    channel: "Diva The Series",
    duration: "6:05",
    durationSeconds: 365,
    category: "Diva The Series",
    color: "var(--color-teal)",
    youtubeId: "Kz49u398rL8",
    url: "https://www.youtube.com/watch?v=Kz49u398rL8",
    minAge: 3,
    topics: ["Alfabet", "Angka"],
    language: "id",
    enabled: true,
  },
  {
    id: "d2",
    title: "Diva The Series: Berbagi Mainan dengan Teman",
    channel: "Diva The Series",
    duration: "5:40",
    durationSeconds: 340,
    category: "Diva The Series",
    color: "var(--color-teal)",
    youtubeId: "uK7l3F9yv4Y",
    url: "https://www.youtube.com/watch?v=uK7l3F9yv4Y",
    minAge: 4,
    topics: ["Pertemanan", "Berbagi"],
    language: "id",
    enabled: true,
  },

  // Kok Bisa (Sains Anak)
  {
    id: "kb1",
    title: "Kok Bisa: Kenapa Langit Berwarna Biru?",
    channel: "Kok Bisa",
    duration: "4:50",
    durationSeconds: 290,
    category: "Kok Bisa",
    color: "var(--color-yellow)",
    youtubeId: "9_n3qZ9qWlU",
    url: "https://www.youtube.com/watch?v=9_n3qZ9qWlU",
    minAge: 6,
    topics: ["Sains", "Fisika"],
    language: "id",
    enabled: true,
  },
  {
    id: "kb2",
    title: "Kok Bisa: Bagaimana Proses Terjadinya Hujan?",
    channel: "Kok Bisa",
    duration: "5:15",
    durationSeconds: 315,
    category: "Kok Bisa",
    color: "var(--color-yellow)",
    youtubeId: "uD5Z-u4vYQ0",
    url: "https://www.youtube.com/watch?v=uD5Z-u4vYQ0",
    minAge: 6,
    topics: ["Sains", "Alam"],
    language: "id",
    enabled: true,
  },
  {
    id: "kb3",
    title: "Kok Bisa: Kenapa Dinosaurus Bisa Punah?",
    channel: "Kok Bisa",
    duration: "6:20",
    durationSeconds: 380,
    category: "Kok Bisa",
    color: "var(--color-yellow)",
    youtubeId: "vV7Y1q9mJgQ",
    url: "https://www.youtube.com/watch?v=vV7Y1q9mJgQ",
    minAge: 6,
    topics: ["Sains", "Sejarah"],
    language: "id",
    enabled: true,
  },

  // Bluey
  {
    id: "bl1",
    title: "Bluey: Petualangan Seru di Halaman",
    channel: "Bluey",
    duration: "7:10",
    durationSeconds: 430,
    category: "Bluey",
    color: "var(--color-blue)",
    youtubeId: "8H2u08c9r3k",
    url: "https://www.youtube.com/watch?v=8H2u08c9r3k",
    minAge: 4,
    topics: ["Imajinasi", "Keluarga"],
    language: "id",
    enabled: true,
  },
  {
    id: "bl2",
    title: "Bluey: Bermain Bersama Bingo",
    channel: "Bluey",
    duration: "6:45",
    durationSeconds: 405,
    category: "Bluey",
    color: "var(--color-blue)",
    youtubeId: "4yWz3n5x10o",
    url: "https://www.youtube.com/watch?v=4yWz3n5x10o",
    minAge: 4,
    topics: ["Keluarga", "Permainan"],
    language: "id",
    enabled: true,
  },

  // Lagu Anak
  {
    id: "la1",
    title: "Lagu Anak: Menanam Jagung di Kebun Kita",
    channel: "Lagu Anak",
    duration: "3:30",
    durationSeconds: 210,
    category: "Lagu Anak",
    color: "var(--color-green)",
    youtubeId: "w1v42D9_K8s",
    url: "https://www.youtube.com/watch?v=w1v42D9_K8s",
    minAge: 3,
    topics: ["Musik", "Berkebun"],
    language: "id",
    enabled: true,
  },
  {
    id: "la2",
    title: "Lagu Anak: Bangun Tidur Kuterus Mandi",
    channel: "Lagu Anak",
    duration: "2:55",
    durationSeconds: 175,
    category: "Lagu Anak",
    color: "var(--color-green)",
    youtubeId: "m7L3mZq_e8U",
    url: "https://www.youtube.com/watch?v=m7L3mZq_e8U",
    minAge: 3,
    topics: ["Musik", "Kebiasaan Baik"],
    language: "id",
    enabled: true,
  },
];
