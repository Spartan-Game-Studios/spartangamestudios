import { useTranslation } from 'react-i18next';
import type { DevlogPost, Game } from '@/data';
import { ownershipPledge, studio } from '@/data';

/**
 * Content translation, as distinct from UI-chrome translation.
 *
 * The rule for this codebase: anything that lives in `src/data/` keeps its
 * English inline as the source of truth, and locale files *override* it by
 * key. Anything hardcoded in a component lives in the locale files outright.
 *
 * The upshot is that adding a game stays a one-array edit — you write the
 * English in `games.ts` and it renders everywhere immediately. Translators
 * then add `catalogue.<slug>.*` to their locale file at their own pace, and a
 * key they have not reached yet silently falls back to English rather than
 * rendering blank or leaking a raw key onto the page.
 */

interface Override {
  /** Reads a string key, falling back to the value already in the data layer. */
  text: (key: string, fallback: string) => string;
  /**
   * Arrays go through `exists` rather than `defaultValue` — i18next's handling
   * of object/array returns is inconsistent enough that an explicit check is
   * the honest way to do it.
   */
  list: (key: string, fallback: string[]) => string[];
}

function useOverride(): Override {
  const { t, i18n } = useTranslation();

  const text: Override['text'] = (key, fallback) => (i18n.exists(key) ? t(key) : fallback);

  const list: Override['list'] = (key, fallback) => {
    if (!i18n.exists(key)) return fallback;
    const value: unknown = t(key, { returnObjects: true });
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
      ? value
      : fallback;
  };

  return { text, list };
}

export interface GameCopy {
  title: string;
  tagline: string;
  pitch: string;
  genre: string;
  features: string[];
  price: string | undefined;
}

/** Game titles are proper nouns and are never translated. */
export function useGameCopy(game: Game): GameCopy {
  const { text, list } = useOverride();
  const base = `catalogue.${game.slug}`;

  return {
    title: game.title,
    tagline: text(`${base}.tagline`, game.tagline),
    pitch: text(`${base}.pitch`, game.pitch),
    genre: text(`${base}.genre`, game.genre),
    features: list(`${base}.features`, game.features ?? []),
    price: game.price ? text(`${base}.price`, game.price) : undefined,
  };
}

export interface PostCopy {
  title: string;
  summary: string;
  body: string[];
}

export function usePostCopy(post: DevlogPost): PostCopy {
  const { text, list } = useOverride();
  const base = `posts.${post.slug}`;

  return {
    title: text(`${base}.title`, post.title),
    summary: text(`${base}.summary`, post.summary),
    body: list(`${base}.body`, post.body),
  };
}

export interface StudioCopy {
  tagline: string;
  description: string;
}

export function useStudioCopy(): StudioCopy {
  const { text } = useOverride();

  return {
    tagline: text('studio.tagline', studio.tagline),
    description: text('studio.description', studio.description),
  };
}

export interface PledgeCopy {
  heading: string;
  points: Array<{ id: string; title: string; body: string }>;
}

export function usePledgeCopy(): PledgeCopy {
  const { text } = useOverride();

  return {
    heading: text('pledge.heading', ownershipPledge.heading),
    points: ownershipPledge.points.map((point) => ({
      id: point.id,
      title: text(`pledge.points.${point.id}.title`, point.title),
      body: text(`pledge.points.${point.id}.body`, point.body),
    })),
  };
}
