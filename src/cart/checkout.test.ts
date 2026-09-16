import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkoutConfigured, createPaymentIntent } from './checkout';

describe('merch checkout API', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('is unconfigured until VITE_MERCH_API_URL is set', () => {
    vi.stubEnv('VITE_MERCH_API_URL', '');
    expect(checkoutConfigured()).toBe(false);
    vi.stubEnv('VITE_MERCH_API_URL', 'https://api.example');
    expect(checkoutConfigured()).toBe(true);
  });

  it('refuses to call an unconfigured backend', async () => {
    vi.stubEnv('VITE_MERCH_API_URL', '');
    await expect(createPaymentIntent({ items: [{ slug: 'x', qty: 1 }] })).rejects.toThrow(
      /not-configured/,
    );
  });

  it('POSTs the cart to /payment-intent and returns the client secret', async () => {
    vi.stubEnv('VITE_MERCH_API_URL', 'https://api.example');
    const fetchMock = vi.fn((_url: string, _init: { method: string; body: string }) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'cs_test_1', currency: 'usd' }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const payload = { items: [{ slug: 'boothill-wanted-tee', qty: 2 }], promoCode: 'SPARTAN10' };
    const out = await createPaymentIntent(payload);

    expect(out.clientSecret).toBe('cs_test_1');
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe('https://api.example/payment-intent');
    expect(call[1].method).toBe('POST');
    expect(JSON.parse(call[1].body)).toEqual(payload);
  });

  it('surfaces the backend error message (e.g. sold out)', async () => {
    vi.stubEnv('VITE_MERCH_API_URL', 'https://api.example');
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () => Promise.resolve({ error: 'sold out: x' }),
        }),
      ),
    );
    await expect(createPaymentIntent({ items: [{ slug: 'x', qty: 1 }] })).rejects.toThrow(
      /sold out/,
    );
  });
});
