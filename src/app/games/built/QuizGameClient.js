"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useActivityStore } from "@/components/BackButton";
import styles from "./QuizGameClient.module.css";

// Large local bank (kid-friendly, ID + EN). A random subset is drawn each
// session so the quiz isn't "itu-itu saja".
const LOCAL_BANK = [
  { q: "Apa warna langit di siang hari?", e: "What color is the sky during the day?", opts: [["Biru", "Blue"], ["Merah", "Red"], ["Hijau", "Green"], ["Hitam", "Black"]], a: 0 },
  { q: "Berapa 2 + 2?", e: "What is 2 + 2?", opts: [["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"]], a: 1 },
  { q: "Hewan mana yang suka makan wortel?", e: "Which animal likes carrots?", opts: [["Kucing", "Cat"], ["Anjing", "Dog"], ["Kelinci", "Rabbit"], ["Ikan", "Fish"]], a: 2 },
  { q: "Apa bentuk matahari?", e: "What shape is the sun?", opts: [["Kotak", "Square"], ["Segitiga", "Triangle"], ["Bulat", "Round"], ["Bintang", "Star"]], a: 2 },
  { q: "Air membeku menjadi apa?", e: "Water freezes into what?", opts: [["Es", "Ice"], ["Uap", "Steam"], ["Awan", "Cloud"], ["Pasir", "Sand"]], a: 0 },
  { q: "Berapa jumlah kaki seekor anjing?", e: "How many legs does a dog have?", opts: [["2", "2"], ["4", "4"], ["6", "6"], ["8", "8"]], a: 1 },
  { q: "Hewan apa yang berkata 'meong'?", e: "Which animal says 'meow'?", opts: [["Sapi", "Cow"], ["Kucing", "Cat"], ["Bebek", "Duck"], ["Ayam", "Chicken"]], a: 1 },
  { q: "Buah apa yang berwarna kuning dan disukai monyet?", e: "Which yellow fruit do monkeys love?", opts: [["Apel", "Apple"], ["Pisang", "Banana"], ["Anggur", "Grape"], ["Jeruk", "Orange"]], a: 1 },
  { q: "Berapa 5 - 3?", e: "What is 5 - 3?", opts: [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]], a: 1 },
  { q: "Berapa banyak hari dalam seminggu?", e: "How many days are in a week?", opts: [["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]], a: 2 },
  { q: "Apa warna daun yang sehat?", e: "What color are healthy leaves?", opts: [["Hijau", "Green"], ["Biru", "Blue"], ["Ungu", "Purple"], ["Merah", "Red"]], a: 0 },
  { q: "Hewan apa yang punya belalai panjang?", e: "Which animal has a long trunk?", opts: [["Jerapah", "Giraffe"], ["Gajah", "Elephant"], ["Singa", "Lion"], ["Zebra", "Zebra"]], a: 1 },
  { q: "Di mana ikan hidup?", e: "Where do fish live?", opts: [["Di pohon", "In trees"], ["Di air", "In water"], ["Di gua", "In caves"], ["Di langit", "In the sky"]], a: 1 },
  { q: "Berapa 3 x 2?", e: "What is 3 x 2?", opts: [["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"]], a: 1 },
  { q: "Bunga membutuhkan apa untuk tumbuh?", e: "What do flowers need to grow?", opts: [["Air dan matahari", "Water and sun"], ["Es", "Ice"], ["Kegelapan", "Darkness"], ["Garam", "Salt"]], a: 0 },
  { q: "Hewan apa yang bisa terbang?", e: "Which animal can fly?", opts: [["Ikan", "Fish"], ["Burung", "Bird"], ["Kucing", "Cat"], ["Kuda", "Horse"]], a: 1 },
  { q: "Apa warna stroberi?", e: "What color is a strawberry?", opts: [["Merah", "Red"], ["Biru", "Blue"], ["Hitam", "Black"], ["Putih", "White"]], a: 0 },
  { q: "Berapa angka setelah 9?", e: "What number comes after 9?", opts: [["8", "8"], ["10", "10"], ["11", "11"], ["7", "7"]], a: 1 },
  { q: "Apa yang kita pakai saat hujan?", e: "What do we use when it rains?", opts: [["Payung", "Umbrella"], ["Kacamata hitam", "Sunglasses"], ["Topi pantai", "Beach hat"], ["Kipas", "Fan"]], a: 0 },
  { q: "Hewan apa yang hidup di kutub dan berwarna putih?", e: "Which white animal lives at the poles?", opts: [["Beruang kutub", "Polar bear"], ["Unta", "Camel"], ["Singa", "Lion"], ["Monyet", "Monkey"]], a: 0 },
  { q: "Berapa 10 - 5?", e: "What is 10 - 5?", opts: [["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"]], a: 2 },
  { q: "Planet tempat kita tinggal bernama?", e: "What is the name of our planet?", opts: [["Mars", "Mars"], ["Bumi", "Earth"], ["Bulan", "Moon"], ["Matahari", "Sun"]], a: 1 },
  { q: "Warna apa hasil campuran biru dan kuning?", e: "What color do blue and yellow make?", opts: [["Hijau", "Green"], ["Ungu", "Purple"], ["Oranye", "Orange"], ["Coklat", "Brown"]], a: 0 },
  { q: "Hewan apa yang menghasilkan madu?", e: "Which animal makes honey?", opts: [["Semut", "Ant"], ["Lebah", "Bee"], ["Laba-laba", "Spider"], ["Lalat", "Fly"]], a: 1 },
  { q: "Berapa 4 + 5?", e: "What is 4 + 5?", opts: [["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"]], a: 1 },
];

const ROUND_SIZE = 8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Prepare a local item: shuffle options and track the correct index.
function prepareLocal(item) {
  const correctOpt = item.opts[item.a];
  const shuffled = shuffle(item.opts);
  return {
    q: item.q,
    e: item.e,
    options: shuffled,
    answer: shuffled.indexOf(correctOpt),
  };
}

function decodeHTML(str) {
  if (typeof document === "undefined") return str;
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}

function buildLocalRound() {
  return shuffle(LOCAL_BANK).slice(0, ROUND_SIZE).map(prepareLocal);
}

export default function QuizGameClient() {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("local");
  const setHasChanges = useActivityStore((state) => state.setHasChanges);

  // Build a fresh random round on mount
  useEffect(() => {
    setQuestions(buildLocalRound());
  }, []);

  const resetState = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  }, []);

  const newLocalRound = useCallback(() => {
    setQuestions(buildLocalRound());
    setSource("local");
    resetState();
  }, [resetState]);

  const fetchInternetRound = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://opentdb.com/api.php?amount=8&difficulty=easy&type=multiple");
      const data = await res.json();
      if (!data.results || data.results.length === 0) throw new Error("no questions");
      const mapped = data.results.map((r) => {
        const correct = decodeHTML(r.correct_answer);
        const all = shuffle([correct, ...r.incorrect_answers.map(decodeHTML)]);
        const qText = decodeHTML(r.question);
        return {
          q: qText,
          e: qText, // OpenTDB is English-only; show same text in both modes
          options: all.map((o) => [o, o]),
          answer: all.indexOf(correct),
        };
      });
      setQuestions(mapped);
      setSource("internet");
      resetState();
    } catch (e) {
      // fall back to a fresh local round if the network/API fails
      newLocalRound();
    } finally {
      setLoading(false);
    }
  }, [resetState, newLocalRound]);

  if (questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>🧠 Quiz</h1>
          <p>{language === "id" ? "Menyiapkan soal..." : "Preparing questions..."}</p>
        </div>
      </div>
    );
  }

  const quiz = questions[currentIndex];

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setHasChanges(true);
    if (index === quiz.answer) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const optionText = (opt) => (language === "id" ? opt[0] : opt[1]);

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className={styles.container}>
        <div className={styles.resultCard}>
          <h1>🧠 {language === "id" ? "Quiz Selesai!" : "Quiz Done!"}</h1>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreNumber}>{score}</span>
            <span className={styles.scoreTotal}>/ {questions.length}</span>
          </div>
          <p className={styles.percentage}>{percentage}% {language === "id" ? "Benar" : "Correct"}</p>
          <p className={styles.message}>
            {percentage >= 80 ? "🌟 Hebat sekali!" : percentage >= 60 ? "👍 Bagus!" : "💪 Tetap semangat!"}
          </p>
          <div className={styles.resultButtons}>
            <button className={styles.restartBtn} onClick={newLocalRound}>
              🔄 {language === "id" ? "Soal Acak Baru" : "New Random Round"}
            </button>
            <button className={styles.internetBtn} onClick={fetchInternetRound} disabled={loading}>
              🌐 {loading ? (language === "id" ? "Memuat..." : "Loading...") : (language === "id" ? "Soal dari Internet" : "Internet Questions")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🧠 Quiz</h1>
        <p>{language === "id" ? "Jawab pertanyaan dengan benar!" : "Answer the questions correctly!"}</p>
      </div>

      <div className={styles.topBar}>
        <span className={styles.progress}>{currentIndex + 1} / {questions.length}</span>
        <span className={styles.sourceTag}>
          {source === "internet"
            ? (language === "id" ? "🌐 Soal Internet" : "🌐 Internet")
            : (language === "id" ? "📚 Soal Acak" : "📚 Random")}
        </span>
        <button className={styles.refreshBtn} onClick={fetchInternetRound} disabled={loading}>
          {loading ? "⏳" : "🌐"} {language === "id" ? "Internet" : "Internet"}
        </button>
      </div>

      <div className={styles.quizCard}>
        <div className={styles.question}>
          {language === "id" ? quiz.q : quiz.e}
        </div>

        <div className={styles.options}>
          {quiz.options.map((option, index) => (
            <button
              key={index}
              className={`${styles.optionBtn} ${selectedAnswer === index ? (index === quiz.answer ? styles.correct : styles.wrong) : ""} ${selectedAnswer !== null && index === quiz.answer ? styles.correct : ""}`}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
            >
              {optionText(option)}
            </button>
          ))}
        </div>

        {selectedAnswer !== null && (
          <button className={styles.nextBtn} onClick={nextQuestion}>
            {currentIndex < questions.length - 1
              ? (language === "id" ? "Berikutnya ▶️" : "Next ▶️")
              : (language === "id" ? "Lihat Hasil 📊" : "See Results 📊")}
          </button>
        )}
      </div>
    </div>
  );
}
