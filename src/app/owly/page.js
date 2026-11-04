import OwlyClient from "./OwlyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Owly - Program Belajar Gamifikasi Anak Usia 5-7 Tahun",
  description:
    "Program pembelajaran gamifikasi interaktif untuk anak usia dini (5-7 tahun). Belajar konsep dasar dengan misi seru dan penuh motivasi di Sena Kids.",
  alternates: {
    canonical: "/owly",
  },
  openGraph: {
    title: "Owly - Program Belajar Gamifikasi Anak Usia 5-7 Tahun",
    description:
      "Program pembelajaran gamifikasi interaktif untuk anak usia dini (5-7 tahun). Belajar konsep dasar dengan misi seru dan penuh motivasi di Sena Kids.",
    url: "https://senakids.web.id/owly",
    images: [socialImage],
    type: "website",
  },
};

export default function OwlyPage() {
  return <OwlyClient />;
}
