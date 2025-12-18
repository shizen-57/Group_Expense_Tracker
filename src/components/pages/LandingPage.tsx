import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Scan, Search, TrendingUp, Users, PieChart, Bell, Shield, Zap, Check, ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { ImageWithFallback } from '../figma/ImageWithFallback'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Scan,
      title: 'AI Receipt Scanning',
      description: 'Snap a photo of your receipt and let AI extract all the details automatically',
      color: 'from-emerald-400 to-teal-400'
    },
    {
      icon: Search,
      title: 'Natural Language Search',
      description: 'Find expenses using plain English like "coffee last week" or "shopping this month"',
      color: 'from-purple-400 to-violet-400'
    },
    {
      icon: Bell,
      title: 'Smart Budget Alerts',
      description: 'Get intelligent notifications when you\'re close to exceeding your budget limits',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Visualize spending patterns with beautiful charts and trend analysis',
      color: 'from-pink-400 to-rose-400'
    },
    {
      icon: Users,
      title: 'Group Expenses',
      description: 'Split bills with friends using 5 different methods including smart AI-powered splits',
      color: 'from-orange-400 to-amber-400'
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get personalized spending insights and recommendations powered by AI',
      color: 'from-indigo-400 to-purple-400'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '৳50M+', label: 'Tracked Expenses' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ]

  const testimonials = [
    {
      name: 'Sakib Rahman',
      role: 'Software Engineer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      text: 'The AI receipt scanning is a game-changer! I can track all my expenses in seconds.'
    },
    {
      name: 'Tasnuva Ahmed',
      role: 'Business Owner',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      text: 'Group expense splitting has made managing team lunches so much easier. Love the smart split feature!'
    },
    {
      name: 'Rafi Hossain',
      role: 'Student',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      text: 'Natural language search is incredibly intuitive. I can find any expense just by describing it.'
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/80 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-gray-900">ExpenseTracker</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors">Testimonials</a>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600">
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-emerald-100">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2">How It Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2">Testimonials</a>
                <Button onClick={onGetStarted} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white mx-4">
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI-Powered Expense Management</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl text-gray-900">
                Track Expenses{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Smarter
                </span>
                , Not Harder
              </h1>
              
              <p className="text-xl text-gray-600">
                Manage your personal and group expenses with AI-powered receipt scanning, 
                natural language search, and intelligent budget alerts. All in Bangladeshi Taka (৳).
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 text-lg px-8"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-lg px-8"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Bank-level Security</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">Free Forever Plan</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1764231467896-73f0ef4438aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHBlbnNlJTIwdHJhY2tpbmclMjBtb2JpbGUlMjBhcHB8ZW58MXx8fHwxNzY2MDU4MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Expense Tracking App"
                  className="w-full h-auto"
                />
                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 backdrop-blur-[2px]"></div>
              </div>
              
              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 p-4 rounded-xl bg-white/90 backdrop-blur-lg shadow-xl border border-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Receipt Scanned</div>
                    <div className="text-gray-900">৳1,250</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -top-6 -right-6 p-4 rounded-xl bg-white/90 backdrop-blur-lg shadow-xl border border-purple-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Saved This Month</div>
                    <div className="text-gray-900">৳5,420</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Powerful Features</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl text-gray-900 mb-4"
            >
              Everything You Need to Manage Money
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Packed with AI-powered features to make expense tracking effortless and intelligent
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-4"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Simple Process</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl text-gray-900 mb-4"
            >
              Get Started in 3 Easy Steps
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up Free',
                description: 'Create your account in seconds. No credit card required.',
                icon: Users,
                image: 'https://images.unsplash.com/photo-1650821414390-276561abd95a?w=400'
              },
              {
                step: '02',
                title: 'Scan & Track',
                description: 'Use AI to scan receipts or manually add expenses. Set budgets and categories.',
                icon: Scan,
                image: 'https://images.unsplash.com/photo-1744986014553-e5e866de814b?w=400'
              },
              {
                step: '03',
                title: 'Analyze & Save',
                description: 'Get AI insights on spending patterns and smart recommendations to save money.',
                icon: TrendingUp,
                image: 'https://images.unsplash.com/photo-1759752394755-1241472b589d?w=400'
              }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200">
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="absolute bottom-4 left-4 text-6xl text-white/20">{step.step}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 z-10"></div>
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
