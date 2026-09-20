import { describe, expect, it } from 'vitest';
import { merch, listedMerch, merchIsOpen, formatPrice } from '@/data';

describe('merch catalogue', () => {
  it('has unique, url-safe slugs', () => {
    const slugs = merch.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('gives every item the fields a card needs', () => {
    for (const item of merch) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.tagline.length).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThan(0);
      expect(item.currency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('has the launch item open and the rest still sold out', () => {
    expect(merchIsOpen()).toBe(true);
    const available = merch.filter((m) => m.available).map((m) => m.slug);
    expect(available).toEqual(['boothill-wanted-tee']);
  });

  it('lists available items first', () => {
    // With nothing available yet this is a no-op ordering, but it guards the
    // rule for when items go live.
    const flags = listedMerch().map((m) => Number(m.available));
    const sorted = [...flags].sort((a, b) => b - a);
    expect(flags).toEqual(sorted);
  });

  it('formats prices in the item currency', () => {
    expect(formatPrice(27, 'USD', 'en')).toBe('$27.00');
  });
});
