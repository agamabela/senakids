const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Curated kid-friendly videos from official YouTube channels (real video IDs).
// Live streams and less age-appropriate topics were filtered out.
const COLORS = {
  islami: "#a855f7",
  lagu: "#ec4899",
  sains: "#3b82f6",
  kartun: "#f97316",
  kartun2: "#f59e0b",
};

const videos = [
  // Nussa — Islami
  { title: "Nussa & Rarra: Lekas Sembuh Iboy", category: "Islami", color: COLORS.islami, id: "g23YaErYZmc" },
  { title: "Nussa: Rarra Selalu Bikin Gemas", category: "Islami", color: COLORS.islami, id: "cpNNiUboWPY" },
  { title: "Nussa: Rarra yang Ngambeknya Cepat Luluh", category: "Islami", color: COLORS.islami, id: "syx1AtU90bY" },
  { title: "Nussa: Kenalan dengan Nur", category: "Islami", color: COLORS.islami, id: "QL4Y68QVUtg" },
  { title: "Nussa: Gemes Sama Antta", category: "Islami", color: COLORS.islami, id: "IA1KENDm3xI" },

  // Omar & Hana — Lagu Anak Islami
  { title: "Omar & Hana: Penyu Makan Sampah", category: "Lagu Anak", color: COLORS.lagu, id: "PIBT3gF6NSc" },
  { title: "Omar & Hana: Liburan Keluarga", category: "Lagu Anak", color: COLORS.lagu, id: "i0d9TngGjvs" },
  { title: "Omar & Hana: Papa Belajar Ice Skating", category: "Lagu Anak", color: COLORS.lagu, id: "hY7USwKGcfs" },
  { title: "Omar & Hana: Main Pasir di Pantai", category: "Lagu Anak", color: COLORS.lagu, id: "Did4lg8QVrU" },
  { title: "Omar & Hana: Ngantuk", category: "Lagu Anak", color: COLORS.lagu, id: "UXW-15amZwE" },
  { title: "Omar & Hana: Omar & Papa Belanja", category: "Lagu Anak", color: COLORS.lagu, id: "zMjfV6ScrjM" },

  // Riko The Series — Islami
  { title: "Riko: Ikuti Sunah Tidur Rasulullah", category: "Islami", color: "#22c55e", id: "2rJlOmfG4wM" },
  { title: "Riko: Jangan Keasyikan Main HP Malam", category: "Islami", color: "#22c55e", id: "1j-7BhhyUE4" },
  { title: "Riko: Permainan Seru Saat Hujan", category: "Islami", color: "#22c55e", id: "XMkwMvhy83s" },
  { title: "Riko Kabur dari Robot Pemburu", category: "Islami", color: "#22c55e", id: "q2XuC5-fYA4" },
  { title: "Riko: Proses Terciptanya Listrik", category: "Islami", color: "#22c55e", id: "Gqp6kNziHis" },

  // Kok Bisa — Sains (kid-appropriate)
  { title: "Kok Bisa: Apa Rasanya Jadi Orang Autis?", category: "Sains", color: COLORS.sains, id: "5J6o5eIKqOY" },
  { title: "Kok Bisa: Kenapa Anak Kecil Punya Teman Khayalan?", category: "Sains", color: COLORS.sains, id: "IOu2jcTk9JQ" },
  { title: "Kok Bisa: Hewan-Hewan Ini Ternyata Gede", category: "Sains", color: COLORS.sains, id: "2-FubKO4WDI" },

  // Diva The Series — Kartun
  { title: "Seri Diva Eps 454: Brick Balok", category: "Kartun", color: COLORS.kartun, id: "nZx3RTbGRT0" },
  { title: "Seri Diva: Kompilasi 3 in 1", category: "Kartun", color: COLORS.kartun, id: "rCTXW-aqbD4" },
  { title: "Diva: Lampu Aladin", category: "Kartun", color: COLORS.kartun, id: "QW1WFRRyNdU" },
  { title: "Diva: Jus Alpukat Gratis", category: "Kartun", color: COLORS.kartun, id: "Vz-X23f5Z2A" },
  { title: "Diva: Bikin Permen Dalgona", category: "Kartun", color: COLORS.kartun, id: "VJrVsbj301M" },

  // Bluey — Kartun
  { title: "Bluey: Bubble Bath", category: "Kartun", color: COLORS.kartun2, id: "wPLrZS-hz2Y" },
  { title: "Bluey, Bingo & Muffin Jadi Nenek (30 Menit)", category: "Kartun", color: COLORS.kartun2, id: "VF7DIdc4GKE" },
  { title: "Bluey Usil Sama Mama", category: "Kartun", color: COLORS.kartun2, id: "heQeCJaIHEs" },
];

async function main() {
  console.log("Seeding TV videos ...");
  let added = 0, skipped = 0;
  for (const v of videos) {
    const url = `https://www.youtube.com/watch?v=${v.id}`;
    const existing = await prisma.video.findFirst({ where: { url } });
    if (existing) { skipped++; continue; }
    await prisma.video.create({
      data: { title: v.title, duration: "", category: v.category, color: v.color, url },
    });
    added++;
  }
  console.log(`Done. Added ${added}, skipped ${skipped} (already present).`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
