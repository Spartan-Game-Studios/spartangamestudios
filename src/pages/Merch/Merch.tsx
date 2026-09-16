import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { MeanderRule } from '@/components/MeanderRule/MeanderRule';
import { MerchCard } from '@/components/MerchCard/MerchCard';
import { listedMerch, merchIsOpen, studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Merch.module.css';

export function Merch() {
  const { t } = useTranslation();
  const products = listedMerch();
  const open = merchIsOpen();

  useDocumentMeta({
    title: t('merch.title'),
    description: t('meta.merchDescription', { studio: studio.name }),
    path: '/merch',
  });

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <p className="u-eyebrow">{t('merch.eyebrow')}</p>
          <h1 className={`${page.title} u-gold-text`}>{t('merch.title')}</h1>
          <p className={page.lede}>{t('merch.lede')}</p>
          <MeanderRule />
        </header>

        {/* Until the shop opens, say so plainly rather than let a shelf of
            sold-out cards imply a launch that hasn't happened. */}
        {!open ? (
          <p className={styles.notice}>
            <span className={styles.noticeLead}>{t('merch.openingSoonLead')}</span>
            <span>{t('merch.openingSoon')}</span>
            <Link to="/devlog" className="u-gold-text">
              {t('merch.followTheDrop')}
            </Link>
          </p>
        ) : null}

        <div className={page.grid}>
          {products.map((product) => (
            <MerchCard key={product.slug} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
