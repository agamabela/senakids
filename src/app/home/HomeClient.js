"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  CirclePlay,
  Gamepad2,
  GraduationCap,
  Tv,
  ArrowRight,
  Sparkles,
  Palette,
  Star,
  Music,
} from "lucide-react";
import { useActivityHistory } from "@/lib/activity-history";
import ContinueShelf from "@/components/ContinueShelf";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const iconByKind = { book: BookOpen, game: Gamepad2, lesson: GraduationCap, tv: Tv, music: Music };

const pathways = [
  {
    key: "books",
    label: { id: "Baca Cerita", en: "Read Stories" },
    detail: { id: "Buku bergambar penuh dongeng & pengetahuan seru", en: "Picture books with tales & learning" },
    action: { id: "Buka Buku", en: "Open Books" },
    href: "/books",
    kind: "book",
    category: "books",
  },
  {
    key: "tv",
    label: { id: "Nonton Pilihan", en: "Watch Picks" },
    detail: { id: "Video edukasi ramah anak, lagu, & eksplorasi", en: "Kid-friendly learning videos & songs" },
    action: { id: "Tonton Video", en: "Watch Videos" },
    href: "/tv",
    kind: "tv",
    category: "tv",
  },
  {
    key: "games",
    label: { id: "Main & Belajar", en: "Play & Learn" },
    detail: { id: "Game logika, piano nada, labirin, & teka-teki", en: "Logic games, piano notes, & puzzles" },
    action: { id: "Mulai Main", en: "Start Playing" },
    href: "/games",
    kind: "game",
    category: "games",
  },
];

const recommendations = [
  {
    title: { id: "Buku Cerita Bergambar", en: "Illustrated Storybooks" },
    detail: { id: "Pilih cerita favorit dan baca bersama keluarga.", en: "Pick a favorite story and read together." },
    href: "/books",
    kind: "book",
    badge: { id: "Koleksi Cerita", en: "Story Collection" },
    category: "books",
  },
  {
    title: { id: "Piano Interaktif", en: "Interactive Piano" },
    detail: { id: "Coba bunyi tuts ceria dan susun melodimu sendiri.", en: "Try cheerful keys and create your melody." },
    href: "/games/built/piano",
    kind: "game",
    badge: { id: "Musik Ceria", en: "Fun Music" },
    category: "games",
  },
  {
    title: { id: "Sena TV Edukasi", en: "Sena Learning TV" },
    detail: { id: "Jelajahi video animasi, sains cilik, dan lagu anak aman.", en: "Explore animations, science, and safe songs." },
    href: "/tv",
    kind: "tv",
    badge: { id: "Video Pilihan", en: "Top Videos" },
    category: "tv",
  },
];

