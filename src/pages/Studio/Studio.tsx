import { useCallback, useEffect, useState } from 'react';
import { Container } from '@/components/Container/Container';
import { useAuth } from '@/auth/useAuth';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import {
  listChannels,
  listPosts,
  studioApiConfigured,
  StudioApiError,
  type Channel,
  type StudioPost,
} from '@/studio/api';
import { Composer } from './Composer';
import { PostCard } from './PostCard';
import page from '@/pages/shared/page.module.css';
import styles from './Studio.module.css';

type Phase = 'loading' | 'ok' | 'forbidden' | 'unconfigured' | 'error';

/**
 * The publishing-studio dashboard. Sits behind RequireAuth, but staff membership
 * is the server's call — so the page authorizes by *calling the API*: a 403 means
 * "signed in, not studio staff", which we show rather than leaking a staff list
 * into the bundle.
 */
export function Studio() {
  const { session } = useAuth();
  const token = session?.token ?? '';

  const [phase, setPhase] = useState<Phase>('loading');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<StudioPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useDocumentMeta({
    title: 'Publishing Studio',
    description: 'Review and publish studio content.',
  });

  const load = useCallback(async () => {
    if (!studioApiConfigured()) {
      setPhase('unconfigured');
      return;
    }
    if (!token) return;
    try {
      const [ch, ps] = await Promise.all([listChannels(token), listPosts(token)]);
      setChannels(ch);
      setPosts(ps);
      setPhase('ok');
    } catch (e) {
      if (e instanceof StudioApiError && e.status === 403) {
        setPhase('forbidden');
      } else {
        setError(e instanceof Error ? e.message : 'could not load');
        setPhase('error');
      }
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshPosts = useCallback(() => {
    if (!token) return;
    void listPosts(token)
      .then(setPosts)
      .catch(() => {});
  }, [token]);

  const onChanged = useCallback((updated: StudioPost) => {
    setPosts((all) => all.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  return (
    <div className={page.page}>
      <Container>
        <header className={page.header}>
          <h1 className={page.title}>Publishing Studio</h1>
          <p className={page.lede}>
            Draft content, review it, and publish out to every channel at once.
          </p>
        </header>

        {phase === 'loading' ? <p className={styles.muted}>Loading…</p> : null}

        {phase === 'unconfigured' ? (
          <p className={styles.notice}>
            The studio backend isn’t configured for this build (no VITE_PUBLISHER_API_URL).
          </p>
        ) : null}

        {phase === 'forbidden' ? (
          <p className={styles.notice}>
            You’re signed in, but this account isn’t on the studio staff list.
          </p>
        ) : null}

        {phase === 'error' ? (
          <p className={styles.error}>
            Couldn’t reach the studio backend{error ? `: ${error}` : ''}.
          </p>
        ) : null}

        {phase === 'ok' ? (
          <div className={styles.layout}>
            <div>
              <h2 className={page.sectionTitle}>New post</h2>
              <Composer token={token} channels={channels} onCreated={refreshPosts} />
            </div>
            <div>
              <h2 className={page.sectionTitle}>Review queue</h2>
              {posts.length === 0 ? (
                <p className={styles.muted}>No posts yet. Compose one to get started.</p>
              ) : (
                <div className={styles.queue}>
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} token={token} onChanged={onChanged} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
