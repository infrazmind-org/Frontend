import React, { useMemo } from 'react';
import { CustomerResultView } from './customerResultView';
import { resultFieldLabel } from './resultFieldLabels';
import { sanitizeCustomerFacingError } from './api';
import { stripMetadataDeep } from './resultMetadata';
import { unwrapVendorBusinessPayload } from './vendorResponseParsers';

export { resultFieldLabel } from './resultFieldLabels';

/** Shown when the API returns no usable business data. */
export const CUSTOMER_SEARCH_EMPTY_MESSAGE =
  'This search could not be completed. Please try again later or contact your administrator.';

/** Omitted from flat key-value legacy views only (not accordion renderer). */
const HIDDEN_USER_KEYS = new Set([
  'apisource',
  'api_source',
  'providerref',
  'provider_ref',
  'raw',
  'outcome',
  'creditsremaining',
  'searchtype',
  'searchvalue',
  'productslug',
  'source',
  'uan_source',
  'data_source',
  'source_type',
  'vendor',
  'vendor_slug',
  'vendorslug',
]);

const USER_SUCCESS_EXTRA_KEYS = new Set(['url', 'expires', 'expires_on', 'transaction_id']);

/** Legacy API bodies (pre-outcome wrapper) — extract displayable payload. */
export function legacyCustomerPayload(data: Record<string, unknown>): Record<string, unknown> | unknown[] | null {
  if (data.outcome === 'success' && data.data !== undefined) {
    const d = data.data;
    if (typeof d === 'object' && d !== null) return d as Record<string, unknown> | unknown[];
    return { value: d };
  }
  if (data.outcome === 'empty') return null;

  const unwrapped = unwrapVendorBusinessPayload(data);
  if (unwrapped) return unwrapped;

  const st = data.status;
  if (st === 'Not found' || st === 'UpstreamError' || st === 'Failed' || st === 'Denied') return null;
  if (st !== 'Success' && st !== undefined) return null;

  const res = data.result;
  if (res !== undefined && res !== null) {
    if (typeof res === 'object') return res as Record<string, unknown> | unknown[];
    return { value: res };
  }

  const out: Record<string, unknown> = {};
  for (const k of USER_SUCCESS_EXTRA_KEYS) {
    if (data[k] !== undefined && data[k] !== null && data[k] !== '') out[k] = data[k];
  }
  for (const [k, v] of Object.entries(data)) {
    if (HIDDEN_USER_KEYS.has(k.toLowerCase()) || k === 'result') continue;
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

function customerDisplayData(data: unknown): Record<string, unknown> | unknown[] {
  const cleaned = stripMetadataDeep(data);
  if (cleaned !== null && typeof cleaned === 'object') {
    return cleaned as Record<string, unknown> | unknown[];
  }
  return { value: cleaned };
}

export function CustomerSearchResult({ row }: { row: Record<string, unknown> }) {
  const inputLabel = typeof row.searchValue === 'string' ? row.searchValue.trim() : '';

  if (row.outcome === 'empty') {
    const rawMsg = typeof row.message === 'string' ? row.message.trim() : '';
    const msg = rawMsg ? sanitizeCustomerFacingError(rawMsg) : CUSTOMER_SEARCH_EMPTY_MESSAGE;
    return (
      <div className="space-y-2">
        {inputLabel ? (
          <p className="font-mono text-sm text-[var(--app-text)]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Input · </span>
            {inputLabel}
          </p>
        ) : null}
        <p className="text-sm leading-relaxed text-[var(--app-muted)]">{msg}</p>
      </div>
    );
  }

  if (row.outcome === 'success' && row.data !== undefined) {
    const d = customerDisplayData(row.data);
    if (Array.isArray(d)) {
      return <CustomerResultView data={d} />;
    }
    return <CustomerResultView data={d} />;
  }

  const legacy = legacyCustomerPayload(row);
  if (!legacy) {
    return <p className="text-sm leading-relaxed text-[var(--app-muted)]">{CUSTOMER_SEARCH_EMPTY_MESSAGE}</p>;
  }
  const displayLegacy = customerDisplayData(legacy);
  if (Array.isArray(displayLegacy)) {
    return <CustomerResultView data={displayLegacy} />;
  }
  return <CustomerResultView data={displayLegacy} />;
}

const KEY_ORDER = [
  'status',
  'message',
  'detail',
  'productSlug',
  'searchType',
  'searchValue',
  'http_response_code',
  'client_ref_num',
  'result_code',
  'providerRef',
  'request_id',
  'url',
  'expires_on',
  'expires',
  'creditsRemaining',
  'result',
];

/** Flatten top-level keys for simple CSV-style consumers (nested values as JSON strings). */
export function normalizedEntries(data: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const keys = Object.keys(data).filter(
    (k) => k !== 'raw' && !k.startsWith('_') && !HIDDEN_USER_KEYS.has(k)
  );
  const rest = keys.filter((k) => !KEY_ORDER.includes(k)).sort((a, b) => a.localeCompare(b));
  const ordered = [...KEY_ORDER.filter((k) => keys.includes(k)), ...rest];
  return ordered.map((key) => {
    const v = data[key];
    let str: string;
    if (v === null || v === undefined) str = '';
    else if (typeof v === 'object') {
      try {
        str = JSON.stringify(v);
      } catch {
        str = String(v);
      }
    } else str = String(v);
    return { key, label: resultFieldLabel(key), value: str };
  });
}

function ArrayOfObjectsTable({ rows }: { rows: Record<string, unknown>[] }) {
  const keys = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) Object.keys(r).forEach((k) => s.add(k));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-[var(--app-border)]">
      <table className="w-max min-w-full table-auto border-collapse text-left text-xs">
        <thead className="bg-[var(--app-bg-secondary)] text-[var(--app-muted)]">
          <tr>
            <th className="border-b border-[var(--app-border)] px-2 py-2 font-semibold">#</th>
            {keys.map((k) => (
              <th key={k} className="border-b border-[var(--app-border)] px-2 py-2 font-semibold">
                {resultFieldLabel(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--app-border)] last:border-0">
              <td className="whitespace-nowrap px-2 py-2 align-top text-[var(--app-muted)]">{i + 1}</td>
              {keys.map((k) => (
                <td key={k} className="min-w-[8rem] max-w-md px-2 py-2 align-top break-words">
                  <ValueBlock value={row[k]} depth={1} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NestedFields({ data, depth }: { data: Record<string, unknown>; depth: number }) {
  const keys = useMemo(
    () => Object.keys(data).sort((a, b) => a.localeCompare(b)),
    [data]
  );
  if (keys.length === 0) {
    return <span className="text-[var(--app-muted)]">Empty</span>;
  }
  return (
    <div className={`w-full min-w-0 max-w-full ${depth > 0 ? 'border-l-2 border-[var(--app-border)] pl-3' : ''}`}>
      <dl className="space-y-3">
        {keys.map((key) => (
          <div key={key} className="min-w-0 max-w-full">
            <dt className="break-words text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
              {resultFieldLabel(key)}
            </dt>
            <dd className="mt-1 min-w-0 max-w-full">
              <ValueBlock value={data[key]} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ValueBlock({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-[var(--app-muted)]">—</span>;
  }
  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    const s = String(value);
    if (s === '') return <span className="text-[var(--app-muted)]">—</span>;
    return (
      <span className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-[var(--app-text)]">
        {s}
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-[var(--app-muted)]">Empty list</span>;
    }
    const allObjects = value.every((x) => x !== null && typeof x === 'object' && !Array.isArray(x));
    if (allObjects) {
      return <ArrayOfObjectsTable rows={value as Record<string, unknown>[]} />;
    }
    return (
      <ol className="list-decimal space-y-2 pl-5 text-sm marker:text-[var(--app-muted)]">
        {value.map((item, i) => (
          <li key={i} className="pl-1">
            <ValueBlock value={item} depth={depth + 1} />
          </li>
        ))}
      </ol>
    );
  }
  if (typeof value === 'object') {
    return <NestedFields data={value as Record<string, unknown>} depth={depth} />;
  }
  return <span>{String(value)}</span>;
}

export function SearchResultKeyValue({ data }: { data: Record<string, unknown> }) {
  const keys = useMemo(() => {
    const all = Object.keys(data).filter((k) => !isMetadataEntry(k, data[k]));
    const rest = all.filter((k) => !KEY_ORDER.includes(k)).sort((a, b) => a.localeCompare(b));
    return [...KEY_ORDER.filter((k) => all.includes(k)), ...rest];
  }, [data]);

  if (!keys.length) {
    return <p className="text-sm text-[var(--app-muted)]">No fields to display.</p>;
  }

  return (
    <dl className="space-y-4">
      {keys.map((key) => (
        <div key={key} className="min-w-0 max-w-full">
          <dt className="break-words text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            {resultFieldLabel(key)}
          </dt>
          <dd className="mt-1 min-w-0 max-w-full">
            <ValueBlock value={data[key]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