function HeroLearningScene() {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.heroSvg}
      aria-hidden="true"
    >
      {/* Background Soft Blobs */}
      <circle cx="210" cy="160" r="130" fill="var(--color-surface-muted)" opacity="0.75" />
      <path
        d="M80,190 C60,110 180,60 250,90 C320,120 370,180 320,240 C270,300 120,280 80,190 Z"
        fill="var(--color-primary-light)"
        opacity="0.6"
      />

      {/* Floating Rainbow Arc */}
      <path
        d="M60 220 A 150 150 0 0 1 360 220"
        stroke="#FFD166"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M74 220 A 136 136 0 0 1 346 220"
        stroke="#4BA3F2"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path
        d="M86 220 A 124 124 0 0 1 334 220"
        stroke="#FF7A68"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />

      {/* Open Storybook (Coral & Gold) */}
      <g transform="translate(110, 160)">
        <ellipse cx="100" cy="85" rx="85" ry="12" fill="#000000" opacity="0.12" />
        <path d="M10 75 Q 100 85 100 85 Q 100 85 190 75 L 185 30 Q 100 40 100 40 Q 100 40 15 30 Z" fill="#E25D4B" />
        <path d="M16 28 Q 100 38 100 38 L 100 78 Q 14 68 14 28 Z" fill="#FFFDF8" stroke="#E7D8BF" strokeWidth="2" />
        <path d="M22 25 Q 100 35 100 35 L 100 75 Q 20 65 20 25 Z" fill="#FFFFFF" stroke="#E7D8BF" strokeWidth="2" />
        <path d="M184 28 Q 100 38 100 38 L 100 78 Q 186 68 186 28 Z" fill="#FFFDF8" stroke="#E7D8BF" strokeWidth="2" />
        <path d="M178 25 Q 100 35 100 35 L 100 75 Q 180 65 180 25 Z" fill="#FFFFFF" stroke="#E7D8BF" strokeWidth="2" />
        <rect x="97" y="34" width="6" height="44" rx="3" fill="#D89800" />
        <line x1="36" y1="38" x2="84" y2="44" stroke="#FF7A68" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="36" y1="48" x2="76" y2="54" stroke="#D6B98A" strokeWidth="3" strokeLinecap="round" />
        <line x1="36" y1="58" x2="80" y2="64" stroke="#D6B98A" strokeWidth="3" strokeLinecap="round" />
        <line x1="116" y1="44" x2="164" y2="38" stroke="#4BA3F2" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="124" y1="54" x2="164" y2="48" stroke="#D6B98A" strokeWidth="3" strokeLinecap="round" />
        <line x1="120" y1="64" x2="164" y2="58" stroke="#D6B98A" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Soaring Adventure Rocket (Blue, White, Coral) */}
      <g transform="translate(265, 45) rotate(22)">
        <path d="M22 62 Q 27 88 27 88 Q 32 88 32 62 Z" fill="#FFD166" />
        <path d="M25 62 Q 27 76 27 76 Q 29 76 29 62 Z" fill="#FF7A68" />
        <path d="M12 48 L 5 62 L 20 58 Z" fill="#FF7A68" />
        <path d="M42 48 L 49 62 L 34 58 Z" fill="#FF7A68" />
        <path d="M27 6 C 18 16 16 38 18 58 L 36 58 C 38 38 36 16 27 6 Z" fill="#FFFFFF" stroke="#3A98EA" strokeWidth="3" />
        <path d="M27 6 C 22 14 20 22 20 22 L 34 22 C 34 22 32 14 27 6 Z" fill="#FF7A68" />
        <circle cx="27" cy="34" r="6" fill="#3A98EA" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="25" cy="32" r="2" fill="#FFFFFF" />
      </g>

      {/* Art Palette & Paint (Green, Yellow, Purple) */}
      <g transform="translate(48, 105) rotate(-12)">
        <path
          d="M35 15 C 55 10 75 22 75 42 C 75 58 60 70 45 70 C 35 70 28 62 25 54 C 22 46 15 46 10 42 C 3 36 8 20 35 15 Z"
          fill="#FFF3DF"
          stroke="#D6B98A"
          strokeWidth="3"
        />
        <circle cx="22" cy="46" r="4.5" fill="var(--color-surface)" stroke="#D6B98A" strokeWidth="2" />
        <circle cx="34" cy="26" r="5" fill="#FF7A68" />
        <circle cx="50" cy="28" r="5" fill="#FFD166" />
        <circle cx="62" cy="42" r="5" fill="#2BB673" />
        <circle cx="50" cy="56" r="5" fill="#8B6DE9" />
        <g transform="translate(56, 12) rotate(45)">
          <rect x="0" y="0" width="6" height="32" rx="3" fill="#AB412E" />
          <rect x="0" y="24" width="6" height="8" rx="1" fill="#D6B98A" />
          <path d="M0 32 Q 3 40 3 40 Q 6 40 6 32 Z" fill="#2BB673" />
        </g>
      </g>

      {/* Playful Music Notes */}
      <g transform="translate(62, 45)">
        <ellipse cx="8" cy="18" rx="5" ry="4" fill="#8B6DE9" transform="rotate(-20 8 18)" />
        <line x1="12" y1="16" x2="12" y2="2" stroke="#8B6DE9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 2 Q 20 4 20 10" stroke="#8B6DE9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(340, 150)">
        <ellipse cx="6" cy="14" rx="4" ry="3.5" fill="#2BB673" transform="rotate(-20 6 14)" />
        <ellipse cx="20" cy="11" rx="4" ry="3.5" fill="#2BB673" transform="rotate(-20 20 11)" />
        <line x1="9" y1="13" x2="9" y2="2" stroke="#2BB673" strokeWidth="2" />
        <line x1="23" y1="10" x2="23" y2="0" stroke="#2BB673" strokeWidth="2" />
        <line x1="9" y1="2" x2="23" y2="0" stroke="#2BB673" strokeWidth="3" />
      </g>

      {/* Sparkling Stars */}
      <g transform="translate(180, 50)">
        <path d="M10 0 L 13 7 L 20 10 L 13 13 L 10 20 L 7 13 L 0 10 L 7 7 Z" fill="#FFD166" />
      </g>
      <g transform="translate(325, 100)">
        <path d="M8 0 L 10 5 L 16 8 L 10 11 L 8 16 L 6 11 L 0 8 L 6 5 Z" fill="#FF7A68" />
      </g>
      <g transform="translate(125, 120)">
        <path d="M6 0 L 7.5 4 L 12 6 L 7.5 8 L 6 12 L 4.5 8 L 0 6 L 4.5 4 Z" fill="#4BA3F2" />
      </g>
      <g transform="translate(230, 260)">
        <path d="M7 0 L 9 5 L 14 7 L 9 9 L 7 14 L 5 9 L 0 7 L 5 5 Z" fill="#FFD166" />
      </g>
    </svg>
  );
}

