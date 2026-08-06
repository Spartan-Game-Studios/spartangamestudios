import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { games } from '@/data';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
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
    expect(document.title).toBe('Press — Spartan Game Studios');
  });
});
