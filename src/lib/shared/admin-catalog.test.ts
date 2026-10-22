import { describe, it, expect } from 'vitest';
import { adminProductPatchSchema, resolveCategoryIdBySlug } from './schemas';

describe('adminProductPatchSchema', () => {
  it('accepts valid partial updates', () => {
    const validPatch1 = { priceIdr: 250000 };
    expect(adminProductPatchSchema.safeParse(validPatch1).success).toBe(true);

    const validPatch2 = { status: 'INACTIVE' };
    expect(adminProductPatchSchema.safeParse(validPatch2).success).toBe(true);

    const validPatch3 = {
      name: 'Updated Name',
      description: 'Long enough description of device',
      isFeatured: true
    };
    expect(adminProductPatchSchema.safeParse(validPatch3).success).toBe(true);
  });

  it('rejects empty payload {}', () => {
    expect(adminProductPatchSchema.safeParse({}).success).toBe(false);
  });

  it('rejects invalid fields', () => {
    // negative price
    expect(adminProductPatchSchema.safeParse({ priceIdr: -100 }).success).toBe(false);
    // price below min
    expect(adminProductPatchSchema.safeParse({ priceIdr: 500 }).success).toBe(false);
    // short description
    expect(adminProductPatchSchema.safeParse({ description: 'short' }).success).toBe(false);
    // invalid status
    expect(adminProductPatchSchema.safeParse({ status: 'DELETED' }).success).toBe(false);
    // invalid kind
    expect(adminProductPatchSchema.safeParse({ kind: 'UNKNOWN' }).success).toBe(false);
  });
});

describe('resolveCategoryIdBySlug', () => {
  const categories = [
    { id: 'cat-1', slug: 'lighting', name: 'Lighting', sortOrder: 1 },
    { id: 'cat-2', slug: 'security', name: 'Security', sortOrder: 2 }
  ];

  it('returns matched=true with categoryId=undefined when selectedSlug is null or empty', () => {
    expect(resolveCategoryIdBySlug(categories, null)).toEqual({
      matched: true,
      categoryId: undefined
    });
    expect(resolveCategoryIdBySlug(categories, undefined)).toEqual({
      matched: true,
      categoryId: undefined
    });
    expect(resolveCategoryIdBySlug(categories, '')).toEqual({
      matched: true,
      categoryId: undefined
    });
  });

  it('returns matched=true with categoryId when selectedSlug matches', () => {
    expect(resolveCategoryIdBySlug(categories, 'lighting')).toEqual({
      matched: true,
      categoryId: 'cat-1'
    });
    expect(resolveCategoryIdBySlug(categories, 'security')).toEqual({
      matched: true,
      categoryId: 'cat-2'
    });
  });

  it('returns matched=false with categoryId=undefined when selectedSlug is not found', () => {
    expect(resolveCategoryIdBySlug(categories, 'audio')).toEqual({
      matched: false,
      categoryId: undefined
    });
    expect(resolveCategoryIdBySlug(categories, 'unknown')).toEqual({
      matched: false,
      categoryId: undefined
    });
  });
});
