/** Detect vendor / envelope fields that must not appear in customer search UIs. */

const METADATA_KEYS_NORMALIZED = new Set([
  'apisource',
  'api_source',
  'providerref',
  'provider_ref',
  'raw',
  'message',
  'msg',
  'detail',
  'error',
  'error_message',
  'err',
  'result_code',
  'resultcode',
  'http_response_code',
  'httpresponsecode',
  'http_code',
  'response_code',
  'client_ref_num',
  'clientrefnum',
  'client_ref',
  'clientref',
  'request_id',
  'requestid',
  'searchtype',
  'searchvalue',
  'productslug',
  'creditsremaining',
  'outcome',
  'result',
  'items',
  'txn_id',
  'transaction_ref',
  'uan_source',
  'source',
  'data_source',
  'source_type',
  'vendor',
  'vendor_slug',
  'vendorslug',
  // Vendor-internal blobs nested inside business payloads (e.g. skip tracing).
  'metadata',
  'meta_data',
  'meta',
  // Skip tracing PDF report URL — admin only, not customer dashboard.
  'report',
  'report_url',
]);

const ENVELOPE_STATUS_VALUES = new Set([
  'success',
  'not found',
  'notfound',
  'upstreamerror',
  'failed',
  'denied',
  'error',
]);

function normalizeKey(key: string): string {
  const s = key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/-/g, '_');
  return s.replace(/_+/g, '_');
}

function isEmptyAfterStrip(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'boolean' || typeof value === 'number') return false;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmptyAfterStrip);
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0;
  }
  return false;
}

export function isMetadataKey(key: string): boolean {
  const nk = normalizeKey(key);
  if (!nk || nk.startsWith('_')) return true;
  return METADATA_KEYS_NORMALIZED.has(nk);
}

export function isMetadataEntry(key: string, value: unknown): boolean {
  if (isMetadataKey(key)) return true;
  const nk = normalizeKey(key);
  if (nk === 'status') {
    if (typeof value === 'string' && ENVELOPE_STATUS_VALUES.has(value.trim().toLowerCase())) return true;
    if (typeof value === 'number' && [101, 102, 103, 200, 201].includes(value)) return true;
  }
  if ((nk === 'code' || nk === 'responsecode') && typeof value === 'number') return true;
  return false;
}

/** Remove metadata keys recursively from API payloads before display. */
export function stripMetadataDeep(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map(stripMetadataDeep).filter((x) => !isEmptyAfterStrip(x));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (isMetadataEntry(k, v)) continue;
      const cleaned = stripMetadataDeep(v);
      if (!isEmptyAfterStrip(cleaned)) out[k] = cleaned;
    }
    return out;
  }
  return value;
}

/** @deprecated use isMetadataKey */
export const METADATA_KEYS = METADATA_KEYS_NORMALIZED;
