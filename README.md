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

pnpm · TypeScript · Vite · React 19 · react-router · CSS Modules.
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
- `src/data/index.ts` — selectors (`listedGames`, `getGame`, …) and labels

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

## Brand

See [`docs/brand.md`](docs/brand.md). Short version: **Cinzel** for display,
**Barlow** / **Barlow Semi Condensed** for body and UI, and a gold-on-black
palette sampled from the logo. Fonts are self-hosted via `@fontsource` — no
third-party CDN request.

## Deploying

Static build, output in `dist/`. Build command `pnpm build`, publish directory
`dist`, Node 22+.

Routing is client-side, so **the host must serve `index.html` for unknown paths**
or `/games/lantern` 404s on a hard refresh:

- **Netlify / Cloudflare Pages** — handled by `public/_redirects`, already committed.
- **Vercel** — add a rewrite of `/(.*)` to `/index.html`.
- **GitHub Pages / S3** — set the 404 document to `index.html`.
- **nginx** — `try_files $uri $uri/ /index.html;`

`sitemap.xml` is generated at build time from the same data the pages render
(`plugins/sitemap.ts`), so it can never list an unlisted game.

## Studio repos

- https://github.com/atticusofsparta/godot-addons — reusable Godot addons + pipeline skills
- https://github.com/atticusofsparta/game-dev-vault — the design canon
- https://github.com/atticusofsparta/game-assets — asset-generation pipeline
