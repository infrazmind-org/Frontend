import React, { useState } from 'react';
import { useAuth, type User } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { TERMS_VERSION } from '../content/termsAndConditions';
import { userDisplayName } from '../lib/userDisplay';
import TermsAcceptanceModal from './TermsAcceptanceModal';

/** Blocks the dashboard until the user acknowledges terms for this login session. */
export default function TermsGate() {
  const { user, token, login, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsAck = Boolean(user?.terms_ack_required);

  const handleAccept = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch('/api/user/accept-terms', {
        token,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms_version: TERMS_VERSION }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not save your acceptance. Try again.');
        return;
      }
      if (data && typeof data === 'object' && 'id' in data && token) {
        login(token, data as User);
      } else {
        await refreshUser();
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const termsContext = user
    ? { userName: userDisplayName(user), userId: user.email }
    : { userName: '—', userId: '—' };

  return (
    <TermsAcceptanceModal
      open={needsAck}
      context={termsContext}
      title="Terms and Conditions"
      subtitle="You must accept the Terms and Conditions to use the dashboard on this sign-in."
      confirmLabel="I agree and continue to dashboard"
      loading={loading}
      error={error}
      onConfirm={() => void handleAccept()}
    />
  );
}
