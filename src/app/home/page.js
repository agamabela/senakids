import HomeClient from "./HomeClient";

export const metadata = {
  title: "Dunia Belajar & Bermain Ceria Ramah Anak",
  description:
    "Platform belajar ramah anak: buku cerita bergambar Let's Read, video edukasi aman, ensiklopedia cilik, dan game logika interaktif tanpa iklan pengganggu.",
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "Sena Kids - Belajar & Bermain Ramah Anak",
    description:
      "Buku cerita bergambar anak, video edukasi aman, dan game logika interaktif tanpa iklan pengganggu.",
    url: "https://senakids.web.id/home",
    type: "website",
  },
};

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Sena Kids",
    url: `${siteUrl}/home`,
    description:
      "Platform belajar ramah anak dengan buku cerita bergambar, video edukasi, dan game interaktif.",
    publisher: {
      "@type": "Organization",
      name: "Sena Kids",
      logo: `${siteUrl}/sena-logo.svg`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
