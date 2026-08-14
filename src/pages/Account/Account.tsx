import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { Button } from '@/components/Button/Button';
import { useAuth } from '@/auth/useAuth';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import page from '@/pages/shared/page.module.css';
import styles from './Account.module.css';

export function Account() {
  const { t } = useTranslation();
  const { session, loading, signOut } = useAuth();

  useDocumentMeta({ title: t('auth.account'), description: t('auth.metaDescription') });

  // Waiting matters here: a stored session is refreshed before first paint, and
  // redirecting during that window would bounce a signed-in visitor to sign-in.
  if (loading) return null;
  if (!session) return <Navigate to="/signin" replace state={{ from: '/account' }} />;

  return (
    <Container>
      <div className={page.page}>
        <h1 className={page.title}>{t('auth.account')}</h1>
        <p className={page.lede}>{t('auth.accountLede')}</p>

        <dl className={styles.details}>
          <dt className={styles.term}>{t('auth.email')}</dt>
          <dd className={styles.value}>{session.email ?? t('auth.noEmailOnAccount')}</dd>
          <dt className={styles.term}>{t('auth.username')}</dt>
          <dd className={styles.value}>{session.username || '—'}</dd>
        </dl>

        <Button variant="secondary" onClick={signOut}>
          {t('auth.signOut')}
        </Button>
      </div>
    </Container>
  );
}
