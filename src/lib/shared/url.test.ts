import { describe, it, expect } from 'vitest';
import { sanitizeNextUrl } from './url';
import { cleanUrl } from '../../prisma/db';

describe('sanitizeNextUrl', () => {
  it('returns / for null, undefined, or empty strings', () => {
    expect(sanitizeNextUrl(null)).toBe('/');
    expect(sanitizeNextUrl(undefined)).toBe('/');
    expect(sanitizeNextUrl('')).toBe('/');
  });

  it('allows valid internal paths with query strings', () => {
    expect(sanitizeNextUrl('/catalog')).toBe('/catalog');
    expect(sanitizeNextUrl('/catalog?category=lighting')).toBe('/catalog?category=lighting');
    expect(sanitizeNextUrl('/technicians?orderId=123')).toBe('/technicians?orderId=123');
  });

  it('rejects protocol-relative, backslash-relative, and external URLs', () => {
    expect(sanitizeNextUrl('//evil.com')).toBe('/');
    expect(sanitizeNextUrl('/\\evil.com')).toBe('/');
    expect(sanitizeNextUrl('https://evil.com')).toBe('/');
    expect(sanitizeNextUrl('javascript:alert(1)')).toBe('/');
  });
});

describe('cleanUrl', () => {
  it('sets uselibpqcompat=true when adding sslmode=require for remote hosts', () => {
    const res = cleanUrl('postgresql://user:pass@ep-test.aws.neon.tech/neondb');
    expect(res).toContain('sslmode=require');
    expect(res).toContain('uselibpqcompat=true');
  });
});
