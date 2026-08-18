"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  { id: "f319a94e-6dd0-4d7d-b1a0-09c1080c38f5", title: "Sempat Tidak, ya", description: "Sebuah cerita tentang mencari waktu untuk hal-hal yang penting.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/71328334-8e56-4b71-a11a-f51591b3a9e5.png", url: "https://www.letsreadasia.org/read/f319a94e-6dd0-4d7d-b1a0-09c1080c38f5?bookLang=6260074016145408", color: "#73522e" },
  { id: "fa998b7a-149c-44a6-ac6b-245e7196d587", title: "Menggambar Kakek", description: "Isa harus menggambar Kakek, tetapi tidak pernah bertemu dan tidak punya fotonya.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/1c43a9c6-002a-4516-a31a-d14546da5e1e.png", url: "https://www.letsreadasia.org/read/fa998b7a-149c-44a6-ac6b-245e7196d587?bookLang=6260074016145408", color: "#4b3b72" },
  { id: "e62469e6-6d1f-4657-9e84-4ceb30b8e2c5", title: "Mencari Kuroki", description: "Raya mencari Kuroki yang tidak ada di dekat kolam setelah hujan reda.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/47d6d30a-be48-47fc-a37b-da153360b4d0.png", url: "https://www.letsreadasia.org/read/e62469e6-6d1f-4657-9e84-4ceb30b8e2c5?bookLang=6260074016145408", color: "#265c4b" },
  { id: "99051e6f-3081-4a97-9d55-7bffd5d53e3d", title: "Gara-gara Hujan", description: "Seorang anak dan bapaknya berusaha tiba tepat waktu untuk pertandingan badminton.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/15c6cc22-cd52-46a6-8a07-54e19ff38858.png", url: "https://www.letsreadasia.org/read/99051e6f-3081-4a97-9d55-7bffd5d53e3d?bookLang=6260074016145408", color: "#244f73" },
  { id: "8f0e6b5e-b518-4011-b296-d795634ced03", title: "Ketika Musim Ulat Jati", description: "Nono mencari cara melindungi diri dari ulat jati saat payungnya rusak.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/5462fd0d-ccbe-476a-84d2-547f31e22cbd.png", url: "https://www.letsreadasia.org/read/8f0e6b5e-b518-4011-b296-d795634ced03?bookLang=6260074016145408", color: "#496625" },
  { id: "9dd061fa-4441-4290-a52c-e81682042916", title: "Cacing untuk Memancing", description: "Nino harus mencari cacing untuk memancing setelah tongkatnya patah.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/3b1aa54c-5ae7-4fd8-8b98-40c51c8a822e.png", url: "https://www.letsreadasia.org/read/9dd061fa-4441-4290-a52c-e81682042916?bookLang=6260074016145408", color: "#624823" },
  { id: "0a56cbe6-8b75-4d93-b078-025933f26c9a", title: "Ada Sesuatu di Kamar Mandi", description: "Saat listrik padam, Feri melihat sepasang mata di kamar mandi.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/20b7ea01-4597-4e05-b410-6e44583e1282.png", url: "https://www.letsreadasia.org/read/0a56cbe6-8b75-4d93-b078-025933f26c9a?bookLang=6260074016145408", color: "#31566b" },
  { id: "304c2b92-a109-46c4-98ea-dae7c66ec3e0", title: "Mencari Emak", description: "Mona bersepeda ke kampung sebelah untuk mengantarkan tas rias Emak.", cover: "https://storage.googleapis.com/lets-read-asia/assets/images/753a086c-3cfd-4c3c-8a27-738115933c0d.png", url: "https://www.letsreadasia.org/read/304c2b92-a109-46c4-98ea-dae7c66ec3e0?bookLang=6260074016145408", color: "#6b3e4f" },
];

export default function BukuCeritaPage() {
  const { language } = useLanguage();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const tx = (id, en) => (language === "id" ? id : en);

  useEffect(() => {
    if (!selectedBook) return;
    const closeOnEscape = (event) => event.key === "Escape" && setSelectedBook(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedBook]);

  const openReader = (book) => {
    setIsLoading(true);
    setSelectedBook(book);
  };

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
          <motion.button key={book.id} type="button" onClick={() => openReader(book)} className={styles.bookCard} aria-label={`${tx("Baca buku", "Read book")}: ${book.title}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
            <div className={styles.bookCover} style={{ backgroundColor: book.color }}><img src={book.cover} alt={book.title} className={styles.coverImg} /></div>
            <div className={styles.bookInfo}><h3 className={styles.bookTitle}>{book.title}</h3><p className={styles.bookAuthor}>Let&apos;s Read Asia</p><p className={styles.bookDesc}>{book.description}</p><span className={styles.externalLink}>{tx("Baca sekarang", "Read now")}</span></div>
          </motion.button>
        ))}
      </div>
      <div className={styles.attribution}><p>{tx("Buku disediakan oleh", "Books provided by")} <a href="https://www.letsreadasia.org" target="_blank" rel="noopener noreferrer">Let&apos;s Read</a> (The Asia Foundation). {tx("Gratis untuk dibaca!", "Free to read!")}</p></div>
      {selectedBook && (
        <div className={styles.readerOverlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedBook(null)}>
          <div className={styles.readerModal} role="dialog" aria-modal="true" aria-labelledby="reader-title">
            <div className={styles.readerHeader}>
              <h2 id="reader-title" className={styles.readerTitle}>{selectedBook.title}</h2>
              <div className={styles.readerActions}>
                <a href={selectedBook.url} target="_blank" rel="noopener noreferrer" className={styles.readerExternal}><ExternalLink size={16} /><span>{tx("Buka di Let's Read", "Open on Let's Read")}</span></a>
                <button type="button" onClick={() => setSelectedBook(null)} className={styles.closeBtn} aria-label={tx("Tutup pembaca", "Close reader")}><X size={22} /></button>
              </div>
            </div>
            <div className={styles.iframeWrapper}>
              {isLoading && <div className={styles.loadingOverlay}><div className={styles.spinner} /><p>{tx("Memuat buku...", "Loading book...")}</p></div>}
              <iframe src={selectedBook.url} title={selectedBook.title} className={styles.iframe} onLoad={() => setIsLoading(false)} allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
