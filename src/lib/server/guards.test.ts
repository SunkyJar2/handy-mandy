import { describe, it, expect } from 'vitest';
import {
  validateActiveCartItems,
  resolveUserAddressId,
  canCompletePayment,
  canAssignTechnician,
  nextOrderNumberFromMax
} from './guards';

describe('validateActiveCartItems', () => {
  it('returns false for empty cart', () => {
    expect(validateActiveCartItems([])).toBe(false);
  });

  it('returns false if any item has missing product or status !== ACTIVE', () => {
    const withInactive = [
      { product: { status: 'ACTIVE' } },
      { product: { status: 'INACTIVE' } }
    ] as any;
    expect(validateActiveCartItems(withInactive)).toBe(false);

    const withNullProduct = [
      { product: null }
    ] as any;
    expect(validateActiveCartItems(withNullProduct)).toBe(false);
  });

  it('returns true when all items have status === ACTIVE', () => {
    const valid = [
      { product: { status: 'ACTIVE' } },
      { product: { status: 'ACTIVE' } }
    ] as any;
    expect(validateActiveCartItems(valid)).toBe(true);
  });
});

describe('resolveUserAddressId', () => {
  const addresses = [
    { id: 'addr-1', isDefault: true },
    { id: 'addr-2', isDefault: false }
  ] as any;

  it('returns savedCookieId if it matches an address in userAddresses', () => {
    expect(resolveUserAddressId('addr-2', addresses)).toBe('addr-2');
  });

  it('falls back to the first address id if savedCookieId does not match', () => {
    expect(resolveUserAddressId('other-user-addr', addresses)).toBe('addr-1');
    expect(resolveUserAddressId(null, addresses)).toBe('addr-1');
    expect(resolveUserAddressId(undefined, addresses)).toBe('addr-1');
  });

  it('returns empty string if user has no addresses', () => {
    expect(resolveUserAddressId('addr-1', [])).toBe('');
    expect(resolveUserAddressId(null, [])).toBe('');
  });
});

describe('canCompletePayment', () => {
  it('returns complete for PENDING_PAYMENT', () => {
    expect(canCompletePayment('PENDING_PAYMENT')).toBe('complete');
  });

  it('returns idempotent for post-payment statuses', () => {
    expect(canCompletePayment('PENDING_ASSIGNMENT')).toBe('idempotent');
    expect(canCompletePayment('ASSIGNED')).toBe('idempotent');
    expect(canCompletePayment('SCHEDULED')).toBe('idempotent');
    expect(canCompletePayment('IN_PROGRESS')).toBe('idempotent');
    expect(canCompletePayment('COMPLETED')).toBe('idempotent');
  });

  it('returns invalid for CANCELLED', () => {
    expect(canCompletePayment('CANCELLED')).toBe('invalid');
  });
});

describe('canAssignTechnician', () => {
  it('returns true only for PENDING_ASSIGNMENT and ASSIGNED', () => {
    expect(canAssignTechnician('PENDING_ASSIGNMENT')).toBe(true);
    expect(canAssignTechnician('ASSIGNED')).toBe(true);
  });

  it('returns false for other statuses', () => {
    expect(canAssignTechnician('PENDING_PAYMENT')).toBe(false);
    expect(canAssignTechnician('SCHEDULED')).toBe(false);
    expect(canAssignTechnician('IN_PROGRESS')).toBe(false);
    expect(canAssignTechnician('COMPLETED')).toBe(false);
    expect(canAssignTechnician('CANCELLED')).toBe(false);
  });
});

describe('nextOrderNumberFromMax', () => {
  it('computes next order number from the max sequence even when orders were deleted', () => {
    const datePrefix = 'HM-261022';
    // Even if array has only 1 element, max sequence is 0042 -> next should be 0043
    const existing = ['HM-261022-0042'];
    expect(nextOrderNumberFromMax(datePrefix, existing)).toBe('HM-261022-0043');

    // Multiple orders out of order
    const existingMultiple = ['HM-261022-0001', 'HM-261022-0005', 'HM-261022-0003'];
    expect(nextOrderNumberFromMax(datePrefix, existingMultiple)).toBe('HM-261022-0006');

    // Empty list starts at 0001
    expect(nextOrderNumberFromMax(datePrefix, [])).toBe('HM-261022-0001');
  });
});
