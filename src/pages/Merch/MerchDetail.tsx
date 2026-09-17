import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { getMerch, formatPrice, merchCover } from '@/data';
import { useCart } from '@/cart/useCart';
import { MerchGallery } from '@/components/MerchGallery/MerchGallery';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import { NotFound } from '@/pages/NotFound/NotFound';
import styles from './MerchDetail.module.css';

export function MerchDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getMerch(slug) : undefined;
  if (!product) return <NotFound />;
  return <MerchDetailView key={product.slug} slug={product.slug} />;
}

/** Split so the meta hook only runs for a product that exists. */
function MerchDetailView({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation();
  const { add } = useCart();
  const product = getMerch(slug)!;
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const cover = merchCover(product);

  useDocumentMeta({
    title: product.name,
    description: product.tagline,
    path: `/merch/${slug}`,
    ...(cover ? { image: cover.src } : {}),
  });

  return (
    <article className={styles.wrap}>
      <Container>
        <Link to="/merch" className={styles.back}>
          &larr; {t('merch.backToShop')}
        </Link>

        <div className={styles.layout}>
          <div className={styles.media}>
            {product.images?.length ? (
              <MerchGallery
                images={product.images}
                label={product.name}
                variant="detail"
                dimmed={!product.available}
              />
            ) : (
              <div className={`${styles.art} ${styles.placeholder}`} aria-hidden="true">
                <span className={styles.placeholderMark}>{product.name.charAt(0)}</span>
              </div>
            )}
            {!product.available ? (
              <span className={styles.soldOut}>{t('merch.soldOut')}</span>
            ) : null}
          </div>

          <div className={styles.info}>
            <h1 className={`${styles.title} u-gold-text`}>{product.name}</h1>
            <p className={styles.tagline}>{product.tagline}</p>
            <p className={styles.price}>{formatPrice(product.price, product.currency, locale)}</p>

            {product.available ? (
              <button type="button" className={styles.buy} onClick={() => add(product.slug)}>
                {t('merch.addToCart')}
              </button>
            ) : (
              <div className={styles.soldOutBlock}>
                <p className={styles.soldOutLead}>{t('merch.openingSoonLead')}</p>
                <p>{t('merch.openingSoon')}</p>
                <Link to="/devlog" className="u-gold-text">
                  {t('merch.followTheDrop')}
                </Link>
              </div>
            )}

            {product.description ? (
              <p className={styles.description}>{product.description}</p>
            ) : null}
          </div>
        </div>
      </Container>
    </article>
  );
}
