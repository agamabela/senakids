import CreateClient from "./CreateClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Kanvas Gambar dan Mewarnai Anak Online",
  description:
    "Kanvas digital interaktif untuk anak menggambar, mewarnai, dan membuat karya visual dengan kuas warna-warni dan aneka stempel.",
  alternates: {
    canonical: "/create",
  },
  openGraph: {
    title: "Kanvas Gambar dan Mewarnai Anak Online | Sena Kids",
    description:
      "Kanvas digital interaktif untuk anak menggambar, mewarnai, dan membuat karya visual dengan kuas warna-warni dan aneka stempel.",
    url: "https://senakids.web.id/create",
    images: [socialImage],
    type: "website",
  },
};

export default function CreatePage() {
  return <CreateClient />;
}
