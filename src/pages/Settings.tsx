import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, LifeBuoy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatFastApiDetail } from '../lib/api';
import { userDisplayName } from '../lib/userDisplay';

function formatSignedUp(createdAt?: string): string {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Settings() {
  const { user, token, refreshUser } = useAuth();
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportSuccess, setSupportSuccess] = useState<string | null>(null);

  const submitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const body = supportMessage.trim();
    if (body.length < 10) {
      setSupportError('Please enter at least 10 characters describing your issue.');
      return;
    }
    setSupportLoading(true);
    setSupportError(null);
    setSupportSuccess(null);
    try {
      const res = await apiFetch('/api/user/support', {
        method: 'POST',
        token,
        body: JSON.stringify({ message: body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSupportError(formatFastApiDetail(data));
        return;
      }
      setSupportMessage('');
      setSupportSuccess(
        typeof data.message === 'string'
          ? data.message
          : 'Your message was sent. Our team will reply to your account email.'
      );
      await refreshUser();
    } catch {
      setSupportError('Network error. Please try again.');
    } finally {
      setSupportLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-0 w-full min-w-0 max-w-full flex-1 overflow-y-auto px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[#0668E1]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)]">Settings</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">Your account details and support.</p>

      <section className="mt-8 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Account</h2>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Name</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--app-text)]">{userDisplayName(user)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Email</dt>
            <dd className="mt-1 break-all text-sm font-medium text-[var(--app-text)]">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Signed up</dt>
            <dd className="mt-1 text-sm font-medium text-[var(--app-text)]">
              {formatSignedUp((user as { created_at?: string }).created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Credits remaining</dt>
            <dd className="mt-1 text-sm font-semibold tabular-nums text-[#0668E1]">{user.credits}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0668E1]/10 text-[#0668E1]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Security</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">
                Change your password using a verification code sent to your email.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/change-password"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-semibold text-[var(--app-text)] hover:border-[#0668E1]/40 hover:text-[#0668E1]"
          >
            Change password
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0668E1]/10 text-[#0668E1]">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Help &amp; support</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              Describe your issue below. We receive your message at our support inbox and can reply directly to{' '}
              <strong className="font-medium text-[var(--app-text)]">{user.email}</strong>.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => void submitSupport(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="support-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Message
            </label>
            <textarea
              id="support-message"
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full resize-y rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
            />
          </div>
          {supportError && (
            <p className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
              {supportError}
            </p>
          )}
          {supportSuccess && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100">
              {supportSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={supportLoading}
            className="rounded-xl bg-[#0668E1] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0668E1]/20 hover:bg-[#0556ba] disabled:opacity-50"
          >
            {supportLoading ? 'Sending…' : 'Send to support'}
          </button>
        </form>
      </section>
    </div>
  );
}
