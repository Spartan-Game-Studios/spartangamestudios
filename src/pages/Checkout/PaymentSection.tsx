import { useMemo } from 'react';
import { loadStripe, type Stripe, type Appearance, type CustomFontSource } from '@stripe/stripe-js';
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

/**
 * Match the card field to the studio's dark/gold theme + body font (Barlow).
 * The `.Input` rule mirrors our own inputs exactly: pure-black fill, the
 * --color-border-strong (#3a3423) hairline at --radius-sm (2px), and the
 * --color-accent gold (#c9a24f) on focus. Keep these in sync with the
 * `.input` rule in Checkout.module.css.
 */
const appearance: Appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#c9a24f',
    colorBackground: '#000000',
    colorText: '#e8e6e1',
    colorTextSecondary: '#9a938a',
    fontFamily: "'Barlow', system-ui, sans-serif",
    borderRadius: '2px',
  },
  rules: {
    '.Input': {
      border: '1px solid #3a3423',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #c9a24f',
      boxShadow: 'none',
      outline: 'none',
    },
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
function barlowFonts(): CustomFontSource[] {
  if (typeof window === 'undefined') return [];
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
