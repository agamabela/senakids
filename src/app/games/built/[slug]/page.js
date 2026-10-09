import { notFound } from "next/navigation";
import DrumGameClient from "../DrumGameClient";
import BingoLabyrinthGameClient from "../BingoLabyrinthGameClient";
import LearnEnglish1GameClient from "../LearnEnglish1GameClient";
import FlashcardSimpleGameClient from "../FlashcardSimpleGameClient";
import TebakGambarGameClient from "../TebakGambarGameClient";
import MencocokkanGambarGameClient from "../MencocokkanGambarGameClient";
import MenyabungPipaGameClient from "../MenyabungPipaGameClient";
import MenyusunGambarGameClient from "../MenyusunGambarGameClient";
import MengurutkanBalokGameClient from "../MengurutkanBalokGameClient";
import UrutkanBolaAngkaGameClient from "../UrutkanBolaAngkaGameClient";
import QuizGameClient from "../QuizGameClient";
import BerhitungGameClient from "../BerhitungGameClient";
import MewarnaiGameClient from "../MewarnaiGameClient";
import HurufABCGameClient from "../HurufABCGameClient";
import WarnaGameClient from "../WarnaGameClient";
import PianoGameClient from "../PianoGameClient";
import PetualanganLabirinGameClient from "../PetualanganLabirinGameClient";
import Labirin3DGameClient from "../Labirin3DGameClient";
import BombermanGameClient from "../BombermanGameClient";
import InfiniteFlierGameClient from "../InfiniteFlierGameClient";
import SnakeGameClient from "../SnakeGameClient";
import LudoGameClient from "../LudoGameClient";
import UlarTanggaGameClient from "../UlarTanggaGameClient";
import LacakHurufGameClient from "../LacakHurufGameClient";
import LacakAngkaGameClient from "../LacakAngkaGameClient";
import JigsawGameClient from "../JigsawGameClient";
import PukulTikusGameClient from "../PukulTikusGameClient";
import SimonBilangGameClient from "../SimonBilangGameClient";
import LetuskanBalonGameClient from "../LetuskanBalonGameClient";
import PlatformerGameClient from "../PlatformerGameClient";
import SkiPagiGameClient from "../SkiPagiGameClient";
import NumberBalanceGameClient from "../NumberBalanceGameClient";
import BlockBlastGameClient from "../BlockBlastGameClient";
import WordSearchGameClient from "../WordSearchGameClient";
import ColorConnectGameClient from "../ColorConnectGameClient";
import ZipPathGameClient from "../ZipPathGameClient";
import TopplePartyGameClient from "../TopplePartyGameClient";
import MathComparisonGameClient from "../MathComparisonGameClient";
import MathFractionGameClient from "../MathFractionGameClient";
import MathAdditionGameClient from "../MathAdditionGameClient";
import MathSubtractionGameClient from "../MathSubtractionGameClient";
import MathNegativeGameClient from "../MathNegativeGameClient";
import MathMultiplicationGameClient from "../MathMultiplicationGameClient";
import MemoryMorseGameClient from "../MemoryMorseGameClient";
import MemahamiKoordinatGameClient from "../MemahamiKoordinatGameClient";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

