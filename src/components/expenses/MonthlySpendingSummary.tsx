import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ShoppingBag, Zap, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface MonthlySpendingSummaryProps {
  expenses: any[]
  budgets: any[]
  stats: any
}

export function MonthlySpendingSummary({ expenses, budgets, stats }: MonthlySpendingSummaryProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  const expensesArray = Array.isArray(expenses) ? expenses : []
  const budgetsArray = Array.isArray(budgets) ? budgets : []
  
  // Filter expenses for current month
  const monthlyExpenses = expensesArray.filter(exp => {
    const expDate = new Date(exp.createdAt)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })

  const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  
  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { amount: number; count: number }> = {}
    monthlyExpenses.forEach(exp => {
      const category = exp.category || 'other'
      if (!breakdown[category]) {
        breakdown[category] = { amount: 0, count: 0 }
      }
      breakdown[category].amount += exp.amount
      breakdown[category].count += 1
    })
    return breakdown
  }, [monthlyExpenses])

  const categoryChartData = Object.entries(categoryBreakdown)
    .map(([category, data]) => {
      const categoryInfo = getCategoryInfo(category)
      return {
        name: categoryInfo.label,
        value: data.amount,
        count: data.count,
        color: categoryInfo.color
      }
    })
    .sort((a, b) => b.value - a.value)

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#84cc16']

  // Budget calculations
  const totalBudget = budgetsArray
    .filter(b => b.month === currentMonth && b.year === currentYear)
    .reduce((sum, b) => sum + b.limit, 0)

  const budgetPercentage = totalBudget > 0 ? (monthlyTotal / totalBudget) * 100 : 0
  const remainingBudget = totalBudget - monthlyTotal

  // Previous month comparison
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const prevMonthExpenses = expensesArray.filter(exp => {
    const expDate = new Date(exp.createdAt)
    return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear
  })
  
  const prevMonthTotal = prevMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const percentageChange = prevMonthTotal > 0 
    ? ((monthlyTotal - prevMonthTotal) / prevMonthTotal) * 100 
    : 0

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']

  // Calculate daily average and projected
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysPassed = now.getDate()
  const dailyAverage = daysPassed > 0 ? monthlyTotal / daysPassed : 0
  const projectedTotal = dailyAverage * daysInMonth

  return (
    <div className="p-6">
      {/* Main Summary Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Monthly Total with Trend */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {monthNames[currentMonth]} Spending
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ৳{monthlyTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                {percentageChange !== 0 && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    percentageChange > 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {percentageChange > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(percentageChange).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {monthlyExpenses.length} transaction{monthlyExpenses.length !== 1 ? 's' : ''} this month
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-medium">Daily Avg</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ৳{dailyAverage.toFixed(0)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Projected</span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ৳{projectedTotal.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Budget Progress */}
          {totalBudget > 0 ? (
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Budget Progress</span>
                </div>
                <span className={`text-sm font-semibold ${
                  budgetPercentage > 100 ? 'text-red-600' : 
                  budgetPercentage > 80 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {budgetPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetPercentage > 100 ? 'bg-red-500' : 
                    budgetPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>৳{monthlyTotal.toFixed(0)} spent</span>
                <span className={remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {remainingBudget >= 0 
                    ? `৳${remainingBudget.toFixed(0)} left` 
                    : `৳${Math.abs(remainingBudget).toFixed(0)} over`}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
              <PiggyBank className="h-5 w-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No budget set for this month</p>
              <p className="text-xs text-gray-400 mt-1">Set a budget to track your spending</p>
            </div>
          )}
        </div>

        {/* Right: Category Breakdown */}
        <div className="lg:w-64 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              By Category
            </p>
            <ShoppingBag className="h-4 w-4 text-gray-400" />
          </div>

          {categoryChartData.length > 0 ? (
            <>
              {/* Pie Chart */}
              <div className="relative h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
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
                    <div className="text-2xl font-bold text-gray-900">{categoryChartData.length}</div>
                    <div className="text-xs text-gray-500">categories</div>
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-2">
                {categoryChartData.slice(0, 4).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ৳{item.value.toFixed(0)}
                    </span>
                  </div>
                ))}
                {categoryChartData.length > 4 && (
                  <button className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-2">
                    <span>+{categoryChartData.length - 4} more</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="h-36 flex items-center justify-center rounded-xl bg-gray-50">
              <div className="text-center">
                <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No expenses yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
