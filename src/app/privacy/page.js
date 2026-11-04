import PrivacyClient from "./PrivacyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Kebijakan Privasi dan Perlindungan Anak",
  description:
    "Kebijakan privasi Sena Kids: perlindungan data anak, tanpa pelacakan iklan perilaku, dan informasi keamanan bagi keluarga.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Kebijakan Privasi dan Perlindungan Anak | Sena Kids",
    description:
      "Kebijakan privasi Sena Kids: perlindungan data anak, tanpa pelacakan iklan perilaku, dan informasi keamanan bagi keluarga.",
    url: "https://senakids.web.id/privacy",
    images: [socialImage],
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
