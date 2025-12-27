import { useMemo } from 'react'
import { Card, CardContent } from '../ui/card'
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, Download, ArrowUpRight, Activity, Wallet, Target, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface DashboardProps {
  stats: {
    totalGroups: number
    totalFriends: number
    totalExpenses: number
    totalBalance: number
    totalOwed: number
    totalReceiving: number
    recentActivity: any[]
    monthlyTotal?: number
    monthlyExpensesCount?: number
    personalExpensesCount?: number
  }
  onNavigate: (page: 'groups' | 'friends' | 'activity' | 'expenses') => void
}

export function Dashboard({ stats, onNavigate }: DashboardProps) {
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

  const recentActivities = Array.isArray(safeStats.recentActivity) ? safeStats.recentActivity : []
  
  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    return recentActivities.reduce((acc: any, activity: any) => {
      const category = activity.category || 'other'
      if (!acc[category]) {
        acc[category] = { category, amount: 0, count: 0 }
      }
      acc[category].amount += activity.amount
      acc[category].count += 1
      return acc
    }, {})
  }, [recentActivities])

  const categoryChartData = Object.values(categoryData).map((item: any) => {
    const info = getCategoryInfo(item.category)
    return {
      name: info.label,
      value: parseFloat(item.amount.toFixed(2)),
      count: item.count,
      color: info.color.replace('text-', '')
    }
  })

  // Weekly spending data for bar chart
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const data = days.map((day, index) => {
      const dayExpenses = recentActivities.filter(a => {
        const date = new Date(a.createdAt)
        return date.getDay() === index
      })
      return {
        day,
        amount: dayExpenses.reduce((sum, a) => sum + (a.amount || 0), 0)
      }
    })
    return data
  }, [recentActivities])

  const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#6b7280']
  const totalAmount = recentActivities.reduce((sum, activity) => sum + (activity.amount || 0), 0)

  const formatAmount = (value?: number) => `৳${Math.abs(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  // Financial health score (simple calculation)
  const healthScore = useMemo(() => {
    const receiving = safeStats.totalReceiving || 0
    const owing = safeStats.totalOwed || 0
    if (receiving === 0 && owing === 0) return 100
    if (owing === 0) return 100
    const ratio = receiving / (receiving + owing)
    return Math.round(ratio * 100)
  }, [safeStats.totalReceiving, safeStats.totalOwed])

  const healthStatus = healthScore >= 70 ? 'excellent' : healthScore >= 40 ? 'good' : 'needs-attention'

  // Quick insights
  const insights = useMemo(() => {
    const items = []
    if (safeStats.totalOwed > 0) {
      items.push({
        type: 'warning',
        icon: AlertCircle,
        message: `You owe ${formatAmount(safeStats.totalOwed)} across groups`,
        action: 'Review debts',
        onClick: () => onNavigate('groups')
      })
    }
    if (safeStats.totalReceiving > safeStats.totalOwed) {
      items.push({
        type: 'success',
        icon: CheckCircle2,
        message: `Net positive: ${formatAmount(safeStats.totalReceiving - safeStats.totalOwed)} in your favor`,
        action: 'View details',
        onClick: () => onNavigate('friends')
      })
    }
    if (safeStats.totalGroups === 0) {
      items.push({
        type: 'info',
        icon: Users,
        message: 'Create your first group to start splitting expenses',
        action: 'Create group',
        onClick: () => onNavigate('groups')
      })
    }
    return items.slice(0, 3)
  }, [safeStats, onNavigate])

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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Hero Section - Financial Overview */}
      <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-emerald-300/80">Financial Overview</p>
              <h1 className="mt-2 text-3xl lg:text-4xl font-bold">Your Money at a Glance</h1>
              <p className="mt-2 text-white/60 max-w-xl">
                Track balances, monitor group expenses, and stay on top of who owes what.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="rounded-full bg-white text-gray-900 hover:bg-white/90"
                onClick={() => onNavigate('expenses')}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/30 text-white hover:bg-white/10"
                onClick={exportToDashboardCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Financial Health Card */}
          <div className="w-full max-w-xs">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60">Financial Health</span>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  healthStatus === 'excellent' ? 'bg-emerald-500/20 text-emerald-300' :
                  healthStatus === 'good' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {healthStatus === 'excellent' ? 'Excellent' : healthStatus === 'good' ? 'Good' : 'Review'}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{healthScore}</span>
                <span className="text-white/60 mb-1">/100</span>
              </div>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    healthStatus === 'excellent' ? 'bg-emerald-400' :
                    healthStatus === 'good' ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Net Balance', value: formatAmount(safeStats.totalBalance), positive: safeStats.totalBalance >= 0 },
            { label: 'You Are Owed', value: formatAmount(safeStats.totalReceiving), positive: true },
            { label: 'You Owe', value: formatAmount(safeStats.totalOwed), positive: false },
            { label: 'This Month', value: formatAmount(safeStats.monthlyTotal), positive: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-white/50 uppercase tracking-wide">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${
                stat.positive ? 'text-emerald-300' : 'text-white'
              }`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <button
                key={index}
                onClick={insight.onClick}
                className={`rounded-2xl p-4 text-left transition-all hover:scale-[1.02] ${
                  insight.type === 'warning' ? 'bg-amber-50 border border-amber-200 hover:border-amber-300' :
                  insight.type === 'success' ? 'bg-emerald-50 border border-emerald-200 hover:border-emerald-300' :
                  'bg-blue-50 border border-blue-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${
                    insight.type === 'warning' ? 'bg-amber-100' :
                    insight.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      insight.type === 'warning' ? 'text-amber-600' :
                      insight.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                    <p className={`text-xs mt-1 ${
                      insight.type === 'warning' ? 'text-amber-600' :
                      insight.type === 'success' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>{insight.action} →</p>
                  </div>
                </div>
              </button>
            )
          })}
        </section>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Spending by Category</h3>
                <p className="text-sm text-gray-500">Based on recent activity</p>
              </div>
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            {categoryChartData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="relative h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatAmount(totalAmount)}</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {categoryChartData.slice(0, 5).map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatAmount(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                No spending data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Weekly Activity</h3>
                <p className="text-sm text-gray-500">Spending pattern this week</p>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: any) => [`৳${value}`, 'Spent']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Quick Actions */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Receipt, label: 'Add Personal Expense', desc: 'Track your spending', onClick: () => onNavigate('expenses') },
                { icon: Users, label: 'View Groups', desc: 'Manage shared expenses', onClick: () => onNavigate('groups') },
                { icon: Wallet, label: 'Friend Balances', desc: 'See who owes what', onClick: () => onNavigate('friends') },
                { icon: Activity, label: 'Activity Feed', desc: 'Recent transactions', onClick: () => onNavigate('activity') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left"
                >
                  <div className="p-2 rounded-lg bg-gray-100">
                    <action.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">{recentActivities.length} recent entries</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('activity')}>
                View all
              </Button>
            </div>
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No recent activity. Start by adding an expense!
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity, index) => {
                  const categoryInfo = getCategoryInfo(activity.category || 'other')
                  const CategoryIcon = categoryInfo.icon
                  return (
                    <div key={activity.id || index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="p-2 rounded-lg bg-white">
                        <CategoryIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.description || 'Expense'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.groupName || 'Personal'} • {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ৳{(activity.amount || 0).toFixed(0)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Active Groups', value: safeStats.totalGroups, color: 'emerald' },
          { icon: Users, label: 'Friends', value: safeStats.totalFriends, color: 'blue' },
          { icon: Receipt, label: 'Personal Expenses', value: safeStats.personalExpensesCount, color: 'purple' },
          { icon: DollarSign, label: 'Total Transactions', value: safeStats.totalExpenses, color: 'orange' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border p-4 bg-${stat.color}-50 border-${stat.color}-100`}>
            <stat.icon className={`h-5 w-5 text-${stat.color}-600 mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
