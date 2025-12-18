import { Card, CardContent } from '../ui/card'
import { Progress } from '../ui/progress'
import { TrendingUp, TrendingDown, Calendar, DollarSign, AlertTriangle, Target } from 'lucide-react'
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Monthly Total - Hero Card */}
      <Card className="h-full border-0 shadow-md bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 rounded-[28px]">
        <CardContent className="p-8 lg:p-10 flex flex-col justify-center h-full">
          <div className="space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-600/70">Monthly pulse</p>
              <div className="text-5xl lg:text-6xl text-gray-800 leading-tight mt-4">
                ৳{monthlyTotal.toFixed(0)}
              </div>
              <div className="text-base lg:text-lg text-gray-700 mt-2">{monthNames[currentMonth]} Spending</div>
            </div>

            <div className="flex items-center gap-2">
              {percentageChange !== 0 && (
                <div className={`flex items-center gap-2 text-sm ${percentageChange > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {percentageChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">{Math.abs(percentageChange).toFixed(1)}% vs last month</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600">
              {monthlyExpenses.length} {monthlyExpenses.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Progress */}
      <Card className={`h-full border shadow-sm rounded-[28px] ${
        isOverBudget 
          ? 'border-red-200 bg-red-50'
          : isNearBudget
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}>
        <CardContent className="p-8 lg:p-10 flex flex-col justify-center h-full space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Budget progress</p>
            {isOverBudget ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : isNearBudget ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <Target className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {totalBudget > 0 ? (
            <div className="space-y-4 text-center">
              <div>
                <div className="text-2xl mb-1">{budgetPercentage.toFixed(0)}%</div>
                <div className="text-xs text-gray-500">
                  ৳{monthlyTotal.toFixed(0)} / ৳{totalBudget.toFixed(0)}
                </div>
              </div>
              
              <Progress 
                value={Math.min(budgetPercentage, 100)} 
                className={`h-2 ${
                  isOverBudget ? 'bg-red-200' : isNearBudget ? 'bg-yellow-200' : 'bg-gray-200'
                }`}
              />
              
              {isOverBudget && (
                <p className="text-xs text-red-600">
                  Over budget by ৳{(monthlyTotal - totalBudget).toFixed(0)}
                </p>
              )}
              {isNearBudget && (
                <p className="text-xs text-yellow-600">
                  Approaching budget limit
                </p>
              )}
              {!isOverBudget && !isNearBudget && (
                <p className="text-xs text-gray-500">
                  ৳{(totalBudget - monthlyTotal).toFixed(0)} remaining
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-gray-500">No budget set</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="h-full border border-gray-200 shadow-sm rounded-[28px]">
        <CardContent className="p-8 lg:p-10 flex flex-col justify-center h-full space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Top categories</p>
            <h3 className="font-semibold text-lg mt-2">Where spend concentrates</h3>
          </div>

          {categoryChartData.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={52}
                        paddingAngle={2}
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
                      <div className="text-lg font-semibold">{categoryChartData.length}</div>
                      <div className="text-xs text-gray-500">cats</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No expenses this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
