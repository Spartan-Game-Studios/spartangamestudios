import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CardCarousel.module.css';

interface CardCarouselProps {
  children: ReactNode;
  /** Accessible name for the carousel, e.g. "Games". */
  label: string;
}

/**
 * A horizontal, swipeable row of arbitrary cards — as many visible as fit, the
 * rest reached by dragging/swiping or the arrows. Unlike the single-slide image
 * Carousel, this is scroll-based (native scroll-snap), because a card rail shows
 * several items at once and their count/width vary.
 *
 * The arrows appear only when the content actually overflows; when everything
 * fits (e.g. a single game today) the row simply centres with no controls.
 */
export function CardCarousel({ children, label }: CardCarouselProps) {
  const { t } = useTranslation();
  const trackRef = useRef<HTMLUListElement>(null);
  const [{ scrollable, atStart, atEnd }, setState] = useState({
    scrollable: false,
    atStart: true,
    atEnd: true,
  });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      setState({
        scrollable: overflow > 1,
        atStart: el.scrollLeft <= 1,
        atEnd: el.scrollLeft >= overflow - 1,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [children]);

  const page = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className={styles.wrap} role="group" aria-roledescription="carousel" aria-label={label}>
      {scrollable ? (
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={() => page(-1)}
          disabled={atStart}
          aria-label={t('carousel.previous')}
        >
          <Chevron dir="left" />
        </button>
      ) : null}

      <ul ref={trackRef} className={`${styles.track} ${scrollable ? '' : styles.trackCentered}`}>
        {Children.map(children, (child) => (
          <li className={styles.item}>{child}</li>
        ))}
      </ul>

      {scrollable ? (
        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={() => page(1)}
          disabled={atEnd}
          aria-label={t('carousel.next')}
        >
          <Chevron dir="right" />
        </button>
      ) : null}
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d={dir === 'left' ? 'M10 2 4 8l6 6' : 'M6 2l6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
