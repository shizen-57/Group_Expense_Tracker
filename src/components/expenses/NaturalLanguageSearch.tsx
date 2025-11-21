import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Search, Sparkles, TrendingUp, BarChart3, PieChart, AlertCircle } from 'lucide-react'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => Promise<any>
}

export function NaturalLanguageSearch({ onSearch }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)
    
    if (!value.trim()) {
      setResponse(null)
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const searchResults = await onSearch(value)
      setResponse(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResponse(null)
    } finally {
      setIsSearching(false)
    }
  }

  const exampleQueries = [
    'coffee expenses',
    'how much on food?',
    'groceries last week',
    'compare food vs transport',
    'spending trend',
    'total this month'
  ]

  const renderAnalytics = (data: any) => {
    const { analysisResult, explanation } = data.data

    return (
      <div className="space-y-4">
        {explanation && (
          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900 dark:text-purple-100">{explanation}</p>
            </div>
          </div>
        )}

        {analysisResult.text && (
          <Card className="border-2 border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                    Analysis Result
                  </h4>
                  <p className="text-lg text-emerald-800 dark:text-emerald-200">
                    {analysisResult.text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult.breakdown && (
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </h4>
              <div className="space-y-3">
                {Object.entries(analysisResult.breakdown).map(([category, data]: [string, any]) => {
                  const categoryInfo = getCategoryInfo(category)
                  const CategoryIcon = categoryInfo.icon
                  const percentage = data.total / Object.values(analysisResult.breakdown).reduce((sum: number, d: any) => sum + d.total, 0) * 100

                  return (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                          <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{category}</p>
                          <p className="text-sm text-muted-foreground">{data.count} expenses</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">৳{data.total.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult.category1 && (
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparison
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 capitalize">
                    {analysisResult.category1.name}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ৳{analysisResult.category1.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {analysisResult.category1.count} expenses
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1 capitalize">
                    {analysisResult.category2.name}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    ৳{analysisResult.category2.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {analysisResult.category2.count} expenses
                  </p>
                </div>
              </div>
              {analysisResult.percentage !== undefined && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center">
                  <p className="text-sm">
                    <span className="font-semibold">{Math.abs(analysisResult.percentage).toFixed(1)}%</span>
                    {analysisResult.difference > 0 ? ' more' : ' less'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {analysisResult.monthlyData && (
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trend
              </h4>
              <div className="space-y-2">
                {Object.entries(analysisResult.monthlyData).map(([month, data]: [string, any]) => (
                  <div key={month} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="font-medium">{month}</span>
                    <div className="text-right">
                      <p className="font-bold">৳{data.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{data.count} expenses</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.data.expenses && data.data.expenses.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">Related Expenses ({data.data.expenses.length})</h4>
              <div className="space-y-2">
                {data.data.expenses.slice(0, 5).map((expense: any) => {
                  const categoryInfo = getCategoryInfo(expense.category || 'other')
                  const CategoryIcon = categoryInfo.icon

                  return (
                    <div 
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                          <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold">৳{expense.amount.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderResults = (data: any[]) => {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Found {data.length} {data.length === 1 ? 'expense' : 'expenses'} matching "{query}"
        </p>
        <div className="space-y-3">
          {data.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category || 'other')
            const CategoryIcon = categoryInfo.icon

            return (
              <div 
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${categoryInfo.bgColor}`}>
                    <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{expense.amount.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                    {categoryInfo.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Assistant</h3>
              <p className="text-sm text-white/80">Ask questions about your spending</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Ask: 'How much did I spend on food?' or 'Show coffee expenses'"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 py-6 bg-white text-gray-900 border-0 shadow-lg placeholder:text-gray-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-white/60">Try:</span>
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => handleSearch(example)}
                className="text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p>Analyzing...</p>
              </div>
            ) : !response || (response.type === 'results' && response.data?.length === 0) ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different question</p>
              </div>
            ) : response.type === 'analytics' ? (
              renderAnalytics(response)
            ) : response.type === 'results' ? (
              renderResults(response.data)
            ) : (
              renderResults(response)
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}