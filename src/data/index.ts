import { games } from './games';
import { devlog } from './devlog';
import { merch } from './merch';
import type { DevlogPost, Game, GameStatus, MerchProduct, Storefront } from './types';

export * from './types';
export { games } from './games';
export { devlog } from './devlog';
export { merch } from './merch';
export { studio, ownershipPledge } from './studio';

const STATUS_ORDER: Record<GameStatus, number> = {
  released: 0,
  'early-access': 1,
  'in-development': 2,
  concept: 3,
};

/**
 * Status and storefront names are UI chrome, so their display text lives in
 * the locale files under `status.*` and `stores.*`. These helpers exist only
 * so callers build the key rather than hand-concatenating it.
 */
export function statusKey(status: GameStatus): `status.${GameStatus}` {
  return `status.${status}`;
}

export function storeKey(store: Storefront): `stores.${Storefront}` {
  return `stores.${store}`;
}

/** Everything shown in indexes: public only, most-shipped first. */
export function listedGames(): Game[] {
  return games
    .filter((game) => game.visibility === 'public')
    .sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.title.localeCompare(b.title),
    );
}

/** Resolves unlisted games too — a direct link is meant to work. */
export function getGame(slug: string): Game | undefined {
  return games.find((game) => game.slug === slug);
}

export function listedPosts(): DevlogPost[] {
  return devlog
    .filter((post) => post.visibility === 'public')
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): DevlogPost | undefined {
  return devlog.find((post) => post.slug === slug);
}

/** The merch catalogue, available items first (all sold out for now). */
export function listedMerch(): MerchProduct[] {
  return [...merch].sort((a, b) => Number(b.available) - Number(a.available));
}

/** Whether any merch item can currently be bought. */
export function merchIsOpen(): boolean {
  return merch.some((item) => item.available);
}

export function getMerch(slug: string): MerchProduct | undefined {
  return merch.find((item) => item.slug === slug);
}

/** Formats a merch price like "$27.00" in the item's own currency. */
export function formatPrice(amount: number, currency: string, locale = 'en'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatDate(iso: string, locale = 'en'): string {
  // Parsed as UTC noon so a date never slips a day across time zones, and
  // formatted in UTC for the same reason. Month-name order and casing come
  // from Intl, so "6. August 2026" and "6 de agosto de 2026" are free.
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
