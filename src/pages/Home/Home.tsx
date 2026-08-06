import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { GameCard } from '@/components/GameCard/GameCard';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { PostListItem } from '@/pages/Devlog/PostListItem';
import { listedGames, listedPosts, studio } from '@/data';
import { usePledgeCopy, useStudioCopy } from '@/i18n/content';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import styles from './Home.module.css';

export function Home() {
  const { t } = useTranslation();
  const studioCopy = useStudioCopy();
  const pledge = usePledgeCopy();

  useDocumentMeta({
    title: studio.name,
    description: studioCopy.description,
    path: '/',
  });

  const featured = listedGames();
  const posts = listedPosts().slice(0, 2);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true">
          <img className={styles.heroMark} src="/brand/logo-512.png" alt="" />
        </div>

        <Container>
          <div className={styles.heroContent}>
            <p className={styles.heroSub}>{studio.name}</p>
            <h1 className={`${styles.heroTitle} u-gold-text`}>{studioCopy.tagline}</h1>
            <MeanderRule short />
            <p className={styles.heroLede}>{t('home.heroLede')}</p>
            <div className={styles.heroActions}>
              <Button to="/games" size="large">
                {t('home.seeTheGames')}
              </Button>
              <Button to="/about" variant="secondary" size="large">
                {t('home.aboutTheStudio')}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="games-heading">
        <Container>
          <div className={styles.sectionHead}>
            <p className="u-eyebrow">{t('home.catalogueEyebrow')}</p>
            <h2 id="games-heading" className={styles.sectionTitle}>
              {t('home.catalogueTitle')}
            </h2>
            <p className={styles.sectionLede}>{t('home.catalogueLede')}</p>
          </div>

          <div className={styles.gameGrid}>
            {featured.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.pledge}`} aria-labelledby="pledge-heading">
        <Container>
          <div className={styles.sectionHead}>
            <p className="u-eyebrow">{t('home.pledgeEyebrow')}</p>
            <h2 id="pledge-heading" className={styles.sectionTitle}>
              {pledge.heading}
            </h2>
          </div>

          <div className={styles.pledgeGrid}>
            {pledge.points.map((point) => (
              <div key={point.id} className={styles.pledgeItem}>
                <h3 className={styles.pledgeTitle}>{point.title}</h3>
                <p className={styles.pledgeBody}>{point.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {posts.length > 0 ? (
        <section className={styles.section} aria-labelledby="devlog-heading">
          <Container>
            <div className={styles.sectionHead}>
              <p className="u-eyebrow">{t('home.devlogEyebrow')}</p>
              <h2 id="devlog-heading" className={styles.sectionTitle}>
                {t('home.devlogTitle')}
              </h2>
            </div>

            <div className={styles.postList}>
              {posts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
