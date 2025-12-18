import { Card, CardContent } from '../ui/card'
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, Download, ArrowUpRight } from 'lucide-react'
import { Button } from '../ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getCategoryInfo } from '../groups/ExpenseCategories'
import { TrendAnalytics } from '../expenses/TrendAnalytics'

interface DashboardProps {
  stats: {
    totalGroups: number
    totalFriends: number
    totalExpenses: number
    totalBalance: number
    totalOwed: number
    totalReceiving: number
    recentActivity: any[]
  }
  onNavigate: (page: 'groups' | 'friends' | 'activity') => void
  personalExpenses?: any[]
  trends?: any
}

export function Dashboard({ stats, onNavigate, personalExpenses = [], trends = {} }: DashboardProps) {
  // Ensure stats has default values
  const safeStats = {
    totalGroups: 0,
    totalFriends: 0,
    totalExpenses: 0,
    totalBalance: 0,
    totalOwed: 0,
    totalReceiving: 0,
    recentActivity: [],
    monthlyTotal: 0,
    monthlyExpensesCount: 0,
    personalExpensesCount: 0,
    ...stats
  }

  // Calculate category breakdown - ensure recentActivity is an array
  const recentActivities = Array.isArray(safeStats.recentActivity) ? safeStats.recentActivity : []
  const categoryData = recentActivities.reduce((acc: any, activity: any) => {
    const category = activity.category || 'other'
    if (!acc[category]) {
      acc[category] = { category, amount: 0, count: 0 }
    }
    acc[category].amount += activity.amount
    acc[category].count += 1
    return acc
  }, {})

  const categoryChartData = Object.values(categoryData).map((item: any) => {
    const categoryInfo = getCategoryInfo(item.category)
    return {
      name: categoryInfo.label,
      value: parseFloat(item.amount.toFixed(2)),
      count: item.count,
      color: categoryInfo.color.replace('text-', '')
    }
  })

  const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#6b7280']
  
  // Calculate total amount for chart
  const totalAmount = recentActivities.reduce((sum, activity) => sum + activity.amount, 0)

  const formatAmount = (value?: number) => `৳${Math.abs(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const heroMetrics = [
    {
      label: 'Month burn',
      value: formatAmount(safeStats.monthlyTotal),
      hint: `${safeStats.monthlyExpensesCount || 0} entries logged`
    },
    {
      label: 'You are owed',
      value: formatAmount(safeStats.totalReceiving),
      hint: 'Pending repayments'
    },
    {
      label: 'You owe',
      value: formatAmount(safeStats.totalOwed),
      hint: 'Ready to settle'
    }
  ]

  const balancePositive = (safeStats.totalBalance || 0) >= 0
  const networkHighlights = [
    {
      label: 'Active groups',
      value: (safeStats.totalGroups || 0).toLocaleString('en-US'),
      helper: `${safeStats.totalFriends || 0} collaborators`,
      icon: Users,
      accent: 'from-emerald-50 to-white',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Personal logs',
      value: (safeStats.personalExpensesCount || 0).toLocaleString('en-US'),
      helper: 'Lifetime entries',
      icon: Receipt,
      accent: 'from-blue-50 to-white',
      iconColor: 'text-blue-600'
    },
    {
      label: 'All expenses',
      value: (safeStats.totalExpenses || 0).toLocaleString('en-US'),
      helper: 'Across crews',
      icon: DollarSign,
      accent: 'from-purple-50 to-white',
      iconColor: 'text-purple-600'
    },
    {
      label: balancePositive ? 'Net receiving' : 'Net owing',
      value: formatAmount(safeStats.totalBalance),
      helper: balancePositive ? 'Healthy runway' : 'Needs attention',
      icon: balancePositive ? TrendingUp : TrendingDown,
      accent: balancePositive ? 'from-emerald-50 to-white' : 'from-red-50 to-white',
      iconColor: balancePositive ? 'text-emerald-600' : 'text-red-600'
    }
  ]

  const balanceCards = [
    {
      title: 'Receivable',
      amount: formatAmount(safeStats.totalReceiving),
      description: 'Money teammates owe you from recent splits.',
      meta: `${safeStats.totalFriends || 0} friends connected`,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-400',
      button: 'View relationships',
      action: () => onNavigate('friends')
    },
    {
      title: 'Payables',
      amount: formatAmount(safeStats.totalOwed),
      description: 'What you owe across travel, ops, and shared tabs.',
      meta: `${safeStats.totalGroups || 0} groups tracking`,
      gradient: 'from-rose-500 via-orange-500 to-amber-500',
      button: 'Visit groups',
      action: () => onNavigate('groups')
    }
  ]

  const timelineItems = recentActivities.slice(0, 5)
  const personalExpensesData = Array.isArray(personalExpenses) ? personalExpenses : []
  const trendData = trends && typeof trends === 'object' ? trends : {}
  const hasTrendData = personalExpensesData.length > 0 || Object.keys(trendData).length > 0

  const quickActions = [
    {
      title: 'Export snapshot',
      description: 'Download CSV overview for finance.',
      icon: Download,
      action: exportToDashboardCSV
    },
    {
      title: 'Open activity',
      description: 'Deep dive into every transaction.',
      icon: Receipt,
      action: () => onNavigate('activity')
    },
    {
      title: 'Visit groups',
      description: 'Adjust splits & settle tabs.',
      icon: Users,
      action: () => onNavigate('groups')
    }
  ]

  // Export to CSV function (declared as a function so it's hoisted)
  function exportToDashboardCSV() {
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Groups', safeStats.totalGroups],
      ['Total Friends', safeStats.totalFriends],
      ['Total Expenses', safeStats.totalExpenses],
      ['Total Balance', `৳${safeStats.totalBalance.toFixed(2)}`],
      ['Total Owed', `৳${safeStats.totalOwed.toFixed(2)}`],
      ['Total Receiving', `৳${safeStats.totalReceiving.toFixed(2)}`],
      ['', ''],
      ['Category', 'Amount', 'Count'],
      ...Object.values(categoryData).map((item: any) => [
        getCategoryInfo(item.category).label,
        `৳${item.amount.toFixed(2)}`,
        item.count
      ])
    ]
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      <section className="rounded-[32px] bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 text-white p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(16,185,129,0.4), transparent 55%)' }} />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">Overview</p>
              <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">Command tower for every shared Taka</h1>
              <p className="text-white/70 mt-3 max-w-2xl">
                Track balances, watch group health, and jump into the right ritual without combing through spreadsheets.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-white/90"
                onClick={() => onNavigate('activity')}
              >
                Go to activity
              </Button>
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={exportToDashboardCSV}
              >
                Export CSV
              </Button>
            </div>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">{metric.label}</p>
                <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                <p className="text-sm text-white/60 mt-1">{metric.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {networkHighlights.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${item.accent} p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{item.label}</p>
                <Icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500 mt-1">{item.helper}</p>
            </div>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6 md:grid-cols-2">
          {balanceCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-3xl text-white p-8 shadow-xl bg-gradient-to-br ${card.gradient}`}
            >
              <p className="text-sm uppercase tracking-[0.4em] text-white/70">{card.title}</p>
              <p className="mt-4 text-4xl font-semibold">{card.amount}</p>
              <p className="mt-3 text-white/80 text-sm">{card.description}</p>
              <p className="mt-2 text-xs text-white/60">{card.meta}</p>
              <Button
                className="mt-6 bg-white text-gray-900 hover:bg-white/90"
                onClick={card.action}
              >
                {card.button}
              </Button>
            </div>
          ))}
        </div>

        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Spending mix</p>
                <h3 className="text-lg font-semibold text-gray-900">Spending by category</h3>
              </div>
            </div>
            {categoryChartData.length > 0 ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatAmount(totalAmount)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {categoryChartData.slice(0, 3).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {item.name}
                      </div>
                      <span className="font-semibold text-gray-900">{formatAmount(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-sm text-gray-500">
                No categorized activity yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {hasTrendData && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Trend analytics</p>
            <h3 className="text-xl font-semibold text-gray-900">Personal spend velocity</h3>
          </div>
          <TrendAnalytics trends={trendData} expenses={personalExpensesData} />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Live feed</p>
                <h3 className="text-xl font-semibold text-gray-900">Recent activity</h3>
                <p className="text-sm text-gray-500">{timelineItems.length} latest entries</p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={() => onNavigate('activity')}>
                Open timeline
              </Button>
            </div>
            {timelineItems.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-500">
                No recent updates. Invite friends or add expenses to see movement.
              </div>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-4 w-px bg-gray-200" />
                {timelineItems.map((activity, index) => {
                  const categoryInfo = getCategoryInfo(activity.category || 'other')
                  const CategoryIcon = categoryInfo.icon
                  const amountPositive = (activity.amount || 0) >= 0
                  return (
                    <div key={activity.id || index} className="relative pb-6 last:pb-0">
                      <span className="absolute -left-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white p-2 shadow-sm">
                            <CategoryIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{activity.description || 'Expense logged'}</p>
                            <p className="text-xs text-gray-500">{activity.groupName || 'Personal ledger'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${amountPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {amountPositive ? '+' : '-'}{formatAmount(activity.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Shortcut desk</p>
              <h3 className="text-xl font-semibold text-gray-900">Get things done faster</h3>
            </div>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
