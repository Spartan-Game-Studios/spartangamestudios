import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/auth/useAuth';
import { confirmEmailVerification } from '@/lib/nakama';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './SignIn.module.css';

type State = 'working' | 'done' | 'failed' | 'noToken';

/**
 * Lands someone arriving from a verification email.
 *
 * The redemption RPC needs a session, so an unauthenticated visitor is sent to
 * sign in with the FULL path — token and all — as the return address. They come
 * back here signed in and it redeems automatically. That covers the ordinary
 * case of signing up on a laptop and opening the mail on a phone.
 *
 * The token is deliberately not stashed in storage on the way past. It stays in
 * the URL, which is where it already is; copying it somewhere more durable only
 * widens where a single-use secret can be found later.
 */
export function Verify() {
  const { t } = useTranslation();
  const { session, loading } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<State>('working');
  // React runs effects twice in StrictMode. The token is single-use, so a second
  // redemption would fail and show an error after the first one succeeded.
  const attempted = useRef(false);

  useDocumentMeta({ title: t('auth.verifyTitle'), description: t('auth.metaDescription') });

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setState('noToken');
      return;
    }
    if (!session || attempted.current) return;
    attempted.current = true;
    confirmEmailVerification(session.token, token)
      .then(() => setState('done'))
      .catch(() => setState('failed'));
  }, [token, session]);

  if (loading) return null;

  // Sign in first, then return here with the token still in the address.
  if (token && !session) {
    return (
      <Navigate to="/signin" replace state={{ from: `${location.pathname}${location.search}` }} />
    );
  }

  const body =
    state === 'done'
      ? t('auth.verifyDone')
      : state === 'failed'
        ? t('auth.verifyFailed')
        : state === 'noToken'
          ? t('auth.verifyNoToken')
          : t('auth.working');

  return (
    <Container>
      <div className={page.page}>
        <h1 className={page.title}>{t('auth.verifyTitle')}</h1>
        <p className={page.lede} role={state === 'failed' ? 'alert' : undefined}>
          {body}
        </p>
        {state !== 'working' && <Button to="/account">{t('auth.account')}</Button>}
        {state === 'failed' && <p className={styles.hint}>{t('auth.verifyFailedHint')}</p>}
      </div>
    </Container>
  );
}
