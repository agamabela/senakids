"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./LearnEnglish1GameClient.module.css";

const WORDS = [
  { id: 1, emoji: "🐱", word: "CAT", indonesian: "Kucing" },
  { id: 2, emoji: "🐕", word: "DOG", indonesian: "Anjing" },
  { id: 3, emoji: "🐦", word: "BIRD", indonesian: "Burung" },
  { id: 4, emoji: "🐠", word: "FISH", indonesian: "Ikan" },
  { id: 5, emoji: "🐴", word: "HORSE", indonesian: "Kuda" },
  { id: 6, emoji: "🐷", word: "PIG", indonesian: "Babi" },
  { id: 7, emoji: "🐸", word: "FROG", indonesian: "Kodok" },
  { id: 8, emoji: "🦋", word: "BUTTERFLY", indonesian: "Kupu-kupu" },
  { id: 9, emoji: "🐝", word: "BEE", indonesian: "Lebah" },
  { id: 10, emoji: "🌸", word: "FLOWER", indonesian: "Bunga" },
];

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

const speakWithBrowserTTS = async (text) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not available'));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
};

export default function LearnEnglish1GameClient() {
  const { language } = useLanguage();
  const [currentWord, setCurrentWord] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  const word = WORDS[currentWord];

  const speak = useCallback(async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setHasChanges(true);
    try {
      await speakWithBrowserTTS(word.word);
    } catch (error) {
      console.error('TTS Error:', error);
    }
    setIsSpeaking(false);
  }, [isSpeaking, word.word, setHasChanges]);

  const nextWord = () => {
    setCurrentWord((prev) => (prev + 1) % WORDS.length);
    setShowHint(false);
    setHasChanges(true);
  };

  const prevWord = () => {
    setCurrentWord((prev) => (prev - 1 + WORDS.length) % WORDS.length);
    setShowHint(false);
    setHasChanges(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📚 Learn English 1</h1>
        <p>{language === "id" ? "Belajar kata sederhana dalam bahasa Inggris!" : "Learn simple English words!"}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.emoji}>{word.emoji}</div>

        <button className={styles.speakBtn} onClick={speak}>
          🔊 {isSpeaking ? '...' : 'Dengar'}
        </button>

        <div className={styles.wordDisplay}>
          <span className={styles.word}>{word.word}</span>
          <button className={styles.hintBtn} onClick={() => setShowHint(!showHint)}>
            {showHint ? '🙈' : '👁️'} {language === "id" ? "Tunjuk" : "Show"}
          </button>
        </div>

        {showHint && (
          <div className={styles.hint}>
            {language === "id" ? word.indonesian : " "}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevWord}>
          ◀️ Prev
        </button>
        <div className={styles.counter}>
          {currentWord + 1} / {WORDS.length}
        </div>
        <button className={styles.navBtn} onClick={nextWord}>
          Next ▶️
        </button>
      </div>

      <div className={styles.wordGrid}>
        {WORDS.map((w, i) => (
          <button
            key={w.id}
            className={`${styles.wordItem} ${i === currentWord ? styles.active : ''}`}
            onClick={() => { setCurrentWord(i); setShowHint(false); }}
          >
            {w.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}