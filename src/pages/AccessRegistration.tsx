import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { apiFetch, formatFastApiDetail } from '../lib/api';

export default function AccessRegistration() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (message.trim().length < 10) {
      setError('Please describe your request in at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/api/public/access-inquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatFastApiDetail(data));
        return;
      }
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSuccess(
        typeof data.message === 'string'
          ? data.message
          : 'Thank you. Our team will reach out to you shortly.'
      );
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Link
        to="/services"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#0668E1] hover:text-[var(--app-text)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--app-text)] mb-4">
          Contact Us for Registration
        </h1>
        <p className="text-lg text-[var(--app-muted)] max-w-xl mx-auto">
          For access, please connect with us.
        </p>
        <p className="mt-3 text-sm text-[var(--app-muted)]">
          Share your details and we will get back to you about KYC Search platform access.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={(e) => void submit(e)}
        className="glass-card space-y-5 p-6 md:p-10"
      >
        <div>
          <label htmlFor="access-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Full name
          </label>
          <input
            id="access-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="access-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Email
          </label>
          <input
            id="access-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="access-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Contact number
          </label>
          <input
            id="access-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            placeholder="10-digit mobile"
          />
        </div>
        <div>
          <label htmlFor="access-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
            Your message
          </label>
          <textarea
            id="access-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-[var(--app-text)]"
            placeholder="Tell us about your use case and team size…"
          />
        </div>

        {error && <p className="app-alert-error text-sm">{error}</p>}
        {success && <p className="app-alert-success text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0668E1] py-3.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#0556ba] disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send request'}
          <Send className="h-4 w-4" />
        </button>
      </motion.form>
    </div>
  );
}
