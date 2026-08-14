import { useCallback, useEffect, useState } from 'react';
import { getAccount, type Account } from '@/lib/nakama';
import { useAuth } from './useAuth';

/**
 * The server-side account for the current session.
 *
 * Kept out of AuthContext deliberately. The session is what every page needs to
 * know (are we signed in?); the profile is what one page needs to render. Fetching
 * it in the provider would put a request on every page load for data only the
 * account page uses.
 */
export function useAccount(): {
  account: Account | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
} {
  const { session, signOut } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!session) {
      setAccount(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getAccount(session.token)
      .then((a) => {
        if (!cancelled) setAccount(a);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        // A 401 here means the token died between refreshes. Signing out is
        // more honest than showing an account page that cannot load.
        if (
          typeof e === 'object' &&
          e &&
          'status' in e &&
          (e as { status: number }).status === 401
        ) {
          signOut();
        } else {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, signOut, nonce]);

  return { account, loading, error, reload };
}