export default function HomeClient() {
  const { lang } = useLanguage();
  const { data: session } = useSession();
  const { history, isLoaded } = useActivityHistory("all");
  const L = (item) => (typeof item === "object" ? item[lang] || item.id : item);
  const name = session?.user?.name?.trim()?.split(" ")[0];

  const greeting = name
    ? (lang === "en" ? `Welcome back, ${name}!` : `Halo lagi, ${name}!`)
    : (lang === "en" ? "What would you like to explore today?" : "Mau berpetualang apa hari ini?");

  return (
    <div className={styles.page}>
      {/* 1. HERO SECTION */}
      <section className={styles.welcome} aria-labelledby="welcome-title">
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeCopy}>
            <div className={styles.kickerBadge}>
              <Sparkles size={16} aria-hidden="true" />
              <span>{lang === "en" ? "Sena Kids Adventure" : "Petualangan Sena Kids"}</span>
            </div>
            <h1 id="welcome-title">{greeting}</h1>
            <p className={styles.welcomeSubtitle}>
              {lang === "en"
                ? "Pick one joyful activity, read exciting stories, play logic games, or watch safe educational videos."
                : "Pilih satu kegiatan seru, baca dongeng penuh imajinasi, mainkan game logika, atau tonton video edukasi yang aman."}
            </p>
            <div className={styles.welcomeActions}>
              <a href="#pathways" className={styles.heroCta}>
                <Sparkles size={18} aria-hidden="true" />
                <span>{lang === "en" ? "Start today's adventure" : "Mulai petualangan hari ini"}</span>
              </a>
            </div>
          </div>
          <div className={styles.welcomeArt} aria-hidden="true">
            <HeroLearningScene />
          </div>
        </div>

        {/* 2. THREE MAIN ACTIVITY CARDS */}
        <div id="pathways" className={styles.pathwaysWrapper}>
          <h2 className={styles.visuallyHidden}>
            {lang === "en" ? "Choose your activity" : "Pilih kegiatanmu"}
          </h2>
          <nav className={styles.pathways} aria-label={lang === "en" ? "Choose an activity" : "Pilih kegiatan"}>
            {pathways.map((path) => {
              const Icon = iconByKind[path.kind];
              return (
                <Link
                  className={`${styles.pathway} ${styles[`pathway_${path.category}`]}`}
                  href={path.href}
                  key={path.href}
                >
                  <div className={styles.pathwayIconBox}>
                    <Icon size={28} strokeWidth={2.4} aria-hidden="true" />
                  </div>
                  <div className={styles.pathwayCopy}>
                    <strong>{L(path.label)}</strong>
                    <small>{L(path.detail)}</small>
                  </div>
                  <span className={styles.pathwayAction}>
                    <span>{L(path.action)}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      {/* 3. ACTIVITY HISTORY / CONTINUE SHELF */}
      <section className={styles.activitySection} aria-labelledby="activity-title">
        {isLoaded && history.length > 0 ? (
          <ContinueShelf
            type="all"
            title={lang === "en" ? "Continue where you left off" : "Lanjutkan yang terakhir kamu buka"}
          />
        ) : (
          <div className={styles.emptyContainer}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>{lang === "en" ? "Your Activity" : "Aktivitasmu"}</p>
                <h2 id="activity-title">
                  {lang === "en" ? "Continue where you left off" : "Lanjutkan yang terakhir kamu buka"}
                </h2>
              </div>
            </div>
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <CirclePlay size={32} aria-hidden="true" />
              </div>
              <div className={styles.emptyText}>
                <strong>{lang === "en" ? "Ready to begin your journey?" : "Siap memulai petualanganmu?"}</strong>
                <p>
                  {lang === "en"
                    ? "Your recent books, educational videos, and arcade games will appear here as soon as you open one."
                    : "Buku cerita, video edukasi, dan game yang kamu buka akan tersimpan di sini agar kamu bisa melanjutkannya kapan saja."}
                </p>
              </div>
              <Link href="/books" className={styles.emptyAction}>
                <BookOpen size={18} aria-hidden="true" />
                <span>{lang === "en" ? "Browse Books" : "Buka Buku Cerita"}</span>
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 5. RECOMMENDATIONS: THREE PLACES TO START */}
      <section className={styles.recommendSection} aria-labelledby="recommend-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>{lang === "en" ? "Curated for you" : "Pilihan Seru"}</p>
            <h2 id="recommend-title">
              {lang === "en" ? "Three places to start" : "Tiga tempat untuk mulai"}
            </h2>
          </div>
        </div>
        <div className={styles.recommendations}>
          {recommendations.map((item, index) => {
            const Icon = iconByKind[item.kind] || Gamepad2;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`${styles.recommendation} ${styles[`recommendation_${item.category}`]} ${styles[`recommendationCard${index + 1}`]}`}
              >
                <div className={styles.recTopRow}>
                  <div className={styles.recIconBadge}>
                    <Icon size={26} strokeWidth={2.4} aria-hidden="true" />
                  </div>
                  <span className={styles.recTag}>{L(item.badge)}</span>
                </div>
                <div className={styles.recBody}>
                  <h3>{L(item.title)}</h3>
                  <p>{L(item.detail)}</p>
                </div>
                <span className={styles.recLink}>
                  <span>{lang === "en" ? "Explore now" : "Mulai jelajah"}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. CREATIVE STUDIO HIGHLIGHT */}
      <section className={styles.creativeSection} aria-labelledby="creative-title">
        <div className={styles.creativeCard}>
          <div className={styles.creativeIconBox}>
            <Palette size={38} strokeWidth={2.3} aria-hidden="true" />
          </div>
          <div className={styles.creativeCopy}>
            <p className={styles.creativeKicker}>{lang === "en" ? "Creative Studio" : "Studio Kreasi"}</p>
            <h2 id="creative-title">
              {lang === "en" ? "Draw & Color: Unleash Your Imagination" : "Ayo Menggambar & Mewarnai"}
            </h2>
            <p>
              {lang === "en"
                ? "Pick colorful brushes, bright stamps, and a blank canvas to bring your wildest ideas to life."
                : "Gunakan kuas warna-warni, stempel bentuk ceria, dan kanvas digital untuk menuangkan ide hebatmu."}
            </p>
          </div>
          <div className={styles.creativeActionCol}>
            <Link href="/create" className={styles.creativeButton}>
              <Palette size={20} aria-hidden="true" />
              <span>{lang === "en" ? "Open Drawing Studio" : "Buka Kanvas Gambar"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CHILD CLOSING WRAP-UP BANNER */}
      <section className={styles.wrapUpBanner} aria-label={lang === "en" ? "Safe learning note" : "Catatan belajar aman"}>
        <div className={styles.wrapUpContent}>
          <div className={styles.wrapUpStars}>
            <Star size={20} fill="#FFD166" color="#FFB800" aria-hidden="true" />
            <Star size={24} fill="#FFD166" color="#FFB800" aria-hidden="true" />
            <Star size={20} fill="#FFD166" color="#FFB800" aria-hidden="true" />
          </div>
          <h3>{lang === "en" ? "Learn, Play & Smile Every Day!" : "Belajar, Bermain & Tersenyum Ceria!"}</h3>
          <p>
            {lang === "en"
              ? "All stories, videos, and games on Sena Kids are 100% ad-free and safe for children. Remember to take a break and drink water!"
              : "Semua cerita, video, dan game di Sena Kids aman serta bebas dari iklan pelacak. Ingat istirahat sejenak dan minum air putih ya!"}
          </p>
        </div>
      </section>
    </div>
  );
}
