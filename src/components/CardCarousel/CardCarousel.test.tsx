import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import { CardCarousel } from './CardCarousel';

describe('CardCarousel', () => {
  it('renders every child as a list item under a labelled carousel region', () => {
    renderWithRouter(
      <CardCarousel label="Games">
        <a href="/a">Alpha</a>
        <a href="/b">Beta</a>
        <a href="/c">Gamma</a>
      </CardCarousel>,
    );

    const region = screen.getByRole('group', { name: 'Games' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('shows no arrows when the content is not scrollable', () => {
    // Under jsdom the track reports zero size, so nothing overflows — the
    // carousel stays in its arrowless, centred state.
    renderWithRouter(
      <CardCarousel label="Games">
        <a href="/a">Alpha</a>
      </CardCarousel>,
    );
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
  });
});
