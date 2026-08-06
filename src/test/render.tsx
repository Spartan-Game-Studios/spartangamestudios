import type { ReactElement } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/** Renders a component inside a router, which most of ours require. */
export function renderWithRouter(ui: ReactElement, route = '/'): RenderResult {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
