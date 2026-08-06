import '@testing-library/jest-dom/vitest';
import { act, cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import i18n from '@/i18n';
import { DEFAULT_LOCALE } from '@/i18n/locales';

// jsdom has no scrollTo; react-router's ScrollRestoration calls it on navigate.
window.scrollTo = vi.fn();

afterEach(async () => {
  cleanup();
  // A test that switches language must not leak into the next one. Wrapped in
  // act because changeLanguage re-renders anything still subscribed.
  if (i18n.resolvedLanguage !== DEFAULT_LOCALE) {
    await act(async () => {
      await i18n.changeLanguage(DEFAULT_LOCALE);
    });
  }
});
