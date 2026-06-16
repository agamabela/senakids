import { getBooks, getGames, getVideos } from "./actions";
import { Book, Gamepad2, Tv } from "lucide-react";

export default async function AdminDashboard() {
  const books = await getBooks();
  const games = await getGames();
  const videos = await getVideos();

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '24px' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Books Stat */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Book size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{books.length}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>Total Books</div>
          </div>
        </div>

        {/* Games Stat */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gamepad2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{games.length}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>Total Games</div>
          </div>
        </div>

        {/* TV Stat */}
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tv size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{videos.length}</div>
            <div style={{ color: 'var(--color-muted-foreground)' }}>Total Videos</div>
          </div>
        </div>

      </div>
    </div>
  );
}
