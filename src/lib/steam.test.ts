import { describe, expect, it } from 'vitest';
import { readSteamCallback, steamOpenIdUrl } from './nakama';

describe('steam openid', () => {
  it('builds a request Steam will accept', () => {
    const url = new URL(steamOpenIdUrl('/account'));
    expect(url.origin + url.pathname).toBe('https://steamcommunity.com/openid/login');
    const q = url.searchParams;
    expect(q.get('openid.mode')).toBe('checkid_setup');
    // identifier_select: we do not know which Steam account until they pick one.
    expect(q.get('openid.identity')).toContain('identifier_select');
    // Steam rejects a return_to that does not sit beneath the realm.
    expect(q.get('openid.return_to')?.startsWith(q.get('openid.realm') ?? 'x')).toBe(true);
  });

  it('recognises an assertion and ignores anything else', () => {
    const assertion = readSteamCallback(
      '?openid.mode=id_res&openid.claimed_id=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Fid%2F7656119&lang=es',
    );
    expect(assertion?.['openid.mode']).toBe('id_res');
    // Unrelated query params must not be forwarded to the verifier.
    expect(assertion).not.toHaveProperty('lang');

    expect(readSteamCallback('?lang=es')).toBeNull();
    // cancel is what Steam sends when the user backs out; it is not an assertion.
    expect(readSteamCallback('?openid.mode=cancel')).toBeNull();
  });
});

describe('itch.io oauth', () => {
  it('reads the access token out of the fragment', async () => {
    const { readItchCallback } = await import('./nakama');
    expect(readItchCallback('#access_token=abc123&token_type=bearer')).toBe('abc123');
    expect(readItchCallback('access_token=noHash')).toBe('noHash');
    // Nothing to pick up: not an error, just not a callback.
    expect(readItchCallback('')).toBeNull();
    expect(readItchCallback('#state=xyz')).toBeNull();
  });

  it('builds an authorisation request asking only for identity', async () => {
    const { itchAuthUrl } = await import('./nakama');
    const raw = itchAuthUrl('/account');
    // Empty when no client id is configured, which hides the button.
    if (!raw) return;
    const url = new URL(raw);
    expect(url.origin + url.pathname).toBe('https://itch.io/user/oauth');
    expect(url.searchParams.get('response_type')).toBe('token');
    // Identity only — not their games, not their purchases.
    expect(url.searchParams.get('scope')).toBe('profile:me');
  });
});
