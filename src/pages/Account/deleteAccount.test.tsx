import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/i18n';
import { AuthProvider } from '@/auth/AuthContext';
import { DeleteAccount } from './DeleteAccount';

const STORAGE_KEY = 'sgs.session';

function renderPage() {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/delete-account']}>
          <Routes>
            <Route path="/delete-account" element={<DeleteAccount />} />
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

describe('account deletion page', () => {
  // Google Play fetches this URL without a session. If it needed sign-in to be
  // read, the listing would be rejected.
  it('is readable signed out, and still explains what deletion does', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 1, name: /delete your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /what is deleted/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /what is kept/i })).toBeInTheDocument();
    // No delete control is offered to someone who is not signed in.
    expect(screen.queryByRole('button', { name: /delete my account/i })).not.toBeInTheDocument();
  });

  it('offers a route for people who have lost access to the account', () => {
    renderPage();
    const mailto = screen.getByRole('link', { name: /@/ });
    expect(mailto.getAttribute('href')).toMatch(/^mailto:/);
  });

  it('will not delete until the confirmation word is typed exactly', async () => {
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
    const real = globalThis.fetch.bind(globalThis);
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((input: unknown, init?: RequestInit) => {
        const url = String(input);
        if (!url.includes('/nakama/')) return real(input as RequestInfo, init);
        calls.push(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ payload: '{"deleted":true}' }),
        });
      }),
    );

    const user = userEvent.setup();
    renderPage();

    const button = await screen.findByRole('button', { name: /delete my account/i });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText(/type delete to confirm/i), 'delete me');
    expect(button).toBeDisabled();
    expect(calls.filter((u) => u.includes('delete_account'))).toHaveLength(0);

    await user.clear(screen.getByLabelText(/type delete to confirm/i));
    await user.type(screen.getByLabelText(/type delete to confirm/i), 'DELETE');
    expect(button).toBeEnabled();

    await user.click(button);
    expect(await screen.findByRole('heading', { name: /has been deleted/i })).toBeInTheDocument();
    expect(calls.filter((u) => u.includes('delete_account'))).toHaveLength(1);
    // The local session must not survive an account that no longer exists.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
