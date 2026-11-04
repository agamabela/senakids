import SkiPagiGameClient from "../built/SkiPagiGameClient";
import { socialImage } from "@/lib/seo-metadata";

export const metadata = {
  title: "Game Ski Free - Petualangan Meluncur Salju Ramah Anak",
  description:
    "Meluncur di lereng bersalju, hindari pepohonan dan bebatuan, lewati gerbang slalom, dan kumpulkan koin di permainan arkade salju ramah anak.",
  alternates: {
    canonical: "/games/ski-free",
  },
  openGraph: {
    title: "Game Ski Free - Petualangan Meluncur Salju Ramah Anak",
    description:
      "Meluncur di lereng bersalju, hindari pepohonan dan bebatuan, lewati gerbang slalom, dan kumpulkan koin di permainan arkade salju ramah anak.",
    url: "https://senakids.web.id/games/ski-free",
    images: [socialImage],
    type: "website",
  },
};

export default function SkiFreePage() {
  return <SkiPagiGameClient />;
}
