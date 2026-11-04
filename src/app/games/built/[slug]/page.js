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
import InfiniteFlierGameClient from "../InfiniteFlierGameClient";
import SnakeGameClient from "../SnakeGameClient";
import LudoGameClient from "../LudoGameClient";
import UlarTanggaGameClient from "../UlarTanggaGameClient";
import LacakHurufGameClient from "../LacakHurufGameClient";
import LacakAngkaGameClient from "../LacakAngkaGameClient";
import JigsawGameClient from "../JigsawGameClient";
import PukulTikusGameClient from "../PukulTikusGameClient";
import SimonBilangGameClient from "../SimonBilangGameClient";
import LetuskanBalonGameClient from "../LetuskanBalonGameClient";
import PlatformerGameClient from "../PlatformerGameClient";
import SkiPagiGameClient from "../SkiPagiGameClient";
import NumberBalanceGameClient from "../NumberBalanceGameClient";
import BlockBlastGameClient from "../BlockBlastGameClient";
import WordSearchGameClient from "../WordSearchGameClient";
import ColorConnectGameClient from "../ColorConnectGameClient";
import ZipPathGameClient from "../ZipPathGameClient";
import TopplePartyGameClient from "../TopplePartyGameClient";
import MathComparisonGameClient from "../MathComparisonGameClient";
import MathFractionGameClient from "../MathFractionGameClient";
import MathAdditionGameClient from "../MathAdditionGameClient";
import MathSubtractionGameClient from "../MathSubtractionGameClient";
import MathNegativeGameClient from "../MathNegativeGameClient";
import MathMultiplicationGameClient from "../MathMultiplicationGameClient";
import MemoryMorseGameClient from "../MemoryMorseGameClient";
import MemahamiKoordinatGameClient from "../MemahamiKoordinatGameClient";
import AviatorGameClient from "../AviatorGameClient";
import ToyCarGameClient from "../ToyCarGameClient";
import BackButton from "@/components/BackButton";
import { getSiteUrl } from "@/lib/site-url";
import styles from "./page.module.css";

