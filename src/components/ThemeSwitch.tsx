import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/** Compact light/dark toggle for the dashboard header. */
export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex h-9 w-[3.25rem] shrink-0 items-center rounded-full border border-[var(--app-border)] p-0.5 transition ${
        isDark ? 'bg-[#0668E1]/25' : 'bg-[var(--app-surface-muted)]'
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-[var(--app-surface)] shadow-sm transition-transform ${
          isDark ? 'translate-x-[1.35rem]' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5 text-[#0668E1]" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
      </span>
    </button>
  );
}
