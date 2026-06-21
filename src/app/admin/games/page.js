import { getGames } from "../actions";
import GamesAdmin from "./GamesAdmin";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  let games = [];
  try {
    games = await getGames();
  } catch (e) {
    games = [];
  }
  return <GamesAdmin initialGames={games} />;
}
