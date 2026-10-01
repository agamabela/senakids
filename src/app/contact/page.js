import ContactClient from "./ContactClient";

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
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
