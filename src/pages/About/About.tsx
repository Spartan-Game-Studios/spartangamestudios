import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { ownershipPledge, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './About.module.css';

export function About() {
  useDocumentMeta({
    title: 'About',
    description: studio.description,
    path: '/about',
  });

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">The studio</p>
          <h1 className={`${page.title} u-gold-text`}>About</h1>
          <MeanderRule />
        </header>

        <div className={styles.prose}>
          <p>
            {studio.name} is a small independent studio building tight, replayable action games —
            the kind you start a fifteenth run of because the fourteenth ended badly and you know
            exactly why.
          </p>
          <p>
            We build in Godot, we ship on PC first, and we keep the scope honest: a complete game
            that respects the hours you put into it beats a bigger one that needs you to keep paying
            attention.
          </p>
          <p>
            The part we care most about is how the games are sold. That is the whole reason this
            page exists rather than a store bio.
          </p>
        </div>

        <section className={styles.pledge} aria-labelledby="pledge-heading">
          <h2 id="pledge-heading" className={page.sectionTitle}>
            {ownershipPledge.heading}
          </h2>
          <div className={styles.pledgeList}>
            {ownershipPledge.points.map((point) => (
              <div key={point.title} className={styles.pledgeItem}>
                <h3 className={styles.pledgeTitle}>{point.title}</h3>
                <p className={styles.pledgeBody}>{point.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.contact}>
            <Button href={`mailto:${studio.businessEmail}`}>Get in touch</Button>
            <Button to="/press" variant="secondary">
              Press kit
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
