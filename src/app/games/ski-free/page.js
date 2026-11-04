import SkiPagiGameClient from "../built/SkiPagiGameClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Permainan Ski Anak: Meluncur di Salju",
  description:
    "Meluncur menuruni lereng bersalju, hindari pepohonan dan bebatuan, serta kumpulkan koin di permainan ski arkade yang seru.",
  alternates: {
    canonical: "/games/ski-free",
  },
  openGraph: {
    title: "Permainan Ski Anak: Meluncur di Salju | Sena Kids",
    description:
      "Meluncur menuruni lereng bersalju, hindari pepohonan dan bebatuan, serta kumpulkan koin di permainan ski arkade yang seru.",
    url: "https://senakids.web.id/games/ski-free",
    images: [socialImage],
    type: "website",
  },
};

export default function SkiFreePage() {
  return <SkiPagiGameClient />;
}
