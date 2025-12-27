import { useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Search, Sparkles, BarChart3, PieChart, AlertCircle, X } from 'lucide-react'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => Promise<any>
}

export function NaturalLanguageSearch({ onSearch }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (value?: string) => {
    const searchValue = value ?? query
    if (!searchValue.trim()) {
      setResponse(null)
      setHasSearched(false)
      return
    }

    setQuery(searchValue)
    setIsSearching(true)
    setHasSearched(true)
    try {
      const searchResults = await onSearch(searchValue)
      console.log('Search results received:', searchResults)
      setResponse(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
      setResponse(null)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResponse(null)
    setHasSearched(false)
  }

  const exampleQueries = [
    'food expenses',
    'this month',
    'transport',
    'shopping'
  ]

  const renderAnalytics = (data: any) => {
    const { analysisResult, explanation } = data.data

    return (
      <div className="space-y-3">
        {explanation && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">{explanation}</p>
            </div>
          </div>
        )}

        {analysisResult.text && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <p className="text-lg font-semibold text-gray-900">{analysisResult.text}</p>
            </div>
          </div>
        )}

        {analysisResult.breakdown && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Breakdown
            </h4>
            <div className="space-y-1.5">
              {Object.entries(analysisResult.breakdown).slice(0, 4).map(([category, data]: [string, any]) => {
                const categoryInfo = getCategoryInfo(category)
                const CategoryIcon = categoryInfo.icon

                return (
                  <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                      <span className="capitalize text-gray-700">{category}</span>
                    </div>
                    <span className="font-semibold">৳{data.total.toFixed(0)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {analysisResult.category1 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 capitalize">{analysisResult.category1.name}</p>
              <p className="text-lg font-bold text-blue-900">৳{analysisResult.category1.total.toFixed(0)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-600 capitalize">{analysisResult.category2.name}</p>
              <p className="text-lg font-bold text-purple-900">৳{analysisResult.category2.total.toFixed(0)}</p>
            </div>
          </div>
        )}

        {data.data.expenses && data.data.expenses.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium text-gray-700">Matching expenses ({data.data.expenses.length})</h4>
            {data.data.expenses.slice(0, 3).map((expense: any) => {
              const categoryInfo = getCategoryInfo(expense.category || 'other')
              const CategoryIcon = categoryInfo.icon

              return (
                <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                    <span className="text-gray-700 truncate max-w-[140px]">{expense.description}</span>
                  </div>
                  <span className="font-semibold text-emerald-600">৳{expense.amount.toFixed(0)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderResults = (data: any[]) => {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          Found {data.length} {data.length === 1 ? 'expense' : 'expenses'}
        </p>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {data.slice(0, 5).map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category || 'other')
            const CategoryIcon = categoryInfo.icon

            return (
              <div key={expense.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                  <div>
                    <p className="font-medium text-gray-900 truncate max-w-[150px]">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-emerald-600">৳{expense.amount.toFixed(0)}</span>
              </div>
            )
          })}
          {data.length > 5 && (
            <p className="text-xs text-center text-gray-400 pt-1">+{data.length - 5} more</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search expenses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-9 pr-20 h-10 bg-gray-50 border-gray-200 focus:bg-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </button>
        )}
        <Button
          size="sm"
          onClick={() => handleSearch()}
          disabled={!query.trim() || isSearching}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 bg-emerald-600 hover:bg-emerald-700"
        >
          {isSearching ? '...' : 'Search'}
        </Button>
      </div>

      {/* Quick Tags */}
      <div className="flex flex-wrap gap-1.5">
        {exampleQueries.map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example)
              handleSearch(example)
            }}
            className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {isSearching ? (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent mb-2"></div>
              <p className="text-sm">Searching...</p>
            </div>
          ) : !response || (response.type === 'results' && response.data?.length === 0) ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No results for "{query}"</p>
              <p className="text-xs text-gray-400">Try different keywords</p>
            </div>
          ) : response.type === 'analytics' ? (
            renderAnalytics(response)
          ) : response.type === 'results' ? (
            renderResults(response.data)
          ) : Array.isArray(response) ? (
            renderResults(response)
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Unable to process results
            </div>
          )}
        </div>
      )}
    </div>
  )
}
