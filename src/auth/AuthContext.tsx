import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AuthContext, type AuthState } from './context';
import {
  refreshSession,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  type Session,
} from '@/lib/nakama';

/**
 * Session state for the whole site.
 *
 * Storage is localStorage rather than a cookie: the site is static on GitHub
 * Pages and Nakama is on another origin, so there is no request a cookie could
 * usefully ride along on. The trade is that a session is readable by any script
 * that gets onto the page — which is the same exposure the server key already
 * has, and is why nothing sensitive is gated behind this yet.
 *
 * Access tokens last an hour and refresh tokens seven days, so a returning
 * visitor inside a week is signed in silently and one outside it is signed out
 * cleanly rather than left staring at failing requests.
 */

const STORAGE_KEY = 'sgs.session';

/** Refresh this far before expiry, so a click never lands on a dead token. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

function read(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed.refreshToken ? parsed : null;
  } catch {
    return null;
  }
}

function write(session: Session | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing can refuse writes. Staying signed in for this tab only is
    // a better outcome than failing the sign-in.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef<number | undefined>(undefined);

  const apply = useCallback((next: Session | null) => {
    setSession(next);
    write(next);
  }, []);

  const signOut = useCallback(() => {
    window.clearTimeout(timer.current);
    apply(null);
  }, [apply]);

  // Keep the access token fresh while the tab is open. Scheduling one timeout
  // per session (rather than polling) means an idle tab does no work at all.
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!session) return;

    const due = Math.max(session.expiresAt - Date.now() - REFRESH_MARGIN_MS, 0);
    timer.current = window.setTimeout(() => {
      refreshSession(session.refreshToken)
        .then(apply)
        // A refresh token older than seven days is gone for good, and retrying
        // would loop. Signing out is the honest end state.
        .catch(() => apply(null));
    }, due);

    return () => window.clearTimeout(timer.current);
  }, [session, apply]);

  // Restore on first load. A stored token that is already expired is refreshed
  // before anything renders, so the header never flickers signed-in then out.
  useEffect(() => {
    const stored = read();
    if (!stored) {
      setLoading(false);
      return;
    }
    if (stored.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
      setSession(stored);
      setLoading(false);
      return;
    }
    refreshSession(stored.refreshToken)
      .then(apply)
      .catch(() => apply(null))
      .finally(() => setLoading(false));
  }, [apply]);

  // Sign-out in one tab should not leave another tab looking signed in.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      signUp: async (email, password) => apply(await signUpWithEmail(email, password)),
      signIn: async (email, password) => apply(await signInWithEmail(email, password)),
      signInGoogle: async (idToken) => apply(await signInWithGoogle(idToken)),
      signOut,
    }),
    [session, loading, apply, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
