import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { MerchImage } from '@/data';
import styles from './MerchGallery.module.css';

interface MerchGalleryProps {
  images: MerchImage[];
  /** Accessible name, e.g. the product name. */
  label: string;
  /** `card` = compact, controls revealed on hover/focus; `detail` = larger, controls always shown. */
  variant?: 'card' | 'detail';
  /** Dim the imagery (sold-out styling). */
  dimmed?: boolean;
}

/**
 * A single-slide product gallery in the merch 4:5 frame — prev/next, a dot per
 * image, arrow keys, and touch swipe. Mirrors the screenshot Carousel's a11y
 * (state-driven translateX track, live region, per-slide aria) but sized for
 * product cards and the product page rather than 16:9 screenshots.
 *
 * With a single image it renders just that image (no controls). Motion is gated
 * on prefers-reduced-motion in CSS; the index still changes, it just doesn't
 * animate. The controls are <button>s, so clicking through images on a card
 * never triggers the card's title link.
 */
export function MerchGallery({
  images,
  label,
  variant = 'card',
  dimmed = false,
}: MerchGalleryProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const count = images.length;

  if (count === 0) return null;

  const go = (next: number) => setIndex(Math.max(0, Math.min(next, count - 1)));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(index - 1);
    }
  };

  const status = t('carousel.status', { index: index + 1, total: count });

  return (
    <div
      className={`${styles.gallery} ${styles[variant]} ${dimmed ? styles.dimmed : ''}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div className={styles.viewport}>
        {count > 1 ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label={t('carousel.previous')}
          >
            <Chevron dir="left" />
          </button>
        ) : null}

        <ul
          className={styles.track}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null || count < 2) return;
            const dx = (e.changedTouches[0]?.clientX ?? start) - start;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
          }}
        >
          {images.map((img, i) => (
            <li
              key={img.src}
              className={styles.slide}
              aria-roledescription="slide"
              aria-label={t('carousel.status', { index: i + 1, total: count })}
              aria-hidden={i !== index}
            >
              <img src={img.src} alt={img.alt} loading="lazy" draggable={false} />
            </li>
          ))}
        </ul>

        {count > 1 ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            aria-label={t('carousel.next')}
          >
            <Chevron dir="right" />
          </button>
        ) : null}

        {/* Dots for the compact card; the detail view uses a thumbnail strip below. */}
        {count > 1 && variant === 'card' ? (
          <div className={styles.dots}>
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                aria-label={t('carousel.goTo', { index: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {variant === 'detail' && count > 1 ? (
        <ul className={styles.thumbs}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                aria-label={t('carousel.goTo', { index: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              >
                <img src={img.src} alt="" loading="lazy" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Announces the active slide to screen readers as it changes. */}
      <p className="u-visually-hidden" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
