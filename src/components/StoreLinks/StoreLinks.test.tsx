import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import { StoreLinks } from './StoreLinks';

describe('StoreLinks', () => {
  it('says so plainly when there is nowhere to buy yet', () => {
    renderWithRouter(<StoreLinks links={[]} title="Lantern" />);

    expect(screen.getByText(/not on sale yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /steam/i })).not.toBeInTheDocument();
  });

  it('renders one external link per storefront', () => {
    renderWithRouter(
      <StoreLinks
        title="Lantern"
        links={[
          { store: 'itch', url: 'https://example.itch.io/lantern' },
          { store: 'steam', url: 'https://store.steampowered.com/app/1' },
        ]}
      />,
    );

    const steam = screen.getByRole('link', { name: 'Steam' });
    expect(steam).toHaveAttribute('href', 'https://store.steampowered.com/app/1');
    expect(steam).toHaveAttribute('target', '_blank');
    expect(steam).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(screen.getByRole('link', { name: 'itch.io' })).toBeInTheDocument();
  });

  it('orders storefronts canonically regardless of data order', () => {
    renderWithRouter(
      <StoreLinks
        title="Lantern"
        links={[
          { store: 'android', url: 'https://play.google.com/x' },
          { store: 'steam', url: 'https://store.steampowered.com/app/1' },
          { store: 'itch', url: 'https://example.itch.io/lantern' },
        ]}
      />,
    );

    // Canonical order follows STOREFRONTS, with itch first so the DRM-free
    // "buy once, own it" store leads as the primary call-to-action.
    const names = screen.getAllByRole('link').map((el) => el.textContent);
    expect(names).toEqual(['itch.io', 'Steam', 'Google Play']);
  });

  it('honours a custom label such as a pre-launch wishlist', () => {
    renderWithRouter(
      <StoreLinks
        title="Lantern"
        links={[
          {
            store: 'steam',
            url: 'https://store.steampowered.com/app/1',
            label: 'Wishlist on Steam',
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Wishlist on Steam' })).toBeInTheDocument();
  });
});
