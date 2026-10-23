const KNOWN_SURABAYA_DISTRICTS: Record<string, string> = {
  menanggal: '60234',
  gayungan: '60235',
  gubeng: '60281',
  kertajaya: '60282',
  sukolilo: '60111',
  mulyorejo: '60115',
  wonokromo: '60243',
  rungkut: '60293',
  tegalsari: '60262',
  sawahan: '60251',
  wiyung: '60228',
  lakarsantri: '60211',
  genteng: '60275',
  kenjeran: '60129',
  tandes: '60187'
};

export interface QuickAddressParsed {
  label: string;
  province: string;
  city: string;
  district: string;
  addressLine: string;
  postalCode: string;
}

export function parseQuickSurabayaAddress(input: {
  label: string;
  rawAddress: string;
}): QuickAddressParsed {
  const cleanLabel = input.label.trim() || 'Saved Address';
  const raw = input.rawAddress.trim();

  const postalMatch = raw.match(/\b(\d{5})\b/);
  let postalCode = postalMatch ? postalMatch[1] : '';

  const segments = raw
    .replace(/\b\d{5}\b/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let district = '';
  const kecSegment = segments.find((s) => /^kec\.?\s+/i.test(s));
  if (kecSegment) {
    district = kecSegment.replace(/^kec\.?\s+/i, '').trim();
  }

  if (!district) {
    for (const seg of segments) {
      const lower = seg.toLowerCase();
      if (KNOWN_SURABAYA_DISTRICTS[lower]) {
        district = seg;
        break;
      }
    }
  }

  if (!district) {
    for (const [key] of Object.entries(KNOWN_SURABAYA_DISTRICTS)) {
      if (raw.toLowerCase().includes(key)) {
        district = key.charAt(0).toUpperCase() + key.slice(1);
        break;
      }
    }
  }

  if (!postalCode) {
    const matchedPostal = district ? KNOWN_SURABAYA_DISTRICTS[district.toLowerCase()] : undefined;
    postalCode = matchedPostal || '60234';
  }

  const streetSegments = segments.filter((s) => {
    const lower = s.toLowerCase();
    if (lower === 'surabaya' || lower === 'jawa timur' || lower === 'east java') return false;
    if (district && (lower === district.toLowerCase() || lower === `kec. ${district.toLowerCase()}` || lower === `kec ${district.toLowerCase()}`)) {
      return false;
    }
    return true;
  });

  if (!district) {
    district = streetSegments.length > 1 ? streetSegments[streetSegments.length - 1] : 'Surabaya Central';
  }

  const addressLine = (streetSegments.join(', ') || raw).slice(0, 200);

  return {
    label: cleanLabel.slice(0, 50),
    province: 'Jawa Timur',
    city: 'Surabaya',
    district: district.slice(0, 100),
    addressLine: addressLine.length >= 5 ? addressLine : `${addressLine}, Surabaya`,
    postalCode
  };
}

export function formatSavedAddressSummary(addr: {
  label?: string | null;
  district: string;
  city: string;
  addressLine: string;
  postalCode: string;
}): { title: string; subtitle: string } {
  return {
    title: addr.label?.trim() || addr.district || 'Saved Address',
    subtitle: `${addr.city}, ${addr.district}, ${addr.addressLine}, ${addr.postalCode}`
  };
}

