import React, { useEffect, useMemo, useState } from 'react';
import { Download, LayoutDashboard, Search, Table2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatFastApiDetail, sanitizeCustomerFacingError } from '../lib/api';
import {
  bulkExampleForProduct,
  typeFieldHintForProduct,
  valuePlaceholderForProduct,
} from '../lib/productSearchHints';
import { downloadBulkResultsCsv } from '../lib/bulkResultsCsv';
import { getSearchFormFields, validateSearchForm } from '../lib/multiValueSearchForms';
import { CustomerSearchResult } from '../lib/searchResultFields';
import { refineSearchTypeOptions } from '../lib/searchTypeOptions';
import NoApisEnabled from '../components/NoApisEnabled';
import { formatCredits } from '../lib/formatCredits';

type Tab = 'single' | 'bulk';

type SearchResultRow = Record<string, string | undefined>;

const SEARCH_TYPES = ['Auto', 'Aadhaar', 'PAN', 'Mobile', 'Email', 'Bank', 'Unknown'];

type MyApiRow = { slug: string; name: string; credits_per_hit: number; allowed_search_types?: string[] };

export default function Dashboard() {
  const { user, token, authReady, refreshUser } = useAuth();
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
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkMeta, setBulkMeta] = useState<{ processedCount: number; skippedCount: number } | null>(null);
  const [bulkResults, setBulkResults] = useState<SearchResultRow[]>([]);

  const [myApis, setMyApis] = useState<MyApiRow[]>([]);
  const [apisLoading, setApisLoading] = useState(true);

  const hasApis = myApis.length > 0;
  const searchBusy = singleLoading || bulkLoading;

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

  const bulkLineCount = useMemo(
    () => bulkText.split(/\r?\n/).map((ln) => ln.trim()).filter(Boolean).length,
    [bulkText]
  );

  const productOptions = useMemo(
    () =>
      myApis.map((a) => ({
        slug: a.slug,
        name: a.name,
      })),
    [myApis]
  );

  useEffect(() => {
    if (!token || !authReady) {
      if (!token) {
        setMyApis([]);
        setApisLoading(false);
      }
      return;
    }
    if (user?.terms_ack_required) {
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
  }, [token, authReady, user?.terms_ack_required]);

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
        setSingleError(sanitizeCustomerFacingError(String((data as { error: unknown }).error)));
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
    if (bulkLineCount === 0) {
      setBulkError('Enter at least one value — one identifier per line.');
      return;
    }
    setBulkLoading(true);
    setBulkMeta(null);
    try {
      const res = await apiFetch('/api/search/bulk', {
        method: 'POST',
        token,
        body: JSON.stringify({ type: bulkType, values: bulkText, productSlug: bulkProduct }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBulkError(formatFastApiDetail(data));
        setBulkResults([]);
        return;
      }
      setBulkMeta({ processedCount: data.processedCount, skippedCount: data.skippedCount });
      setBulkResults((data.results || []) as SearchResultRow[]);
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
            disabled={searchBusy}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

      {searchBusy && (
        <p className="mb-4 shrink-0 rounded-xl border border-[#0668E1]/30 bg-[#0668E1]/10 px-4 py-3 text-sm text-[var(--app-text-secondary)]">
          Waiting for the verification provider — this can take a minute or more. Please keep this page open; inputs are
          locked until the current search finishes.
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {tab === 'single' && (
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6 lg:overflow-hidden">
          <form
            onSubmit={runSingle}
            className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md ${searchBusy ? 'opacity-70' : ''}`}
            aria-busy={singleLoading}
          >
            <h2 className="shrink-0 px-6 pt-6 font-display text-lg font-bold text-[var(--app-text)]">Single identifier</h2>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Product
            </label>
            <select
              value={singleProduct}
              disabled={searchBusy}
              onChange={(e) => setSingleProduct(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:cursor-not-allowed"
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
                <p className="mb-4 text-xs text-[var(--app-muted)]">{formatCredits(row.credits_per_hit)} credits per search</p>
              ) : null;
            })()}
            <InputTypeField
              value={singleType}
              onChange={setSingleType}
              refined={singleTypeRefined}
              hint={typeFieldHintForProduct(singleProduct)}
              disabled={searchBusy}
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
                      disabled={searchBusy}
                      value={singleMultiValues[f.id] ?? ''}
                      onChange={(e) => updateSingleField(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:cursor-not-allowed"
                    />
                    {singleFieldErrors[f.id] ? (
                      <p className="mt-1 text-sm text-[var(--app-error-text)]">{singleFieldErrors[f.id]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Value</label>
                <textarea
                  value={singleValue}
                  disabled={searchBusy}
                  onChange={(e) => setSingleValue(e.target.value)}
                  rows={3}
                  className="mb-4 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:cursor-not-allowed"
                  placeholder={valuePlaceholderForProduct(singleProduct)}
                />
              </>
            )}
            </div>
            <div className="shrink-0 border-t border-[var(--app-border)] px-6 py-4">
            {singleError && <p className="app-alert-error mb-3">{singleError}</p>}
            <button
              type="submit"
              disabled={searchBusy}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {singleLoading ? 'Waiting for provider…' : 'Run search'}
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
            className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md ${searchBusy ? 'opacity-70' : ''}`}
            aria-busy={bulkLoading}
          >
            <h2 className="shrink-0 px-6 pt-6 font-display text-lg font-bold text-[var(--app-text)]">Bulk search</h2>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2 pt-2">
            <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm text-[var(--app-text-secondary)]">
              <li>Select the product and input type (same rules as single search).</li>
              <li>
                Enter <strong className="text-[var(--app-text)]">one identifier per line</strong> in the box below — do not use commas or
                spreadsheets; press Enter after each value.
              </li>
              <li>Run the search. Each line is charged when the provider completes the lookup (including not found).</li>
              <li>Download results as CSV from the results panel when finished.</li>
            </ol>
            <p className="mb-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-muted)]">
              Processing stops if credits run out. Invalid lines are skipped and counted in “skipped”.
            </p>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Product
            </label>
            <select
              value={bulkProduct}
              disabled={searchBusy}
              onChange={(e) => setBulkProduct(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:cursor-not-allowed"
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
                <p className="mb-4 text-xs text-[var(--app-muted)]">{formatCredits(row.credits_per_hit)} credits per search</p>
              ) : null;
            })()}
            <InputTypeField
              value={bulkType}
              onChange={setBulkType}
              refined={bulkTypeRefined}
              hint={typeFieldHintForProduct(bulkProduct)}
              disabled={searchBusy}
            />
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Values (one per line)
              </label>
              <span className="text-xs text-[var(--app-muted)]">
                {bulkLineCount} line{bulkLineCount === 1 ? '' : 's'}
              </span>
            </div>
            <textarea
              value={bulkText}
              disabled={searchBusy}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              spellCheck={false}
              className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 font-mono text-sm leading-relaxed text-[var(--app-text)] disabled:cursor-not-allowed"
              placeholder={bulkExampleForProduct(bulkProduct)}
            />
            <p className="mb-4 text-xs text-[var(--app-muted)]">
              Format: {valuePlaceholderForProduct(bulkProduct)}
            </p>
            {bulkMeta && (
              <p className="mb-4 text-sm text-[var(--app-muted)]">
                Processed <strong className="text-[var(--app-text)]">{bulkMeta.processedCount}</strong>, skipped{' '}
                <strong className="text-[var(--app-text)]">{bulkMeta.skippedCount}</strong> (insufficient credits or empty rows).
              </p>
            )}
            </div>
            <div className="shrink-0 border-t border-[var(--app-border)] px-6 py-4">
            {bulkError && <p className="app-alert-error mb-3">{bulkError}</p>}
            <button
              type="submit"
              disabled={searchBusy || bulkLineCount === 0}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {bulkLoading ? 'Waiting for provider…' : 'Run bulk search'}
            </button>
            </div>
          </form>

          <ResultsPanel
            title="Bulk results"
            rows={bulkResults}
            csvDownloadSlug={bulkProduct}
          />
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
  disabled = false,
}: {
  value: string;
  onChange: (next: string) => void;
  refined: ReturnType<typeof refineSearchTypeOptions>;
  hint: string | null;
  disabled?: boolean;
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
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="mb-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:cursor-not-allowed"
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

function ResultsPanel({
  title,
  rows,
  csvDownloadSlug,
}: {
  title: string;
  rows: SearchResultRow[];
  csvDownloadSlug?: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md">
      <div className="flex shrink-0 items-start justify-between gap-3 px-6 pt-6">
        <h2 className="font-display text-lg font-bold text-[var(--app-text)]">{title}</h2>
        {csvDownloadSlug && rows.length > 0 ? (
          <button
            type="button"
            onClick={() => downloadBulkResultsCsv(rows as Record<string, unknown>[], csvDownloadSlug)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#0668E1]/40 bg-[#0668E1]/10 px-3 py-2 text-xs font-bold text-[#0668E1] transition hover:bg-[#0668E1]/15"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        ) : null}
      </div>
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
              {rows.length > 1 ? (
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">
                  Result {i + 1}
                  {typeof (row as Record<string, unknown>).searchValue === 'string' &&
                  (row as Record<string, unknown>).searchValue ? (
                    <span className="mt-1 block font-mono normal-case text-[var(--app-text)]">
                      {(row as Record<string, unknown>).searchValue as string}
                    </span>
                  ) : null}
                </p>
              ) : null}
              <CustomerSearchResult row={row as Record<string, unknown>} />
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
