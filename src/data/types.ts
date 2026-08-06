/** Content model for the site. All page content is data; pages are views. */

/** Storefronts a game can ship on. Ordered as they are rendered. */
export const STOREFRONTS = [
  'steam',
  'itch',
  'epic',
  'gog',
  'ios',
  'android',
  'web',
  'switch',
  'playstation',
  'xbox',
] as const;

export type Storefront = (typeof STOREFRONTS)[number];

export interface StoreLink {
  store: Storefront;
  url: string;
  /** Shown instead of the default verb, e.g. "Wishlist" before launch. */
  label?: string;
}

/**
 * Where a project actually is. Deliberately honest: `concept` means nothing is
 * playable, `in-development` means a build exists but is not for sale.
 */
export type GameStatus = 'concept' | 'in-development' | 'early-access' | 'released';

/**
 * `public` games appear in listings and sitemaps. `unlisted` games are still
 * routable (a direct link works, for press or a soft reveal) but are absent
 * from every index. Nothing is published by accident.
 */
export type Visibility = 'public' | 'unlisted';

export interface GameMedia {
  /** Path under /public, or an imported asset URL. */
  src: string;
  alt: string;
}

export interface Game {
  slug: string;
  title: string;
  /** One line, present tense — the hook used in cards and meta descriptions. */
  tagline: string;
  /** 2–4 sentences for the landing page. */
  pitch: string;
  genre: string;
  status: GameStatus;
  visibility: Visibility;
  /** ISO date or a coarse window ("2027"). Omit when genuinely unknown. */
  releaseWindow?: string;
  platforms: string[];
  /** Empty until a storefront is actually live. */
  stores: StoreLink[];
  keyArt?: GameMedia;
  screenshots?: GameMedia[];
  /** YouTube/Vimeo watch URL. Embedded only on the game page. */
  trailerUrl?: string;
  features?: string[];
  /** Falls back to the studio-wide price stance when absent. */
  price?: string;
}

export interface DevlogPost {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  summary: string;
  /** Slug of the game this post is about, if any. */
  game?: string;
  tags: string[];
  /** Markdown-free plain paragraphs; the MVP renders these verbatim. */
  body: string[];
  visibility: Visibility;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface Studio {
  name: string;
  shortName: string;
  domain: string;
  url: string;
  founded: string;
  location: string;
  tagline: string;
  description: string;
  pressEmail: string;
  businessEmail: string;
  socials: SocialLink[];
}
