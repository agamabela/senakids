import ContactClient from "./ContactClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Hubungi Kami",
  description:
    "Kirimkan masukan, saran, atau pertanyaan seputar kegiatan dan konten belajar di Sena Kids.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Hubungi Kami | Sena Kids",
    description:
      "Kirimkan masukan, saran, atau pertanyaan seputar kegiatan dan konten belajar di Sena Kids.",
    url: "https://senakids.web.id/contact",
    images: [socialImage],
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
