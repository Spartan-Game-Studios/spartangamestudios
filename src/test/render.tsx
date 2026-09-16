import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AuthProvider } from '@/auth/AuthContext';
import { CartProvider } from '@/cart/CartContext';

/** Renders a component inside a router and i18n provider, as most of ours need. */
export function renderWithRouter(ui: ReactElement, route = '/'): RenderResult {
  return render(
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </CartProvider>
      </AuthProvider>
    </I18nextProvider>,
  );
}
