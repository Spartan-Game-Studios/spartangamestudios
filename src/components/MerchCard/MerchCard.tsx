import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice, type MerchProduct } from '@/data';
import { useCart } from '@/cart/useCart';
import { MerchGallery } from '@/components/MerchGallery/MerchGallery';
import styles from './MerchCard.module.css';

export function MerchCard({ product }: { product: MerchProduct }) {
  const { t, i18n } = useTranslation();
  const { add } = useCart();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  return (
    <article className={`${styles.card} ${product.available ? '' : styles.unavailable}`}>
      <div className={styles.media}>
        {product.images?.length ? (
          <MerchGallery
            images={product.images}
            label={product.name}
            variant="card"
            dimmed={!product.available}
          />
        ) : (
          <div className={`${styles.art} ${styles.placeholder}`} aria-hidden="true">
            <span className={styles.placeholderMark}>{product.name.charAt(0)}</span>
          </div>
        )}
        {!product.available ? <span className={styles.soldOut}>{t('merch.soldOut')}</span> : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link to={`/merch/${product.slug}`} className={styles.link}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.tagline}>{product.tagline}</p>

        <div className={styles.footer}>
          <span className={styles.price}>
            {formatPrice(product.price, product.currency, locale)}
          </span>
          {product.available ? (
            <button type="button" className={styles.buy} onClick={() => add(product.slug)}>
              {t('merch.addToCart')}
            </button>
          ) : (
            <span className={styles.unavailableTag}>{t('merch.unavailable')}</span>
          )}
        </div>
      </div>
    </article>
  );
}
