import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Search, Table2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatFastApiDetail } from '../lib/api';
import { typeFieldHintForProduct, valuePlaceholderForProduct } from '../lib/productSearchHints';
import { getSearchFormFields, validateSearchForm } from '../lib/multiValueSearchForms';
import { CustomerSearchResult } from '../lib/searchResultFields';
import { refineSearchTypeOptions } from '../lib/searchTypeOptions';
import NoApisEnabled from '../components/NoApisEnabled';

type Tab = 'single' | 'bulk';

type SearchResultRow = Record<string, string | undefined>;

const SEARCH_TYPES = ['Auto', 'Aadhaar', 'PAN', 'Mobile', 'Email', 'Bank', 'Unknown'];

type MyApiRow = { slug: string; name: string; credits_per_hit: number; allowed_search_types?: string[] };

export default function Dashboard() {
  const { user, token, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('single');

  const [singleType, setSingleType] = useState('PAN');
  const [singleProduct, setSingleProduct] = useState('');
  const [singleValue, setSingleValue] = useState('');
  const [singleMultiValues, setSingleMultiValues] = useState<Record<string, string>>({});
  const [singleFieldErrors, setSingleFieldErrors] = useState<Record<string, string>>({});
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const [singleResults, setSingleResults] = useState<SearchResultRow[]>([]);

  const [bulkType, setBulkType] = useState('PAN');
  const [bulkProduct, setBulkProduct] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkMeta, setBulkMeta] = useState<{ processedCount: number; skippedCount: number } | null>(null);
  const [bulkResults, setBulkResults] = useState<SearchResultRow[]>([]);

  const [myApis, setMyApis] = useState<MyApiRow[]>([]);
  const [apisLoading, setApisLoading] = useState(true);

  const hasApis = myApis.length > 0;

  const singleTypeOptionsRaw = useMemo(() => {
    const row = myApis.find((a) => a.slug === singleProduct);
    const allowed = row?.allowed_search_types;
    if (allowed?.length) return allowed;
    return SEARCH_TYPES;
  }, [myApis, singleProduct]);

  const singleTypeRefined = useMemo(
    () => refineSearchTypeOptions(singleTypeOptionsRaw),
    [singleTypeOptionsRaw]
  );

  const singleFormFields = useMemo(() => getSearchFormFields(singleProduct, singleType), [singleProduct, singleType]);

  useEffect(() => {
    setSingleMultiValues({});
    setSingleFieldErrors({});
  }, [singleProduct, singleType]);

  const bulkTypeOptionsRaw = useMemo(() => {
    const row = myApis.find((a) => a.slug === bulkProduct);
    const allowed = row?.allowed_search_types;
    if (allowed?.length) return allowed;
    return SEARCH_TYPES;
  }, [myApis, bulkProduct]);

  const bulkTypeRefined = useMemo(() => refineSearchTypeOptions(bulkTypeOptionsRaw), [bulkTypeOptionsRaw]);

  const productOptions = useMemo(
    () =>
      myApis.map((a) => ({
        slug: a.slug,
        name: a.name,
      })),
    [myApis]
  );

  useEffect(() => {
    if (!token) {
      setMyApis([]);
      setApisLoading(false);
      return;
    }
    let cancelled = false;
    setApisLoading(true);
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
      })
      .finally(() => {
        if (!cancelled) setApisLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!myApis.length) return;
    const slugs = new Set(myApis.map((x) => x.slug));
    if (!slugs.has(singleProduct)) setSingleProduct(myApis[0]!.slug);
    if (!slugs.has(bulkProduct)) setBulkProduct(myApis[0]!.slug);
  }, [myApis, singleProduct, bulkProduct]);

  useEffect(() => {
    const { options, defaultType, showTypeSelector } = singleTypeRefined;
    if (!showTypeSelector && singleType !== defaultType) {
      setSingleType(defaultType);
      return;
    }
    if (!options.includes(singleType)) setSingleType(defaultType);
  }, [singleTypeRefined, singleType]);

  useEffect(() => {
    const { options, defaultType, showTypeSelector } = bulkTypeRefined;
    if (!showTypeSelector && bulkType !== defaultType) {
      setBulkType(defaultType);
      return;
    }
    if (!options.includes(bulkType)) setBulkType(defaultType);
  }, [bulkTypeRefined, bulkType]);

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
    if (!token || !hasApis || !singleProduct) return;
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
    } catch {
      setSingleError('Network error');
    } finally {
      setSingleLoading(false);
    }
  };

  const runBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !hasApis || !bulkProduct) return;
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
    } catch {
      setBulkError('Network error');
    } finally {
      setBulkLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'single', label: 'Single search', icon: Search },
    { id: 'bulk', label: 'Bulk search', icon: Table2 },
  ];

  const welcomeTitle = (() => {
    const first = (user?.first_name ?? '').trim();
    const last = (user?.last_name ?? '').trim();
    const full = [first, last].filter(Boolean).join(' ');
    return full ? `Welcome, ${full}` : 'Welcome';
  })();

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="mb-4 flex shrink-0 min-w-0 items-start gap-4 sm:mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0668E1]/15 text-[#0668E1]">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--app-text)] sm:text-3xl">{welcomeTitle}</h1>
            <p className="text-sm text-[var(--app-muted)] sm:text-base">Run single or bulk KYC lookups against your enabled products.</p>
          </div>
      </div>

      {apisLoading ? (
        <p className="text-sm text-[var(--app-muted)]">Loading your API access…</p>
      ) : !hasApis ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NoApisEnabled />
        </div>
      ) : (
        <>
      <div className="mb-4 flex shrink-0 flex-wrap gap-2 border-b border-[var(--app-border)] pb-2 sm:mb-5">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {tab === 'single' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6 lg:overflow-hidden">
          <form
            onSubmit={runSingle}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md"
          >
            <h2 className="shrink-0 px-6 pt-6 font-display text-lg font-bold text-[var(--app-text)]">Single identifier</h2>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-4">
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
            {(() => {
              const row = myApis.find((a) => a.slug === singleProduct);
              return row ? (
                <p className="mb-4 text-xs text-[var(--app-muted)]">{row.credits_per_hit} credits per search</p>
              ) : null;
            })()}
            <InputTypeField
              value={singleType}
              onChange={setSingleType}
              refined={singleTypeRefined}
              hint={typeFieldHintForProduct(singleProduct)}
            />
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
            </div>
            <div className="shrink-0 border-t border-[var(--app-border)] px-6 py-4">
            {singleError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{singleError}</p>}
            <button
              type="submit"
              disabled={singleLoading}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {singleLoading ? 'Searching…' : 'Run search'}
            </button>
            </div>
          </form>

          <ResultsPanel title="Latest result" rows={singleResults} />
        </div>
      )}

      {tab === 'bulk' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6 lg:overflow-hidden">
          <form
            onSubmit={runBulk}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md"
          >
            <h2 className="shrink-0 px-6 pt-6 font-display text-lg font-bold text-[var(--app-text)]">Bulk input</h2>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-2">
            <p className="mb-4 text-sm text-[var(--app-muted)]">
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
            {(() => {
              const row = myApis.find((a) => a.slug === bulkProduct);
              return row ? (
                <p className="mb-4 text-xs text-[var(--app-muted)]">{row.credits_per_hit} credits per search</p>
              ) : null;
            })()}
            <InputTypeField
              value={bulkType}
              onChange={setBulkType}
              refined={bulkTypeRefined}
              hint={typeFieldHintForProduct(bulkProduct)}
            />
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
            </div>
            <div className="shrink-0 border-t border-[var(--app-border)] px-6 py-4">
            {bulkError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{bulkError}</p>}
            <button
              type="submit"
              disabled={bulkLoading || (!bulkText.trim() && !bulkFile)}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {bulkLoading ? 'Processing…' : 'Run bulk search'}
            </button>
            </div>
          </form>

          <ResultsPanel title="Bulk results" rows={bulkResults} />
        </div>
      )}
      </div>
        </>
      )}
    </div>
  );
}

function InputTypeField({
  value,
  onChange,
  refined,
  hint,
}: {
  value: string;
  onChange: (next: string) => void;
  refined: ReturnType<typeof refineSearchTypeOptions>;
  hint: string | null;
}) {
  const displayValue = refined.options.includes(value) ? value : refined.defaultType;

  return (
    <>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
        Input type
      </label>
      {refined.showTypeSelector ? (
        <select
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
        >
          {refined.options.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        <p className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm font-medium text-[var(--app-text)]">
          {displayValue}
        </p>
      )}
      {hint ? <p className="mb-3 text-xs text-[var(--app-muted)]">{hint}</p> : <div className="mb-3" />}
    </>
  );
}

function ResultsPanel({ title, rows }: { title: string; rows: SearchResultRow[] }) {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md">
      <h2 className="shrink-0 px-6 pt-6 font-display text-lg font-bold text-[var(--app-text)]">{title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-6 pb-6 pt-4">
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--app-muted)]">Run a search to see results here.</p>
      ) : (
        <div className="min-w-0 space-y-4 pr-1">
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
              <CustomerSearchResult row={row as Record<string, unknown>} />
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
