import { getGames } from "@/app/admin/actions";
import { socialImage } from "@/lib/seo-metadata";
import GamesClient from "./GamesClient";

export const revalidate = 3600;

export const metadata = {
  title: "Permainan Edukatif Anak Online",
  description:
    "Koleksi permainan edukatif interaktif untuk anak: latihan berhitung matematika, mewarnai gambar, teka-teki logika, dan melacak huruf tanpa perlu instalasi.",
  alternates: {
    canonical: "/games",
  },
  openGraph: {
    title: "Permainan Edukatif Anak Online | Sena Kids",
    description:
      "Koleksi permainan edukatif interaktif untuk anak: latihan berhitung matematika, mewarnai gambar, teka-teki logika, dan melacak huruf tanpa perlu instalasi.",
    url: "https://senakids.web.id/games",
    images: [socialImage],
    type: "website",
  },
};

export default async function GamesPage() {
  let games = [];
  try {
    games = await getGames();
  } catch (e) {
    games = [];
  }

  const zonesMap = {};
  games.forEach((game) => {
    if (!zonesMap[game.zoneName])
      zonesMap[game.zoneName] = { title: game.zoneName, games: [] };
    zonesMap[game.zoneName].games.push({
      ...game,
      href: `/games/${game.id}`,
    });
  });

  const zones = Object.values(zonesMap);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Permainan Edukatif Interaktif Anak Sena Kids",
    description:
      "Koleksi permainan edukatif anak untuk melatih logika, berhitung matematika, daya ingat, dan kreativitas.",
    url: `${siteUrl}/games`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamesClient zones={zones} />
    </>
  );
}
