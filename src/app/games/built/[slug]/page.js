import { notFound } from "next/navigation";
import DrumGameClient from "../DrumGameClient";
import BingoLabyrinthGameClient from "../BingoLabyrinthGameClient";
import LearnEnglish1GameClient from "../LearnEnglish1GameClient";
import FlashcardSimpleGameClient from "../FlashcardSimpleGameClient";
import TebakGambarGameClient from "../TebakGambarGameClient";
import MencocokkanGambarGameClient from "../MencocokkanGambarGameClient";
import MenyabungPipaGameClient from "../MenyabungPipaGameClient";
import MenyusunGambarGameClient from "../MenyusunGambarGameClient";
import MengurutkanBalokGameClient from "../MengurutkanBalokGameClient";
import UrutkanBolaAngkaGameClient from "../UrutkanBolaAngkaGameClient";
import QuizGameClient from "../QuizGameClient";
import BerhitungGameClient from "../BerhitungGameClient";
import MewarnaiGameClient from "../MewarnaiGameClient";
import HurufABCGameClient from "../HurufABCGameClient";
import WarnaGameClient from "../WarnaGameClient";
import PianoGameClient from "../PianoGameClient";
import PetualanganLabirinGameClient from "../PetualanganLabirinGameClient";
import Labirin3DGameClient from "../Labirin3DGameClient";
import BombermanGameClient from "../BombermanGameClient";
import BackButton from "@/components/BackButton";
import styles from "./page.module.css";

const builtGameDetails = {
  drum: { title: "Drum", description: "Permainan drum interaktif built-in.", note: "This built-in game is implemented directly in Sena Kids." },
  "membuat-jalur": { title: "Membuat Jalur", description: "Bantu Sena menemukan jalan keluar labirin!", note: "This built-in game is implemented directly in Sena Kids." },
  "learn-english-1": { title: "Learn English 1", description: "Belajar kata sederhana dan gambar.", note: "This built-in game is implemented directly in Sena Kids." },
  "flashcard-simple": { title: "Flashcard Simple", description: "Ingat kata melalui kartu.", note: "This built-in game is implemented directly in Sena Kids." },
  "tebak-gambar": { title: "Tebak Gambar", description: "Tebak gambar mana yang benar.", note: "This built-in game is implemented directly in Sena Kids." },
  "mencocokkan-gambar": { title: "Mencocokkan Gambar", description: "Cari pasangan gambar yang sama.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyabung-pipa": { title: "Menyabung Pipa", description: "Sambungkan pipa agar air mengalir.", note: "This built-in game is implemented directly in Sena Kids." },
  "menyusun-gambar": { title: "Menyusun Gambar", description: "Susun potongan gambar menjadi utuh.", note: "This built-in game is implemented directly in Sena Kids." },
  "mengurutkan-balok": { title: "Mengurutkan Balok", description: "Urutkan balok sesuai urutan.", note: "This built-in game is implemented directly in Sena Kids." },
  "urutkan-bola-angka": { title: "Urutkan Bola Angka", description: "Susun bola berdasarkan angka.", note: "This built-in game is implemented directly in Sena Kids." },
  quiz: { title: "Quiz", description: "Jawab kuis seru dan menantang.", note: "This built-in game is implemented directly in Sena Kids." },
  berhitung: { title: "Berhitung", description: "Selesaikan soal matematika seru!", note: "This built-in game is implemented directly in Sena Kids." },
  mewarnai: { title: "Mewarnai", description: "Warnai gambar yang indah!", note: "This built-in game is implemented directly in Sena Kids." },
  "huruf-abc": { title: "Huruf ABC", description: "Belajar huruf dan suara!", note: "This built-in game is implemented directly in Sena Kids." },
  warna: { title: "Menggambar Bebas", description: "Gambar bebas dengan warna-warni!", note: "This built-in game is implemented directly in Sena Kids." },
  piano: { title: "Piano", description: "Main piano interaktif!", note: "This built-in game is implemented directly in Sena Kids." },
  "petualangan-labirin": { title: "Petualangan Labirin", description: "Jelajahi labirin dan kumpulkan semua permata!", note: "This built-in game is implemented directly in Sena Kids." },
  "labirin-3d": { title: "Labirin 3D", description: "Jelajahi labirin 3D orang pertama dan kumpulkan permata!", note: "This built-in game is implemented directly in Sena Kids." },
  bomberman: { title: "Si Bom Pintar", description: "Letakkan bom, hancurkan peti, kalahkan monster!", note: "This built-in game is implemented directly in Sena Kids." },
};

const gameClients = {
  drum: DrumGameClient,
  "membuat-jalur": BingoLabyrinthGameClient,
  "learn-english-1": LearnEnglish1GameClient,
  "flashcard-simple": FlashcardSimpleGameClient,
  "tebak-gambar": TebakGambarGameClient,
  "mencocokkan-gambar": MencocokkanGambarGameClient,
  "menyabung-pipa": MenyabungPipaGameClient,
  "menyusun-gambar": MenyusunGambarGameClient,
  "mengurutkan-balok": MengurutkanBalokGameClient,
  "urutkan-bola-angka": UrutkanBolaAngkaGameClient,
  quiz: QuizGameClient,
  berhitung: BerhitungGameClient,
  mewarnai: MewarnaiGameClient,
  "huruf-abc": HurufABCGameClient,
  warna: WarnaGameClient,
  piano: PianoGameClient,
  "petualangan-labirin": PetualanganLabirinGameClient,
  "labirin-3d": Labirin3DGameClient,
  bomberman: BombermanGameClient,
};

export default async function BuiltGamePage({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    notFound();
  }

  const GameClient = gameClients[slug];

  return (
    <div className={styles.container}>
      <div className={styles.backButtonWrapper}>
        <BackButton />
      </div>
      <GameClient />
    </div>
  );
}