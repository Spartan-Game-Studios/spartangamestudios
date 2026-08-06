import type { DevlogPost } from './types';

/**
 * Devlogs live here first and are syndicated outward — the site owns the
 * archive and the SEO; socials are distribution for it, not the home.
 *
 * The MVP renders `body` as plain paragraphs. When posts outgrow that, swap
 * this array for MDX without changing any page component.
 */
export const devlog: DevlogPost[] = [
  {
    slug: 'why-we-sell-games-the-old-way',
    title: 'Why we sell games the old way',
    date: '2026-08-06',
    summary:
      'One purchase, no storefront in the middle of the fun. The reasoning behind the studio’s monetization stance, written down so we can be held to it.',
    tags: ['studio', 'monetization'],
    visibility: 'public',
    body: [
      'Every game this studio ships will be sold once. You pay, you own it, and nothing inside the game will ever ask you for money again. That is the whole model, and writing it down publicly is the point — it is easy to hold a principle until the quarter it costs something.',
      'The run-based games we build are a good fit for it. A survivors-like is complete the day it ships: the loop, the roster, the upgrade pool, the reason to start a fifteenth run. Nothing about that design needs a currency shop bolted to the side, and every game that bolted one on got worse for it.',
      'Free updates are not generosity, they are the deal. Bug fixes, balance passes, quality-of-life, and the content that finishes what we sold you are all free for as long as we support the game. If we ever charge again it will be for an expansion that adds on top of a game already complete — a real roster, real weapons, a real stage — never for something that should have been a patch.',
      'The line is simple enough to check us against: fixing or completing what we sold you is free, extending it may cost. When it is close, it is free.',
    ],
  },
];
