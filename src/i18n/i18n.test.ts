import { describe, expect, it } from 'vitest';
import i18n, { resources } from './index';
import { DEFAULT_LOCALE, LOCALE_CODES, LOCALES, isLocaleCode, resolveLocale } from './locales';
import en from './locales/en.json';
import { devlog, games, ownershipPledge } from '@/data';

type Json = Record<string, unknown>;

function bundle(code: string): Json {
  return resources[code as keyof typeof resources].translation;
}

/** Every leaf path in a nested object, e.g. `press.title`. */
function leafKeys(obj: Json, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? leafKeys(value as Json, path)
      : [path];
  });
}

function flatten(obj: Json, prefix = ''): Json {
  return Object.entries(obj).reduce<Json>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flatten(value as Json, path));
    } else {
      acc[path] = value;
    }
    return acc;
  }, {});
}

/** Placeholders like `{{title}}` — these must survive translation intact. */
function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
}

const OTHER_LOCALES = LOCALE_CODES.filter((code) => code !== DEFAULT_LOCALE);
const EN_KEYS = leafKeys(bundle(DEFAULT_LOCALE));
const EN_FLAT = flatten(bundle(DEFAULT_LOCALE));
const CONTENT_NAMESPACE = /^(catalogue|posts|studio|pledge)\./;

describe('locale registry', () => {
  it('has a resource bundle for every declared locale, and no orphans', () => {
    expect(Object.keys(resources).sort()).toEqual([...LOCALE_CODES].sort());
  });

  it('declares English as the default', () => {
    expect(LOCALE_CODES).toContain(DEFAULT_LOCALE);
    expect(i18n.options.fallbackLng).toEqual([DEFAULT_LOCALE]);
  });

  it('labels each locale in its own language', () => {
    for (const locale of LOCALES) {
      expect(locale.label.length).toBeGreaterThan(0);
      expect(locale.htmlLang).toBe(locale.code);
    }
  });

  it('resolves regional tags down to the base language', () => {
    expect(resolveLocale('es-419')).toBe('es');
    expect(resolveLocale('fr-CA')).toBe('fr');
    expect(resolveLocale('de-AT')).toBe('de');
    expect(resolveLocale('pt-BR')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale('')).toBe(DEFAULT_LOCALE);
  });

  it('narrows only known codes', () => {
    expect(isLocaleCode('de')).toBe(true);
    expect(isLocaleCode('ja')).toBe(false);
  });
});

describe('UI chrome parity', () => {
  it.each(OTHER_LOCALES)('%s translates every English chrome key', (code) => {
    const localeKeys = new Set(leafKeys(bundle(code)));
    expect(EN_KEYS.filter((key) => !localeKeys.has(key))).toEqual([]);
  });

  it.each(OTHER_LOCALES)('%s has no chrome key that English lacks', (code) => {
    // Content namespaces are additive by design — only chrome must match.
    const stray = Object.keys(flatten(bundle(code)))
      .filter((key) => !CONTENT_NAMESPACE.test(key))
      .filter((key) => !(key in EN_FLAT));
    expect(stray).toEqual([]);
  });

  it.each(OTHER_LOCALES)('%s preserves every interpolation placeholder', (code) => {
    const flat = flatten(bundle(code));
    for (const [key, value] of Object.entries(EN_FLAT)) {
      if (typeof value !== 'string') continue;
      const expected = placeholders(value);
      if (expected.length === 0) continue;
      const translated = flat[key];
      expect(typeof translated, `${code}: ${key}`).toBe('string');
      expect(placeholders(String(translated)), `${code}: ${key}`).toEqual(expected);
    }
  });

  it.each(OTHER_LOCALES)('%s keeps the <mail> tag the Trans component expects', (code) => {
    const value = flatten(bundle(code))['press.permissionKeys'];
    expect(String(value), code).toContain('<mail>{{email}}</mail>');
  });

  it.each(LOCALE_CODES)('%s leaves no string blank', (code) => {
    const blank = Object.entries(flatten(bundle(code)))
      .filter(([, value]) => typeof value === 'string' && value.trim() === '')
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });
});

describe('content translations', () => {
  it.each(OTHER_LOCALES)('%s only names games that exist', (code) => {
    const catalogue = (bundle(code).catalogue ?? {}) as Json;
    const slugs = new Set(games.map((game) => game.slug));
    for (const slug of Object.keys(catalogue)) {
      expect(slugs.has(slug), `${code}: catalogue.${slug}`).toBe(true);
    }
  });

  it.each(OTHER_LOCALES)('%s only names devlog posts that exist', (code) => {
    const posts = (bundle(code).posts ?? {}) as Json;
    const slugs = new Set(devlog.map((post) => post.slug));
    for (const slug of Object.keys(posts)) {
      expect(slugs.has(slug), `${code}: posts.${slug}`).toBe(true);
    }
  });

  it.each(OTHER_LOCALES)('%s keeps translated feature lists the same length', (code) => {
    const catalogue = (bundle(code).catalogue ?? {}) as Record<string, { features?: string[] }>;
    for (const [slug, entry] of Object.entries(catalogue)) {
      if (!entry.features) continue;
      const game = games.find((candidate) => candidate.slug === slug)!;
      expect(entry.features.length, `${code}: ${slug}`).toBe(game.features?.length ?? 0);
    }
  });

  it.each(OTHER_LOCALES)('%s keeps translated post bodies paragraph-for-paragraph', (code) => {
    const posts = (bundle(code).posts ?? {}) as Record<string, { body?: string[] }>;
    for (const [slug, entry] of Object.entries(posts)) {
      if (!entry.body) continue;
      const post = devlog.find((candidate) => candidate.slug === slug)!;
      expect(entry.body.length, `${code}: ${slug}`).toBe(post.body.length);
    }
  });

  it.each(OTHER_LOCALES)('%s translates every ownership-pledge point', (code) => {
    const pledge = (bundle(code).pledge ?? {}) as Json;
    const points = (pledge.points ?? {}) as Json;
    for (const point of ownershipPledge.points) {
      expect(Object.keys(points), `${code}: ${point.id}`).toContain(point.id);
    }
  });

  it('ships English content inline in src/data, not in en.json', () => {
    // The rule this codebase follows: data-layer English is the source, and
    // locale files only ever override it.
    const enBundle = bundle(DEFAULT_LOCALE);
    expect(enBundle.catalogue).toBeUndefined();
    expect(enBundle.posts).toBeUndefined();
    expect(en.games.title).toBe('Games');
  });
});
