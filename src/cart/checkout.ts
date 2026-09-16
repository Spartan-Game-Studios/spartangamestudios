import type { CartLine } from './context';

/**
 * Base URL of the merch backend (the `services/merch` on the box). It holds the
 * Stripe + Yoycol secrets and turns a cart into a Stripe Checkout Session. Set
 * via `VITE_MERCH_API_URL` at build time; while it's unset the checkout button
 * stays disabled and the shop is browse-only — which is the current state.
 */
const API = import.meta.env.VITE_MERCH_API_URL as string | undefined;

export function checkoutConfigured(): boolean {
  return typeof API === 'string' && API.length > 0;
}

/**
 * Ask the backend to create a Stripe Checkout Session for this cart, then send
 * the browser to Stripe's hosted payment page. We pass slugs + quantities only;
 * the backend is the authority on price (never trust a price from the client).
 */
export async function startCheckout(lines: CartLine[]): Promise<void> {
  if (!checkoutConfigured()) throw new Error('checkout-not-configured');
  const res = await fetch(`${API}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })) }),
  });
  if (!res.ok) throw new Error(`checkout-failed-${res.status}`);
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error('checkout-no-url');
  window.location.href = data.url;
}
