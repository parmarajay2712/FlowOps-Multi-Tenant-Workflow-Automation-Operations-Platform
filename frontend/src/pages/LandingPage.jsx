import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Zap, Shield, Server, Activity, 
  Globe, Lock, BarChart3, Workflow, GitBranch,
  CheckCircle, ChevronRight, Sparkles, Code2, 
  Layers, Database, Clock
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-gray-100 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] animate-orb-1" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[100px] animate-orb-2" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] rounded-full bg-fuchsia-500/6 blur-[80px] animate-orb-3" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="glass-card-strong rounded-2xl px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                FlowOps
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">How it works</a>
              <a href="#stats" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Stats</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors duration-200"
              >
                Log in
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-semibold px-5 py-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center space-x-2 glass-card rounded-full px-4 py-1.5 mb-8">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-medium text-gray-300">Production-grade workflow automation</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={fadeInUp} custom={1}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Automate your{' '}
              <span className="shimmer-text">operations</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp} custom={2}
              className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              FlowOps is a multi-tenant workflow automation platform engineered for production SaaS. 
              Connect APIs, evaluate complex conditions, and trigger actions reliably.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeInUp} custom={3} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl gradient-primary text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a 
                href="#features" 
                className="inline-flex items-center px-8 py-4 text-base font-medium rounded-xl glass-card text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                <Code2 className="mr-2 w-5 h-5" />
                View Features
              </a>
            </motion.div>

            {/* Trusted By */}
            <motion.div variants={fadeInUp} custom={4} className="mt-16 flex flex-col items-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-6">Trusted by engineering teams worldwide</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                {['Acme Corp', 'NovaTech', 'CloudSync', 'DataFlow', 'Streamline'].map((company) => (
                  <span key={company} className="text-sm font-semibold text-gray-400 tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {company}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            {/* Glow behind preview */}
            <div className="absolute inset-0 gradient-primary rounded-2xl blur-[60px] opacity-15 scale-95" />
            
            {/* Fade overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            
            <div className="relative glass-card-strong rounded-2xl p-1.5 glow-violet">
              {/* Browser dots */}
              <div className="flex items-center px-4 py-3 border-b border-white/[0.04]">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="glass-card rounded-lg px-4 py-1">
                    <span className="text-[10px] text-gray-500 font-mono">app.flowops.io/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard mockup content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Sidebar mock */}
                <div className="col-span-1 space-y-3">
                  <div className="h-6 bg-white/[0.04] rounded-md w-3/4" />
                  <div className="space-y-2">
                    <div className="h-8 bg-violet-500/10 rounded-lg border border-violet-500/20" />
                    <div className="h-8 bg-white/[0.02] rounded-lg" />
                    <div className="h-8 bg-white/[0.02] rounded-lg" />
                    <div className="h-8 bg-white/[0.02] rounded-lg" />
                  </div>
                </div>
                {/* Main content mock */}
                <div className="col-span-3 space-y-4">
                  <div className="flex gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-20 rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
                        <div className="w-6 h-6 rounded-lg bg-violet-500/15 mb-2" />
                        <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                  <div className="h-40 rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                    <div className="h-3 bg-white/[0.04] rounded w-1/4 mb-4" />
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(139,92,246,0.3), rgba(6,182,212,0.1))` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES BENTO GRID ===== */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={stagger} className="text-center mb-16"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">
              Features
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Everything you need to{' '}
              <span className="gradient-text">automate</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
              Built for production. Designed for scale. Engineered for reliability.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Large Card 1 */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] group-hover:bg-violet-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20">
                    <Workflow className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Visual Workflow Builder</h3>
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    Design complex automation workflows with our intuitive drag-and-drop canvas. 
                    Connect triggers, conditions, and actions visually — no code required for basic flows.
                  </p>
                  <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><GitBranch className="w-4 h-4 text-violet-400" /> Conditional logic</span>
                    <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-400" /> Parallel execution</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small Card */}
            <motion.div variants={fadeInUp} className="group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-[60px] group-hover:bg-cyan-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                    <Server className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Idempotent Webhooks</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Redis-backed deduplication guarantees exactly-once execution per event, preventing costly duplicates.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Small Card */}
            <motion.div variants={fadeInUp} className="group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] group-hover:bg-emerald-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Strict Multi-Tenancy</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Role-based access control and organizational isolation baked into every database query.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Large Card 2 */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px] group-hover:bg-fuchsia-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-5">
                    <Activity className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Detailed Audit Logs & Observability</h3>
                  <p className="text-gray-400 leading-relaxed max-w-lg">
                    Complete transparency into every workflow execution, failure, and retry. 
                    Full timeline views, payload inspection, and performance metrics — never lose track of system state.
                  </p>
                  <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-fuchsia-400" /> Real-time metrics</span>
                    <span className="flex items-center gap-2"><Database className="w-4 h-4 text-pink-400" /> Payload logging</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bottom row */}
            <motion.div variants={fadeInUp} className="group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px] group-hover:bg-amber-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                    <Globe className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">API-First Design</h3>
                  <p className="text-gray-400 leading-relaxed">
                    RESTful API with OpenAPI docs. Import, export, and manage workflows programmatically.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[60px] group-hover:bg-rose-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                    <Lock className="w-6 h-6 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Enterprise Security</h3>
                  <p className="text-gray-400 leading-relaxed">
                    JWT authentication, rate limiting, input validation, and helmet-grade HTTP security headers.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group">
              <div className="glass-card rounded-2xl p-8 h-full hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-[60px] group-hover:bg-sky-500/10 transition-all duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-5">
                    <Clock className="w-6 h-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Smart Retries</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Automatic retry with exponential backoff. Failed steps are tracked and recoverable.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={stagger} className="text-center mb-20"
          >
            <motion.p variants={fadeInUp} className="text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4">How it works</motion.p>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Three steps to <span className="gradient-text">automation</span>
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connector lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px bg-gradient-to-r from-violet-500/30 via-cyan-500/30 to-fuchsia-500/30" />

            {[
              { step: '01', title: 'Define Your Trigger', desc: 'Set up a webhook endpoint or schedule. FlowOps listens for your events 24/7.', icon: Zap, color: 'violet' },
              { step: '02', title: 'Build Your Logic', desc: 'Add conditions, transformations, and action steps with the visual builder.', icon: GitBranch, color: 'cyan' },
              { step: '03', title: 'Deploy & Monitor', desc: 'Activate your workflow and watch executions in real-time with full observability.', icon: Activity, color: 'fuchsia' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i} className="relative text-center">
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mb-6 relative z-10`}
                  style={{ background: `rgba(${item.color === 'violet' ? '139,92,246' : item.color === 'cyan' ? '6,182,212' : '217,70,239'},0.1)`, borderColor: `rgba(${item.color === 'violet' ? '139,92,246' : item.color === 'cyan' ? '6,182,212' : '217,70,239'},0.2)` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color === 'violet' ? '#a78bfa' : item.color === 'cyan' ? '#22d3ee' : '#e879f9' }} />
                </div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest block mb-2">Step {item.step}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section id="stats" className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="glass-card-strong rounded-3xl p-12 md:p-16 glow-violet"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { value: '99.9%', label: 'Uptime SLA' },
                { value: '10M+', label: 'Events processed' },
                { value: '500+', label: 'Teams worldwide' },
                { value: '<50ms', label: 'Avg. latency' },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeInUp} custom={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ready to <span className="shimmer-text">automate</span>?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
              Join hundreds of engineering teams already using FlowOps to power their mission-critical workflows.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/register" 
                className="group inline-flex items-center px-8 py-4 text-base font-semibold rounded-xl gradient-primary text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300"
              >
                Start Building Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center px-8 py-4 text-base font-medium rounded-xl glass-card text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                Sign in to your account
                <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FlowOps</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Multi-tenant workflow automation for modern SaaS.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Developers</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} FlowOps. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
