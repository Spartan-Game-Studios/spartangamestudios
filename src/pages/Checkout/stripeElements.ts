import { loadStripe, type Stripe, type Appearance, type CustomFontSource } from '@stripe/stripe-js';
import { stripePublishableKey } from '@/cart/stripe';

// Non-component Stripe glue for the checkout: the shared Stripe.js instance plus
// the Elements appearance and font registration. Kept out of the .tsx files so
// those export only React components (react-refresh/only-export-components).

/**
 * One Stripe.js instance per page load, created lazily so `js.stripe.com` is
 * only fetched once the checkout route mounts — not site-wide. Returns null when
 * no publishable key is configured (the card widget is then a placeholder).
 */
let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe(): Promise<Stripe | null> | null {
  const pk = stripePublishableKey();
  if (!pk) return null;
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
export const stripeAppearance: Appearance = {
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
export function barlowFonts(): CustomFontSource[] {
  if (typeof window === 'undefined') return [];
  const { origin } = window.location;
  return [
    { family: 'Barlow', src: `url(${origin}/fonts/barlow-400.woff2)`, weight: '400' },
    { family: 'Barlow', src: `url(${origin}/fonts/barlow-600.woff2)`, weight: '600' },
  ];
}
