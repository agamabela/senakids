import { getVideos } from "@/app/admin/actions";
import { getAllTvVideos } from "@/lib/tv-videos-api";
import { socialImage } from "@/lib/seo-metadata";
import TvClient from "./TvClient";

export const revalidate = 3600;

export const metadata = {
  title: "Video Edukasi & Animasi Anak Aman Tanpa Iklan",
  description:
    "Tonton video edukasi pilihan, dongeng, lagu anak-anak, dan animasi sains ramah anak di Sena TV dengan pemutar aman bebas iklan perilaku.",
  alternates: {
    canonical: "/tv",
  },
  openGraph: {
    title: "Video Edukasi & Animasi Anak Aman Tanpa Iklan",
    description:
      "Tonton video edukasi pilihan, dongeng, lagu anak-anak, dan animasi sains ramah anak di Sena TV dengan pemutar aman bebas iklan perilaku.",
    url: "https://senakids.web.id/tv",
    images: [socialImage],
    type: "website",
  },
};

export default async function TvPage() {
  let dbVideos = [];
  try {
    dbVideos = await getVideos();
  } catch (e) {
    dbVideos = [];
  }

  let baseVideos = [];
  try {
    baseVideos = await getAllTvVideos();
  } catch (e) {
    baseVideos = [];
  }

  const allVideos = [...baseVideos, ...dbVideos];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sena TV - Video Edukasi Anak",
    description: "Koleksi video edukasi dan animasi aman tanpa iklan untuk anak.",
    url: `${siteUrl}/tv`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TvClient videos={allVideos} />
    </>
  );
}
