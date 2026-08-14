import { useCallback, useEffect, useState } from 'react';
import { follow, listFollowed, unfollow } from '@/lib/nakama';
import { useAuth } from './useAuth';

/**
 * The set of game slugs this user follows.
 *
 * Updates optimistically: a follow toggle that waits for a round trip feels
 * broken, and the failure mode (reverting) is both rare and obvious.
 */
export function useFollowing(userId: string | null): {
  followed: Set<string>;
  loading: boolean;
  toggle: (slug: string) => void;
  busy: string | null;
} {
  const { session } = useAuth();
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !userId) {
      setFollowed(new Set());
      setLoading(false);
      return;
    }
    let cancelled = false;
    listFollowed(session.token, userId)
      .then((slugs) => {
        if (!cancelled) setFollowed(new Set(slugs));
      })
      .catch(() => {
        if (!cancelled) setFollowed(new Set());
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, userId]);

  const toggle = useCallback(
    (slug: string) => {
      if (!session) return;
      const isFollowed = followed.has(slug);
      const next = new Set(followed);
      if (isFollowed) next.delete(slug);
      else next.add(slug);
      setFollowed(next);
      setBusy(slug);

      const action = isFollowed ? unfollow : follow;
      action(session.token, slug)
        .catch(() => {
          // Put it back the way it was; the server is the source of truth.
          setFollowed((current) => {
            const reverted = new Set(current);
            if (isFollowed) reverted.add(slug);
            else reverted.delete(slug);
            return reverted;
          });
        })
        .finally(() => setBusy(null));
    },
    [session, followed],
  );

  return { followed, loading, toggle, busy };
}
