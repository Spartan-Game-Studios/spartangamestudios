import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/auth/useAuth';
import { deleteAccount } from '@/lib/nakama';
import { studio } from '@/data';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './DeleteAccount.module.css';

/**
 * Account deletion, as Google Play requires for any app with accounts.
 *
 * Two properties are requirements rather than choices:
 *
 *  1. The page must be READABLE WITHOUT SIGNING IN. Play checks the URL from
 *     outside any session, so it explains what deletion does to everybody and
 *     only the button itself depends on being signed in.
 *  2. It must say what is deleted and what is kept. Vagueness here is the thing
 *     the policy exists to stop, so the list below is drawn from what the server
 *     actually destroys — verified against the database, not assumed.
 *
 * There is deliberately no grace period. A "deleted" account that still exists
 * is exactly what someone asking for deletion did not ask for, and we hold
 * nothing worth recovering.
 */
export function DeleteAccount() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'failed'>('idle');

  useDocumentMeta({
    title: t('delete.title'),
    description: t('delete.metaDescription'),
    path: '/delete-account',
  });

  const confirmWord = t('delete.confirmWord');
  const armed = typed.trim().toUpperCase() === confirmWord;

  if (state === 'done') {
    return (
      <Container>
        <div className={page.page}>
          <h1 className={page.title}>{t('delete.doneTitle')}</h1>
          <p className={page.lede}>{t('delete.doneBody')}</p>
          <Button to="/">{t('delete.backHome')}</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={page.page}>
        <h1 className={page.title}>{t('delete.title')}</h1>
        <p className={page.lede}>{t('delete.lede')}</p>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('delete.removedTitle')}</h2>
          <ul className={styles.list}>
            <li>{t('delete.removedAccount')}</li>
            <li>{t('delete.removedIdentities')}</li>
            <li>{t('delete.removedFollowing')}</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('delete.keptTitle')}</h2>
          <ul className={styles.list}>
            <li>{t('delete.keptPurchases')}</li>
            <li>{t('delete.keptSupport')}</li>
          </ul>
          <p className={styles.note}>{t('delete.keptWhy')}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('delete.howTitle')}</h2>

          {session ? (
            <>
              <p className={styles.warning}>{t('delete.irreversible')}</p>
              <label className={styles.confirmLabel} htmlFor="confirm">
                {t('delete.typeToConfirm', { word: confirmWord })}
              </label>
              <input
                id="confirm"
                className={styles.input}
                type="text"
                autoComplete="off"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={state === 'working'}
              />
              {state === 'failed' && (
                <p className={styles.error} role="alert">
                  {t('delete.failed')}
                </p>
              )}
              <Button
                variant="primary"
                disabled={!armed || state === 'working'}
                onClick={() => {
                  if (!armed) return;
                  setState('working');
                  deleteAccount(session.token)
                    .then(() => {
                      // The session is dead server-side the moment this returns;
                      // clearing it locally keeps the UI honest.
                      signOut();
                      setState('done');
                    })
                    .catch(() => setState('failed'));
                }}
              >
                {state === 'working' ? t('delete.working') : t('delete.button')}
              </Button>
            </>
          ) : (
            <>
              <p>{t('delete.signInFirst')}</p>
              <Button to="/signin" variant="secondary">
                {t('auth.signIn')}
              </Button>
            </>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>{t('delete.cannotSignInTitle')}</h2>
          {/* A route for people who have lost access to the account itself —
              without this, "delete my data" is only available to those who least
              need it. */}
          <p>
            {t('delete.cannotSignIn')}{' '}
            <a href={`mailto:${studio.businessEmail}?subject=Account%20deletion%20request`}>
              {studio.businessEmail}
            </a>
          </p>
        </section>

        <p className={styles.note}>
          <Link to="/account">{t('auth.account')}</Link>
        </p>
      </div>
    </Container>
  );
}
