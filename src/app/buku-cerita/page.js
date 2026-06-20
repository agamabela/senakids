"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

const books = [
  {
    id: "the-lantern-girl",
    title: "Gadis Lentera",
    originalTitle: "The Lantern Girl",
    author: "Rasya Swarnasta",
    description: "Kisah Nora mencari cahaya di kegelapan",
    cover: "https://lh3.googleusercontent.com/HI63_B-B1iII6oL3ubZ-79TjisVyHzHCWX2i09lbBsSrCBpUyl0J5wlo1X27mZoEqgV1hwws76x4W2O0vo1ATfr5dJORK26M6XKDqA=s512",
    url: "https://www.letsreadasia.org/book/the-lantern-girl?bookLang=4846240843956224",
    color: "#2d1b4e",
  },
  {
    id: "special-seeds",
    title: "Benih Istimewa",
    originalTitle: "Special Seeds",
    author: "Let's Read Asia",
    description: "Kesabaran membuahkan hasil yang indah",
    cover: "https://lh3.googleusercontent.com/d2j83Xjfl0jtYQbm0zk5jOhvm4W3WsDwhKdldcEuLON8yec0jbKWtEtaNVrVCqGPsVbQI5sYVlB_uoI9TF790L-zWIl-GDB9y5IYQA=s512",
    url: "https://www.letsreadasia.org/book/special-seeds?bookLang=4846240843956224",
    color: "#1a4d2e",
  },
  {
    id: "strong-like-mom",
    title: "Kuat Seperti Ibu",
    originalTitle: "Strong Like Mom",
    author: "Let's Read Asia",
    description: "Arti kekuatan yang sesungguhnya",
    cover: "https://lh3.googleusercontent.com/Hf4_Wn-ZwyzHQ7_2xf0EjBboCi_DA4jdtEI0gigxwH_Xsb01hBw55nWpLgVRAb2sRfvI13fHaPFmBBlF-cKL3AU58Gx29WHRFwV1IA=s512",
    url: "https://www.letsreadasia.org/book/strong-like-mom?bookLang=4846240843956224",
    color: "#4a1942",
  },
  {
    id: "please-grow",
    title: "Ayo Tumbuh!",
    originalTitle: "Please Grow",
    author: "Let's Read Asia",
    description: "Merawat tanaman dengan sabar",
    cover: "https://lh3.googleusercontent.com/QJO60yrveQ96fKjIsznYu3z7MSmEBA-NUd5sgNTQsESfVC2W5C3ltPh_Q66mvREKX4I4Uadp9Q0UHBZDXmxX2BPc_0DxlHPcUYIG=s512",
    url: "https://www.letsreadasia.org/book/please-grow?bookLang=4846240843956224",
    color: "#5c4a1e",
  },
  {
    id: "grandpas-fish-pond",
    title: "Kolam Ikan Kakek",
    originalTitle: "Grandpa's Fish Pond",
    author: "Let's Read Asia",
    description: "Kasih sayang pada makhluk hidup",
    cover: "https://lh3.googleusercontent.com/Cb2WZWP0CFcxYnJ6fRHs6qk1Nn8Y_jG2cgjxiQEUpSK8XIW_C3RDdB2IK9KZJ-X0RRdmeyLIF0-wtmneIMspl1Ezq-SiZNdDQ6Albg=s512",
    url: "https://www.letsreadasia.org/book/grandpas-fish-pond?bookLang=4846240843956224",
    color: "#1a3d5c",
  },
  {
    id: "vroom-vroom",
    title: "Vroom! Vroom!",
    originalTitle: "Vroom! Vroom!",
    author: "Let's Read Asia",
    description: "Petualangan kendaraan yang seru",
    cover: "https://lh3.googleusercontent.com/bAdLD9j1sn95tJBqnYGGXoyfcDk52dws6gOCPJncmEJRGeODr1ageY8fsVLnX4nlP1zvZ8sHkC8_7pNxMhrvQZpv8uxSTHxJxVt3rg=s512",
    url: "https://www.letsreadasia.org/book/vroom-vroom?bookLang=4846240843956224",
    color: "#5c1a2e",
  },
  {
    id: "finding-momma",
    title: "Mencari Ibu",
    originalTitle: "Finding Momma",
    author: "Let's Read Asia",
    description: "Anak bebek yang tersesat",
    cover: "https://lh3.googleusercontent.com/dy1n_jSxArehNamUBH71q48xTtqzwHJYODe7NwWwCTlyiWHJzjFHnpJIXSmfD6uhOFcO8V97ekgWBAGtN8WvKnuu-C9eOxgC1oVGpQY=s512",
    url: "https://www.letsreadasia.org/book/finding-momma?bookLang=4846240843956224",
    color: "#2e5c1a",
  },
  {
    id: "magic-hands",
    title: "Tangan Ajaib",
    originalTitle: "Magic Hands",
    author: "Let's Read Asia",
    description: "Cinta di tangan Nenek",
    cover: "https://lh3.googleusercontent.com/k20sR0dLDGmXEukXboSOL3U98Rt4VhPyrli5rNA4M-qs6sg0abtKT9_X4tqZhwCurhM6Ak1sIugWcbkQ3tYWDfx7pIDxNwCFMXA4Y8M=s512",
    url: "https://www.letsreadasia.org/book/magic-hands?bookLang=4846240843956224",
    color: "#5c3a1a",
  },
  {
    id: "cant-get-in-my-way",
    title: "Tak Ada yang Menghalangiku",
    originalTitle: "Can't Get in My Way",
    author: "Let's Read Asia",
    description: "Cerita tentang keberanian dan tekad",
    cover: "https://lh3.googleusercontent.com/2Glig-YXcE8GLTBTXP1DNnICG7ItFaiYiSbDKLQ371p3skv8Py1wKtouFMyv-s6s3k3wK98TZkE9q1oNkUbQBfuFhEaokVVqAcwL=s512",
    url: "https://www.letsreadasia.org/book/cant-get-in-my-way?bookLang=4846240843956224",
    color: "#1a5c4a",
  },
  {
    id: "girl-against-chickens",
    title: "Gadis Melawan Ayam",
    originalTitle: "Girl Against Chickens",
    author: "Let's Read Asia",
    description: "Petualangan lucu di peternakan",
    cover: "https://lh3.googleusercontent.com/ybZubrzrXXGzoKr412HhmpD7ONOPSTmSTmFkBOd7RW7m1ta7z9EkEmudYxkwS6qGGXNuUIdO6S5UIjGwVg69OL0iZA21w8YoGMsp=s512",
    url: "https://www.letsreadasia.org/book/girl-against-chickens?bookLang=4846240843956224",
    color: "#4a5c1a",
  },
  {
    id: "oma-and-the-grasshoppers",
    title: "Nenek dan Belalang",
    originalTitle: "Oma and the Grasshoppers",
    author: "Let's Read Asia",
    description: "Kebijaksanaan seorang nenek",
    cover: "https://lh3.googleusercontent.com/yVbPtP5axRZ06MR2b5l0wy6prBKmigRmdfSmT8fE1rUflXZMAqc7AepFnu47klox3kLpF_k4Uc-OCjLgZfXzHAGISmf724Ok1_1K=s512",
    url: "https://www.letsreadasia.org/book/oma-and-the-grasshoppers?bookLang=4846240843956224",
    color: "#3a1a5c",
  },
  {
    id: "a-day-at-the-workshop",
    title: "Sehari di Bengkel",
    originalTitle: "A Day at the Workshop",
    author: "Let's Read Asia",
    description: "Belajar tentang pekerjaan",
    cover: "https://lh3.googleusercontent.com/XppKIfI4P5yyWkY_DkbXpXZ6-4eY6_93haPqj7WoBtvN35djDPnjQAx0sgqWkjjmWA1bcfI3Ipq1HDWX_ArpqqFrEAImMH9NPcn-=s512",
    url: "https://www.letsreadasia.org/book/a-day-at-the-workshop?bookLang=4846240843956224",
    color: "#5c4a2e",
  },
];

