import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import ThemeSwitch from './ThemeSwitch';
import ProfileMenu from './ProfileMenu';
import TermsGate from './TermsGate';

export default function DashboardChrome() {
  const { user } = useAuth();

  return (
    <div className="flex h-dvh max-h-dvh w-full min-w-0 flex-col overflow-hidden bg-[var(--app-bg)]">
      <header className="sticky top-0 z-50 shrink-0 border-b border-[var(--app-border)] bg-[var(--app-nav)] backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex min-w-0 items-center">
            <Logo className="h-8 w-auto shrink-0" />
          </Link>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {user && (
              <p
                className="rounded-full border border-[#0668E1]/20 bg-[#0668E1]/8 px-3 py-1.5 text-sm font-semibold text-[var(--app-text)]"
                title="Credits remaining"
              >
                <span className="tabular-nums text-[#0668E1]">
                  {Number.isFinite(user.credits) ? Number(user.credits.toFixed(4)) : user.credits}
                </span>
                <span className="ml-1 text-[var(--app-muted)] font-normal">credits</span>
              </p>
            )}
            <ThemeSwitch />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <main className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
        <TermsGate />
      </main>
    </div>
  );
}
