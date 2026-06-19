"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronLeft, ChevronRight, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

const books = [
  {
    id: "gadis-lentera",
    title: "Gadis Lentera",
    originalTitle: "The Lantern Girl",
    author: "Rasya Swarnasta",
    cover: "https://lh3.googleusercontent.com/HI63_B-B1iII6oL3ubZ-79TjisVyHzHCWX2i09lbBsSrCBpUyl0J5wlo1X27mZoEqgV1hwws76x4W2O0vo1ATfr5dJORK26M6XKDqA=s512",
    color: "#2d1b4e",
    pages: [
      { text: "Suatu malam, Nora berjalan pulang melewati jalan yang gelap. Tiba-tiba, obor yang dibawanya padam tertiup angin.", illustration: "🌙🚶‍♀️💨" },
      { text: "Nora merasa takut. Gelap sekali di sekelilingnya. Dia tidak bisa melihat jalan pulang.", illustration: "😰🌑" },
      { text: "\"Aku harus menemukan cara untuk menerangi jalan!\" pikir Nora dengan berani.", illustration: "💭💡" },
      { text: "Nora mengingat cerita nenek tentang kunang-kunang yang bersinar di malam hari.", illustration: "👵✨🪲" },
      { text: "Dia menemukan sebuah toples kosong di tepi jalan dan mulai menangkap kunang-kunang.", illustration: "🏺✨" },
      { text: "Satu, dua, tiga... toples itu mulai bercahaya terang seperti lentera kecil!", illustration: "🔦💫" },
      { text: "Dengan lentera kunang-kunang, Nora bisa melihat jalan pulang. Dia berjalan dengan percaya diri.", illustration: "🏮🚶‍♀️😊" },
      { text: "Sesampainya di rumah, Nora melepaskan kunang-kunang ke langit malam. \"Terima kasih, teman-teman kecilku!\"", illustration: "🏡✨🌟" },
      { text: "Sejak hari itu, Nora selalu membawa toples kecil. Dia tahu bahwa cahaya bisa ditemukan di mana saja jika kita cukup berani mencarinya.", illustration: "🌟👧🏮" },
    ],
  },
  {
    id: "benih-istimewa",
    title: "Benih Istimewa",
    originalTitle: "Special Seeds",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/d2j83Xjfl0jtYQbm0zk5jOhvm4W3WsDwhKdldcEuLON8yec0jbKWtEtaNVrVCqGPsVbQI5sYVlB_uoI9TF790L-zWIl-GDB9y5IYQA=s512",
    color: "#1a4d2e",
    pages: [
      { text: "Maya mendapat benih dari kakeknya. \"Ini benih istimewa,\" kata Kakek. \"Rawat dengan sabar ya.\"", illustration: "👴🌱👧" },
      { text: "Maya menanam benih itu di pot kecil. Dia menyiramnya setiap hari dengan penuh kasih sayang.", illustration: "🪴💧😊" },
      { text: "Hari pertama, tidak ada yang terjadi. Hari kedua, masih sama. Maya mulai khawatir.", illustration: "😟🪴" },
      { text: "\"Sabarlah,\" kata Ibu. \"Hal-hal indah butuh waktu untuk tumbuh.\"", illustration: "👩🗣️💝" },
      { text: "Seminggu kemudian, tunas kecil muncul dari tanah! Maya sangat senang!", illustration: "🌱😃🎉" },
      { text: "Tunas itu tumbuh semakin besar setiap hari. Daunnya hijau dan segar.", illustration: "🌿☀️💚" },
      { text: "Suatu pagi, bunga yang indah mekar! Warnanya seperti pelangi!", illustration: "🌺🌈✨" },
      { text: "Maya berlari ke kakek. \"Kakek! Bunganya mekar! Indah sekali!\"", illustration: "👧🏃‍♀️👴🌸" },
      { text: "Kakek tersenyum. \"Kamu sudah belajar hal penting, Maya. Kesabaran dan kasih sayang selalu membuahkan hasil yang indah.\"", illustration: "👴😊🌺💝" },
    ],
  },
  {
    id: "kuat-seperti-ibu",
    title: "Kuat Seperti Ibu",
    originalTitle: "Strong Like Mom",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/Hf4_Wn-ZwyzHQ7_2xf0EjBboCi_DA4jdtEI0gigxwH_Xsb01hBw55nWpLgVRAb2sRfvI13fHaPFmBBlF-cKL3AU58Gx29WHRFwV1IA=s512",
    color: "#4a1942",
    pages: [
      { text: "Ibu Rani bekerja di pasar setiap hari. Dia mengangkat keranjang-keranjang berat dengan mudah.", illustration: "👩💪🧺" },
      { text: "\"Ibu kuat sekali!\" kata Rani kagum. \"Aku ingin kuat seperti Ibu.\"", illustration: "👧😍💭" },
      { text: "Ibu tertawa. \"Kuat bukan hanya soal otot, sayang. Kuat itu juga soal hati.\"", illustration: "👩😊❤️" },
      { text: "\"Maksud Ibu apa?\" tanya Rani bingung.", illustration: "👧❓" },
      { text: "\"Saat kamu membantu temanmu yang sedih, itu namanya kuat. Saat kamu berani bicara yang benar, itu juga kuat.\"", illustration: "🤝🗣️💪" },
      { text: "Rani memikirkan kata-kata Ibu. Besoknya di sekolah, dia melihat teman barunya duduk sendiri.", illustration: "🏫👧👀" },
      { text: "Rani mengajak teman barunya bermain bersama. \"Ayo main sama-sama!\" katanya.", illustration: "👧🤝👧😊" },
      { text: "Pulang sekolah, Rani cerita pada Ibu. \"Bu, tadi aku kuat seperti Ibu!\"", illustration: "👧😄👩" },
      { text: "Ibu memeluk Rani erat. \"Kamu memang kuat, sayang. Ibu bangga padamu.\"", illustration: "🤗💕✨" },
    ],
  },
  {
    id: "ayo-tumbuh",
    title: "Ayo Tumbuh!",
    originalTitle: "Please Grow",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/QJO60yrveQ96fKjIsznYu3z7MSmEBA-NUd5sgNTQsESfVC2W5C3ltPh_Q66mvREKX4I4Uadp9Q0UHBZDXmxX2BPc_0DxlHPcUYIG=s512",
    color: "#5c4a1e",
    pages: [
      { text: "Dito menanam biji bunga matahari di halaman rumah.", illustration: "👦🌻🌱" },
      { text: "Setiap pagi dia menyiramnya. \"Ayo tumbuh! Ayo tumbuh!\" katanya.", illustration: "💧🌱🗣️" },
      { text: "Tapi tanaman itu tumbuh sangat lambat. Dito mulai tidak sabar.", illustration: "😤🌱⏰" },
      { text: "\"Kenapa lama sekali?\" keluh Dito pada ayahnya.", illustration: "👦😩👨" },
      { text: "Ayah bilang, \"Coba lihat, setiap hari ada perubahan kecil. Daunnya bertambah satu.\"", illustration: "👨🍃👀" },
      { text: "Dito mulai memperhatikan lebih teliti. Benar! Ada daun baru yang muncul!", illustration: "👦😮🌿" },
      { text: "Minggu demi minggu berlalu. Tanaman itu semakin tinggi, bahkan lebih tinggi dari Dito!", illustration: "🌻📏👦" },
      { text: "Akhirnya bunga matahari itu mekar! Besar dan kuning cerah seperti matahari sungguhan!", illustration: "🌻☀️🎉" },
      { text: "Dito tersenyum lebar. \"Ternyata menunggu itu tidak buruk. Yang penting terus merawat setiap hari!\"", illustration: "👦😊🌻💛" },
    ],
  },
  {
    id: "kolam-ikan-kakek",
    title: "Kolam Ikan Kakek",
    originalTitle: "Grandpa's Fish Pond",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/Cb2WZWP0CFcxYnJ6fRHs6qk1Nn8Y_jG2cgjxiQEUpSK8XIW_C3RDdB2IK9KZJ-X0RRdmeyLIF0-wtmneIMspl1Ezq-SiZNdDQ6Albg=s512",
    color: "#1a3d5c",
    pages: [
      { text: "Setiap akhir pekan, Sari mengunjungi rumah Kakek di desa. Yang paling dia suka adalah kolam ikan di belakang rumah.", illustration: "👧🏡🐟" },
      { text: "Kolam kakek penuh dengan ikan berwarna-warni. Ada yang merah, emas, dan putih bercorak hitam.", illustration: "🐠🟡⚪⚫" },
      { text: "\"Kakek, kenapa ikan-ikan ini jinak sekali?\" tanya Sari.", illustration: "👧❓👴" },
      { text: "\"Karena Kakek merawat mereka dengan cinta setiap hari. Mereka sudah kenal Kakek,\" jawab Kakek sambil tersenyum.", illustration: "👴😊🐟❤️" },
      { text: "Kakek mengajari Sari cara memberi makan ikan. \"Taburkan sedikit saja, pelan-pelan.\"", illustration: "👴👧🐟🍚" },
      { text: "Ikan-ikan itu berenang ke permukaan, seolah menyapa Sari!", illustration: "🐟🐟👋😄" },
      { text: "\"Wah! Mereka suka padaku juga, Kek!\" seru Sari gembira.", illustration: "👧🎉🐠" },
      { text: "Kakek mengangguk. \"Kalau kamu sayang pada makhluk hidup, mereka juga akan sayang padamu.\"", illustration: "👴🐟💕" },
      { text: "Sari berjanji akan membantu Kakek merawat kolam setiap kali berkunjung. Kolam ikan kakek adalah tempat terbaik di dunia!", illustration: "👧🤝👴🐟🌈" },
    ],
  },
  {
    id: "mencari-ibu",
    title: "Mencari Ibu",
    originalTitle: "Finding Momma",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/dy1n_jSxArehNamUBH71q48xTtqzwHJYODe7NwWwCTlyiWHJzjFHnpJIXSmfD6uhOFcO8V97ekgWBAGtN8WvKnuu-C9eOxgC1oVGpQY=s512",
    color: "#2e5c1a",
    pages: [
      { text: "Kiki si anak bebek terpisah dari ibunya saat bermain di danau.", illustration: "🦆😢🌊" },
      { text: "\"Ibuuu! Ibu di mana?\" panggil Kiki sambil berenang ke sana kemari.", illustration: "🦆🗣️💨" },
      { text: "Kiki bertemu Katak. \"Pak Katak, apa kamu melihat ibuku?\" \"Coba cari di dekat teratai,\" kata Katak.", illustration: "🦆🐸🪷" },
      { text: "Kiki berenang ke teratai, tapi ibunya tidak ada. Dia bertemu Ikan. \"Bu Ikan, apa kamu tahu di mana ibuku?\"", illustration: "🦆🐟🪷" },
      { text: "\"Coba lihat di dekat pohon willow,\" saran Ikan.", illustration: "🐟🌳" },
      { text: "Kiki pergi ke pohon willow. Di sana ada Kura-kura tua. \"Ibumu tadi lewat sini, arah timur,\" kata Kura-kura.", illustration: "🦆🐢🌳👉" },
      { text: "Kiki berenang ke arah timur. Dia mendengar suara yang familiar... \"Kiki! Kiki!\"", illustration: "🦆👂🗣️" },
      { text: "\"Ibu!\" Kiki berenang secepat mungkin. Ibunya sudah menunggu dengan sayap terbuka lebar!", illustration: "🦆💨🦆🤗" },
      { text: "\"Jangan jauh-jauh lagi ya, sayang,\" kata Ibu sambil memeluk Kiki. Kiki berjanji akan selalu dekat dengan Ibu.", illustration: "🦆🤗🦆💕" },
    ],
  },
  {
    id: "tangan-ajaib",
    title: "Tangan Ajaib",
    originalTitle: "Magic Hands",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/k20sR0dLDGmXEukXboSOL3U98Rt4VhPyrli5rNA4M-qs6sg0abtKT9_X4tqZhwCurhM6Ak1sIugWcbkQ3tYWDfx7pIDxNwCFMXA4Y8M=s512",
    color: "#5c3a1a",
    pages: [
      { text: "Nenek punya tangan ajaib. Setiap hari tangannya sibuk membuat sesuatu yang indah.", illustration: "👵🤲✨" },
      { text: "Di pagi hari, tangan Nenek membuat kue lapis yang lembut dan manis.", illustration: "👵🍰🌅" },
      { text: "Di siang hari, tangan Nenek menjahit baju baru untuk boneka Sita.", illustration: "👵🧵🪡🧸" },
      { text: "Di sore hari, tangan Nenek menyiram bunga-bunga di taman.", illustration: "👵💧🌺🌷" },
      { text: "\"Nenek, kenapa tangan Nenek bisa membuat semua hal indah?\" tanya Sita.", illustration: "👧❓👵" },
      { text: "Nenek tersenyum. \"Karena tangan ini digerakkan oleh cinta, sayang.\"", illustration: "👵😊❤️🤲" },
      { text: "\"Aku juga mau punya tangan ajaib seperti Nenek!\" kata Sita.", illustration: "👧✨🤲" },
      { text: "\"Kamu sudah punya,\" kata Nenek. \"Setiap kali kamu memeluk Nenek, tanganmu jadi ajaib.\"", illustration: "👵🤗👧💕" },
      { text: "Sita memeluk Nenek erat-erat. Memang benar, tangan yang penuh cinta adalah tangan yang paling ajaib.", illustration: "🤗✨💝🌟" },
    ],
  },
  {
    id: "vroom-vroom",
    title: "Vroom! Vroom!",
    originalTitle: "Vroom! Vroom!",
    author: "Let's Read Asia",
    cover: "https://lh3.googleusercontent.com/bAdLD9j1sn95tJBqnYGGXoyfcDk52dws6gOCPJncmEJRGeODr1ageY8fsVLnX4nlP1zvZ8sHkC8_7pNxMhrvQZpv8uxSTHxJxVt3rg=s512",
    color: "#5c1a2e",
    pages: [
      { text: "Raka suka sekali dengan kendaraan. Setiap hari dia bermain mobil-mobilan.", illustration: "👦🚗🎮" },
      { text: "\"Vroom! Vroom!\" kata Raka sambil mendorong mobilnya di lantai.", illustration: "👦🚗💨" },
      { text: "Di jalan, Raka melihat truk besar. \"Wah, besar sekali! BRUMM!\"", illustration: "👦😮🚚" },
      { text: "Lalu lewat motor. \"NiiiIIIiing!\" Raka menirukan suaranya.", illustration: "🏍️👦🗣️" },
      { text: "Bis kuning lewat membawa anak-anak sekolah. \"Tin tin!\" klaksonnya berbunyi.", illustration: "🚌🎺👋" },
      { text: "Helikopter terbang di langit! \"Wush wush wush!\" baling-balingnya berputar.", illustration: "🚁👆😄" },
      { text: "\"Kalau besar nanti, aku mau jadi pilot!\" kata Raka.", illustration: "👦💭✈️👨‍✈️" },
      { text: "Ibu tertawa. \"Boleh! Tapi sekarang, ayo naik kendaraan ini dulu...\"", illustration: "👩😄❓" },
      { text: "Sepeda! Raka mengayuh sepedanya dengan senang. \"Vroom vroom!\" meski sepeda tidak ada mesinnya.", illustration: "👦🚲😂💨" },
    ],
  },
];

