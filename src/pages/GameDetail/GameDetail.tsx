import { Link, useParams } from 'react-router-dom';
import { Container } from '@/components/Container/Container';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { StoreLinks } from '@/components/StoreLinks/StoreLinks';
import { getGame, STATUS_LABELS, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import { NotFound } from '@/pages/NotFound/NotFound';
import styles from './GameDetail.module.css';

export function GameDetail() {
  const { slug } = useParams<{ slug: string }>();
  const game = slug ? getGame(slug) : undefined;

  if (!game) {
    return <NotFound />;
  }

  return <GameDetailView key={game.slug} slug={game.slug} />;
}

/**
 * Split out so the meta hook only ever runs for a game that exists — hooks
 * cannot live behind the not-found early return.
 */
function GameDetailView({ slug }: { slug: string }) {
  const game = getGame(slug)!;

  useDocumentMeta({
    title: game.title,
    description: game.tagline,
    path: `/games/${game.slug}`,
    ...(game.keyArt ? { image: game.keyArt.src } : {}),
  });

  return (
    <article>
      <header className={styles.hero}>
        <Container>
          <Link to="/games" className={styles.back}>
            &larr; All games
          </Link>

          {game.visibility === 'unlisted' ? (
            <p className={styles.unlistedNotice}>
              Unannounced — this page is reachable by direct link only and is not listed anywhere on
              the site.
            </p>
          ) : null}

          <div className={styles.meta}>
            <StatusBadge status={game.status} />
            <span className={styles.genre}>{game.genre}</span>
          </div>

          <h1 className={`${styles.title} u-gold-text`}>{game.title}</h1>
          <p className={styles.tagline}>{game.tagline}</p>

          <div className={styles.stores}>
            <StoreLinks links={game.stores} title={game.title} fallbackTo="/devlog" size="large" />
          </div>
        </Container>
      </header>

      <div className={styles.body}>
        <Container>
          <div className={styles.layout}>
            <div>
              <p className={styles.pitch}>{game.pitch}</p>

              {game.features && game.features.length > 0 ? (
                <section className={styles.features} aria-labelledby="features-heading">
                  <h2 id="features-heading" className={styles.featuresTitle}>
                    What it is
                  </h2>
                  {game.features.map((feature) => (
                    <p key={feature} className={styles.feature}>
                      {feature}
                    </p>
                  ))}
                </section>
              ) : null}
            </div>

            <aside className={styles.facts} aria-labelledby="facts-heading">
              <h2 id="facts-heading" className={styles.factsTitle}>
                At a glance
              </h2>
              <dl className={styles.factList}>
                <div>
                  <dt className={styles.factLabel}>Status</dt>
                  <dd className={styles.factValue}>{STATUS_LABELS[game.status]}</dd>
                </div>
                <div>
                  <dt className={styles.factLabel}>Genre</dt>
                  <dd className={styles.factValue}>{game.genre}</dd>
                </div>
                <div>
                  <dt className={styles.factLabel}>Platforms</dt>
                  <dd className={styles.factValue}>{game.platforms.join(', ')}</dd>
                </div>
                {game.releaseWindow ? (
                  <div>
                    <dt className={styles.factLabel}>Release</dt>
                    <dd className={styles.factValue}>{game.releaseWindow}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className={styles.factLabel}>Price</dt>
                  <dd className={styles.factValue}>
                    {game.price ?? 'Buy once, own forever — price set closer to launch'}
                  </dd>
                </div>
                <div>
                  <dt className={styles.factLabel}>Developer</dt>
                  <dd className={styles.factValue}>{studio.name}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </Container>
      </div>
    </article>
  );
}