export const builtGameDetails = {
  drum: {
    title: "Drum",
    seoTitle: "Game Drum Virtual Interaktif Anak",
    seoDescription: "Mainkan simulator alat musik drum virtual anak online gratis di Sena Kids. Latih kepekaan ritme, ketukan nada, dan motorik anak dengan seru.",
    description: "Permainan drum interaktif built-in.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "membuat-jalur": {
    title: "Membuat Jalur",
    seoTitle: "Game Membuat Jalur Labirin Logika Anak",
    seoDescription: "Bantu Sena menemukan jalan keluar labirin! Game logika teka-teki pemecahan masalah interaktif untuk melatih daya pikir spasial anak.",
    description: "Bantu Sena menemukan jalan keluar labirin!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "learn-english-1": {
    title: "Learn English 1",
    seoTitle: "Game Belajar Bahasa Inggris Anak Pemula",
    seoDescription: "Belajar kosakata bahasa Inggris sederhana dengan gambar visual dan panduan suara interaktif di Sena Kids.",
    description: "Belajar kata sederhana dan gambar.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "flashcard-simple": {
    title: "Flashcard Simple",
    seoTitle: "Game Flashcard Edukasi Kartu Kata Anak",
    seoDescription: "Permainan mengingat kata dan visual melalui kartu flashcard interaktif untuk anak usia dini (PAUD & TK).",
    description: "Ingat kata melalui kartu.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "tebak-gambar": {
    title: "Tebak Gambar",
    seoTitle: "Game Tebak Gambar Edukasi Anak Online",
    seoDescription: "Tebak gambar mana yang benar! Game kuis visual edukatif untuk mengasah daya ingat, pengenalan benda, dan kosakata anak.",
    description: "Tebak gambar mana yang benar.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "mencocokkan-gambar": {
    title: "Mencocokkan Gambar",
    seoTitle: "Game Mencocokkan Pasangan Gambar Anak (Memory Match)",
    seoDescription: "Cari dan cocokkan pasangan kartu gambar yang sama. Game memori klasik untuk melatih konsentrasi dan daya ingat anak secara interaktif.",
    description: "Cari pasangan gambar yang sama.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "menyabung-pipa": {
    title: "Menyabung Pipa",
    seoTitle: "Game Menyambung Pipa Air Teka-Teki Logika Anak",
    seoDescription: "Sambungkan sambungan pipa agar aliran air mengalir lancar ke tujuan! Game teka-teki logika interaktif untuk mengasah strategi anak.",
    description: "Sambungkan pipa agar air mengalir.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "menyusun-gambar": {
    title: "Menyusun Gambar",
    seoTitle: "Game Menyusun Potongan Gambar Acak Anak",
    seoDescription: "Susun potongan-potongan gambar menjadi gambar utuh. Latihan koordinasi mata dan tangan serta persepsi visual anak.",
    description: "Susun potongan gambar menjadi utuh.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "mengurutkan-balok": {
    title: "Mengurutkan Balok",
    seoTitle: "Game Mengurutkan Balok Ukuran & Warna Anak",
    seoDescription: "Urutkan balok balok sesuai pola ukuran dan warna. Permainan logika matematika dasar untuk anak usia dini.",
    description: "Urutkan balok sesuai urutan.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "urutkan-bola-angka": {
    title: "Urutkan Bola Angka",
    seoTitle: "Game Mengurutkan Bola Angka Matematika TK/SD",
    seoDescription: "Susun dan urutkan bola bernomor dari terkecil ke terbesar. Cara seru mengenalkan konsep urutan bilangan matematika bagi anak.",
    description: "Susun bola berdasarkan angka.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  quiz: {
    title: "Quiz",
    seoTitle: "Kuis Pintar Interaktif Anak Online",
    seoDescription: "Jawab kuis pengetahuan umum cilik yang seru dan menantang untuk mengasah wawasan anak di Sena Kids.",
    description: "Jawab kuis seru dan menantang.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  berhitung: {
    title: "Berhitung",
    seoTitle: "Game Belajar Berhitung & Matematika Anak TK/SD",
    seoDescription: "Selesaikan soal penjumlahan dan latihan berhitung matematika dasar dengan panduan visual interaktif di Sena Kids.",
    description: "Selesaikan soal matematika seru!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  mewarnai: {
    title: "Mewarnai",
    seoTitle: "Game Mewarnai Gambar Anak Online Gratis",
    seoDescription: "Permainan mewarnai gambar online untuk anak TK dan PAUD. Pilihan sketsa menarik, mudah dimainkan di layar sentuh maupun laptop.",
    description: "Warnai gambar yang indah!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "huruf-abc": {
    title: "Huruf ABC",
    seoTitle: "Game Belajar Huruf Abjad ABC & Suara Fonik Anak",
    seoDescription: "Belajar mengenal huruf alfabet A sampai Z lengkap dengan pengucapan suara fonik interaktif untuk anak PAUD dan TK.",
    description: "Belajar huruf dan suara!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  warna: {
    title: "Menggambar Bebas",
    seoTitle: "Game Menggambar & Melukis Kanvas Anak Online",
    seoDescription: "Kanvas menggambar dan mewarnai bebas untuk melatih kreativitas anak dengan aneka pilihan kuas warna-warni.",
    description: "Gambar bebas dengan warna-warni!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  piano: {
    title: "Piano",
    seoTitle: "Game Piano Virtual Interaktif Musik Anak Online",
    seoDescription: "Mainkan tuts piano virtual interaktif. Kenalkan tangga nada musik kepada anak dengan cara yang menyenangkan.",
    description: "Main piano interaktif!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "petualangan-labirin": {
    title: "Petualangan Labirin",
    seoTitle: "Game Petualangan Labirin Harta Karun Anak",
    seoDescription: "Jelajahi labirin teka-teki, hindari rintangan, dan kumpulkan semua permata berkilau untuk melatih fokus anak.",
    description: "Jelajahi labirin dan kumpulkan semua permata!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "labirin-3d": {
    title: "Labirin 3D",
    seoTitle: "Game Labirin 3D Orang Pertama Anak Online",
    seoDescription: "Jelajahi labirin 3D dari sudut pandang orang pertama (first-person), navigasikan lorong, dan kumpulkan kristal harta karun.",
    description: "Jelajahi labirin 3D orang pertama dan kumpulkan permata!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  bomberman: {
    title: "Si Bom Pintar",
    seoTitle: "Game Si Bom Pintar Arkade Logika Anak",
    seoDescription: "Letakkan bom cerdas, buka jalur peti kayu, dan selesaikan tantangan labirin dalam permainan logika arkade anak.",
    description: "Letakkan bom, hancurkan peti, kalahkan monster!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "astronot-terbang": {
    title: "Astronot Terbang",
    seoTitle: "Game Astronot Terbang Luar Angkasa Anak",
    seoDescription: "Terbangkan roket astronot cilik di luar angkasa, hindari meteor rintangan, dan kumpulkan bintang kejora sebanyak-banyaknya.",
    description: "Terbang dan hindari rintangan, kumpulkan bintang!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "ular-pintar": {
    title: "Ular Pintar",
    seoTitle: "Permainan Ular Pintar (Snake) Klasik Anak",
    seoDescription: "Mainkan permainan ular klasik untuk melatih ketangkasan dan refleks. Ambil buah, tumbuh panjang, dan hindari menabrak dinding.",
    description: "Makan buah, tumbuh panjang, jangan menabrak!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  ludo: {
    title: "Ludo",
    seoTitle: "Game Ludo Online Anak & Keluarga Gratis",
    seoDescription: "Permainan papan Ludo klasik online untuk dimainkan bersama keluarga atau komputer langsung di peramban.",
    description: "Balapan bidak mengelilingi papan, capai pusat lebih dulu!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "ular-tangga": {
    title: "Ular Tangga",
    seoTitle: "Permainan Papan Ular Tangga Online Anak",
    seoDescription: "Main papan permainan ular tangga online gratis. Lempar dadu, panjat tangga, dan hindari ular bersama teman atau komputer.",
    description: "Naik tangga, hindari ular: versi klasik atau buat papanmu sendiri!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "lacak-huruf": {
    title: "Lacak Huruf",
    seoTitle: "Game Lacak Huruf Abjad A-Z Garis Titik-Titik Online",
    seoDescription: "Belajar menulis huruf abjad A-Z untuk anak PAUD dan TK dengan menelusuri garis titik-titik panduan interaktif.",
    description: "Belajar menulis huruf A-Z dengan menelusuri titik-titik!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "lacak-angka": {
    title: "Lacak Angka",
    seoTitle: "Game Lacak Angka 0-9 Belajar Menulis Anak Online",
    seoDescription: "Latihan menulis angka 0 sampai 9 dengan menelusuri garis titik-titik terarah untuk melatih kemampuan motorik halus anak.",
    description: "Belajar menulis angka 0-9 dengan menelusuri titik-titik!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "puzzle-gambar": {
    title: "Puzzle Gambar",
    seoTitle: "Game Puzzle Jigsaw Gambar Hewan Anak Online",
    seoDescription: "Susun kepingan puzzle jigsaw gambar menjadi utuh. Melatih kesabaran, daya analisis ruang, dan pemecahan masalah anak.",
    description: "Susun keping puzzle jigsaw menjadi gambar utuh!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "pukul-tikus": {
    title: "Pukul Tikus",
    seoTitle: "Game Pukul Tikus (Whack-a-Mole) Ketangkasan Anak",
    seoDescription: "Pukul tikus mondok yang keluar dari lubang secepat mungkin sebelum waktu habis! Latihan refleks dan koordinasi motorik anak.",
    description: "Pukul tikus secepat mungkin sebelum waktu habis!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "simon-bilang": {
    title: "Simon Bilang",
    seoTitle: "Game Simon Bilang Memori Warna & Suara Anak",
    seoDescription: "Ingat dan ulangi pola urutan warna serta nada suara yang makin panjang. Game melatih konsentrasi memori jangka pendek anak.",
    description: "Ingat dan ulangi urutan warna yang makin panjang!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "letuskan-balon": {
    title: "Letuskan Balon",
    seoTitle: "Game Letuskan Balon Berhitung & Warna Anak",
    seoDescription: "Letuskan balon udara warna-warni sesuai instruksi angka berhitung untuk melatih fokus dan kemampuan berhitung anak usia dini.",
    description: "Letuskan balon sesuai jumlah untuk belajar berhitung!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "petualangan-lompat": {
    title: "Petualangan Lompat",
    seoTitle: "Permainan Petualangan Lompat Platformer Anak",
    seoDescription: "Berlari, melompati rintangan, mengumpulkan bintang, dan capai bendera finis dalam permainan platformer petualangan anak.",
    description: "Lari, lompat, kumpulkan bintang, dan capai bendera!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "ski-pagi": {
    title: "Ski Pagi",
    seoTitle: "Permainan Ski Pagi Meluncur di Salju Anak",
    seoDescription: "Meluncur di lereng salju, lewati pohon dan batu, lewati pos slalom, dan raih skor tertinggi di Sena Kids.",
    description: "Meluncur di lereng salju, hindari rintangan, dan kumpulkan koin.",
    note: "Downhill ski arcade game for Sena Kids."
  },
  "ski-free": {
    title: "Ski Free",
    seoTitle: "Permainan Ski Free Online Anak",
    seoDescription: "Meluncur di lereng bersalju, hindari rintangan pepohonan dan bebatuan, serta kumpulkan koin di permainan arkade salju.",
    description: "Meluncur di lereng salju, hindari rintangan, dan kumpulkan koin.",
    note: "Downhill ski arcade game for Sena Kids."
  },
  "timbangan-angka": {
    title: "Timbangan Angka",
    seoTitle: "Game Timbangan Angka Matematika Keseimbangan Anak",
    seoDescription: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan! Belajar konsep matematika kesetaraan secara visual.",
    description: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "number-balance": {
    title: "Timbangan Angka",
    seoTitle: "Game Timbangan Angka Matematika Keseimbangan Anak",
    seoDescription: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan! Belajar konsep matematika kesetaraan secara visual.",
    description: "Seimbangkan timbangan dengan meletakkan beban angka di sisi kiri dan kanan!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "block-blast": {
    title: "Block Blast",
    seoTitle: "Game Puzzle Balok Block Blast Logika Anak",
    seoDescription: "Teka-teki susun balok warna-warni seru: tempatkan balok di petak dan bersihkan baris serta kolom untuk melatih logika berpikir anak.",
    description: "Teka-teki balok seru: tempatkan balok dan bersihkan baris serta kolom!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "cari-kata": {
    title: "Cari Kata",
    seoTitle: "Game Cari Kata (Word Search) Anak Bahasa Indonesia",
    seoDescription: "Temukan kata-kata tersembunyi dalam kotak susunan huruf berbahasa Indonesia. Melatih ketelitian, kosakata, dan literasi anak.",
    description: "Temukan kata-kata tersembunyi dalam kotak huruf!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "word-search": {
    title: "Cari Kata",
    seoTitle: "Game Cari Kata (Word Search) Anak Bahasa Indonesia",
    seoDescription: "Temukan kata-kata tersembunyi dalam kotak susunan huruf berbahasa Indonesia. Melatih ketelitian, kosakata, dan literasi anak.",
    description: "Temukan kata-kata tersembunyi dalam kotak huruf!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "sambung-warna": {
    title: "Sambung Warna",
    seoTitle: "Game Sambung Warna (Color Connect) Garis Titik Anak",
    seoDescription: "Hubungkan titik-titik warna yang sama tanpa garis yang saling bertabrakan untuk melatih pemikiran logika anak.",
    description: "Hubungkan titik-titik warna yang sama tanpa garis bertabrakan!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "color-connect": {
    title: "Sambung Warna",
    seoTitle: "Game Sambung Warna (Color Connect) Garis Titik Anak",
    seoDescription: "Hubungkan titik-titik warna yang sama tanpa garis yang saling bertabrakan untuk melatih pemikiran logika anak.",
    description: "Hubungkan titik-titik warna yang sama tanpa garis bertabrakan!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "zip-path": {
    title: "Zip Path",
    seoTitle: "Game Jalur Zip Path Logika Titik Anak",
    seoDescription: "Tarik satu jalur ritsleting melewati setiap titik tanpa henti untuk melatih perencanaan spasial dan konsentrasi anak.",
    description: "Tarik satu jalur ritsleting melewati setiap titik tanpa henti!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "topple-party": {
    title: "Topple Party",
    seoTitle: "Game Keseimbangan Jungkat-Jungkit Topple Party",
    seoDescription: "Jaga keseimbangan papan jungkat-jungkit agar tidak terjungkal dalam eksperimen fisika dasar gravitasi dan beban angka.",
    description: "Jaga keseimbangan jungkat-jungkit agar tidak terjungkal!",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  membandingkan: {
    title: "Membandingkan Angka",
    seoTitle: "Game Membandingkan Angka Lebih Besar & Kecil Anak",
    seoDescription: "Latihan perbandingan bilangan lebih besar, lebih kecil, dan sama dengan untuk anak TK dan SD dengan bantuan visual interaktif.",
    description: "Latihan perbandingan lebih besar, lebih kecil, dan sama dengan.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  comparison: {
    title: "Membandingkan Angka",
    seoTitle: "Game Membandingkan Angka Lebih Besar & Kecil Anak",
    seoDescription: "Latihan perbandingan bilangan lebih besar, lebih kecil, dan sama dengan untuk anak TK dan SD dengan bantuan visual interaktif.",
    description: "Latihan perbandingan lebih besar, lebih kecil, dan sama dengan.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "pecahan-lingkaran": {
    title: "Pecahan Lingkaran",
    seoTitle: "Game Belajar Pecahan Matematika Diagram Lingkaran",
    seoDescription: "Belajar memahami konsep pecahan matematika dasar menggunakan potongan diagram lingkaran pai interaktif yang mudah dipahami.",
    description: "Belajar memahami pecahan dengan diagram lingkaran interaktif.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  fractions: {
    title: "Pecahan Lingkaran",
    seoTitle: "Game Belajar Pecahan Matematika Diagram Lingkaran",
    seoDescription: "Belajar memahami konsep pecahan matematika dasar menggunakan potongan diagram lingkaran pai interaktif yang mudah dipahami.",
    description: "Belajar memahami pecahan dengan diagram lingkaran interaktif.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  penjumlahan: {
    title: "Latihan Penjumlahan",
    seoTitle: "Game Latihan Penjumlahan Matematika Anak TK/SD",
    seoDescription: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual animasi benda yang jelas dan menyenangkan.",
    description: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "numbers-add": {
    title: "Latihan Penjumlahan",
    seoTitle: "Game Latihan Penjumlahan Matematika Anak TK/SD",
    seoDescription: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual animasi benda yang jelas dan menyenangkan.",
    description: "Asah kemampuan berhitung penjumlahan angka dengan bantuan visual.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  pengurangan: {
    title: "Latihan Pengurangan",
    seoTitle: "Game Latihan Pengurangan Matematika Anak TK/SD",
    seoDescription: "Asah kemampuan pengurangan matematika dengan ilustrasi benda yang dicoret secara interaktif agar konsep hitung cepat dipahami.",
    description: "Asah kemampuan pengurangan angka dengan ilustrasi benda yang dicoret.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "numbers-substract": {
    title: "Latihan Pengurangan",
    seoTitle: "Game Latihan Pengurangan Matematika Anak TK/SD",
    seoDescription: "Asah kemampuan pengurangan matematika dengan ilustrasi benda yang dicoret secara interaktif agar konsep hitung cepat dipahami.",
    description: "Asah kemampuan pengurangan angka dengan ilustrasi benda yang dicoret.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "angka-negatif": {
    title: "Angka Negatif",
    seoTitle: "Game Belajar Bilangan Negatif & Garis Bilangan Anak",
    seoDescription: "Pelajari bilangan di bawah nol dan garis bilangan kartesius dengan simulasi interaktif yang mudah dimengerti anak.",
    description: "Pelajari bilangan di bawah nol dan garis bilangan dengan seru.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "negative-number": {
    title: "Angka Negatif",
    seoTitle: "Game Belajar Bilangan Negatif & Garis Bilangan Anak",
    seoDescription: "Pelajari bilangan di bawah nol dan garis bilangan kartesius dengan simulasi interaktif yang mudah dimengerti anak.",
    description: "Pelajari bilangan di bawah nol dan garis bilangan dengan seru.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  perkalian: {
    title: "Tabel Perkalian",
    seoTitle: "Game Tabel Perkalian Matematika Dasar Anak SD",
    seoDescription: "Kuasai perkalian matematika 1 sampai 10 dengan kelompok visual gambar yang mempermudah pemahaman perkalian bagi anak sekolah dasar.",
    description: "Kuasai perkalian dasar dengan kelompok visual gambar.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "perkalian-dasar": {
    title: "Tabel Perkalian",
    seoTitle: "Game Tabel Perkalian Matematika Dasar Anak SD",
    seoDescription: "Kuasai perkalian matematika 1 sampai 10 dengan kelompok visual gambar yang mempermudah pemahaman perkalian bagi anak sekolah dasar.",
    description: "Kuasai perkalian dasar dengan kelompok visual gambar.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  morse: {
    title: "Kode Morse Memori",
    seoTitle: "Game Kode Morse Belajar Bunyi & Huruf Pramuka Anak",
    seoDescription: "Dengarkan bunyi ritme ketukan dan pelajari kode morse alfabet lengkap untuk kegiatan edukasi anak dan kepramukaan.",
    description: "Dengarkan bunyi dan pelajari kode morse alfabet.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "morse-memori": {
    title: "Kode Morse Memori",
    seoTitle: "Game Kode Morse Belajar Bunyi & Huruf Pramuka Anak",
    seoDescription: "Dengarkan bunyi ritme ketukan dan pelajari kode morse alfabet lengkap untuk kegiatan edukasi anak dan kepramukaan.",
    description: "Dengarkan bunyi dan pelajari kode morse alfabet.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "memahami-koordinat": {
    title: "Memahami Koordinat",
    seoTitle: "Game Memahami Sumbu Koordinat Kartesius Matematika",
    seoDescription: "Belajar sumbu X dan sumbu Y pada bidang koordinat kartesius secara visual dan interaktif untuk anak sekolah dasar di Sena Kids.",
    description: "Belajar sumbu X dan Y pada bidang koordinat kartesius interaktif.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  koordinat: {
    title: "Memahami Koordinat",
    seoTitle: "Game Memahami Sumbu Koordinat Kartesius Matematika",
    seoDescription: "Belajar sumbu X dan sumbu Y pada bidang koordinat kartesius secara visual dan interaktif untuk anak sekolah dasar di Sena Kids.",
    description: "Belajar sumbu X dan Y pada bidang koordinat kartesius interaktif.",
    note: "This built-in game is implemented directly in Sena Kids."
  },
  "the-aviator": {
    title: "Pesawat Cilik 3D",
    seoTitle: "Game Pesawat Cilik 3D Petualangan Udara Anak",
    seoDescription: "Terbangkan pesawat kartun 3D, kumpulkan koin energi di angkasa, dan nikmati grafik 3D yang indah dan aman untuk anak.",
    description: "Terbangkan pesawat kartun 3D, kumpulkan koin energi, dan jelajahi langit yang indah!",
    note: "Built with Three.js from the Patel230 sample games collection."
  },
  aviator: {
    title: "Pesawat Cilik 3D",
    seoTitle: "Game Pesawat Cilik 3D Petualangan Udara Anak",
    seoDescription: "Terbangkan pesawat kartun 3D, kumpulkan koin energi di angkasa, dan nikmati grafik 3D yang indah dan aman untuk anak.",
    description: "Terbangkan pesawat kartun 3D, kumpulkan koin energi, dan jelajahi langit yang indah!",
    note: "Built with Three.js from the Patel230 sample games collection."
  },
  "toy-car": {
    title: "Mobil Mainan 3D",
    seoTitle: "Game Mobil Mainan 3D Balapan Taman Bermain Anak",
    seoDescription: "Kendarai mobil mainan 3D di taman bermain seru, tabrak balok kayu, dan kumpulkan bintang prestasi dengan kontrol mudah.",
    description: "Kendarai mobil mainan 3D di taman bermain seru, tabrak menara balok kayu, dan kumpulkan bintang!",
    note: "Built with Three.js from the Patel230 sample games collection."
  },
  "mobil-mainan-3d": {
    title: "Mobil Mainan 3D",
    seoTitle: "Game Mobil Mainan 3D Balapan Taman Bermain Anak",
    seoDescription: "Kendarai mobil mainan 3D di taman bermain seru, tabrak balok kayu, dan kumpulkan bintang prestasi dengan kontrol mudah.",
    description: "Kendarai mobil mainan 3D di taman bermain seru, tabrak menara balok kayu, dan kumpulkan bintang!",
    note: "Built with Three.js from the Patel230 sample games collection."
  }
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
  "astronot-terbang": InfiniteFlierGameClient,
  "ular-pintar": SnakeGameClient,
  ludo: LudoGameClient,
  "ular-tangga": UlarTanggaGameClient,
  "lacak-huruf": LacakHurufGameClient,
  "lacak-angka": LacakAngkaGameClient,
  "puzzle-gambar": JigsawGameClient,
  "pukul-tikus": PukulTikusGameClient,
  "simon-bilang": SimonBilangGameClient,
  "letuskan-balon": LetuskanBalonGameClient,
  "petualangan-lompat": PlatformerGameClient,
  "ski-pagi": SkiPagiGameClient,
  "ski-free": SkiPagiGameClient,
  "timbangan-angka": NumberBalanceGameClient,
  "number-balance": NumberBalanceGameClient,
  "block-blast": BlockBlastGameClient,
  "cari-kata": WordSearchGameClient,
  "word-search": WordSearchGameClient,
  "sambung-warna": ColorConnectGameClient,
  "color-connect": ColorConnectGameClient,
  "zip-path": ZipPathGameClient,
  "topple-party": TopplePartyGameClient,
  membandingkan: MathComparisonGameClient,
  comparison: MathComparisonGameClient,
  "pecahan-lingkaran": MathFractionGameClient,
  fractions: MathFractionGameClient,
  penjumlahan: MathAdditionGameClient,
  "numbers-add": MathAdditionGameClient,
  pengurangan: MathSubtractionGameClient,
  "numbers-substract": MathSubtractionGameClient,
  "angka-negatif": MathNegativeGameClient,
  "negative-number": MathNegativeGameClient,
  perkalian: MathMultiplicationGameClient,
  "perkalian-dasar": MathMultiplicationGameClient,
  morse: MemoryMorseGameClient,
  "morse-memori": MemoryMorseGameClient,
  "memahami-koordinat": MemahamiKoordinatGameClient,
  koordinat: MemahamiKoordinatGameClient,
  "the-aviator": AviatorGameClient,
  aviator: AviatorGameClient,
  "toy-car": ToyCarGameClient,
  "mobil-mainan-3d": ToyCarGameClient
};

export async function generateStaticParams() {
  return Object.keys(builtGameDetails).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    return {
      title: "Game Tidak Ditemukan",
    };
  }

  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}/games/built/${slug}`;
  const pageTitle = game.seoTitle || `Permainan ${game.title} Anak Online`;
  const pageDescription =
    game.seoDescription ||
    `${game.description} Mainkan permainan edukatif anak langsung di peramban tanpa instalasi di Sena Kids.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export default async function BuiltGamePage({ params }) {
  const { slug } = await params;
  const game = builtGameDetails[slug];

  if (!game) {
    notFound();
  }

  const GameClient = gameClients[slug];
  const baseUrl = getSiteUrl();
  const gameJsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: game.seoTitle || game.title,
    description: game.seoDescription || game.description,
    url: `${baseUrl}/games/built/${slug}`,
    inLanguage: "id-ID",
    isFamilyFriendly: true,
    audience: {
      "@type": "Audience",
      audienceType: "Children",
    },
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd) }}
      />
      <div className={styles.backButtonWrapper}>
        <BackButton />
      </div>
      <GameClient />
    </div>
  );
}
