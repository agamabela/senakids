"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Learning path (skill tree) + HUD
// ---------------------------------------------------------------------------
// The home screen for the Owly program. Shows the HUD (streak / hearts / gems /
// XP), then a vertical skill-tree of units. Unit 1 is playable; later units
// show a friendly "Segera Hadir!" (Coming Soon) banner per the GDD. Selecting a
// lesson node mounts the LessonPlayer; finishing returns here.
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import Owly from "./Owly";
import LessonPlayer from "./LessonPlayer";
import { UNITS, LESSONS, lessonsByUnit, CROWNS } from "./lessonData";
import { useOwlyProgress, MAX_HEARTS } from "./useOwlyProgress";
import styles from "./OwlyClient.module.css";

const crownIcon = (key) => CROWNS.find((c) => c.key === key)?.icon || "";

export default function OwlyClient() {
  const { language } = useLanguage();
  const t = (id, en) => (language === "id" ? id : en);
  const L = (o) => (o && typeof o === "object" ? (o[language] ?? o.id) : o);

  const [activeLesson, setActiveLesson] = useState(null);

  const hydrate = useOwlyProgress((s) => s.hydrate);
  const hydrated = useOwlyProgress((s) => s.hydrated);
  const xp = useOwlyProgress((s) => s.xp);
  const gems = useOwlyProgress((s) => s.gems);
  const hearts = useOwlyProgress((s) => s.hearts);
  const streak = useOwlyProgress((s) => s.streak);
  const crowns = useOwlyProgress((s) => s.crowns);

  // Load persisted progress on the client only (avoids SSR hydration mismatch).
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (activeLesson) {
    return <LessonPlayer lesson={activeLesson} onExit={() => setActiveLesson(null)} />;
  }

  // A lesson unlocks once the previous lesson in its unit has a crown.
  const isUnlocked = (lesson, idxInUnit, unitLessons) => {
    if (idxInUnit === 0) return true;
    const prev = unitLessons[idxInUnit - 1];
    return Boolean(crowns[prev.id]);
  };

  return (
    <div className={styles.page}>
      {/* ── HUD ── */}
      <div className={styles.hud}>
        <div className={styles.hudItem} title={t("Streak", "Streak")}>
          <span className={styles.hudIcon}>🔥</span>
          <span className={styles.hudVal}>{hydrated ? streak : 0}</span>
        </div>
        <div className={styles.hudItem} title={t("Nyawa", "Hearts")}>
          <span className={styles.hudIcon}>❤️</span>
          <span className={styles.hudVal}>{hydrated ? hearts : MAX_HEARTS}/{MAX_HEARTS}</span>
        </div>
        <div className={styles.hudItem} title={t("Permata", "Gems")}>
          <span className={styles.hudIcon}>💎</span>
          <span className={styles.hudVal}>{hydrated ? gems : 0}</span>
        </div>
        <div className={styles.hudItem} title="XP">
          <span className={styles.hudIcon}>⭐</span>
          <span className={styles.hudVal}>{hydrated ? xp : 0}</span>
        </div>
      </div>

      {/* ── Header with mascot ── */}
      <div className={styles.header}>
        <Owly state="idle" size={90} />
        <div>
          <h1 className={styles.title}>Owly</h1>
          <p className={styles.tagline}>
            {t("Belajar, Bermain, Tumbuh — satu hoot dalam satu waktu!", "Learn, Play, Grow — one hoot at a time!")}
          </p>
        </div>
      </div>

      {/* ── Units + lesson nodes ── */}
      {UNITS.map((unit) => {
        const unitLessons = lessonsByUnit(unit.id);
        return (
          <section key={unit.id} className={styles.unit}>
            <div className={styles.unitHeader} style={{ background: unit.color }}>
              <span className={styles.unitEmoji}>{unit.emoji}</span>
              <div className={styles.unitTitleWrap}>
                <span className={styles.unitLabel}>{t("Unit", "Unit")} {unit.id}</span>
                <span className={styles.unitTitle}>{L(unit.title)}</span>
              </div>
            </div>

            {unit.locked ? (
              <div className={styles.comingSoon}>
                🔒 {t("Segera Hadir!", "Coming Soon!")}
              </div>
            ) : (
              <div className={styles.lessonTrack}>
                {unitLessons.map((lesson, i) => {
                  const unlocked = isUnlocked(lesson, i, unitLessons);
                  const crown = hydrated ? crowns[lesson.id] : null;
                  return (
                    <motion.button
                      key={lesson.id}
                      className={`${styles.node} ${!unlocked ? styles.nodeLocked : ""} ${crown ? styles.nodeDone : ""}`}
                      onClick={() => unlocked && setActiveLesson(lesson)}
                      whileHover={unlocked ? { scale: 1.05 } : {}}
                      whileTap={unlocked ? { scale: 0.96 } : {}}
                      disabled={!unlocked}
                      style={{ marginLeft: `${Math.sin(i * 1.1) * 40 + 40}px` }}
                    >
                      <span className={styles.nodeEmoji}>{unlocked ? lesson.emoji : "🔒"}</span>
                      {crown && <span className={styles.nodeCrown}>{crownIcon(crown)}</span>}
                      <span className={styles.nodeLabel}>{L(lesson.title)}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <p className={styles.footNote}>
        {t(
          "Lebih banyak unit akan segera hadir. Selesaikan setiap pelajaran untuk membuka yang berikutnya!",
          "More units coming soon. Finish each lesson to unlock the next!"
        )}
      </p>
    </div>
  );
}
