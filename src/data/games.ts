import type { Game } from './types';

/**
 * The studio catalogue. Sourced from the design vault's project specs.
 *
 * `visibility: 'unlisted'` keeps a project off every index while leaving its
 * page reachable by direct link — the right default for anything not yet
 * publicly announced. Flip to 'public' to reveal it; no other change needed.
 */
export const games: Game[] = [
  {
    slug: 'lantern',
    title: 'Lantern',
    tagline: 'Whitechapel, 1888. The gas lamps are going out one by one.',
    pitch:
      'You carry the only light you can trust through a fog-drowned Whitechapel that is emptying of its own accord. Twelve minutes, one lantern, and a street full of things that only move where you cannot see them. Survive to dawn, or become another name in the morning papers.',
    genre: 'Top-down survivors-like',
    status: 'in-development',
    visibility: 'public',
    platforms: ['Windows', 'macOS', 'Linux', 'Steam Deck'],
    stores: [],
    features: [
      'A twelve-minute run built to be replayed, not endured',
      'Light is the resource — what you can see is what you can survive',
      'Weapons that evolve into something worse the longer you carry them',
      'Victorian Whitechapel, rendered as a place that is losing',
    ],
    price: '~$4.99 at launch',
  },
  {
    slug: 'inkbreak',
    title: 'Inkbreak',
    tagline: 'The lab octopus got out. Now it is breaking back in.',
    pitch:
      'You are a lab-augmented octopus that escaped, and you are going back for the others. Deep-sea black-sites where any surface is the floor — crawl the walls, hang from the ceiling, and fight from angles the guards cannot cover, four arms holding guns while four more carry you. Free the subjects, cuff the scientists, burn the research. Every one of those trips the alarm.',
    genre: '3D surface-crawling rogue-lite',
    status: 'in-development',
    visibility: 'public',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [],
    features: [
      'Full 3D traversal — walls and ceilings are all floor',
      'Four guns in four arms, aimed independently of where you are walking',
      'A heist that gets louder the greedier you are',
      'Freed creatures graft their traits onto you between runs',
    ],
    price: '~$14.99–$19.99 at launch',
  },
  {
    slug: 'boothill',
    title: 'Boothill',
    tagline: 'You dug up the wrong grave, and the whole territory wants you dead.',
    pitch:
      'A lone grave-robber on a cursed frontier, auto-firing six-shooters and salvaged hoodoo at a posse that will not stop coming. Every kill raises your Wanted level, and Wanted is the difficulty — push it for richer loot and deadlier hunters, or lay low and starve your own build. The best run rides the edge of the noose until sundown.',
    genre: 'Top-down survivors-like',
    status: 'concept',
    visibility: 'unlisted',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [],
  },
  {
    slug: 'nightside',
    title: 'Nightside',
    tagline: 'A lunar bore cracked open something old on the far side of the Moon.',
    pitch:
      'The last operator of an automated mining colony holds a breach that should never have been opened. Your suit-rig auto-fires whatever you have bolted to it — rail tech and salvaged relics — while you do nothing but move, because standing still is death. Every weapon is Tech or Occult, and the best builds live where the two contaminate each other.',
    genre: 'Top-down survivors-like',
    status: 'concept',
    visibility: 'unlisted',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [],
  },
];
