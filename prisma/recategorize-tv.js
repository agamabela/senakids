const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Each show was seeded with a unique color — use it to set the show name as category,
// so the TV page can group videos into per-show playlists.
const COLOR_TO_SHOW = {
  "#a855f7": "Nussa",
  "#ec4899": "Omar & Hana",
  "#22c55e": "Riko The Series",
  "#3b82f6": "Kok Bisa",
  "#f97316": "Diva The Series",
  "#f59e0b": "Bluey",
  "#14b8a6": "Shimajiro",
  "#eab308": "Shaun the Sheep",
};

async function main() {
  const all = await prisma.video.findMany();
  let updated = 0;
  for (const v of all) {
    const show = COLOR_TO_SHOW[(v.color || "").toLowerCase()];
    if (show && v.category !== show) {
      await prisma.video.update({ where: { id: v.id }, data: { category: show } });
      updated++;
    }
  }
  console.log(`Re-categorized ${updated} of ${all.length} videos.`);
}
main().then(async () => { await prisma.$disconnect(); }).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
