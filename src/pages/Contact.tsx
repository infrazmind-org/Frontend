import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Header Section */}
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-[var(--app-text)] md:text-5xl">
            Get in Touch
          </h1>
          <p className="text-xl text-[var(--app-muted)]">
            Let's discuss how we can automate your unique workflows.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 md:p-12"
        >
          <h2 className="mb-10 text-center font-display text-xl font-bold tracking-wider text-[var(--app-text)]">
            CONTACT INFRAZMIND
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                label: 'EMAIL US',
                value: 'contact@infrazmind.com'
              },
              {
                icon: MapPin,
                label: 'LOCATION',
                value: 'Global Operations'
              },
              {
                icon: MessageSquare,
                label: 'SUPPORT',
                value: '24/7 Support'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 bg-[#0668E1]/10 rounded-xl flex items-center justify-center text-[#0668E1] border border-[#0668E1]/20 mb-4 transition-all group-hover:bg-[#0668E1]/20">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-muted)]">{item.label}</p>
                <p className="text-sm font-bold leading-tight text-[var(--app-text)]">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 border-l-4 border-l-[#0668E1]/50 text-center"
        >
          <p className="mb-6 text-lg italic leading-relaxed text-[var(--app-text-secondary)]">
            "Our technology is designed not to replace the creative human element, but to liberate it from the burden of repetitive execution."
          </p>
          <div className="flex items-center justify-center gap-2 text-[#0668E1] text-[10px] font-bold tracking-[0.2em]">
            <div className="w-6 h-px bg-[#0668E1]"></div>
            InfraZMind
          </div>
        </motion.div>
      </div>
    </div>
  );
}
