"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Gamepad2, Tv } from "lucide-react";
import { readActivity } from "@/lib/journey";
import styles from "./page.module.css";

const journeys = [
  { title: "Cerita jadi permainan", description: "Mulai dengan cerita, lanjutkan dengan permainan kata.", accent: "book", steps: [{ label: "Pilih sebuah cerita", href: "/books" }, { label: "Main Tebak Gambar", href: "/games/built/tebak-gambar" }] },
  { title: "Nada dan pola", description: "Dengar, buat irama, lalu coba pola logika.", accent: "tv", steps: [{ label: "Pilih video musik", href: "/tv" }, { label: "Main drum", href: "/games/built/drum" }, { label: "Buat jalur", href: "/games/built/membuat-jalur" }] },
  { title: "Petualangan angka", description: "Berlatih angka dalam permainan yang bisa disentuh langsung.", accent: "game", steps: [{ label: "Lacak angka", href: "/games/built/lacak-angka" }, { label: "Urutkan bola angka", href: "/games/built/urutkan-bola-angka" }] },
];
const icons = { book: BookOpen, game: Gamepad2, tv: Tv };

export default function LearningJourneysClient() {
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    const sync = () => setActivity(readActivity());
    sync();
    window.addEventListener("senakids-activity-change", sync);
    return () => window.removeEventListener("senakids-activity-change", sync);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p>Jalur belajar</p>
        <h1>Mau mencoba apa hari ini?</h1>
        <span>Pilih urutan kegiatan yang bisa dilakukan satu per satu, tanpa harus menyelesaikannya sekaligus.</span>
      </header>
      <div className={styles.journeys}>
        {journeys.map((journey) => {
          const Icon = icons[journey.accent];
          const complete = journey.steps.filter((step) => activity.some((item) => item.href === step.href)).length;
          return <section className={styles.journey} key={journey.title}>
            <div className={styles.journeyHeading}><Icon size={24} aria-hidden="true" /><div><h2>{journey.title}</h2><p>{journey.description}</p></div></div>
            <ol className={styles.steps}>{journey.steps.map((step) => <li key={step.href} className={activity.some((item) => item.href === step.href) ? styles.done : ""}><Link href={step.href}>{step.label}</Link></li>)}</ol>
            <p className={styles.progress}>{complete === 0 ? "Belum dimulai" : `${complete} kegiatan sudah dibuka`}</p>
          </section>;
        })}
      </div>
    </main>
  );
}
