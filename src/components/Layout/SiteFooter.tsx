import { Link } from 'react-router-dom';
import { Container } from '@/components/Container/Container';
import { listedGames, studio } from '@/data';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div>
            <p className={`${styles.brandLine} u-gold-text`}>{studio.name}</p>
            <p className={styles.blurb}>{studio.description}</p>
          </div>

          <div>
            <h2 className={styles.heading}>Games</h2>
            <ul className={styles.list}>
              {listedGames().map((game) => (
                <li key={game.slug}>
                  <Link to={`/games/${game.slug}`}>{game.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.heading}>Studio</h2>
            <ul className={styles.list}>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/devlog">Devlog</Link>
              </li>
              <li>
                <Link to="/press">Press kit</Link>
              </li>
              <li>
                <a href={`mailto:${studio.businessEmail}`}>{studio.businessEmail}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>
            © {year} {studio.name}
          </span>
          <span>Buy once. Own it.</span>
        </div>
      </Container>
    </footer>
  );
}
