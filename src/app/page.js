import HomeClient from "./home/HomeClient";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata = {
  title: {
    absolute: "Sena Kids - Platform Belajar & Bermain Anak | Game Edukasi & Cerita",
  },
  description:
    "Sena Kids adalah platform belajar dan bermain anak ramah keluarga: 40+ game edukasi interaktif gratis (mewarnai, berhitung, logika), buku cerita bergambar Let's Read, dan video aman tanpa iklan.",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Sena Kids - Platform Belajar & Bermain Ramah Anak",
    description:
      "Buku cerita bergambar anak, video edukasi aman, dan game logika interaktif gratis untuk dijelajahi bersama keluarga.",
    url: siteUrl,
    images: [{ url: "/asset.png", width: 1200, height: 630, alt: "Sena Kids - Dunia Belajar & Bermain Ramah Anak" }],
    type: "website",
  },
};

export default function RootPage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sena Kids",
    alternateName: ["SenaKids", "Sena Kids Indonesia"],
    url: siteUrl,
    description: "Platform belajar ramah anak dengan buku cerita bergambar, video edukasi aman, dan game interaktif gratis.",
    publisher: { "@type": "Organization", name: "Sena Kids", logo: `${siteUrl}/sena-logo.svg` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/games?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomeClient />
    </>
  );
}
