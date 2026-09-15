import { useContext } from 'react';
import { CartContext, type Cart } from './context';

export function useCart(): Cart {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
