import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp, TrendingDown, Users, Receipt, DollarSign, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '../ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
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
    a.download = `dashboard-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl">Overview</h1>
        <Button 
          variant="outline" 
          size="icon"
          onClick={exportToDashboardCSV}
          className="rounded-full"
        >
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* This Month */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-gray-600">This Month</div>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl mb-1">৳{(safeStats.monthlyTotal || 0).toFixed(0)}</div>
            <div className="text-xs text-gray-500">{safeStats.monthlyExpensesCount || 0} expenses</div>
          </CardContent>
        </Card>

        {/* Personal Expenses */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-gray-600">Personal</div>
              <Receipt className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl mb-1">{safeStats.personalExpensesCount || 0}</div>
            <div className="text-xs text-gray-500">All expenses</div>
          </CardContent>
        </Card>

        {/* Active Groups */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-gray-600">Active Groups</div>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl mb-1">{safeStats.totalGroups || 0}</div>
            <div className="text-xs text-gray-500">{safeStats.totalFriends || 0} friends</div>
          </CardContent>
        </Card>

        {/* Group Balance */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm text-gray-600">Group Balance</div>
              <TrendingUp className={`h-5 w-5 ${safeStats.totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <div className={`text-2xl mb-1 ${safeStats.totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ৳{Math.abs(safeStats.totalBalance || 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">
              {safeStats.totalBalance >= 0 ? 'Net receiving' : 'Net owing'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* You Are Owed - Hero Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div>
                <div className="text-5xl text-gray-800 mb-2">
                  ৳{stats.totalReceiving.toFixed(0)}
                </div>
                <div className="text-2xl text-gray-700">You Are Owed</div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Money others owe you from shared expenses
              </p>
              
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                onClick={() => onNavigate('friends')}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* You Owe - Hero Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div>
                <div className="text-5xl text-gray-800 mb-2">
                  ৳{stats.totalOwed.toFixed(0)}
                </div>
                <div className="text-2xl text-gray-700">You Owe</div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Money you owe others from shared expenses
              </p>
              
              <Button 
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full"
                onClick={() => onNavigate('friends')}
              >
                Settle Debts
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Donut Chart */}
        {categoryChartData.length > 0 && (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Spending by Category</h3>
              
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl">৳{totalAmount.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {categoryChartData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium">৳{item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Recent Activity</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('activity')}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full"
            >
              View All →
            </Button>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No recent activity</p>
              <p className="text-xs text-gray-500 mt-1">Start by creating a group or adding an expense</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => {
                const categoryInfo = getCategoryInfo(activity.category || 'other')
                const CategoryIcon = categoryInfo.icon
                return (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-gray-200">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.groupName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">৳{activity.amount.toFixed(2)}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
          onClick={() => window.location.reload()}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 mb-3">
              <Receipt className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-medium mb-1">Add Expense</p>
            <p className="text-xs text-gray-500">Track personal spending</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          onClick={() => onNavigate('groups')}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-blue-100 mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="font-medium mb-1">Split with Group</p>
            <p className="text-xs text-gray-500">Share expenses</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          onClick={() => onNavigate('activity')}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-purple-100 mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <p className="font-medium mb-1">View Analytics</p>
            <p className="text-xs text-gray-500">Spending insights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
