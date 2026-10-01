import PrivacyClient from "./PrivacyClient";

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
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
