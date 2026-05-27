import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NoApisEnabled() {
  return (
    <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0668E1]/10 text-[#0668E1]">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-xl font-bold text-[var(--app-text)]">No APIs enabled yet</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--app-text-secondary)]">
        Your account is signed in, but no verification products have been assigned to you. Contact your administrator
        to request API access. If you were recently onboarded, please wait while your entitlements are configured.
      </p>
      <Link
        to="/contact"
        className="mt-6 inline-flex rounded-xl bg-[#0668E1] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0668E1]/20 transition hover:bg-[#0556ba]"
      >
        Contact support
      </Link>
    </div>
  );
}
