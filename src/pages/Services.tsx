import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, Zap, BrainCircuit, Code, Layers, ArrowRight } from 'lucide-react';

type ServiceCard = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  pointers: string[];
  ctaLabel: string;
  ctaTo: string;
};

const SERVICES: ServiceCard[] = [
  {
    icon: Search,
    title: 'KYC Search',
    desc: 'The ultimate platform for loan recovery and collections teams. Search a person using a single identifier and fetch a consolidated profile instantly.',
    pointers: ['Single Identifier Search', 'Secure & Compliant', 'Real-time Data Aggregation', 'Consolidated Risk Profiles'],
    ctaLabel: 'Contact Us for Registration',
    ctaTo: '/access-registration',
  },
  {
    icon: Zap,
    title: 'AI Voice Agents',
    desc: 'Implement high-fidelity, human-like voice interaction to manage communication at scale.',
    pointers: ['Low-latency Response', 'Multi-lingual Support', 'Natural Language Understanding', 'Custom Voice Cloning'],
    ctaLabel: 'Learn more',
    ctaTo: '/contact',
  },
  {
    icon: BrainCircuit,
    title: 'Custom AI Agents',
    desc: 'Advanced autonomous agents engineered to handle complex, multi-step enterprise logic tailored to your specific requirements.',
    pointers: ['Requirement-Driven Logic', 'Autonomous Decision Making', 'Cross-Platform Integration', 'Self-Optimizing Workflows'],
    ctaLabel: 'Learn more',
    ctaTo: '/contact',
  },
  {
    icon: Code,
    title: 'Full stack web Development',
    desc: 'Building high-performance, scalable web applications with modern tech stacks.',
    pointers: ['Modern Tech Stack', 'Scalable Architecture', 'API-First Design', 'Cloud-Native Deployment'],
    ctaLabel: 'Learn more',
    ctaTo: '/contact',
  },
  {
    icon: Layers,
    title: 'Hybrid Content Services',
    desc: 'Merging AI-generated content with human creativity for maximum impact across short-form and long-form channels.',
    pointers: ['AI-Enhanced Copywriting', 'Dynamic Visual Assets', 'Strategic Content Planning', 'Omnichannel Distribution'],
    ctaLabel: 'View service',
    ctaTo: '/services/hybrid-content',
  },
];

export default function Services() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-[var(--app-text)] md:text-5xl">Our Services</h1>
        <p className="mx-auto max-w-2xl text-xl text-[var(--app-muted)]">Purpose-built AI architectures for modern needs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {SERVICES.map((service, idx) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="group flex h-full flex-col rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-8 transition-all hover:border-[#0668E1]/30 hover:bg-[var(--app-surface)]"
          >
            <div className="mb-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-bg)] text-[var(--app-text)] transition-colors group-hover:bg-[#0668E1]/20 group-hover:text-[#0668E1]">
              <service.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="mb-4 font-display text-2xl font-bold text-[var(--app-text)]">{service.title}</h3>
              <p className="mb-6 leading-relaxed text-[var(--app-muted)]">{service.desc}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {service.pointers.map((pointer) => (
                  <li key={pointer} className="flex items-center gap-2 text-sm text-[var(--app-text-secondary)]">
                    <span className="text-[#0668E1] shrink-0">✓</span>
                    {pointer}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto flex items-center justify-end border-t border-[var(--app-border)] pt-6">
              <Link
                to={service.ctaTo}
                className="group/link flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]"
              >
                {service.ctaLabel}
                <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
