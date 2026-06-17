"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import BackButton from "@/components/BackButton";
import Swal from "sweetalert2";
import styles from "./page.module.css";

// Bilingual word list
const WORDS = [
  { id: 1, emoji: "🐱",
    indonesian: { word: "KUCING", syllables: ["KU", "CING"], meaning: "Kucing" },
    english: { word: "CAT", syllables: ["C", "AT"], meaning: "Cat" }
  },
  { id: 2, emoji: "🐔",
    indonesian: { word: "AYAM", syllables: ["A", "YAM"], meaning: "Ayam" },
    english: { word: "CHICKEN", syllables: ["CHICK", "EN"], meaning: "Chicken" }
  },
  { id: 3, emoji: "🐟",
    indonesian: { word: "IKAN", syllables: ["I", "KAN"], meaning: "Ikan" },
    english: { word: "FISH", syllables: ["F", "ISH"], meaning: "Fish" }
  },
  { id: 4, emoji: "🐠",
    indonesian: { word: "BURI", syllables: ["BU", "RI"], meaning: "Buri" },
    english: { word: "TROUT", syllables: ["TROUT"], meaning: "Trout" }
  },
  { id: 5, emoji: "🐴",
    indonesian: { word: "KUDA", syllables: ["KU", "DA"], meaning: "Kuda" },
    english: { word: "HORSE", syllables: ["H", "ORSE"], meaning: "Horse" }
  },
  { id: 6, emoji: "🐷",
    indonesian: { word: "BABI", syllables: ["BA", "BI"], meaning: "Babi" },
    english: { word: "PIG", syllables: ["P", "IG"], meaning: "Pig" }
  },
  { id: 7, emoji: "🦆",
    indonesian: { word: "BANG", syllables: ["BANG"], meaning: "Bebek" },
    english: { word: "DUCK", syllables: ["D", "UCK"], meaning: "Duck" }
  },
  { id: 8, emoji: "🐘",
    indonesian: { word: "GAJAH", syllables: ["GA", "JAH"], meaning: "Gajah" },
    english: { word: "ELEPHANT", syllables: ["EL", "E", "PHANT"], meaning: "Elephant" }
  },
  { id: 9, emoji: "🐜",
    indonesian: { word: "SEMUT", syllables: ["SE", "MUT"], meaning: "Semut" },
    english: { word: "ANT", syllables: ["A", "NT"], meaning: "Ant" }
  },
  { id: 10, emoji: "🐝",
    indonesian: { word: "LEBA", syllables: ["LE", "BA"], meaning: "Lebah" },
    english: { word: "BEE", syllables: ["B", "EE"], meaning: "Bee" }
  },
  { id: 11, emoji: "🦋",
    indonesian: { word: "KUPU", syllables: ["KU", "PU"], meaning: "Kupu-kupu" },
    english: { word: "BUTTERFLY", syllables: ["BUT", "TER", "FLY"], meaning: "Butterfly" }
  },
  { id: 12, emoji: "🌸",
    indonesian: { word: "BUNGA", syllables: ["BUN", "GA"], meaning: "Bunga" },
    english: { word: "FLOWER", syllables: ["FLOW", "ER"], meaning: "Flower" }
  },
  { id: 13, emoji: "🐸",
    indonesian: { word: "POKON", syllables: ["PO", "KON"], meaning: "Kodok" },
    english: { word: "FROG", syllables: ["F", "ROG"], meaning: "Frog" }
  },
  { id: 14, emoji: "🐶",
    indonesian: { word: "ANJING", syllables: ["AN", "JING"], meaning: "Anjing" },
    english: { word: "DOG", syllables: ["D", "OG"], meaning: "Dog" }
  },
  { id: 15, emoji: "🐦",
    indonesian: { word: "BURUNG", syllables: ["BU", "RUNG"], meaning: "Burung" },
    english: { word: "BIRD", syllables: ["B", "IRD"], meaning: "Bird" }
  },
  { id: 16, emoji: "🐄",
    indonesian: { word: "SAPI", syllables: ["SA", "PI"], meaning: "Sapi" },
    english: { word: "COW", syllables: ["C", "OW"], meaning: "Cow" }
  },
  { id: 17, emoji: "🐐",
    indonesian: { word: "KAMBING", syllables: ["KAM", "BING"], meaning: "Kambling" },
    english: { word: "GOAT", syllables: ["G", "OAT"], meaning: "Goat" }
  },
  { id: 18, emoji: "🦁",
    indonesian: { word: "SINGA", syllables: ["SIN", "GA"], meaning: "Singa" },
    english: { word: "LION", syllables: ["L", "ION"], meaning: "Lion" }
  },
  { id: 19, emoji: "🐯",
    indonesian: { word: "HARIMAU", syllables: ["HA", "RI", "MAU"], meaning: "Harimau" },
    english: { word: "TIGER", syllables: ["T", "I", "GER"], meaning: "Tiger" }
  },
  { id: 20, emoji: "🐼",
    indonesian: { word: "PANDA", syllables: ["PAN", "DA"], meaning: "Panda" },
    english: { word: "PANDA", syllables: ["PAN", "DA"], meaning: "Panda" }
  },
];

// Audio context for playing received audio
let audioContext = null;

const getAudioContext = () => {
  if (!audioContext && typeof window !== 'undefined') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// TTS using API
const speakWithAPI = async (text, language) => {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'TTS failed');
    }

    const data = await response.json();

    // Convert base64 to audio and play
    if (data.audio) {
      const audioContext = getAudioContext();
      if (!audioContext) {
        throw new Error('Audio context not available');
      }

      // Decode base64 to array buffer
      const binaryString = atob(data.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode and play
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

      // Create source and play
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);

      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
    }
  } catch (error) {
    console.error('API TTS Error:', error.message);
    throw error;
  }
};

