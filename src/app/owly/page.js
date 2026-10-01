import OwlyClient from "./OwlyClient";

export const metadata = {
  title: "Owly — Belajar, Bermain, Tumbuh",
  description: "Program pembelajaran gamifikasi untuk anak usia 5-7 tahun.",
  alternates: {
    canonical: "/owly",
  },
  openGraph: {
    title: "Owly — Belajar, Bermain, Tumbuh",
    description: "Program pembelajaran gamifikasi untuk anak usia 5-7 tahun.",
    url: "https://senakids.web.id/owly",
    type: "website",
  },
};

export default function OwlyPage() {
  return <OwlyClient />;
}
