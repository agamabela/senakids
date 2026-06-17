import { getGames } from "@/app/admin/actions";
import GamesClient from "./GamesClient";

export default async function GamesPage() {
  const games = await getGames();
  
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
