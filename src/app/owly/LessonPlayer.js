"use client";

// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Lesson Player engine
// ---------------------------------------------------------------------------
// Runs one lesson end-to-end. It walks the lesson's `exercises` array, renders
// the matching exercise component by `type`, tracks XP/gems and first-try
// accuracy (for the crown), and shows the celebration screen at the end.
//
// Adding a new exercise type = add a data object in lessonData.js + a renderer
// in the `RENDERERS` map below. The engine itself never needs to change.
// ═══════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";
import TraceStage from "@/components/TraceStage";
import { STROKES_UPPER } from "@/lib/traceData";
import Owly from "./Owly";
import { speak, sfx } from "./owlyAudio";
import { XP, CROWNS } from "./lessonData";
import { useOwlyProgress } from "./useOwlyProgress";
import styles from "./LessonPlayer.module.css";

// Pick the right value from a bilingual { id, en } object (or pass through).
const pick = (v, lang) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.id) : v);

// Owly encouragement lines (from the GDD dialogue library).
const CORRECT_LINES = {
  id: ["Ya! Kamu benar!", "Hebat sekali!", "Pintar sekali!", "Kamu membara! 🔥"],
  en: ["Yes! You got it!", "Great job!", "So smart!", "You're on fire! 🔥"],
};
const WRONG_LINES = {
  id: ["Hampir! Coba lagi ya.", "Ups! Yang itu tricky.", "Kesalahan bikin kita tumbuh!"],
  en: ["Almost! Try again.", "Oops! That one's tricky.", "Mistakes help us grow!"],
};
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function LessonPlayer({ lesson, onExit }) {
  const { language } = useLanguage();
  const t = (id, en) => (language === "id" ? id : en);
  const finishLesson = useOwlyProgress((s) => s.finishLesson);
  const loseHeart = useOwlyProgress((s) => s.loseHeart);

  const total = lesson.exercises.length;
  const [step, setStep] = useState(-1); // -1 = intro screen
  const [owlyState, setOwlyState] = useState("idle");
  const [owlyMsg, setOwlyMsg] = useState(pick(lesson.intro, language));
  const [done, setDone] = useState(false);

  // Accuracy tracking for the crown (share answered right on first try).
  const firstTryRef = useRef(0);
  const earnedXpRef = useRef(0);
  const earnedGemsRef = useRef(0);

  const startLesson = useCallback(() => {
    setStep(0);
    setOwlyState("idle");
    setOwlyMsg("");
  }, []);

  // Called by an exercise when the child answers.
  const handleResult = useCallback(
    (correct, { firstTry } = { firstTry: true }) => {
      const ex = lesson.exercises[step];
      if (correct) {
        sfx.correct();
        setOwlyState("happy");
        setOwlyMsg(rand(CORRECT_LINES[language]));
        earnedXpRef.current += XP[ex.type] || 10;
        earnedGemsRef.current += 1;
        if (firstTry) firstTryRef.current += 1;
      } else {
        sfx.wrong();
        setOwlyState("cheer");
        setOwlyMsg(rand(WRONG_LINES[language]));
        loseHeart();
      }
    },
    [lesson.exercises, step, language, loseHeart]
  );

  // Advance to the next exercise, or finish the lesson.
  const next = useCallback(() => {
    if (step + 1 >= total) {
      const accuracy = firstTryRef.current / total;
      const crown = CROWNS.find((c) => accuracy >= c.min) || CROWNS[CROWNS.length - 1];
      finishLesson(lesson.id, crown.key, earnedXpRef.current, earnedGemsRef.current);
      sfx.fanfare();
      setDone(true);
      setOwlyState("celebrate");
    } else {
      setStep((s) => s + 1);
      setOwlyState("idle");
      setOwlyMsg("");
    }
  }, [step, total, finishLesson, lesson.id]);

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div className={styles.stage}>
        <motion.div
          className={styles.introCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Owly state="happy" message={pick(lesson.intro, language)} size={120} />
          <div className={styles.introEmoji}>{lesson.emoji}</div>
          <h1 className={styles.introTitle}>{pick(lesson.title, language)}</h1>
          <button className={styles.bigStart} onClick={() => { speak(pick(lesson.intro, language), language); startLesson(); }}>
            ▶️ {t("MULAI", "START")}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Complete screen ─────────────────────────────────────────────────────────
  if (done) {
    const accuracy = firstTryRef.current / total;
    const crown = CROWNS.find((c) => accuracy >= c.min) || CROWNS[CROWNS.length - 1];
    return (
      <div className={styles.stage}>
        <motion.div
          className={styles.completeCard}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <Owly state="celebrate" size={120} />
          <h1 className={styles.completeTitle}>🎉 {t("PELAJARAN SELESAI!", "LESSON COMPLETE!")}</h1>
          <div className={styles.crownBig} style={{ color: crown.color }}>
            {crown.icon} {t("Mahkota", "Crown")} {pick(crown.label, language)}
          </div>
          <div className={styles.rewards}>
            <span>⭐ +{earnedXpRef.current} XP</span>
            <span>💎 +{earnedGemsRef.current}</span>
          </div>
          <div className={styles.completeBtns}>
            <button className={styles.bigStart} onClick={onExit}>
              ➡️ {t("Lanjutkan", "Continue")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Active exercise ───────────────────────────────────────────────────────
  const ex = lesson.exercises[step];
  const Renderer = RENDERERS[ex.type] || RENDERERS.tap;

  return (
    <div className={styles.stage}>
      {/* progress bar */}
      <div className={styles.topBar}>
        <button className={styles.quitBtn} onClick={onExit} aria-label="close">✕</button>
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressFill}
            animate={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.owlyRow}>
        <Owly state={owlyState} message={owlyMsg} size={80} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className={styles.exerciseWrap}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Renderer
            ex={ex}
            language={language}
            t={t}
            onResult={handleResult}
            onNext={next}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * EXERCISE RENDERERS
 * Each receives { ex, language, t, onResult(correct,{firstTry}), onNext }.
 * They call onResult on an answer and onNext when the child can move on.
 * ═══════════════════════════════════════════════════════════════════════════ */

// A shared "Next" button shown after an exercise is solved.
function NextButton({ t, onNext }) {
  return (
    <motion.button
      className={styles.nextBtn}
      onClick={onNext}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {t("Lanjut", "Next")} ➡️
    </motion.button>
  );
}

// ── Ketuk Gambar (tap the correct picture) ──────────────────────────────────
function TapExercise({ ex, language, t, onResult, onNext }) {
  const [picked, setPicked] = useState(null);
  const [solved, setSolved] = useState(false);
  const firstTry = useRef(true);

  const choose = (i) => {
    if (solved) return;
    const opt = ex.options[i];
    setPicked(i);
    if (opt.correct) {
      setSolved(true);
      onResult(true, { firstTry: firstTry.current });
    } else {
      firstTry.current = false;
      onResult(false);
      setTimeout(() => setPicked(null), 600);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.optionGrid}>
        {ex.options.map((opt, i) => (
          <motion.button
            key={i}
            className={`${styles.option} ${picked === i && !opt.correct ? styles.optWrong : ""} ${picked === i && opt.correct ? styles.optRight : ""}`}
            onClick={() => choose(i)}
            whileTap={{ scale: 0.94 }}
            disabled={solved}
          >
            <span className={styles.optEmoji}>{opt.emoji}</span>
            <span className={styles.optLabel}>{pick(opt.label, language)}</span>
          </motion.button>
        ))}
      </div>
      {solved && <NextButton t={t} onNext={onNext} />}
    </div>
  );
}

// ── Jejak & Gambar (trace a letter, reuses TraceStage) ──────────────────────
function TraceExercise({ ex, language, t, onResult, onNext }) {
  const [solved, setSolved] = useState(false);
  const strokes = STROKES_UPPER[ex.letter];

  const handleComplete = () => {
    if (solved) return;
    setSolved(true);
    onResult(true, { firstTry: true });
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.traceBox}>
        <TraceStage
          glyph={ex.letter}
          strokes={strokes}
          accent="#f59e0b"
          level="easy"
          onComplete={handleComplete}
        />
      </div>
      {solved
        ? <NextButton t={t} onNext={onNext} />
        : <p className={styles.hintSmall}>✏️ {t("Ikuti garis titik-titik", "Follow the dotted line")}</p>}
    </div>
  );
}

// ── Seret & Cocokkan (drag items into a basket) ─────────────────────────────
function DragExercise({ ex, language, t, onResult, onNext }) {
  const [inBasket, setInBasket] = useState([]);
  const [solved, setSolved] = useState(false);
  const items = useMemo(() => Array.from({ length: ex.count }, (_, i) => i), [ex.count]);

  const drop = (i) => {
    if (solved || inBasket.includes(i)) return;
    sfx.pop();
    const next = [...inBasket, i];
    setInBasket(next);
    if (next.length === ex.count) {
      setSolved(true);
      onResult(true, { firstTry: true });
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.dragField}>
        {items.map((i) => (
          <motion.button
            key={i}
            className={`${styles.dragItem} ${inBasket.includes(i) ? styles.dragged : ""}`}
            onClick={() => drop(i)}
            whileTap={{ scale: 1.2 }}
            disabled={inBasket.includes(i)}
          >
            {ex.emoji}
          </motion.button>
        ))}
      </div>
      <div className={styles.basket}>
        <span className={styles.basketEmoji}>{ex.basket}</span>
        <span className={styles.basketCount}>{inBasket.length}/{ex.count}</span>
      </div>
      {solved && <NextButton t={t} onNext={onNext} />}
    </div>
  );
}

// ── Dengar & Ulangi (listen then tap mic — auto success for ages 5-7) ────────
function ListenExercise({ ex, language, t, onResult, onNext }) {
  const [phase, setPhase] = useState("ready"); // ready | listening | done
  const word = pick(ex.word, language);

  const playWord = () => speak(`${word}. ${ex.phon || ""} ${word}`, language);

  const tapMic = () => {
    if (phase !== "ready") return;
    setPhase("listening");
    setTimeout(() => {
      setPhase("done");
      onResult(true, { firstTry: true });
    }, 2000);
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.listenCard}>
        <button className={styles.speakerBtn} onClick={playWord} aria-label="play">🔊</button>
        <div className={styles.listenEmoji}>{ex.emoji}</div>
        <div className={styles.listenWord}>{word}</div>
        {ex.phon && <div className={styles.listenPhon}>{ex.phon}</div>}
      </div>
      {phase === "done"
        ? <NextButton t={t} onNext={onNext} />
        : (
          <button className={`${styles.micBtn} ${phase === "listening" ? styles.micActive : ""}`} onClick={tapMic}>
            {phase === "listening" ? `🎤 ${t("Mendengarkan...", "Listening...")}` : `🎤 ${t("Ketuk untuk bicara", "Tap to speak")}`}
          </button>
        )}
    </div>
  );
}

// ── Isi Titik-Titik (choose the missing letter) ─────────────────────────────
function FillExercise({ ex, language, t, onResult, onNext }) {
  const [picked, setPicked] = useState(null);
  const [solved, setSolved] = useState(false);
  const firstTry = useRef(true);
  const answer = pick(ex.answer, language);
  const word = pick(ex.word, language);

  const choose = (letter) => {
    if (solved) return;
    setPicked(letter);
    if (letter === answer) {
      setSolved(true);
      onResult(true, { firstTry: firstTry.current });
    } else {
      firstTry.current = false;
      onResult(false);
      setTimeout(() => setPicked(null), 600);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.fillEmoji}>{ex.emoji}</div>
      <div className={styles.fillWord}>{solved ? word.replace("_", answer) : word}</div>
      <div className={styles.letterRow}>
        {ex.options.map((letter) => (
          <motion.button
            key={letter}
            className={`${styles.letterBtn} ${picked === letter && letter !== answer ? styles.optWrong : ""} ${picked === letter && letter === answer ? styles.optRight : ""}`}
            onClick={() => choose(letter)}
            whileTap={{ scale: 0.9 }}
            disabled={solved}
          >
            {letter}
          </motion.button>
        ))}
      </div>
      {solved && <NextButton t={t} onNext={onNext} />}
    </div>
  );
}

// ── Waktu Cerita (swipe through story pages) ────────────────────────────────
function StoryExercise({ ex, language, t, onResult, onNext }) {
  const [page, setPage] = useState(0);
  const [finished, setFinished] = useState(false);
  const last = page >= ex.pages.length - 1;
  const cur = ex.pages[page];

  const advance = () => {
    speak(pick(cur.text, language), language);
    if (last) {
      setFinished(true);
      onResult(true, { firstTry: true });
    } else {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <motion.div key={page} className={styles.storyCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className={styles.storyEmoji}>{cur.emoji}</div>
        <p className={styles.storyText}>{pick(cur.text, language)}</p>
        <div className={styles.storyDots}>
          {ex.pages.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === page ? styles.dotActive : ""}`} />
          ))}
        </div>
      </motion.div>
      {finished
        ? <NextButton t={t} onNext={onNext} />
        : <button className={styles.nextBtn} onClick={advance}>{last ? t("Selesai", "Finish") : t("Halaman berikut", "Next page")} ➡️</button>}
    </div>
  );
}

// ── Mini-Game: Tangkap (tap falling items, no fail state) ───────────────────
function CatchExercise({ ex, language, t, onResult, onNext }) {
  const [caught, setCaught] = useState(0);
  const [items, setItems] = useState([]);
  const [solved, setSolved] = useState(false);
  const idRef = useRef(0);
  const caughtRef = useRef(0);

  // Spawn falling items on an interval; each drifts down via CSS animation.
  const spawnRef = useRef(null);
  const solvedRef = useRef(false);

  const stop = useCallback(() => {
    if (spawnRef.current) {
      clearInterval(spawnRef.current);
      spawnRef.current = null;
    }
  }, []);

  // Start spawning after mount; clean up on unmount or when solved.
  useEffect(() => {
    const timer = setTimeout(() => {
      spawnRef.current = setInterval(() => {
        if (solvedRef.current) return;
        const isTarget = Math.random() > 0.35;
        const emoji = isTarget ? ex.emoji : ex.decoys[Math.floor(Math.random() * ex.decoys.length)];
        setItems((cur) => [
          ...cur,
          { id: idRef.current++, emoji, isTarget, left: 8 + Math.random() * 78, dur: 3 + Math.random() * 1.5 },
        ]);
      }, 850);
    }, 300);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [ex.emoji, ex.decoys, stop]);

  const tapItem = (item) => {
    setItems((cur) => cur.filter((it) => it.id !== item.id));
    if (item.isTarget && !solved) {
      sfx.sparkle();
      caughtRef.current += 1;
      setCaught(caughtRef.current);
      if (caughtRef.current >= ex.target) {
        setSolved(true);
        solvedRef.current = true;
        stop();
        onResult(true, { firstTry: true });
      }
    } else if (!item.isTarget) {
      sfx.pop();
    }
  };

  return (
    <div className={styles.exercise}>
      <p className={styles.prompt}>{pick(ex.prompt, language)}</p>
      <div className={styles.catchStat}>⭐ {caught}/{ex.target}</div>
      <div className={styles.catchField}>
        {items.map((it) => (
          <button
            key={it.id}
            className={styles.fallItem}
            style={{ left: `${it.left}%`, animationDuration: `${it.dur}s` }}
            onClick={() => tapItem(it)}
            onAnimationEnd={() => setItems((cur) => cur.filter((x) => x.id !== it.id))}
          >
            {it.emoji}
          </button>
        ))}
      </div>
      {solved && <NextButton t={t} onNext={onNext} />}
    </div>
  );
}

const RENDERERS = {
  tap: TapExercise,
  trace: TraceExercise,
  drag: DragExercise,
  listen: ListenExercise,
  fill: FillExercise,
  story: StoryExercise,
  catch: CatchExercise,
};