export default function BukuCeritaPage() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const openBook = (book) => {
    setSelectedBook(book);
    setCurrentPage(0);
  };

  const closeBook = () => {
    setSelectedBook(null);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if (selectedBook && currentPage < selectedBook.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={styles.container}>
      {!selectedBook ? (
        <>
          {/* Header */}
          <div className={styles.header}>
            <Link href="/home" className={styles.backBtn}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className={styles.title}>📖 Buku Cerita</h1>
              <p className={styles.subtitle}>Cerita anak dalam Bahasa Indonesia — gratis dibaca!</p>
            </div>
          </div>

          {/* Book Grid */}
          <div className={styles.bookGrid}>
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                className={styles.bookCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openBook(book)}
              >
                <div className={styles.bookCover} style={{ backgroundColor: book.color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={book.cover} alt={book.title} className={styles.coverImg} />
                </div>
                <div className={styles.bookInfo}>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookAuthor}>{book.author}</p>
                  <span className={styles.pageCount}>{book.pages.length} halaman</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Attribution */}
          <div className={styles.attribution}>
            <p>Cerita terinspirasi dari <a href="https://www.letsreadasia.org" target="_blank" rel="noopener noreferrer">Let&apos;s Read Asia</a> — The Asia Foundation</p>
          </div>
        </>
      ) : (
        /* Reader View */
        <AnimatePresence mode="wait">
          <motion.div
            className={styles.reader}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Reader Header */}
            <div className={styles.readerHeader}>
              <button className={styles.closeBtn} onClick={closeBook}>
                <ArrowLeft size={20} />
                <span>Kembali</span>
              </button>
              <h2 className={styles.readerTitle}>{selectedBook.title}</h2>
              <span className={styles.pageIndicator}>
                {currentPage + 1} / {selectedBook.pages.length}
              </span>
            </div>

            {/* Page Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                className={styles.pageContent}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.illustration}>
                  {selectedBook.pages[currentPage].illustration}
                </div>
                <p className={styles.pageText}>
                  {selectedBook.pages[currentPage].text}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className={styles.readerNav}>
              <button
                className={styles.navBtn}
                onClick={prevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft size={24} />
                Sebelum
              </button>

              {/* Progress dots */}
              <div className={styles.progressDots}>
                {selectedBook.pages.map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.dot} ${i === currentPage ? styles.activeDot : ''} ${i < currentPage ? styles.readDot : ''}`}
                    onClick={() => setCurrentPage(i)}
                  />
                ))}
              </div>

              <button
                className={styles.navBtn}
                onClick={nextPage}
                disabled={currentPage === selectedBook.pages.length - 1}
              >
                Lanjut
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Completion */}
            {currentPage === selectedBook.pages.length - 1 && (
              <motion.div
                className={styles.completion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>🎉 Selesai! Kamu hebat sudah membaca cerita ini!</p>
                <button className={styles.finishBtn} onClick={closeBook}>
                  <BookOpen size={18} />
                  Baca Cerita Lain
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
