import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Row = Record<string, unknown>;

export function isCibilSummary(data: unknown): data is Row {
  return (
    data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'credit_score' in data &&
    'account_summary' in data
  );
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function money(v: unknown): string {
  return typeof v === 'number' ? inr.format(v) : '—';
}

function text(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

function formatDate(v: unknown): string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return text(v);
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function scoreBand(score: number): { label: string; tone: string } {
  if (score >= 750) return { label: 'Excellent', tone: 'text-emerald-500' };
  if (score >= 700) return { label: 'Good', tone: 'text-lime-500' };
  if (score >= 650) return { label: 'Fair', tone: 'text-amber-500' };
  if (score >= 550) return { label: 'Poor', tone: 'text-orange-500' };
  return { label: 'Very poor', tone: 'text-red-500' };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">{title}</h3>
      {children}
    </section>
  );
}

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-[var(--app-border)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}

type Column = { key: string; label: string; format?: (v: unknown) => string; align?: 'right' };

function DataTable({ rows, columns }: { rows: Row[]; columns: Column[] }) {
  if (!rows.length) return <p className="text-sm text-[var(--app-muted)]">None reported.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--app-border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-[var(--app-surface-muted)] text-xs text-[var(--app-muted)]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-3 py-2 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--app-border)] text-[var(--app-text)]">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-2 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}
                >
                  {(c.format ?? text)(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ACCOUNT_COLUMNS: Column[] = [
  { key: 'lender', label: 'Lender' },
  { key: 'account_type', label: 'Type' },
  { key: 'ownership', label: 'Ownership' },
  { key: 'opened_on', label: 'Opened', format: formatDate },
  { key: 'sanctioned_amount', label: 'Sanctioned', format: money, align: 'right' },
  { key: 'credit_limit', label: 'Credit limit', format: money, align: 'right' },
  { key: 'current_balance', label: 'Outstanding', format: money, align: 'right' },
  { key: 'amount_overdue', label: 'Overdue', format: money, align: 'right' },
  { key: 'emi', label: 'EMI', format: money, align: 'right' },
  { key: 'interest_rate', label: 'Interest' },
  { key: 'last_payment_on', label: 'Last payment', format: formatDate },
  { key: 'account_number', label: 'Account no.' },
];

const CLOSED_COLUMNS: Column[] = [
  { key: 'lender', label: 'Lender' },
  { key: 'account_type', label: 'Type' },
  { key: 'opened_on', label: 'Opened', format: formatDate },
  { key: 'closed_on', label: 'Closed', format: formatDate },
  { key: 'sanctioned_amount', label: 'Sanctioned', format: money, align: 'right' },
  { key: 'written_off_amount', label: 'Written off', format: money, align: 'right' },
  { key: 'settlement_amount', label: 'Settled', format: money, align: 'right' },
  { key: 'account_number', label: 'Account no.' },
];

const ENQUIRY_COLUMNS: Column[] = [
  { key: 'enquiry_date', label: 'Date', format: formatDate },
  { key: 'lender', label: 'Lender' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'amount', label: 'Amount', format: money, align: 'right' },
];

const ADDRESS_COLUMNS: Column[] = [
  { key: 'address', label: 'Address' },
  { key: 'pin_code', label: 'PIN' },
  { key: 'reported_on', label: 'Reported', format: formatDate },
  { key: 'reported_by', label: 'Reported by' },
];

const PROFILE_FIELDS: [string, string, ((v: unknown) => string)?][] = [
  ['full_name', 'Name'],
  ['pan', 'PAN'],
  ['date_of_birth', 'Date of birth', formatDate],
  ['gender', 'Gender'],
  ['mobile_numbers', 'Mobile'],
  ['email', 'Email'],
  ['passport_number', 'Passport'],
  ['voter_id', 'Voter ID'],
  ['driving_licence', 'Driving licence'],
  ['ckyc_id', 'CKYC ID'],
  ['occupation', 'Occupation'],
  ['annual_income', 'Annual income', money],
];

function asRows(v: unknown): Row[] {
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Row[]) : [];
}

export function CibilReportView({ data }: { data: Row }) {
  const score = typeof data.credit_score === 'number' ? data.credit_score : null;
  const band = score !== null ? scoreBand(score) : null;
  const summary = (data.account_summary ?? {}) as Row;
  const factors = Array.isArray(data.score_factors) ? (data.score_factors as string[]) : [];
  const closed = asRows(data.closed_accounts);

  const tiles: [string, string][] = [
    ['Active accounts', `${text(summary.active_accounts)} of ${text(summary.total_accounts)}`],
    ['Total outstanding', money(summary.total_current_balance)],
    ['Total overdue', money(summary.total_amount_overdue)],
    ['Monthly EMI', money(summary.total_monthly_emi)],
    ['Enquiries', text(summary.enquiries)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-muted)]">CIBIL score</p>
          <p className={`font-display text-5xl font-bold ${band?.tone ?? 'text-[var(--app-text)]'}`}>{score ?? '—'}</p>
          {band ? <p className={`text-sm font-semibold ${band.tone}`}>{band.label} · range 300–900</p> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-[var(--app-text)]">{text(data.full_name)}</p>
          {data.pan ? <p className="font-mono text-sm text-[var(--app-text-secondary)]">{String(data.pan)}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/40 p-3">
            <p className="text-xs text-[var(--app-muted)]">{label}</p>
            <p className="mt-1 text-base font-bold tabular-nums text-[var(--app-text)]">{value}</p>
          </div>
        ))}
      </div>

      <Section title="Personal details">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_FIELDS.filter(([k]) => data[k] !== undefined && data[k] !== null && data[k] !== '').map(
            ([k, label, fmt]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-[var(--app-muted)]">{label}</dt>
                <dd className="break-words text-sm font-medium text-[var(--app-text)]">{(fmt ?? text)(data[k])}</dd>
              </div>
            )
          )}
        </dl>
      </Section>

      {factors.length ? (
        <Section title="What is affecting the score">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--app-text-secondary)]">
            {factors.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title={`Active accounts (${asRows(data.active_accounts).length})`}>
        <DataTable rows={asRows(data.active_accounts)} columns={ACCOUNT_COLUMNS} />
      </Section>

      {closed.length ? (
        <Collapsible title={`Closed accounts (${closed.length})`}>
          <DataTable rows={closed} columns={CLOSED_COLUMNS} />
        </Collapsible>
      ) : null}

      <Section title={`Credit enquiries (${asRows(data.enquiries).length})`}>
        <DataTable rows={asRows(data.enquiries)} columns={ENQUIRY_COLUMNS} />
      </Section>

      <Collapsible title={`Addresses on file (${asRows(data.addresses).length})`}>
        <DataTable rows={asRows(data.addresses)} columns={ADDRESS_COLUMNS} />
      </Collapsible>
    </div>
  );
}
