import type { QuoteResponse } from './types';

export const INSTALL_FEE_PER_UNIT_IDR = 150000;
export const HUB_PRICE_IDR = 450000;

/**
 * Formats integer rupiah to Indonesian standard: "Rp 450.000"
 */
export function formatIdr(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(amount);
  return `Rp ${formatted}`;
}

export interface QuoteParams {
  items: Array<{
    priceIdr: number;
    quantity: number;
    name?: string;
  }>;
  includeInstallation: boolean;
  includeHub: boolean;
}

/**
 * Pure pricing engine for Handy Mandy
 */
export function calculateQuote(params: QuoteParams): QuoteResponse {
  const { items, includeInstallation, includeHub } = params;

  let deviceCount = 0;
  let devicesSubtotalIdr = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity);
    deviceCount += qty;
    devicesSubtotalIdr += item.priceIdr * qty;
  }

  const installationFeeIdr = includeInstallation ? INSTALL_FEE_PER_UNIT_IDR * deviceCount : 0;
  const addOnsIdr = includeHub ? HUB_PRICE_IDR : 0;
  const totalIdr = devicesSubtotalIdr + installationFeeIdr + addOnsIdr;

  const lines = [
    {
      label: `Devices (${deviceCount} item${deviceCount === 1 ? '' : 's'})`,
      quantity: deviceCount,
      amountIdr: devicesSubtotalIdr
    }
  ];

  if (includeInstallation) {
    lines.push({
      label: 'Professional Installation',
      quantity: deviceCount,
      amountIdr: installationFeeIdr
    });
  }

  if (includeHub) {
    lines.push({
      label: 'Zigbee Multi-Protocol Gateway Hub Gen 3',
      quantity: 1,
      amountIdr: addOnsIdr
    });
  }

  return {
    deviceCount,
    devicesSubtotalIdr,
    installationFeeIdr,
    addOnsIdr,
    totalIdr,
    lines
  };
}
