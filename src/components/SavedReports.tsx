import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { apiFetch, formatFastApiDetail } from '../lib/api';

type SavedReportRow = {
  id: number;
  product_slug: string;
  product_name: string;
  created_at: string;
  can_download: boolean;
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
}

export default function SavedReports({ token }: { token: string }) {
  const [rows, setRows] = useState<SavedReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/user/reports', { token });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      setRows(Array.isArray(data) ? (data as SavedReportRow[]) : []);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const openReport = async (id: number) => {
    setOpeningId(id);
    setError(null);
    const win = window.open('', '_blank');
    try {
      const res = await apiFetch(`/api/user/reports/${id}/download`, { token });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.url !== 'string') {
        win?.close();
        setError(formatFastApiDetail(data));
        return;
      }
      if (win) {
        win.opener = null;
        win.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      win?.close();
      setError('Network error');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] backdrop-blur-md">
      <div className="flex shrink-0 items-start justify-between gap-3 px-6 pt-6">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--app-text)]">My reports</h2>
          <p className="mt-1 text-xs text-[var(--app-muted)]">Every report you have generated is saved here.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--app-border)] px-3 py-2 text-xs font-semibold text-[var(--app-text-secondary)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-4">
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        {loading && rows.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">No saved reports yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--app-border)]">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--app-text)]">{r.product_name}</p>
                  <p className="text-xs text-[var(--app-muted)]">{formatWhen(r.created_at)}</p>
                </div>
                {r.can_download ? (
                  <button
                    type="button"
                    onClick={() => void openReport(r.id)}
                    disabled={openingId === r.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0668E1] px-3 py-2 text-xs font-bold text-white hover:bg-[#0556ba] disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {openingId === r.id ? 'Opening…' : 'Download'}
                  </button>
                ) : (
                  <span className="text-xs text-[var(--app-muted)]">Download not enabled</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
