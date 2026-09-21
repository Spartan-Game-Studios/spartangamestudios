import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container/Container';
import { useAuth } from '@/auth/useAuth';
import { useAccount } from '@/auth/useAccount';
import { useCart } from '@/cart/useCart';
import styles from './SiteHeader.module.css';

const NAV = [
  { to: '/games', key: 'nav.games' },
  { to: '/merch', key: 'nav.merch' },
  { to: '/devlog', key: 'nav.devlog' },
  { to: '/press', key: 'nav.press' },
  { to: '/about', key: 'nav.about' },
];

export function SiteHeader() {
  const { t } = useTranslation();
  const { session, loading } = useAuth();
  // Nakama's generated username is a random string like "CixjvnjvNP". Prefer
  // the display name it took from Google, falling back only if absent.
  const { account } = useAccount();
  const { count } = useCart();
  // The shop (and its cart) is sign-in only, so don't advertise it to a
  // signed-out visitor. Gate on !loading too, so it doesn't flash then vanish.
  const showShop = !loading && !!session;

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
            {NAV.filter((item) => item.to !== '/merch' || showShop).map((item) => (
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
                  {account?.displayName || session.username || t('auth.account')}
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

            {showShop ? (
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  isActive ? `${styles.cart} ${styles.navLinkActive}` : styles.cart
                }
                aria-label={t('cart.cartLabel', { count })}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M3 3h2l2.4 12.3a1 1 0 0 0 1 .7h9.2a1 1 0 0 0 1-.8L21 7H6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.4" fill="currentColor" />
                </svg>
                {count > 0 ? <span className={styles.cartCount}>{count}</span> : null}
              </NavLink>
            ) : null}
          </nav>
        </div>
      </Container>
    </header>
  );
}
