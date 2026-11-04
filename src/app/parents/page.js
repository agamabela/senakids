import ParentsClient from "./ParentsClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Pengaturan dan Panduan Orang Tua",
  description:
    "Pengaturan waktu layar, kontrol audio, informasi privasi anak, dan panduan mendampingi anak beraktivitas digital.",
  alternates: {
    canonical: "/parents",
  },
  openGraph: {
    title: "Pengaturan dan Panduan Orang Tua | Sena Kids",
    description:
      "Pengaturan waktu layar, kontrol audio, informasi privasi anak, dan panduan mendampingi anak beraktivitas digital.",
    url: "https://senakids.web.id/parents",
    images: [socialImage],
    type: "website",
  },
};

export default function ParentsPage() {
  return <ParentsClient />;
}
