import PetualanganTetesAirClient from "./PetualanganTetesAirClient";

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
    type: "article",
  },
};

export default function PetualanganTetesAirPage() {
  return <PetualanganTetesAirClient />;
}