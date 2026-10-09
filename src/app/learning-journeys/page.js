import LearningJourneysClient from "./LearningJourneysClient";

export const metadata = {
  title: "Jalur Belajar",
  description: "Pilih rangkaian kegiatan singkat dari buku, video, dan permainan Sena Kids.",
  alternates: { canonical: "/learning-journeys" },
};

export default function LearningJourneysPage() {
  return <LearningJourneysClient />;
}
