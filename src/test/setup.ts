import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no scrollTo; react-router's ScrollRestoration calls it on navigate.
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
});
