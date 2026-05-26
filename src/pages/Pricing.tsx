import React from 'react';
import { motion } from 'motion/react';

export default function Pricing() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center bg-[var(--app-bg)] p-4">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0668E1] to-transparent blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h1 className="text-5xl font-display font-bold leading-none tracking-tight text-[var(--app-text)] md:text-7xl">
            Launching <br /> Soon
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl font-bold uppercase tracking-[0.2em] text-[var(--app-muted)] md:text-2xl">
              OUR PREMIUM INTELLIGENCE PACKAGES <br className="hidden md:block" /> ARE BEING FINALIZED.
            </p>
            
            <div className="w-24 h-1 bg-[#0668E1]/50 mx-auto rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

