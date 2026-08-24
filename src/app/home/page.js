"use client";

import Link from "next/link";
import { Heart, ChevronRight, Gamepad2, BookOpen } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const bookActivities = [
  {
    title: { id: "Belajar Membaca", en: "Learn to Read" },
    description: { id: "Membaca rangkaian 3 huruf", en: "Read three-letter words" },
    emoji: "📚",
    href: "/belajar-membaca",
    color: "yellow",
  },
  {
    title: { id: "Sejarah Sepeda", en: "History of Bicycles" },
    description: { id: "Ensiklopedia untuk Anak", en: "Encyclopedia for Kids" },
    emoji: "🚲",
    href: "/sejarah-sepeda",
    color: "green",
  },
  {
    title: { id: "Petualangan Tetes Air", en: "The Water Drop's Adventure" },
    description: { id: "Kisah Siklus Air", en: "The Water Cycle Story" },
    emoji: "💧",
    href: "/petualangan-tetes-air",
    color: "blue",
  },
  {
    title: { id: "Mengenal Hujan", en: "All About Rain" },
    description: { id: "Proses Terjadinya Hujan", en: "How Rain Happens" },
    emoji: "🌧️",
    href: "/mengenal-hujan",
    color: "pink",
  },
];

const letsReadBooks = [
  { title: { id: "Jangan Sampai Ibu Tahu", en: "Don't Let Mom Know" }, description: { id: "Rowa ingin memelihara binatang, tetapi Ibu selalu melarang.", en: "Rowa wants a pet, but Mom always says no." }, href: "/buku-cerita", color: "orange", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ec7bc4ff-67a2-4cd8-8c55-edce3039011a.png" },
  { title: { id: "Tangan-Tangan Ajaib", en: "Magic Hands" }, description: { id: "Tangan Kakek bisa membuat kejutan.", en: "Grandpa's hands can make wonderful surprises." }, href: "/buku-cerita", color: "green", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5948a5e4-c050-4fa2-9b8c-2a7c1f09c903.png" },
  { title: { id: "Kapan Kapal Datang", en: "When Will the Ship Arrive?" }, description: { id: "Ela menunggu kapal perintis yang membawa sepatu barunya.", en: "Ela waits for the ship carrying her new shoes." }, href: "/buku-cerita", color: "blue", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/6637613c-e7c8-4f83-bdef-cec376961d3b.png" },
  { title: { id: "Setelah Kami Pindah", en: "After We Moved" }, description: { id: "Petualangan tinggal di rumah baru yang sering berguncang.", en: "An adventure in a new house that often shakes." }, href: "/buku-cerita", color: "purple", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/b58422bf-a795-460e-969e-71f7afbdf815.png" },
  { title: { id: "Yang Penting Selesai", en: "Finishing Is What Matters" }, description: { id: "Menata kue sebelum melihat anak sapi di rumah Nenek.", en: "Finishing the cakes before visiting Grandma's calf." }, href: "/buku-cerita", color: "pink", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/398ef646-a846-4d81-9257-609250c6f5d2.png" },
  { title: { id: "Kue Jadah Tujuh Warna", en: "Seven-Colored Jadah Cake" }, description: { id: "Ajeng penasaran seperti apa rasa kue tujuh warna.", en: "Ajeng wonders what seven-colored cake tastes like." }, href: "/buku-cerita", color: "orange", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ab0ba2df-806c-448e-bb8c-1fc1b62a6dd6.png" },
  { title: { id: "Takut", en: "Afraid" }, description: { id: "Tiki ingin bermain di taman bermain di tengah hutan.", en: "Tiki wants to play in a playground in the forest." }, href: "/buku-cerita", color: "green", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/53132d2a-4932-41c0-97ad-75a81e3ec488.png" },
  { title: { id: "Tolong Mintakan Durian", en: "Please Ask for a Durian" }, description: { id: "Tapir ingin meminta durian kepada Paman Harimau.", en: "Tapir wants to ask Uncle Tiger for a durian." }, href: "/buku-cerita", color: "teal", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ed45b036-aa46-4151-928a-d6a53fbb8b43.png" },
  { title: { id: "Menggambar Kakek", en: "Drawing Grandpa" }, description: { id: "Isa harus menggambar kakek yang belum pernah ditemuinya.", en: "Isa must draw the grandfather he never met." }, href: "/buku-cerita", color: "purple", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/1c43a9c6-002a-4516-a31a-d14546da5e1e.png" },
  { title: { id: "Mencari Kuroki", en: "Looking for Kuroki" }, description: { id: "Raya mencari Kuroki setelah hujan reda.", en: "Raya looks for Kuroki after the rain." }, href: "/buku-cerita", color: "green", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/47d6d30a-be48-47fc-a37b-da153360b4d0.png" },
  { title: { id: "Gara-gara Hujan", en: "Because of the Rain" }, description: { id: "Perjalanan menuju pertandingan badminton saat hujan.", en: "A rainy journey to a badminton match." }, href: "/buku-cerita", color: "blue", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/15c6cc22-cd52-46a6-8a07-54e19ff38858.png" },
  { title: { id: "Ketika Musim Ulat Jati", en: "Teak Caterpillar Season" }, description: { id: "Nono harus melindungi diri dari ulat jati.", en: "Nono must protect himself from teak caterpillars." }, href: "/buku-cerita", color: "green", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5462fd0d-ccbe-476a-84d2-547f31e22cbd.png" },
  { title: { id: "Cacing untuk Memancing", en: "Worms for Fishing" }, description: { id: "Nino mencari cacing setelah tongkatnya patah.", en: "Nino looks for worms after his stick breaks." }, href: "/buku-cerita", color: "orange", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/3b1aa54c-5ae7-4fd8-8b98-40c51c8a822e.png" },
  { title: { id: "Ada Sesuatu di Kamar Mandi", en: "Something Is in the Bathroom" }, description: { id: "Feri melihat sepasang mata saat listrik padam.", en: "Feri sees a pair of eyes during a blackout." }, href: "/buku-cerita", color: "blue", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/20b7ea01-4597-4e05-b410-6e44583e1282.png" },
  { title: { id: "Mencari Emak", en: "Looking for Mother" }, description: { id: "Mona bersepeda untuk mencari Emak.", en: "Mona cycles to find her mother." }, href: "/buku-cerita", color: "pink", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/753a086c-3cfd-4c3c-8a27-738115933c0d.png" },
];

const gameActivities = [
  { title: { id: "Drum", en: "Drum" }, description: { id: "Ketuk untuk main!", en: "Tap to play!" }, emoji: "🥁", href: "/games/built/drum", color: "purple" },
  { title: { id: "Membuat Jalur", en: "Build the Path" }, description: { id: "Bangun rute yang benar.", en: "Build the right route." }, emoji: "🧭", href: "/games/built/membuat-jalur", color: "blue" },
  { title: { id: "Flashcard Simple", en: "Simple Flashcards" }, description: { id: "Ingat gambar dan kata.", en: "Remember pictures and words." }, emoji: "🃏", href: "/games/built/flashcard-simple", color: "orange" },
  { title: { id: "Piano", en: "Piano" }, description: { id: "Main piano interaktif!", en: "Play the interactive piano!" }, emoji: "🎹", href: "/games/built/piano", color: "purple" },
  { title: { id: "Petualangan Labirin", en: "Maze Adventure" }, description: { id: "Kumpulkan permata!", en: "Collect the gems!" }, emoji: "🧑‍🚀", href: "/games/built/petualangan-labirin", color: "blue" },
];

export default function Home() {
  const { t, language } = useLanguage();
  const L = (o) => (o && typeof o === "object" ? (o[language] ?? o.id) : o);
  const tx = (id, en) => (language === "id" ? id : en);

  return (
    <div className={styles.container}>
      
      {/* Top Support Banner */}
      <div className={styles.supportBanner}>
        <div className={styles.bannerLeft}>
          <div className={styles.heartIcon}>
            <Heart fill="currentColor" size={24} />
          </div>
          <div>
            <h2 className={styles.bannerTitle}>{t("home.supportTitle")}</h2>
            <p className={styles.bannerSubtitle}>{t("home.supportSubtitle")}</p>
          </div>
        </div>
        <a href="https://saweria.co/senakids" target="_blank" rel="noopener noreferrer" className={styles.bannerButton}>
          {t("home.supportButton")}
        </a>
      </div>

      {/* Books Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.booksSection")}</h2>
          <Link href="/books" className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.cardGrid}>
          {bookActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* Let's Read Asia Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{tx("Buku Cerita", "Story Books")}</h2>
          <Link href="/buku-cerita" className={styles.seeAllBtn}>
            {tx("Lihat Semua", "See All")} <ChevronRight size={16} />
          </Link>
        </div>
        <p className={styles.sectionSubtitle}>{tx("Cerita anak bergambar, baca langsung di sini!", "Illustrated children's stories, read directly here!")}</p>
        <div className={styles.letsReadGrid}>
          {letsReadBooks.map((book, index) => (
            <div key={book.title.id}>
              <Link href={book.href} className={styles.letsReadCard}>
                <div className={styles.letsReadCover}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover} alt={L(book.title)} className={styles.coverImage} />
                  <div className={styles.readBadge}>
                    <BookOpen size={12} />
                    {tx("Baca", "Read")}
                  </div>
                </div>
                <div className={styles.letsReadInfo}>
                  <h3 className={styles.letsReadTitle}>{L(book.title)}</h3>
                  <p className={styles.letsReadDesc}>{L(book.description)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.gamesSection")}</h2>
          <Link href="/games" className={styles.seeAllBtn}>{t("home.seeAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className={styles.cardGrid}>
          {gameActivities.map((activity, index) => (
            <ActivityCard
              key={activity.href}
              {...activity}
              title={L(activity.title)}
              description={L(activity.description)}
              delay={0.1 * index}
            />
          ))}
        </div>
      </section>

      {/* CTA to Games */}
      <div className={styles.ctaSection}>
        <Gamepad2 size={36} color="var(--color-primary)" />
        <h2>{tx("Lihat Semua Permainan", "See All Games")}</h2>
        <p>{tx("Ada banyak aktivitas dan game interaktif seru!", "Discover lots of fun interactive games and activities!")}</p>
        <Link href="/games" className={styles.ctaButton}>
          <Gamepad2 size={18} />
          {tx("Jelajahi Permainan", "Explore Games")}
        </Link>
      </div>

      {/* Footer Banner */}
      <footer className={styles.footerBanner}>
        <p>{t("home.footer")}</p>
      </footer>
    </div>
  );
}
