import BelajarMembacaClient from "./BelajarMembacaClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Belajar Membaca Suku Kata",
  description:
    "Latihan interaktif membaca suku kata dan kata sederhana dengan bantuan suara dan gambar ramah anak.",
  alternates: {
    canonical: "/belajar-membaca",
  },
  openGraph: {
    title: "Belajar Membaca Suku Kata",
    description:
      "Latihan interaktif membaca suku kata dan kata sederhana dengan bantuan suara dan gambar ramah anak.",
    url: "https://senakids.web.id/belajar-membaca",
    images: [socialImage],
    type: "website",
  },
};

export default function BelajarMembacaPage() {
  return <BelajarMembacaClient />;
}
