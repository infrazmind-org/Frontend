import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { resultFieldLabel } from './resultFieldLabels';
import { isMetadataKey } from './resultMetadata';
import { unwrapVendorBusinessPayload } from './vendorResponseParsers';

const PRIORITY_KEYS = [
  'pan',
  'fullname',
  'full_name',
  'name',
  'first_name',
  'middle_name',
  'last_name',
  'pan_type',
  'gender',
  'dob',
  'date_of_birth',
  'pan_status',
  'pan_allotment_date',
  'aadhaar_number',
  'aadhaar_linked',
  'mobile',
  'mobile_number',
  'email',
  'gstin',
  'reg_no',
  'registration_number',
  'vehicle_number',
  'rc_number',
  'is_salaried',
  'is_director',
  'is_sole_proprietor',
  'url',
  'transaction_id',
  'expires_on',
  'expires',
];

function isEmptyDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'boolean' || typeof value === 'number') return false;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmptyDisplayValue);
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isEmptyDisplayValue);
  }
  return false;
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return '—';
  const s = String(value).trim();
  if (/digitap|upstreamerror|upstream error/i.test(s)) return '—';
  if (s === '') return '—';
  if (s === 'Y') return 'Yes';
  if (s === 'N') return 'No';
  if (s === 'true') return 'Yes';
  if (s === 'false') return 'No';
  if (s.toLowerCase() === 'male' || s.toLowerCase() === 'female') {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

function sortKeys(keys: string[]): string[] {
  const set = new Set(keys);
  const ordered = PRIORITY_KEYS.filter((k) => set.has(k));
  const rest = keys.filter((k) => !PRIORITY_KEYS.includes(k)).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...rest];
}

function sortEntries<T extends [string, unknown] | [string, unknown[]]>(entries: T[]): T[] {
  const order = sortKeys(entries.map(([k]) => k));
  return order.map((k) => entries.find(([ek]) => ek === k)!) as T[];
}

function partitionRecord(data: Record<string, unknown>) {
  const scalars: [string, unknown][] = [];
  const nested: [string, unknown][] = [];
  const arrays: [string, unknown[]][] = [];

  for (const [key, value] of Object.entries(data)) {
    if (isMetadataKey(key)) continue;
    if (isEmptyDisplayValue(value)) continue;
    if (Array.isArray(value)) arrays.push([key, value]);
    else if (typeof value === 'object' && value !== null) nested.push([key, value]);
    else scalars.push([key, value]);
  }

  return {
    scalars: sortEntries(scalars),
    nested: sortEntries(nested),
    arrays: sortEntries(arrays),
  };
}

function ResultAccordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--app-surface-muted)]/60"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[var(--app-text)]">{title}</span>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0668E1]/10 text-[#0668E1] ring-1 ring-[#0668E1]/25 dark:bg-[#0668E1]/15"
          aria-hidden
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && <div className="border-t border-[var(--app-border)] px-4 py-4">{children}</div>}
    </div>
  );
}

function DisplayValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (isEmptyDisplayValue(value)) {
    return <span className="text-[var(--app-muted)]">—</span>;
  }
  if (Array.isArray(value)) {
    const objectRows = value.filter(
      (x): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x)
    );
    if (objectRows.length > 0) {
      return <ArrayOfObjectsTable rows={objectRows} />;
    }
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--app-text)]">
        {value.map((item, i) => (
          <li key={i}>
            <DisplayValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return <CustomerResultBody data={value as Record<string, unknown>} depth={depth + 1} />;
  }
  return (
    <span className="whitespace-pre-wrap break-words text-sm font-medium leading-snug text-[var(--app-text)]">
      {formatScalar(value)}
    </span>
  );
}

function ScalarGrid({ entries }: { entries: [string, unknown][] }) {
  if (!entries.length) return null;
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
            {resultFieldLabel(key)}
          </dt>
          <dd className="mt-1 min-w-0 break-words">
            <DisplayValue value={value} depth={1} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ArrayOfObjectsTable({ rows }: { rows: Record<string, unknown>[] }) {
  const keys = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      Object.entries(r).forEach(([k, v]) => {
        if (!isEmptyDisplayValue(v)) s.add(k);
      });
    }
    return sortKeys([...s]);
  }, [rows]);

  if (!keys.length) return <p className="text-sm text-[var(--app-muted)]">No details in this list.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--app-border)]">
      <table className="w-max min-w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--app-bg-secondary)] text-xs text-[var(--app-muted)]">
          <tr>
            <th className="border-b border-[var(--app-border)] px-3 py-2 font-semibold">#</th>
            {keys.map((k) => (
              <th key={k} className="border-b border-[var(--app-border)] px-3 py-2 font-semibold">
                {resultFieldLabel(k)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--app-border)] last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-[var(--app-muted)]">{i + 1}</td>
              {keys.map((k) => (
                <td key={k} className="min-w-[10rem] max-w-md px-3 py-2 align-top">
                  <DisplayValue value={row[k]} depth={2} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultHighlight({ data }: { data: Record<string, unknown> }) {
  const prefill = data.prefill_details;
  const prefillRecord = prefill && typeof prefill === 'object' && !Array.isArray(prefill) ? (prefill as Record<string, unknown>) : null;
  const personalData =
    data.personal_data && typeof data.personal_data === 'object' && !Array.isArray(data.personal_data)
      ? (data.personal_data as Record<string, unknown>)
      : null;
  const personalInfo =
    (prefillRecord?.personal_info && typeof prefillRecord.personal_info === 'object'
      ? (prefillRecord.personal_info as Record<string, unknown>)
      : null) ||
    (personalData?.personal_information && typeof personalData.personal_information === 'object'
      ? (personalData.personal_information as Record<string, unknown>)
      : null);
  const panDetails =
    data.pan_details && typeof data.pan_details === 'object' && !Array.isArray(data.pan_details)
      ? (data.pan_details as Record<string, unknown>)
      : null;
  const panInner =
    panDetails?.pan_details && typeof panDetails.pan_details === 'object'
      ? (panDetails.pan_details as Record<string, unknown>)
      : null;

  const name =
    (data.fullname as string) ||
    (data.full_name as string) ||
    (data.name as string) ||
    (prefillRecord?.name as string) ||
    (personalInfo?.full_name as string) ||
    (data.owner_name as string) ||
    [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  const pan =
    (data.pan as string) ||
    (data.pan_number as string) ||
    (data.id_number as string) ||
    (panInner?.pan_number as string);
  const panStatus = (data.pan_status as string) || (typeof data.status === 'string' ? data.status : undefined);

  if (!name && !pan) return null;

  return (
    <div className="mb-5 rounded-2xl border border-[#0668E1]/25 bg-gradient-to-br from-[#0668E1]/10 to-[#00b4d8]/8 px-5 py-4">
      {name && <p className="font-display text-lg font-bold text-[var(--app-text)]">{formatScalar(name)}</p>}
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        {pan && (
          <span className="rounded-lg bg-[var(--app-surface)] px-2.5 py-1 font-mono font-semibold text-[#0668E1] ring-1 ring-[#0668E1]/25">
            {formatScalar(pan)}
          </span>
        )}
        {panStatus && !isEmptyDisplayValue(panStatus) && (
          <span className="app-badge-success">{formatScalar(panStatus)}</span>
        )}
      </div>
    </div>
  );
}

function CustomerResultBody({ data, depth = 0 }: { data: Record<string, unknown>; depth?: number }) {
  const { scalars, nested, arrays } = partitionRecord(data);

  const highlightKeys = new Set(['fullname', 'full_name', 'name', 'pan', 'pan_number', 'pan_status', 'owner_name']);
  const gridScalars = scalars.filter(([k]) => !highlightKeys.has(k) || depth > 0);
  const showHighlight =
    depth === 0 &&
    (data.fullname ||
      data.full_name ||
      data.pan ||
      data.pan_number ||
      data.owner_name ||
      data.prefill_details ||
      data.pan_details ||
      data.personal_data);

  return (
    <div className="space-y-4">
      {showHighlight && <ResultHighlight data={data} />}
      {gridScalars.length > 0 && <ScalarGrid entries={gridScalars} />}

      {nested.map(([fieldKey, value], idx) => (
        <ResultAccordion
          key={fieldKey}
          title={resultFieldLabel(fieldKey)}
          defaultOpen={depth === 0 && idx === 0}
        >
          <CustomerResultBody data={value as Record<string, unknown>} depth={depth + 1} />
        </ResultAccordion>
      ))}

      {arrays.map(([fieldKey, items], idx) => {
        const objectRows = items.filter(
          (x): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x)
        );
        if (objectRows.length > 0) {
          return (
            <ResultAccordion
              key={fieldKey}
              title={resultFieldLabel(fieldKey)}
              defaultOpen={depth === 0 && nested.length === 0 && idx === 0}
            >
              <ArrayOfObjectsTable rows={objectRows} />
            </ResultAccordion>
          );
        }
        return (
          <ResultAccordion key={fieldKey} title={resultFieldLabel(fieldKey)}>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3"
                >
                  <DisplayValue value={item} depth={depth + 1} />
                </li>
              ))}
            </ul>
          </ResultAccordion>
        );
      })}
    </div>
  );
}

function normalizePayload(data: Record<string, unknown> | unknown[]): Record<string, unknown> | unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('items' in (data as Record<string, unknown>) && Array.isArray((data as Record<string, unknown>).items)) {
      return (data as Record<string, unknown>).items as unknown[];
    }
    return data as Record<string, unknown>;
  }
  return { value: data };
}

/** Rich customer-facing renderer for search `data` payloads (PAN, GST, etc.). */
export function CustomerResultView({ data }: { data: Record<string, unknown> | unknown[] }) {
  const payload = normalizePayload(data);

  if (Array.isArray(payload)) {
    const rows = payload.filter(
      (x): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x)
    );
    if (rows.length) return <ArrayOfObjectsTable rows={rows} />;
    return (
      <ul className="space-y-2">
        {payload.map((item, i) => (
          <li key={i} className="text-sm text-[var(--app-text)]">
            <DisplayValue value={item} />
          </li>
        ))}
      </ul>
    );
  }

  const { scalars, nested, arrays } = partitionRecord(payload);
  if (!scalars.length && !nested.length && !arrays.length) {
    return <p className="text-sm text-[var(--app-muted)]">No details to display.</p>;
  }

  return <CustomerResultBody data={payload} />;
}
