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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">AI Insights</h1>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-full transition-all ${
                timeFilter === 'month' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('quarter')}
              className={`px-4 py-2 rounded-full transition-all ${
                timeFilter === 'quarter' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Last Quarter
            </button>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={fetchInsights}
            disabled={loading || cooldownSeconds > 0}
          >
            <Settings className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          {cooldownSeconds > 0 && (
            <div className="text-xs text-gray-500">
              Wait {cooldownSeconds}s
            </div>
          )}
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-900">
            <span className="font-medium">Smart Caching Enabled:</span> AI insights are cached for 4 hours to optimize performance and minimize API usage. 
            Refresh cooldown is 15 seconds.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Analyzing your spending patterns...</p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Card - Budget Status */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-5xl text-gray-800 mb-2">
                      ৳{Math.abs(insights.stats?.thisMonth - insights.stats?.lastMonth || 0).toFixed(0)}
                    </div>
                    <div className="text-2xl text-gray-700">
                      {budgetStatus === 'under' ? 'Under Budget' : 'Over Budget'}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                    {insights.summary || 'You consistently beating your goals. Keep it up!'}
                    <br />
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </p>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">
                        {Math.abs(insights.stats?.changePercentage || 0).toFixed(0)}% Since Last Report
                      </span>
                    </div>
                    
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6"
                      size="sm"
                    >
                      View Detail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Savings Rate */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-gray-600">Savings Rate</div>
                  <Utensils className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl mb-1">
                  {insights.stats?.lastMonth > 0 
                    ? Math.abs((insights.stats.thisMonth / insights.stats.lastMonth * 100) - 100).toFixed(0)
                    : '0'}
                </div>
                <div className="text-xs text-gray-500">Dining Out</div>
              </CardContent>
            </Card>

            {/* Budget Alarme */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-gray-600">Budget Alarme</div>
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl mb-1">
                  ৳{(insights.stats?.thisMonth * 0.05 || 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </CardContent>
            </Card>

            {/* Budget Adherence */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-gray-600">Budget Adherence</div>
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl mb-1">
                  ৳{(insights.stats?.thisMonth * 0.15 || 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </CardContent>
            </Card>

            {/* Unusual Execution */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-gray-600">Unusual Execution</div>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-2xl mb-1">
                  ~৳{(insights.stats?.thisMonth * 0.1 || 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">(70% increase)</div>
              </CardContent>
            </Card>
          </div>

          {/* Where Your Money Went - Donut Chart Placeholder */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">Where Your Money Went</h3>
              </div>
              
              <div className="flex items-center justify-center py-8">
                {/* Simple visual representation */}
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Outer ring segments */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="12"
                      strokeDasharray="125 251"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#a5b4fc"
                      strokeWidth="12"
                      strokeDasharray="75 251"
                      strokeDashoffset="-125"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      strokeDasharray="51 251"
                      strokeDashoffset="-200"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl">৳{insights.stats?.thisMonth.toFixed(0) || '0'}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-600">Rent</span>
                  </div>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
                    <span className="text-gray-600">Food</span>
                  </div>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-gray-600">Other</span>
                  </div>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spending Over Time - Line Chart */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium">Your Spending Over Time</h3>
              </div>
              
              {/* Simple line chart representation */}
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#e5e7eb" strokeDasharray="5,5" strokeWidth="1" />
                  
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area */}
                  <path
                    d="M 0 180 L 100 160 L 200 140 L 300 110 L 400 120 L 500 90 L 600 60 L 600 200 L 0 200 Z"
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 180 L 100 160 L 200 140 L 300 110 L 400 120 L 500 90 L 600 60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Points */}
                  <circle cx="600" cy="60" r="6" fill="#10b981" />
                  <circle cx="600" cy="60" r="4" fill="white" />
                </svg>
                
                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                </div>
                
                {/* Annotation */}
                <div className="absolute top-8 right-12 flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span>Travel Spike - July</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actionable Insights */}
          <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Actionable Insights</h3>
              
              {insights.error && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-900 font-medium">AI Features Limited</p>
                    <p className="text-xs text-yellow-700 mt-1">{insights.error}</p>
                  </div>
                </div>
              )}
              
              {insights.insights && insights.insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.insights.slice(0, 3).map((insight: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-lg"
                    >
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">No actionable insights at this time. Keep tracking your expenses!</p>
                </div>
              )}
              
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.recommendations.slice(0, 2).map((rec: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <Coffee className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{rec.action}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-full"
                      >
                        {index === 0 ? 'Review & Cancel' : 'Explore Savings Tips'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Projector */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Financial Projector</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    If I save <span className="font-medium">৳50</span> per month:
                  </label>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">
                    If I save an extra:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <TrendingUp className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                
                {insights.predictions && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-sm text-gray-600 mb-1">Projected Savings</div>
                    <div className="text-2xl text-emerald-700 mb-2">
                      ৳{insights.predictions.month_end_total.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {insights.predictions.confidence} confidence
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  Set New Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}