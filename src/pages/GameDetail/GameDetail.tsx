import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { StoreLinks } from '@/components/StoreLinks/StoreLinks';
import { getGame, statusKey, studio } from '@/data';
import { useGameCopy } from '@/i18n/content';
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
  const { t } = useTranslation();
  const game = getGame(slug)!;
  const copy = useGameCopy(game);
  // Games with a VitePress wiki under /wiki/<slug>/ (a separate static site the
  // SPA can't introspect). Keep in sync when a game wiki is added.
  const hasWiki = ['boothill', 'inkbreak', 'nightside'].includes(game.slug);
  // Steam's official store widget, keyed on the app id parsed from the Steam
  // store link. This is a third-party iframe that loads on view — the privacy
  // policy's "no third-party tracking" carve-out covers it. See Privacy.tsx.
  const steamAppId = game.stores.find((s) => s.store === 'steam')?.url.match(/\/app\/(\d+)/)?.[1];

  useDocumentMeta({
    title: copy.title,
    description: copy.tagline,
    path: `/games/${game.slug}`,
    ...(game.keyArt ? { image: game.keyArt.src } : {}),
  });

  return (
    <article>
      <header className={styles.hero}>
        <Container>
          <Link to="/games" className={styles.back}>
            &larr; {t('common.backToGames')}
          </Link>

          {game.visibility === 'unlisted' ? (
            <p className={styles.unlistedNotice}>{t('gameDetail.unannounced')}</p>
          ) : null}

          <div className={styles.meta}>
            <StatusBadge status={game.status} />
            <span className={styles.genre}>{copy.genre}</span>
          </div>

          <h1 className={`${styles.title} u-gold-text`}>{copy.title}</h1>
          <p className={styles.tagline}>{copy.tagline}</p>

          <div className={styles.stores}>
            <StoreLinks links={game.stores} title={copy.title} fallbackTo="/devlog" size="large" />
          </div>

          {hasWiki ? (
            <a href={`/wiki/${game.slug}/`} className={styles.wikiLink}>
              {t('gameDetail.wikiLink', { title: copy.title })}
            </a>
          ) : null}
        </Container>
      </header>

      {game.keyArt ? (
        <Container>
          <figure className={styles.keyArt}>
            <img src={game.keyArt.src} alt={game.keyArt.alt} width={1280} height={720} />
          </figure>
        </Container>
      ) : null}

      {steamAppId ? (
        <Container>
          <div className={styles.steam}>
            <iframe
              className={styles.steamWidget}
              title={t('gameDetail.steamWidget', { title: copy.title })}
              src={`https://store.steampowered.com/widget/${steamAppId}/`}
              width={646}
              height={190}
            />
          </div>
        </Container>
      ) : null}

      <div className={styles.body}>
        <Container>
          <div className={styles.layout}>
            <div>
              <p className={styles.pitch}>{copy.pitch}</p>

              {copy.features.length > 0 ? (
                <section className={styles.features} aria-labelledby="features-heading">
                  <h2 id="features-heading" className={styles.featuresTitle}>
                    {t('gameDetail.whatItIs')}
                  </h2>
                  {copy.features.map((feature) => (
                    <p key={feature} className={styles.feature}>
                      {feature}
                    </p>
                  ))}
                </section>
              ) : null}
            </div>

            <aside className={styles.facts} aria-labelledby="facts-heading">
              <h2 id="facts-heading" className={styles.factsTitle}>
                {t('gameDetail.atAGlance')}
              </h2>
              <dl className={styles.factList}>
                <div>
                  <dt className={styles.factLabel}>{t('gameDetail.status')}</dt>
                  <dd className={styles.factValue}>{t(statusKey(game.status))}</dd>
                </div>
                <div>
                  <dt className={styles.factLabel}>{t('gameDetail.genre')}</dt>
                  <dd className={styles.factValue}>{copy.genre}</dd>
                </div>
                <div>
                  {/* Platform names are proper nouns — never translated. */}
                  <dt className={styles.factLabel}>{t('gameDetail.platforms')}</dt>
                  <dd className={styles.factValue}>{game.platforms.join(', ')}</dd>
                </div>
                {game.releaseWindow ? (
                  <div>
                    <dt className={styles.factLabel}>{t('gameDetail.release')}</dt>
                    <dd className={styles.factValue}>{game.releaseWindow}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className={styles.factLabel}>{t('gameDetail.price')}</dt>
                  <dd className={styles.factValue}>{copy.price ?? t('gameDetail.priceUnset')}</dd>
                </div>
                <div>
                  <dt className={styles.factLabel}>{t('gameDetail.developer')}</dt>
                  <dd className={styles.factValue}>{studio.name}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {game.screenshots && game.screenshots.length > 0 ? (
            <section className={styles.gallery} aria-labelledby="shots-heading">
              <h2 id="shots-heading" className={styles.galleryTitle}>
                {t('gameDetail.screenshots')}
              </h2>
              <div className={styles.shots}>
                {game.screenshots.map((shot) => (
                  <img
                    key={shot.src}
                    className={styles.shot}
                    src={shot.src}
                    alt={shot.alt}
                    loading="lazy"
                    width={1600}
                    height={900}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </Container>
      </div>
    </article>
  );
}
