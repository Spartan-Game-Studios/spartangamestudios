/**
 * Base URL of the merch backend (the `services/merch` on the box). It holds the
 * Stripe SECRET key and turns a cart into a Stripe PaymentIntent — the static
 * site never sees a secret. Set via `VITE_MERCH_API_URL` at build time; while
 * it's unset the Pay button stays disabled and the shop is browse-only.
 */
// Read lazily (not a module-level const) so a test can stub the env per-case and
// so a late-set build value is always honoured.
function apiBase(): string | undefined {
  const v = import.meta.env.VITE_MERCH_API_URL as string | undefined;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export function checkoutConfigured(): boolean {
  return apiBase() !== undefined;
}

export interface CheckoutPayload {
  items: { slug: string; qty: number }[];
  email?: string;
  promoCode?: string;
  shipping?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  currency: string;
  breakdown: { subtotal: number; discount: number; tax: number; shipping: number; total: number };
  promo?: string;
}

/**
 * Ask the backend to price this cart and create a PaymentIntent, returning the
 * client secret the embedded card widget confirms with. We send slugs +
 * quantities only — the backend is the authority on price (never trust a price
 * from the client). Throws with the backend's error message (e.g. `sold out:…`)
 * so the checkout can surface it.
 */
export async function createPaymentIntent(payload: CheckoutPayload): Promise<PaymentIntentResult> {
  const API = apiBase();
  if (!API) throw new Error('checkout-not-configured');
  const res = await fetch(`${API}/payment-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = `payment-intent-failed-${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body; keep the status-based message
    }
    throw new Error(message);
  }
  return (await res.json()) as PaymentIntentResult;
}
