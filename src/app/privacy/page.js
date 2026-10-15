import PrivacyClient from "./PrivacyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Kebijakan Privasi & Perlindungan Anak",
  description:
    "Kebijakan privasi Sena Kids: komitmen perlindungan data anak, tanpa pelacakan perilaku, tanpa iklan bertarget, dan hak kontrol orang tua.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Kebijakan Privasi & Perlindungan Anak",
    description:
      "Kebijakan privasi Sena Kids: komitmen perlindungan data anak, tanpa pelacakan perilaku, tanpa iklan bertarget, dan hak kontrol orang tua.",
    url: "https://senakids.web.id/privacy",
    images: [socialImage],
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
