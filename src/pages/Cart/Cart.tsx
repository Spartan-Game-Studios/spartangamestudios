import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { useCart } from '@/cart/useCart';
import { formatPrice, merchCover } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Cart.module.css';

export function Cart() {
  const { t, i18n } = useTranslation();
  const { lines, subtotal, currency, setQty, remove } = useCart();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  useDocumentMeta({ title: t('cart.title'), description: t('cart.title'), path: '/cart' });

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <h1 className={`${page.title} u-gold-text`}>{t('cart.title')}</h1>
        </header>

        {lines.length === 0 ? (
          <p className={styles.empty}>
            <span>{t('cart.empty')}</span>
            <Link to="/merch" className="u-gold-text">
              {t('cart.browse')}
            </Link>
          </p>
        ) : (
          <div className={styles.layout}>
            <ul className={styles.lines}>
              {lines.map(({ product, qty, lineTotal }) => (
                <li key={product.slug} className={styles.line}>
                  {merchCover(product) ? (
                    <img
                      className={styles.thumb}
                      src={merchCover(product)!.src}
                      alt={merchCover(product)!.alt}
                    />
                  ) : (
                    <div
                      className={`${styles.thumb} ${styles.thumbPlaceholder}`}
                      aria-hidden="true"
                    >
                      {product.name.charAt(0)}
                    </div>
                  )}
                  <div className={styles.lineBody}>
                    <Link to={`/merch/${product.slug}`} className={styles.lineName}>
                      {product.name}
                    </Link>
                    <span className={styles.lineUnit}>
                      {formatPrice(product.price, product.currency, locale)}
                    </span>
                  </div>
                  <div className={styles.qty}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQty(product.slug, qty - 1)}
                      aria-label={t('cart.decrease')}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue} aria-label={t('cart.quantity')}>
                      {qty}
                    </span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => setQty(product.slug, qty + 1)}
                      aria-label={t('cart.increase')}
                    >
                      +
                    </button>
                  </div>
                  <span className={styles.lineTotal}>
                    {formatPrice(lineTotal, product.currency, locale)}
                  </span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => remove(product.slug)}
                    aria-label={t('cart.remove')}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <aside className={styles.summary}>
              <div className={styles.subtotalRow}>
                <span>{t('cart.subtotal')}</span>
                <span className={styles.subtotalValue}>
                  {currency ? formatPrice(subtotal, currency, locale) : '—'}
                </span>
              </div>
              <p className={styles.taxNote}>{t('cart.taxNote')}</p>
              <Link to="/checkout" className={styles.checkout}>
                {t('cart.checkout')}
              </Link>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
