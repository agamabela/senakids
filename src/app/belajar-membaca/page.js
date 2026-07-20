"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

const WORDS = [
  { id: 1, word: "KUCING", meaning: "Cat", emoji: "🐱", syllables: ["KU", "CING"] },
  { id: 2, word: "AYAM", meaning: "Chicken", emoji: "🐔", syllables: ["A", "YAM"] },
  { id: 3, word: "IKAN", meaning: "Fish", emoji: "🐟", syllables: ["I", "KAN"] },
  { id: 4, word: "BURI", meaning: "Fish", emoji: "🐠", syllables: ["BU", "RI"] },
  { id: 5, word: "KUDA", meaning: "Horse", emoji: "🐴", syllables: ["KU", "DA"] },
  { id: 6, word: "BABI", meaning: "Pig", emoji: "🐷", syllables: ["BA", "BI"] },
  { id: 7, word: "BANG", meaning: "Duck", emoji: "🦆", syllables: ["BANG"] },
  { id: 8, word: "GAJAH", meaning: "Elephant", emoji: "🐘", syllables: ["GA", "JAH"] },
  { id: 9, word: "SEMUT", meaning: "Ant", emoji: "🐜", syllables: ["SE", "MUT"] },
  { id: 10, word: "LEBA", meaning: "Bee", emoji: "🐝", syllables: ["LE", "BA"] },
  { id: 11, word: "KUPU", meaning: "Butterfly", emoji: "🦋", syllables: ["KU", "PU"] },
  { id: 12, word: "BUNGA", meaning: "Flower", emoji: "🌸", syllables: ["BUN", "GA"] },
  { id: 13, word: "POKON", meaning: "Frog", emoji: "🐸", syllables: ["PO", "KON"] },
  { id: 14, word: "KODOK", meaning: "Frog", emoji: "🐸", syllables: ["KO", "DOK"] },
  { id: 15, word: "PANAH", meaning: "Arrow", emoji: "🏹", syllables: ["PA", "NAH"] },
];

export default function BelajarMembacaPage() {
  const { t, language } = useLanguage();
  const [currentWord, setCurrentWord] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [audioCache, setAudioCache] = useState({});
  const audioRef = useState(null)[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  const word = WORDS[currentWord];

  // Fetch audio from Google Cloud TTS API
  const fetchAudio = async (text) => {
    const cacheKey = `${language}-${text}`;
    
    // Check cache first
    if (audioCache[cacheKey]) {
      return audioCache[cacheKey];
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('TTS API Error:', data.error, data.details);
        throw new Error(data.error || `API returned status ${response.status}`);
      }

      const audioData = data.audio;

      // Cache the audio
      setAudioCache(prev => ({
        ...prev,
        [cacheKey]: audioData,
      }));

      return audioData;
    } catch (error) {
      console.error('TTS Error:', error.message);
      alert(`Audio Error: ${error.message}`);
      return null;
    }
  };

  // Play audio from base64
  const playAudio = (audioData) => {
    if (!audioData) return;

    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const url = URL.createObjectURL(blob);
    
    const audio = new Audio(url);
    audio.onended = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(url);
    };
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
      setIsSpeaking(false);
      URL.revokeObjectURL(url);
    });
  };

  const speak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    // Spell out the word letter by letter
    const letters = word.word.split('').join(' ');
    const audioData = await fetchAudio(letters);
    playAudio(audioData);
  };

  const speakSyllable = async (syllable) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    const audioData = await fetchAudio(syllable);
    playAudio(audioData);
  };

  const nextWord = () => {
    setShowMeaning(false);
    if (currentWord < WORDS.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      setCurrentWord(0);
    }
  };

  const prevWord = () => {
    setShowMeaning(false);
    if (currentWord > 0) {
      setCurrentWord(currentWord - 1);
    } else {
      setCurrentWord(WORDS.length - 1);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📚 {language === "id" ? "Belajar Membaca" : "Learn to Read"}</h1>
        <p>{language === "id" ? "Klik kata untuk mendengar!" : "Click word to hear!"}</p>
      </div>

      <div className={styles.progress}>
        {WORDS.map((_, i) => (
          <div key={i} className={`${styles.dot} ${i === currentWord ? styles.activeDot : ""}`} />
        ))}
      </div>

      <div className={styles.card} onClick={speak}>
        <div className={styles.emoji}>{word.emoji}</div>
        <div className={`${styles.word} ${isSpeaking ? styles.speaking : ""}`}>
          {word.word}
        </div>
        <div className={styles.syllables}>
          {word.syllables.map((syl, i) => (
            <button
              key={i}
              className={styles.syllable}
              onClick={(e) => { e.stopPropagation(); speakSyllable(syl); }}
            >
              {syl}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.speakBtn} onClick={speak}>
        🔊 {language === "id" ? "Dengarkan" : "Listen"}
      </button>

      <div className={styles.controls}>
        <button className={styles.navBtn} onClick={prevWord}>
          ◀️ {language === "id" ? "Sebelumnya" : "Previous"}
        </button>
        <button className={styles.meaningBtn} onClick={() => setShowMeaning(!showMeaning)}>
          {showMeaning ? "🙈 " + (language === "id" ? "Sembunyikan" : "Hide") : "👁️ " + (language === "id" ? "Lihat Arti" : "Show Meaning")}
        </button>
        <button className={styles.navBtn} onClick={nextWord}>
          {language === "id" ? "Selanjutnya" : "Next"} ▶️
        </button>
      </div>

      {showMeaning && (
        <div className={styles.meaning}>
          <h2>{word.word}</h2>
          <p>= {word.meaning}</p>
        </div>
      )}
    </div>
  );
}