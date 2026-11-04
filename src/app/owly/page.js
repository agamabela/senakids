import OwlyClient from "./OwlyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Belajar Konsep Dasar Bersama Owly",
  description:
    "Latihan mengenal huruf, angka, dan konsep dasar untuk anak usia dini bersama maskot burung hantu Owly.",
  alternates: {
    canonical: "/owly",
  },
  openGraph: {
    title: "Belajar Konsep Dasar Bersama Owly | Sena Kids",
    description:
      "Latihan mengenal huruf, angka, dan konsep dasar untuk anak usia dini bersama maskot burung hantu Owly.",
    url: "https://senakids.web.id/owly",
    images: [socialImage],
    type: "website",
  },
};

export default function OwlyPage() {
  return <OwlyClient />;
}
