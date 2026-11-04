import BelajarMembacaClient from "./BelajarMembacaClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Belajar Membaca Suku Kata dan Huruf Anak",
  description:
    "Latihan interaktif belajar membaca suku kata dan kata sederhana dengan panduan audio dan gambar visual untuk anak TK dan PAUD.",
  alternates: {
    canonical: "/belajar-membaca",
  },
  openGraph: {
    title: "Belajar Membaca Suku Kata dan Huruf Anak | Sena Kids",
    description:
      "Latihan interaktif belajar membaca suku kata dan kata sederhana dengan panduan audio dan gambar visual untuk anak TK dan PAUD.",
    url: "https://senakids.web.id/belajar-membaca",
    images: [socialImage],
    type: "website",
  },
};

export default function BelajarMembacaPage() {
  return <BelajarMembacaClient />;
}
