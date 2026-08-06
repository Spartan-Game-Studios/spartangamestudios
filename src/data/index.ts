import { games } from './games';
import { devlog } from './devlog';
import type { DevlogPost, Game, GameStatus, Storefront } from './types';

export * from './types';
export { games } from './games';
export { devlog } from './devlog';
export { studio, ownershipPledge } from './studio';

const STATUS_ORDER: Record<GameStatus, number> = {
  released: 0,
  'early-access': 1,
  'in-development': 2,
  concept: 3,
};

export const STATUS_LABELS: Record<GameStatus, string> = {
  released: 'Out now',
  'early-access': 'Early access',
  'in-development': 'In development',
  concept: 'In concept',
};

export const STORE_LABELS: Record<Storefront, string> = {
  steam: 'Steam',
  itch: 'itch.io',
  epic: 'Epic Games Store',
  gog: 'GOG',
  ios: 'App Store',
  android: 'Google Play',
  web: 'Play in browser',
  switch: 'Nintendo Switch',
  playstation: 'PlayStation',
  xbox: 'Xbox',
};

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

export function formatDate(iso: string): string {
  // Parsed as UTC noon so a date never slips a day across time zones.
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
