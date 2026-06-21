import { getBooks, getGames, getVideos } from "./actions";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let books = [];
  let games = [];
  let videos = [];
  try {
    [books, games, videos] = await Promise.all([getBooks(), getGames(), getVideos()]);
  } catch (e) {
    // DB not reachable during build — render with zeros
  }

  return (
    <AdminDashboardClient
      bookCount={books.length}
      gameCount={games.length}
      videoCount={videos.length}
    />
  );
}
