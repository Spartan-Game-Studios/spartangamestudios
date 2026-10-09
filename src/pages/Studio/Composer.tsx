import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { CHANNEL_LIMITS, createPost, type Channel, type NewPostInput } from '@/studio/api';
import styles from './Studio.module.css';

/**
 * Compose a new post: a title + base caption, a set of target channels, and an
 * optional per-channel caption override (with a live character count against
 * that channel's limit). Saves as a draft — publishing happens from the queue.
 */
export function Composer({
  token,
  channels,
  onCreated,
}: {
  token: string;
  channels: Channel[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosen = channels.filter((c) => selected[c.channel]);
  const canSave = body.trim().length > 0 && chosen.length > 0 && !busy;

  function toggle(channel: string) {
    setSelected((s) => ({ ...s, [channel]: !s[channel] }));
  }

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      const targets = chosen.map((c) => {
        const cap = (overrides[c.channel] ?? '').trim();
        return cap ? { channel: c.channel, caption: cap } : { channel: c.channel };
      });
      const input: NewPostInput = { body: body.trim(), targets };
      const trimmedTitle = title.trim();
      if (trimmedTitle) input.title = trimmedTitle;
      await createPost(token, input);
      setTitle('');
      setBody('');
      setSelected({});
      setOverrides({});
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.composer} aria-label="Compose a post">
      <label className={styles.field}>
        <span className={styles.label}>Title (internal)</span>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What is this post about?"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Base caption</span>
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="The default text. Channels without an override use this."
        />
      </label>

      <fieldset className={styles.channels}>
        <legend className={styles.label}>Channels</legend>
        {channels.length === 0 ? (
          <p className={styles.muted}>No channels are wired on the server yet.</p>
        ) : (
          channels.map((c) => {
            const on = !!selected[c.channel];
            const limit = CHANNEL_LIMITS[c.channel] ?? 0;
            const text = (overrides[c.channel] ?? '').trim() || body;
            const over = limit > 0 && text.length > limit;
            return (
              <div key={c.channel} className={styles.channelRow}>
                <label className={styles.channelPick}>
                  <input type="checkbox" checked={on} onChange={() => toggle(c.channel)} />
                  <span className={styles.channelName}>{c.channel}</span>
                  {limit > 0 ? (
                    <span className={over ? styles.countOver : styles.count}>
                      {text.length}/{limit}
                    </span>
                  ) : null}
                </label>
                {on ? (
                  <textarea
                    className={styles.override}
                    value={overrides[c.channel] ?? ''}
                    onChange={(e) => setOverrides((o) => ({ ...o, [c.channel]: e.target.value }))}
                    rows={2}
                    placeholder={`Override for ${c.channel} (blank = base caption)`}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </fieldset>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => void save()} disabled={!canSave}>
          {busy ? 'Saving…' : 'Save draft'}
        </Button>
      </div>
    </section>
  );
}
