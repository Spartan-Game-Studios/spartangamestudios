import { Trans, useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { listedGames, statusKey, studio, type Game } from '@/data';
import { useGameCopy } from '@/i18n/content';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Press.module.css';

const LOGO_ASSETS = [
  {
    nameKey: 'press.primaryLogo',
    noteKey: 'press.primaryLogoNote',
    href: '/brand/logo.png',
    preview: '/brand/logo-512.png',
  },
  {
    nameKey: 'press.pixelLogo',
    noteKey: 'press.pixelLogoNote',
    href: '/brand/logo-pixel.png',
    preview: '/brand/logo-pixel.png',
  },
];

/** Its own component so the per-game translation hook has somewhere to live. */
function TitleEntry({ game }: { game: Game }) {
  const { t } = useTranslation();
  const copy = useGameCopy(game);

  return (
    <div>
      <dt className={styles.factLabel}>
        {copy.title} — {t(statusKey(game.status))}
      </dt>
      <dd className={styles.factValue}>{copy.tagline}</dd>
    </div>
  );
}

export function Press() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('press.title'),
    description: t('meta.pressDescription', { studio: studio.name }),
    path: '/press',
  });

  const games = listedGames();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">{t('press.eyebrow')}</p>
          <h1 className={`${page.title} u-gold-text`}>{t('press.title')}</h1>
          <p className={page.lede}>{t('press.lede')}</p>
          <MeanderRule />
        </header>

        <section className={styles.section} aria-labelledby="facts-heading">
          <h2 id="facts-heading" className={page.sectionTitle}>
            {t('press.factSheet')}
          </h2>
          <dl className={styles.factSheet}>
            <div>
              <dt className={styles.factLabel}>{t('press.studio')}</dt>
              <dd className={styles.factValue}>{studio.name}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>{t('press.founded')}</dt>
              <dd className={styles.factValue}>{studio.founded}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>{t('press.basedIn')}</dt>
              <dd className={styles.factValue}>{studio.location}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>{t('press.website')}</dt>
              <dd className={styles.factValue}>{studio.domain}</dd>
            </div>
            <div>
              <dt className={styles.factLabel}>{t('press.pressContact')}</dt>
              <dd className={styles.factValue}>
                <a href={`mailto:${studio.pressEmail}`}>{studio.pressEmail}</a>
              </dd>
            </div>
            <div>
              <dt className={styles.factLabel}>{t('press.business')}</dt>
              <dd className={styles.factValue}>
                <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="titles-heading">
          <h2 id="titles-heading" className={page.sectionTitle}>
            {t('press.titles')}
          </h2>
          <dl className={styles.factSheet}>
            {games.map((game) => (
              <TitleEntry key={game.slug} game={game} />
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="assets-heading">
          <h2 id="assets-heading" className={page.sectionTitle}>
            {t('press.logos')}
          </h2>
          <div className={styles.assets}>
            {LOGO_ASSETS.map((asset) => (
              <div key={asset.href} className={styles.asset}>
                <div className={styles.assetPreview}>
                  <img
                    src={asset.preview}
                    alt={`${t(asset.nameKey)} — ${studio.name}`}
                    loading="lazy"
                  />
                </div>
                <p className={styles.assetName}>{t(asset.nameKey)}</p>
                <p className={styles.assetNote}>{t(asset.noteKey)}</p>
                <Button href={asset.href} variant="secondary" size="small" download>
                  {t('press.download')}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="terms-heading">
          <h2 id="terms-heading" className={page.sectionTitle}>
            {t('press.permissions')}
          </h2>
          <div className={styles.terms}>
            <p>{t('press.permissionVideo', { studio: studio.name })}</p>
            <p>{t('press.permissionLogos')}</p>
            {/* Trans, not string concatenation — the email sits mid-sentence
                and every language puts it in a different place. */}
            <p>
              <Trans
                i18nKey="press.permissionKeys"
                values={{ email: studio.pressEmail }}
                components={{
                  mail: <a href={`mailto:${studio.pressEmail}`} className="u-gold-text" />,
                }}
              />
            </p>
          </div>

          <div className={styles.contact}>
            <Button href={`mailto:${studio.pressEmail}`}>{t('press.requestKey')}</Button>
            <Button href="/brand/logo.png" variant="secondary" download>
              {t('press.downloadLogo')}
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