export const builtGameDetails = {
  drum: { title: "Drum", description: "Permainan drum interaktif built-in.", note: "This built-in game is implemented directly in Sena Kids." },
  "membuat-jalur": { title: "Membuat Jalur", description: "Bantu Sena menemukan jalan keluar labirin!", note: "This built-in game is implemented directly in Sena Kids." },
  "learn-english-1": { title: "Learn English 1", description: "Belajar kata sederhana dan gambar.", note: "This built-in game is implemented directly in Sena Kids." },
  "flashcard-simple": { title: "Flashcard Simple", description: "Ingat kata melalui kartu.", note: "This built-in game is implemented directly in Sena Kids." },
  "tebak-gambar": { title: "Tebak Gambar", description: "Tebak gambar mana yang benar.", note: "This built-in game is implemented directly in Sena Kids." },
  "mencocokkan-gambar": { title: "Mencocokkan Gambar", description: "Cari pasangan gambar yang sama.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyabung-pipa": { title: "Menyabung Pipa", description: "Sambungkan pipa agar air mengalir.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyusun-gambar": { title: "Menyusun Gambar", description: "Susun potongan gambar menjadi utuh.", note: "This built-in game is implemented directly in Sena Kids." },
  "mengurutkan-balok": { title: "Mengurutkan Balok", description: "Urutkan balok sesuai urutan.", note: "This built-in game is implemented directly in Sena Kids." },
  "urutkan-bola-angka": { title: "Urutkan Bola Angka", description: "Susun bola berdasarkan angka.", note: "This built-in game is implemented directly in Sena Kids." },
  quiz: { title: "Quiz", description: "Jawab kuis seru dan menantang.", note: "This built-in game is implemented directly in Sena Kids." },
  berhitung: { title: "Berhitung", description: "Selesaikan soal matematika seru!", note: "This built-in game is implemented directly in Sena Kids." },
  mewarnai: { title: "Mewarnai", description: "Warnai gambar yang indah!", note: "This built-in game is implemented directly in Sena Kids." },
  "huruf-abc": { title: "Huruf ABC", description: "Belajar huruf dan suara!", note: "This built-in game is implemented directly in Sena Kids." },
  warna: { title: "Menggambar Bebas", description: "Gambar bebas dengan warna-warni!", note: "This built-in game is implemented directly in Sena Kids." },
  piano: { title: "Piano", description: "Main piano interaktif!", note: "This built-in game is implemented directly in Sena Kids." },
  "petualangan-labirin": { title: "Petualangan Labirin", description: "Jelajahi labirin dan kumpulkan semua permata!", note: "This built-in game is implemented directly in Sena Kids." },
  "labirin-3d": { title: "Labirin 3D", description: "Jelajahi labirin 3D orang pertama dan kumpulkan permata!", note: "This built-in game is implemented directly in Sena Kids." },
  bomberman: { title: "Si Bom Pintar", description: "Letakkan bom, hancurkan peti, kalahkan monster!", note: "This built-in game is implemented directly in Sena Kids." },
  "astronot-terbang": { title: "Astronot Terbang", description: "Terbang dan hindari rintangan, kumpulkan bintang!", note: "This built-in game is implemented directly in Sena Kids." },
  "ular-pintar": { title: "Ular Pintar", description: "Makan buah, tumbuh panjang, jangan menabrak!", note: "This built-in game is implemented directly in Sena Kids." },
  ludo: { title: "Ludo", description: "Balapan bidak mengelilingi papan, capai pusat lebih dulu!", note: "This built-in game is implemented directly in Sena Kids." },
  "ular-tangga": { title: "Ular Tangga", description: "Naik tangga, hindari ular: versi klasik atau buat papanmu sendiri!", note: "This built-in game is implemented directly in Sena Kids." },
  "lacak-huruf": { title: "Lacak Huruf", description: "Belajar menulis huruf A-Z dengan menelusuri titik-titik!", note: "This built-in game is implemented directly in Sena Kids." },
  "lacak-angka": { title: "Lacak Angka", description: "Belajar menulis angka 0-9 dengan menelusuri titik-titik!", note: "This built-in game is implemented directly in Sena Kids." },
  "puzzle-gambar": { title: "Puzzle Gambar", description: "Susun keping puzzle jigsaw menjadi gambar utuh!", note: "This built-in game is implemented directly in Sena Kids." },
  "pukul-tikus": { title: "Pukul Tikus", description: "Pukul tikus secepat mungkin sebelum waktu habis!", note: "This built-in game is implemented directly in Sena Kids." },
  "simon-bilang": { title: "Simon Bilang", description: "Ingat dan ulangi urutan warna yang makin panjang!", note: "This built-in game is implemented directly in Sena Kids." },
  "letuskan-balon": { title: "Letuskan Balon", description: "Letuskan balon sesuai jumlah untuk belajar berhitung!", note: "This built-in game is implemented directly in Sena Kids." },
  "petualangan-lompat": { title: "Petualangan Lompat", description: "Lari, lompat, kumpulkan bintang, dan capai bendera!", note: "This built-in game is implemented directly in Sena Kids." },
  "ski-pagi": { title: "Ski Pagi", description: "Meluncur di lereng salju, hindari rintangan, dan kumpulkan koin.", note: "Downhill ski arcade game for Sena Kids." },
  "ski-free": { title: "Ski Free", description: "Meluncur di lereng salju, hindari rintangan, dan kumpulkan koin.", note: "Downhill ski arcade game for Sena Kids." },
  "timbangan-angka": { title: "Timbangan Angka", description: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan!", note: "This built-in game is implemented directly in Sena Kids." },
  "number-balance": { title: "Timbangan Angka", description: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan!", note: "This built-in game is implemented directly in Sena Kids." },
  "block-blast": { title: "Block Blast", description: "Teka-teki balok seru: tempatkan balok dan bersihkan baris serta kolom!", note: "This built-in game is implemented directly in Sena Kids." },
  "cari-kata": { title: "Cari Kata", description: "Temukan kata-kata tersembunyi dalam kotak huruf!", note: "This built-in game is implemented directly in Sena Kids." },
  "word-search": { title: "Cari Kata", description: "Temukan kata-kata tersembunyi dalam kotak huruf!", note: "This built-in game is implemented directly in Sena Kids." },
  "sambung-warna": { title: "Sambung Warna", description: "Hubungkan titik-titik warna yang sama tanpa garis bertabrakan!", note: "This built-in game is implemented directly in Sena Kids." },
  "color-connect": { title: "Sambung Warna", description: "Hubungkan titik-titik warna yang sama tanpa garis bertabrakan!", note: "This built-in game is implemented directly in Sena Kids." },
  "zip-path": { title: "Zip Path", description: "Tarik satu jalur ritsleting melewati setiap titik tanpa henti!", note: "This built-in game is implemented directly in Sena Kids." },
  "topple-party": { title: "Topple Party", description: "Jaga keseimbangan jungkat-jungkit agar tidak terjungkal!", note: "This built-in game is implemented directly in Sena Kids." },
  membandingkan: { title: "Membandingkan Angka", description: "Latihan perbandingan lebih besar, lebih kecil, dan sama dengan.", note: "This built-in game is implemented directly in Sena Kids." },
  comparison: { title: "Membandingkan Angka", description: "Latihan perbandingan lebih besar, lebih kecil, dan sama dengan.", note: "This built-in game is implemented directly in Sena Kids." },
  "pecahan-lingkaran": { title: "Pecahan Lingkaran", description: "Belajar memahami pecahan dengan diagram lingkaran interaktif.", note: "This built-in game is implemented directly in Sena Kids." },
  fractions: { title: "Pecahan Lingkaran", description: "Belajar memahami pecahan dengan diagram lingkaran interaktif.", note: "This built-in game is implemented directly in Sena Kids." },
  penjumlahan: { title: "Latihan Penjumlahan", description: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual.", note: "This built-in game is implemented directly in Sena Kids." },
  "numbers-add": { title: "Latihan Penjumlahan", description: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual.", note: "This built-in game is implemented directly in Sena Kids." },
  pengurangan: { title: "Latihan Pengurangan", description: "Asah kemampuan pengurangan angka dengan ilustrasi benda yang dicoret.", note: "This built-in game is implemented directly in Sena Kids." },
  "numbers-substract": { title: "Latihan Pengurangan", description: "Asah kemampuan pengurangan angka dengan ilustrasi benda yang dicoret.", note: "This built-in game is implemented directly in Sena Kids." },
  "angka-negatif": { title: "Angka Negatif", description: "Pelajari bilangan di bawah nol dan garis bilangan dengan seru.", note: "This built-in game is implemented directly in Sena Kids." },
  "negative-number": { title: "Angka Negatif", description: "Pelajari bilangan di bawah nol dan garis bilangan dengan seru.", note: "This built-in game is implemented directly in Sena Kids." },
  perkalian: { title: "Tabel Perkalian", description: "Kuasai perkalian dasar dengan kelompok visual gambar.", note: "This built-in game is implemented directly in Sena Kids." },
  "perkalian-dasar": { title: "Tabel Perkalian", description: "Kuasai perkalian dasar dengan kelompok visual gambar.", note: "This built-in game is implemented directly in Sena Kids." },
  morse: { title: "Kode Morse Memori", description: "Dengarkan bunyi dan pelajari kode morse alfabet.", note: "This built-in game is implemented directly in Sena Kids." },
  "morse-memori": { title: "Kode Morse Memori", description: "Dengarkan bunyi dan pelajari kode morse alfabet.", note: "This built-in game is implemented directly in Sena Kids." },
  "memahami-koordinat": { title: "Memahami Koordinat", description: "Belajar sumbu X dan Y pada bidang koordinat kartesius interaktif.", note: "This built-in game is implemented directly in Sena Kids." },
  koordinat: { title: "Memahami Koordinat", description: "Belajar sumbu X dan Y pada bidang koordinat kartesius interaktif.", note: "This built-in game is implemented directly in Sena Kids." }
};

const gameClients = {
  drum: DrumGameClient,
  "membuat-jalur": BingoLabyrinthGameClient,
  "learn-english-1": LearnEnglish1GameClient,
  "flashcard-simple": FlashcardSimpleGameClient,
  "tebak-gambar": TebakGambarGameClient,
  "mencocokkan-gambar": MencocokkanGambarGameClient,
  "menyabung-pipa": MenyabungPipaGameClient,
  "menyusun-gambar": MenyusunGambarGameClient,
  "mengurutkan-balok": MengurutkanBalokGameClient,
  "urutkan-bola-angka": UrutkanBolaAngkaGameClient,
  quiz: QuizGameClient,
  berhitung: BerhitungGameClient,
  mewarnai: MewarnaiGameClient,
  "huruf-abc": HurufABCGameClient,
  warna: WarnaGameClient,
  piano: PianoGameClient,
  "petualangan-labirin": PetualanganLabirinGameClient,
  "labirin-3d": Labirin3DGameClient,
  bomberman: BombermanGameClient,
  "astronot-terbang": InfiniteFlierGameClient,
  "ular-pintar": SnakeGameClient,
  ludo: LudoGameClient,
  "ular-tangga": UlarTanggaGameClient,
  "lacak-huruf": LacakHurufGameClient,
  "lacak-angka": LacakAngkaGameClient,
  "puzzle-gambar": JigsawGameClient,
  "pukul-tikus": PukulTikusGameClient,
  "simon-bilang": SimonBilangGameClient,
  "letuskan-balon": LetuskanBalonGameClient,
  "petualangan-lompat": PlatformerGameClient,
  "ski-pagi": SkiPagiGameClient,
  "ski-free": SkiPagiGameClient,
  "timbangan-angka": NumberBalanceGameClient,
  "number-balance": NumberBalanceGameClient,
  "block-blast": BlockBlastGameClient,
  "cari-kata": WordSearchGameClient,
  "word-search": WordSearchGameClient,
  "sambung-warna": ColorConnectGameClient,
  "color-connect": ColorConnectGameClient,
  "zip-path": ZipPathGameClient,
  "topple-party": TopplePartyGameClient,
  membandingkan: MathComparisonGameClient,
  comparison: MathComparisonGameClient,
  "pecahan-lingkaran": MathFractionGameClient,
  fractions: MathFractionGameClient,
  penjumlahan: MathAdditionGameClient,
  "numbers-add": MathAdditionGameClient,
  pengurangan: MathSubtractionGameClient,
  "numbers-substract": MathSubtractionGameClient,
  "angka-negatif": MathNegativeGameClient,
  "negative-number": MathNegativeGameClient,
  perkalian: MathMultiplicationGameClient,
  "perkalian-dasar": MathMultiplicationGameClient,
  morse: MemoryMorseGameClient,
  "morse-memori": MemoryMorseGameClient,
  "memahami-koordinat": MemahamiKoordinatGameClient,
  koordinat: MemahamiKoordinatGameClient
};

export async function generateStaticParams() {
  return Object.keys(builtGameDetails).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    return {
      title: "Game Tidak Ditemukan",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://senakids.web.id";
  const canonicalUrl = `${baseUrl}/games/built/${slug}`;

  return {
    title: game.title,
    description: game.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${game.title} - Game Anak Interaktif`,
      description: game.description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function BuiltGamePage({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    notFound();
  }

  const GameClient = gameClients[slug];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://senakids.web.id";
  const gameJsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: game.title,
    description: game.description,
    url: `${baseUrl}/games/built/${slug}`,
    audience: {
      "@type": "Audience",
      audienceType: "Children",
    },
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <div className={styles.backButtonWrapper}>
        <BackButton />
      </div>
      <GameClient />
    </div>
  );
}
