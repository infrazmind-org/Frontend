import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Video,
  PenTool,
  Share2,
  UserCheck,
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
  CheckCircle,
  MonitorPlay,
} from 'lucide-react';

export default function HybridContent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-muted)]">
      <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[800px] -translate-x-1/2 opacity-20 dark:opacity-15">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-[#0668E1] blur-[140px] mix-blend-screen" />
      </div>
      <div className="pointer-events-none absolute top-2/3 right-1/4 h-[300px] w-[600px] translate-x-1/2 opacity-15 dark:opacity-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-[#0668E1] blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#0668E1] transition-colors hover:text-[var(--app-text)]"
          >
            ← Back to Services
          </Link>
        </div>

        <div className="mx-auto mb-20 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0668E1]/30 bg-[#0668E1]/10 px-4 py-2 text-sm font-medium text-[#0668E1]"
          >
            <Sparkles className="h-4 w-4 text-[#0668E1]" />
            Launched
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-[var(--app-text)] md:text-6xl"
          >
            Hybrid Content <br />
            <span className="bg-gradient-to-r from-[#0668E1] via-cyan-500 to-violet-500 bg-clip-text text-transparent">
              Services
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-3xl text-lg leading-relaxed text-[var(--app-muted)] md:text-xl"
          >
            Merging state-of-the-art AI video generation with elite human creativity. We create, manage, and scale
            your organic content pipeline for hyper-exponential growth on Short-form &amp; Long-form channels.
          </motion.p>
        </div>

        <div className="mb-24 grid items-center gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#0668E1]">THE PERFECT SYNERGY</div>
            <h2 className="font-display text-3xl font-bold leading-tight text-[var(--app-text)] md:text-4xl">
              Human Creativity Meets AI Production Speed
            </h2>
            <p className="leading-relaxed text-[var(--app-muted)]">
              Why choose between pure AI generation (which feels flat and uninspired) and standard agency creation
              (which is slow, hard to scale, and terribly expensive)?
            </p>
            <p className="leading-relaxed text-[var(--app-muted)]">
              InfraZMind blends the absolute best of both worlds. We deploy predictive AI algorithms to find viral
              patterns, generate rapid visual drafts, and automate tedious processes, then hand the elements to seasoned
              human storytellers, editors, and copywriters to polish the soul.
            </p>
            <div className="space-y-3 pt-4">
              {[
                'Instant scaling: From 1 video a week to 5 per day seamlessly.',
                'Viral mechanics: Hook generation powered by data, refined for raw emotion.',
                'Omnichannel reach: Tailored formatting for Reels, Shorts, TikTok, and LinkedIn.',
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-cyan-500" />
                  <span className="font-medium text-[var(--app-text-secondary)]">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card group relative overflow-hidden rounded-3xl border-[#0668E1]/30 p-8"
          >
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl transition-transform duration-700 group-hover:scale-110" />
            <div className="relative z-10 space-y-6">
              <h3 className="mb-6 border-b border-[var(--app-border)] pb-2 font-display text-xl font-bold uppercase tracking-wider text-[var(--app-text)]">
                The Infrastructure Pipeline
              </h3>
              {[
                {
                  icon: PenTool,
                  color: 'text-[#0668E1]',
                  bg: 'bg-[#0668E1]/15',
                  title: '01. Human Written Creative Scripts',
                  desc: 'Bespoke scripts written 100% by human storytellers for authentic emotional connection & high-pacing retention.',
                },
                {
                  icon: MonitorPlay,
                  color: 'text-violet-600 dark:text-violet-400',
                  bg: 'bg-violet-500/15',
                  title: '02. Generative Visual Drafts',
                  desc: 'Fast-synthesized base footage & AI-rendered high-quality overlays.',
                },
                {
                  icon: Sparkles,
                  color: 'text-cyan-600 dark:text-cyan-400',
                  bg: 'bg-cyan-500/15',
                  title: '03. Human Creative Mastery',
                  desc: 'Story-pacing, bespoke color grading, premium typography, & sound design.',
                },
                {
                  icon: Share2,
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-500/15',
                  title: '04. Omnichannel Distribution',
                  desc: 'Automated publishing & optimized scheduling across all global channels.',
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="flex items-center gap-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-4"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${step.bg} ${step.color}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold uppercase tracking-wide ${step.color}`}>{step.title}</h4>
                    <p className="mt-0.5 text-xs text-[var(--app-muted)]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mb-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-[var(--app-text)] md:text-4xl">
              Core Components Of Our Service
            </h2>
            <p className="mx-auto max-w-xl text-[var(--app-muted)]">
              We cover your entire workflow from a blank page to thousands of active followers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Share2,
                iconClass: 'text-[#0668E1]',
                bgClass: 'bg-[#0668E1]/15 group-hover:bg-[#0668E1]/25',
                title: 'Social Media Service',
                desc: 'Total optimization for modern mobile viewing. We build organic marketing funnels on Instagram Reels, TikTok, YouTube Shorts, and X that capture high-intent visual audience attention.',
                tags: [
                  { icon: Instagram, label: 'Instagram Reels', iconClass: 'text-pink-500' },
                  { icon: Youtube, label: 'YouTube Shorts', iconClass: 'text-red-600' },
                  { icon: Twitter, label: 'X Broadcasts', iconClass: 'text-sky-500' },
                ],
                bullets: ['Audience Retention Frameworks', 'High-Frequency Organic Ingestion', 'Viral Loop Structuring'],
              },
              {
                icon: Video,
                iconClass: 'text-cyan-600 dark:text-cyan-400',
                bgClass: 'bg-cyan-500/15 group-hover:bg-cyan-500/25',
                title: 'Premium Video Editing',
                desc: 'Elite level agency-grade editors. We strip bloated fluff, design highly dynamic kinetic text layouts, add meticulous sound design (SFX), and adjust pacing to maximize audience visual attention.',
                tagLabels: ['Kinetic Captions', 'Immersive SFX', 'Bespoke Color Grading'],
                bullets: [
                  'Strict Attention to Hook Timelines (First 3s)',
                  'Retention-Enhancing Soundscapes',
                  'High-End Transition Optimization',
                ],
              },
              {
                icon: UserCheck,
                iconClass: 'text-emerald-600 dark:text-emerald-400',
                bgClass: 'bg-emerald-500/15 group-hover:bg-emerald-500/25',
                title: 'Page Handling & Growth Ops',
                desc: 'Completely hands-off operations. We write metadata, perform title splits, configure descriptions and links, execute scheduled uploads, and automatically seed engaging initial comments to drive discussion.',
                tagLabels: ['Automatic Scheduling', 'Optimized Metadata', 'Community Seeding'],
                bullets: ['Safe Multi-profile Administration', 'Continuous Metric Auditing', 'Automated CTA Redirection'],
              },
              {
                icon: PenTool,
                iconClass: 'text-violet-600 dark:text-violet-400',
                bgClass: 'bg-violet-500/15 group-hover:bg-violet-500/25',
                title: 'Human Creative Writing & Scripts',
                desc: 'No generic ChatGPT output. Our expert human storytellers formulate custom, highly persuasive outlines and scripts from raw ideas or long-form video archives, specifically adapted for high organic attention.',
                tagLabels: ['100% Human-Written', 'Psychological Hooks', 'Brand Voice Cohesion'],
                bullets: ['Authentic Creative Angles', 'High-Retention Conversational Pacing', 'Direct-Response Outlining'],
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group flex flex-col justify-between rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-8 transition-all hover:border-[#0668E1]/30 hover:bg-[var(--app-surface)]"
              >
                <div>
                  <div
                    className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${card.bgClass} ${card.iconClass} transition-all duration-300`}
                  >
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-bold text-[var(--app-text)]">{card.title}</h3>
                  <p className="mb-6 leading-relaxed text-[var(--app-muted)]">{card.desc}</p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {'tags' in card && card.tags
                      ? card.tags.map((t) => (
                          <span
                            key={t.label}
                            className="flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1 text-xs text-[var(--app-text-secondary)]"
                          >
                            <t.icon className={`h-3.5 w-3.5 ${t.iconClass}`} />
                            {t.label}
                          </span>
                        ))
                      : card.tagLabels?.map((label) => (
                          <span
                            key={label}
                            className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-1 text-xs text-[var(--app-text-secondary)]"
                          >
                            {label}
                          </span>
                        ))}
                  </div>
                </div>
                <ul className="space-y-2 border-t border-[var(--app-border)] pt-4 text-sm text-[var(--app-muted)]">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      ✔ {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative mb-24 overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-bg-secondary)] p-8 md:p-12">
          <div className="pointer-events-none absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#0668E1]/15 to-transparent blur-[120px]" />
          <div className="relative z-10 grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0668E1]">AVERAGE ENGAGEMENT RATE</div>
              <div className="font-display text-4xl font-extrabold text-[var(--app-text)] md:text-5xl">4.2x</div>
              <p className="text-sm text-[var(--app-muted)]">Higher benchmark compared to standard template agency creators.</p>
            </div>
            <div className="space-y-2 border-y border-[var(--app-border)] py-6 md:border-x md:border-y-0 md:px-8 md:py-0">
              <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                IDEATION TO EXPORT TIME
              </div>
              <div className="font-display text-4xl font-extrabold text-[var(--app-text)] md:text-5xl">&lt; 12 Hours</div>
              <p className="text-sm text-[var(--app-muted)]">Surgical drafting pipeline allows unparalleled newsjacking execution speed.</p>
            </div>
            <div className="space-y-2 md:pl-8">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                ORGANIC IMPRESSIONS GUARANTEE
              </div>
              <div className="font-display text-4xl font-extrabold text-[var(--app-text)] md:text-5xl">100%</div>
              <p className="text-sm text-[var(--app-muted)]">
                Every single piece of media is fully verified against active shadowban algorithms.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden rounded-3xl border-[#0668E1]/30 p-12 text-center md:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, var(--app-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--app-grid-line) 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--app-text)] md:text-4xl">
              Ready to Dominate the Feed?
            </h2>
            <p className="leading-relaxed text-[var(--app-muted)]">
              Don&apos;t let your competition scale their volume while your pipeline lags. Let InfraZMind engineer, edit,
              and publish your content pipeline with precision.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#0668E1] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(6,104,225,0.35)] transition-all hover:bg-[#0556ba]"
              >
                Get in touch
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
