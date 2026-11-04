import HomeClient from "./home/HomeClient";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata = {
  title: {
    absolute: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
  },
  description:
    "Temukan aktivitas belajar dan bermain anak di Sena Kids. Jelajahi kegiatan edukatif yang membantu anak mengembangkan kreativitas dan keterampilan.",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Sena Kids - Aktivitas Belajar dan Bermain Anak",
    description:
      "Temukan aktivitas belajar dan bermain anak di Sena Kids. Jelajahi kegiatan edukatif yang membantu anak mengembangkan kreativitas dan keterampilan.",
    url: siteUrl,
    images: [{ url: "/asset.png", width: 1200, height: 630, alt: "Sena Kids - Aktivitas Belajar dan Bermain Anak" }],
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
    description: "Platform aktivitas belajar dan bermain anak dengan buku cerita bergambar, video edukasi aman, dan aneka permainan edukatif interaktif.",
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
