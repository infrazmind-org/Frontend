import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatFastApiDetail } from '../lib/api';
import PasswordInput from '../components/PasswordInput';

const RESEND_COOLDOWN_MS = 45_000;
const DEFAULT_OTP_SECONDS = 180;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resendWaitSec = Math.max(0, Math.ceil((resendDisabledUntil - Date.now()) / 1000));
  const canResend = Date.now() >= resendDisabledUntil;
  const busy = sendingOtp || verifyingOtp || saving;

  useEffect(() => {
    if (!otpDeadline || otpVerified) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((otpDeadline - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [otpDeadline, otpVerified]);

  const requestOtp = async () => {
    if (!token) return;
    setError(null);
    setSuccess(null);
    setSendingOtp(true);
    try {
      const res = await apiFetch('/api/user/change-password/request-otp', {
        method: 'POST',
        token,
        body: JSON.stringify({}),
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
    if (!token) return;
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
      const res = await apiFetch('/api/user/change-password/verify-otp', {
        method: 'POST',
        token,
        body: JSON.stringify({ otp }),
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

  const confirmChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !verificationToken) return;
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/user/change-password/confirm', {
        method: 'POST',
        token,
        body: JSON.stringify({ password, verification_token: verificationToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      setSuccess(typeof data.message === 'string' ? data.message : 'Password updated successfully.');
      setPassword('');
      setPassword2('');
      window.setTimeout(
        () => navigate('/dashboard/settings', { replace: true, state: { passwordUpdated: true } }),
        1500
      );
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-0 w-full min-w-0 max-w-full flex-1 overflow-y-auto px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/dashboard/settings"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-muted)] hover:text-[#0668E1]"
      >
        ← Back to settings
      </Link>

      <div className="mx-auto max-w-lg rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0668E1]/10 text-[#0668E1]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-[var(--app-text)]">Change password</h1>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              We will send a verification code to <strong className="text-[var(--app-text)]">{user.email}</strong> (valid
              for 3 minutes).
            </p>
          </div>
        </div>

        {!otpVerified && (
          <div className="space-y-4">
            <button
              type="button"
              disabled={busy || !canResend}
              onClick={() => void requestOtp()}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {sendingOtp ? 'Sending code…' : otpSent && !canResend ? `Resend in ${resendWaitSec}s` : otpSent ? 'Resend code' : 'Send verification code'}
            </button>

            {otpSent && (
              <>
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
                  />
                  <p className="mt-2 text-xs text-[var(--app-muted)]">
                    {secondsLeft > 0 ? `Expires in ${secondsLeft}s` : 'Expired — request a new code'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy || secondsLeft <= 0}
                  onClick={() => void verifyOtp()}
                  className="w-full rounded-xl border border-[var(--app-border)] py-3 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-muted)] disabled:opacity-50"
                >
                  {verifyingOtp ? 'Verifying…' : 'Confirm code'}
                </button>
              </>
            )}
          </div>
        )}

        {otpVerified && (
          <form onSubmit={(e) => void confirmChange(e)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                New password
              </label>
              <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Re-enter password
              </label>
              <PasswordInput autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#0668E1] py-3 text-sm font-bold text-white hover:bg-[#0556ba] disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Confirm change password'}
            </button>
          </form>
        )}

        {error && (
          <p className="app-alert-error mt-4">{error}</p>
        )}
        {success && <p className="app-alert-success mt-4">{success}</p>}
      </div>
    </div>
  );
}
