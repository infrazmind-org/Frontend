import { legacyCustomerPayload } from './searchResultFields';
import { resultFieldLabel } from './resultFieldLabels';
import { isMetadataKey, stripMetadataDeep } from './resultMetadata';

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isMetadataKey(k)) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenObject(v as Record<string, unknown>, key));
    } else if (Array.isArray(v)) {
      try {
        out[key] = JSON.stringify(v);
      } catch {
        out[key] = String(v);
      }
    } else {
      out[key] = v === null || v === undefined ? '' : String(v);
    }
  }
  return out;
}

/** One CSV row per bulk search result. */
export function bulkResultToFlatRow(row: Record<string, unknown>, index: number): Record<string, string> {
  const flat: Record<string, string> = {
    row: String(index + 1),
    search_value: String(row.searchValue ?? ''),
    outcome: String(row.outcome ?? ''),
  };

  if (row.outcome === 'empty') {
    flat.message = String(row.message ?? 'No record was found for this identifier.');
    if (row.creditsRemaining !== undefined) flat.credits_remaining = String(row.creditsRemaining);
    return flat;
  }

  if (row.outcome === 'success' && row.data !== undefined) {
    const data = stripMetadataDeep(row.data);
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(flat, flattenObject(data as Record<string, unknown>));
    } else {
      flat.result = typeof data === 'string' ? data : JSON.stringify(data);
    }
    if (row.creditsRemaining !== undefined) flat.credits_remaining = String(row.creditsRemaining);
    return flat;
  }

  const legacy = legacyCustomerPayload(row);
  if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
    Object.assign(flat, flattenObject(stripMetadataDeep(legacy) as Record<string, unknown>));
  } else if (Array.isArray(legacy)) {
    flat.result = JSON.stringify(legacy);
  } else {
    flat.message = String(row.message ?? row.error ?? '');
  }
  if (row.creditsRemaining !== undefined) flat.credits_remaining = String(row.creditsRemaining);
  return flat;
}

const CSV_HEADER_ORDER = ['row', 'search_value', 'outcome', 'message', 'credits_remaining'];

export function buildBulkResultsCsv(rows: Record<string, unknown>[]): string {
  const flatRows = rows.map((r, i) => bulkResultToFlatRow(r, i));
  const keySet = new Set<string>();
  for (const r of flatRows) Object.keys(r).forEach((k) => keySet.add(k));
  const rest = [...keySet].filter((k) => !CSV_HEADER_ORDER.includes(k)).sort((a, b) => a.localeCompare(b));
  const headers = [...CSV_HEADER_ORDER.filter((k) => keySet.has(k)), ...rest];

  const headerLine = headers.map((h) => escapeCsvCell(resultFieldLabel(h))).join(',');
  const dataLines = flatRows.map((r) => headers.map((h) => escapeCsvCell(r[h] ?? '')).join(','));
  return [headerLine, ...dataLines].join('\r\n');
}

export function downloadBulkResultsCsv(rows: Record<string, unknown>[], productSlug: string): void {
  if (!rows.length) return;
  const csv = buildBulkResultsCsv(rows);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const slug = (productSlug || 'bulk').replace(/[^\w-]+/g, '_');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `infrazmind-bulk-${slug}-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
