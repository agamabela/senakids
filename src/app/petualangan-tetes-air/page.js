import PetualanganTetesAirClient from "./PetualanganTetesAirClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Petualangan Tetes Air - Kisah Siklus Air",
  description:
    "Cerita interaktif tentang siklus air dari awan, hujan, sungai, hingga laut yang mudah dipahami anak-anak.",
  alternates: {
    canonical: "/petualangan-tetes-air",
  },
  openGraph: {
    title: "Petualangan Tetes Air - Kisah Siklus Air",
    description:
      "Cerita interaktif tentang siklus air dari awan, hujan, sungai, hingga laut yang mudah dipahami anak-anak.",
    url: "https://senakids.web.id/petualangan-tetes-air",
    images: [socialImage],
    type: "article",
  },
};

export default function PetualanganTetesAirPage() {
  return <PetualanganTetesAirClient />;
}
