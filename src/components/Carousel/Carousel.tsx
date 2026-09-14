import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Carousel.module.css';

export interface CarouselItem {
  src: string;
  alt: string;
}

interface CarouselProps {
  items: CarouselItem[];
  /** Accessible name for the whole carousel, e.g. "Boothill screenshots". */
  label: string;
}

/**
 * A single-slide carousel: one image at a time, with prev/next arrows, a dot
 * per slide, arrow-key support, and touch swipe. It is state-driven (a
 * translateX track) rather than scroll-based, so the active slide is always
 * exactly known — which keeps the dots, the disabled arrows, and the live
 * region in lockstep, and makes it testable without a real layout engine.
 *
 * Motion is gated on prefers-reduced-motion in CSS; the index still changes,
 * it just doesn't animate.
 */
export function Carousel({ items, label }: CarouselProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = items.length;

  if (count === 0) return null;

  const go = (next: number) => setIndex(Math.max(0, Math.min(next, count - 1)));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  return (
    <div
      className={styles.carousel}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className={styles.viewport}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.prev}`}
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={t('carousel.previous')}
        >
          <Chevron dir="left" />
        </button>

        <ul
          className={styles.track}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? start) - start;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          }}
        >
          {items.map((item, i) => (
            <li
              key={item.src}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={t('carousel.status', { index: i + 1, total: count })}
              aria-hidden={i !== index}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                width={1600}
                height={900}
                draggable={false}
              />
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={`${styles.arrow} ${styles.next}`}
          onClick={() => go(index + 1)}
          disabled={index === count - 1}
          aria-label={t('carousel.next')}
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className={styles.dots}>
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            aria-label={t('carousel.goTo', { index: i + 1 })}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>

      {/* Announces the active slide to screen readers as it changes. */}
      <p className="u-visually-hidden" aria-live="polite">
        {t('carousel.status', { index: index + 1, total: count })}
      </p>
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
