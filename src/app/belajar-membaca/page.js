import BelajarMembacaClient from "./BelajarMembacaClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Belajar Membaca Suku Kata & Huruf Anak TK/PAUD Online",
  description:
    "Latihan interaktif belajar membaca suku kata dan kata sederhana dengan bantuan audio suara dan gambar visual ramah anak di Sena Kids.",
  alternates: {
    canonical: "/belajar-membaca",
  },
  openGraph: {
    title: "Belajar Membaca Suku Kata & Huruf Anak TK/PAUD Online",
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
