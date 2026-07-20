// ═══════════════════════════════════════════════════════════════════════════
// OWLY — Curriculum & Lesson Data (Unit 1: Dunia Huruf)
// ---------------------------------------------------------------------------
// Lessons are plain data so new units/lessons can be added without touching the
// player engine. Each lesson has an ordered list of `exercises`; every exercise
// declares a `type` that maps to a renderer in LessonPlayer.js.
//
// Pictures are described as short `img` subjects (e.g. "a shiny red apple").
// LessonPlayer renders them through owlyImg() as real generated illustrations —
// no emoji anywhere in the UI.
//
// Exercise types used in Unit 1:
//   tap    — Ketuk Gambar: pick the correct picture
//   trace  — Jejak & Gambar: trace a letter (reuses TraceStage)
//   drag   — Seret & Cocokkan: drag items into a basket
//   listen — Dengar & Ulangi: listen then tap the mic (auto-success for ages 5-7)
//   fill   — Isi Titik-Titik: choose the missing letter
//   story  — Waktu Cerita: swipe through illustrated story pages
//   catch  — Mini-Game: tap falling items before they land (no fail state)
// ═══════════════════════════════════════════════════════════════════════════

// XP awarded per exercise type (kept small + generous, never punishing)
export const XP = { tap: 10, trace: 15, drag: 10, listen: 10, fill: 10, story: 10, catch: 20 };

// Crown thresholds (share of exercises answered right on the first try)
export const CROWNS = [
  { key: "gold", min: 1.0, label: { id: "Emas", en: "Gold" }, color: "#f59e0b" },
  { key: "silver", min: 0.8, label: { id: "Perak", en: "Silver" }, color: "#94a3b8" },
  { key: "bronze", min: 0.0, label: { id: "Perunggu", en: "Bronze" }, color: "#b45309" },
];

// Units metadata for the learning path. Only Unit 1 is playable in v1; the rest
// show a friendly "Segera Hadir!" (Coming Soon) banner per the GDD.
export const UNITS = [
  { id: 1, title: { id: "Dunia Huruf", en: "Letter World" }, img: "a colorful alphabet blocks tower", color: "#f59e0b", locked: false },
  { id: 2, title: { id: "Dunia Angka & Bentuk", en: "Numbers & Shapes" }, img: "playful wooden number and shape blocks", color: "#3b82f6", locked: true },
  { id: 3, title: { id: "Pembaca Kecil", en: "Little Reader" }, img: "an open storybook with a bookmark", color: "#22c55e", locked: true },
  { id: 4, title: { id: "Penjelajah Alam", en: "Nature Explorer" }, img: "a leafy green forest scene with sun", color: "#10b981", locked: true },
];

