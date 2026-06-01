import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiUrl, formatFastApiDetail } from '../lib/api';
import PasswordInput from '../components/PasswordInput';
import TermsAcceptanceModal from '../components/TermsAcceptanceModal';
import { TERMS_VERSION } from '../content/termsAndConditions';

const RESEND_COOLDOWN_MS = 45_000;

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpDeadline, setOtpDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendDisabledUntil, setResendDisabledUntil] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpEmailSnapshot = useRef<string | null>(null);

  const resendWaitSec = Math.max(0, Math.ceil((resendDisabledUntil - Date.now()) / 1000));
  const canResend = Date.now() >= resendDisabledUntil;
  const otpExpired = otpSent && !emailVerified && otpDeadline != null && secondsLeft <= 0;
  const busy = sendingOtp || verifyingOtp || registering;

  useEffect(() => {
    if (!otpDeadline || emailVerified) return;
    const tick = () => {
      const rem = Math.max(0, Math.ceil((otpDeadline - Date.now()) / 1000));
      setSecondsLeft(rem);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [otpDeadline, emailVerified]);

  useEffect(() => {
    if (emailVerified) return;
    const snap = otpEmailSnapshot.current;
    if (snap != null && email.trim() !== snap) {
      setOtp('');
      setOtpSent(false);
      setOtpDeadline(null);
      setSecondsLeft(0);
      setVerificationToken(null);
      setError(null);
      otpEmailSnapshot.current = null;
    }
  }, [email, emailVerified]);

  const requestOtp = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email first.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register/request-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      const sec = typeof data.expires_in_seconds === 'number' ? data.expires_in_seconds : 180;
      setOtpSent(true);
      setOtpDeadline(Date.now() + sec * 1000);
      setSecondsLeft(sec);
      setResendDisabledUntil(Date.now() + RESEND_COOLDOWN_MS);
      otpEmailSnapshot.current = trimmed;
    } catch {
      setError('Network error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    const trimmed = email.trim();
    if (otp.length !== 4) {
      setError('Enter the 4-digit code from your email.');
      return;
    }
    if (otpDeadline != null && Date.now() > otpDeadline) {
      setError('This code has expired. Request a new one.');
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      const tok = typeof data.verification_token === 'string' ? data.verification_token : '';
      if (!tok) {
        setError('Unexpected response from server.');
        return;
      }
      setVerificationToken(tok);
      setEmailVerified(true);
      setOtpDeadline(null);
      setSecondsLeft(0);
    } catch {
      setError('Network error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!verificationToken) {
      setError('Verify your email first.');
      return;
    }
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setError('Enter your first and last name.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      setTermsModalOpen(true);
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          verification_token: verificationToken,
          first_name: fn,
          last_name: ln,
          terms_accepted: true,
          terms_version: TERMS_VERSION,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      navigate('/login', { replace: true, state: { registered: true } });
    } catch {
      setError('Network error');
    } finally {
      setRegistering(false);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
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
        <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-[var(--app-text)]">Create account</h1>
        <p className="mb-8 text-sm text-[var(--app-muted)]">
          Verify your email with a one-time code, then choose a password. Your request is queued for review; you can sign in only after an
          administrator approves your account.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Email</label>
            {emailVerified ? (
              <>
                <input
                  type="email"
                  autoComplete="email"
                  readOnly
                  value={email}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none read-only:cursor-not-allowed read-only:opacity-80"
                />
                <p className="app-badge-success mt-1.5 inline-block text-xs">Email verified</p>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
                  />
                  <button
                    type="button"
                    disabled={busy || !email.trim() || (!canResend && otpSent)}
                    onClick={() => void requestOtp()}
                    className="shrink-0 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-secondary)] px-4 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-36"
                  >
                    {sendingOtp ? 'Sending…' : otpSent ? 'Resend code' : 'Verify email'}
                  </button>
                </div>
                {otpSent && !canResend && resendWaitSec > 0 ? (
                  <p className="mt-1.5 text-xs text-[var(--app-muted)]">You can request another code in {resendWaitSec}s.</p>
                ) : null}
              </>
            )}
          </div>

          {otpSent && !emailVerified ? (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Enter 4-digit code
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-36 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
                />
                <button
                  type="button"
                  disabled={busy || otp.length !== 4 || (secondsLeft <= 0 && otpDeadline != null)}
                  onClick={() => void verifyOtp()}
                  className="rounded-xl bg-[#0668E1] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#0668E1]/20 transition hover:bg-[#0556ba] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifyingOtp ? 'Checking…' : 'Submit code'}
                </button>
                {otpSent && !emailVerified && secondsLeft > 0 ? (
                  <span className="text-sm font-mono text-[var(--app-muted)]">Expires in {fmt(secondsLeft)}</span>
                ) : null}
              </div>
              {otpExpired ? (
                <p className="mt-2 text-sm text-amber-950 dark:text-amber-200">
                  This code has expired. Request a new code with the button above.
                </p>
              ) : null}
            </div>
          ) : null}

          {emailVerified ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                    First name
                  </label>
                  <input
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                    Last name
                  </label>
                  <input
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] outline-none transition focus:border-[#0668E1]/50 focus:ring-4 focus:ring-[#0668E1]/15"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">Password</label>
                <PasswordInput
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-1.5 text-xs text-[var(--app-muted)]">At least 6 characters.</p>
              </div>
            </>
          ) : null}

          {emailVerified ? (
            <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <p className="text-sm text-[var(--app-text-secondary)]">
                You must read and accept the Terms and Conditions before registering.
              </p>
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className="mt-3 rounded-xl border border-[#0668E1]/40 bg-[#0668E1]/10 px-4 py-2.5 text-sm font-semibold text-[#0668E1] transition hover:bg-[#0668E1]/15"
              >
                {termsAccepted ? 'Terms accepted — review again' : 'Read Terms and Conditions'}
              </button>
              {termsAccepted ? (
                <p className="app-badge-success mt-2 inline-block text-xs">Terms and Conditions accepted</p>
              ) : null}
            </div>
          ) : null}

          {error && (
            <div className="app-alert-error">{error}</div>
          )}

          <button
            type="submit"
            disabled={
              busy || !emailVerified || !firstName.trim() || !lastName.trim() || password.length < 6 || !termsAccepted
            }
            className="w-full rounded-xl bg-[#0668E1] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0668E1]/25 transition hover:bg-[#0556ba] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registering ? 'Submitting…' : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--app-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#0668E1] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>

      <TermsAcceptanceModal
        open={termsModalOpen}
        context={{
          userName: [firstName, lastName].map((s) => s.trim()).filter(Boolean).join(' ') || email.trim(),
          userId: email.trim(),
        }}
        title="Terms and Conditions"
        subtitle="Review the full Terms and Conditions before creating your account."
        confirmLabel="I agree to the Terms and Conditions"
        onConfirm={() => {
          setTermsAccepted(true);
          setTermsModalOpen(false);
        }}
      />
    </div>
  );
}