// Fallback: Browser-based TTS
const speakWithBrowserTTS = async (text, isIndonesian) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Browser TTS not available'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isIndonesian ? 'id-ID' : 'en-US';
    utterance.rate = 0.7;
    utterance.pitch = 1.1;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
};

// Main speak function - tries API first, falls back to browser
const speakText = async (text, language) => {
  try {
    await speakWithAPI(text, language);
  } catch (error) {
    console.log('API TTS failed, trying browser TTS...');
    await speakWithBrowserTTS(text, language === 'id');
  }
};

export default function BelajarMembacaPage() {
  const { language } = useLanguage();
  const [currentWord, setCurrentWord] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [learningMode, setLearningMode] = useState('indonesian');
  const audioContextRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLearningMode(language);
  }, [language]);

  // Initialize audio context on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getAudioContext();
    }
  }, []);

  const word = WORDS[currentWord];
  const currentData = learningMode === 'id' ? word.indonesian : word.english;

  const speak = useCallback(async (textToSpeak = null, lang = null) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const text = textToSpeak || currentData.word;
    const languageToUse = lang || learningMode;

    setIsSpeaking(true);
    try {
      await speakText(text, languageToUse);
    } catch (error) {
      console.error('TTS Error:', error.message);
      Swal.fire({
        title: 'Audio Error',
        text: 'Could not play audio. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#C87A65',
        background: '#FAF6F0',
      });
    }
    setIsSpeaking(false);
  }, [isSpeaking, currentData.word, learningMode]);

  const speakSyllable = useCallback(async (syllable, lang = null) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const languageToUse = lang || learningMode;

    setIsSpeaking(true);
    try {
      await speakText(syllable, languageToUse);
    } catch (error) {
      console.error('TTS Error:', error.message);
    }
    setIsSpeaking(false);
  }, [isSpeaking, learningMode]);

  const speakBoth = useCallback(async () => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      // Speak Indonesian first
      await speakText(word.indonesian.word, 'id');
      // Then speak English
      await new Promise(resolve => setTimeout(resolve, 1000));
      await speakText(word.english.word, 'en');
    } catch (error) {
      console.error('TTS Error:', error.message);
    }
    setIsSpeaking(false);
  }, [isSpeaking, word.indonesian.word, word.english.word]);

  const nextWord = () => {
    if (currentWord < WORDS.length - 1) {
      setCurrentWord(currentWord + 1);
    } else {
      setCurrentWord(0);
    }
  };

  const prevWord = () => {
    if (currentWord > 0) {
      setCurrentWord(currentWord - 1);
    } else {
      setCurrentWord(WORDS.length - 1);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <BackButton />
      </div>

      {/* Language Toggle */}
      <div className={styles.languageToggle}>
        <button
          className={`${styles.langBtn} ${learningMode === 'id' ? styles.langActive : ''}`}
          onClick={() => setLearningMode('id')}
        >
          🇮🇩 Bahasa
        </button>
        <button
          className={`${styles.langBtn} ${learningMode === 'en' ? styles.langActive : ''}`}
          onClick={() => setLearningMode('en')}
        >
          🇬🇧 English
        </button>
      </div>

      <div className={styles.header}>
        <h1>📚 {language === "id" ? "Belajar Membaca" : "Learn to Read"}</h1>
        <p>{language === "id" ? "Klik untuk mendengar kata!" : "Click to hear the word!"}</p>
      </div>

      {/* Progress */}
      <div className={styles.progress}>
        {WORDS.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i === currentWord ? styles.activeDot : ""}`}
            onClick={() => setCurrentWord(i)}
          />
        ))}
      </div>

      {/* Main Card - Centered */}
      <div className={styles.mainCard}>
        <div className={styles.cardInner}>
          <div className={styles.emoji}>{word.emoji}</div>

          {/* Indonesian Word */}
          <div
            className={`${styles.wordRow} ${styles.wordIndonesian}`}
            onClick={() => speak(word.indonesian.word, 'id')}
          >
            <span className={styles.word}>{word.indonesian.word}</span>
            <span className={styles.wordMeaning}>{word.indonesian.meaning}</span>
          </div>

          {/* English Word */}
          <div
            className={`${styles.wordRow} ${styles.wordEnglish}`}
            onClick={() => speak(word.english.word, 'en')}
          >
            <span className={styles.word}>{word.english.word}</span>
            <span className={styles.wordMeaning}>{word.english.meaning}</span>
          </div>

          {/* Syllables */}
          <div className={styles.syllables}>
            {currentData.syllables.map((syl, i) => (
              <button
                key={i}
                className={styles.syllable}
                onClick={() => speakSyllable(syl)}
              >
                {syl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className={styles.buttonRow}>
        <button className={styles.speakBtn} onClick={() => speak()}>
          {isSpeaking ? '⏹️ Stop' : '🔊 Dengar'}
        </button>

        <button className={styles.bothBtn} onClick={speakBoth}>
          🔤 Semua
        </button>
      </div>

      {/* Navigation */}
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

      {/* Quick Access */}
      <div className={styles.quickNav}>
        <p className={styles.quickNavTitle}>
          {language === "id" ? "Pilih:" : "Pick:"}
        </p>
        <div className={styles.quickNavGrid}>
          {WORDS.map((w, i) => (
            <button
              key={i}
              className={`${styles.quickNavItem} ${i === currentWord ? styles.quickNavActive : ''}`}
              onClick={() => setCurrentWord(i)}
            >
              {w.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}