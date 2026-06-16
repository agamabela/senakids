const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed Books
  const books = [
    { title: "Si Kancil Anak Nakal", description: "Cerita Rakyat", emoji: "🦌", color: "green", shelf: "Dongeng Sebelum Tidur 🌙" },
    { title: "Putri Bulan", description: "Dongeng Nusantara", emoji: "👸", color: "pink", shelf: "Dongeng Sebelum Tidur 🌙" },
    { title: "Bawang Merah Bawang Putih", description: "Cerita Klasik", emoji: "🧅", color: "purple", shelf: "Dongeng Sebelum Tidur 🌙" },
    { title: "Timun Mas", description: "Petualangan Seru", emoji: "🥒", color: "teal", shelf: "Dongeng Sebelum Tidur 🌙" },
    { title: "Mengenal Tata Surya", description: "Luar Angkasa", emoji: "🪐", color: "blue", shelf: "Ensiklopedia Anak 🌍" },
    { title: "Hewan Liar di Hutan", description: "Dunia Binatang", emoji: "🦁", color: "orange", shelf: "Ensiklopedia Anak 🌍" },
    { title: "Tubuh Manusia Hebat", description: "Sains Seru", emoji: "🫀", color: "pink", shelf: "Ensiklopedia Anak 🌍" },
    { title: "Misteri Laut Dalam", description: "Kehidupan Laut", emoji: "🐋", color: "teal", shelf: "Ensiklopedia Anak 🌍" },
  ];

  for (const b of books) {
    await prisma.book.create({ data: b });
  }

  // Seed Games
  const games = [
    { title: "Memory Match", description: "Cocokkan Kartu", iconName: "Puzzle", color: "blue", zoneName: "Zona Puzzle 🧩" },
    { title: "Susun Kata", description: "Bentuk Kata Baru", emoji: "🔠", color: "teal", zoneName: "Zona Puzzle 🧩" },
    { title: "Labirin", description: "Cari Jalan Keluar", iconName: "Route", color: "purple", zoneName: "Zona Puzzle 🧩" },
    { title: "Tangkap Bintang", description: "Klik yang cepat!", emoji: "⭐", color: "yellow", zoneName: "Zona Cepat ⚡" },
    { title: "Balap Lari", description: "Adu cepat", emoji: "🏃", color: "orange", zoneName: "Zona Cepat ⚡" },
    { title: "Drum", description: "Ikuti Irama", iconName: "Music", color: "pink", zoneName: "Zona Cepat ⚡" },
  ];

  for (const g of games) {
    await prisma.game.create({ data: g });
  }

  // Seed Videos
  const videos = [
    { title: "Belajar Huruf ABC", duration: "5:30", category: "Pendidikan", color: "var(--color-pink)" },
    { title: "Kisah Binatang di Hutan", duration: "12:00", category: "Dongeng", color: "var(--color-green)" },
    { title: "Lagu Anak: Balonku", duration: "3:45", category: "Musik", color: "var(--color-yellow)" },
    { title: "Eksperimen Gunung Meletus", duration: "8:20", category: "Sains", color: "var(--color-orange)" },
  ];

  for (const v of videos) {
    await prisma.video.create({ data: v });
  }

  // Seed Channels
  const channels = [
    { name: "Nussa", emoji: "🧒", color: "var(--color-orange)" },
    { name: "Riko", emoji: "👦", color: "var(--color-blue)" },
    { name: "Yufid Kids", emoji: "🕌", color: "var(--color-green)" },
    { name: "Omar Hana", emoji: "🎶", color: "var(--color-pink)" },
  ];

  for (const c of channels) {
    await prisma.channel.create({ data: c });
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
