import React, { useMemo } from 'react';

/** Human labels for API / Digitap normalized keys (extend as products grow). */
const KEY_LABELS: Record<string, string> = {
  searchType: 'Input type',
  searchValue: 'Input value',
  productSlug: 'Product',
  status: 'Status',
  apiSource: 'API source',
  message: 'Message',
  result_code: 'Result code',
  result: 'Response payload',
  providerRef: 'Provider reference',
  transaction_id: 'Transaction ID',
  url: 'Session / consent URL',
  expires_on: 'Expires (ITR)',
  expires: 'Expires (Ecom)',
  detail: 'Error detail',
  creditsRemaining: 'Credits remaining',
  http_response_code: 'HTTP code',
  request_id: 'Request ID',
  client_ref_num: 'Client reference',
};

export function resultFieldLabel(key: string): string {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

const KEY_ORDER = [
  'status',
  'apiSource',
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
  const keys = Object.keys(data).filter((k) => k !== 'raw' && !k.startsWith('_'));
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
    const all = Object.keys(data).filter((k) => k !== 'raw' && !k.startsWith('_'));
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
