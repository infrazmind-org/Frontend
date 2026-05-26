import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, formatFastApiDetail } from '../lib/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as { from?: string | { pathname?: string }; registered?: boolean } | null;
  const rawFrom = locState?.from;
  const from = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname || '/dashboard';
  const registered = Boolean(locState?.registered);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--app-bg)] px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 opacity-25">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#0668E1] to-transparent blur-[100px] mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-xl backdrop-blur-md"
      >
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-[var(--app-text)]">Sign in</h1>
        <p className="mb-8 text-sm text-[var(--app-muted)]">
          Sign in with the email and password you used at registration. Pending accounts cannot sign in until an administrator activates access.
        </p>

        {registered && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            Thanks for registering. Your request is in the admin queue. You will receive an email at this address when you can sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none ring-[#0668E1]/0 transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
            />
          </div>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0668E1] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0668E1]/25 transition hover:bg-[#0556ba] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--app-muted)]">
          No account?{' '}
          <Link to="/register" className="font-semibold text-[#0668E1] hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-[var(--app-muted)]">
          <Link to="/contact" className="hover:text-[#0668E1]">
            Contact support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
