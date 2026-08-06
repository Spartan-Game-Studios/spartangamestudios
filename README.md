# spartangamestudios.com

The studio's owned web hub. It has two jobs:

1. **Store-link directory** — the canonical "where to buy" page. Every game lists
   every shelf it sits on, as they come online.
2. **Content host & funnel** — devlogs (we own the archive and the SEO), the
   press kit at `/press`, media, and eventually a mailing list.

**Release-workflow rule:** on every launch or new store/port, update the game's
landing page and its store-link row here **before announcing**. The site is the
single source of truth the marketing channels then broadcast.

## Stack

pnpm · TypeScript · Vite · React 19 · react-router · CSS Modules · i18next.
ESLint (flat, type-checked) · Prettier · Husky · Vitest + Testing Library.

No Tailwind, no CSS-in-JS. Styling is CSS Modules on top of the design tokens in
`src/styles/tokens.css`.

## Commands

```bash
pnpm install
pnpm dev            # dev server
pnpm build          # typecheck + production build (emits sitemap.xml)
pnpm preview        # serve the production build
pnpm test           # vitest, single run
pnpm test:watch
pnpm check          # typecheck + lint + format:check + test — what CI runs
```

Husky runs `lint-staged` on commit and `typecheck && test` on push.

## Content is data

Every page is a view over `src/data/`. Adding or updating a game means editing
one array, never a component.

- `src/data/games.ts` — the catalogue
- `src/data/devlog.ts` — devlog posts
- `src/data/studio.ts` — studio facts and the ownership pledge
- `src/data/types.ts` — the content model
- `src/data/index.ts` — selectors (`listedGames`, `getGame`, …) and key helpers

English written here is the source of truth and renders in every language
immediately; other locales override it by key. See
[`docs/i18n.md`](docs/i18n.md).

### Adding a game

Append an entry to `games`. The only judgement calls are:

- **`status`** — `concept` (nothing playable), `in-development` (a build exists,
  not for sale), `early-access`, `released`.
- **`visibility`** — `public` appears in every index and in `sitemap.xml`;
  `unlisted` appears in **none** of them but stays reachable by direct link, which
  is what you want for a soft reveal or a press-only page. An unlisted page says
  so on itself so nobody mistakes it for launched.

Tests in `src/data/data.test.ts` enforce unique URL-safe slugs, known
storefronts, `https` store URLs, and that unlisted games never reach an index.

### Launching a game onto a storefront

Add to that game's `stores` array:

```ts
stores: [
  { store: 'steam', url: 'https://store.steampowered.com/app/…' },
  { store: 'itch', url: 'https://….itch.io/…' },
],
```

Order in the file does not matter — the row renders in the canonical order in
`STOREFRONTS`, first link styled as the primary button. Before launch, a
`label: 'Wishlist on Steam'` overrides the default verb. An empty array renders
an honest "not on sale yet" notice rather than a dead button.

## Translations

The site ships in English, Spanish, French, and German. Full guide in
[`docs/i18n.md`](docs/i18n.md) — including the one rule that governs where a
given string lives, and the fact that the non-English copy is machine-assisted
and wants a native-speaker pass before launch.

## Brand

See [`docs/brand.md`](docs/brand.md). Short version: **Cinzel** for display,
**Barlow** / **Barlow Semi Condensed** for body and UI, and a gold-on-black
palette sampled from the logo. Fonts are self-hosted via `@fontsource` — no
third-party CDN request.

## Deploying

Static build, output in `dist/`. Build command `pnpm build`, publish directory
`dist`, Node 22+.

`.github/workflows/deploy.yml` deploys to **GitHub Pages** on every push to
`main`. It runs `pnpm check` before building, so the site is never published
from a red tree, and asserts that `404.html`, `CNAME`, and `sitemap.xml` all
made it into `dist` before uploading.

### One-time setup

1. **Repository → Settings → Pages → Source: GitHub Actions.**
   (Pages on a **private** repo requires GitHub Pro or higher. On a free
   account the repo must be public.)
2. **DNS at the registrar for `spartangamestudios.com`:**

   | Type  | Name  | Value                        |
   | ----- | ----- | ---------------------------- |
   | A     | `@`   | `185.199.108.153`            |
   | A     | `@`   | `185.199.109.153`            |
   | A     | `@`   | `185.199.110.153`            |
   | A     | `@`   | `185.199.111.153`            |
   | AAAA  | `@`   | `2606:50c0:8000::153`        |
   | AAAA  | `@`   | `2606:50c0:8001::153`        |
   | AAAA  | `@`   | `2606:50c0:8002::153`        |
   | AAAA  | `@`   | `2606:50c0:8003::153`        |
   | CNAME | `www` | `atticusofsparta.github.io.` |

3. Settings → Pages → **Custom domain** → `spartangamestudios.com`, then tick
   **Enforce HTTPS** once the certificate is issued (can take up to an hour).

`public/CNAME` is committed so the custom domain survives every deploy —
without it in the artifact, Pages clears the domain setting on publish.

### Client-side routing

Routing is client-side, so **the host must serve the app shell for unknown
paths** or `/games/lantern` 404s on a hard refresh:

- **GitHub Pages** — `plugins/spaFallback.ts` emits `dist/404.html` as a copy
  of `index.html`. Pages serves it for any unmatched path, which reaches the
  client router. A genuinely missing path then renders our own not-found page
  under a real HTTP 404, which is the correct status.
- **Netlify / Cloudflare Pages** — handled by `public/_redirects`, also committed.
- **Vercel** — add a rewrite of `/(.*)` to `/index.html`.
- **nginx** — `try_files $uri $uri/ /index.html;`

`public/.nojekyll` stops Pages from running the artifact through Jekyll, which
would otherwise drop files whose names begin with an underscore.

`sitemap.xml` is generated at build time from the same data the pages render
(`plugins/sitemap.ts`), so it can never list an unlisted game.

## Studio repos

- https://github.com/atticusofsparta/godot-addons — reusable Godot addons + pipeline skills
- https://github.com/atticusofsparta/game-dev-vault — the design canon
- https://github.com/atticusofsparta/game-assets — asset-generation pipeline
