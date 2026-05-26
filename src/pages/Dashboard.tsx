import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Search, Table2, History, CreditCard, Download, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { apiFetch, apiUrl, formatFastApiDetail } from '../lib/api';
import { typeFieldHintForProduct, valuePlaceholderForProduct } from '../lib/productSearchHints';
import { getSearchFormFields, validateSearchForm } from '../lib/multiValueSearchForms';
import { SearchResultKeyValue, resultFieldLabel } from '../lib/searchResultFields';
import ThemeToggle from '../components/ThemeToggle';

type Tab = 'single' | 'bulk' | 'history' | 'billing' | 'apis';

type CatalogRow = {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  phase: string;
  price_inr: number | null;
  otp_required: number;
  notes: string | null;
  sort_order: number;
};

type CatalogResponse = {
  title: string;
  source: string;
  grouped: {
    phase1: CatalogRow[];
    phase2: CatalogRow[];
    demo: CatalogRow[];
    excluded: CatalogRow[];
  };
};

type SearchResultRow = Record<string, string | undefined>;

const TABLE_COLUMNS: { key: keyof SearchResultRow | string; label: string }[] = [
  { key: 'searchType', label: 'Input type' },
  { key: 'searchValue', label: 'Input value' },
  { key: 'fullName', label: 'Full name' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'alternateMobile', label: 'Alt mobile' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'pan', label: 'PAN' },
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'bankAccount', label: 'Bank account' },
  { key: 'ifsc', label: 'IFSC' },
  { key: 'employment', label: 'Employment' },
  { key: 'employerAddress', label: 'Employer address' },
  { key: 'epfoStatus', label: 'EPFO' },
  { key: 'itrSummary', label: 'ITR' },
  { key: 'assetsSummary', label: 'Assets' },
  { key: 'apiSource', label: 'API source' },
  { key: 'productSlug', label: 'Product' },
  { key: 'status', label: 'Status' },
];

const SEARCH_TYPES = ['Auto', 'Aadhaar', 'PAN', 'Mobile', 'Email', 'Bank', 'Unknown'];

type MyApiRow = { slug: string; name: string; credits_per_hit: number; allowed_search_types?: string[] };

function exportColumnDefs(data: SearchResultRow[]): { key: string; label: string }[] {
  const keys = new Set<string>();
  data.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));
  const cols: { key: string; label: string }[] = [];
  for (const c of TABLE_COLUMNS) {
    const k = String(c.key);
    if (keys.has(k)) cols.push({ key: k, label: c.label });
  }
  const extra = [...keys]
    .filter((k) => !TABLE_COLUMNS.some((c) => String(c.key) === k))
    .sort((a, b) => a.localeCompare(b));
  extra.forEach((k) => cols.push({ key: k, label: resultFieldLabel(k) }));
  return cols;
}

function rowsForExport(data: SearchResultRow[]) {
  const cols = exportColumnDefs(data);
  const headers = cols.map((c) => c.label);
  const body = data.map((row) => cols.map((c) => String(row[c.key as string] ?? '')));
  return { headers, body };
}

