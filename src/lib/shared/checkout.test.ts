import { describe, it, expect } from 'vitest';
import {
  formatLocalDateInput,
  getTomorrowLocalDate,
  getMaxBookingLocalDate,
  formatIsoDateDisplay,
  parseCheckoutOptionsCookie
} from './checkout';
import { checkoutOptionsSchema } from './schemas';

describe('checkout date & cookie utilities', () => {
  it('formats local date as YYYY-MM-DD without UTC shift', () => {
    const d = new Date(2026, 9, 22, 2, 0, 0); // Oct 22 local 02:00 AM
    expect(formatLocalDateInput(d)).toBe('2026-10-22');
  });

  it('computes tomorrow and max booking local dates correctly', () => {
    const tomorrow = getTomorrowLocalDate();
    const now = new Date();
    const expectedTomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    expect(tomorrow).toBe(formatLocalDateInput(expectedTomorrowDate));

    const max60 = getMaxBookingLocalDate(60);
    const expectedMaxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);
    expect(max60).toBe(formatLocalDateInput(expectedMaxDate));
  });

  it('formats ISO date display safely without UTC backward shifting', () => {
    expect(formatIsoDateDisplay(null)).toBe('Earliest Available (1-2 business days)');
    expect(formatIsoDateDisplay('')).toBe('Earliest Available (1-2 business days)');
    const display = formatIsoDateDisplay('2026-10-30');
    expect(display).toContain('2026');
    expect(display).toContain('30');
    expect(display.toLowerCase()).toContain('oktober');
  });

  it('safely parses malformed checkout options cookie without throwing', () => {
    expect(parseCheckoutOptionsCookie('{bad-json')).toEqual({
      includeInstallation: true,
      includeHub: false,
      preferredDate: null,
      specialInstructions: null
    });
    expect(parseCheckoutOptionsCookie(null)).toEqual({
      includeInstallation: true,
      includeHub: false,
      preferredDate: null,
      specialInstructions: null
    });
    expect(parseCheckoutOptionsCookie(JSON.stringify({
      includeInstallation: false,
      includeHub: true,
      preferredDate: '2026-11-01',
      specialInstructions: 'Ring bell'
    }))).toEqual({
      includeInstallation: false,
      includeHub: true,
      preferredDate: '2026-11-01',
      specialInstructions: 'Ring bell'
    });
  });

  it('rejects today and past dates in checkoutOptionsSchema, accepts tomorrow and rejects > 60 days out', () => {
    const todayStr = formatLocalDateInput(new Date());
    const tomorrowStr = getTomorrowLocalDate();
    const pastStr = '2020-01-01';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 70);
    const tooFarStr = formatLocalDateInput(futureDate);

    expect(checkoutOptionsSchema.safeParse({ preferredDate: todayStr }).success).toBe(false);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: pastStr }).success).toBe(false);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: tooFarStr }).success).toBe(false);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: tomorrowStr }).success).toBe(true);
    expect(checkoutOptionsSchema.safeParse({ preferredDate: null }).success).toBe(true);
  });
});
