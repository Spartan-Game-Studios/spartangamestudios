import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrackingMap } from './TrackingMap';

// Leaflet needs a real layout engine, which jsdom lacks; the component is written
// to no-op there. These tests just assert the accessible container renders and
// nothing throws (map init is caught).
describe('TrackingMap', () => {
  it('renders an accessible map container for a route', () => {
    render(
      <TrackingMap
        points={[
          { label: 'Shenzhen', lat: 22.5, lon: 114 },
          { label: 'Los Angeles', lat: 34, lon: -118 },
        ]}
        label="Route"
      />,
    );
    expect(screen.getByRole('img', { name: 'Route' })).toBeInTheDocument();
  });

  it('still renders the container with no points', () => {
    render(<TrackingMap points={[]} label="Route" />);
    expect(screen.getByRole('img', { name: 'Route' })).toBeInTheDocument();
  });
});
