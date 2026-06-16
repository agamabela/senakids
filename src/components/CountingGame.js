'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import styles from './CountingGame.module.css';

/* Pool of fun emoji to use as countable objects */
const EMOJI_POOL = ['🍎', '🌟', '🎈', '🐠', '🌸', '🍕', '🦋', '🍩', '🐝', '🎀'];

/**
 * Generate a unique random integer between min and max (inclusive),
 * excluding any values in the `exclude` set.
 */
function randomIntExcluding(min, max, exclude = new Set()) {
  let n;
  do {
    n = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (exclude.has(n));
  return n;
}

/**
 * Build a fresh round: random emoji, random count, and three answer choices.
 */
function generateRound() {
  const emoji = EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)];
  const correctCount = Math.floor(Math.random() * 10) + 1; // 1–10

  /* Two unique wrong answers */
  const used = new Set([correctCount]);
  const wrong1 = randomIntExcluding(1, 10, used);
  used.add(wrong1);
  const wrong2 = randomIntExcluding(1, 10, used);

  /* Shuffle the three choices */
  const choices = [correctCount, wrong1, wrong2].sort(() => Math.random() - 0.5);

  return { emoji, correctCount, choices };
}

/* Colors assigned to the three answer buttons */
const BUTTON_COLORS = ['purple', 'pink', 'teal'];

export default function CountingGame() {
  const { t } = useLanguage();
  const [round, setRound] = useState(() => generateRound());
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [animationKey, setAnimationKey] = useState(0); // forces re-mount for animations

  /* Start a new round */
  const nextRound = useCallback(() => {
    setRound(generateRound());
    setFeedback(null);
    setSelectedAnswer(null);
    setAnimationKey((k) => k + 1);
  }, []);

  /* Handle a kid tapping a number button */
  const handleAnswer = useCallback(
    (choice) => {
      if (feedback === 'correct') return; // already answered correctly
      setSelectedAnswer(choice);
      if (choice === round.correctCount) {
        setFeedback('correct');
        setScore((s) => s + 1);
      } else {
        setFeedback('wrong');
      }
    },
    [feedback, round.correctCount]
  );

  /* Generate emoji items with staggered animation delays */
  const emojiItems = Array.from({ length: round.correctCount }, (_, i) => (
    <span
      key={`${animationKey}-${i}`}
      className={styles.emojiItem}
      style={{ animationDelay: `${i * 0.1}s` }}
      aria-hidden="true"
    >
      {round.emoji}
    </span>
  ));

  /* Confetti burst (appears on correct answer) */
  const confettiEmojis = ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '🥳', '🎆'];

  return (
    <section className={styles.container} aria-label={t("countingGame.title")}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t("countingGame.title")}</h2>
        <div className={styles.scorePill} aria-live="polite">
          {t("countingGame.score", { score })}
        </div>
      </div>

      {/* ── Prompt ── */}
      <p className={styles.prompt}>
        {t("countingGame.prompt", { emoji: round.emoji })}
      </p>

      {/* ── Objects Area ── */}
      <div className={styles.objectsArea} key={animationKey} aria-label={`${round.correctCount} objects`}>
        {emojiItems}
      </div>

      {/* ── Answer Buttons ── */}
      <div className={styles.answersRow}>
        {round.choices.map((choice, idx) => {
          const isSelected = selectedAnswer === choice;
          const isCorrectChoice = choice === round.correctCount;
          let btnClass = styles.answerBtn;
          if (feedback === 'correct' && isCorrectChoice) btnClass += ` ${styles.correctBtn}`;
          if (feedback === 'wrong' && isSelected && !isCorrectChoice) btnClass += ` ${styles.wrongBtn}`;

          return (
            <button
              key={choice}
              className={btnClass}
              data-color={BUTTON_COLORS[idx]}
              onClick={() => handleAnswer(choice)}
              disabled={feedback === 'correct'}
              aria-label={`Answer ${choice}`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {/* ── Feedback ── */}
      <div className={styles.feedbackArea} aria-live="polite">
        {feedback === 'correct' && (
          <div className={styles.feedbackCorrect}>
            <span className={styles.feedbackText}>{t("countingGame.correct")}</span>
            {/* Confetti burst */}
            <div className={styles.confettiContainer} aria-hidden="true">
              {confettiEmojis.map((c, i) => (
                <span
                  key={i}
                  className={styles.confettiPiece}
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 0.4}s`,
                    animationDuration: `${0.8 + Math.random() * 0.6}s`,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className={styles.feedbackWrong}>
            <span className={styles.feedbackText}>{t("countingGame.wrong")}</span>
          </div>
        )}
      </div>

      {/* ── Next Button ── */}
      <button className={styles.nextBtn} onClick={nextRound}>
        {t("countingGame.nextRound")}
      </button>
    </section>
  );
}
