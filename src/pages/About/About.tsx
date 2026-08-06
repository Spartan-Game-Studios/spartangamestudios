import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { studio } from '@/data';
import { usePledgeCopy, useStudioCopy } from '@/i18n/content';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './About.module.css';

export function About() {
  const { t } = useTranslation();
  const studioCopy = useStudioCopy();
  const pledge = usePledgeCopy();

  useDocumentMeta({
    title: t('about.title'),
    description: studioCopy.description,
    path: '/about',
  });

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">{t('about.eyebrow')}</p>
          <h1 className={`${page.title} u-gold-text`}>{t('about.title')}</h1>
          <MeanderRule />
        </header>

        <div className={styles.prose}>
          <p>{t('about.body1', { studio: studio.name })}</p>
          <p>{t('about.body2')}</p>
          <p>{t('about.body3')}</p>
        </div>

        <section className={styles.pledge} aria-labelledby="pledge-heading">
          <h2 id="pledge-heading" className={page.sectionTitle}>
            {pledge.heading}
          </h2>
          <div className={styles.pledgeList}>
            {pledge.points.map((point) => (
              <div key={point.id} className={styles.pledgeItem}>
                <h3 className={styles.pledgeTitle}>{point.title}</h3>
                <p className={styles.pledgeBody}>{point.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.contact}>
            <Button href={`mailto:${studio.businessEmail}`}>{t('common.getInTouch')}</Button>
            <Button to="/press" variant="secondary">
              {t('common.pressKit')}
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
