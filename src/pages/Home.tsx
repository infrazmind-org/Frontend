import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Video, BrainCircuit, Database, Layers, Search, ArrowRight } from 'lucide-react';
import ComingSoon from '../components/ComingSoon';

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[var(--app-bg)]">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0668E1] to-cyan-400 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0668E1]/10 border border-[#0668E1]/30 text-[#0668E1] font-medium text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0668E1] animate-pulse"></span>
            The Future of Enterprise Automation
          </div>
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-[var(--app-text)] mb-6 leading-tight tracking-tight">
            Transforming Intelligence into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0668E1] to-cyan-400">
              Operational Efficiency
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--app-muted)] mb-12 leading-relaxed max-w-3xl mx-auto">
            We architect AI-driven Voice, Video, and Workflow systems designed to drastically 
            reduce manual labor and maximize enterprise productivity.
          </p>
        </motion.div>

        <ComingSoon />
      </div>

      {/* Scaling Beyond Manual Constraints Section */}
      <section className="relative overflow-hidden border-y border-[var(--app-border)] bg-[var(--app-bg-secondary)] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-[#0668E1] text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                  PROBLEM SPACE
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--app-text)] mb-6 leading-tight">
                  Scaling Beyond <br /> Manual Constraints
                </h2>
                <p className="text-lg text-[var(--app-muted)] leading-relaxed">
                  Traditional workflows are limited by human bandwidth. We deploy digital agents that operate with 100% consistency, 24/7.
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-7 grid md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Repetitive Tasks',
                  desc: 'Automate high-volume, low-complexity workflows.',
                  icon: Database,
                },
                {
                  title: 'Linear Costs',
                  desc: 'Decouple operational growth from headcount increases.',
                  icon: Zap,
                },
                {
                  title: 'Office Hours',
                  desc: 'Ensure 24/7 availability across all global timezones.',
                  icon: ShieldCheck,
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card border border-[var(--app-border)] p-6 transition-all hover:border-[#0668E1]/30"
                >
                  <div className="w-10 h-10 bg-[#0668E1]/10 text-[#0668E1] rounded-lg flex items-center justify-center mb-6 border border-[#0668E1]/20">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-[var(--app-text)] mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--app-muted)] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Grid Background Overlay */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, var(--app-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--app-grid-line) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* Deployment Lifecycle Section */}
      <section className="relative border-b border-[var(--app-border)] bg-[var(--app-bg-secondary)] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-[#0668E1] text-[10px] font-bold tracking-[0.4em] uppercase mb-4">
                METHODOLOGY
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--app-text)] mb-4">
                Deployment Lifecycle
              </h2>
            </motion.div>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] md:grid-cols-4">
            {[
              { num: '01', title: 'Audit', desc: 'Identifying friction points in current workflows.' },
              { num: '02', title: 'Design', desc: 'Architecting custom voice and workflow models.' },
              { num: '03', title: 'Deploy', desc: 'Seamless integration into existing tech stacks.' },
              { num: '04', title: 'Optimize', desc: 'Continuous performance tuning and oversight.' }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 ${idx !== 3 ? 'border-b border-[var(--app-border)] md:border-b-0 md:border-r' : ''} transition-colors hover:bg-[var(--app-surface)]`}
              >
                <div className="text-[#0668E1] font-mono text-sm font-bold mb-6">
                  [{step.num}]
                </div>
                <h3 className="text-xl font-display font-bold text-[var(--app-text)] mb-4">{step.title}</h3>
                <p className="text-sm text-[var(--app-muted)] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Grid Background Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, var(--app-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--app-grid-line) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* Strategic Solutions Placeholder */}
      <div className="relative z-10 border-t border-[var(--app-border)] bg-[var(--app-surface-muted)] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--app-text)] mb-4">Strategic Solutions</h2>
            <p className="text-lg md:text-xl text-[var(--app-muted)]">Purpose-built AI architectures for modern needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: Search, title: "KYC Search" },
              { icon: Zap, title: "AI Voice Agents" },
              { icon: Layers, title: "Hybrid Content Services" },
              { icon: Database, title: "Data Analysis" },
              { icon: BrainCircuit, title: "Custom AI Agents" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 text-center hover:border-[#0668E1]/50 transition-all flex flex-col h-full group"
              >
                <div className="w-12 h-12 bg-[#0668E1]/10 rounded-xl flex items-center justify-center mb-6 text-[#0668E1] mx-auto border border-[#0668E1]/20 group-hover:bg-[#0668E1]/20 transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-display font-semibold text-[var(--app-text)] mb-4">{feature.title}</h4>
                <div className="mt-auto space-y-4">
                  <p className="text-[#0668E1] font-semibold text-[10px] tracking-widest uppercase">Launching Soon</p>
                  <Link 
                    to="/contact"
                    className="group/link flex items-center justify-center gap-2 text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)] text-[10px] font-bold uppercase tracking-widest"
                  >
                    Early Access
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Contact CTA Section */}
      <section className="relative z-10 border-t border-[var(--app-border)] bg-[var(--app-bg)] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-20 text-center relative overflow-hidden group"
          >
            {/* Decorative background element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0668E1]/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-[var(--app-text)] mb-8 tracking-tight">
                Ready to <span className="text-[#0668E1]">Automate</span>?
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-[var(--app-muted)]">
                Join the next generation of enterprise intelligence. Let's discuss how we can transform your unique workflows.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-[#0668E1] hover:bg-[#0556ba] text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_40px_rgba(6,104,225,0.3)] hover:shadow-[0_0_60px_rgba(6,104,225,0.5)] group/btn"
              >
                Contact Us
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}



