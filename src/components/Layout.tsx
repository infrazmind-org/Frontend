import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const showLoginNavCta = location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--app-bg)] font-sans text-[var(--app-muted)] selection:bg-[#0668E1]/30">
      <nav className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-nav)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center" onClick={closeMenu}>
                <Logo className="h-8 w-auto" />
              </Link>
              <div className="hidden space-x-6 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-[var(--app-text)] ${
                      location.pathname === link.path ? 'text-[var(--app-text)]' : 'text-[var(--app-muted)]'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {showLoginNavCta && (
                <div className="hidden md:flex">
                  <Link
                    to="/login"
                    className="rounded-xl bg-[#0668E1] px-6 py-2 text-sm font-semibold tracking-tight text-white shadow-lg shadow-[#0668E1]/20 transition-all hover:bg-[#0556ba]"
                  >
                    Login
                  </Link>
                </div>
              )}

              <button
                onClick={toggleMenu}
                className="p-2 text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)] md:hidden"
                aria-label="Toggle menu"
                type="button"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xs flex-col border-l border-[var(--app-border)] bg-[var(--app-bg)] p-6 md:hidden"
            >
              <div className="mb-12 flex items-center justify-between">
                <Logo className="h-8 w-auto" />
                <button
                  onClick={closeMenu}
                  className="p-2 text-[var(--app-muted)] hover:text-[var(--app-text)]"
                  type="button"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-12 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMenu}
                    className={`flex items-center justify-between rounded-xl p-4 transition-all ${
                      location.pathname === link.path
                        ? 'border border-[#0668E1]/25 bg-[#0668E1]/10 text-[var(--app-text)]'
                        : 'text-[var(--app-muted)] hover:bg-[var(--app-surface-muted)]'
                    }`}
                  >
                    <span className="text-lg font-medium">{link.name}</span>
                    <ChevronRight
                      className={`h-5 w-5 ${location.pathname === link.path ? 'text-[#0668E1]' : 'text-[var(--app-muted)]'}`}
                    />
                  </Link>
                ))}
              </div>

              {showLoginNavCta && (
                <div className="mt-auto space-y-4">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block w-full rounded-xl bg-[#0668E1] py-4 text-center font-bold tracking-tight text-white shadow-lg shadow-[#0668E1]/20 transition-all hover:bg-[#0556ba]"
                  >
                    Login
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-[var(--app-border)] bg-[var(--app-footer)] py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[var(--app-muted)]">
          <p>© {new Date().getFullYear()} InfrazMind AI Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