export default function BukuCeritaPage() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const openBook = (book) => {
    setSelectedBook(book);
    setIsLoading(true);
  };

  const closeBook = () => {
    setSelectedBook(null);
    setIsLoading(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className={styles.title}>📖 Buku Cerita</h1>
          <p className={styles.subtitle}>Baca buku cerita anak gratis dalam Bahasa Indonesia</p>
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
            transition={{ delay: index * 0.04 }}
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
              <p className={styles.bookDesc}>{book.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Attribution */}
      <div className={styles.attribution}>
        <p>Buku disediakan oleh <a href="https://www.letsreadasia.org" target="_blank" rel="noopener noreferrer">Let&apos;s Read</a> — The Asia Foundation. Gratis untuk dibaca!</p>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            className={styles.readerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.readerModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Reader Header */}
              <div className={styles.readerHeader}>
                <div className={styles.readerHeaderLeft}>
                  <button className={styles.closeBtn} onClick={closeBook}>
                    <X size={20} />
                  </button>
                  <div className={styles.readerBookInfo}>
                    <h2 className={styles.readerTitle}>{selectedBook.title}</h2>
                    <span className={styles.readerAuthor}>{selectedBook.author}</span>
                  </div>
                </div>
                <a
                  href={selectedBook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.externalLink}
                >
                  <ExternalLink size={16} />
                  Buka di Let&apos;s Read
                </a>
              </div>

              {/* Iframe Reader */}
              <div className={styles.iframeWrapper}>
                {isLoading && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <p>Memuat buku...</p>
                  </div>
                )}
                <iframe
                  src={selectedBook.url}
                  className={styles.iframe}
                  onLoad={() => setIsLoading(false)}
                  title={selectedBook.title}
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
