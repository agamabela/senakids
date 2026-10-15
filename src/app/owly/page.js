import OwlyClient from "./OwlyClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Owly — Belajar, Bermain, Tumbuh",
  description: "Program pembelajaran gamifikasi untuk anak usia 5-7 tahun.",
  alternates: {
    canonical: "/owly",
  },
  openGraph: {
    title: "Owly — Belajar, Bermain, Tumbuh",
    description: "Program pembelajaran gamifikasi untuk anak usia 5-7 tahun.",
    url: "https://senakids.web.id/owly",
    images: [socialImage],
    type: "website",
  },
};

export default function OwlyPage() {
  return <OwlyClient />;
}
