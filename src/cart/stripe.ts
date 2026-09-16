/**
 * Stripe publishable key for the embedded card widget (Stripe Elements). Unlike
 * the secret key — which lives only on the merch backend and turns a cart into a
 * PaymentIntent — the publishable key is safe in the browser bundle. It's set via
 * `VITE_STRIPE_PUBLISHABLE_KEY` at build time; while it's unset the payment
 * section shows a placeholder and the Pay button stays disabled, which is the
 * current state until we're handed a `pk_test_…` key and the backend is up.
 *
 * Only ever a `pk_…` value belongs here. A secret (`sk_…`) key in the frontend
 * would be world-readable in the static site source — never put one here.
 */
const KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export function stripePublishableKey(): string | undefined {
  return KEY && KEY.startsWith('pk_') ? KEY : undefined;
}

export function stripeConfigured(): boolean {
  return stripePublishableKey() !== undefined;
}
