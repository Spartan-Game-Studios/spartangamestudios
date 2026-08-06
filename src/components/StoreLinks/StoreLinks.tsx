import { STORE_LABELS, STOREFRONTS, type StoreLink } from '@/data';
import { Button } from '@/components/Button/Button';
import styles from './StoreLinks.module.css';

interface StoreLinksProps {
  links: StoreLink[];
  title: string;
  /** Where to send people when there is nowhere to buy yet. */
  fallbackTo?: string;
  size?: 'small' | 'medium' | 'large';
}

const ORDER = new Map(STOREFRONTS.map((store, index) => [store, index]));

/**
 * The canonical "where to buy" row. This is the site's whole reason to exist
 * as a link target, so it degrades honestly: no storefront yet means it says
 * so, rather than showing a dead button.
 */
export function StoreLinks({ links, title, fallbackTo, size = 'medium' }: StoreLinksProps) {
  if (links.length === 0) {
    return (
      <p className={styles.empty}>
        <span className={styles.emptyLead}>Not on sale yet</span>
        <span>
          {title} has no storefront live. This row fills in the day it does — it is the first thing
          updated on every launch and port.
        </span>
        {fallbackTo ? (
          <a href={fallbackTo} className="u-gold-text">
            Follow development
          </a>
        ) : null}
      </p>
    );
  }

  const ordered = [...links].sort(
    (a, b) => (ORDER.get(a.store) ?? 99) - (ORDER.get(b.store) ?? 99),
  );

  return (
    <ul className={styles.row} aria-label={`Where to buy ${title}`}>
      {ordered.map((link, index) => (
        <li key={link.store}>
          <Button href={link.url} size={size} variant={index === 0 ? 'primary' : 'secondary'}>
            {link.label ?? STORE_LABELS[link.store]}
          </Button>
        </li>
      ))}
    </ul>
  );
}
