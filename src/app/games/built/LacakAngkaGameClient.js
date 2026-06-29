"use client";

import { useCallback, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import TraceStage from "@/components/TraceStage";
import { STROKES_DIGIT, NUMBER_WORDS } from "@/lib/traceData";
import styles from "./LacakHurufGameClient.module.css";

const DIGITS = "0123456789".split("");

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

const LEVELS = [
  { key: "easy", id: "Mudah", en: "Easy", icon: "🟢" },
  { key: "medium", id: "Sedang", en: "Medium", icon: "🟡" },
  { key: "hard", id: "Sulit", en: "Hard", icon: "🔴" },
];

export default function LacakAngkaGameClient() {
  const { language } = useLanguage();
  const setHasChanges = useActivityStore((s) => s.setHasChanges);
  const t = (id, en) => (language === "id" ? id : en);

  const [screen, setScreen] = useState("menu");
  const [idx, setIdx] = useState(1);
  const [level, setLevel] = useState("easy");
  const [resetKey, setResetKey] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [fail, setFail] = useState(false);
  const [reveal, setReveal] = useState(false);
  const failTimer = useRef(null);
  const stageRef = useRef(null);

  const D = DIGITS[idx];
  const strokes = STROKES_DIGIT[D];
  const info = NUMBER_WORDS[D];
  const word = language === "id" ? info.id : info.en;
  const count = parseInt(D, 10);

  const reset = () => { clearTimeout(failTimer.current); setResetKey((k) => k + 1); setCelebrate(false); setFail(false); setReveal(false); };
  const openDigit = useCallback((i) => { setIdx(i); setResetKey((k) => k + 1); setCelebrate(false); setFail(false); setReveal(false); setScreen("trace"); }, []);
  const goDigit = useCallback((n) => { clearTimeout(failTimer.current); setIdx((n + 10) % 10); setResetKey((k) => k + 1); setCelebrate(false); setFail(false); setReveal(false); }, []);
  const switchLevel = (m) => { if (m !== level) { setLevel(m); reset(); } };

  const onComplete = useCallback(() => { setHasChanges(true); setCelebrate(true); setFail(false); setReveal(false); speak(word, language); }, [word, language, setHasChanges]);
  const onCheck = () => {
    const ok = stageRef.current?.check();
    if (!ok) {
      setFail(true); setReveal(true);
      clearTimeout(failTimer.current);
      failTimer.current = setTimeout(() => { setFail(false); setReveal(false); }, 2400);
    }
  };

  if (screen === "menu") {
    return (
      <div className={styles.menuWrap}>
        <h1 className={styles.menuTitle}>🔢 {t("Pilih Angka", "Pick a Number")}</h1>
        <p className={styles.menuSub}>{t("Pilih tingkat lalu ketuk angka!", "Pick a level, then tap a number!")}</p>
        <div className={styles.levelTabs} style={{ justifyContent: "center", marginBottom: 14 }}>
          {LEVELS.map((lv) => (
            <button key={lv.key} className={`${styles.levelTab} ${level === lv.key ? styles.levelActive : ""}`} onClick={() => setLevel(lv.key)}>
              {lv.icon} {t(lv.id, lv.en)}
            </button>
          ))}
        </div>
        <div className={styles.letterGrid}>
          {DIGITS.map((c, i) => {
            const inf = NUMBER_WORDS[c];
            return (
              <button key={c} className={styles.letterCard} onClick={() => openDigit(i)}>
                <span className={styles.cardLetters}>{c}</span>
                <span className={styles.cardEmoji}>{i === 0 ? "🫧" : inf.emoji.repeat(Math.min(i, 5))}</span>
                <span className={styles.cardWord}>{language === "id" ? inf.id : inf.en}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.backToMenu} onClick={() => setScreen("menu")}>◀ {t("Semua Angka", "All Numbers")}</button>

      <div className={styles.headerCard}>
        <button className={styles.speakBtn} onClick={() => speak(`${D}. ${word}`, language)} aria-label="Dengar">🔊</button>
        <div className={styles.bigLetters}><span className={styles.upper}>{D}</span></div>
        <div className={styles.wordBox}>
          <span className={styles.wordEmoji} style={{ fontSize: "1.5rem", letterSpacing: "1px" }}>{count === 0 ? "🫧" : info.emoji.repeat(Math.min(count, 9))}</span>
          <span className={styles.wordText}>{word}</span>
        </div>
      </div>

      <div className={styles.levelTabs}>
        {LEVELS.map((lv) => (
          <button key={lv.key} className={`${styles.levelTab} ${level === lv.key ? styles.levelActive : ""}`} onClick={() => switchLevel(lv.key)}>
            {lv.icon} {t(lv.id, lv.en)}
          </button>
        ))}
      </div>

      <div className={styles.stageWrap}>
        <TraceStage ref={stageRef} glyph={D} strokes={strokes} accent="#16a34a" level={level} reveal={reveal} resetKey={`${D}-${level}-${resetKey}`} onComplete={onComplete} />
        {celebrate && <div className={styles.celebrate}>⭐ {t("Bagus!", "Great!")}</div>}
        {fail && <div className={styles.failBanner}>🤔 {t("Begini angka yang benar — coba lagi!", "Here's the correct number — try again!")}</div>}
      </div>

      <p className={styles.hint}>
        {level === "hard"
          ? t("Tulis angkanya sendiri, lalu tekan Periksa!", "Write the number yourself, then press Check!")
          : level === "medium"
          ? t("Ikuti garis tipis dari titik oranye!", "Follow the thin line from the orange dot!")
          : t("Mulai dari titik oranye, ikuti panah & titik-titik!", "Start at the orange dot, follow the arrow & dots!")}
      </p>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={() => goDigit(idx - 1)}>◀</button>
        <button className={styles.clearBtn} onClick={reset}>🧽 {t("Ulangi", "Clear")}</button>
        {level === "hard" && <button className={styles.checkBtn} onClick={onCheck}>✓ {t("Periksa", "Check")}</button>}
        <button className={styles.ctrlBtn} onClick={() => goDigit(idx + 1)}>▶</button>
      </div>

      <div className={styles.progress}>
        {DIGITS.map((c, i) => (
          <button key={c} className={`${styles.progDot} ${i === idx ? styles.progActive : ""}`} onClick={() => goDigit(i)}>{c}</button>
        ))}
      </div>
    </div>
  );
}
