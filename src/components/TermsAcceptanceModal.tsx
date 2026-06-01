import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TERMS_LAST_UPDATED,
  type TermsContext,
  buildTermsSections,
  formatTermsDateTimeIst,
} from '../content/termsAndConditions';

type Props = {
  open: boolean;
  context: Pick<TermsContext, 'userName' | 'userId'>;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
};

export default function TermsAcceptanceModal({
  open,
  context,
  title = 'Terms and Conditions',
  subtitle = 'Please read and accept the Terms and Conditions to continue.',
  confirmLabel = 'I agree to the Terms and Conditions',
  loading = false,
  error = null,
  onConfirm,
}: Props) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [frozenContext, setFrozenContext] = useState<TermsContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setScrolledToEnd(false);
    setChecked(false);
    setFrozenContext({
      userName: context.userName.trim() || context.userId.trim() || '—',
      userId: context.userId.trim() || '—',
      dateTime: formatTermsDateTimeIst(new Date()),
    });
  }, [open, context.userName, context.userId]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      if (atEnd) setScrolledToEnd(true);
    };
    onScroll();
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [open, frozenContext]);

  const sections = useMemo(
    () => (frozenContext ? buildTermsSections(frozenContext) : []),
    [frozenContext]
  );

  if (!open || !frozenContext) return null;

  const canConfirm = scrolledToEnd && checked && !loading;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl">
        <div className="shrink-0 border-b border-[var(--app-border)] px-6 py-5">
          <h2 id="terms-modal-title" className="font-display text-xl font-bold text-[var(--app-text)]">
            Infrazmind — {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--app-muted)]">{subtitle}</p>
          <p className="mt-2 text-xs text-[var(--app-muted)]">Last updated: {TERMS_LAST_UPDATED}</p>
          <dl className="mt-3 grid gap-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-text-secondary)] sm:grid-cols-3">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[var(--app-muted)]">User name</dt>
              <dd className="mt-0.5 text-[var(--app-text)]">{frozenContext.userName}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[var(--app-muted)]">User ID</dt>
              <dd className="mt-0.5 break-all text-[var(--app-text)]">{frozenContext.userId}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-[var(--app-muted)]">Date & time (IST)</dt>
              <dd className="mt-0.5 text-[var(--app-text)]">{frozenContext.dateTime}</dd>
            </div>
          </dl>
        </div>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-[var(--app-text-secondary)]"
        >
          {sections.map((section) => (
            <section key={section.title} className="mb-6 last:mb-0">
              <h3 className="mb-2 font-display text-base font-semibold text-[var(--app-text)]">{section.title}</h3>
              <div className="whitespace-pre-wrap">{section.body}</div>
            </section>
          ))}
        </div>

        <div className="shrink-0 space-y-4 border-t border-[var(--app-border)] px-6 py-5">
          {!scrolledToEnd ? (
            <p className="app-alert-warn">Scroll to the end of the document to enable acceptance.</p>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--app-text-secondary)]">
            <input
              type="checkbox"
              checked={checked}
              disabled={!scrolledToEnd || loading}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-[var(--app-border)] text-[#0668E1] focus:ring-[#0668E1]/30 disabled:opacity-50"
            />
            <span>
              I have read and agree to the Infrazmind Terms and Conditions, including the Acceptable Use Policy and
              prohibited uses, for User Name <strong className="text-[var(--app-text)]">{frozenContext.userName}</strong>, User ID{' '}
              <strong className="text-[var(--app-text)]">{frozenContext.userId}</strong>, on{' '}
              <strong className="text-[var(--app-text)]">{frozenContext.dateTime}</strong>.
            </span>
          </label>
          {error ? <div className="app-alert-error">{error}</div> : null}
          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            className="w-full rounded-xl bg-[#0668E1] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0668E1]/25 transition hover:bg-[#0556ba] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
