"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./page.module.css";

// Snapshot from the public Let's Read Asia API (language id 6260074016145408).
// Destinations use masterBookId because the current reader resolves books by ID.
const books = [
  { id: "b2dfb64f-5b97-4697-86f3-f1f583e08553", title: "Jangan Sampai Ibu Tahu", description: "Rowa ingin memelihara binatang, tetapi Ibu selalu melarang.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ec7bc4ff-67a2-4cd8-8c55-edce3039011a.png", url: "https://www.letsreadasia.org/read/b2dfb64f-5b97-4697-86f3-f1f583e08553?bookLang=6260074016145408", color: "#2d1b4e" },
  { id: "f6f494dc-18f3-4352-a128-7857ef65fbcb", title: "Tangan-Tangan Ajaib", description: "Tangan Kakek bisa membuat kejutan dan menyulap hal biasa menjadi luar biasa.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5948a5e4-c050-4fa2-9b8c-2a7c1f09c903.png", url: "https://www.letsreadasia.org/read/f6f494dc-18f3-4352-a128-7857ef65fbcb?bookLang=6260074016145408", color: "#1a4d2e" },
  { id: "95199e3a-5387-495f-82bd-2f1d52b6eeda", title: "Kapan Kapal Datang", description: "Ela menunggu kapal perintis yang membawa sepatu barunya.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/6637613c-e7c8-4f83-bdef-cec376961d3b.png", url: "https://www.letsreadasia.org/read/95199e3a-5387-495f-82bd-2f1d52b6eeda?bookLang=6260074016145408", color: "#1a3d5c" },
  { id: "6388940d-11a3-470b-8ae6-85080ebb60dd", title: "Setelah Kami Pindah", description: "Ikuti petualangan tinggal di rumah baru yang sering berguncang.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/b58422bf-a795-460e-969e-71f7afbdf815.png", url: "https://www.letsreadasia.org/read/6388940d-11a3-470b-8ae6-85080ebb60dd?bookLang=6260074016145408", color: "#5c4a1e" },
  { id: "c1c6efc0-84ff-46ae-b05c-d483b73fc844", title: "Yang Penting Selesai", description: "Aku harus menata banyak kue sebelum melihat anak sapi di rumah Nenek.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/398ef646-a846-4d81-9257-609250c6f5d2.png", url: "https://www.letsreadasia.org/read/c1c6efc0-84ff-46ae-b05c-d483b73fc844?bookLang=6260074016145408", color: "#4a1942" },
  { id: "216a0037-d8b1-489e-94ef-0e1d9d30bc31", title: "Kue Jadah Tujuh Warna", description: "Ajeng penasaran seperti apa rasa kue jadah tujuh warna.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ab0ba2df-806c-448e-bb8c-1fc1b62a6dd6.png", url: "https://www.letsreadasia.org/read/216a0037-d8b1-489e-94ef-0e1d9d30bc31?bookLang=6260074016145408", color: "#5c1a2e" },
  { id: "82d7d3f1-2ab2-4933-b99a-d2d3e7258321", title: "Takut", description: "Tiki ingin bermain di taman bermain di tengah hutan.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/53132d2a-4932-41c0-97ad-75a81e3ec488.png", url: "https://www.letsreadasia.org/read/82d7d3f1-2ab2-4933-b99a-d2d3e7258321?bookLang=6260074016145408", color: "#2e5c1a" },
  { id: "12f23f06-d786-4901-bbf8-51a0ceeab3b4", title: "Tolong Mintakan Durian", description: "Tapir ingin meminta durian kepada Paman Harimau, tetapi takut.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/ed45b036-aa46-4151-928a-d6a53fbb8b43.png", url: "https://www.letsreadasia.org/read/12f23f06-d786-4901-bbf8-51a0ceeab3b4?bookLang=6260074016145408", color: "#1a5c4a" },
];

export default function BukuCeritaPage() {
  const { language } = useLanguage();
  const tx = (id, en) => (language === "id" ? id : en);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/home" className={styles.backBtn}><ArrowLeft size={20} /></Link>
        <div>
          <h1 className={styles.title}>{tx("Buku Cerita", "Story Books")}</h1>
          <p className={styles.subtitle}>{tx("Baca buku cerita anak gratis dalam Bahasa Indonesia", "Read free children's story books")}</p>
        </div>
      </div>
      <div className={styles.bookGrid}>
        {books.map((book, index) => (
          <motion.a key={book.id} href={book.url} target="_blank" rel="noopener noreferrer" className={styles.bookCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
            <div className={styles.bookCover} style={{ backgroundColor: book.color }}><img src={book.cover} alt={book.title} className={styles.coverImg} /></div>
            <div className={styles.bookInfo}><h3 className={styles.bookTitle}>{book.title}</h3><p className={styles.bookAuthor}>Let&apos;s Read Asia</p><p className={styles.bookDesc}>{book.description}</p><span className={styles.externalLink}><ExternalLink size={14} />{tx("Baca di Let's Read", "Read on Let's Read")}</span></div>
          </motion.a>
        ))}
      </div>
      <div className={styles.attribution}><p>{tx("Buku disediakan oleh", "Books provided by")} <a href="https://www.letsreadasia.org" target="_blank" rel="noopener noreferrer">Let&apos;s Read</a> — The Asia Foundation. {tx("Gratis untuk dibaca!", "Free to read!")}</p></div>
    </div>
  );
}
