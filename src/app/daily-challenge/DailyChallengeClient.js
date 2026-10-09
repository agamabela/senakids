"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Check, Gamepad2, GraduationCap, Tv } from "lucide-react";
import { getDailyActivity, readDailyCompletion, saveDailyCompletion, todayKey } from "@/lib/journey";
import styles from "./page.module.css";

const icons = { book: BookOpen, game: Gamepad2, lesson: GraduationCap, tv: Tv };

export default function DailyChallengeClient() {
  const [completed, setCompleted] = useState(false);
  const activity = getDailyActivity();
  const Icon = icons[activity.kind] || Gamepad2;

  useEffect(() => {
    const sync = () => setCompleted(readDailyCompletion() === todayKey());
    sync();
    window.addEventListener("senakids-daily-challenge-change", sync);
    return () => window.removeEventListener("senakids-daily-challenge-change", sync);
  }, []);

  const markComplete = () => {
    saveDailyCompletion(todayKey());
    setCompleted(true);
  };

  return (
    <main className={styles.page}>
      <section className={styles.challenge} aria-labelledby="daily-title">
        <div className={styles.iconWrap}><Icon size={34} aria-hidden="true" /></div>
        <p className={styles.eyebrow}>Tantangan hari ini</p>
        <h1 id="daily-title">{activity.title}</h1>
        <p className={styles.description}>{activity.description}</p>
        <div className={styles.actions}>
          <Link href={activity.href} className={styles.startButton}>Mulai kegiatan</Link>
          <button type="button" className={styles.completeButton} onClick={markComplete} disabled={completed}>
            <Check size={18} aria-hidden="true" />
            {completed ? "Sudah selesai hari ini" : "Tandai sudah selesai"}
          </button>
        </div>
        <p className={styles.note}>Tanda selesai disimpan di perangkat ini.</p>
      </section>
    </main>
  );
}
