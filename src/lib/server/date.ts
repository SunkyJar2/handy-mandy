/**
 * Robust date formatting utility for Prisma 8 Temporal.Instant, Date, or ISO strings.
 */
export function toIsoDateTime(val: unknown): string {
  if (!val) return '';
  if (typeof (val as any)?.epochMilliseconds === 'number') {
    return new Date((val as any).epochMilliseconds).toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'string') {
    return val;
  }
  return String(val);
}
