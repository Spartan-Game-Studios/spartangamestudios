// Client for the merch backend's authenticated /orders endpoint — what the
// account page reads to show a signed-in buyer their orders + live tracking.
// Kept separate from checkout.ts so the two features don't collide.

// Read the API base lazily (see checkout.ts for why).
function apiBase(): string | undefined {
  const v = import.meta.env.VITE_MERCH_API_URL as string | undefined;
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export function merchApiConfigured(): boolean {
  return apiBase() !== undefined;
}

export interface TrackingEvent {
  status: string;
  description: string;
  /** epoch ms */
  at: number;
  location?: { label: string; lat: number; lon: number };
}

export interface Tracking {
  status: string;
  carrier?: string;
  number?: string;
  url?: string;
  events: TrackingEvent[];
}

export interface MerchOrderItem {
  slug: string;
  name: string;
  qty: number;
  /** minor units (cents) */
  unitPrice: number;
  lineTotal: number;
}

export interface MerchOrder {
  id: string;
  email: string;
  items: MerchOrderItem[];
  /** minor units (cents) */
  amount: number;
  currency: string;
  shipping: {
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  } | null;
  status: string;
  provider: string | null;
  providerOrderId: string | null;
  created_at: number;
  updated_at: number;
  tracking: Tracking | null;
}

/**
 * Fetch the signed-in user's orders. The Nakama session token authenticates the
 * caller; the backend returns only orders matching that account's verified email.
 * Returns [] when the backend isn't configured (shop not live yet).
 */
export async function fetchOrders(token: string): Promise<MerchOrder[]> {
  const API = apiBase();
  if (!API || !token) return [];
  const res = await fetch(`${API}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`orders-failed-${res.status}`);
  const data = (await res.json()) as { orders?: MerchOrder[] };
  return data.orders ?? [];
}
