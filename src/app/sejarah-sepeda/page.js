"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

const TIMELINE = [
  {
    year: "1817",
    title: { id: "Draisienne", en: "Draisienne" },
    description: {
      id: "Baron German dari Karlsruhe menciptakan alat berjalan yang menggunakan dua roda. Tidak ada pedal!",
      en: "Baron German from Karlsruhe created a walking device with two wheels. No pedals!"
    },
    emoji: "🚶"
  },
  {
    year: "1839",
    title: { id: "Sepeda Kirkpatrick", en: "Kirkpatrick Bicycle" },
    description: {
      id: "Kirkpatrick MacMillan menambahkan pedal ke roda depan. Orang-Orang Scotland menciptakan ini!",
      en: "Kirkpatrick MacMillan added pedals to the front wheel. Scots invented this!"
    },
    emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
  },
  {
    year: "1860-an",
    title: { id: "Sepeda Boneshaker", en: "Boneshaker Bicycle" },
    description: {
      id: "Roda depan besar dan roda kecil di belakang. Sangat populer tapi berbahaya!",
      en: "Big front wheel and small back wheel. Very popular but dangerous!"
    },
    emoji: "☠️"
  },
  {
    year: "1876",
    safety: true,
    title: { id: "Sepeda Safety", en: "Safety Bicycle" },
    description: {
      id: "Kedua roda sama besar! Ini adalah nenek dari sepeda modern yang kita gunakan sekarang.",
      en: "Both wheels are the same size! This is the grandparent of modern bicycles."
    },
    emoji: "✅"
  },
  {
    year: "1888",
    title: { id: "Ban Dalam", en: "Pneumatic Tires" },
    description: {
      id: "John Boyd Dunlop menciptakan ban luar yang lembut. Sekarang bersepeda menjadi nyaman!",
      en: "John Boyd Dunlop created soft outer tires. Now cycling is comfortable!"
    },
    emoji: "🍩"
  },
  {
    year: "2024",
    title: { id: "Sepeda Masa Depan", en: "Future Bicycles" },
    description: {
      id: "Sekarang ada Sepeda Listrik, Sepeda Lipat, dan banyak lagi! Kita bisa memilih sesuai kebutuhan.",
      en: "Now there are Electric Bikes, Folding Bikes, and more! We can choose what we need."
    },
    emoji: "⚡🚲"
  },
];

export default function SejarahSepedaPage() {
  const { t, language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slide = TIMELINE[currentSlide];

  const next = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev < TIMELINE.length - 1 ? prev + 1 : 0));
  };

  const prev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : TIMELINE.length - 1));
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className="absolute top-4 left-4 z-10">
        <BackButton />
      </div>
      <div className={styles.header}>
        <h1>🚲 {language === "id" ? "Sejarah Sepeda" : "History of Bicycles"}</h1>
        <p>{language === "id" ? "Mari kita belajar bagaimana sepeda berevolusi!" : "Let's learn how bicycles evolved!"}</p>
      </div>

      <div className={styles.timeline}>
        {TIMELINE.map((item, i) => (
          <div key={i} className={`${styles.timelineItem} ${i === currentSlide ? styles.active : ""}`}>
            <div className={styles.year}>{item.year}</div>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${direction > 0 ? styles.slideRight : direction < 0 ? styles.slideLeft : ""}`}>
        <div className={styles.emoji}>{slide.emoji}</div>
        <h2>{slide.title[language]}</h2>
        <p>{slide.description[language]}</p>
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prev}>
          ◀️
        </button>
        <div className={styles.counter}>
          {currentSlide + 1} / {TIMELINE.length}
        </div>
        <button className={styles.navBtn} onClick={next}>
          ▶️
        </button>
      </div>

      <div className={styles.funFact}>
        <h3>💡 {language === "id" ? "Tahukah kamu?" : "Did you know?"}</h3>
        <p>
          {language === "id"
            ? "Tidak ada yang tahu siapa yang pertama kali menciptakan sepeda! Tapi kita tahu bahwa perjalanan panjang telah dilalui hingga menjadi seperti sekarang."
            : "No one knows who invented the bicycle first! But we know it took a long journey to become what it is today."}
        </p>
      </div>
    </div>
  );
}