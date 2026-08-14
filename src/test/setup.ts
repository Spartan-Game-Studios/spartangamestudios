import '@testing-library/jest-dom/vitest';
import { act, cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import i18n from '@/i18n';
import { DEFAULT_LOCALE } from '@/i18n/locales';

// jsdom has no scrollTo; react-router's ScrollRestoration calls it on navigate.
window.scrollTo = vi.fn();

/**
 * Lets a client-side redirect actually complete under jsdom.
 *
 * On every navigation react-router builds `new Request(url, { signal })`.
 * `AbortController` comes from jsdom, `Request` comes from Node's undici, and
 * undici rejects a signal that is not its own instance — so any `<Navigate>`
 * throws "Expected signal to be an instance of AbortSignal" and the redirect
 * silently never lands. It is purely an environment mismatch; the same code
 * works in a browser, where both come from the same realm.
 *
 * The signal is dropped rather than translated. Its only job is aborting a
 * superseded navigation, and nothing in a test outruns its own assertions.
 */
const NativeRequest = globalThis.Request;
class RequestWithoutForeignSignal extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init && init.signal) {
      const { signal: _signal, ...rest } = init;
      super(input, rest);
      return;
    }
    super(input, init);
  }
}
globalThis.Request = RequestWithoutForeignSignal;

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
