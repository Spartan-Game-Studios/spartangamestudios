import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, MemoryRouter, Route, Routes, RouterProvider } from 'react-router-dom';
import i18n from '@/i18n';
import { routes } from '@/routes';
import { AuthProvider } from './AuthContext';
import { Account } from '@/pages/Account/Account';
import { SignIn } from '@/pages/Account/SignIn';

/**
 * These tests drive the real components against a stubbed `fetch`, so the
 * request shape Nakama actually receives is asserted rather than assumed — a
 * wrong query string or a missing Basic header is the most likely way this
 * breaks, and neither shows up in a typecheck.
 */

const STORAGE_KEY = 'sgs.session';

/**
 * Intercepts ONLY Nakama calls.
 *
 * Replacing global fetch outright breaks react-router, which builds a Request
 * of its own on every client-side navigation — the redirect out of /account
 * fails long before any assertion runs. Everything that is not a Nakama URL is
 * therefore delegated to the real implementation.
 */
function interceptNakama(handler: () => unknown) {
  const real = globalThis.fetch.bind(globalThis);
  const calls: [string, RequestInit][] = [];
  const mock = vi.fn((input: unknown, init?: RequestInit) => {
    const url = String(input);
    if (!url.includes('/nakama/')) return real(input as RequestInfo, init);
    calls.push([url, init ?? {}]);
    return Promise.resolve(handler());
  });
  vi.stubGlobal('fetch', mock);
  return calls;
}

/** A Nakama-shaped JWT. Only the payload is read (never verified) client-side. */
function fakeToken(claims: Record<string, unknown>) {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64({ alg: 'HS256' })}.${b64(claims)}.sig`;
}

function sessionBody(overrides: Record<string, unknown> = {}) {
  return {
    token: fakeToken({
      uid: 'user-1',
      usn: 'ashenvale',
      ema: 'player@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    }),
    refresh_token: 'refresh-abc',
    created: false,
  };
}

/**
 * Renders through the COMPONENT router rather than the data router.
 *
 * `createMemoryRouter` navigates by building a Request, and jsdom's AbortSignal
 * is not the instance undici's Request accepts — so any client-side redirect
 * throws before it lands, which has nothing to do with the code under test.
 * `MemoryRouter` performs the same `<Navigate>` redirect without that path.
 */
function renderRedirectFlow(path: string) {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/account" element={<Account />} />
            <Route path="/signin" element={<SignIn />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </I18nextProvider>,
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </I18nextProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sign in', () => {
  it('posts email credentials to Nakama and stores the session', async () => {
    const calls = interceptNakama(() => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sessionBody()),
    }));

    const user = userEvent.setup();
    renderAt('/signin');

    await user.type(await screen.findByLabelText('Email'), 'player@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-good-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(calls.length).toBeGreaterThan(0));

    const [url, init] = calls[0];
    // create=false on sign-in: a typo in the address must not silently open an
    // account instead of reporting that there isn't one.
    expect(url).toContain('/v2/account/authenticate/email?create=false');
    expect(init.method).toBe('POST');
    expect(
      String(init.headers && (init.headers as Record<string, string>)['authorization']),
    ).toMatch(/^Basic /);
    expect(JSON.parse(typeof init.body === 'string' ? init.body : '{}')).toEqual({
      email: 'player@example.com',
      password: 'a-good-password',
    });

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy());
    const stored = JSON.parse(String(localStorage.getItem(STORAGE_KEY))) as {
      userId: string;
      username: string;
    };
    expect(stored.userId).toBe('user-1');
    expect(stored.username).toBe('ashenvale');
  });

  it('sends create=true only when creating an account', async () => {
    const calls = interceptNakama(() => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sessionBody({ created: true })),
    }));

    const user = userEvent.setup();
    renderAt('/signin');

    await user.click(await screen.findByRole('button', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-good-password');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    expect(calls[0]?.[0]).toContain('create=true');
  });

  it('rejects a short password before making a request', async () => {
    const calls = interceptNakama(() => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sessionBody()),
    }));

    const user = userEvent.setup();
    renderAt('/signin');

    await user.click(await screen.findByRole('button', { name: 'Create account' }));
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
    expect(calls).toHaveLength(0);
  });

  it('reports a rate limit distinctly from bad credentials', async () => {
    interceptNakama(() => ({
      ok: false,
      status: 429,
      // nginx answers a 429 with HTML, so parsing must fail the way it really does.
      json: () => Promise.reject(new Error('nginx returns html')),
    }));

    const user = userEvent.setup();
    renderAt('/signin');

    await user.type(await screen.findByLabelText('Email'), 'player@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-good-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/too many attempts/i);
  });

  it('does not reveal whether an address is registered', async () => {
    interceptNakama(() => ({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: 5, message: 'User account not found.' }),
    }));

    const user = userEvent.setup();
    renderAt('/signin');

    await user.type(await screen.findByLabelText('Email'), 'nobody@example.com');
    await user.type(screen.getByLabelText('Password'), 'a-good-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/do not match an account/i);
    expect(alert).not.toHaveTextContent(/not found/i);
  });
});

describe('session restore', () => {
  it('keeps a stored session that has not expired', async () => {
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
    interceptNakama(() => ({ ok: true, status: 200, json: () => Promise.resolve(sessionBody()) }));

    renderAt('/account');
    expect(await screen.findByText('player@example.com')).toBeInTheDocument();
  });

  it('signs out when the refresh token is rejected', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 't',
        refreshToken: 'expired',
        // Already past the refresh margin, so restore must refresh immediately.
        expiresAt: Date.now() + 1000,
        userId: 'user-1',
        username: 'ashenvale',
        email: 'player@example.com',
        created: false,
      }),
    );
    interceptNakama(() => ({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ code: 16, message: 'Refresh token invalid.' }),
    }));

    renderRedirectFlow('/account');
    // Redirected to sign-in rather than left on a broken account page.
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeNull());
  });
});

describe('header', () => {
  it('offers sign-in when signed out and the account when signed in', async () => {
    interceptNakama(() => ({ ok: true, status: 200, json: () => Promise.resolve(sessionBody()) }));
    const { unmount } = renderAt('/');
    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    unmount();

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
    renderAt('/');
    expect(await screen.findByRole('link', { name: 'ashenvale' })).toBeInTheDocument();
  });
});
