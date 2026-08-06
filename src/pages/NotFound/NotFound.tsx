import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import styles from './NotFound.module.css';

export function NotFound() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('notFound.documentTitle'),
    description: t('notFound.documentDescription'),
  });

  return (
    <Container>
      <div className={styles.wrap}>
        <p className="u-eyebrow">{t('notFound.code')}</p>
        <h1 className={`${styles.code} u-gold-text`}>{t('notFound.title')}</h1>
        <MeanderRule short />
        <p className={styles.message}>{t('notFound.message')}</p>
        <Button to="/games">{t('notFound.cta')}</Button>
      </div>
    </Container>
  );
}
