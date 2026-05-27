import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center bg-[var(--app-bg)] px-4 py-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 opacity-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#0668E1] to-transparent blur-[100px]" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg text-center"
      >
        <p className="font-display text-7xl font-bold tracking-tight text-[#0668E1]">404</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-[var(--app-text)]">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--app-muted)]">
          The page you are looking for does not exist or may have been moved. Check the URL or return to the InfrazMind
          home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0668E1] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0668E1]/25 hover:bg-[#0556ba]"
          >
            <Home className="h-4 w-4" />
            Go to home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-semibold text-[var(--app-text)] hover:bg-[var(--app-surface-muted)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
