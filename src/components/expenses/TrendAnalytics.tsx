import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react'

interface TrendAnalyticsProps {
  trends: any
  expenses: any[]
}

export function TrendAnalytics({ trends, expenses }: TrendAnalyticsProps) {
  // Ensure expenses is an array and trends is an object
  const expensesArray = Array.isArray(expenses) ? expenses : []
  const trendsData = trends && typeof trends === 'object' ? trends : {}
  
  // Prepare data for charts
  const monthlyData = Object.entries(trendsData).map(([month, data]: [string, any]) => ({
    month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
    total: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0
  }))

  // Calculate trend
  const firstMonth = monthlyData[0]?.total || 0
  const lastMonth = monthlyData[monthlyData.length - 1]?.total || 0
  const percentageChange = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0

  // Category trends over time
  const categoryTrendData: any[] = []
  const allCategories = new Set<string>()
  
  Object.values(trendsData).forEach((monthData: any) => {
    Object.keys(monthData.categories || {}).forEach(cat => allCategories.add(cat))
  })

  Object.entries(trendsData).forEach(([month, data]: [string, any]) => {
    const entry: any = {
      month: month.split('-')[1] + '/' + month.split('-')[0].slice(2)
    }
    allCategories.forEach(cat => {
      entry[cat] = (data.categories && data.categories[cat]) || 0
    })
    categoryTrendData.push(entry)
  })

  // Daily spending pattern (last 30 days)
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  const dailySpending = last30Days.map(dateStr => {
    const dayExpenses = expensesArray.filter(exp => 
      exp.createdAt.split('T')[0] === dateStr
    )
    return {
      date: dateStr.slice(5),
      amount: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      count: dayExpenses.length
    }
  })

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4']

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Spending Trends & Analytics</h3>
        <p className="text-muted-foreground">Detailed insights into your spending patterns</p>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span>6-Month Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {percentageChange > 0 ? 'Increase' : 'Decrease'} in spending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span>Average Per Transaction</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  ${expenses.length > 0 
                    ? (expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2)
                    : '0.00'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {expenses.length} transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Spending Trend */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span>Monthly Spending Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `৳${value.toFixed(2)}`} />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Total: ৳{monthlyData.reduce((sum, m) => sum + m.total, 0).toFixed(2)} over {monthlyData.length} months
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Spending Pattern (Last 30 Days) */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span>Daily Spending (Last 30 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip formatter={(value: any) => `৳${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Count Trend */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>Transaction Volume</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" name="Transactions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
