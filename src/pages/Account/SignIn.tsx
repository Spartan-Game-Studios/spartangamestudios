import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/auth/useAuth';
import { useGoogleButton } from '@/auth/useGoogleButton';
import { AuthError, nakamaConfigured } from '@/lib/nakama';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import styles from './SignIn.module.css';
import page from '@/pages/shared/page.module.css';

type Mode = 'signin' | 'signup';

/** Nakama's own minimum. Checked here so the failure lands under the field
 *  rather than arriving as a server error after a round trip. */
const MIN_PASSWORD = 8;

/**
 * Turns a failure into something a person can act on.
 *
 * Nakama's messages are written for developers ("Invalid credentials.") and the
 * rate limiter answers in HTML with no message at all, so both are mapped to
 * translated copy rather than shown raw.
 */
function messageKey(error: unknown, mode: Mode): string {
  if (!(error instanceof AuthError)) return 'auth.error.unknown';
  if (error.status === 429) return 'auth.error.rateLimited';
  if (error.status === 0) return 'auth.error.unavailable';
  // 401 on sign-in is a wrong password; 404 is an account that does not exist.
  // Both are reported identically on purpose — distinguishing them tells an
  // attacker which addresses are registered.
  if (mode === 'signin' && (error.status === 401 || error.status === 404)) {
    return 'auth.error.badCredentials';
  }
  if (error.status === 409 || /exists|taken/i.test(error.message)) {
    return 'auth.error.alreadyRegistered';
  }
  return 'auth.error.unknown';
}

export function SignIn() {
  const { t } = useTranslation();
  const { session, signIn, signUp, signInGoogle } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useDocumentMeta({
    title: t(mode === 'signin' ? 'auth.signIn' : 'auth.createAccount'),
    description: t('auth.metaDescription'),
  });

  const google = useGoogleButton((idToken) => {
    setError(null);
    setBusy(true);
    signInGoogle(idToken)
      .catch((e: unknown) => setError(messageKey(e, mode)))
      .finally(() => setBusy(false));
  });

  if (session) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/account'} replace />;
  }

  const configured = nakamaConfigured();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password.length < MIN_PASSWORD) {
      setError('auth.error.passwordTooShort');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
    } catch (e: unknown) {
      setError(messageKey(e, mode));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container>
      <div className={page.page}>
        <h1 className={page.title}>
          {t(mode === 'signin' ? 'auth.signIn' : 'auth.createAccount')}
        </h1>
        <p className={page.lede}>{t('auth.lede')}</p>

        {!configured && <p className={styles.notice}>{t('auth.error.unavailable')}</p>}

        <div className={styles.panel}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              void onSubmit(e);
            }}
            noValidate
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                {t('auth.email')}
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy || !configured}
              />
            </div>

            {/* The hint sits OUTSIDE the label and is attached with
                aria-describedby. Nested inside, it becomes part of the field's
                accessible name — a screen reader would announce the control as
                "Password At least 8 characters", and the label would no longer
                match the word "Password" alone. */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                {t('auth.password')}
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={MIN_PASSWORD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy || !configured}
                {...(mode === 'signup' ? { 'aria-describedby': 'password-hint' } : {})}
              />
              {mode === 'signup' && (
                <span className={styles.hint} id="password-hint">
                  {t('auth.passwordHint', { count: MIN_PASSWORD })}
                </span>
              )}
            </div>

            {/* role=alert so a screen reader announces the failure without
                needing the user to go looking for it. */}
            {error && (
              <p className={styles.error} role="alert">
                {t(error)}
              </p>
            )}

            <Button type="submit" fullWidth disabled={busy || !configured}>
              {busy
                ? t('auth.working')
                : t(mode === 'signin' ? 'auth.signIn' : 'auth.createAccount')}
            </Button>
          </form>

          {google.available && configured && (
            <>
              <div className={styles.divider}>
                <span>{t('auth.or')}</span>
              </div>
              {/* GIS renders its own button in here — see useGoogleButton. */}
              <div className={styles.google} ref={google.ref} />
            </>
          )}
        </div>

        <p className={styles.swap}>
          {t(mode === 'signin' ? 'auth.noAccount' : 'auth.haveAccount')}{' '}
          <button
            type="button"
            className={styles.swapButton}
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
          >
            {t(mode === 'signin' ? 'auth.createAccount' : 'auth.signIn')}
          </button>
        </p>
      </div>
    </Container>
  );
}
