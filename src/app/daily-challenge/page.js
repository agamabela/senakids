import DailyChallengeClient from "./DailyChallengeClient";

export const metadata = {
  title: "Tantangan Hari Ini",
  description: "Satu kegiatan belajar kecil untuk dilakukan hari ini di Sena Kids.",
  alternates: { canonical: "/daily-challenge" },
};

export default function DailyChallengePage() {
  return <DailyChallengeClient />;
}
