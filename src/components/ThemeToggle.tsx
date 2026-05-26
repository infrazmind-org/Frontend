import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] shadow-sm transition hover:border-[#0668E1]/40"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-300" />}
      <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
    </button>
  );
}
