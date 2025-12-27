import { useState, useMemo } from 'react'
import { ActivityList } from '../activity/ActivityList'
import { BalanceSummary } from '../activity/BalanceSummary'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Sparkles, Clock, ArrowUpRight, RefreshCw, Search, Filter, Calendar, TrendingUp, TrendingDown, Users, Receipt, ChevronDown, X } from 'lucide-react'

interface ActivityPageProps {
  activityData: any
  loading: boolean
  onGroupClick: (groupId: string) => void
}

type FilterType = 'all' | 'expenses' | 'payments' | 'groups'
type TimeRange = 'today' | 'week' | 'month' | 'all'

export function ActivityPage({ activityData, loading, onGroupClick }: ActivityPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [showFilters, setShowFilters] = useState(false)

  const safeData = {
    totalBalance: activityData?.totalBalance ?? 0,
    totalOwed: activityData?.totalOwed ?? 0,
    totalReceiving: activityData?.totalReceiving ?? 0,
    activities: activityData?.activities ?? []
  }

  // Filter activities based on search and filters
  const filteredActivities = useMemo(() => {
    let activities = [...safeData.activities]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      activities = activities.filter(a => 
        a.description?.toLowerCase().includes(query) ||
        a.groupName?.toLowerCase().includes(query) ||
        a.category?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      activities = activities.filter(a => {
        if (filterType === 'expenses') return a.type === 'expense' || !a.type
        if (filterType === 'payments') return a.type === 'payment'
        if (filterType === 'groups') return a.groupId
        return true
      })
    }

    // Time range filter
    if (timeRange !== 'all') {
      const now = new Date()
      const ranges: Record<TimeRange, number> = {
        today: 1,
        week: 7,
        month: 30,
        all: Infinity
      }
      const daysAgo = ranges[timeRange]
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      activities = activities.filter(a => new Date(a.createdAt) >= cutoff)
    }

    return activities
  }, [safeData.activities, searchQuery, filterType, timeRange])

  // Activity stats
  const activityStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayCount = safeData.activities.filter(a => new Date(a.createdAt) >= today).length
    const weekCount = safeData.activities.filter(a => new Date(a.createdAt) >= weekAgo).length
    const totalSpent = safeData.activities.reduce((sum, a) => sum + (a.amount || 0), 0)
    const avgAmount = safeData.activities.length > 0 ? totalSpent / safeData.activities.length : 0

    return { todayCount, weekCount, totalSpent, avgAmount }
  }, [safeData.activities])

  const formatAmount = (value?: number) => `৳${(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setTimeRange('all')
  }

  const hasActiveFilters = searchQuery || filterType !== 'all' || timeRange !== 'all'

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Hero Section */}
      <section className="rounded-[32px] bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Activity Timeline
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Transaction History</h1>
              <p className="mt-2 text-white/60 max-w-xl">
                Every expense, payment, and settlement in one place. Search, filter, and track your financial journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                className="rounded-full bg-white text-gray-900 hover:bg-white/90"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10">
                <Clock className="mr-2 h-4 w-4" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-xs text-white/50 uppercase">Today</p>
              <p className="text-2xl font-bold mt-1">{activityStats.todayCount}</p>
              <p className="text-xs text-white/50">transactions</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-xs text-white/50 uppercase">This Week</p>
              <p className="text-2xl font-bold mt-1">{activityStats.weekCount}</p>
              <p className="text-xs text-white/50">transactions</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-xs text-white/50 uppercase">Total Volume</p>
              <p className="text-2xl font-bold mt-1">{formatAmount(activityStats.totalSpent)}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <p className="text-xs text-white/50 uppercase">Avg. Amount</p>
              <p className="text-2xl font-bold mt-1">{formatAmount(activityStats.avgAmount)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Balance Summary Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className={`rounded-2xl border-2 ${safeData.totalBalance >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Position</p>
                <p className={`text-3xl font-bold mt-1 ${safeData.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatAmount(safeData.totalBalance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {safeData.totalBalance >= 0 ? 'You\'re in the green!' : 'Time to settle up'}
                </p>
              </div>
              {safeData.totalBalance >= 0 ? (
                <TrendingUp className="h-10 w-10 text-emerald-400" />
              ) : (
                <TrendingDown className="h-10 w-10 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">You Are Owed</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">{formatAmount(safeData.totalReceiving)}</p>
                <p className="text-xs text-gray-500 mt-1">Pending from friends</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <Receipt className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">You Owe</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{formatAmount(safeData.totalOwed)}</p>
                <p className="text-xs text-gray-500 mt-1">Across all groups</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Search and Filters */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-xl border-gray-200"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            className={`rounded-xl h-12 px-6 ${showFilters ? 'border-emerald-500 text-emerald-600' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                Active
              </span>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <Card className="rounded-xl border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                  <div className="flex gap-2">
                    {(['all', 'expenses', 'payments', 'groups'] as FilterType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          filterType === type
                            ? 'bg-emerald-100 text-emerald-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 uppercase">Time Range</label>
                  <div className="flex gap-2">
                    {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          timeRange === range
                            ? 'bg-emerald-100 text-emerald-700 font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {range === 'all' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    Clear all
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Activity List */}
      {loading ? (
        <Card className="rounded-2xl border border-gray-200">
          <CardContent className="py-16 text-center text-gray-500">
            <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            Loading activity...
          </CardContent>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-gray-300">
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No matching transactions' : 'No activity yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search query'
                : 'Start by adding expenses or creating a group'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">All Transactions</h3>
                <p className="text-sm text-gray-500">{filteredActivities.length} results</p>
              </div>
            </div>
            <div className="p-4">
              <ActivityList activities={filteredActivities} onGroupClick={onGroupClick} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
