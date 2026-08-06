import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedGames, STATUS_LABELS, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Press.module.css';

const LOGO_ASSETS = [
  {
    name: 'Primary logo',
    href: '/brand/logo.png',
    preview: '/brand/logo-512.png',
    note: 'PNG, 1024×1024, transparent',
  },
  {
    name: 'Pixel logo',
    href: '/brand/logo-pixel.png',
    preview: '/brand/logo-pixel.png',
    note: 'PNG, transparent — for small/in-game use',
  },
];

export function Press() {
  useDocumentMeta({
    title: 'Press',
    description: `Press kit for ${studio.name} — fact sheet, logos, and contact for press and creators.`,
    path: '/press',
  });

  const games = listedGames();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">Press &amp; creators</p>
          <h1 className={`${page.title} u-gold-text`}>Press kit</h1>
          <p className={page.lede}>
            Everything needed to write about, stream, or record our games. If something you need is
            missing, ask — we would rather send it than have you go without.
          </p>
          <MeanderRule />
        </header>

        <section className={styles.section} aria-labelledby="facts-heading">
          <h2 id="facts-heading" className={page.sectionTitle}>
            Fact sheet
          </h2>
          <dl className={styles.factSheet}>
            <div>
              <dt className={styles.factLabel}>Studio</dt>
              <dd className={styles.factValue}>{studio.name}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>Founded</dt>
              <dd className={styles.factValue}>{studio.founded}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>Based in</dt>
              <dd className={styles.factValue}>{studio.location}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>Website</dt>
              <dd className={styles.factValue}>{studio.domain}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>Press contact</dt>
              <dd className={styles.factValue}>
                <a href={`mailto:${studio.pressEmail}`}>{studio.pressEmail}</a>
              </dd>
            </div>
            <div>
              <dt className={styles.factLabel}>Business</dt>
              <dd className={styles.factValue}>
                <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="titles-heading">
          <h2 id="titles-heading" className={page.sectionTitle}>
            Titles
          </h2>
          <dl className={styles.factSheet}>
            {games.map((game) => (
              <div key={game.slug}>
                <dt className={styles.factLabel}>
                  {game.title} — {STATUS_LABELS[game.status]}
                </dt>
                <dd className={styles.factValue}>{game.tagline}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="assets-heading">
          <h2 id="assets-heading" className={page.sectionTitle}>
            Logos
          </h2>
          <div className={styles.assets}>
            {LOGO_ASSETS.map((asset) => (
              <div key={asset.href} className={styles.asset}>
                <div className={styles.assetPreview}>
                  <img src={asset.preview} alt={`${asset.name} — ${studio.name}`} loading="lazy" />
                </div>
                <p className={styles.assetName}>{asset.name}</p>
                <p className={styles.assetNote}>{asset.note}</p>
                <Button href={asset.href} variant="secondary" size="small" download>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="terms-heading">
          <h2 id="terms-heading" className={page.sectionTitle}>
            Permissions
          </h2>
          <div className={styles.terms}>
            <p>
              You have our blanket permission to record, stream, and monetise video of any{' '}
              {studio.name} game, including full playthroughs. No further clearance needed, and
              nothing here will ever get you a copyright strike from us.
            </p>
            <p>
              Logos and key art may be used in coverage of our games. Please do not alter the
              logo&rsquo;s colours or proportions, or use it to imply that we endorse a product.
            </p>
            <p>
              Review keys and preview builds:{' '}
              <a href={`mailto:${studio.pressEmail}`} className="u-gold-text">
                {studio.pressEmail}
              </a>
              . Tell us the outlet or channel and which game — that is all we need.
            </p>
          </div>

          <div className={styles.contact}>
            <Button href={`mailto:${studio.pressEmail}`}>Request a key</Button>
            <Button href="/brand/logo.png" variant="secondary" download>
              Download the logo
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
