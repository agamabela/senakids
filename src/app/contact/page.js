import ContactClient from "./ContactClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Hubungi Kami & Layanan Moderasi Konten",
  description:
    "Formulir laporan konten rusak, permohonan hapus data pribadi, pertanyaan lisensi, dan masukan orang tua untuk Sena Kids.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Hubungi Kami & Layanan Moderasi Konten",
    description:
      "Formulir laporan konten rusak, permohonan hapus data pribadi, pertanyaan lisensi, dan masukan orang tua untuk Sena Kids.",
    url: "https://senakids.web.id/contact",
    images: [socialImage],
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
