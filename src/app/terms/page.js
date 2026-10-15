import TermsClient from "./TermsClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Syarat & Ketentuan Penggunaan",
  description:
    "Ketentuan penggunaan platform Sena Kids untuk anak, orang tua, guru, dan institusi pendidikan ramah anak.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Syarat & Ketentuan Penggunaan",
    description:
      "Ketentuan penggunaan platform Sena Kids untuk anak, orang tua, guru, dan institusi pendidikan ramah anak.",
    url: "https://senakids.web.id/terms",
    images: [socialImage],
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
