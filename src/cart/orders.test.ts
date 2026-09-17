import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchOrders, merchApiConfigured } from './orders';

describe('merch orders API', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns [] when no backend is configured', async () => {
    vi.stubEnv('VITE_MERCH_API_URL', '');
    expect(merchApiConfigured()).toBe(false);
    expect(await fetchOrders('tok')).toEqual([]);
  });

  it('GETs /orders with the Nakama token as a Bearer credential', async () => {
    vi.stubEnv('VITE_MERCH_API_URL', 'https://api.example');
    const fetchMock = vi.fn((_url: string, _init: { headers: Record<string, string> }) =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ orders: [{ id: 'ord_1' }] }) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const out = await fetchOrders('tok-123');
    expect(out).toHaveLength(1);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe('https://api.example/orders');
    expect(call[1].headers.Authorization).toBe('Bearer tok-123');
  });
});
