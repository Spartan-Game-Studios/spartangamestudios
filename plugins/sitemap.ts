import type { Plugin } from 'vite';
import { games } from '../src/data/games';
import { devlog } from '../src/data/devlog';
import { DEFAULT_LOCALE, LOCALES } from '../src/i18n/locales';

const ORIGIN = 'https://spartangamestudios.com';

const STATIC_ROUTES: Array<{ path: string; priority: string }> = [
  { path: '/', priority: '1.0' },
  { path: '/games', priority: '0.9' },
  { path: '/devlog', priority: '0.7' },
  { path: '/press', priority: '0.6' },
  { path: '/about', priority: '0.5' },
];

/**
 * Emits sitemap.xml at build time from the same data the pages render, so an
 * unlisted game can never leak into it — the visibility flag is the single
 * gate for "is this public".
 */
export function sitemap(): Plugin {
  return {
    name: 'sgs-sitemap',
    apply: 'build',
    generateBundle() {
      const urls: Array<{ loc: string; priority: string; lastmod?: string }> = [
        ...STATIC_ROUTES.map((route) => ({ loc: route.path, priority: route.priority })),
        ...games
          .filter((game) => game.visibility === 'public')
          .map((game) => ({ loc: `/games/${game.slug}`, priority: '0.8' })),
        ...devlog
          .filter((post) => post.visibility === 'public')
          .map((post) => ({ loc: `/devlog/${post.slug}`, priority: '0.6', lastmod: post.date })),
      ];

      const body = urls
        .map((url) => {
          const loc = `${ORIGIN}${url.loc}`;
          const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';

          /*
           * Language is a client-side preference rather than part of the path,
           * so each page has one canonical URL with `?lang=` alternates. If the
           * non-English pages ever need to rank on their own, give each locale
           * its own path prefix and these become real distinct `<loc>`s.
           */
          const alternates = [
            ...LOCALES.map(
              (locale) =>
                `    <xhtml:link rel="alternate" hreflang="${locale.htmlLang}" href="${loc}${
                  locale.code === DEFAULT_LOCALE ? '' : `?lang=${locale.code}`
                }"/>`,
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`,
          ].join('\n');

          return `  <url>\n    <loc>${loc}</loc>${lastmod}\n${alternates}\n    <priority>${url.priority}</priority>\n  </url>`;
        })
        .join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
          `${body}\n</urlset>\n`,
      });
    },
  };
}
