export interface CheckoutOptions {
  includeInstallation: boolean;
  includeHub: boolean;
  preferredDate: string | null;
  specialInstructions: string | null;
}

export function formatLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowLocalDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDateInput(d);
}

export function getMaxBookingLocalDate(daysAhead = 60): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return formatLocalDateInput(d);
}

export function formatIsoDateDisplay(isoDate: string | null): string {
  if (!isoDate || !isoDate.trim()) {
    return 'Earliest Available (1-2 business days)';
  }
  try {
    const parts = isoDate.split('-');
    if (parts.length >= 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2].slice(0, 2));
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const localDate = new Date(y, m - 1, d);
        return localDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    const fallback = new Date(isoDate);
    if (!isNaN(fallback.getTime())) {
      return fallback.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}

export function parseCheckoutOptionsCookie(raw?: string | null): CheckoutOptions {
  const defaults: CheckoutOptions = {
    includeInstallation: true,
    includeHub: false,
    preferredDate: null,
    specialInstructions: null
  };

  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaults;
    return {
      includeInstallation: typeof parsed.includeInstallation === 'boolean' ? parsed.includeInstallation : true,
      includeHub: typeof parsed.includeHub === 'boolean' ? parsed.includeHub : false,
      preferredDate: parsed.preferredDate ? String(parsed.preferredDate).slice(0, 10) : null,
      specialInstructions: parsed.specialInstructions ? String(parsed.specialInstructions).trim() : null
    };
  } catch {
    return defaults;
  }
}
