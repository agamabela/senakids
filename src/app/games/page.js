import { getGames } from "@/app/admin/actions";
import GamesClient from "./GamesClient";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  let games = [];
  try {
    games = await getGames();
  } catch (e) {
    games = [];
  }

  const zonesMap = {};
  games.forEach(game => {
    if (!zonesMap[game.zoneName]) zonesMap[game.zoneName] = { title: game.zoneName, games: [] };
    zonesMap[game.zoneName].games.push({
      ...game,
      href: `/games/${game.id}`,
    });
  });

  const zones = Object.values(zonesMap);

  return <GamesClient zones={zones} />;
}
