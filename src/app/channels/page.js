import { getChannelsList } from "@/lib/channels-api";
import ChannelsClient from "./ChannelsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Channel Pilihan - Kelola Channel Edukasi Anak",
  description:
    "Atur dan pilih channel YouTube ramah anak yang boleh ditonton di Sena TV. Nonaktifkan channel sesuai kebutuhan orang tua.",
  alternates: {
    canonical: "/channels",
  },
  openGraph: {
    title: "Channel Pilihan - Kelola Channel Edukasi Anak",
    description:
      "Atur dan pilih channel YouTube ramah anak yang boleh ditonton di Sena TV.",
    url: "https://senakids.web.id/channels",
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
    name: "Channel Pilihan Sena TV",
    description: "Daftar channel YouTube pilihan ramah anak.",
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
