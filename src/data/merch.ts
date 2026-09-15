import type { MerchProduct } from './types';

/**
 * The merch catalogue.
 *
 * These are stubs while the shop is being stood up: every item is
 * `available: false`, so the storefront renders as "sold out / opening soon"
 * and nothing is buyable. When the real catalogue goes live it will be sourced
 * from a merch provider (Yoycol via a backend adapter) in this same shape —
 * only the data source changes, not the pages.
 */
export const merch: MerchProduct[] = [
  {
    slug: 'boothill-wanted-tee',
    name: 'Boothill "Wanted" Tee',
    tagline: 'Every kill raises your Wanted level. Wear the bounty.',
    category: 'apparel',
    price: 27,
    currency: 'USD',
    available: false,
  },
  {
    slug: 'boothill-keyart-poster',
    name: 'Boothill Key-Art Poster',
    tagline: 'A lone boot on the hill at sundown — the whole territory behind it.',
    category: 'print',
    price: 19,
    currency: 'USD',
    image: {
      src: '/games/boothill/key-art.jpg',
      alt: 'Boothill key art: a cowboy boot atop a graveyard hill at sundown',
    },
    available: false,
  },
  {
    slug: 'sgs-meander-mug',
    name: 'Spartan Meander Enamel Mug',
    tagline: 'Bronze meander on black. For the long night of a build.',
    category: 'accessory',
    price: 16,
    currency: 'USD',
    available: false,
  },
  {
    slug: 'boothill-sticker-pack',
    name: 'Boothill Sticker Pack',
    tagline: 'Operators, enemies, and one very rude skeleton.',
    category: 'accessory',
    price: 8,
    currency: 'USD',
    available: false,
  },
  {
    slug: 'sgs-wordmark-hoodie',
    name: 'Spartan Game Studios Hoodie',
    tagline: 'The wordmark in gold. Cut stone and bronze, not soft plastic.',
    category: 'apparel',
    price: 45,
    currency: 'USD',
    available: false,
  },
];
