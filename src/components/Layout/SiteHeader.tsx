import { NavLink, Link } from 'react-router-dom';
import { Container } from '@/components/Container/Container';
import styles from './SiteHeader.module.css';

const NAV = [
  { to: '/games', label: 'Games' },
  { to: '/devlog', label: 'Devlog' },
  { to: '/press', label: 'Press' },
  { to: '/about', label: 'About' },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>

      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.brand} aria-label="Spartan Game Studios — home">
            <img
              className={styles.mark}
              src="/brand/logo-192.png"
              alt=""
              width={192}
              height={192}
            />
            <span className={styles.wordmark}>
              <span className={styles.wordmarkTop}>Spartan</span>
              <span className={styles.wordmarkBottom}>Game Studios</span>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}