export const LESSONS = [
  // ─── 1.1 A adalah Apel ────────────────────────────────────────────────────
  {
    id: "1.1",
    unit: 1,
    img: "a shiny red apple",
    title: { id: "A adalah Apel", en: "A is for Apple" },
    intro: { id: "Hoot hoot! Hari ini kita belajar huruf A! Siap?", en: "Hoot hoot! Today we learn the letter A! Ready?" },
    exercises: [
      {
        type: "tap",
        prompt: { id: "Ketuk apelnya! A untuk Apel.", en: "Tap the apple! A is for Apple." },
        options: [
          { img: "a shiny red apple", label: { id: "Apel", en: "Apple" }, correct: true },
          { img: "a ripe yellow banana", label: { id: "Pisang", en: "Banana" } },
          { img: "a bunch of purple grapes", label: { id: "Anggur", en: "Grapes" } },
        ],
      },
      {
        type: "trace",
        letter: "A",
        prompt: { id: "Jejak huruf A dengan jarimu!", en: "Trace the letter A with your finger!" },
        word: { id: "Apel", en: "Apple" },
      },
      {
        type: "drag",
        img: "a shiny red apple",
        count: 5,
        prompt: { id: "Seret apel ke keranjang!", en: "Drag the apples to the basket!" },
        basket: "a woven wicker basket",
      },
      {
        type: "listen",
        img: "a shiny red apple",
        word: { id: "Apel", en: "Apple" },
        phon: "/a/ /a/",
        prompt: { id: "Ikuti Owly: A untuk Apel! /a/ /a/ apel!", en: "Follow Owly: A is for Apple! /a/ /a/ apple!" },
      },
      {
        type: "catch",
        img: "a shiny red apple",
        target: 5,
        decoys: ["a ripe yellow banana", "a bunch of purple grapes"],
        prompt: { id: "Tangkap apel yang jatuh!", en: "Catch the falling apples!" },
      },
    ],
  },

  // ─── 1.2 B adalah Bola ──────────────────────────────────────────────────────
  {
    id: "1.2",
    unit: 1,
    img: "a colorful soccer ball",
    title: { id: "B adalah Bola", en: "B is for Ball" },
    intro: { id: "Hoot! Huruf B berbunyi /b/. Ayo main bola!", en: "Hoot! The letter B says /b/. Let's play ball!" },
    exercises: [
      {
        type: "tap",
        prompt: { id: "Ketuk bola! B untuk Bola.", en: "Tap the ball! B is for Ball." },
        options: [
          { img: "a colorful soccer ball", label: { id: "Bola", en: "Ball" }, correct: true },
          { img: "a cute orange cat", label: { id: "Kucing", en: "Cat" } },
          { img: "a green leafy tree", label: { id: "Pohon", en: "Tree" } },
        ],
      },
      {
        type: "fill",
        img: "a colorful soccer ball",
        word: { id: "_OLA", en: "_ALL" },
        prompt: { id: "Huruf apa yang hilang? B-O-L-A!", en: "Which letter is missing? B-A-L-L!" },
        options: ["B", "D", "P"],
        answer: "B",
      },
      {
        type: "trace",
        letter: "B",
        prompt: { id: "Jejak huruf B!", en: "Trace the letter B!" },
        word: { id: "Bola", en: "Ball" },
      },
      {
        type: "drag",
        img: "a colorful soccer ball",
        count: 4,
        prompt: { id: "Seret bola ke keranjang!", en: "Drag the balls to the basket!" },
        basket: "a woven wicker basket",
      },
      {
        type: "catch",
        img: "a colorful soccer ball",
        target: 5,
        decoys: ["a shiny red apple", "a cute orange cat"],
        prompt: { id: "Tangkap bola yang memantul!", en: "Catch the bouncing balls!" },
      },
    ],
  },

  // ─── 1.3 C adalah Cicak ───────────────────────────────────────────────────��─
  {
    id: "1.3",
    unit: 1,
    img: "a small friendly green gecko",
    title: { id: "C adalah Cicak", en: "C is for Gecko" },
    intro: { id: "Hoot hoot! C berbunyi /c/ seperti cicak di dinding!", en: "Hoot hoot! C says /c/ like the gecko on the wall!" },
    exercises: [
      {
        type: "story",
        prompt: { id: "Waktu cerita bersama Owly!", en: "Story time with Owly!" },
        pages: [
          { img: "a small friendly green gecko", text: { id: "Ini Cicak. Cicak dimulai dengan huruf C.", en: "This is a Gecko. Gecko starts with the letter C." } },
          { img: "a gecko climbing a brick wall", text: { id: "Cicak suka memanjat dinding. /c/ /c/ cicak!", en: "The gecko loves climbing walls. /c/ /c/ gecko!" } },
          { img: "a gecko catching a little bug", text: { id: "Cicak makan serangga kecil. Cicak sangat cepat!", en: "The gecko eats little bugs. So quick!" } },
        ],
      },
      {
        type: "tap",
        prompt: { id: "Ketuk cicak! C untuk Cicak.", en: "Tap the gecko! C is for Gecko." },
        options: [
          { img: "a small friendly green gecko", label: { id: "Cicak", en: "Gecko" }, correct: true },
          { img: "a shiny red apple", label: { id: "Apel", en: "Apple" } },
          { img: "a colorful soccer ball", label: { id: "Bola", en: "Ball" } },
        ],
      },
      {
        type: "trace",
        letter: "C",
        prompt: { id: "Jejak huruf C!", en: "Trace the letter C!" },
        word: { id: "Cicak", en: "Gecko" },
      },
      {
        type: "listen",
        img: "a small friendly green gecko",
        word: { id: "Cicak", en: "Gecko" },
        phon: "/c/ /c/",
        prompt: { id: "Ikuti Owly: C untuk Cicak!", en: "Follow Owly: C is for Gecko!" },
      },
    ],
  },

  // ─── 1.4 D, E, F Teman ────────────────────────────────────────────────────��─
  {
    id: "1.4",
    unit: 1,
    img: "a spiky green durian fruit",
    title: { id: "D, E, F Teman", en: "D, E, F Friends" },
    intro: { id: "Tiga teman baru: D, E, dan F! Ayo kenalan!", en: "Three new friends: D, E, and F! Let's meet them!" },
    exercises: [
      {
        type: "tap",
        prompt: { id: "Ketuk Durian! D untuk Durian.", en: "Tap the Durian! D is for Durian." },
        options: [
          { img: "a spiky green durian fruit", label: { id: "Durian", en: "Durian" }, correct: true },
          { img: "a brown eagle bird", label: { id: "Elang", en: "Eagle" } },
          { img: "a silver fish", label: { id: "Ikan", en: "Fish" } },
        ],
      },
      {
        type: "tap",
        prompt: { id: "Ketuk Elang! E untuk Elang.", en: "Tap the Eagle! E is for Eagle." },
        options: [
          { img: "a brown eagle bird with spread wings", label: { id: "Elang", en: "Eagle" }, correct: true },
          { img: "a spiky green durian fruit", label: { id: "Durian", en: "Durian" } },
          { img: "a pink blooming flower", label: { id: "Bunga", en: "Flower" } },
        ],
      },
      {
        type: "fill",
        img: "a big grey elephant",
        word: { id: "GA_AH", en: "ELE_HANT" },
        prompt: { id: "Isi hurufnya: Gajah!", en: "Fill the letter: Elephant!" },
        options: ["J", "F", "D"],
        answer: { id: "J", en: "P" },
      },
      {
        type: "trace",
        letter: "F",
        prompt: { id: "Jejak huruf F! F untuk Foto.", en: "Trace the letter F! F is for Photo." },
        word: { id: "Foto", en: "Photo" },
      },
      {
        type: "drag",
        img: "a brown eagle bird",
        count: 3,
        prompt: { id: "Seret elang ke sarang!", en: "Drag the eagles to the nest!" },
        basket: "a cozy bird nest made of twigs",
      },
    ],
  },

  // ─── 1.5 Pesta Huruf (Review) ─────────────────────────────────────────────��─
  {
    id: "1.5",
    unit: 1,
    img: "colorful party balloons and confetti",
    title: { id: "Pesta Huruf", en: "Letter Party" },
    intro: { id: "Waktunya pesta! Ayo ulang semua huruf A sampai F!", en: "Party time! Let's review all letters A to F!" },
    exercises: [
      {
        type: "tap",
        prompt: { id: "Mana yang dimulai dengan A?", en: "Which one starts with A?" },
        options: [
          { img: "a shiny red apple", label: { id: "Apel", en: "Apple" }, correct: true },
          { img: "a colorful soccer ball", label: { id: "Bola", en: "Ball" } },
          { img: "a small friendly green gecko", label: { id: "Cicak", en: "Gecko" } },
        ],
      },
      {
        type: "tap",
        prompt: { id: "Mana yang dimulai dengan B?", en: "Which one starts with B?" },
        options: [
          { img: "a colorful soccer ball", label: { id: "Bola", en: "Ball" }, correct: true },
          { img: "a spiky green durian fruit", label: { id: "Durian", en: "Durian" } },
          { img: "a brown eagle bird", label: { id: "Elang", en: "Eagle" } },
        ],
      },
      {
        type: "fill",
        img: "a small friendly green gecko",
        word: { id: "_ICAK", en: "_ECKO" },
        prompt: { id: "Huruf apa yang hilang? Cicak!", en: "Which letter is missing? Gecko!" },
        options: ["C", "A", "B"],
        answer: { id: "C", en: "G" },
      },
      {
        type: "tap",
        prompt: { id: "Mana yang dimulai dengan E?", en: "Which one starts with E?" },
        options: [
          { img: "a brown eagle bird", label: { id: "Elang", en: "Eagle" }, correct: true },
          { img: "a shiny red apple", label: { id: "Apel", en: "Apple" } },
          { img: "a colorful soccer ball", label: { id: "Bola", en: "Ball" } },
        ],
      },
      {
        type: "catch",
        img: "a bright yellow star",
        target: 6,
        decoys: ["a fluffy white cloud", "a crescent moon"],
        prompt: { id: "Tangkap bintang perayaan!", en: "Catch the party stars!" },
      },
    ],
  },
];

export const getLesson = (id) => LESSONS.find((l) => l.id === id);
export const lessonsByUnit = (unitId) => LESSONS.filter((l) => l.unit === unitId);
