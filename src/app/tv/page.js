import { getVideos } from "@/app/admin/actions";
import TvClient from "./TvClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sena TV - Video Edukasi & Animasi Anak Aman",
  description:
    "Tonton video edukasi, lagu anak, dongeng, dan animasi pilihan ramah anak dengan pemutar tanpa iklan perilaku.",
  alternates: {
    canonical: "/tv",
  },
  openGraph: {
    title: "Sena TV - Video Edukasi & Animasi Anak Aman",
    description:
      "Tonton video edukasi, lagu anak, dongeng, dan animasi pilihan ramah anak dengan pemutar tanpa iklan perilaku.",
    url: "https://senakids.web.id/tv",
    type: "website",
  },
};

export default async function TvPage() {
  let videos = [];
  try {
    videos = await getVideos();
  } catch (e) {
    videos = [];
  }

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
      <TvClient videos={videos} />
    </>
  );
}
