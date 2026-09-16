import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import { useCart } from './useCart';

// The stub catalogue prices these at $27 (tee) and $45 (hoodie).
function Harness() {
  const { count, subtotal, add, setQty, remove } = useCart();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal}</span>
      <button onClick={() => add('boothill-wanted-tee')}>add-tee</button>
      <button onClick={() => add('sgs-wordmark-hoodie')}>add-hoodie</button>
      <button onClick={() => setQty('boothill-wanted-tee', 3)}>set-3</button>
      <button onClick={() => remove('boothill-wanted-tee')}>remove-tee</button>
    </div>
  );
}

describe('cart', () => {
  beforeEach(() => localStorage.clear());

  it('adds distinct items and totals them', () => {
    renderWithRouter(<Harness />);
    fireEvent.click(screen.getByText('add-tee'));
    fireEvent.click(screen.getByText('add-hoodie'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('subtotal').textContent).toBe('72');
  });

  it('merges a repeat add into quantity', () => {
    renderWithRouter(<Harness />);
    fireEvent.click(screen.getByText('add-tee'));
    fireEvent.click(screen.getByText('add-tee'));
    expect(screen.getByTestId('count').textContent).toBe('2');
    expect(screen.getByTestId('subtotal').textContent).toBe('54');
  });

  it('sets quantity and recomputes; zero removes', () => {
    renderWithRouter(<Harness />);
    fireEvent.click(screen.getByText('add-tee'));
    fireEvent.click(screen.getByText('set-3'));
    expect(screen.getByTestId('subtotal').textContent).toBe('81');
    fireEvent.click(screen.getByText('remove-tee'));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('persists lines to localStorage', () => {
    renderWithRouter(<Harness />);
    fireEvent.click(screen.getByText('add-tee'));
    expect(JSON.parse(localStorage.getItem('sgs-cart') ?? '[]')).toEqual([
      { slug: 'boothill-wanted-tee', qty: 1 },
    ]);
  });
});
