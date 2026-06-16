"use client";

import { motion } from "framer-motion";
import { PlayCircle, Tv, Clapperboard, Star, Clock } from "lucide-react";
import styles from "./page.module.css";

const playlist = [
  { title: "Belajar Huruf ABC", duration: "5:30", category: "Pendidikan", color: "var(--color-pink)" },
  { title: "Kisah Binatang di Hutan", duration: "12:00", category: "Dongeng", color: "var(--color-green)" },
  { title: "Lagu Anak: Balonku", duration: "3:45", category: "Musik", color: "var(--color-yellow)" },
  { title: "Eksperimen Gunung Meletus", duration: "8:20", category: "Sains", color: "var(--color-orange)" },
];

export default function TvPage() {
  return (
    <div className={styles.container}>
      
      <div className={styles.cinemaHeader}>
        <Clapperboard size={32} className={styles.headerIcon} />
        <h1 className={styles.pageTitle}>Sena Cinema</h1>
      </div>

      <div className={styles.layout}>
        {/* Main Screen */}
        <div className={styles.mainScreenArea}>
          <motion.div 
            className={styles.screenWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.screenPlaceholder}>
              <motion.button 
                className={styles.playMainBtn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <PlayCircle size={80} strokeWidth={1.5} />
              </motion.button>
              <div className={styles.screenLabel}>Sedang Tayang: Petualangan Luar Angkasa</div>
            </div>
          </motion.div>
          
          <div className={styles.screenDetails}>
            <h2 className={styles.videoTitle}>Petualangan Luar Angkasa 🚀</h2>
            <p className={styles.videoDesc}>Ayo ikuti petualangan seru astronot cilik kita menjelajahi planet-planet di tata surya!</p>
            <div className={styles.videoTags}>
              <span className={styles.tag}>Sains</span>
              <span className={styles.tag}>Animasi 3D</span>
            </div>
          </div>
        </div>

        {/* Playlist / Ticket Area */}
        <div className={styles.playlistArea}>
          <h3 className={styles.playlistTitle}>
            <Tv size={20} /> Playlist Pilihan
          </h3>
          
          <div className={styles.ticketList}>
            {playlist.map((item, i) => (
              <motion.div 
                key={item.title} 
                className={styles.ticketCard}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: -4 }}
              >
                <div className={styles.ticketLeft} style={{ backgroundColor: item.color }}>
                  <Star fill="white" color="white" size={24} />
                </div>
                <div className={styles.ticketBody}>
                  <h4 className={styles.ticketTitle}>{item.title}</h4>
                  <div className={styles.ticketMeta}>
                    <span>{item.category}</span>
                    <span className={styles.duration}><Clock size={12} /> {item.duration}</span>
                  </div>
                </div>
                <div className={styles.ticketRight}>
                  <PlayCircle size={24} color="var(--color-primary)" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
