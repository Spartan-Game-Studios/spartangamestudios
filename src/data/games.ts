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
    // Pulled from the public lineup for now; the page stays reachable by direct
    // link. Flip back to 'public' to relist.
    visibility: 'unlisted',
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
    // Pulled from the public lineup for now; the page stays reachable by direct
    // link. Flip back to 'public' to relist.
    visibility: 'unlisted',
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
    status: 'early-access',
    visibility: 'public',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [
      // itch is live and playable now, so it leads; Steam is a wishlist page
      // ahead of the full launch. (Google Play listing isn't public yet.)
      {
        store: 'itch',
        url: 'https://spartan-game-studios.itch.io/boothill',
        label: 'Play now',
      },
      {
        store: 'steam',
        url: 'https://store.steampowered.com/app/5104850/',
        label: 'Wishlist',
      },
    ],
    keyArt: {
      src: '/games/boothill/key-art.jpg',
      alt: 'A lone cowboy boot atop a boot-hill graveyard at sundown, beneath the Boothill logo',
    },
    screenshots: [
      {
        src: '/games/boothill/screenshot-2.jpg',
        alt: 'A graveyard swarmed by the posse as area attacks scythe through the horde amid a storm of loot and damage numbers',
      },
      {
        src: '/games/boothill/screenshot-4.jpg',
        alt: 'Late in a run near sundown, radiant beams sweep a cemetery thick with cash and gem pickups',
      },
      {
        src: '/games/boothill/screenshot-3.jpg',
        alt: 'Early game at night in the rain, the lone gunslinger fighting skeletons among the headstones and angel statues',
      },
      {
        src: '/games/boothill/screenshot-1.jpg',
        alt: 'The level-up draft: choosing between Ferocity, Volley, and a Legendary Hurricane synergy card',
      },
    ],
    features: [
      'Every kill raises your Wanted level — and Wanted is the difficulty',
      'Weapons only evolve once you are notorious enough to deserve it',
      'Fifteen minutes to sundown, and something waiting for you at the end',
      'Open frontier with real cover, so where you stand is a decision',
    ],
    price: '$2.99 at launch',
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
  {
    slug: 'mad-mary',
    title: 'Mad Mary',
    tagline: 'The wolves came for the flock. Mary brought guns.',
    pitch:
      'You command a pack of Australian shepherds — each with a gun, laser, or missile pod bolted to its back — as one unit, driving them across the field to body-block a wolf horde away from the sheep. The flock is your lives and your economy at once: sheep graze the wool you spend between waves on more dogs, nastier weapons, and automated defenses. Herd the pack, melt the horde, and never let them reach a sheep.',
    genre: '3D pack-shooter tower defense',
    status: 'concept',
    visibility: 'unlisted',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [],
    features: [
      'Drive a whole pack of gun-strapped shepherds as a single unit',
      'The flock is your lives and your economy — every sheep lost costs you both',
      'Wave after wave of wolves, answered with turrets, fences, and overwhelming firepower',
      'Herding dogs, reimagined as a mobile artillery battery',
    ],
    price: '~$12.99 at launch',
  },
];
