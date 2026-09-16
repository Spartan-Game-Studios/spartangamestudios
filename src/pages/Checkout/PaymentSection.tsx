import { useMemo } from 'react';
import { loadStripe, type Stripe, type Appearance } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { stripePublishableKey } from '@/cart/stripe';
import styles from './Checkout.module.css';

/**
 * One Stripe.js instance per page load, created lazily so `js.stripe.com` is
 * only fetched once the checkout route mounts — not site-wide. loadStripe()
 * injects the script tag the first time it's called.
 */
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(pk: string): Promise<Stripe | null> {
  stripePromise ??= loadStripe(pk);
  return stripePromise;
}

/** Match the card field to the studio's dark/gold theme + body font (Barlow). */
const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#c9a24b',
    colorBackground: '#0a0a0b',
    colorText: '#e8e6e1',
    colorTextSecondary: '#9a938a',
    fontFamily: "'Barlow', system-ui, sans-serif",
    borderRadius: '4px',
  },
};

/**
 * Register the site's body font (Barlow) inside the Stripe iframe so the card
 * fields match the rest of the page rather than falling back to a system sans.
 * `inherit` can't cross the iframe boundary — Stripe has to fetch the font
 * itself, which it does over HTTPS from our own origin (served from
 * /public/fonts, same self-hosted files @fontsource bundles for the site).
 *
 * This resolves in production; during local `vite preview` the HTTPS Stripe
 * iframe can't fetch an http://localhost file, so the card gracefully falls
 * back to the system font there.
 */
function barlowFonts() {
  if (typeof window === 'undefined') return undefined;
  const { origin } = window.location;
  return [
    { family: 'Barlow', src: `url(${origin}/fonts/barlow-400.woff2)`, weight: '400' },
    { family: 'Barlow', src: `url(${origin}/fonts/barlow-600.woff2)`, weight: '600' },
  ];
}

/**
 * The embedded Stripe card widget. Runs in Elements "deferred" mode: it renders
 * from the publishable key + amount/currency alone, with no PaymentIntent yet.
 * The intent (and its client secret) is created by the merch backend only when
 * the customer pays — which is why the Pay button stays disabled until that
 * backend is configured. Until a publishable key is set it's a placeholder.
 */
export function PaymentSection({
  amountCents,
  currency,
}: {
  amountCents: number;
  currency: string;
}) {
  const { t } = useTranslation();
  const pk = stripePublishableKey();
  const stripe = useMemo(() => (pk ? getStripe(pk) : null), [pk]);

  if (!stripe) {
    return (
      <div className={styles.cardSlot} aria-live="polite">
        <p className={styles.cardPlaceholder}>{t('checkout.paymentPlaceholder')}</p>
      </div>
    );
  }

  return (
    <div className={styles.cardMount}>
      <Elements
        stripe={stripe}
        options={{
          mode: 'payment',
          amount: amountCents,
          currency: currency.toLowerCase(),
          appearance,
          fonts: barlowFonts(),
        }}
      >
        <PaymentElement options={{ layout: 'tabs' }} />
      </Elements>
    </div>
  );
}
