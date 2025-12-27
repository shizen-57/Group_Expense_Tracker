import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Scan, Search, Users, PieChart, Bell, ShieldCheck, Check, ArrowRight, Menu, X, Brain, Layers, Gauge, Globe, Radar } from 'lucide-react'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Brain,
      title: 'Autonomous Expense OS',
      description: 'AI orchestrates capture, FX normalization, and categorisation with full audit trails.',
      color: 'from-emerald-500/20 via-emerald-400/5 to-transparent',
      highlights: ['Self-healing categories', 'Smart OCR cleanup', 'Policy-aware automation']
    },
    {
      icon: Layers,
      title: 'Lightning Split Engine',
      description: 'Blend equal, weighted, smart, or income-based splits in a single swipeable flow.',
      color: 'from-purple-500/20 via-violet-500/5 to-transparent',
      highlights: ['5 split presets', 'Drag-to-adjust weights', 'Auto debt simplifier']
    },
    {
      icon: ShieldCheck,
      title: 'Bank-grade Safeguards',
      description: 'Role-aware sharing, anomaly flags, and biometric approvals keep teams confident.',
      color: 'from-blue-500/20 via-cyan-400/5 to-transparent',
      highlights: ['Granular roles', 'Anomaly detection', 'Encrypted vault storage']
    },
    {
      icon: Gauge,
      title: 'Realtime Finance Room',
      description: 'See burn, runway, and budget drift update every 15 seconds with AI commentary.',
      color: 'from-amber-500/20 via-orange-400/5 to-transparent',
      highlights: ['Scenario sandboxes', 'Multi-wallet view', 'AI insight threads']
    }
  ]

  const stats = [
    { value: '৳32M', label: 'Managed', detail: 'across 18 cities' },
    { value: '11.2h', label: 'Time saved', detail: 'per team each week' },
    { value: '340', label: 'Teams live', detail: 'with shared vaults' },
    { value: '4.8★', label: 'Trust score', detail: 'avg. satisfaction' }
  ]

  const pricingPlans = [
    {
      name: 'Free',
      price: '৳0',
      period: '/forever',
      features: [
        'Up to 100 expenses/month',
        'AI Receipt Scanning',
        'Natural Language Search',
        'Budget Alerts',
        'Group Expenses',
        'Basic Analytics'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '৳299',
      period: '/month',
      features: [
        'Unlimited expenses',
        'Advanced AI Insights',
        'Priority Support',
        'Export to Excel/PDF',
        'Custom Categories',
        'Detailed Analytics',
        'Multi-currency Support',
        'Team Collaboration'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Pro',
        'Dedicated Account Manager',
        'Custom Integrations',
        'Advanced Security',
        'SLA Guarantee',
        'Training & Onboarding',
        'White Label Option'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ]

  const testimonials = [
    {
      name: 'Aisha Rahman',
      role: 'Finance Lead, Pathao',
      text: 'ExpenseTracker keeps our campaign spend on rails and the AI nudges actually feel like a teammate.',
      image: 'https://images.unsplash.com/photo-1676385901160-ac6e71a19d91?w=400'
    },
    {
      name: 'Tanvir Hasan',
      role: 'Co-founder, AgroShift',
      text: 'We went from messy spreadsheets to one ritual board. Splits, reimbursements, everything is calmer.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
    },
    {
      name: 'Maya Chowdhury',
      role: 'Ops Manager, Shajgoj',
      text: 'Smart alerts constantly flag subtle drifts. Finance reviews in minutes, not late-night marathons.',
      image: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400'
    }
  ]

  const marqueeBrands = ['Bkash Labs', 'Pathao Finance', 'Chaldal Teams', 'Shajgoj', 'PriyoShop', 'AgroShift']

  const aiWorkflow = [
    {
      title: 'Capture everything',
      description: 'Inbox connectors, QR scans, and WhatsApp forwards collapse into one AI inbox.',
      metric: '99.2% OCR accuracy',
      icon: Scan,
      color: 'from-emerald-500/20 to-teal-500/20'
    },
    {
      title: 'Understand context',
      description: 'Large-language models enrich every line with merchant, VAT, and sentiment cues.',
      metric: '38 data points / slip',
      icon: Search,
      color: 'from-purple-500/20 to-indigo-500/20'
    },
    {
      title: 'Coach better decisions',
      description: 'Radar surfaces anomalies, suggests trims, and nudges the right teammate to act.',
      metric: '12% cost savings avg',
      icon: Radar,
      color: 'from-blue-500/20 to-cyan-400/20'
    },
    {
      title: 'Sync & celebrate',
      description: 'One-click sync pushes clean data to Supabase, Excel, and finance bots with receipts attached.',
      metric: '4 ecosystems connected',
      icon: Globe,
      color: 'from-amber-500/20 to-orange-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fffb] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-72 bg-gradient-to-b from-emerald-200/60 via-white to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-10 h-96 w-96 rounded-full bg-emerald-300/40 blur-[160px]" />

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-emerald-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_10px_40px_-12px_rgba(16,185,129,0.7)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-emerald-500/80">Expense OS</p>
                <p className="text-lg font-semibold text-gray-900">ExpenseTracker</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">Flow</a>
              <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Stories</a>
              <Button onClick={onGetStarted} className="bg-gray-900 text-white hover:bg-gray-800">
                Launch App
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-emerald-100 bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 text-sm font-medium text-gray-600">
            <a href="#features" className="py-2">Features</a>
            <a href="#how-it-works" className="py-2">Flow</a>
            <a href="#pricing" className="py-2">Pricing</a>
            <a href="#testimonials" className="py-2">Stories</a>
            <Button onClick={onGetStarted} className="bg-gray-900 text-white">
              Launch App
            </Button>
          </div>
        </div>
      )}

      <main className="relative z-10">
        <section className="pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-100 bg-white px-5 py-2 text-sm font-medium text-emerald-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
                NEW • AI Smart Splits
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] leading-tight text-gray-900">
                  Expense OS built for product-minded teams in{' '}
                  <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 bg-clip-text text-transparent">
                    Dhaka and beyond
                  </span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                  Capture, split, and forecast every Taka in seconds. ExpenseTracker watches receipts,
                  FX, and policies 24/7 so your crew can stay shipping.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800 text-base px-7"
                >
                  Launch the console
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 text-gray-700 hover:bg-white/70"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See capabilities
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-5 border-t border-emerald-100 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-11 w-11 rounded-2xl border border-white bg-gradient-to-br from-emerald-400 to-teal-400" />
                  ))}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">TRUSTED BY</p>
                  <p className="font-medium text-gray-900">340+ product squads in Bangladesh</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-[32px] bg-gray-900 text-white p-8 shadow-[0_35px_120px_-40px_rgba(15,118,110,0.9)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Realtime vault</p>
                    <p className="text-4xl font-semibold">৳128,400</p>
                  </div>
                  <span className="rounded-full bg-white/15 px-4 py-1 text-sm text-emerald-200">+18% healthier</span>
                </div>
                <div className="mt-8 space-y-4">
                  {[
                    { title: 'Studio Sprint', amount: '৳42,180', status: 'Under budget • 92%' },
                    { title: 'Ops Stack', amount: '৳31,900', status: 'Needs review • +৳4.2k' },
                    { title: 'Culture Fund', amount: '৳12,400', status: 'Auto-approved • 100%' }
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl bg-white/5 px-5 py-4 border border-white/10">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{item.title}</span>
                        <span>{item.status}</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{item.amount}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 p-5">
                  <p className="text-sm text-white/70">AI Narrative</p>
                  <p className="text-base font-medium mt-2">
                    “Shift 14% of Ops Stack meals to supplier credits to stay green.”
                  </p>
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -bottom-6 -left-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-xl"
                >
                  <p className="text-xs text-gray-500">Receipts synced</p>
                  <p className="text-2xl font-semibold">48</p>
                  <p className="text-sm text-emerald-500">+5 just now</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 0.8, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-xl"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Bell className="h-4 w-4 text-emerald-500" />
                    Smart alert
                  </div>
                  <p className="mt-2 text-base font-semibold">Culture Fund hit 100%</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-emerald-100 bg-white/80 p-6 shadow-sm"
              >
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 mt-2">{stat.label}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto rounded-3xl border border-emerald-100 bg-white/80 px-6 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-[0.4em] text-emerald-500/80">Trusted by</div>
            <div className="mt-4 flex flex-wrap items-center gap-6 text-base font-medium text-gray-500">
              {marqueeBrands.map((brand) => (
                <div key={brand} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-24">
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-500">Capabilities</p>
              <h2 className="mt-5 text-4xl font-semibold text-gray-900">
                Orchestrate every expense ritual from capture to celebration.
              </h2>
              <p className="mt-5 text-lg text-gray-600">
                Build playbooks for recurring offsites, messy group trips, and procurement sprints without ever touching spreadsheets.
              </p>
              <div className="mt-10 rounded-3xl bg-gray-900 text-white p-8 space-y-6">
                <p className="text-sm text-emerald-300">Live rooms</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-semibold">৳72,480</p>
                  <span className="text-sm text-white/60">active reimbursements</span>
                </div>
                <div className="space-y-4">
                  {[{ label: 'Receipts auto-cleaned', value: '96%' }, { label: 'Decisions automated', value: '48%' }, { label: 'Time saved weekly', value: '11h' }].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <span className="text-white/70">{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
                  >
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.highlights.map((highlight) => (
                        <span key={highlight} className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 pb-24">
          <div className="max-w-7xl mx-auto rounded-[2.5rem] border border-emerald-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-emerald-500">Flow Engine</p>
                <h2 className="mt-4 text-4xl font-semibold text-gray-900">How AI stewards every Taka.</h2>
                <p className="mt-2 text-lg text-gray-600">
                  Each stage self-documents with receipts, FX, and approvals so finance never chases context again.
                </p>
              </div>
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-white/80 w-full lg:w-auto">
                Download playbook
              </Button>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-4">
              {aiWorkflow.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-3xl border border-gray-200 bg-gradient-to-b from-white to-emerald-50/30 p-6"
                  >
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}>
                      <Icon className="h-6 w-6 text-gray-900" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-emerald-600">{step.metric}</p>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                    {index < aiWorkflow.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 h-px w-6 bg-gradient-to-r from-emerald-200 to-transparent" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-4"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm">Testimonials</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl text-gray-900 mb-4"
            >
              Loved by Thousands
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600"
            >
              See what our users have to say
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-4"
            >
              <PieChart className="w-4 h-4" />
              <span className="text-sm">Pricing Plans</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl text-gray-900 mb-4"
            >
              Choose Your Perfect Plan
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600"
            >
              Start free, upgrade when you need more
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.highlighted
                    ? 'border-emerald-500 bg-white shadow-2xl scale-105'
                    : 'border-gray-200 bg-white'
                } hover:border-emerald-400 transition-all duration-300`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onGetStarted}
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      : 'border-2 border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl text-white mb-6">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users who are already managing their expenses smarter with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">ExpenseTracker</span>
              </div>
              <p className="text-sm">
                AI-powered expense management for everyone
              </p>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2024 ExpenseTracker. All rights reserved. Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
