import { getBooks, getGames, getVideos } from "./actions";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const books = await getBooks();
  const games = await getGames();
  const videos = await getVideos();

  return (
    <AdminDashboardClient
      bookCount={books.length}
      gameCount={games.length}
      videoCount={videos.length}
    />
  );
}
