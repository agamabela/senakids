import PrivacyClient from "./PrivacyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Kebijakan Privasi & Perlindungan Anak",
  description:
    "Kebijakan privasi Sena Kids: komitmen perlindungan data anak, pengaturan browser, konten pihak ketiga, dan permintaan penghapusan akun.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Kebijakan Privasi & Perlindungan Anak",
    description:
      "Kebijakan privasi Sena Kids: komitmen perlindungan data anak, pengaturan browser, konten pihak ketiga, dan permintaan penghapusan akun.",
    url: "https://senakids.web.id/privacy",
    images: [socialImage],
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
