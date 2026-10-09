import { Suspense } from "react";
import MazeGameClient from "./MazeGameClient";

export const metadata = {
  title: "Main Labirin | Sena Kids",
  description: "Mainkan petualangan labirin, kumpulkan semua permata dan hindari rintangan!",
  alternates: {
    canonical: "/games/maze/play",
  },
};

function MazePlayWrapper({ searchParams }) {
  const difficulty = searchParams?.difficulty || "easy";
  return <MazeGameClient initialDifficulty={difficulty} />;
}

export default async function MazePlayPage(props) {
  const searchParams = await props.searchParams;
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Memuat Labirin...</div>}>
      <MazePlayWrapper searchParams={searchParams} />
    </Suspense>
  );
}
