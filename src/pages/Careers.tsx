import React from 'react';
import { motion } from 'motion/react';
import { Mail, Briefcase, Sparkles } from 'lucide-react';

export default function Careers() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0668E1]/10 border border-[#0668E1]/30 text-[#0668E1] font-medium text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Join the Revolution
          </div>
          
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--app-text)] md:text-6xl">
            Build the Future <br />
            <span className="text-[#0668E1]">With Us</span>
          </h1>
          
          <p className="text-xl leading-relaxed text-[var(--app-muted)]">
            If you're an AI enthusiast and you believe you can be a good fit for our mission to automate enterprise intelligence, we want to hear from you.
          </p>

          <div className="glass-card p-12 mt-12 border-t-4 border-t-[#0668E1]">
            <Briefcase className="w-12 h-12 text-[#0668E1] mx-auto mb-6" />
            <h2 className="mb-4 font-display text-2xl uppercase text-[var(--app-text)]">Open Application</h2>
            <p className="mb-8 text-[var(--app-muted)]">
              Share your resume along with your portfolio at:
            </p>
            <a 
              href="mailto:contact@infrazmind.com" 
              className="break-all text-2xl font-bold text-[var(--app-text)] transition-colors hover:text-[#0668E1] md:text-3xl"
            >
              contact@infrazmind.com
            </a>
          </div>

          <div className="pt-12">
            <div className="flex items-center justify-center gap-2 text-[#0668E1] text-[10px] font-bold tracking-[0.2em] uppercase">
              <div className="w-12 h-px bg-[#0668E1]"></div>
              Remote First • Global Talent • AI Driven
              <div className="w-12 h-px bg-[#0668E1]"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
