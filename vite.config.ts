/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sitemap } from './plugins/sitemap';
import { spaFallback } from './plugins/spaFallback';

export default defineConfig({
  plugins: [react(), sitemap(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    modules: {
      // Readable in devtools, hashed enough to stay collision-free.
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Authentication reads its endpoint from build-time config, and with none
    // set the sign-in form correctly renders itself disabled. The tests need the
    // configured path, and must not depend on what happens to be exported in the
    // shell — CI exports nothing. Fixed dummy values, never real ones.
    env: {
      VITE_NAKAMA_URL: 'https://example.test/nakama',
      VITE_NAKAMA_SERVER_KEY: 'test-server-key',
    },
    css: { modules: { classNameStrategy: 'non-scoped' } },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
});
