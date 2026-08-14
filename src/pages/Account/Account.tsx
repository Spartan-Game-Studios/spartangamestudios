import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAuth } from '@/auth/useAuth';
import { useAccount } from '@/auth/useAccount';
import { useFollowing } from '@/auth/useFollowing';
import { listedGames } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Account.module.css';

/**
 * Providers shown in the connected-accounts list.
 *
 * Only what genuinely works appears here. Steam is listed because it is a real
 * part of the plan, but with its true status rather than a button: Nakama's
 * Steam auth consumes a session ticket from the Steamworks SDK, which a website
 * cannot produce, and the web alternative (Steam OpenID) needs a server RPC that
 * the deployed Nakama cannot route. itch.io, GOG and Epic are absent entirely —
 * a row that cannot do anything is worse than no row.
 */
const PROVIDERS = ['google', 'email', 'steam'] as const;
type Provider = (typeof PROVIDERS)[number];

export function Account() {
  const { t } = useTranslation();
  const { session, loading: sessionLoading, signOut } = useAuth();
  const { account, loading, error } = useAccount();
  // listedGames() honours visibility — an unlisted title must not become
  // discoverable just because this page enumerates the catalogue.
  const games = listedGames();
  const { followed, toggle, busy } = useFollowing(account?.userId ?? null);

  useDocumentMeta({ title: t('auth.account'), description: t('auth.metaDescription') });

  // Waiting matters: a stored session is refreshed before first paint, and
  // redirecting during that window bounces a signed-in visitor to sign-in.
  if (sessionLoading) return null;
  if (!session) return <Navigate to="/signin" replace state={{ from: '/account' }} />;

  const name = account?.displayName || account?.username || '';
  const followedGames = games.filter((g) => followed.has(g.slug));

  return (
    <Container>
      <div className={page.page}>
        <header className={styles.identity}>
          {account?.avatarUrl ? (
            <img
              className={styles.avatar}
              src={account.avatarUrl}
              alt=""
              width={72}
              height={72}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {(name || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className={styles.name}>{name || t('auth.account')}</h1>
            {account?.email && <p className={styles.email}>{account.email}</p>}
          </div>
        </header>

        {error && (
          <p className={styles.error} role="alert">
            {t('auth.error.profileUnavailable')}
          </p>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('auth.connected')}</h2>
          <ul className={styles.providers}>
            {PROVIDERS.map((p: Provider) => {
              const connected = account?.linked[p] ?? false;
              return (
                <li key={p} className={styles.provider}>
                  <span className={styles.providerName}>{t(`auth.provider.${p}`)}</span>
                  <span className={connected ? styles.connected : styles.disconnected}>
                    {connected
                      ? p === 'google'
                        ? (account?.displayName ?? t('auth.connectedYes'))
                        : p === 'email'
                          ? (account?.email ?? t('auth.connectedYes'))
                          : t('auth.connectedYes')
                      : t(p === 'steam' ? 'auth.provider.steamPending' : 'auth.notConnected')}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('auth.following')}</h2>
          {loading ? null : followedGames.length === 0 ? (
            <p className={styles.empty}>{t('auth.followingEmpty')}</p>
          ) : (
            <ul className={styles.games}>
              {followedGames.map((g) => (
                <li key={g.slug} className={styles.game}>
                  <Link to={`/games/${g.slug}`} className={styles.gameName}>
                    {g.title}
                  </Link>
                  <StatusBadge status={g.status} />
                  <button
                    type="button"
                    className={styles.unfollow}
                    onClick={() => toggle(g.slug)}
                    disabled={busy === g.slug}
                  >
                    {t('auth.unfollow')}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <details className={styles.picker}>
            <summary className={styles.pickerSummary}>{t('auth.followMore')}</summary>
            <ul className={styles.games}>
              {games
                .filter((g) => !followed.has(g.slug))
                .map((g) => (
                  <li key={g.slug} className={styles.game}>
                    <Link to={`/games/${g.slug}`} className={styles.gameName}>
                      {g.title}
                    </Link>
                    <StatusBadge status={g.status} />
                    <button
                      type="button"
                      className={styles.follow}
                      onClick={() => toggle(g.slug)}
                      disabled={busy === g.slug}
                    >
                      {t('auth.follow')}
                    </button>
                  </li>
                ))}
            </ul>
          </details>
        </section>

        <Button variant="secondary" onClick={signOut}>
          {t('auth.signOut')}
        </Button>
      </div>
    </Container>
  );
}
