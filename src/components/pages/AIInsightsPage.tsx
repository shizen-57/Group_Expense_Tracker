import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  Lightbulb,
  RefreshCw,
  Brain,
  Target,
  Calendar,
  Zap,
  DollarSign,
  PiggyBank,
  ShieldAlert,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { Badge } from '../ui/badge'

interface AIInsightsPageProps {
  onGetAIInsights: () => Promise<any>
}

export function AIInsightsPage({ onGetAIInsights }: AIInsightsPageProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)

  // Update cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastFetchTime > 0) {
        const elapsed = Date.now() - lastFetchTime
        const remaining = Math.max(0, Math.ceil((10000 - elapsed) / 1000))
        setCooldownSeconds(remaining)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [lastFetchTime])

  const fetchInsights = async () => {
    // Prevent duplicate calls within 10 seconds
    const now = Date.now()
    if (loading || (now - lastFetchTime < 10000)) {
      console.log('Skipping fetch - too soon since last call')
      return
    }

    setLoading(true)
    setLastFetchTime(now)
    
    try {
      const data = await onGetAIInsights()
      console.log('AI Insights fetched:', data)
      
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
        userMessage = 'OpenRouter free tier: 4 AI calls per minute with 10s cooldown. Results are cached for 30 minutes. Please wait before refreshing.'
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
          action: 'Cached AI insights are served to minimize API usage. The cache refreshes every 30 minutes automatically.',
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'from-red-500 to-pink-600'
      case 'warning':
        return 'from-yellow-500 to-orange-600'
      default:
        return 'from-blue-500 to-cyan-600'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert':
        return <ShieldAlert className="h-6 w-6 text-white" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-white" />
      default:
        return <Info className="h-6 w-6 text-white" />
    }
  }

  const getPriorityData = (priority: string) => {
    const data = {
      high: { 
        color: 'from-red-500 to-pink-600', 
        badge: 'bg-red-100 text-red-700',
        emoji: '🔥'
      },
      medium: { 
        color: 'from-yellow-500 to-orange-600', 
        badge: 'bg-yellow-100 text-yellow-700',
        emoji: '⚡'
      },
      low: { 
        color: 'from-green-500 to-emerald-600', 
        badge: 'bg-green-100 text-green-700',
        emoji: '💡'
      }
    }
    return data[priority as keyof typeof data] || data.low
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8 text-white"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl mb-1">AI Financial Insights</h1>
                <p className="text-white/90">Powered by advanced AI to help you make smarter financial decisions</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={fetchInsights}
            disabled={loading}
            size="lg"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/40 text-white gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mb-6">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h3 className="text-xl mb-2">Analyzing Your Spending Patterns...</h3>
          <p className="text-muted-foreground">Our AI is crunching the numbers to provide personalized insights</p>
        </div>
      ) : insights ? (
        <>
          {/* Error Message if any */}
          {insights.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-yellow-500/20">
                      <AlertTriangle className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-yellow-900">AI Features Limited</h3>
                      <p className="text-sm text-yellow-800">{insights.error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Overview */}
          {insights.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-4xl">📊</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">This Month</p>
                    <p className="text-3xl mb-1">৳{insights.stats.thisMonth.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total expenses</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Last Month</p>
                    <p className="text-3xl mb-1">৳{insights.stats.lastMonth.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Previous period</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className={`border-0 shadow-xl bg-white overflow-hidden group hover:shadow-2xl transition-shadow`}>
                  <div className={`absolute inset-0 ${insights.stats.change > 0 ? 'bg-gradient-to-br from-red-500/5 to-pink-500/5' : 'bg-gradient-to-br from-green-500/5 to-emerald-500/5'}`} />
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${insights.stats.change > 0 ? 'from-red-500 to-pink-600' : 'from-green-500 to-emerald-600'} shadow-lg`}>
                        {insights.stats.change > 0 ? (
                          <TrendingUp className="h-6 w-6 text-white" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="text-4xl">{insights.stats.change > 0 ? '📈' : '📉'}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Change</p>
                    <p className={`text-3xl mb-1 ${insights.stats.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {insights.stats.changePercentage > 0 ? '+' : ''}
                      {insights.stats.changePercentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* AI Summary */}
          {insights.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-purple-900">AI Summary</h3>
                      <p className="text-purple-800 leading-relaxed">{insights.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Key Insights */}
          {insights.insights && insights.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-4">
                <h2 className="text-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
                    <ShieldAlert className="h-5 w-5 text-white" />
                  </div>
                  Key Insights
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.insights.map((insight: any, index: number) => (
                    <Card 
                      key={index}
                      className="border-0 shadow-lg bg-white overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className={`h-2 bg-gradient-to-r ${getSeverityColor(insight.severity)}`} />
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${getSeverityColor(insight.severity)} shadow-lg flex-shrink-0`}>
                            {getSeverityIcon(insight.severity)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed mb-2">{insight.message}</p>
                            {insight.value !== undefined && insight.value > 0 && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                                <DollarSign className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-semibold">৳{insight.value.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-4">
                <h2 className="text-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  Smart Recommendations
                </h2>
                
                <div className="space-y-3">
                  {insights.recommendations.map((rec: any, index: number) => {
                    const priorityData = getPriorityData(rec.priority)
                    return (
                      <Card 
                        key={index}
                        className="border-0 shadow-lg bg-white overflow-hidden hover:shadow-xl transition-all group"
                      >
                        <div className={`h-2 bg-gradient-to-r ${priorityData.color}`} />
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="text-4xl">{priorityData.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge className={priorityData.badge}>
                                  {rec.priority.toUpperCase()} PRIORITY
                                </Badge>
                              </div>
                              <p className="text-sm leading-relaxed mb-3">{rec.action}</p>
                              {rec.potential_savings > 0 && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                  <PiggyBank className="h-5 w-5 text-green-600" />
                                  <span className="font-semibold text-green-700">
                                    Save ৳{rec.potential_savings.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Spending Patterns */}
          {insights.patterns && insights.patterns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="space-y-4">
                <h2 className="text-2xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Spending Patterns
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.patterns.map((pattern: any, index: number) => (
                    <Card 
                      key={index}
                      className="border-0 shadow-lg bg-white overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">🎯</div>
                          <div className="flex-1">
                            <p className="font-semibold mb-2">{pattern.pattern}</p>
                            <p className="text-sm text-muted-foreground">{pattern.suggestion}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Predictions */}
          {insights.predictions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10" />
                <CardContent className="p-8 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                          <Zap className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl text-white">Month-End Prediction</h2>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-white/80 mb-2">Estimated Total</p>
                          <p className="text-5xl text-white mb-3">
                            ৳{insights.predictions.month_end_total.toFixed(2)}
                          </p>
                        </div>
                        
                        <Badge className="bg-white/20 text-white border-white/40 backdrop-blur-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {insights.predictions.confidence} confidence
                        </Badge>
                        
                        <p className="text-white/90 text-sm leading-relaxed max-w-2xl">
                          {insights.predictions.reasoning}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-8xl opacity-20">🔮</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      ) : null}
    </div>
  )
}