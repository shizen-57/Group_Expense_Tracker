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
      return
    }

    setLoading(true)
    setLastFetchTime(now)
    
    try {
      const data = await onGetAIInsights()
      
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

  const statsBlock = insights?.stats ?? {
    thisMonth: 0,
    lastMonth: 0,
    change: 0,
    changePercentage: 0
  }

  const formatAmount = (value?: number) => `৳${(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  const formatPercent = (value?: number) => `${Math.abs(value ?? 0).toFixed(0)}%`

  const statHighlights = [
    {
      label: timeFilter === 'month' ? 'This month burn' : 'Quarter burn',
      value: formatAmount(statsBlock.thisMonth),
      detail: timeFilter === 'month' ? 'vs last month' : 'vs previous quarter',
      delta: formatPercent(statsBlock.changePercentage),
      positive: (statsBlock.changePercentage ?? 0) <= 0
    },
    {
      label: 'Last horizon',
      value: formatAmount(statsBlock.lastMonth),
      detail: 'Previous period spend',
      delta: budgetStatus === 'under' ? 'Stable' : 'Climbing',
      positive: budgetStatus === 'under'
    },
    {
      label: 'Delta tracked',
      value: formatAmount(Math.abs(statsBlock.thisMonth - statsBlock.lastMonth)),
      detail: 'Movement detected',
      delta: formatPercent(statsBlock.changePercentage),
      positive: statsBlock.thisMonth <= statsBlock.lastMonth
    }
  ]

  const insightMessages = insights?.insights ?? []
  const recommendationCards = (insights?.recommendations ?? []).slice(0, 3)
  const patternCards = (insights?.patterns ?? []).slice(0, 4)
  const summaryCopy = insights?.summary ?? 'AI is warming up your latest ledger activity.'
  const projector = insights?.predictions

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      <section className="rounded-[36px] bg-gradient-to-br from-gray-900 via-indigo-950 to-emerald-950 p-10 text-white">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.5em] text-white/60">
              <Sparkles className="h-4 w-4" />
              Signal Deck
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">AI command center</h1>
              <p className="mt-4 max-w-2xl text-white/70">{summaryCopy}</p>
            </div>
            <div className="flex flex-wrap gap-2 rounded-full bg-white/10 p-1">
              {(['month', 'quarter'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setTimeFilter(option)}
                  className={`rounded-full px-5 py-2 text-sm transition ${
                    timeFilter === option ? 'bg-white text-gray-900' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {option === 'month' ? 'This Month' : 'Last Quarter'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                className="rounded-full bg-white text-gray-900 hover:bg-white/90"
                onClick={fetchInsights}
                disabled={loading || cooldownSeconds > 0}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh insights
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/30 text-white hover:bg-white/10"
                onClick={() => setTimeFilter(timeFilter === 'month' ? 'quarter' : 'month')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Toggle horizon
              </Button>
              {cooldownSeconds > 0 && (
                <span className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/60">
                  Cooldown {cooldownSeconds}s
                </span>
              )}
            </div>
          </div>
          <div className="grid w-full max-w-md gap-4">
            {statHighlights.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-inner"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-white/70">
                  <span>{stat.detail}</span>
                  <span className={stat.positive ? 'text-emerald-300' : 'text-rose-300'}>{stat.delta}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-blue-200/60 bg-blue-50/70 p-5 text-sm text-blue-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600" />
            <p>
              Smart caching keeps responses fresh for 4 hours. A {cooldownSeconds || 15}-second cooldown protects the model.
            </p>
          </div>
          <p className="text-xs text-blue-700">Last sync • {new Date(lastFetchTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Analyzing your spending patterns...</p>
        </div>
      ) : insights ? (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border border-gray-200 shadow-lg">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Budget radar</p>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      {budgetStatus === 'under' ? 'Under budget' : 'Over budget'}
                    </h2>
                  </div>
                  <div className={`rounded-full px-4 py-2 text-sm ${budgetStatus === 'under' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {budgetStatus === 'under' ? 'Healthy' : 'Watchlist'}
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {summaryCopy}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {statHighlights.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{stat.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600">Open detailed report</Button>
                  <span className="text-sm text-gray-500">Last change {formatPercent(statsBlock.changePercentage)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-200">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Signal stack</p>
                    <h3 className="text-xl font-semibold text-gray-900">Live monitors</h3>
                  </div>
                  <Settings className="h-5 w-5 text-gray-400" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {patternCards.length > 0 ? (
                    patternCards.map((pattern, index) => {
                      const Icon = getCategoryIcon(pattern.category)
                      return (
                        <motion.div
                          key={`${pattern.category}-${index}`}
                          whileHover={{ scale: 1.01 }}
                          className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-2 shadow-sm">
                              <Icon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{pattern.category || 'Spend'}</p>
                              <p className="text-xs text-gray-500">{pattern.trend || 'Stable'}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-600">{pattern.description || 'AI detected consistent behavior.'}</p>
                        </motion.div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Pattern data will show up after a few more syncs.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <Card className="rounded-3xl border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Where money flows</p>
                    <h3 className="text-xl font-semibold text-gray-900">Category pulse</h3>
                  </div>
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="relative mx-auto h-48 w-48">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="140 251" transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="70 251" strokeDashoffset="-140" transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="41 251" strokeDashoffset="-210" transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-gray-500">Tracked</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatAmount(statsBlock.thisMonth)}</p>
                      <p className="text-xs text-gray-500">This period</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    {patternCards.slice(0, 3).map((pattern, index) => (
                      <div key={`legend-${index}`} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${['bg-emerald-500', 'bg-blue-500', 'bg-orange-500'][index % 3]}`}></span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pattern.category || 'Spending'}</p>
                            <p className="text-xs text-gray-500">{pattern.trend || 'Neutral'}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{pattern.value || pattern.amount || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-200">
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Projection lab</p>
                    <h3 className="text-xl font-semibold text-gray-900">Financial projector</h3>
                  </div>
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Monthly savings dial</label>
                  <div className="mt-2 flex gap-3">
                    {[50, 100, 200].map((amount) => (
                      <button key={amount} className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-emerald-400">
                        ৳{amount}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Custom addition</label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <input className="w-full rounded-2xl border border-gray-200 py-2 pl-8 pr-4 focus:border-emerald-500 focus:outline-none" placeholder="75" type="number" />
                    <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                {projector ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Projected total</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-700">{formatAmount(projector.month_end_total)}</p>
                    <p className="text-xs text-emerald-600">Confidence {projector.confidence}</p>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">Projection appears after at least two periods of data.</p>
                )}
                <Button className="w-full rounded-full bg-gray-900 text-white hover:bg-gray-800">Save new goal</Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-3xl border border-gray-200">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Action lab</h3>
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                {insights.error && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    <AlertTriangle className="mr-2 inline h-4 w-4" />
                    {insights.error}
                  </div>
                )}
                {insightMessages.length > 0 ? (
                  <div className="space-y-3">
                    {insightMessages.slice(0, 4).map((item: any, index: number) => (
                      <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm text-gray-700">{item.message || 'Insight available soon.'}</p>
                        {item.value && <p className="mt-1 text-xs text-gray-500">Signal value: {item.value}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No critical callouts yet. Keep feeding data.</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-gray-200">
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Recommendation board</p>
                  <h3 className="text-xl font-semibold text-gray-900">Do next</h3>
                </div>
                {recommendationCards.length > 0 ? (
                  <div className="space-y-4">
                    {recommendationCards.map((rec, index) => (
                      <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <Coffee className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{rec.action || 'Review subscription stack'}</p>
                            <p className="text-xs text-gray-500">Priority: {rec.priority || 'medium'}</p>
                          </div>
                        </div>
                        {rec.potential_savings && (
                          <p className="mt-3 text-sm text-gray-600">Potential save {formatAmount(rec.potential_savings)}</p>
                        )}
                        <Button variant="outline" className="mt-4 w-full rounded-full">Launch playbook</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">AI will surface plays after crunching a few more receipts.</p>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  )
}