export default function Dashboard() {
  const { user, token, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('single');

  const [singleType, setSingleType] = useState('Auto');
  const [singleProduct, setSingleProduct] = useState('unified_lookup');
  const [singleValue, setSingleValue] = useState('');
  const [singleMultiValues, setSingleMultiValues] = useState<Record<string, string>>({});
  const [singleFieldErrors, setSingleFieldErrors] = useState<Record<string, string>>({});
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleResults, setSingleResults] = useState<SearchResultRow[]>([]);

  const [bulkType, setBulkType] = useState('Auto');
  const [bulkProduct, setBulkProduct] = useState('unified_lookup');
  const [bulkText, setBulkText] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkMeta, setBulkMeta] = useState<{ processedCount: number; skippedCount: number } | null>(null);
  const [bulkResults, setBulkResults] = useState<SearchResultRow[]>([]);

  const [logs, setLogs] = useState<
    {
      id: number;
      search_type: string;
      search_value_hash: string;
      status: string;
      credits_used: number;
      product_slug?: string;
      created_at: string;
    }[]
  >([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [plans, setPlans] = useState<{ id: number; name: string; price: number; credits: number }[]>([]);
  const [purchases, setPurchases] = useState<
    { id: number; plan_id: number; amount: number; credits_added: number; created_at: string; plan_name: string }[]
  >([]);
  const [billingLoading, setBillingLoading] = useState(false);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [myApis, setMyApis] = useState<MyApiRow[]>([]);

  const isActive = user?.status === 'active';

  const singleTypeOptions = useMemo(() => {
    const row = myApis.find((a) => a.slug === singleProduct);
    const allowed = row?.allowed_search_types;
    if (allowed?.length) return allowed;
    return SEARCH_TYPES;
  }, [myApis, singleProduct]);

  const singleFormFields = useMemo(() => getSearchFormFields(singleProduct, singleType), [singleProduct, singleType]);

  useEffect(() => {
    setSingleMultiValues({});
    setSingleFieldErrors({});
  }, [singleProduct, singleType]);

  const bulkTypeOptions = useMemo(() => {
    const row = myApis.find((a) => a.slug === bulkProduct);
    const allowed = row?.allowed_search_types;
    if (allowed?.length) return allowed;
    return SEARCH_TYPES;
  }, [myApis, bulkProduct]);

  const productOptions = useMemo(() => {
    if (!isActive) {
      return [
        {
          slug: 'unified_lookup',
          name: 'Products unlock after an administrator approves your account and enables APIs.',
        },
      ];
    }
    if (!myApis.length) {
      return [{ slug: 'unified_lookup', name: 'Loading your APIs…' }];
    }
    return myApis.map((a) => ({
      slug: a.slug,
      name: a.name,
    }));
  }, [isActive, myApis]);

  useEffect(() => {
    if (!token || !isActive) {
      setMyApis([]);
      return;
    }
    let cancelled = false;
    void apiFetch('/api/user/my-apis', { token })
      .then(async (res) => {
        if (!res.ok) return [];
        const data = (await res.json()) as unknown;
        return Array.isArray(data) ? (data as MyApiRow[]) : [];
      })
      .then((rows) => {
        if (!cancelled) setMyApis(rows);
      })
      .catch(() => {
        if (!cancelled) setMyApis([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isActive]);

  useEffect(() => {
    if (!myApis.length) return;
    const slugs = new Set(myApis.map((x) => x.slug));
    if (!slugs.has(singleProduct)) setSingleProduct(myApis[0]!.slug);
    if (!slugs.has(bulkProduct)) setBulkProduct(myApis[0]!.slug);
  }, [myApis, singleProduct, bulkProduct]);

  useEffect(() => {
    if (!singleTypeOptions.includes(singleType)) setSingleType(singleTypeOptions[0] ?? 'Auto');
  }, [singleTypeOptions, singleType]);

  useEffect(() => {
    if (!bulkTypeOptions.includes(bulkType)) setBulkType(bulkTypeOptions[0] ?? 'Auto');
  }, [bulkTypeOptions, bulkType]);

  const loadLogs = useCallback(async () => {
    if (!token) return;
    setLogsLoading(true);
    try {
      const res = await apiFetch('/api/user/logs', { token });
      if (res.ok) setLogs(await res.json());
    } finally {
      setLogsLoading(false);
    }
  }, [token]);

  const loadBilling = useCallback(async () => {
    if (!token) return;
    setBillingLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        apiFetch('/api/user/plans', { token }),
        apiFetch('/api/user/purchases', { token }),
      ]);
      if (pRes.ok) setPlans(await pRes.json());
      if (uRes.ok) setPurchases(await uRes.json());
    } finally {
      setBillingLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 'history') void loadLogs();
  }, [tab, loadLogs]);

  useEffect(() => {
    if (tab === 'billing') void loadBilling();
  }, [tab, loadBilling]);

  useEffect(() => {
    if (tab !== 'apis') return;
    let cancelled = false;
    setCatalogLoading(true);
    void fetch(apiUrl('/api/catalog?phase=all'))
      .then((r) => r.json())
      .then((data: CatalogResponse) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalog(null);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const exportableRows = useMemo(() => {
    if (tab === 'bulk' && bulkResults.length) return bulkResults;
    return singleResults;
  }, [tab, bulkResults, singleResults]);

  const downloadCsv = () => {
    if (!exportableRows.length) return;
    const { headers, body } = rowsForExport(exportableRows);
    const csv = [headers.join(','), ...body.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kyckart-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXlsx = () => {
    if (!exportableRows.length) return;
    const cols = exportColumnDefs(exportableRows);
    const rows = exportableRows.map((row) => {
      const o: Record<string, string> = {};
      cols.forEach((c) => {
        o[c.label] = String(row[c.key as string] ?? '');
      });
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, 'kyckart-results.xlsx');
  };

  const downloadPdf = () => {
    if (!exportableRows.length) return;
    const { headers, body } = rowsForExport(exportableRows);
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(11);
    doc.text('InfrazMind — KYCkart search results', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [headers],
      body,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [6, 104, 225] },
    });
    doc.save('kyckart-results.pdf');
  };

  const updateSingleField = (id: string, val: string) => {
    setSingleMultiValues((m) => ({ ...m, [id]: val }));
    setSingleFieldErrors((errs) => {
      if (!errs[id]) return errs;
      const next = { ...errs };
      delete next[id];
      return next;
    });
  };

  const runSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isActive) return;
    setSingleError(null);
    setSingleFieldErrors({});

    const fields = singleFormFields;
    let valueToSend = singleValue.trim();
    if (fields) {
      const vr = validateSearchForm(singleProduct, singleType, fields, singleMultiValues);
      if (vr.ok === false) {
        setSingleFieldErrors(vr.fieldErrors);
        setSingleError(vr.message);
        return;
      }
      valueToSend = vr.value;
    } else if (!valueToSend) {
      setSingleError('Enter a value.');
      return;
    }

    setSingleLoading(true);
    try {
      const res = await apiFetch('/api/search/single', {
        method: 'POST',
        token,
        body: JSON.stringify({ type: singleType, value: valueToSend, productSlug: singleProduct }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSingleError(formatFastApiDetail(data));
        setSingleResults([]);
        return;
      }
      if (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) {
        setSingleError(String((data as { error: unknown }).error));
        setSingleResults([]);
        return;
      }
      setSingleResults([data as SearchResultRow]);
      await refreshUser();
      void loadLogs();
    } catch {
      setSingleError('Network error');
    } finally {
      setSingleLoading(false);
    }
  };

  const runBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isActive) return;
    setBulkError(null);
    setBulkLoading(true);
    setBulkMeta(null);
    try {
      let res: Response;
      if (bulkFile) {
        const fd = new FormData();
        fd.append('file', bulkFile);
        fd.append('type', bulkType);
        fd.append('productSlug', bulkProduct);
        res = await apiFetch('/api/search/bulk', { method: 'POST', token, body: fd });
      } else {
        res = await apiFetch('/api/search/bulk', {
          method: 'POST',
          token,
          body: JSON.stringify({ type: bulkType, values: bulkText, productSlug: bulkProduct }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBulkError(formatFastApiDetail(data));
        setBulkResults([]);
        return;
      }
      setBulkMeta({ processedCount: data.processedCount, skippedCount: data.skippedCount });
      setBulkResults((data.results || []) as SearchResultRow[]);
      setBulkFile(null);
      await refreshUser();
      void loadLogs();
    } catch {
      setBulkError('Network error');
    } finally {
      setBulkLoading(false);
    }
  };

  const buyPlan = async (planId: number) => {
    if (!token || !isActive) return;
    setBuyingId(planId);
    try {
      const res = await apiFetch('/api/user/buy-plan', {
        method: 'POST',
        token,
        body: JSON.stringify({ planId }),
      });
      if (res.ok) {
        await refreshUser();
        void loadBilling();
      }
    } finally {
      setBuyingId(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'single', label: 'Single search', icon: Search },
    { id: 'bulk', label: 'Bulk search', icon: Table2 },
    { id: 'history', label: 'Search history', icon: History },
    { id: 'billing', label: 'Plans & billing', icon: CreditCard },
    { id: 'apis', label: 'APIs & catalog', icon: BookOpen },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0668E1]/15 text-[#0668E1]">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)]">User dashboard</h1>
            <p className="text-[var(--app-muted)]">KYCkart-style lookups, credits, and metadata-only history (per platform policy).</p>
            {user && (
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Signed in as <span className="font-medium text-[var(--app-text)]">{user.email}</span>
                {' · '}
                <span className="font-mono text-[#0668E1]">{user.credits}</span> credits remaining
                {' · '}
                <span
                  className={
                    user.status === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : user.status === 'pending'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                  }
                >
                  {user.status}
                </span>
              </p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>

      {!isActive && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
          Your account is <strong>not active</strong>. Searches and purchases are disabled until an administrator approves your profile.
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2 border-b border-[var(--app-border)] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-[#0668E1] text-white shadow-md shadow-[#0668E1]/25'
                : 'text-[var(--app-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'single' && (
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
          <form
            onSubmit={runSingle}
            className="min-w-0 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 backdrop-blur-md"
          >
            <h2 className="mb-4 font-display text-lg font-bold text-[var(--app-text)]">Single identifier</h2>
            <p className="mb-6 text-sm text-[var(--app-muted)]">
              Each successful lookup debits credits for the selected product. Allowed input types depend on that product (for example PAN-only
              APIs only offer Auto or PAN); the list below updates when you change product.
            </p>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Product
            </label>
            <select
              value={singleProduct}
              onChange={(e) => setSingleProduct(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            >
              {productOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            {isActive && myApis.length > 0 ? (() => {
              const row = myApis.find((a) => a.slug === singleProduct);
              return row ? (
                <p className="mb-4 text-xs text-[var(--app-muted)]">{row.credits_per_hit} credits per search</p>
              ) : null;
            })() : null}
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Input type
            </label>
            <select
              value={singleType}
              onChange={(e) => setSingleType(e.target.value)}
              className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            >
              {singleTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(() => {
              const h = typeFieldHintForProduct(singleProduct);
              return h ? <p className="mb-3 text-xs text-[var(--app-muted)]">{h}</p> : null;
            })()}
            {singleFormFields ? (
              <div className="mb-4 space-y-3">
                {singleFormFields.map((f) => (
                  <div key={f.id}>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                      {f.label}
                      {f.required ? <span className="text-red-500"> *</span> : null}
                    </label>
                    <input
                      type={f.inputType ?? 'text'}
                      autoComplete="off"
                      value={singleMultiValues[f.id] ?? ''}
                      onChange={(e) => updateSingleField(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
                    />
                    {singleFieldErrors[f.id] ? (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{singleFieldErrors[f.id]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Value</label>
                <textarea
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  rows={3}
                  className="mb-4 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
                  placeholder={valuePlaceholderForProduct(singleProduct)}
                />
              </>
            )}
            {singleError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{singleError}</p>}
            <button
              type="submit"
              disabled={!isActive || singleLoading}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {singleLoading ? 'Searching…' : 'Run search'}
            </button>
          </form>

          <ResultsPanel
            title="Latest result"
            rows={singleResults}
            onCsv={downloadCsv}
            onXlsx={downloadXlsx}
            onPdf={downloadPdf}
            disabledExport={!singleResults.length}
          />
        </div>
      )}

      {tab === 'bulk' && (
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
          <form
            onSubmit={runBulk}
            className="min-w-0 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 backdrop-blur-md"
          >
            <h2 className="mb-4 font-display text-lg font-bold text-[var(--app-text)]">Bulk input</h2>
            <p className="mb-6 text-sm text-[var(--app-muted)]">
              Paste one value per line or upload CSV/Excel (first column). Processing stops when credits are exhausted; extra rows are skipped.
              Types allowed for bulk follow the selected product, same as single search.
            </p>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Product
            </label>
            <select
              value={bulkProduct}
              onChange={(e) => setBulkProduct(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            >
              {productOptions.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
            {isActive && myApis.length > 0 ? (() => {
              const row = myApis.find((a) => a.slug === bulkProduct);
              return row ? (
                <p className="mb-4 text-xs text-[var(--app-muted)]">{row.credits_per_hit} credits per search</p>
              ) : null;
            })() : null}
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Input type
            </label>
            <select
              value={bulkType}
              onChange={(e) => setBulkType(e.target.value)}
              className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            >
              {bulkTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {(() => {
              const h = typeFieldHintForProduct(bulkProduct);
              return h ? <p className="mb-3 text-xs text-[var(--app-muted)]">{h}</p> : null;
            })()}
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Paste values</label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="mb-4 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 font-mono text-sm text-[var(--app-text)]"
              placeholder={`${valuePlaceholderForProduct(bulkProduct)} — one per line`}
            />
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Or upload file</label>
            <input
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={(e) => setBulkFile(e.target.files?.[0] ?? null)}
              className="mb-4 w-full text-sm text-[var(--app-muted)]"
            />
            {bulkMeta && (
              <p className="mb-4 text-sm text-[var(--app-muted)]">
                Processed <strong className="text-[var(--app-text)]">{bulkMeta.processedCount}</strong>, skipped{' '}
                <strong className="text-[var(--app-text)]">{bulkMeta.skippedCount}</strong> (insufficient credits or empty rows).
              </p>
            )}
            {bulkError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{bulkError}</p>}
            <button
              type="submit"
              disabled={!isActive || bulkLoading || (!bulkText.trim() && !bulkFile)}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {bulkLoading ? 'Processing…' : 'Run bulk search'}
            </button>
          </form>

          <ResultsPanel
            title="Bulk results"
            rows={bulkResults}
            onCsv={downloadCsv}
            onXlsx={downloadXlsx}
            onPdf={downloadPdf}
            disabledExport={!bulkResults.length}
          />
        </div>
      )}

      {tab === 'history' && (
        <div className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
            <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Metadata log</h2>
            <button
              type="button"
              onClick={() => void loadLogs()}
              className="text-sm font-semibold text-[#0668E1] hover:underline"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto p-4">
            {logsLoading ? (
              <p className="text-sm text-[var(--app-muted)]">Loading…</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">No searches yet.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="text-[var(--app-muted)]">
                    <th className="px-3 py-2 font-semibold">When</th>
                    <th className="px-3 py-2 font-semibold">Type</th>
                    <th className="px-3 py-2 font-semibold">Value hash</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">Credits</th>
                    <th className="px-3 py-2 font-semibold">Product</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--app-border)] text-[var(--app-text-secondary)]">
                      <td className="px-3 py-2 font-mono text-xs">{row.created_at}</td>
                      <td className="px-3 py-2">{row.search_type}</td>
                      <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">{row.search_value_hash}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.credits_used}</td>
                      <td className="max-w-[140px] truncate px-3 py-2 font-mono text-xs">{row.product_slug ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-[var(--app-text)]">Credit packs</h2>
            {billingLoading ? (
              <p className="text-sm text-[var(--app-muted)]">Loading…</p>
            ) : (
              <ul className="space-y-4">
                {plans.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[var(--app-text)]">{p.name}</div>
                      <div className="text-sm text-[var(--app-muted)]">
                        ₹{p.price} · {p.credits} credits
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!isActive || buyingId === p.id}
                      onClick={() => void buyPlan(p.id)}
                      className="rounded-xl bg-[#0668E1] px-4 py-2 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
                    >
                      {buyingId === p.id ? 'Processing…' : 'Simulate purchase'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-[var(--app-muted)]">
              Checkout is simulated: credits apply immediately for demos (per backend contract).
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-[var(--app-text)]">Purchase history</h2>
            {purchases.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">No purchases yet.</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto text-sm">
                {purchases.map((p) => (
                  <li key={p.id} className="rounded-xl border border-[var(--app-border)] px-4 py-3">
                    <div className="font-medium text-[var(--app-text)]">{p.plan_name}</div>
                    <div className="text-[var(--app-muted)]">
                      +{p.credits_added} credits · ₹{p.amount} · {p.created_at}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === 'apis' && (
        <div className="space-y-10">
          {isActive && myApis.length > 0 && (
            <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
              <h2 className="mb-2 font-display text-lg font-bold text-[var(--app-text)]">Your enabled APIs</h2>
              <p className="mb-4 text-sm text-[var(--app-muted)]">
                These products appear in Single and Bulk search. Credit burn per successful search is set by your administrator (or catalog
                default).
              </p>
              <div className="max-h-[320px] overflow-auto rounded-xl border border-[var(--app-border)]">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-[var(--app-bg-secondary)] text-[var(--app-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">API</th>
                      <th className="px-3 py-2 font-semibold">Slug</th>
                      <th className="px-3 py-2 font-semibold">Credits / search</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApis.map((a) => (
                      <tr key={a.slug} className="border-t border-[var(--app-border)] text-[var(--app-text-secondary)]">
                        <td className="px-3 py-2 font-medium text-[var(--app-text)]">{a.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.slug}</td>
                        <td className="px-3 py-2 font-mono">{a.credits_per_hit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h2 className="mb-2 font-display text-lg font-bold text-[var(--app-text)]">Full API catalog</h2>
            <p className="text-sm text-[var(--app-muted)]">
              Reference view of everything in the platform catalog. You can only call products your administrator has enabled for your
              account (plus <code className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-xs">unified_lookup</code>).
            </p>
          </div>
          {catalogLoading && <p className="text-sm text-[var(--app-muted)]">Loading catalog…</p>}
          {!catalogLoading && catalog && (
            <>
              <CatalogBlock title="Phase 1 — integrate now" subtitle="Priority production APIs" rows={catalog.grouped.phase1} />
              <CatalogBlock title="Phase 2 — next cycle" subtitle="Planned follow-ups" rows={catalog.grouped.phase2} />
              <CatalogBlock title="Demo page APIs" subtitle="No OTP stack for showcase flows" rows={catalog.grouped.demo} />
              <CatalogBlock title="Excluded from demo" subtitle="OTP, face, or policy-blocked" rows={catalog.grouped.excluded} />
            </>
          )}
          {!catalogLoading && !catalog && (
            <p className="text-sm text-red-600 dark:text-red-400">Could not load catalog. Check that the API server is running.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CatalogBlock({ title, subtitle, rows }: { title: string; subtitle: string; rows: CatalogRow[] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="border-b border-[var(--app-border)] px-6 py-4">
        <h3 className="font-display text-base font-bold text-[var(--app-text)]">{title}</h3>
        <p className="text-sm text-[var(--app-muted)]">{subtitle}</p>
      </div>
      <div className="max-h-[420px] overflow-auto p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--app-bg-secondary)] text-[var(--app-muted)]">
            <tr>
              <th className="px-3 py-2 font-semibold">API</th>
              <th className="px-3 py-2 font-semibold">Category</th>
              <th className="px-3 py-2 font-semibold">₹ / hit</th>
              <th className="px-3 py-2 font-semibold">OTP</th>
              <th className="px-3 py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--app-border)] text-[var(--app-text-secondary)]">
                <td className="px-3 py-2">
                  <div className="font-medium text-[var(--app-text)]">{r.name}</div>
                  <div className="font-mono text-xs text-[var(--app-muted)]">{r.slug}</div>
                </td>
                <td className="px-3 py-2">{r.category ?? '—'}</td>
                <td className="px-3 py-2">{r.price_inr != null ? `₹${r.price_inr}` : '—'}</td>
                <td className="px-3 py-2">{r.otp_required ? 'Yes' : 'No'}</td>
                <td className="max-w-md px-3 py-2 text-xs text-[var(--app-muted)]">{r.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultsPanel({
  title,
  rows,
  onCsv,
  onXlsx,
  onPdf,
  disabledExport,
}: {
  title: string;
  rows: SearchResultRow[];
  onCsv: () => void;
  onXlsx: () => void;
  onPdf: () => void;
  disabledExport: boolean;
}) {
  return (
    <div className="min-w-0 w-full rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-[var(--app-text)]">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabledExport}
            onClick={onCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] hover:border-[#0668E1]/40 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button
            type="button"
            disabled={disabledExport}
            onClick={onXlsx}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] hover:border-[#0668E1]/40 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Excel
          </button>
          <button
            type="button"
            disabled={disabledExport}
            onClick={onPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-semibold text-[var(--app-text)] hover:border-[#0668E1]/40 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--app-muted)]">Run a search to see results here.</p>
      ) : (
        <div className="max-h-[520px] min-w-0 space-y-4 overflow-y-auto overflow-x-auto pr-1">
          {rows.map((row, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/40 p-4 dark:bg-[var(--app-bg)]/20"
            >
              {rows.length > 1 && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                  Result {i + 1}
                </p>
              )}
              <SearchResultKeyValue data={row as Record<string, unknown>} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
