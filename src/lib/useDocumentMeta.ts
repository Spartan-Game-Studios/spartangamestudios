import { useEffect } from 'react';
import { studio } from '@/data';

interface Meta {
  title: string;
  description: string;
  /** Absolute or root-relative path for og:image. */
  image?: string;
  /** Path only; the canonical origin is the studio domain. */
  path?: string;
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Per-route title/description/OG tags. A hand-rolled hook rather than a
 * helmet dependency — the MVP has one need (set tags on navigate) and this is
 * the whole of it. Swap for real SSR/prerendering when SEO stakes rise.
 */
export function useDocumentMeta({ title, description, image, path }: Meta) {
  useEffect(() => {
    const fullTitle = title === studio.name ? title : `${title} — ${studio.name}`;
    const url = `${studio.url}${path ?? window.location.pathname}`;
    const ogImage = `${studio.url}${image ?? '/brand/logo-512.png'}`;

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    upsertCanonical(url);
  }, [title, description, image, path]);
}
