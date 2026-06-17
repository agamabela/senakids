"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

const STEPS = [
  {
    step: 1,
    title: { id: "Matahari Panas", en: "Hot Sun" },
    emoji: "☀️",
    description: {
      id: "Matahari memancarkan panas yang sangat kuat. Panas ini membuat air di laut, danau, dan sungai menjadi hangat.",
      en: "The sun emits very strong heat. This heat makes water in oceans, lakes, and rivers warm."
    },
    icon: "🔥"
  },
  {
    step: 2,
    title: { id: "Menguap", en: "Evaporation" },
    emoji: "♨️",
    description: {
      id: "Air yang hangat berubah menjadi uap air dan naik ke langit seperti smoke! Ini disebut penguapan.",
      en: "Warm water turns into water vapor and rises to the sky like smoke! This is called evaporation."
    },
    icon: "⬆️"
  },
  {
    step: 3,
    title: { id: "Membentuk Awan", en: "Forming Clouds" },
    emoji: "☁️",
    description: {
      id: "Uap air naik semakin tinggi dan dingin. Uap ini berubah menjadi titik-titik kecil air dan membentuk awan.",
      en: "Water vapor rises higher and gets colder. This vapor turns into tiny water droplets and forms clouds."
    },
    icon: "🌫️"
  },
  {
    step: 4,
    title: { id: "Pendinginan", en: "Cooling Down" },
    emoji: "❄️",
    description: {
      id: "Semakin tinggi, udara semakin dingin. Titik-titik air di awan menjadi sangat dingin dan berkondensasi.",
      en: "The higher you go, the colder the air. Water droplets in the cloud become very cold and condense."
    },
    icon: "⏳"
  },
  {
    step: 5,
    title: { id: "Hujan Turun", en: "Rain Falls" },
    emoji: "🌧️",
    description: {
      id: "Titik-titik air menjadi terlalu berat untuk tetap di awan. Akhirnya mereka jatuh ke Bumi sebagai hujan!",
      en: "Water droplets become too heavy to stay in the cloud. Finally they fall to Earth as rain!"
    },
    icon: "⬇️"
  },
  {
    step: 6,
    title: { id: "Siklus Berulang", en: "Cycle Repeats" },
    emoji: "🔄",
    description: {
      id: "Air hujan mengalir kembali ke laut, sungai, dan danau. Siklus akan dimulai lagi! Alam itu luar biasa!",
      en: "Rain water flows back to oceans, rivers, and lakes. The cycle will start again! Nature is amazing!"
    },
    icon: "✨"
  },
];

export default function MengenalHujanPage() {
  const { t, language } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  const [showDiagram, setShowDiagram] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const step = STEPS[activeStep];

  const nextStep = () => {
    setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0));
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1));
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className="absolute top-4 left-4 z-10">
        <BackButton />
      </div>
      <div className={styles.header}>
        <h1>🌧️ {language === "id" ? "Mengenal Hujan" : "Understanding Rain"}</h1>
        <p>{language === "id" ? "Mari belajar bagaimana hujan terbentuk!" : "Let's learn how rain is formed!"}</p>
      </div>

      <div className={styles.stepIndicator}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`${styles.stepDot} ${i <= activeStep ? styles.completed : ""} ${i === activeStep ? styles.active : ""}`}
            onClick={() => setActiveStep(i)}
          >
            <span className={styles.stepNumber}>{s.step}</span>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.iconBadge}>{step.icon}</div>
        <div className={styles.emoji}>{step.emoji}</div>
        <h2>{step.title[language]}</h2>
        <p>{step.description[language]}</p>
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevStep}>
          ◀️
        </button>
        <button className={styles.diagramBtn} onClick={() => setShowDiagram(!showDiagram)}>
          {showDiagram ? "❌" : "📊"} {showDiagram ? (language === "id" ? "Sembunyikan" : "Hide") : (language === "id" ? "Lihat Diagram" : "Show Diagram")}
        </button>
        <button className={styles.navBtn} onClick={nextStep}>
          ▶️
        </button>
      </div>

      {showDiagram && (
        <div className={styles.diagram}>
          <h3>{language === "id" ? "📊 Diagram Pembentukan Hujan" : "📊 Rain Formation Diagram"}</h3>
          <div className={styles.diagramFlow}>
            <div className={styles.diagramItem}>☀️ {language === "id" ? "Matahari" : "Sun"}</div>
            <div className={styles.arrow}>⬇️</div>
            <div className={styles.diagramItem}>♨️ {language === "id" ? "Penguapan" : "Evaporation"}</div>
            <div className={styles.arrow}>⬆️</div>
            <div className={styles.diagramItem}>☁️ {language === "id" ? "Awan" : "Cloud"}</div>
            <div className={styles.arrow}>⬇️</div>
            <div className={styles.diagramItem}>🌧️ {language === "id" ? "Hujan" : "Rain"}</div>
          </div>
        </div>
      )}

      <div className={styles.summary}>
        <h3>💡 {language === "id" ? "Ringkasan" : "Summary"}</h3>
        <p>
          {language === "id"
            ? "Hujan terbentuk melalui siklus: Matahari → Menguap → Awan → Hujan → Ulang!"
            : "Rain forms through a cycle: Sun → Evaporate → Cloud → Rain → Repeat!"}
        </p>
      </div>
    </div>
  );
}