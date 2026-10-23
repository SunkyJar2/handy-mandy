import { describe, expect, it } from 'vitest';
import { parseQuickSurabayaAddress, formatSavedAddressSummary } from './address';

describe('parseQuickSurabayaAddress', () => {
  it('parses comma-separated Figma-style Surabaya quick address with postal code and known district', () => {
    const parsed = parseQuickSurabayaAddress({
      label: 'Home',
      rawAddress: 'Surabaya, Menanggal, Jl. Kembang Indah No. 12, 60267'
    });
    expect(parsed).toEqual({
      label: 'Home',
      province: 'Jawa Timur',
      city: 'Surabaya',
      district: 'Menanggal',
      addressLine: 'Jl. Kembang Indah No. 12',
      postalCode: '60267'
    });
  });

  it('extracts Kec. prefix and falls back to default Surabaya postal code when omitted', () => {
    const parsed = parseQuickSurabayaAddress({
      label: 'School',
      rawAddress: 'Pucang Anom No.91, Kertajaya, Kec. Gubeng, Surabaya'
    });
    expect(parsed.district).toBe('Gubeng');
    expect(parsed.city).toBe('Surabaya');
    expect(parsed.postalCode).toBe('60281');
    expect(parsed.addressLine).toContain('Pucang Anom No.91');
  });

  it('formats saved address title and subtitle cleanly', () => {
    expect(
      formatSavedAddressSummary({
        label: 'Home',
        district: 'Menanggal',
        city: 'Surabaya',
        addressLine: 'Jl. Kembang Indah',
        postalCode: '60267'
      })
    ).toEqual({
      title: 'Home',
      subtitle: 'Surabaya, Menanggal, Jl. Kembang Indah, 60267'
    });
  });
});

