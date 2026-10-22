export function validateActiveCartItems(
  items: Array<{ product?: { status?: string } | null } | null | undefined>
): boolean {
  if (!items || items.length === 0) return false;
  return items.every((item) => item && item.product && item.product.status === 'ACTIVE');
}

export function resolveUserAddressId(
  savedCookieId: string | null | undefined,
  userAddresses: Array<{ id: string }>
): string {
  if (!userAddresses || userAddresses.length === 0) return '';
  if (savedCookieId && userAddresses.some((a) => a.id === savedCookieId)) {
    return savedCookieId;
  }
  return userAddresses[0]?.id || '';
}

export function canCompletePayment(status: string): 'complete' | 'idempotent' | 'invalid' {
  if (status === 'PENDING_PAYMENT') return 'complete';
  if (['PENDING_ASSIGNMENT', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return 'idempotent';
  }
  return 'invalid';
}

export function canAssignTechnician(status: string): boolean {
  return status === 'PENDING_ASSIGNMENT' || status === 'ASSIGNED';
}

export function nextOrderNumberFromMax(datePrefix: string, existingOrderNumbers: string[]): string {
  let maxSeq = 0;
  const prefixWithDash = `${datePrefix}-`;
  for (const num of existingOrderNumbers) {
    if (num && num.startsWith(prefixWithDash)) {
      const seqPart = num.slice(prefixWithDash.length);
      const parsed = parseInt(seqPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `${datePrefix}-${nextSeq}`;
}
