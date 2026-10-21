import HomeClient from "./home/HomeClient";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata = {
  title: "Dunia Belajar & Bermain Ceria Ramah Anak",
  description:
    "Platform belajar ramah anak: buku cerita bergambar Let's Read, video edukasi aman, ensiklopedia cilik, dan game logika interaktif untuk dijelajahi bersama keluarga.",
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title: "Sena Kids - Belajar & Bermain Ramah Anak",
    description:
      "Buku cerita bergambar anak, video edukasi aman, dan game logika interaktif untuk dijelajahi bersama keluarga.",
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
    url: siteUrl,
    description: "Platform belajar ramah anak dengan buku cerita bergambar, video edukasi, dan game interaktif.",
    publisher: { "@type": "Organization", name: "Sena Kids", logo: `${siteUrl}/sena-logo.svg` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomeClient />
    </>
  );
}
