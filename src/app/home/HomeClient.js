"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, CalendarCheck, CirclePlay, Gamepad2, GraduationCap, Tv } from "lucide-react";
import { getDailyActivity, readActivity, readDailyCompletion, todayKey } from "@/lib/journey";
import { useActivityHistory } from "@/lib/activity-history";
import ContinueShelf from "@/components/ContinueShelf";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Design decisions: the existing forest, terracotta, and linen palette keeps the
// child-first Sena Kids identity; the daily activity is the only strong accent;
// mixed panels mirror the varied activities rather than repeating card grids.
const iconByKind = { book: BookOpen, game: Gamepad2, lesson: GraduationCap, tv: Tv };

const pathways = [
  { label: { id: "Baca cerita", en: "Read a story" }, detail: { id: "Buku cerita dan belajar", en: "Stories and learning books" }, href: "/books", kind: "book" },
  { label: { id: "Nonton pilihan", en: "Watch a pick" }, detail: { id: "Video edukasi terkurasi", en: "Curated educational video" }, href: "/tv", kind: "tv" },
  { label: { id: "Main dan belajar", en: "Play and learn" }, detail: { id: "Game dan latihan langsung", en: "Games and hands-on practice" }, href: "/games", kind: "game" },
];

const recommendations = [
  { title: { id: "Buku cerita bergambar", en: "Illustrated storybooks" }, detail: { id: "Pilih cerita untuk dibaca bersama.", en: "Choose a story to read together." }, href: "/books", kind: "book" },
  { title: { id: "Piano interaktif", en: "Interactive piano" }, detail: { id: "Coba bunyi dan susun nadamu sendiri.", en: "Try sounds and make your own notes." }, href: "/games/built/piano", kind: "game" },
  { title: { id: "Sena TV", en: "Sena TV" }, detail: { id: "Cari topik video yang ingin kamu tonton.", en: "Find a video topic you want to watch." }, href: "/tv", kind: "tv" },
];

export default function HomeClient() {
  const { lang } = useLanguage();
  const { data: session } = useSession();
  const { history, isLoaded } = useActivityHistory("all");
  const [activity, setActivity] = useState([]);
  const [activityState, setActivityState] = useState("loading");
  const [challengeComplete, setChallengeComplete] = useState(false);
  const daily = useMemo(() => getDailyActivity(), []);
  const L = (item) => (typeof item === "object" ? item[lang] || item.id : item);
  const name = session?.user?.name?.trim()?.split(" ")[0];

  useEffect(() => {
    const sync = () => {
      try {
        setActivity(readActivity());
        setChallengeComplete(readDailyCompletion() === todayKey());
        setActivityState("ready");
      } catch {
        setActivityState("error");
      }
    };
    sync();
    window.addEventListener("senakids-activity-change", sync);
    window.addEventListener("senakids-daily-challenge-change", sync);
    return () => {
      window.removeEventListener("senakids-activity-change", sync);
      window.removeEventListener("senakids-daily-challenge-change", sync);
    };
  }, []);

  const greeting = name
    ? (lang === "en" ? `Welcome back, ${name}` : `Halo lagi, ${name}`)
    : (lang === "en" ? "What would you like to do today?" : "Mau melakukan apa hari ini?");
  const DailyIcon = iconByKind[daily.kind] || Gamepad2;

  return (
    <div className={styles.page}>
      <section className={styles.welcome} aria-labelledby="welcome-title">
        <div className={styles.welcomeCopy}>
          <p className={styles.kicker}>{lang === "en" ? "Sena Kids today" : "Sena Kids hari ini"}</p>
          <h1 id="welcome-title">{greeting}</h1>
          <p>{lang === "en" ? "Pick one small activity, then let the next idea find you." : "Pilih satu kegiatan kecil, lalu lanjutkan saat kamu siap."}</p>
        </div>
        <nav className={styles.pathways} aria-label={lang === "en" ? "Choose an activity" : "Pilih kegiatan"}>
          {pathways.map((path) => {
            const Icon = iconByKind[path.kind];
            return <Link className={styles.pathway} href={path.href} key={path.href}>
              <Icon size={22} aria-hidden="true" />
              <span><strong>{L(path.label)}</strong><small>{L(path.detail)}</small></span>
            </Link>;
          })}
        </nav>
      </section>

      <section className={styles.daily} aria-labelledby="daily-title">
        <div className={styles.dailyIcon}><DailyIcon size={30} aria-hidden="true" /></div>
        <div className={styles.dailyCopy}>
          <p>{lang === "en" ? "Today’s activity" : "Tantangan hari ini"}</p>
          <h2 id="daily-title">{daily.title}</h2>
          <span>{daily.description}</span>
        </div>
        <div className={styles.dailyActions}>
          {challengeComplete && <span className={styles.complete}><CalendarCheck size={17} aria-hidden="true" /> {lang === "en" ? "Completed" : "Sudah selesai"}</span>}
          <Link href="/daily-challenge" className={styles.dailyButton}>{lang === "en" ? "Open activity" : "Buka tantangan"}</Link>
        </div>
      </section>

      <section className={styles.activitySection} aria-labelledby="activity-title">
        {isLoaded && history.length > 0 ? (
          <ContinueShelf
            type="all"
            title={lang === "en" ? "Continue from where you left off" : "Lanjutkan yang terakhir kamu buka"}
            seeAllHref="/learning-journeys"
          />
        ) : (
          <>
            <div className={styles.sectionHeading}>
              <div><p className={styles.kicker}>{lang === "en" ? "Your activity" : "Aktivitasmu"}</p><h2 id="activity-title">{lang === "en" ? "Continue from where you left off" : "Lanjutkan yang terakhir kamu buka"}</h2></div>
              <Link href="/learning-journeys" className={styles.textLink}>{lang === "en" ? "See learning paths" : "Lihat jalur belajar"}</Link>
            </div>
            <div className={styles.empty}>
              <CirclePlay size={26} aria-hidden="true" />
              <p>{lang === "en" ? "Your recent books, videos, and games will appear here after you open one." : "Buku, video, dan game yang kamu buka akan muncul di sini."}</p>
            </div>
          </>
        )}
      </section>

      <section className={styles.recommendSection} aria-labelledby="recommend-title">
        <div className={styles.sectionHeading}><div><p className={styles.kicker}>{lang === "en" ? "Keep going" : "Lanjutkan dengan"}</p><h2 id="recommend-title">{lang === "en" ? "Three places to start" : "Tiga tempat untuk mulai"}</h2></div></div>
        <div className={styles.recommendations}>
          {recommendations.map((item, index) => { const Icon = iconByKind[item.kind] || Gamepad2; return <Link href={item.href} key={item.href} className={`${styles.recommendation} ${styles[`recommendation${index + 1}`]}`}><Icon size={26} aria-hidden="true" /><h3>{L(item.title)}</h3><p>{L(item.detail)}</p></Link>; })}
        </div>
      </section>
    </div>
  );
}
