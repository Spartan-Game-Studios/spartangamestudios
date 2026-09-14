import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import { Carousel } from './Carousel';

const items = [
  { src: '/a.jpg', alt: 'First shot' },
  { src: '/b.jpg', alt: 'Second shot' },
  { src: '/c.jpg', alt: 'Third shot' },
];

describe('Carousel', () => {
  it('renders every slide and starts on the first', () => {
    renderWithRouter(<Carousel items={items} label="Screens" />);

    expect(screen.getByAltText('First shot')).toBeInTheDocument();
    expect(screen.getByAltText('Third shot')).toBeInTheDocument();
    // Live-region status reflects the active slide.
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    // Nowhere to go back from the first slide.
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('advances with Next and clamps at the end', () => {
    renderWithRouter(<Carousel items={items} label="Screens" />);
    const next = screen.getByRole('button', { name: 'Next' });

    fireEvent.click(next);
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();

    fireEvent.click(next);
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    // At the last slide, Next is disabled.
    expect(next).toBeDisabled();
  });

  it('jumps to a slide when its dot is clicked', () => {
    renderWithRouter(<Carousel items={items} label="Screens" />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('moves with the arrow keys', () => {
    renderWithRouter(<Carousel items={items} label="Screens" />);
    const region = screen.getByRole('group', { name: 'Screens' });

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('renders nothing when given no items', () => {
    const { container } = renderWithRouter(<Carousel items={[]} label="Screens" />);
    expect(container).toBeEmptyDOMElement();
  });
});
