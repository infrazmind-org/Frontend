import React from 'react';
import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
}

export default function ComingSoon({ 
  title = "Coming Soon", 
  subtitle = "We're preparing the launch." 
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-[#0668E1]/20 rounded-3xl flex items-center justify-center mb-8 text-[#0668E1]"
      >
        <Rocket className="w-10 h-10 animate-pulse" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 font-display text-3xl font-bold tracking-tight text-[var(--app-text)] md:text-5xl"
      >
        {title}
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-medium text-[var(--app-muted)]"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
