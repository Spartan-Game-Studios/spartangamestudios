import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMerch } from '@/data';
import { CartContext, CART_STORAGE_KEY, type Cart, type CartLine } from './context';

interface StoredLine {
  slug: string;
  qty: number;
}

/** Read persisted lines, discarding anything malformed. */
function load(): StoredLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is StoredLine =>
          typeof (l as StoredLine)?.slug === 'string' &&
          Number.isFinite((l as StoredLine)?.qty) &&
          (l as StoredLine).qty > 0,
      )
      .map((l) => ({ slug: l.slug, qty: Math.floor(l.qty) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredLine[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage full or unavailable — the cart just won't persist */
    }
  }, [stored]);

  const add = useCallback((slug: string, qty = 1) => {
    setStored((cur) => {
      const existing = cur.find((l) => l.slug === slug);
      if (existing) return cur.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l));
      return [...cur, { slug, qty }];
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setStored((cur) =>
      qty <= 0
        ? cur.filter((l) => l.slug !== slug)
        : cur.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setStored((cur) => cur.filter((l) => l.slug !== slug));
  }, []);

  const clear = useCallback(() => setStored([]), []);

  const value = useMemo<Cart>(() => {
    // Resolve slugs against the live catalogue; silently drop items that have
    // left it (e.g. a product retired since it was added).
    const lines: CartLine[] = stored
      .map((l) => {
        const product = getMerch(l.slug);
        return product ? { product, qty: l.qty, lineTotal: product.price * l.qty } : null;
      })
      .filter((l): l is CartLine => l !== null);
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);
    return {
      lines,
      count,
      subtotal,
      currency: lines[0]?.product.currency ?? null,
      add,
      setQty,
      remove,
      clear,
    };
  }, [stored, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
