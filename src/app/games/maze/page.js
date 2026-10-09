import Link from "next/link";
import { ArrowLeft, Compass, Play, Star, Gem, Skull, Flame } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
  title: "Petualangan Labirin | Sena Kids",
  description: "Jelajahi labirin, hindari rintangan meteor, dan temukan semua harta karun!",
  alternates: {
    canonical: "/games/maze",
  },
};

const DIFFICULTIES = [
  {
    id: "easy",
    level: 1,
    title: { id: "Labirin Mudah", en: "Easy Maze" },
    desc: { id: "Grid 17x17, 2 harta, tanpa meteor", en: "17x17 grid, 2 treasures, no meteors" },
    icon: <Star size={26} color="#f59e0b" />,
  },
  {
    id: "medium",
    level: 2,
    title: { id: "Labirin Sedang", en: "Medium Maze" },
    desc: { id: "Grid 25x25, 3 harta, jalur lebih bercabang", en: "25x25 grid, 3 treasures, branched paths" },
    icon: <Gem size={26} color="#3b82f6" />,
  },
  {
    id: "hard",
    level: 3,
    title: { id: "Labirin Sulit", en: "Hard Maze" },
    desc: { id: "Grid 33x33, 4 harta, waspadai meteor", en: "33x33 grid, 4 treasures, watch out for meteors" },
    icon: <Skull size={26} color="#8b5cf6" />,
  },
  {
    id: "extreme",
    level: 4,
    title: { id: "Labirin Extreme", en: "Extreme Maze" },
    desc: { id: "Grid 41x41, 5 harta, meteor lebih sering", en: "41x41 grid, 5 treasures, frequent meteors" },
    icon: <Flame size={26} color="#ef4444" />,
  },
];

export default function MazeMenuPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav aria-label="Navigasi permainan">
          <Link href="/games" className={styles.backButton}>
            <ArrowLeft size={18} />
            <span>Kembali ke Permainan</span>
          </Link>
        </nav>

        <div className={styles.grid}>
          <aside aria-label="Informasi permainan" className={styles.infoCard}>
            <div className={styles.rainbowBar} />
            <div className={styles.infoContent}>
              <span className={styles.badge}>
                <Compass size={16} />
                <span>Ayo menjelajah</span>
              </span>
              <h1 className={styles.title}>Petualangan Labirin</h1>
              <p className={styles.subtitle}>
                Jelajahi labirin dan temukan semua harta karun yang tersembunyi.
              </p>

              <div className={styles.rulesBox}>
                <h2 className={styles.rulesTitle}>Cara bermain</h2>
                <p className={styles.rulesText}>
                  Gunakan tombol panah keyboard atau kontrol di layar untuk bergerak. Pada tingkat Sulit dan Extreme, hindari petak bertanda sebelum meteor jatuh. Jika terkena meteor, kamu akan kembali ke titik awal tanpa kehilangan harta yang sudah ditemukan!
                </p>
              </div>
            </div>
          </aside>

          <section aria-labelledby="maze-difficulty-heading">
            <h2 id="maze-difficulty-heading" className={styles.sectionTitle}>
              Pilih tingkat kesulitan
            </h2>
            <p className={styles.sectionSubtitle}>
              Mulai dari yang mudah, lalu coba tantangan berikutnya.
            </p>

            <div className={styles.difficultyList}>
              {DIFFICULTIES.map((d) => (
                <article key={d.id} className={styles.difficultyCard}>
                  <div className={styles.difficultyMain}>
                    <div className={styles.iconWrapper} aria-hidden="true">
                      {d.icon}
                    </div>
                    <div>
                      <p className={styles.cardLevel}>Tingkat {d.level}</p>
                      <h3 className={styles.cardTitle}>{d.title.id}</h3>
                      <p className={styles.cardDesc}>{d.desc.id}</p>
                    </div>
                  </div>

                  <Link
                    href={`/games/maze/play?difficulty=${d.id}`}
                    className={styles.playButton}
                    aria-label={`Mulai ${d.title.id}`}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Mulai</span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
