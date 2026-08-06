import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { GameCard } from '@/components/GameCard/GameCard';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { PostListItem } from '@/pages/Devlog/PostListItem';
import { listedGames, listedPosts, ownershipPledge, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import styles from './Home.module.css';

export function Home() {
  useDocumentMeta({
    title: studio.name,
    description: studio.description,
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
            <h1 className={`${styles.heroTitle} u-gold-text`}>{studio.tagline}</h1>
            <MeanderRule short />
            <p className={styles.heroLede}>
              We build tight, replayable action games — and sell them the old way. One purchase,
              yours forever, updates free. No microtransactions, no live service, nothing inside the
              game asking you for money.
            </p>
            <div className={styles.heroActions}>
              <Button to="/games" size="large">
                See the games
              </Button>
              <Button to="/about" variant="secondary" size="large">
                About the studio
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.section} aria-labelledby="games-heading">
        <Container>
          <div className={styles.sectionHead}>
            <p className="u-eyebrow">The catalogue</p>
            <h2 id="games-heading" className={styles.sectionTitle}>
              What we&rsquo;re building
            </h2>
            <p className={styles.sectionLede}>
              Nothing is on sale yet. Every game below lists its full row of storefronts the day it
              has one — this page is the canonical place to find them.
            </p>
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
            <p className="u-eyebrow">Our promise</p>
            <h2 id="pledge-heading" className={styles.sectionTitle}>
              {ownershipPledge.heading}
            </h2>
          </div>

          <div className={styles.pledgeGrid}>
            {ownershipPledge.points.map((point) => (
              <div key={point.title} className={styles.pledgeItem}>
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
              <p className="u-eyebrow">From the workshop</p>
              <h2 id="devlog-heading" className={styles.sectionTitle}>
                Devlog
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
