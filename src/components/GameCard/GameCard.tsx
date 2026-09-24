import { Link } from 'react-router-dom';
import type { Game } from '@/data';
import { useGameCopy } from '@/i18n/content';
import { useResolvedGame } from '@/lib/useResolvedGame';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import styles from './GameCard.module.css';

export function GameCard({ game: gameProp }: { game: Game }) {
  // Applies the launch flip (e.g. "out now") once its releaseAt passes.
  const game = useResolvedGame(gameProp);
  const copy = useGameCopy(game);

  return (
    <article className={styles.card}>
      {game.keyArt ? (
        <img className={styles.art} src={game.keyArt.src} alt={game.keyArt.alt} loading="lazy" />
      ) : (
        <div className={`${styles.art} ${styles.artPlaceholder}`} aria-hidden="true">
          <span className={styles.artInitial}>{game.title.charAt(0)}</span>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.meta}>
          <StatusBadge status={game.status} />
          <span className={styles.genre}>{copy.genre}</span>
        </div>

        <h3 className={styles.title}>
          <Link to={`/games/${game.slug}`} className={styles.link}>
            {copy.title}
          </Link>
        </h3>

        <p className={styles.tagline}>{copy.tagline}</p>

        <p className={styles.platforms}>{game.platforms.join(' · ')}</p>
      </div>
    </article>
  );
}
