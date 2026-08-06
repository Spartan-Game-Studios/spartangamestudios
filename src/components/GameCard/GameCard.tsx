import { Link } from 'react-router-dom';
import type { Game } from '@/data';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import styles from './GameCard.module.css';

export function GameCard({ game }: { game: Game }) {
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
          <span className={styles.genre}>{game.genre}</span>
        </div>

        <h3 className={styles.title}>
          <Link to={`/games/${game.slug}`} className={styles.link}>
            {game.title}
          </Link>
        </h3>

        <p className={styles.tagline}>{game.tagline}</p>

        <p className={styles.platforms}>{game.platforms.join(' · ')}</p>
      </div>
    </article>
  );
}
