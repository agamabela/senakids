import SkiPagiGameClient from "../built/SkiPagiGameClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Ski Free · Petualangan Lereng Gunung Salju",
  description:
    "Meluncur di lereng bersalju, hindari pepohonan dan bebatuan, lewati gerbang slalom, dan kumpulkan koin di lereng gunung.",
  alternates: {
    canonical: "/games/ski-free",
  },
  openGraph: {
    title: "Ski Free · Petualangan Lereng Gunung Salju | Sena Kids",
    description:
      "Meluncur di lereng bersalju, hindari pepohonan dan bebatuan, lewati gerbang slalom, dan kumpulkan koin di lereng gunung.",
    url: "https://senakids.web.id/games/ski-free",
    images: [socialImage],
    type: "website",
  },
};

export default function SkiFreePage() {
  return <SkiPagiGameClient />;
}
