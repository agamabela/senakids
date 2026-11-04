import TermsClient from "./TermsClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Syarat dan Ketentuan Penggunaan",
  description:
    "Ketentuan penggunaan situs Sena Kids untuk anak, orang tua, pendidik, dan keluarga.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Syarat dan Ketentuan Penggunaan | Sena Kids",
    description:
      "Ketentuan penggunaan situs Sena Kids untuk anak, orang tua, pendidik, dan keluarga.",
    url: "https://senakids.web.id/terms",
    images: [socialImage],
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
