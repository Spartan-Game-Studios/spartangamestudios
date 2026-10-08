import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { approvePost, publishPost, type StudioPost } from '@/studio/api';
import styles from './Studio.module.css';

const STATUS_CLASS: Record<string, string> = {
  draft: styles.stDraft,
  approved: styles.stApproved,
  scheduled: styles.stApproved,
  publishing: styles.stPublishing,
  published: styles.stPublished,
  failed: styles.stFailed,
};

/** One post in the review queue: its status, targets, and the actions available
 *  from where it is in the flow. */
export function PostCard({
  post,
  token,
  onChanged,
}: {
  post: StudioPost;
  token: string;
  onChanged: (p: StudioPost) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<StudioPost>) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'action failed');
    } finally {
      setBusy(false);
    }
  }

  const canApprove = post.status === 'draft';
  const canPublish =
    post.status === 'draft' || post.status === 'approved' || post.status === 'failed';
  const publishLabel = post.status === 'failed' ? 'Retry publish' : 'Publish';

  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{post.title || '(untitled)'}</h3>
        <span className={`${styles.pill} ${STATUS_CLASS[post.status] ?? ''}`}>{post.status}</span>
      </header>

      {post.body ? <p className={styles.cardBody}>{post.body}</p> : null}

      <ul className={styles.targets}>
        {post.targets.map((t) => (
          <li key={t.channel} className={styles.target}>
            <span className={styles.channelName}>{t.channel}</span>
            <span className={`${styles.pill} ${STATUS_CLASS[t.status] ?? styles.stDraft}`}>
              {t.status}
            </span>
            {t.url ? (
              <a className={styles.viewLink} href={t.url} target="_blank" rel="noopener noreferrer">
                view
              </a>
            ) : null}
            {t.error ? <span className={styles.targetErr}>{t.error}</span> : null}
          </li>
        ))}
      </ul>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        {canApprove ? (
          <Button
            variant="secondary"
            size="small"
            onClick={() => void run(() => approvePost(token, post.id))}
            disabled={busy}
          >
            Approve
          </Button>
        ) : null}
        {canPublish ? (
          <Button
            variant="primary"
            size="small"
            onClick={() => void run(() => publishPost(token, post.id))}
            disabled={busy}
          >
            {busy ? 'Working…' : publishLabel}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
