import { useEffect, useState } from 'react';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAuth } from '@/auth/useAuth';
import { useAccount } from '@/auth/useAccount';
import { useFollowing } from '@/auth/useFollowing';
import { listedGames } from '@/data';
import {
  linkSteam,
  readSteamCallback,
  requestEmailVerification,
  steamOpenIdUrl,
  unlinkSteam,
} from '@/lib/nakama';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Account.module.css';

/**
 * Providers shown in the connected-accounts list.
 *
 * Only what genuinely works appears here. Steam connects through OpenID, which
 * the server verifies with Steam directly — Nakama's own Steam auth wants a
 * Steamworks session ticket a browser cannot produce. itch.io, GOG and Epic are
 * absent: a row that cannot do anything is worse than no row.
 */
const PROVIDERS = ['google', 'email', 'steam'] as const;
type Provider = (typeof PROVIDERS)[number];

export function Account() {
  const { t } = useTranslation();
  const { session, loading: sessionLoading, signOut } = useAuth();
  const { account, loading, error, reload } = useAccount();
  // listedGames() honours visibility — an unlisted title must not become
  // discoverable just because this page enumerates the catalogue.
  const games = listedGames();
  const { followed, toggle, busy, blocked } = useFollowing(account?.userId ?? null);
  const location = useLocation();
  const navigate = useNavigate();
  const [steamBusy, setSteamBusy] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [resend, setResend] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  useDocumentMeta({ title: t('auth.account'), description: t('auth.metaDescription') });

  // Steam sends the visitor back here with an assertion in the query string.
  // It is handed straight to the server, which is the only party that can tell
  // whether Steam actually issued it — nothing here trusts these values.
  const token = session?.token;
  useEffect(() => {
    const params = readSteamCallback(location.search);
    if (!params || !token) return;
    setSteamBusy(true);
    setSteamError(null);
    void linkSteam(token, params)
      .then(() => reload())
      .catch(() => setSteamError('auth.error.steamFailed'))
      .finally(() => {
        setSteamBusy(false);
        // Drop the assertion from the address bar: it is single-use, and a
        // reload would otherwise replay it and fail confusingly.
        void navigate('/account', { replace: true });
      });
  }, [location.search, token, navigate, reload]);

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
          {steamError && (
            <p className={styles.error} role="alert">
              {t(steamError)}
            </p>
          )}
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
                          ? `${account?.email ?? ''}${account?.emailVerified ? '' : ` — ${t('auth.unverified')}`}`
                          : (account?.steamId ?? t('auth.connectedYes'))
                      : t('auth.notConnected')}
                  </span>
                  {p === 'email' && connected && !account?.emailVerified && (
                    <button
                      type="button"
                      className={styles.follow}
                      disabled={resend === 'sending' || resend === 'sent'}
                      onClick={() => {
                        if (!session) return;
                        setResend('sending');
                        requestEmailVerification(session.token)
                          .then(() => setResend('sent'))
                          .catch(() => setResend('failed'));
                      }}
                    >
                      {resend === 'sent'
                        ? t('auth.verifySent')
                        : resend === 'sending'
                          ? t('auth.working')
                          : resend === 'failed'
                            ? t('auth.verifyResendFailed')
                            : t('auth.verifyResend')}
                    </button>
                  )}
                  {p === 'steam' &&
                    (connected ? (
                      <button
                        type="button"
                        className={styles.unfollow}
                        disabled={steamBusy}
                        onClick={() => {
                          if (!session) return;
                          setSteamBusy(true);
                          void unlinkSteam(session.token)
                            .then(() => reload())
                            .catch(() => setSteamError('auth.error.steamFailed'))
                            .finally(() => setSteamBusy(false));
                        }}
                      >
                        {t('auth.disconnect')}
                      </button>
                    ) : (
                      <a className={styles.follow} href={steamOpenIdUrl('/account')}>
                        {steamBusy ? t('auth.working') : t('auth.connect')}
                      </a>
                    ))}
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('auth.following')}</h2>
          {blocked && (
            <p className={styles.error} role="alert">
              {t('auth.followNeedsVerification')}
            </p>
          )}
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
