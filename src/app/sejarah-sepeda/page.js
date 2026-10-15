import SejarahSepedaClient from "./SejarahSepedaClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Sejarah Sepeda - Ensiklopedia Cilik",
  description:
    "Pelajari sejarah perkembangan sepeda dari Draisienne hingga era modern dalam format ensiklopedia interaktif anak.",
  alternates: {
    canonical: "/sejarah-sepeda",
  },
  openGraph: {
    title: "Sejarah Sepeda - Ensiklopedia Cilik",
    description:
      "Pelajari sejarah perkembangan sepeda dari Draisienne hingga era modern dalam format ensiklopedia interaktif anak.",
    url: "https://senakids.web.id/sejarah-sepeda",
    images: [socialImage],
    type: "article",
  },
};

export default function SejarahSepedaPage() {
  return <SejarahSepedaClient />;
}
