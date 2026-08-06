import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import type { Game } from '@/data';
import { GameCard } from './GameCard';

const game: Game = {
  slug: 'lantern',
  title: 'Lantern',
  tagline: 'The gas lamps are going out one by one.',
  pitch: 'Pitch.',
  genre: 'Top-down survivors-like',
  status: 'in-development',
  visibility: 'public',
  platforms: ['Windows', 'macOS'],
  stores: [],
};

describe('GameCard', () => {
  it('links to the game page and shows its status', () => {
    renderWithRouter(<GameCard game={game} />);

    expect(screen.getByRole('link', { name: 'Lantern' })).toHaveAttribute('href', '/games/lantern');
    expect(screen.getByText('In development')).toBeInTheDocument();
    expect(screen.getByText(game.tagline)).toBeInTheDocument();
  });

  it('falls back to a decorative tile when there is no key art', () => {
    renderWithRouter(<GameCard game={game} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders key art with its alt text when present', () => {
    renderWithRouter(
      <GameCard
        game={{ ...game, keyArt: { src: '/games/lantern.png', alt: 'Fog over Whitechapel' } }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Fog over Whitechapel' })).toHaveAttribute(
      'src',
      '/games/lantern.png',
    );
  });
});
