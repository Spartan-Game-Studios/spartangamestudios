import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker';
import { listedGames, studio } from '@/data';
import { useStudioCopy } from '@/i18n/content';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  const { t } = useTranslation();
  const copy = useStudioCopy();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div>
            <p className={`${styles.brandLine} u-gold-text`}>{studio.name}</p>
            <p className={styles.blurb}>{copy.description}</p>
            <LanguagePicker className={styles.language} />
          </div>

          <div>
            <h2 className={styles.heading}>{t('footer.games')}</h2>
            <ul className={styles.list}>
              {listedGames().map((game) => (
                <li key={game.slug}>
                  <Link to={`/games/${game.slug}`}>{game.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.heading}>{t('footer.studio')}</h2>
            <ul className={styles.list}>
              <li>
                <Link to="/about">{t('footer.about')}</Link>
              </li>
              <li>
                <Link to="/devlog">{t('footer.devlog')}</Link>
              </li>
              <li>
                {/* The wiki is a separate static site at /wiki/, not an SPA route. */}
                <a href="/wiki/">{t('footer.wiki')}</a>
              </li>
              <li>
                <Link to="/press">{t('footer.pressKit')}</Link>
              </li>
              <li>
                <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{t('footer.copyright', { year, studio: studio.name })}</span>
          <span>{t('footer.motto')}</span>
        </div>
      </Container>
    </footer>
  );
}
