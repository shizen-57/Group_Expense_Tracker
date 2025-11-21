import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, PieChart as PieChartIcon, Download, UserCircle2 } from 'lucide-react'
import { Button } from '../ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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
  }
  onNavigate: (page: 'groups' | 'friends' | 'activity') => void
}

export function Dashboard({ stats, onNavigate }: DashboardProps) {
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

  const quickStats = [
    {
      title: 'This Month',
      value: `৳${(safeStats.monthlyTotal || 0).toFixed(2)}`,
      subtitle: `${safeStats.monthlyExpensesCount || 0} expenses`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Personal Expenses',
      value: safeStats.personalExpensesCount || 0,
      subtitle: 'All time',
      icon: Receipt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Group Balance',
      value: `৳${Math.abs(safeStats.totalBalance || 0).toFixed(2)}`,
      subtitle: safeStats.totalBalance >= 0 ? 'Net receiving' : 'Net owing',
      icon: Users,
      color: safeStats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: safeStats.totalBalance >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Active Groups',
      value: safeStats.totalGroups || 0,
      subtitle: `${safeStats.totalFriends || 0} friends`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ]

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

  const COLORS = ['#f97316', '#10b981', '#3b82f6', '#a855f7', '#eab308', '#6366f1', '#06b6d4', '#ec4899', '#ef4444', '#6b7280']
  
  // Calculate total amount for chart
  const totalAmount = recentActivities.reduce((sum, activity) => sum + activity.amount, 0)

  // Export to CSV function
  const exportToDashboardCSV = () => {
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
    a.download = `splitwise-dashboard-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Overview</h2>
          <p className="text-muted-foreground">Your complete financial snapshot</p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportToDashboardCSV}
          className="border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.title === 'Total Balance' && safeStats.totalBalance >= 0
          
          return (
            <Card 
              key={index} 
              className="card-hover border-0 shadow-xl bg-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                    index === 0 ? 'from-emerald-500 to-teal-600' :
                    index === 1 ? 'from-blue-500 to-indigo-600' :
                    index === 2 ? 'from-purple-500 to-pink-600' :
                    'from-orange-500 to-red-600'
                  } shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold mb-1 ${
                    stat.title === 'Total Balance' 
                      ? isPositive ? 'text-emerald-600' : 'text-red-600'
                      : 'text-foreground'
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Balance Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover border-0 shadow-xl bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -mr-20 -mt-20" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-emerald-700">You are owed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-bold text-emerald-600 mb-2">
              ৳{stats.totalReceiving.toFixed(2)}
            </p>
            <p className="text-sm text-emerald-600/70 mb-6">
              Money others owe you
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => onNavigate('friends')}
            >
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-0 shadow-xl bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full -mr-20 -mt-20" />
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <span className="text-red-700">You owe</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="text-5xl font-bold text-red-600 mb-2">
              ৳{stats.totalOwed.toFixed(2)}
            </p>
            <p className="text-sm text-red-600/70 mb-6">
              Money you owe others
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
              onClick={() => onNavigate('friends')}
            >
              Settle Debts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {recentActivities.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Category Breakdown Pie Chart */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <span>Expenses by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `৳${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryChartData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span>৳{item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spending Summary Bar Chart */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span>Top Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChartData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => `৳${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ৳{totalAmount.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span>Recent Activity</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('activity')}
            className="hover:bg-emerald-50 hover:text-emerald-600"
          >
            View All →
          </Button>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-4">
                <Receipt className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Start by creating a group or adding an expense</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => {
                const categoryInfo = getCategoryInfo(activity.category || 'other')
                const CategoryIcon = categoryInfo.icon
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white hover:shadow-md transition-all card-hover border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo.bgColor} shadow-md`}>
                        <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.groupName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{activity.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card 
          className="cursor-pointer card-hover border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group"
          onClick={() => window.location.reload()} // Navigate to expenses
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
              <Receipt className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold mb-2">Add Expense</p>
            <p className="text-sm text-white/80">Track personal spending</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer card-hover border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative group"
          onClick={() => onNavigate('groups')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold mb-2">Split with Group</p>
            <p className="text-sm text-white/80">Share expenses</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer card-hover border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative group"
          onClick={() => onNavigate('activity')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-8 text-center relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
              <PieChartIcon className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold mb-2">View Analytics</p>
            <p className="text-sm text-white/80">Spending insights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}