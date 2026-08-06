import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/render';
import { GameCard } from '@/components/GameCard/GameCard';
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker';
import { getGame, type Game } from '@/data';
import i18n from './index';

/** A game with no `catalogue.*` entry in any locale — the fallback case. */
const untranslated: Game = {
  slug: 'untranslated-fixture',
  title: 'Fixture',
  tagline: 'An English tagline no translator has reached.',
  pitch: 'Pitch.',
  genre: 'Top-down action',
  status: 'concept',
  visibility: 'unlisted',
  platforms: ['Windows'],
  stores: [],
};

async function switchTo(code: string) {
  await i18n.changeLanguage(code);
}

describe('content translation overrides', () => {
  it('renders the Spanish tagline for a translated game', async () => {
    await switchTo('es');
    renderWithRouter(<GameCard game={getGame('lantern')!} />);

    expect(screen.getByText(/Las farolas de gas se apagan una a una/)).toBeInTheDocument();
  });

  it('falls back to the English in src/data when a locale has no override', async () => {
    await switchTo('de');
    renderWithRouter(<GameCard game={untranslated} />);

    expect(screen.getByText(untranslated.tagline)).toBeInTheDocument();
    // Never a raw key, never blank.
    expect(screen.queryByText(/catalogue\./)).not.toBeInTheDocument();
  });

  it('never translates the game title', async () => {
    await switchTo('fr');
    renderWithRouter(<GameCard game={getGame('lantern')!} />);

    expect(screen.getByRole('link', { name: 'Lantern' })).toBeInTheDocument();
  });

  it('translates the status badge with the chrome strings', async () => {
    await switchTo('de');
    renderWithRouter(<GameCard game={getGame('lantern')!} />);

    expect(screen.getByText('In Entwicklung')).toBeInTheDocument();
  });
});

describe('LanguagePicker', () => {
  it('lists every locale by its own endonym', () => {
    renderWithRouter(<LanguagePicker />);

    for (const label of ['English', 'Español', 'Français', 'Deutsch']) {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    }
  });

  it('switches the active language on selection', async () => {
    const user = userEvent.setup();
    renderWithRouter(<LanguagePicker />);

    await user.selectOptions(screen.getByRole('combobox'), 'fr');

    expect(i18n.resolvedLanguage).toBe('fr');
    expect(screen.getByText('Langue')).toBeInTheDocument();
  });

  it('reflects the current language rather than always showing English', async () => {
    await switchTo('es');
    renderWithRouter(<LanguagePicker />);

    expect(screen.getByRole('combobox')).toHaveValue('es');
  });
});
