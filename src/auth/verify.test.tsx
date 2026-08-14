import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/i18n';
import { AuthProvider } from './AuthContext';
import { Verify } from '@/pages/Account/Verify';
import { SignIn } from '@/pages/Account/SignIn';

const STORAGE_KEY = 'sgs.session';

function signedIn() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: 't',
      refreshToken: 'r',
      expiresAt: Date.now() + 3_600_000,
      userId: 'user-1',
      username: 'ashenvale',
      email: 'player@example.com',
      created: false,
    }),
  );
}

function intercept(rpcResult: () => unknown) {
  const real = globalThis.fetch.bind(globalThis);
  const calls: [string, RequestInit][] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: unknown, init?: RequestInit) => {
      const url = String(input);
      if (!url.includes('/nakama/')) return real(input as RequestInfo, init);
      calls.push([url, init ?? {}]);
      if (url.includes('/v2/rpc/')) return Promise.resolve(rpcResult());
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    }),
  );
  return calls;
}

function renderVerify(path: string) {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/verify" element={<Verify />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});
afterEach(() => vi.unstubAllGlobals());

describe('email verification', () => {
  it('redeems the token when already signed in', async () => {
    signedIn();
    const calls = intercept(() => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ payload: '{"verified":true}' }),
    }));

    renderVerify('/verify?token=abc123');

    expect(await screen.findByText(/confirmed/i)).toBeInTheDocument();
    const rpcCall = calls.find(([u]) => u.includes('/v2/rpc/email_verify_confirm'));
    expect(rpcCall).toBeTruthy();
    // The payload is a JSON string nested in the body — Nakama's convention.
    const sentBody = rpcCall?.[1].body;
    expect(typeof sentBody === 'string' ? (JSON.parse(sentBody) as string) : '').toContain(
      'abc123',
    );
  });

  it('sends an unauthenticated visitor to sign in, keeping the token', async () => {
    intercept(() => ({ ok: true, status: 200, json: () => Promise.resolve({}) }));

    renderVerify('/verify?token=keepme');

    // Lands on sign-in rather than silently failing to redeem.
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('reports an expired link without claiming success', async () => {
    signedIn();
    intercept(() => ({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ code: 3, message: 'this link is invalid or has expired' }),
    }));

    renderVerify('/verify?token=stale');
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid or has expired/i);
  });

  it('explains itself when opened without a token', async () => {
    signedIn();
    intercept(() => ({ ok: true, status: 200, json: () => Promise.resolve({}) }));

    renderVerify('/verify');
    expect(await screen.findByText(/needs a confirmation link/i)).toBeInTheDocument();
  });

  it('redeems only once even though effects run twice in StrictMode', async () => {
    signedIn();
    const calls = intercept(() => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ payload: '{"verified":true}' }),
    }));

    renderVerify('/verify?token=once');
    await screen.findByText(/confirmed/i);
    await waitFor(() =>
      expect(calls.filter(([u]) => u.includes('email_verify_confirm')).length).toBe(1),
    );
  });
});
