import { useState, useEffect } from 'react'
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
  ChevronRight
} from 'lucide-react'
import { Badge } from '../ui/badge'

interface AIInsightsProps {
  onFetchInsights: () => Promise<any>
}

export function AIInsights({ onFetchInsights }: AIInsightsProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const data = await onFetchInsights()
      console.log('AI Insights fetched:', data)
      setInsights(data)
    } catch (error: any) {
      console.error('Failed to fetch insights:', error.message || error)
      // Set fallback data on error
      setInsights({
        insights: [{
          type: 'info',
          severity: 'info',
          message: 'AI insights are temporarily unavailable. This could be due to API configuration or network issues.',
          value: 0
        }],
        summary: 'Unable to generate AI insights at the moment. Please check your GEMINI_API_KEY configuration and try again later.',
        recommendations: [{
          priority: 'low',
          action: 'Configure your Google Gemini API key to enable AI-powered insights and recommendations.',
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
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  if (!insights && !loading) {
    return null
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Insights</CardTitle>
              <p className="text-sm text-muted-foreground">Personalized spending analysis</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-muted-foreground">Analyzing your spending patterns...</p>
          </div>
        ) : insights ? (
          <>
            {/* Summary */}
            {insights.summary && (
              <div className="p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-purple-200 dark:border-purple-800">
                <p className="text-sm leading-relaxed">{insights.summary}</p>
              </div>
            )}

            {/* Stats Overview */}
            {insights.stats && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-2xl font-bold">৳{insights.stats.thisMonth.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-muted-foreground mb-1">vs Last Month</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {insights.stats.changePercentage > 0 ? '+' : ''}
                      {insights.stats.changePercentage.toFixed(1)}%
                    </p>
                    {insights.stats.change > 0 ? (
                      <TrendingUp className="h-5 w-5 text-red-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {(showAll ? insights.insights : insights.insights.slice(0, 3)).map((insight: any, index: number) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border ${getSeverityColor(insight.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(insight.severity)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{insight.message}</p>
                          {insight.value !== undefined && (
                            <p className="text-xs mt-1 opacity-80">Amount: ৳{insight.value.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {insights.insights.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-2"
                  >
                    {showAll ? 'Show Less' : `Show ${insights.insights.length - 3} More`}
                    <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${showAll ? 'rotate-90' : ''}`} />
                  </Button>
                )}
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityBadge(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm">{rec.action}</p>
                          {rec.potential_savings > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              💰 Potential savings: ৳{rec.potential_savings.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns */}
            {insights.patterns && insights.patterns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Spending Patterns
                </h4>
                <div className="space-y-2">
                  {insights.patterns.map((pattern: any, index: number) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                    >
                      <p className="text-sm font-medium mb-1">{pattern.pattern}</p>
                      <p className="text-xs text-muted-foreground">{pattern.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {insights.predictions && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Month-End Prediction
                </h4>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  ৳{insights.predictions.month_end_total.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {insights.predictions.confidence} confidence
                  </Badge>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {insights.predictions.reasoning}
                </p>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
