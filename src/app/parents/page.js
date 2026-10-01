import ParentsClient from "./ParentsClient";

export const metadata = {
  title: "Panduan & Pengaturan Orang Tua",
  description:
    "Informasi privasi anak, timer pembatas waktu layar, kontrol suara, dan panduan keamanan digital untuk orang tua.",
  alternates: {
    canonical: "/parents",
  },
  openGraph: {
    title: "Panduan & Pengaturan Orang Tua",
    description:
      "Informasi privasi anak, timer pembatas waktu layar, kontrol suara, dan panduan keamanan digital untuk orang tua.",
    url: "https://senakids.web.id/parents",
    type: "website",
  },
};

export default function ParentsPage() {
  return <ParentsClient />;
}
