import { notFound } from "next/navigation";
import DrumGameClient from "../DrumGameClient";
import BingoLabyrinthGameClient from "../BingoLabyrinthGameClient";
import styles from "./page.module.css";

const builtGameDetails = {
  drum: { title: "Drum", description: "Permainan drum interaktif built-in.", note: "This built-in game is implemented directly in Sena Kids." },
  "membuat-jalur": { title: "Petualangan Sena", description: "Bantu Sena menemukan jalan keluar maze!", note: "This built-in game is implemented directly in Sena Kids." },
  "learn-english-1": { title: "Learn English 1", description: "Belajar kata sederhana dan gambar.", note: "This built-in game is implemented directly in Sena Kids." },
  "flashcard-simple": { title: "Flashcard Simple", description: "Ingat kata melalui kartu.", note: "This built-in game is implemented directly in Sena Kids." },
  "tebak-gambar": { title: "Tebak Gambar", description: "Tebak gambar mana yang benar.", note: "This built-in game is implemented directly in Sena Kids." },
  "mencocokkan-gambar": { title: "Mencocokkan Gambar", description: "Cari pasangan gambar yang sama.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyambung-pipa": { title: "Menyambung Pipa", description: "Sambungkan pipa agar air mengalir.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyusun-gambar": { title: "Menyusun Gambar", description: "Susun potongan gambar menjadi utuh.", note: "This built-in game is implemented directly in Sena Kids." },
  "mengurutkan-balok": { title: "Mengurutkan Balok", description: "Urutkan balok sesuai urutan.", note: "This built-in game is implemented directly in Sena Kids." },
  "urutkan-bola-angka": { title: "Urutkan Bola Angka", description: "Susun bola berdasarkan angka.", note: "This built-in game is implemented directly in Sena Kids." },
  quiz: { title: "Quiz", description: "Jawab kuis seru dan menantang.", note: "This built-in game is implemented directly in Sena Kids." },
};

export default async function BuiltGamePage({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    notFound();
  }

  return (
    <div className={styles.container}>
      {slug === "drum" ? (
        <DrumGameClient />
      ) : slug === "membuat-jalur" ? (
        <BingoLabyrinthGameClient />
      ) : (
        <div className={styles.card}>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
          <div className={styles.note}>{game.note}</div>
        </div>
      )}
    </div>
  );
}
