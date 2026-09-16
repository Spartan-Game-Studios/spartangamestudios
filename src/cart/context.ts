import { createContext } from 'react';
import type { MerchProduct } from '@/data';

export const CART_STORAGE_KEY = 'sgs-cart';

export interface CartLine {
  product: MerchProduct;
  qty: number;
  /** price × qty, in the product's currency. */
  lineTotal: number;
}

export interface Cart {
  lines: CartLine[];
  /** Total item count across all lines. */
  count: number;
  /** Sum of line totals (all items share one currency in practice). */
  subtotal: number;
  currency: string | null;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const CartContext = createContext<Cart | null>(null);
