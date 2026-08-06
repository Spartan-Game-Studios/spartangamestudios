import type { Studio } from './types';

export const studio: Studio = {
  name: 'Spartan Game Studios',
  shortName: 'Spartan',
  domain: 'spartangamestudios.com',
  url: 'https://spartangamestudios.com',
  founded: '2026',
  location: 'United States',
  tagline: 'Games you own.',
  description:
    'Spartan Game Studios builds tight, replayable action games — and sells them the old way. Buy once, own forever, updates free.',
  pressEmail: 'press@spartangamestudios.com',
  businessEmail: 'hello@spartangamestudios.com',
  socials: [],
};

/**
 * The studio's monetization stance, stated on the site because it is a
 * promise to players, not just an internal policy.
 */
export const ownershipPledge = {
  heading: 'Buy once. Own it.',
  points: [
    {
      title: 'One purchase, forever',
      body: 'You buy the game and it is yours. No subscription, no account required to play, no server that can switch off your library.',
    },
    {
      title: 'Updates stay free',
      body: 'Fixes, balance, quality-of-life, and the content that finishes what we sold you — all free, for as long as we support the game.',
    },
    {
      title: 'No microtransactions, ever',
      body: 'No ads, no loot boxes, no battle passes, no pay-to-win, no timers built to sell you the way around them.',
    },
    {
      title: 'Paid DLC only when it earns it',
      body: 'If we ever charge again it will be for a substantial expansion on top of a complete game — never for something that should have been a patch.',
    },
  ],
} as const;
