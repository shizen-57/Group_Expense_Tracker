import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Settings,
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  Lightbulb,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Info
} from 'lucide-react'

interface AIInsightsPageProps {
  onGetAIInsights: () => Promise<any>
}

export function AIInsightsPage({ onGetAIInsights }: AIInsightsPageProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  const [timeFilter, setTimeFilter] = useState<'month' | 'quarter'>('month')

  // Update cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetchTime > 0) {
        const elapsed = Date.now() - lastFetchTime
        const remaining = Math.max(0, Math.ceil((15000 - elapsed) / 1000))
        setCooldownSeconds(remaining)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [lastFetchTime])

  const fetchInsights = async () => {
    // Prevent duplicate calls within 15 seconds (matches server rate limit)
    const now = Date.now()
    if (loading || (now - lastFetchTime < 15000)) {
      console.log('Skipping fetch - too soon since last call')
      return
    }

    setLoading(true)
    setLastFetchTime(now)
    
    try {
      const data = await onGetAIInsights()
      console.log('AI Insights fetched:', data)
      
      // Handle null or undefined responses
      if (!data) {
        console.warn('AI insights returned null/undefined')
        setInsights({
          insights: [],
          summary: 'Unable to load AI insights at this time.',
          recommendations: [],
          patterns: [],
          predictions: null,
          stats: {
            thisMonth: 0,
            lastMonth: 0,
            change: 0,
            changePercentage: 0
          }
        })
        return
      }
      
      if (data.error) {
        console.warn('AI insights returned with error:', data.error)
      }
      
      setInsights(data)
    } catch (error: any) {
      console.error('Failed to fetch insights:', error.message || error)
      
      // Better error messages
      let errorMessage = 'AI insights are temporarily unavailable.'
      let userMessage = 'Please try again in a few minutes.'
      
      if (error.message.includes('Rate limit') || error.message.includes('Too Many Requests')) {
        errorMessage = '⏱️ AI rate limit reached'
        userMessage = 'OpenRouter free tier: 3 AI calls per minute with 15s cooldown. Results are cached for 4 hours. Please wait before refreshing.'
      } else if (error.message.includes('cooldown')) {
        errorMessage = '⏱️ Cooldown active'
        userMessage = error.message
      }
      
      setInsights({
        insights: [{
          type: 'info',
          severity: 'warning',
          message: errorMessage,
          value: 0
        }],
        summary: userMessage,
        recommendations: [{
          priority: 'low',
          action: 'Cached AI insights are served to minimize API usage. The cache refreshes every 4 hours automatically.',
          potential_savings: 0
        }],
        patterns: [],
        predictions: null,
        stats: {
          thisMonth: 0,
          lastMonth: 0,
          change: 0,
          changePercentage: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      food: Utensils,
      transport: Car,
      rent: Home,
      shopping: ShoppingBag,
      entertainment: Coffee
    }
    return icons[category?.toLowerCase()] || DollarSign
  }

  const budgetStatus = insights?.stats ? (
    insights.stats.thisMonth < insights.stats.lastMonth ? 'under' : 'over'
  ) : 'under'

  const thisMonth = insights?.stats?.thisMonth ?? 0
  const lastMonth = insights?.stats?.lastMonth ?? 0
  const changePercentage = insights?.stats?.changePercentage ?? 0
  const formatAmount = (value?: number) => `৳${Math.abs(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  const insightStatCards = [
    {
      label: 'Savings rate',
      value: lastMonth > 0 ? `${Math.abs((thisMonth / lastMonth) * 100 - 100).toFixed(0)}%` : '0%',
      helper: 'Dining & lifestyle',
      icon: Utensils
    },
    {
      label: 'Budget alarm',
      value: formatAmount(thisMonth * 0.05),
      helper: 'Next 7 days risk',
      icon: AlertCircle
    },
    {
      label: 'Adherence delta',
      value: formatAmount(thisMonth * 0.15),
      helper: 'Envelope buffers',
      icon: Target
    },
    {
      label: 'Unusual execution',
      value: `~${formatAmount(thisMonth * 0.1)}`,
      helper: '70% above baseline',
      icon: TrendingUp
    }
  ]

  const heroTiles = [
    {
      label: 'Month spend',
      value: formatAmount(thisMonth),
      hint: 'Tracked via ledger'
    },
    {
      label: 'Last refresh',
      value: lastFetchTime
        ? new Date(lastFetchTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      hint: 'Cached 4 hrs'
    },
    {
      label: 'AI verdict',
      value: budgetStatus === 'under' ? 'Coasting' : 'Overshooting',
      hint: `${Math.abs(changePercentage).toFixed(0)}% vs last report`
    }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 pb-16">
        <section className="rounded-[36px] border border-dashed border-emerald-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Sparkles className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
          <p className="mt-6 text-lg text-gray-600">Analyzing your spending patterns...</p>
          <p className="text-sm text-gray-400">AI copilots wake up in a few seconds.</p>
        </section>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-gray-500">
        Unable to load AI telemetry right now. Try refreshing in a moment.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 p-10 text-white">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(16,185,129,0.4), transparent 55%)' }} />
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.6em] text-emerald-200">AI Copilot</p>
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Signal tower for every Taka you spend</h1>
              <p className="text-white/70 max-w-2xl">
                Tap into cached Gemini snapshots, see how envelopes behave, and jump straight into the next corrective ritual without wrestling spreadsheets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1">
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`rounded-full px-4 py-2 text-sm transition ${timeFilter === 'month' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
                >
                  This month
                </button>
                <button
                  onClick={() => setTimeFilter('quarter')}
                  className={`rounded-full px-4 py-2 text-sm transition ${timeFilter === 'quarter' ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white'}`}
                >
                  Last quarter
                </button>
              </div>
              <Button
                variant="secondary"
                className="rounded-full bg-white/15 text-white hover:bg-white/25"
                onClick={fetchInsights}
                disabled={cooldownSeconds > 0}
              >
                <Settings className={`mr-2 h-4 w-4 ${cooldownSeconds > 0 ? 'animate-spin text-emerald-200' : ''}`} />
                Refresh signal
              </Button>
              {cooldownSeconds > 0 && (
                <span className="text-sm text-white/60">Cooldown {cooldownSeconds}s</span>
              )}
            </div>
          </div>
          <div className="w-full max-w-sm space-y-4 rounded-[28px] border border-white/15 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              Live AI monitor
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {heroTiles.map((tile) => (
                <div key={tile.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">{tile.label}</p>
                  <p className="mt-3 text-2xl font-semibold">{tile.value}</p>
                  <p className="text-xs text-white/60 mt-1">{tile.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[32px] border border-gray-200 shadow-sm">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Budget posture</p>
                <h2 className="text-3xl font-semibold text-gray-900">
                  {budgetStatus === 'under' ? 'Under budget' : 'Over budget'}
                </h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-4 py-1 text-sm text-emerald-700">
                {Math.abs(thisMonth - lastMonth).toFixed(0)} delta
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
              {insights.summary || 'You consistently beating your goals. Keep it up!'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">{Math.abs(changePercentage).toFixed(0)}% since last report</span>
              </div>
              <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white">
                Open ledger recap
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Smart caching enabled</p>
                <p className="text-xs text-blue-700 mt-1">Insights refresh every 4 hours. The manual refresh button enforces a 15s cooldown to stay under OpenRouter quotas.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {insightStatCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{card.label}</p>
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.helper}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Spend mix</p>
                <h3 className="text-xl font-semibold text-gray-900">Where your money went</h3>
              </div>
              <Button variant="outline" className="rounded-full">Download CSV</Button>
            </div>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex items-center justify-center">
                <div className="relative h-44 w-44">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="125 251" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#a5b4fc" strokeWidth="12" strokeDasharray="75 251" strokeDashoffset="-125" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeDasharray="51 251" strokeDashoffset="-200" transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-semibold text-gray-900">{formatAmount(thisMonth)}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {['Rent', 'Food', 'Other'].map((label, idx) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: ['#10b981', '#a5b4fc', '#94a3b8'][idx] }}
                      />
                      <span className="text-gray-600">{label}</span>
                    </div>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Projection lab</p>
              <h3 className="text-xl font-semibold text-gray-900">Financial projector</h3>
            </div>
            <label className="text-sm text-gray-600">If I save an extra</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
              <input
                type="number"
                placeholder="50"
                className="w-full rounded-2xl border border-gray-200 py-3 pl-8 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
            </div>
            {insights.predictions && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Projected savings</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-900">{formatAmount(insights.predictions.month_end_total)}</p>
                <p className="text-xs text-emerald-700 mt-1">{insights.predictions.confidence} confidence</p>
              </div>
            )}
            <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700">Set new goal</Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Velocity</p>
                <h3 className="text-xl font-semibold text-gray-900">Spending over time</h3>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">Trend view</div>
            </div>
            <div className="relative h-56">
              <svg className="h-full w-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="600" y2="100" stroke="#e5e7eb" strokeDasharray="5,5" strokeWidth="1" />
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path d="M 0 180 L 100 160 L 200 140 L 300 110 L 400 120 L 500 90 L 600 60 L 600 200 L 0 200 Z" fill="url(#chartGradient)" />
                <path d="M 0 180 L 100 160 L 200 140 L 300 110 L 400 120 L 500 90 L 600 60" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="600" cy="60" r="6" fill="#10b981" />
                <circle cx="600" cy="60" r="4" fill="white" />
              </svg>
              <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 text-xs text-gray-400">
                {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                <div className="h-2 w-2 rounded-full bg-emerald-500" /> Travel spike - July
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">AI calls</p>
                <h3 className="text-xl font-semibold text-gray-900">Actionable insights</h3>
              </div>
              <Button variant="outline" className="rounded-full px-4 py-1 text-sm">Push to tasks</Button>
            </div>
            {insights.error && (
              <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-900 font-medium">AI features limited</p>
                  <p className="text-xs text-yellow-700 mt-1">{insights.error}</p>
                </div>
              </div>
            )}
            {insights.insights && insights.insights.length > 0 ? (
              <div className="space-y-3">
                {insights.insights.slice(0, 3).map((insight: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <Info className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600">No actionable insights at this time. Keep tracking your expenses!</p>
              </div>
            )}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {insights.recommendations.slice(0, 2).map((rec: any, index: number) => (
                  <div key={index} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <Coffee className="h-5 w-5 text-gray-500" />
                      <p className="text-sm text-gray-700">{rec.action}</p>
                    </div>
                    <Button variant="ghost" className="mt-4 w-full rounded-full text-sm">
                      {index === 0 ? 'Review & cancel' : 'Explore savings tips'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}