import { describe, expect, it } from 'vitest';
import {
  devlog,
  formatDate,
  games,
  getGame,
  getPost,
  listedGames,
  listedPosts,
  statusKey,
  storeKey,
  STOREFRONTS,
} from './index';
import en from '@/i18n/locales/en.json';

describe('games catalogue', () => {
  it('has unique slugs', () => {
    const slugs = games.map((game) => game.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses url-safe slugs', () => {
    for (const game of games) {
      expect(game.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('gives every game the fields a card and a landing page need', () => {
    for (const game of games) {
      expect(game.title.length).toBeGreaterThan(0);
      expect(game.tagline.length).toBeGreaterThan(0);
      expect(game.pitch.length).toBeGreaterThan(0);
      expect(game.platforms.length).toBeGreaterThan(0);
      expect(en.status[game.status]).toBeTruthy();
    }
  });

  it('only references known storefronts, with absolute urls', () => {
    for (const game of games) {
      for (const link of game.stores) {
        expect(STOREFRONTS).toContain(link.store);
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
  });

  it('lists no store link twice for one game', () => {
    for (const game of games) {
      const stores = game.stores.map((link) => link.store);
      expect(new Set(stores).size).toBe(stores.length);
    }
  });

  it('never surfaces an unlisted game in an index', () => {
    const listed = listedGames().map((game) => game.slug);
    const unlisted = games.filter((g) => g.visibility === 'unlisted').map((g) => g.slug);
    for (const slug of unlisted) {
      expect(listed).not.toContain(slug);
    }
  });

  it('still resolves unlisted games by direct slug', () => {
    const unlisted = games.find((game) => game.visibility === 'unlisted');
    expect(unlisted).toBeDefined();
    expect(getGame(unlisted!.slug)).toBe(unlisted);
  });

  it('sorts shipped games ahead of concepts', () => {
    const order = listedGames().map((game) => game.status);
    const rank = { released: 0, 'early-access': 1, 'in-development': 2, concept: 3 } as const;
    const ranks = order.map((status) => rank[status]);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getGame('not-a-game')).toBeUndefined();
  });
});

describe('translation keys', () => {
  it('has an English label for every storefront', () => {
    for (const store of STOREFRONTS) {
      expect(storeKey(store)).toBe(`stores.${store}`);
      expect(en.stores[store]).toBeTruthy();
    }
  });

  it('has an English label for every status', () => {
    for (const status of Object.keys(en.status) as Array<keyof typeof en.status>) {
      expect(statusKey(status)).toBe(`status.${status}`);
    }
  });
});

describe('devlog', () => {
  it('has unique slugs and ISO dates', () => {
    const slugs = devlog.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const post of devlog) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.body.length).toBeGreaterThan(0);
    }
  });

  it('lists posts newest first', () => {
    const dates = listedPosts().map((post) => post.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('resolves a post by slug', () => {
    const first = devlog[0];
    expect(getPost(first.slug)).toBe(first);
    expect(getPost('nope')).toBeUndefined();
  });

  it('references only real games', () => {
    const slugs = new Set(games.map((game) => game.slug));
    for (const post of devlog) {
      if (post.game) expect(slugs.has(post.game)).toBe(true);
    }
  });
});

describe('formatDate', () => {
  it('formats without slipping a day across time zones', () => {
    expect(formatDate('2026-01-01')).toBe('January 1, 2026');
    expect(formatDate('2026-12-31')).toBe('December 31, 2026');
  });

  it('formats in the active locale', () => {
    expect(formatDate('2026-08-06', 'de')).toBe('6. August 2026');
    expect(formatDate('2026-08-06', 'fr')).toBe('6 août 2026');
    expect(formatDate('2026-08-06', 'es')).toBe('6 de agosto de 2026');
  });

  it('keeps the same calendar day in every locale', () => {
    for (const locale of ['en', 'es', 'fr', 'de']) {
      expect(formatDate('2026-01-01', locale)).toMatch(/\b1\b/);
    }
  });
});
