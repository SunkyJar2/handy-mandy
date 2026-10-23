import { describe, expect, it } from 'vitest';
import {
  parseSelectedCartItemIds,
  filterCheckoutCartItems,
  computeSelectedCartTotals,
  filterProductsByQuery,
  filterTechniciansByLocation
} from './cart-selection';

describe('cart-selection helpers', () => {
  const sampleItems = [
    { id: 'ci-1', productId: 'p-1', quantity: 2, available: true, product: { id: 'p-1', priceIdr: 450000, status: 'ACTIVE' } },
    { id: 'ci-2', productId: 'p-2', quantity: 1, available: true, product: { id: 'p-2', priceIdr: 800000, status: 'ACTIVE' } },
    { id: 'ci-3', productId: 'p-3', quantity: 1, available: false, product: { id: 'p-3', priceIdr: 300000, status: 'INACTIVE' } }
  ];

  it('parses valid JSON string array from cookie and rejects malformed input', () => {
    expect(parseSelectedCartItemIds('["ci-1","ci-2"]')).toEqual(['ci-1', 'ci-2']);
    expect(parseSelectedCartItemIds('')).toBeNull();
    expect(parseSelectedCartItemIds('not-json')).toBeNull();
    expect(parseSelectedCartItemIds('{"bad":true}')).toBeNull();
    expect(parseSelectedCartItemIds('[]')).toBeNull();
  });

  it('returns all active items when cookie selection is null, or only matching active items when provided', () => {
    expect(filterCheckoutCartItems(sampleItems, null).map((i) => i.id)).toEqual(['ci-1', 'ci-2']);
    expect(filterCheckoutCartItems(sampleItems, ['ci-2', 'ci-3']).map((i) => i.id)).toEqual(['ci-2']);
  });

  it('computes selected item count (sum of quantities) and IDR subtotal for checked available items', () => {
    const res = computeSelectedCartTotals(sampleItems, new Set(['ci-1', 'ci-3']));
    expect(res).toEqual({ selectedLineCount: 1, selectedUnitCount: 2, subtotalIdr: 900000 });
  });

  it('filters products case-insensitively across name, description, and category name', () => {
    const products = [
      { name: 'Smart Door Lock', description: 'Biometric deadbolt', category: { name: 'Security' } },
      { name: 'Warm Smart Bulb', description: 'Dimmable E27 LED', category: { name: 'Lighting' } }
    ];
    expect(filterProductsByQuery(products, 'biometric')).toHaveLength(1);
    expect(filterProductsByQuery(products, 'LIGHTING')).toHaveLength(1);
    expect(filterProductsByQuery(products, '   ')).toHaveLength(2);
  });

  it('filters technicians by name, city, highlight, or service area', () => {
    const techs = [
      { fullName: 'Thaariq Cahya', city: 'Surabaya', areas: ['Menanggal', 'Gayungan'], highlight: 'Door locks' },
      { fullName: 'Rezvan Budi', city: 'Surabaya', areas: ['Gubeng', 'Sukolilo'], highlight: 'Lighting mesh' }
    ];
    expect(filterTechniciansByLocation(techs, 'menanggal').map((t) => t.fullName)).toEqual(['Thaariq Cahya']);
    expect(filterTechniciansByLocation(techs, 'gubeng').map((t) => t.fullName)).toEqual(['Rezvan Budi']);
    expect(filterTechniciansByLocation(techs, '')).toHaveLength(2);
  });
});

