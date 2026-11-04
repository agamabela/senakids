import { getGames } from "@/app/admin/actions";
import { socialImage } from "@/lib/seo-metadata";
import GamesClient from "./GamesClient";

export const revalidate = 3600;

export const metadata = {
  title: "Game Edukasi Anak Online Gratis & Interaktif",
  description:
    "Koleksi 40+ game edukasi anak online gratis dan ramah anak: game mewarnai, berhitung matematika, puzzle logika, huruf ABC, dan ular tangga tanpa install aplikasi.",
  alternates: {
    canonical: "/games",
  },
  openGraph: {
    title: "Game Edukasi Anak Online Gratis & Interaktif",
    description:
      "Koleksi 40+ game edukasi anak online gratis dan ramah anak: game mewarnai, berhitung matematika, puzzle logika, huruf ABC, dan ular tangga tanpa install aplikasi.",
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
    name: "Game & Latihan Interaktif Sena Kids",
    description:
      "Koleksi permainan logika, matematika, memori, musik, dan teka-teki edukatif anak.",
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
