/**
 * Unwrap vendor JSON into display-ready business payloads (customer dashboard).
 * Preserves all vendor fields — only strips transport/envelope keys at the outer shell.
 */

export type VendorId = 'digitap' | 'ongrid' | 'digiverification' | 'unknown';

const TRANSPORT_KEYS = new Set([
  'vendor',
  'http_status',
  'httpstatus',
  'transport_error',
  'connection_error',
  'no_digitap_http_response',
  'digitap_response',
  'raw_text',
  'detail',
  'path',
  'timestamp',
  'transaction_id',
]);

const ENVELOPE_KEYS = new Set([
  ...TRANSPORT_KEYS,
  'apisource',
  'api_source',
  'providerref',
  'provider_ref',
  'result_code',
  'http_response_code',
  'client_ref_num',
  'request_id',
  'searchtype',
  'searchvalue',
  'productslug',
  'vendorslug',
  'creditsremaining',
  'outcome',
  'message',
  'status',
  'result',
]);

const ONGRID_BUSINESS_KEYS = [
  'data',
  'personal_data',
  'gstin_data',
  'gstin_list',
  'uan_profile_data',
  'uan_number',
  'uan_list',
  'bank_account_data',
  'profile_data',
  'rc_data',
  'dl_data',
  'passport_data',
  'employment_history',
  'employment_details',
  'employer_details',
  'challan_data',
  'challan_details',
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isNonEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
}

export function detectVendorId(
  body: Record<string, unknown> | null | undefined,
  vendorSlug?: string | null
): VendorId {
  const slug = (vendorSlug || '').trim().toLowerCase();
  if (slug === 'ongrid' || slug === 'digiverification' || slug === 'digitap') return slug as VendorId;
  const src = String(body?.apiSource ?? body?.api_source ?? '').toLowerCase();
  if (src.includes('ongrid')) return 'ongrid';
  if (src.includes('digiverification') || src.includes('digizene')) return 'digiverification';
  if (src.includes('digitap')) return 'digitap';
  if (body?.vendor === 'ongrid') return 'ongrid';
  if (body?.vendor === 'digiverification') return 'digiverification';
  if (isRecord(body) && ('gstin_data' in body || ('request_id' in body && 'path' in body))) return 'ongrid';
  if (isRecord(body) && typeof body.status === 'boolean' && 'data' in body) return 'digiverification';
  if (isRecord(body) && (body.result_code !== undefined || body.http_response_code !== undefined)) return 'digitap';
  return 'unknown';
}

function stripTransportShell(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const nk = k.toLowerCase().replace(/-/g, '_');
    if (TRANSPORT_KEYS.has(nk)) continue;
    out[k] = v;
  }
  return out;
}

function unwrapOngridInner(data: Record<string, unknown>): Record<string, unknown> | unknown[] | null {
  for (const key of ONGRID_BUSINESS_KEYS) {
    if (key === 'data') continue;
    const v = data[key];
    if (!isNonEmpty(v)) continue;
    if (Array.isArray(v)) return v;
    if (isRecord(v)) return v;
    return { [key]: v };
  }
  const extras: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === 'code' || k === 'message') continue;
    if (isNonEmpty(v)) extras[k] = v;
  }
  return Object.keys(extras).length ? extras : null;
}

function unwrapOngrid(raw: Record<string, unknown>): Record<string, unknown> | unknown[] | null {
  for (const key of ONGRID_BUSINESS_KEYS) {
    const v = raw[key];
    if (!isNonEmpty(v)) continue;
    if (key === 'data' && isRecord(v)) {
      const inner = unwrapOngridInner(v);
      if (inner) return inner;
      continue;
    }
    if (Array.isArray(v)) return v;
    if (isRecord(v)) return v;
    return { [key]: v };
  }
  const nested = raw.data;
  if (isRecord(nested)) {
    const inner = unwrapOngridInner(nested);
    if (inner) return inner;
  }
  const shell = stripTransportShell(raw);
  delete shell.code;
  delete shell.message;
  if (Object.keys(shell).length) return shell;
  return null;
}

function unwrapDigiVerification(raw: Record<string, unknown>): Record<string, unknown> | unknown[] | null {
  const data = raw.data;
  if (Array.isArray(data) && data.length) return data;
  if (isRecord(data) && Object.keys(data).length) return data;
  const pandata = raw.pandata;
  if (isRecord(pandata) && Object.keys(pandata).length) return pandata;
  const shell = stripTransportShell(raw);
  delete shell.status;
  if (Object.keys(shell).length) return shell;
  return null;
}

function unwrapDigitap(raw: Record<string, unknown>): Record<string, unknown> | unknown[] | null {
  const dr = raw.digitap_response;
  if (isRecord(dr)) return unwrapDigitap(dr);
  const res = raw.result;
  if (Array.isArray(res) && res.length) return res;
  if (isRecord(res) && Object.keys(res).length) return res;
  if (res !== null && res !== undefined && typeof res !== 'object') return { value: res };
  const shell: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (ENVELOPE_KEYS.has(k.toLowerCase())) continue;
    if (v !== null && v !== undefined && v !== '') shell[k] = v;
  }
  return Object.keys(shell).length ? shell : null;
}

export function unwrapVendorBusinessPayload(
  normalized: Record<string, unknown> | null | undefined,
  options?: {
    rawUpstream?: Record<string, unknown> | null;
    vendorSlug?: string | null;
  }
): Record<string, unknown> | unknown[] | null {
  if (!normalized && !options?.rawUpstream) return null;

  const vendor = detectVendorId(normalized ?? options?.rawUpstream ?? undefined, options?.vendorSlug);
  const norm = normalized ?? {};
  const raw = options?.rawUpstream ?? null;

  const fromNormResult = norm.result;
  if (Array.isArray(fromNormResult) && fromNormResult.length) return fromNormResult;
  if (isRecord(fromNormResult) && Object.keys(fromNormResult).length) {
    if (vendor === 'ongrid') {
      const inner = unwrapOngrid(fromNormResult);
      if (inner) return inner;
    }
    return fromNormResult;
  }

  if (raw && isRecord(raw)) {
    if (vendor === 'ongrid') {
      const u = unwrapOngrid(raw);
      if (u) return u;
    }
    if (vendor === 'digiverification') {
      const u = unwrapDigiVerification(raw);
      if (u) return u;
    }
    if (vendor === 'digitap' || vendor === 'unknown') {
      const u = unwrapDigitap(raw);
      if (u) return u;
    }
  }

  if (vendor === 'digiverification' && isRecord(norm)) {
    return unwrapDigiVerification(norm);
  }
  if (vendor === 'ongrid' && isRecord(norm)) {
    return unwrapOngrid(norm);
  }

  return unwrapDigitap(norm);
}
