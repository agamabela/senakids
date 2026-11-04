import { getVideos } from "@/app/admin/actions";
import { getAllTvVideos } from "@/lib/tv-videos-api";
import { socialImage } from "@/lib/seo-metadata";
import TvClient from "./TvClient";

export const revalidate = 3600;

export const metadata = {
  title: "Video Edukasi Anak Pilihan",
  description:
    "Koleksi video belajar anak pilihan: lagu anak, dongeng animasi, eksperimen sains sederhana, dan wawasan dunia tanpa iklan pelacak.",
  alternates: {
    canonical: "/tv",
  },
  openGraph: {
    title: "Video Edukasi Anak Pilihan | Sena Kids",
    description:
      "Koleksi video belajar anak pilihan: lagu anak, dongeng animasi, eksperimen sains sederhana, dan wawasan dunia tanpa iklan pelacak.",
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
    name: "Video Edukasi Anak Sena TV",
    description: "Koleksi video belajar dan animasi edukatif anak yang aman untuk disaksikan bersama keluarga.",
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
