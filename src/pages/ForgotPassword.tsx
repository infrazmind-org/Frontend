import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { apiUrl, formatFastApiDetail } from '../lib/api';
import PasswordInput from '../components/PasswordInput';

const RESEND_COOLDOWN_MS = 45_000;
const DEFAULT_OTP_SECONDS = 180;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpDeadline, setOtpDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendDisabledUntil, setResendDisabledUntil] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const otpEmailSnapshot = useRef<string | null>(null);

  const resendWaitSec = Math.max(0, Math.ceil((resendDisabledUntil - Date.now()) / 1000));
  const canResend = Date.now() >= resendDisabledUntil;
  const busy = sendingOtp || verifyingOtp || resetting;

  useEffect(() => {
    if (!otpDeadline || otpVerified) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((otpDeadline - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [otpDeadline, otpVerified]);

  const requestOtp = async () => {
    setError(null);
    setSuccess(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email first.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password/request-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      const sec = typeof data.expires_in_seconds === 'number' ? data.expires_in_seconds : DEFAULT_OTP_SECONDS;
      setOtpSent(true);
      setOtpDeadline(Date.now() + sec * 1000);
      setSecondsLeft(sec);
      setResendDisabledUntil(Date.now() + RESEND_COOLDOWN_MS);
      otpEmailSnapshot.current = trimmed;
      setOtpVerified(false);
      setVerificationToken(null);
      setOtp('');
    } catch {
      setError('Network error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
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
      const res = await fetch(apiUrl('/api/auth/forgot-password/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
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
      setOtpVerified(true);
    } catch {
      setError('Network error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!verificationToken) {
      setError('Verify the code from your email first.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password/reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          verification_token: verificationToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      setSuccess(typeof data.message === 'string' ? data.message : 'Password updated.');
      window.setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch {
      setError('Network error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--app-bg)] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-xl"
      >
        <h1 className="mb-2 font-display text-3xl font-bold text-[var(--app-text)]">Forgot password</h1>
        <p className="mb-6 text-sm text-[var(--app-muted)]">
          Enter your account email. We will send a 4-digit code (valid for 3 minutes) to reset your password.
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              disabled={otpVerified}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)] disabled:opacity-60"
            />
          </div>

          {!otpVerified && (
            <>
              <button
                type="button"
                disabled={busy || !canResend}
                onClick={() => void requestOtp()}
                className="w-full rounded-xl border border-[var(--app-border)] py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
              >
                {sendingOtp ? 'Sending code…' : otpSent && !canResend ? `Resend in ${resendWaitSec}s` : otpSent ? 'Resend code' : 'Send verification code'}
              </button>

              {otpSent && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                    Verification code
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 font-mono text-lg tracking-[0.35em] text-[var(--app-text)]"
                    placeholder="0000"
                  />
                  <p className="mt-2 text-xs text-[var(--app-muted)]">
                    {secondsLeft > 0 ? `Code expires in ${secondsLeft}s` : 'Code expired — request a new one'}
                  </p>
                  <button
                    type="button"
                    disabled={busy || secondsLeft <= 0}
                    onClick={() => void verifyOtp()}
                    className="mt-3 w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Verifying…' : 'Confirm code'}
                  </button>
                </div>
              )}
            </>
          )}

          {otpVerified && (
            <form onSubmit={(e) => void resetPassword(e)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                  New password
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                  Re-enter password
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={resetting}
                className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
              >
                {resetting ? 'Updating…' : 'Change password'}
              </button>
            </form>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              {success}
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--app-muted)]">
          <Link to="/login" className="font-semibold text-[#0668E1] hover:underline">
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
