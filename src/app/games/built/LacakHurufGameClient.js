"use client";

import { useCallback, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import TraceStage from "@/components/TraceStage";
import { STROKES_UPPER, STROKES_LOWER, LETTER_WORDS } from "@/lib/traceData";
import styles from "./LacakHurufGameClient.module.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function speak(text, lang) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "id" ? "id-ID" : "en-US";
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* ignore */ }
}

export default function LacakHurufGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("menu"); // menu | trace
  const [idx, setIdx] = useState(0);
  const [caseMode, setCaseMode] = useState("upper");
  const [resetKey, setResetKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const advTimer = useRef(null);

  const U = LETTERS[idx];
  const Lc = U.toLowerCase();
  const glyph = caseMode === "upper" ? U : Lc;
  const strokes = caseMode === "upper" ? STROKES_UPPER[U] : STROKES_LOWER[Lc];
  const word = (LETTER_WORDS[U] && LETTER_WORDS[U][language]) || LETTER_WORDS[U].id;

  const openLetter = useCallback((i) => {
    clearTimeout(advTimer.current);
    setIdx(i); setCaseMode("upper"); setResetKey((k) => k + 1); setCelebrate(false); setScreen("trace");
  }, []);
  const goLetter = useCallback((n) => {
    clearTimeout(advTimer.current);
    setIdx((n + 26) % 26); setCaseMode("upper"); setResetKey((k) => k + 1); setCelebrate(false);
  }, []);
  const clearInk = () => { setResetKey((k) => k + 1); setCelebrate(false); };
  const switchCase = (m) => { if (m !== caseMode) { setCaseMode(m); setResetKey((k) => k + 1); setCelebrate(false); } };

  const onComplete = useCallback(() => {
    setHasChanges(true);
    setCelebrate(true);
    speak(glyph, language);
    clearTimeout(advTimer.current);
    advTimer.current = setTimeout(() => {
      if (caseMode === "upper") { setCaseMode("lower"); setResetKey((k) => k + 1); setCelebrate(false); }
    }, 1300);
  }, [caseMode, glyph, language, setHasChanges]);

  // ── MENU: choose a letter ──
  if (screen === "menu") {
    return (
      <div className={styles.menuWrap}>
        <h1 className={styles.menuTitle}>✏️ {t("Pilih Huruf", "Pick a Letter")}</h1>
        <p className={styles.menuSub}>{t("Ketuk huruf untuk mulai menulis!", "Tap a letter to start writing!")}</p>
        <div className={styles.letterGrid}>
          {LETTERS.map((c, i) => {
            const w = (LETTER_WORDS[c] && LETTER_WORDS[c][language]) || LETTER_WORDS[c].id;
            return (
              <button key={c} className={styles.letterCard} onClick={() => openLetter(i)}>
                <span className={styles.cardLetters}>{c}{c.toLowerCase()}</span>
                <span className={styles.cardEmoji}>{w.emoji}</span>
                <span className={styles.cardWord}>{w.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── TRACE ──
  return (
    <div className={styles.wrapper}>
      <button className={styles.backToMenu} onClick={() => { clearTimeout(advTimer.current); setScreen("menu"); }}>
        ◀ {t("Semua Huruf", "All Letters")}
      </button>

      <div className={styles.headerCard}>
        <button className={styles.speakBtn} onClick={() => speak(`${glyph}. ${word.word}`, language)} aria-label="Dengar">🔊</button>
        <div className={styles.bigLetters}>
          <span className={styles.upper}>{U}</span>
          <span className={styles.lower}>{Lc}</span>
        </div>
        <div className={styles.wordBox}>
          <span className={styles.wordEmoji}>{word.emoji}</span>
          <span className={styles.wordText}>{word.word}</span>
        </div>
      </div>

      <div className={styles.caseTabs}>
        <button className={`${styles.caseTab} ${caseMode === "upper" ? styles.caseActive : ""}`} onClick={() => switchCase("upper")}>
          {t("Huruf Besar", "Uppercase")} <b>{U}</b>
        </button>
        <button className={`${styles.caseTab} ${caseMode === "lower" ? styles.caseActive : ""}`} onClick={() => switchCase("lower")}>
          {t("Huruf Kecil", "Lowercase")} <b>{Lc}</b>
        </button>
      </div>

      <div className={styles.stageWrap}>
        <TraceStage glyph={glyph} strokes={strokes} accent="#3b82d6" resetKey={`${U}-${caseMode}-${resetKey}`} onComplete={onComplete} />
        {celebrate && <div className={styles.celebrate}>⭐ {t("Bagus!", "Great!")}</div>}
      </div>

      <p className={styles.hint}>
        {t("Mulai dari titik oranye, ikuti panah & titik-titik!", "Start at the orange dot, follow the arrow & dots!")}
      </p>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={() => goLetter(idx - 1)}>◀</button>
        <button className={styles.clearBtn} onClick={clearInk}>🧽 {t("Ulangi", "Clear")}</button>
        <button className={styles.ctrlBtn} onClick={() => goLetter(idx + 1)}>▶</button>
      </div>

      <div className={styles.progress}>
        {LETTERS.map((c, i) => (
          <button key={c} className={`${styles.progDot} ${i === idx ? styles.progActive : ""}`} onClick={() => goLetter(i)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
