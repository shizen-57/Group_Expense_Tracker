import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
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
  
  // Ensure expenses is an array
  const expensesArray = Array.isArray(expenses) ? expenses : []
  const budgetsArray = Array.isArray(budgets) ? budgets : []
  
  // Filter expenses for current month
  const monthlyExpenses = expensesArray.filter(exp => {
    const expDate = new Date(exp.createdAt)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })

  const monthlyTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  
  // Calculate category breakdown
  const categoryBreakdown: any = {}
  monthlyExpenses.forEach(exp => {
    const category = exp.category || 'other'
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { amount: 0, count: 0 }
    }
    categoryBreakdown[category].amount += exp.amount
    categoryBreakdown[category].count += 1
  })

  const categoryChartData = Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => {
    const categoryInfo = getCategoryInfo(category)
    return {
      name: categoryInfo.label,
      value: data.amount,
      count: data.count,
      color: categoryInfo.color
    }
  }).sort((a, b) => b.value - a.value)

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#6b7280']

  // Calculate total budget for current month
  const totalBudget = budgetsArray
    .filter(b => b.month === currentMonth && b.year === currentYear)
    .reduce((sum, b) => sum + b.limit, 0)

  const budgetPercentage = totalBudget > 0 ? (monthlyTotal / totalBudget) * 100 : 0
  const isOverBudget = budgetPercentage > 100
  const isNearBudget = budgetPercentage > 80 && budgetPercentage <= 100

  // Get previous month data for comparison
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Monthly Total Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full -mr-20 -mt-20" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span>{monthNames[currentMonth]} Spending</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            ৳{monthlyTotal.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 text-sm">
            {percentageChange !== 0 && (
              <div className={`flex items-center gap-1 ${percentageChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {percentageChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(percentageChange).toFixed(1)}% vs last month</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {monthlyExpenses.length} {monthlyExpenses.length === 1 ? 'transaction' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Budget Progress Card */}
      <Card className={`border-0 shadow-xl overflow-hidden relative ${
        isOverBudget 
          ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950'
          : isNearBudget
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950'
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950'
      }`}>
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 ${
          isOverBudget 
            ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20'
            : isNearBudget
            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
            : 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
        }`} />
        <CardHeader className="relative z-10">
          <CardTitle className={`flex items-center gap-2 ${
            isOverBudget 
              ? 'text-red-700 dark:text-red-300'
              : isNearBudget
              ? 'text-yellow-700 dark:text-yellow-300'
              : 'text-blue-700 dark:text-blue-300'
          }`}>
            <div className={`p-2 rounded-xl shadow-lg ${
              isOverBudget
                ? 'bg-gradient-to-br from-red-500 to-orange-600'
                : isNearBudget
                ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              {isOverBudget ? <AlertTriangle className="h-5 w-5 text-white" /> : <DollarSign className="h-5 w-5 text-white" />}
            </div>
            <span>Budget Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {totalBudget > 0 ? (
            <>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{budgetPercentage.toFixed(0)}% used</span>
                  <span className="font-medium">৳{monthlyTotal.toFixed(2)} / ৳{totalBudget.toFixed(2)}</span>
                </div>
                <Progress value={Math.min(budgetPercentage, 100)} className="h-3" />
              </div>
              {isOverBudget && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Over budget by ৳{(monthlyTotal - totalBudget).toFixed(2)}</span>
                </div>
              )}
              {isNearBudget && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Approaching budget limit</span>
                </div>
              )}
              {!isOverBudget && !isNearBudget && (
                <p className="text-sm text-muted-foreground">
                  ৳{(totalBudget - monthlyTotal).toFixed(2)} remaining
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No budget set for this month</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown Chart */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>Top Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `৳${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryChartData.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">৳{item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No expenses this month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
