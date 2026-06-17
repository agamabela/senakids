import { notFound } from "next/navigation";
import { getGame } from "@/app/admin/actions";
import styles from "./page.module.css";

export default async function GameDetailPage({ params }) {
  const { gameId } = await params;
  const game = await getGame(gameId);

  if (!game) {
    notFound();
  }

  return (
    <div className={styles.gameDetailContainer}>
      <div className={styles.header}>
        <div>
          <h1>{game.title}</h1>
          <p>{game.description}</p>
        </div>
        {game.gameUrl && (
          <a href={game.gameUrl} target="_blank" rel="noreferrer" className={styles.externalLink}>
            Open in new tab
          </a>
        )}
      </div>

      {game.gameUrl ? (
        <div className={styles.iframeWrapper}>
          <iframe
            src={game.gameUrl}
            title={game.title}
            allowFullScreen
            loading="lazy"
            className={styles.gameIframe}
          />
        </div>
      ) : (
        <div className={styles.noGameMessage}>
          <p>This game does not have an iframe URL yet. Add a game URL in the admin panel to enable embedded play.</p>
        </div>
      )}
    </div>
  );
}
