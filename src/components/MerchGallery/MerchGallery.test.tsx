import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import { MerchGallery } from './MerchGallery';

const images = [
  { src: '/1.jpg', alt: 'Front' },
  { src: '/2.jpg', alt: 'Detail' },
  { src: '/3.jpg', alt: 'On body' },
];

describe('MerchGallery', () => {
  it('renders every image and starts on the first', () => {
    renderWithRouter(<MerchGallery images={images} label="Tee" />);
    expect(screen.getByAltText('Front')).toBeInTheDocument();
    expect(screen.getByAltText('On body')).toBeInTheDocument();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('clicks through images with Next and dots — without needing the product page', () => {
    renderWithRouter(<MerchGallery images={images} label="Tee" />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('shows no controls for a single image', () => {
    renderWithRouter(<MerchGallery images={[{ src: '/1.jpg', alt: 'Front' }]} label="Mug" />);
    expect(screen.getByAltText('Front')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('renders nothing when given no images', () => {
    const { container } = renderWithRouter(<MerchGallery images={[]} label="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });
});
