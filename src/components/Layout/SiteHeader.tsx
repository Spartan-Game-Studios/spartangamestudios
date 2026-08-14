import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { useAuth } from '@/auth/useAuth';
import styles from './SiteHeader.module.css';

const NAV = [
  { to: '/games', key: 'nav.games' },
  { to: '/devlog', key: 'nav.devlog' },
  { to: '/press', key: 'nav.press' },
  { to: '/about', key: 'nav.about' },
];

export function SiteHeader() {
  const { t } = useTranslation();
  const { session, loading } = useAuth();

  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skipLink}>
        {t('nav.skipToContent')}
      </a>

      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand} aria-label={t('nav.home')}>
            <img
              className={styles.mark}
              src="/brand/logo-192.png"
              alt=""
              width={192}
              height={192}
            />
            {/* The wordmark is the studio's name — never translated. */}
            <span className={styles.wordmark}>
              <span className={styles.wordmarkTop}>Spartan</span>
              <span className={styles.wordmarkBottom}>Game Studios</span>
            </span>
          </Link>

          <nav className={styles.nav} aria-label={t('nav.primaryLabel')}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                {t(item.key)}
              </NavLink>
            ))}

            {/* Rendered only once the stored session has resolved, so the header
                does not flash "Sign in" at someone who is already signed in. */}
            {!loading &&
              (session ? (
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  {session.username || t('auth.account')}
                </NavLink>
              ) : (
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  {t('auth.signIn')}
                </NavLink>
              ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
