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
    status: 'released',
    visibility: 'public',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [
      // itch leads (the studio's main CTA); Steam is live too. Google Play
      // listing isn't public yet.
      {
        store: 'itch',
        url: 'https://spartan-game-studios.itch.io/boothill',
        label: 'Play now',
      },
      {
        store: 'steam',
        url: 'https://store.steampowered.com/app/5104850/',
        label: 'Buy on Steam',
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
    price: '$2.99',
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
    title: 'Mad Mary: Space Shepherd',
    tagline: 'A shepherd a long way from Earth: herd by day, hold the line by night.',
    pitch:
      'Mary runs a ranch on the wrong side of a strange frontier, with a pack of dogs that have guns bolted to their backs and a flock the planet wants. By day you herd the wild sheep home, breed the flock on real genetics — value for the merchant, hardiness to survive the dark, methane to power the place — and plumb water to the troughs and a digester that turns muck into electricity. By night the planet comes for the sheep, and you hold the line behind five kinds of turret and your gun-strapped pack. Every day you build; every night you find out whether it was enough.',
    genre: 'Ranch-sim tower defense',
    status: 'in-development',
    visibility: 'public',
    platforms: ['Windows', 'macOS', 'Linux'],
    stores: [
      {
        store: 'steam',
        url: 'https://store.steampowered.com/app/5199310/',
        label: 'Wishlist',
      },
    ],
    keyArt: {
      src: '/games/mad-mary/key-art.jpg',
      alt: 'Mary, a red-haired shepherd in dark armor, levels a glowing rifle amid her flock and gun-strapped shepherd dogs under a violet dusk sky.',
    },
    screenshots: [
      {
        src: '/games/mad-mary/screenshot-1.jpg',
        alt: 'By day, Mary herds a flock of low-poly black-faced sheep past a red barn under a bright blue sky.',
      },
      {
        src: '/games/mad-mary/screenshot-2.jpg',
        alt: 'The flock gathers at dusk beneath an old watchtower, a shepherd dog at Mary’s side.',
      },
      {
        src: '/games/mad-mary/screenshot-3.jpg',
        alt: 'At sunset, a line of shepherd dogs with back-mounted turrets advances past the fence to guard the flock.',
      },
      {
        src: '/games/mad-mary/screenshot-4.jpg',
        alt: 'After dark, the gun-strapped shepherds open fire on the treeline as the night assault begins.',
      },
    ],
    features: [
      'A full day/night loop — ranch and herd by day, defend the flock by night',
      'Breed your flock on real genetics: value for the merchant, hardiness to survive the dark, methane to fuel the ranch',
      'Plumb water to the troughs and digest muck into power — better pipes and better genetics fly your ship further',
      'Arm your pack of dogs with five turret types, from a cheap cannon to a laser',
    ],
    price: '$7.99 at launch',
  },
];
