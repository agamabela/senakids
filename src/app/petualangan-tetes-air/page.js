"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

const SCENES = [
  {
    id: 1,
    location: { id: "Di Awan", en: "In the Cloud" },
    emoji: "☁️",
    story: {
      id: "Aku adalah seekor tetes air kecil. Teman-temanku banyak sekali! Kami tinggal nyaman di dalam awan.",
      en: "I am a tiny water drop. I have many friends! We live comfortably in the cloud."
    },
    color: "#87CEEB"
  },
  {
    id: 2,
    location: { id: "Mengembun", en: "Condensing" },
    emoji: "💧",
    story: {
      id: "Tiba-tiba aku merasa berat! Aku jatuh dari awan sebagai embun. Wussshh!",
      en: "Suddenly I feel heavy! I fall from the cloud as dew. Wussshh!"
    },
    color: "#ADD8E6"
  },
  {
    id: 3,
    location: { id: "Di Sungai", en: "In the River" },
    emoji: "🌊",
    story: {
      id: "Aku mengalir di sungai! Bersama teman-teman, kami berenang menuju laut. Seru!",
      en: "I flow in the river! With my friends, we swim toward the sea. Fun!"
    },
    color: "#4169E1"
  },
  {
    id: 4,
    location: { id: "Di Laut", en: "In the Ocean" },
    emoji: "🐚",
    story: {
      id: "Akhirnya sampai di laut! Tapi jangan khawatir, aku akan kembali lagi ke awan!",
      en: "Finally I reach the ocean! But don't worry, I will go back to the cloud!"
    },
    color: "#000080"
  },
  {
    id: 5,
    location: { id: "Menguap", en: "Evaporating" },
    emoji: "♨️",
    story: {
      id: "Matahari bersinar cerah! Aku berubah menjadi uap air dan naik ke langit. Sampai jumpa!",
      en: "The sun shines brightly! I turn into water vapor and rise to the sky. See you!"
    },
    color: "#FFB6C1"
  },
  {
    id: 6,
    location: { id: "Kembali ke Awan", en: "Back to Cloud" },
    emoji: "🔄",
    story: {
      id: "Siklus air terus berulang! Inilah petualangan tanpa akhir. Terima kasih sudah menyaksikannya!",
      en: "The water cycle keeps repeating! This is an endless adventure. Thanks for watching!"
    },
    color: "#DDA0DD"
  },
];

export default function PetualanganTetesAirPage() {
  const { t, language } = useLanguage();
  const [currentScene, setCurrentScene] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scene = SCENES[currentScene];

  const nextScene = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentScene((prev) => (prev < SCENES.length - 1 ? prev + 1 : 0));
      setIsAnimating(false);
    }, 300);
  };

  const prevScene = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentScene((prev) => (prev > 0 ? prev - 1 : SCENES.length - 1));
      setIsAnimating(false);
    }, 300);
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className="absolute top-4 left-4 z-10">
        <BackButton />
      </div>
      <div className={styles.header}>
        <h1>💧 {language === "id" ? "Petualangan Tetes Air" : "Water Drop Adventure"}</h1>
        <p>{language === "id" ? "Ikuti petualangan aku, si tetes air!" : "Follow my adventure, the water drop!"}</p>
      </div>

      <div className={styles.sceneContainer}>
        <div
          className={`${styles.scene} ${isAnimating ? styles.fadeOut : ""}`}
          style={{ backgroundColor: scene.color }}
        >
          <div className={styles.emoji}>{scene.emoji}</div>
          <div className={styles.location}>{scene.location[language]}</div>
          <div className={styles.story}>{scene.story[language]}</div>
        </div>
      </div>

      <div className={styles.dots}>
        {SCENES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentScene ? styles.activeDot : ""}`}
            onClick={() => setCurrentScene(i)}
          />
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevScene}>
          ◀️
        </button>
        <button className={styles.playBtn} onClick={nextScene}>
          {currentScene === SCENES.length - 1
            ? (language === "id" ? "🔄 Ulang" : "🔄 Replay")
            : (language === "id" ? "Berikutnya ➡️" : "Next ➡️")}
        </button>
        <button className={styles.navBtn} onClick={nextScene}>
          ▶️
        </button>
      </div>

      <div className={styles.cycleDiagram}>
        <div className={styles.cycleTitle}>
          {language === "id" ? "♻️ Siklus Air" : "♻️ Water Cycle"}
        </div>
        <div className={styles.cycleSteps}>
          <span>💧 Embun</span>
          <span>🌊 Sungai</span>
          <span>🐚 Laut</span>
          <span>♨️ Uap</span>
          <span>☁️ Awan</span>
        </div>
      </div>
    </div>
  );
}