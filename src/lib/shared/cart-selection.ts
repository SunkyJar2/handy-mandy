export function parseSelectedCartItemIds(raw: string | undefined | null): string[] | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const ids = parsed.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    return ids.length > 0 ? ids : null;
  } catch {
    return null;
  }
}

export function filterCheckoutCartItems<
  T extends { id: string; product?: { status: string; priceIdr: number } | null }
>(items: T[], selectedIds: string[] | null): T[] {
  const allowSet = selectedIds ? new Set(selectedIds) : null;
  return items.filter((item) => {
    if (!item.product || item.product.status !== 'ACTIVE') return false;
    return allowSet ? allowSet.has(item.id) : true;
  });
}

export function computeSelectedCartTotals<
  T extends { id: string; quantity: number; available: boolean; product: { priceIdr: number } }
>(items: T[], selectedIds: Set<string>): {
  selectedLineCount: number;
  selectedUnitCount: number;
  subtotalIdr: number;
} {
  let selectedLineCount = 0;
  let selectedUnitCount = 0;
  let subtotalIdr = 0;

  for (const item of items) {
    if (!item.available || !selectedIds.has(item.id)) continue;
    selectedLineCount += 1;
    selectedUnitCount += item.quantity;
    subtotalIdr += item.product.priceIdr * item.quantity;
  }

  return { selectedLineCount, selectedUnitCount, subtotalIdr };
}

export function filterProductsByQuery<
  T extends { name: string; description: string; category?: { name: string } | null }
>(products: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category?.name.toLowerCase().includes(q) ?? false)
  );
}

export function filterTechniciansByLocation<
  T extends { fullName: string; city: string; areas: string[]; highlight?: string | null }
>(technicians: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return technicians;
  return technicians.filter(
    (t) =>
      t.fullName.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.areas.some((a) => a.toLowerCase().includes(q)) ||
      (t.highlight?.toLowerCase().includes(q) ?? false)
  );
}

