import BukuCeritaClient from "./BukuCeritaClient";

export const metadata = {
  title: "Koleksi Cerita Bergambar Let's Read",
  description:
    "Baca cerita bergambar anak Let's Read Asia berlisensi Creative Commons CC BY 4.0 secara gratis dan interaktif.",
  alternates: {
    canonical: "/buku-cerita",
  },
  openGraph: {
    title: "Koleksi Cerita Bergambar Let's Read",
    description:
      "Baca cerita bergambar anak Let's Read Asia berlisensi Creative Commons CC BY 4.0 secara gratis dan interaktif.",
    url: "https://senakids.web.id/buku-cerita",
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
      "Buku cerita bergambar anak untuk menumbuhkan minat baca sejak dini.",
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
