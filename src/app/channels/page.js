import { getChannelsList } from "@/lib/channels-api";
import { socialImage } from "@/lib/seo-metadata";
import ChannelsClient from "./ChannelsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Saluran Video Edukasi Anak",
  description:
    "Kelola saluran YouTube edukasi yang dapat ditonton anak di Sena TV sesuai pilihan orang tua.",
  alternates: {
    canonical: "/channels",
  },
  openGraph: {
    title: "Daftar Saluran Video Edukasi Anak | Sena Kids",
    description:
      "Kelola saluran YouTube edukasi yang dapat ditonton anak di Sena TV sesuai pilihan orang tua.",
    url: "https://senakids.web.id/channels",
    images: [socialImage],
    type: "website",
  },
};

export default async function ChannelsPage() {
  let channels = [];
  try {
    channels = await getChannelsList();
  } catch (e) {
    channels = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://senakids.web.id";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Daftar Saluran Video Edukasi Anak Sena TV",
    description: "Daftar saluran video pilihan untuk pembelajaran anak di Sena TV.",
    url: `${siteUrl}/channels`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChannelsClient initialChannels={channels} />
    </>
  );
}
