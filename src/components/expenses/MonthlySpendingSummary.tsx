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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Total - Hero Card */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50">
        <CardContent className="p-8">
          <div className="space-y-4">
            <div>
              <div className="text-5xl text-gray-800 mb-2">
                ৳{monthlyTotal.toFixed(0)}
              </div>
              <div className="text-2xl text-gray-700">{monthNames[currentMonth]} Spending</div>
            </div>
            
            <div className="flex items-center gap-2">
              {percentageChange !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${percentageChange > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {percentageChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(percentageChange).toFixed(1)}% vs last month</span>
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
      <Card className={`border shadow-sm ${
        isOverBudget 
          ? 'border-red-200 bg-red-50'
          : isNearBudget
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-sm text-gray-600">Budget Progress</div>
            {isOverBudget ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : isNearBudget ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <Target className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {totalBudget > 0 ? (
            <div className="space-y-3">
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
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No budget set</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">Top Categories</h3>
          
          {categoryChartData.length > 0 ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
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
                      <div className="text-xl">{categoryChartData.length}</div>
                      <div className="text-xs text-gray-500">cats</div>
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
