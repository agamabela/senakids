import BukuCeritaClient from "./BukuCeritaClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Buku Cerita Bergambar Let's Read",
  description:
    "Koleksi cerita bergambar anak dari Let's Read Asia berlisensi Creative Commons untuk dibaca langsung bersama anak di rumah maupun di sekolah.",
  alternates: {
    canonical: "/buku-cerita",
  },
  openGraph: {
    title: "Buku Cerita Bergambar Let's Read | Sena Kids",
    description:
      "Koleksi cerita bergambar anak dari Let's Read Asia berlisensi Creative Commons untuk dibaca langsung bersama anak di rumah maupun di sekolah.",
    url: "https://senakids.web.id/buku-cerita",
    images: [socialImage],
    type: "website",
  },
};

export default function BukuCeritaPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Koleksi Cerita Bergambar Let's Read",
    description:
      "Buku cerita bergambar anak dari Let's Read Asia untuk melatih kebiasaan membaca sejak dini.",
    url: `${siteUrl}/buku-cerita`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BukuCeritaClient />
    </>
  );
}
