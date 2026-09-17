import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';

vi.mock('@/cart/orders', () => ({
  merchApiConfigured: () => true,
  fetchOrders: vi.fn(),
}));

import { fetchOrders, type MerchOrder } from '@/cart/orders';
import { Orders } from './Orders';

const ORDER: MerchOrder = {
  id: 'ord_abc123',
  email: 'buyer@example.com',
  items: [
    {
      slug: 'boothill-wanted-tee',
      name: 'Boothill "Wanted" Tee',
      qty: 2,
      unitPrice: 2700,
      lineTotal: 5400,
    },
  ],
  amount: 5400,
  currency: 'usd',
  shipping: null,
  status: 'processing',
  provider: 'simulated',
  providerOrderId: 'SIM-ord_abc123',
  created_at: 1_700_000_000_000,
  updated_at: 1_700_000_000_000,
  tracking: {
    status: 'in_transit',
    carrier: 'SGS Logistics (simulated)',
    number: 'SIMABC123',
    events: [
      {
        status: 'received',
        description: 'Order received',
        at: 1_700_000_000_000,
        location: { label: 'Shenzhen, CN', lat: 22.5, lon: 114 },
      },
      {
        status: 'in_transit',
        description: 'Arrived at international hub',
        at: 1_700_000_100_000,
        location: { label: 'Los Angeles, US', lat: 34, lon: -118 },
      },
    ],
  },
};

describe('Orders', () => {
  it('lists an order with its items and tracking event log', async () => {
    vi.mocked(fetchOrders).mockResolvedValue([ORDER]);
    renderWithRouter(<Orders token="tok" locale="en" />);

    expect(await screen.findByText('Order ord_abc123')).toBeInTheDocument();
    expect(screen.getByText(/Boothill "Wanted" Tee/)).toBeInTheDocument();
    // Status badge uses the tracking headline status.
    expect(screen.getByText('In transit')).toBeInTheDocument();
    // Both carrier scans show in the log.
    expect(screen.getByText('Order received')).toBeInTheDocument();
    expect(screen.getByText('Arrived at international hub')).toBeInTheDocument();
  });

  it('shows an empty state when there are no orders', async () => {
    vi.mocked(fetchOrders).mockResolvedValue([]);
    renderWithRouter(<Orders token="tok" locale="en" />);
    expect(await screen.findByText('No orders yet.')).toBeInTheDocument();
  });
});
