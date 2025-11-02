import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Search, Sparkles } from 'lucide-react'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface NaturalLanguageSearchProps {
  onSearch: (query: string) => Promise<any[]>
}

export function NaturalLanguageSearch({ onSearch }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)
    
    if (!value.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      const searchResults = await onSearch(value)
      setResults(searchResults || [])
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const exampleQueries = [
    'coffee expenses',
    'groceries last week',
    'food spending',
    'transportation costs'
  ]

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
              <h3 className="text-xl font-bold">Smart Search</h3>
              <p className="text-sm text-white/80">Ask in plain English</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Try 'Show coffee expenses' or 'groceries last month'"
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

      {/* Search Results */}
      {hasSearched && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p>Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No expenses found matching "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Found {results.length} {results.length === 1 ? 'expense' : 'expenses'} matching "{query}"
                </p>
                <div className="space-y-3">
                  {results.map((expense) => {
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
