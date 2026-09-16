import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { useCart } from '@/cart/useCart';
import { stripeConfigured } from '@/cart/stripe';
import { checkoutConfigured } from '@/cart/checkout';
import { formatPrice } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Checkout.module.css';
import { PaymentSection } from './PaymentSection';

/** ISO 3166-1 alpha-2 codes we ship to; names are localised at render via
 *  Intl.DisplayNames so we don't hand-translate a country list four times.
 *  Yoycol print/ship coverage will trim or extend this later. */
const COUNTRY_CODES = [
  'MX',
  'US',
  'CA',
  'GB',
  'IE',
  'FR',
  'DE',
  'ES',
  'IT',
  'PT',
  'NL',
  'BE',
  'CH',
  'AT',
  'SE',
  'NO',
  'DK',
  'FI',
  'PL',
  'CZ',
  'AU',
  'NZ',
  'JP',
  'BR',
  'AR',
  'CL',
  'CO',
];

type Form = {
  email: string;
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

const EMPTY: Form = {
  email: '',
  fullName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postal: '',
  country: 'MX',
};

export function Checkout() {
  const { t, i18n } = useTranslation();
  const { lines, subtotal, currency, count } = useCart();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  const [form, setForm] = useState<Form>(EMPTY);
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  useDocumentMeta({
    title: t('checkout.title'),
    description: t('checkout.title'),
    path: '/checkout',
  });

  // Localised, alphabetised country names. Falls back to the raw code if the
  // runtime lacks Intl.DisplayNames (very old engines).
  const countries = useMemo(() => {
    let name: (code: string) => string;
    try {
      const dn = new Intl.DisplayNames([locale], { type: 'region' });
      name = (code) => dn.of(code) ?? code;
    } catch {
      name = (code) => code;
    }
    return COUNTRY_CODES.map((code) => ({ code, label: name(code) })).sort((a, b) =>
      a.label.localeCompare(b.label, locale),
    );
  }, [locale]);

  // Nothing to check out — send them back to the cart rather than showing an
  // empty form. (With everything sold out this is the normal public state.)
  if (count === 0) return <Navigate to="/cart" replace />;

  const set = (key: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    // Promo validation is the backend's job (it checks the code against Stripe
    // coupons and re-prices the PaymentIntent). Until that's live we just
    // acknowledge the entry rather than pretend to discount anything.
    setPromoMsg(promo.trim() ? 'checkout.promoSoon' : null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // No-op until Stripe is wired: the Pay button is disabled while the shop is
    // stubbed, so this guards against a stray Enter keypress.
  };

  const money = (n: number) => (currency ? formatPrice(n, currency, locale) : '—');
  // The card widget renders on the publishable key alone; paying additionally
  // needs the backend (it mints the PaymentIntent), so the button waits on both.
  const ready = stripeConfigured() && checkoutConfigured();

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <h1 className={`${page.title} u-gold-text`}>{t('checkout.title')}</h1>
          <Link to="/cart" className={styles.back}>
            &larr; {t('checkout.backToCart')}
          </Link>
        </header>

        <div className={styles.layout}>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.contactTitle')}</h2>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-email">
                  {t('checkout.email')}
                </label>
                <input
                  id="co-email"
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.shippingTitle')}</h2>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-name">
                  {t('checkout.fullName')}
                </label>
                <input
                  id="co-name"
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-addr1">
                  {t('checkout.address1')}
                </label>
                <input
                  id="co-addr1"
                  className={styles.input}
                  type="text"
                  autoComplete="address-line1"
                  value={form.address1}
                  onChange={set('address1')}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="co-addr2">
                  {t('checkout.address2')}
                </label>
                <input
                  id="co-addr2"
                  className={styles.input}
                  type="text"
                  autoComplete="address-line2"
                  value={form.address2}
                  onChange={set('address2')}
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-city">
                    {t('checkout.city')}
                  </label>
                  <input
                    id="co-city"
                    className={styles.input}
                    type="text"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={set('city')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-state">
                    {t('checkout.state')}
                  </label>
                  <input
                    id="co-state"
                    className={styles.input}
                    type="text"
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={set('state')}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-postal">
                    {t('checkout.postal')}
                  </label>
                  <input
                    id="co-postal"
                    className={styles.input}
                    type="text"
                    autoComplete="postal-code"
                    value={form.postal}
                    onChange={set('postal')}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="co-country">
                    {t('checkout.country')}
                  </label>
                  <select
                    id="co-country"
                    className={styles.input}
                    autoComplete="country"
                    value={form.country}
                    onChange={set('country')}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.promoTitle')}</h2>
              <div className={styles.promoRow}>
                <input
                  className={styles.input}
                  type="text"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder={t('checkout.promoPlaceholder')}
                  aria-label={t('checkout.promoTitle')}
                />
                <button type="button" className={styles.promoApply} onClick={onApplyPromo}>
                  {t('checkout.promoApply')}
                </button>
              </div>
              {promoMsg ? <p className={styles.note}>{t(promoMsg)}</p> : null}
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('checkout.paymentTitle')}</h2>
              <PaymentSection
                amountCents={Math.round(subtotal * 100)}
                currency={currency || 'usd'}
              />
              <p className={styles.note}>{t('checkout.paymentNote')}</p>
            </section>
          </form>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>{t('checkout.summaryTitle')}</h2>
            <ul className={styles.summaryLines}>
              {lines.map(({ product, qty, lineTotal }) => (
                <li key={product.slug} className={styles.summaryLine}>
                  <span className={styles.summaryName}>
                    {product.name}
                    <span className={styles.summaryQty}>×{qty}</span>
                  </span>
                  <span className={styles.summaryValue}>{money(lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className={styles.totals}>
              <div className={styles.totalRow}>
                <dt>{t('checkout.subtotal')}</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>{t('checkout.shipping')}</dt>
                <dd className={styles.pending}>{t('checkout.calculated')}</dd>
              </div>
              <div className={styles.totalRow}>
                <dt>{t('checkout.tax')}</dt>
                <dd className={styles.pending}>{t('checkout.calculated')}</dd>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <dt>{t('checkout.total')}</dt>
                <dd>{money(subtotal)}</dd>
              </div>
            </dl>

            <button type="button" className={styles.pay} disabled={!ready} onClick={onSubmit}>
              {t('checkout.pay', { amount: money(subtotal) })}
            </button>
            {!ready ? <p className={styles.note}>{t('checkout.notReady')}</p> : null}
          </aside>
        </div>
      </Container>
    </div>
  );
}
