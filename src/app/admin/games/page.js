import { getGames } from "../actions";
import GamesAdmin from "./GamesAdmin";

export default async function GamesPage() {
  const games = await getGames();
  return <GamesAdmin initialGames={games} />;
}
