import type { MerchProduct } from './types';

/**
 * The merch catalogue.
 *
 * These are stubs while the shop is being stood up: every item is
 * `available: false`, so the storefront renders as "sold out / opening soon"
 * and nothing is buyable. When the real catalogue goes live it will be sourced
 * from a merch provider (Yoycol via a backend adapter) in this same shape —
 * only the data source changes, not the pages.
 *
 * `images` are PLACEHOLDER art for now — Boothill key art / screenshots and the
 * studio mark — chosen only to exercise the card + product-page galleries. Real
 * product photography replaces them when the Yoycol adapter lands.
 */
export const merch: MerchProduct[] = [
  {
    slug: 'boothill-wanted-tee',
    name: 'Boothill "Wanted" Tee',
    tagline: 'Every kill raises your Wanted level. Wear the bounty.',
    description:
      'Soft-hand print of the Boothill wanted poster on a heavyweight tee. The higher your bounty, the better you wear it. Made to order, so it prints when you buy it — no warehouse full of dead stock.',
    category: 'apparel',
    price: 27,
    currency: 'USD',
    images: [
      {
        src: '/games/boothill/key-art.jpg',
        alt: 'Boothill "Wanted" tee — front print (placeholder art)',
      },
      {
        src: '/games/boothill/screenshot-1.jpg',
        alt: 'Boothill "Wanted" tee — detail (placeholder art)',
      },
      {
        src: '/games/boothill/screenshot-2.jpg',
        alt: 'Boothill "Wanted" tee — on-body (placeholder art)',
      },
    ],
    available: false,
  },
  {
    slug: 'boothill-keyart-poster',
    name: 'Boothill Key-Art Poster',
    tagline: 'A lone boot on the hill at sundown — the whole territory behind it.',
    description:
      'The Boothill key art — a lone boot on the hill at sundown — as a matte print sized for a wall you actually look at. Museum-grade paper, shipped in a rigid tube.',
    category: 'print',
    price: 19,
    currency: 'USD',
    images: [
      {
        src: '/games/boothill/key-art.jpg',
        alt: 'Boothill key art: a cowboy boot atop a graveyard hill at sundown',
      },
      {
        src: '/games/boothill/screenshot-3.jpg',
        alt: 'Boothill key-art poster — framed (placeholder art)',
      },
      {
        src: '/games/boothill/screenshot-4.jpg',
        alt: 'Boothill key-art poster — scale reference (placeholder art)',
      },
    ],
    available: false,
  },
  {
    slug: 'sgs-meander-mug',
    name: 'Spartan Meander Enamel Mug',
    tagline: 'Bronze meander on black. For the long night of a build.',
    description:
      "The studio's bronze meander on a black enamel mug. Chip-resistant, dishwasher-brave, and exactly the right size for the long night of a build.",
    category: 'accessory',
    price: 16,
    currency: 'USD',
    images: [{ src: '/brand/logo-512.png', alt: 'Spartan meander enamel mug (placeholder art)' }],
    available: false,
  },
  {
    slug: 'boothill-sticker-pack',
    name: 'Boothill Sticker Pack',
    tagline: 'Operators, enemies, and one very rude skeleton.',
    description:
      'A die-cut sheet of Boothill operators, enemies, and one very rude skeleton. Weatherproof vinyl — stick them on the laptop that shipped the game.',
    category: 'accessory',
    price: 8,
    currency: 'USD',
    images: [
      {
        src: '/games/boothill/screenshot-1.jpg',
        alt: 'Boothill sticker pack — sheet (placeholder art)',
      },
      {
        src: '/games/boothill/screenshot-2.jpg',
        alt: 'Boothill sticker pack — die-cuts (placeholder art)',
      },
      {
        src: '/games/boothill/screenshot-3.jpg',
        alt: 'Boothill sticker pack — applied (placeholder art)',
      },
    ],
    available: false,
  },
  {
    slug: 'sgs-wordmark-hoodie',
    name: 'Spartan Game Studios Hoodie',
    tagline: 'The wordmark in gold. Cut stone and bronze, not soft plastic.',
    description:
      'The Spartan Game Studios wordmark in gold on a black heavyweight hoodie. Cut stone and bronze, not soft plastic — built to outlast the trend cycle.',
    category: 'apparel',
    price: 45,
    currency: 'USD',
    images: [
      { src: '/brand/logo-512.png', alt: 'Spartan Game Studios hoodie — front (placeholder art)' },
      {
        src: '/brand/logo-pixel.png',
        alt: 'Spartan Game Studios hoodie — mark detail (placeholder art)',
      },
    ],
    available: false,
  },
];
