import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from '@/auth/AuthContext';
import { CartProvider } from '@/cart/CartContext';
import { games } from '@/data';
import i18n from '@/i18n';
import { LOCALE_CODES } from '@/i18n/locales';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  // The header reads session state, so every route needs the provider — the
  // same wrapper main.tsx puts around the router in production.
  return render(
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>,
  );
}

describe('routing', () => {
  it('renders the home page at /', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/games you own/i);
  });

  it('renders the games index', async () => {
    renderAt('/games');
    expect(await screen.findByRole('heading', { level: 1, name: 'Games' })).toBeInTheDocument();
  });

  it('renders a game landing page for every catalogue entry', async () => {
    for (const game of games) {
      const { unmount } = renderAt(`/games/${game.slug}`);
      expect(
        await screen.findByRole('heading', { level: 1, name: game.title }),
      ).toBeInTheDocument();
      unmount();
    }
  });

  it('warns on an unlisted game page that it is unannounced', async () => {
    const unlisted = games.find((game) => game.visibility === 'unlisted')!;
    renderAt(`/games/${unlisted.slug}`);
    expect(await screen.findByText(/unannounced/i)).toBeInTheDocument();
  });

  it('renders the press kit with a press contact', async () => {
    renderAt('/press');
    expect(await screen.findByRole('heading', { level: 1, name: 'Press kit' })).toBeInTheDocument();
    const pressLinks = screen.getAllByRole('link', { name: /press@spartangamestudios\.com/ });
    expect(pressLinks.length).toBeGreaterThan(0);
    expect(pressLinks[0]).toHaveAttribute('href', 'mailto:press@spartangamestudios.com');
  });

  it('renders the devlog index and a post', async () => {
    renderAt('/devlog');
    expect(await screen.findByRole('heading', { level: 1, name: 'Devlog' })).toBeInTheDocument();

    renderAt('/devlog/why-we-sell-games-the-old-way');
    expect(
      await screen.findByRole('heading', { level: 1, name: /why we sell games the old way/i }),
    ).toBeInTheDocument();
  });

  it('renders the merch index and a product page', async () => {
    renderAt('/merch');
    expect(await screen.findByRole('heading', { level: 1, name: 'Merch' })).toBeInTheDocument();

    renderAt('/merch/boothill-wanted-tee');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Boothill "Wanted" Tee/ }),
    ).toBeInTheDocument();
  });

  it('404s an unknown merch slug rather than crashing', async () => {
    renderAt('/merch/not-a-product');
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('falls through to 404 for unknown paths', async () => {
    renderAt('/nothing-here');
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('404s an unknown game slug rather than crashing', async () => {
    renderAt('/games/not-a-game');
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('sets the document title per route', async () => {
    renderAt('/press');
    await screen.findByRole('heading', { level: 1, name: 'Press kit' });
    expect(document.title).toBe('Press kit — Spartan Game Studios');
  });
});

describe('localised routing', () => {
  it('renders every route in every locale without falling back to a raw key', async () => {
    const paths = [
      '/',
      '/games',
      '/games/lantern',
      '/merch',
      '/merch/boothill-wanted-tee',
      '/cart',
      '/devlog',
      '/press',
      '/about',
      '/nope',
    ];

    for (const code of LOCALE_CODES) {
      await i18n.changeLanguage(code);
      for (const path of paths) {
        const { unmount, container } = renderAt(path);
        await screen.findByRole('heading', { level: 1 });
        // A missing key renders as its own dotted path — catch that anywhere.
        expect(container.textContent, `${code} ${path}`).not.toMatch(
          /\b(nav|common|status|stores|footer|home|games|gameDetail|merch|cart|devlog|press|about|notFound|meta)\.[a-zA-Z]/,
        );
        unmount();
      }
    }
  });

  it('translates chrome and content together on a game page', async () => {
    await i18n.changeLanguage('de');
    renderAt('/games/lantern');

    expect(await screen.findByRole('heading', { level: 1, name: 'Lantern' })).toBeInTheDocument();
    expect(screen.getByText('Auf einen Blick')).toBeInTheDocument();
    expect(screen.getByText(/Die Gaslaternen gehen eine nach der anderen aus/)).toBeInTheDocument();
  });

  it('sets the document title in the active locale', async () => {
    await i18n.changeLanguage('fr');
    renderAt('/games');
    await screen.findByRole('heading', { level: 1, name: 'Jeux' });
    expect(document.title).toBe('Jeux — Spartan Game Studios');
  });

  it('syncs the html lang attribute', async () => {
    await i18n.changeLanguage('es');
    renderAt('/');
    await screen.findByRole('heading', { level: 1 });
    expect(document.documentElement.lang).toBe('es');
  });
});
