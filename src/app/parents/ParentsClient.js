"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Volume2, VolumeX, Shield, AlertTriangle, Trash2, Heart, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./parents.module.css";

const TIMER_OPTIONS = [
  { value: 0, labelKey: "parents.timerOff" },
  { value: 15, labelKey: "parents.timer15" },
  { value: 30, labelKey: "parents.timer30" },
  { value: 45, labelKey: "parents.timer45" },
  { value: 60, labelKey: "parents.timer60" },
];

export default function ParentsPage() {
  const { t, tx } = useLanguage();
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [quietMode, setQuietMode] = useState(false);
  const [savedNotification, setSavedNotification] = useState("");

  useEffect(() => {
    try {
      const savedTimer = localStorage.getItem("senakids_screen_timer");
      if (savedTimer) setTimerMinutes(Number(savedTimer));
      const savedQuiet = localStorage.getItem("senakids_quiet_mode");
      if (savedQuiet === "true") setQuietMode(true);
    } catch {}
  }, []);

  const handleTimerChange = (val) => {
    setTimerMinutes(val);
    try {
      localStorage.setItem("senakids_screen_timer", val.toString());
      setSavedNotification(tx("Pengaturan timer disimpan!", "Timer settings saved!"));
      setTimeout(() => setSavedNotification(""), 3000);
    } catch {}
  };

  const handleQuietToggle = () => {
    const next = !quietMode;
    setQuietMode(next);
    try {
      localStorage.setItem("senakids_quiet_mode", next ? "true" : "false");
      setSavedNotification(tx("Pengaturan mode tenang disimpan!", "Quiet mode setting saved!"));
      setTimeout(() => setSavedNotification(""), 3000);
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn} aria-label={t("common.back")}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className={styles.badge}>
            <Shield size={16} />
            <span>{tx("Area Khusus Orang Tua / Pendidik", "Parent & Educator Area")}</span>
          </div>
          <h1 className={styles.title}>{t("parents.title")}</h1>
          <p className={styles.subtitle}>{t("parents.subtitle")}</p>
        </div>
      </div>

      {savedNotification && (
        <div className={styles.savedBanner}>
          <CheckCircle2 size={18} />
          <span>{savedNotification}</span>
        </div>
      )}

      <div className={styles.grid}>
        {/* Screen Time Timer */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconCircle} style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
              <Clock size={24} />
            </div>
            <div>
              <h2>{t("parents.timerTitle")}</h2>
              <p>{t("parents.timerDesc")}</p>
            </div>
          </div>
          <div className={styles.timerOptions}>
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.timerBtn} ${timerMinutes === opt.value ? styles.timerBtnActive : ""}`}
                onClick={() => handleTimerChange(opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          {timerMinutes > 0 && (
            <p className={styles.activeHint}>
              ⏱️ {tx(`Batas waktu harian diatur ke ${timerMinutes} menit.`, `Daily limit configured for ${timerMinutes} minutes.`)}
            </p>
          )}
        </section>

        {/* Quiet Mode */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconCircle} style={{ background: "#F2EBE1", color: "#6E5D4F" }}>
              {quietMode ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </div>
            <div>
              <h2>{t("parents.quietModeTitle")}</h2>
              <p>{t("parents.quietModeDesc")}</p>
            </div>
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${quietMode ? styles.toggleActive : ""}`}
              onClick={handleQuietToggle}
            >
              {quietMode ? tx("Mode Tenang Aktif (Musik Hening)", "Quiet Mode Active (Muted)") : tx("Mode Standar (Musik Latar Tersedia)", "Standard Mode (Music Allowed)")}
            </button>
          </div>
        </section>

        {/* Parenting Guide Tips */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconCircle} style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
              <Heart size={24} />
            </div>
            <div>
              <h2>{t("parents.guideTitle")}</h2>
              <p>{t("parents.guideBody")}</p>
            </div>
          </div>
          <ul className={styles.tipsList}>
            <li>
              <strong>{tx("Membaca Bersama:", "Co-Reading:")}</strong> {tx("Bacakan buku cerita bergambar 15 menit setiap malam untuk merangsang imajinasi anak.", "Read picture books together 15 minutes each evening to boost creativity.")}
            </li>
            <li>
              <strong>{tx("Diskusi Nilai Kebaikan:", "Discuss Morals:")}</strong> {tx("Diskusikan pesan tolong menolong, empati, dan kejujuran dari tayangan video.", "Discuss kindness, empathy, and honesty from educational video episodes.")}
            </li>
            <li>
              <strong>{tx("Istirahat Teratur:", "Regular Breaks:")}</strong> {tx("Terapkan aturan 20-20-20: setiap 20 menit layar, istirahatkan mata melihat jarak jauh.", "Practice the 20-20-20 habit: every 20 minutes, take a pause to look at distant objects.")}
            </li>
          </ul>
        </section>

        {/* Data & Content Controls */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.iconCircle} style={{ background: "#FEE2E2", color: "#DC2626" }}>
              <Shield size={24} />
            </div>
            <div>
              <h2>{t("parents.dataControlTitle")}</h2>
              <p>{t("parents.dataControlDesc")}</p>
            </div>
          </div>
          <div className={styles.controlButtons}>
            <Link href="/contact" className={styles.reportBtn}>
              <AlertTriangle size={18} />
              <span>{t("parents.reportContentBtn")}</span>
            </Link>
            <Link href="/contact" className={styles.deleteBtn}>
              <Trash2 size={18} />
              <span>{t("parents.requestDeletionBtn")}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
