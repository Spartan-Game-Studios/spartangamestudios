import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

/**
 * Emits `404.html` as a byte-for-byte copy of `index.html`.
 *
 * GitHub Pages serves static files only — it has no rewrite rule, so a hard
 * refresh on `/games/lantern` would 404 instead of reaching the client router.
 * Pages serves `404.html` for any unmatched path, so making it the app shell
 * turns that 404 into a normal client-side route resolution.
 *
 * The cost is that a genuinely missing path is served with HTTP 404 while
 * rendering our own not-found page — which is exactly the correct status, and
 * better than the soft-404 that a rewrite rule produces.
 *
 * Built here rather than in the deploy workflow so `pnpm preview` behaves the
 * same as production.
 */
export function spaFallback(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'sgs-spa-fallback',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      const outDir = resolve(config.root, config.build.outDir);
      const index = resolve(outDir, 'index.html');
      if (!existsSync(index)) {
        this.warn('index.html not found; skipped 404.html fallback');
        return;
      }
      copyFileSync(index, resolve(outDir, '404.html'));
    },
  };
}
