import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface MonthHistorySelectorProps {
  expenses: any[]
}

export function MonthHistorySelector({ expenses }: MonthHistorySelectorProps) {
  const expensesArray = Array.isArray(expenses) ? expenses : []
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Get available months from expenses
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    expensesArray.forEach(exp => {
      const date = new Date(exp.createdAt)
      months.add(`${date.getFullYear()}-${date.getMonth()}`)
    })
    return months
  }, [expensesArray])
  
  // Filter expenses for selected month
  const monthlyExpenses = useMemo(() => {
    return expensesArray.filter(exp => {
      const expDate = new Date(exp.createdAt)
      return expDate.getMonth() === selectedDate.getMonth() && 
             expDate.getFullYear() === selectedDate.getFullYear()
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [expensesArray, selectedDate])
  
  // Calculate stats for selected month
  const monthStats = useMemo(() => {
    const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const count = monthlyExpenses.length
    const average = count > 0 ? total / count : 0
    
    // Category breakdown
    const categories: Record<string, { amount: number; count: number }> = {}
    monthlyExpenses.forEach(exp => {
      const cat = exp.category || 'other'
      if (!categories[cat]) categories[cat] = { amount: 0, count: 0 }
      categories[cat].amount += exp.amount
      categories[cat].count++
    })
    
    // Sort by amount
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1].amount - a[1].amount)
    
    return { total, count, average, categories: sortedCategories }
  }, [monthlyExpenses])
  
  // Previous month comparison
  const prevMonthStats = useMemo(() => {
    const prevMonth = selectedDate.getMonth() === 0 ? 11 : selectedDate.getMonth() - 1
    const prevYear = selectedDate.getMonth() === 0 ? selectedDate.getFullYear() - 1 : selectedDate.getFullYear()
    
    const prevExpenses = expensesArray.filter(exp => {
      const expDate = new Date(exp.createdAt)
      return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear
    })
    
    const total = prevExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    return { total, count: prevExpenses.length }
  }, [expensesArray, selectedDate])
  
  const percentageChange = prevMonthStats.total > 0 
    ? ((monthStats.total - prevMonthStats.total) / prevMonthStats.total) * 100 
    : 0
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedDate(newDate)
  }
  
  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && 
                         selectedDate.getFullYear() === new Date().getFullYear()
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="space-y-6">
      {/* Month Selector Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Monthly History</h3>
            <p className="text-sm text-gray-500">View expenses by month</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="px-4 py-2 bg-gray-100 rounded-full min-w-[180px] text-center">
            <span className="font-semibold text-gray-900">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
            disabled={isCurrentMonth}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Month Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              ৳{monthStats.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {monthStats.count}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Average</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              ৳{monthStats.average.toFixed(0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {percentageChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <span className="text-xs font-medium text-orange-700">vs Prev Month</span>
            </div>
            <p className={`text-2xl font-bold ${percentageChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Category Breakdown */}
      {monthStats.categories.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthStats.categories.map(([category, data]) => {
                const categoryInfo = getCategoryInfo(category)
                const percentage = monthStats.total > 0 ? (data.amount / monthStats.total) * 100 : 0
                
                return (
                  <div key={category} className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${categoryInfo.color}20` }}
                    >
                      {categoryInfo.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">{categoryInfo.label}</span>
                        <span className="font-semibold text-gray-700">
                          ৳{data.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: categoryInfo.color 
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Expense List for Selected Month */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Expenses in {monthNames[selectedDate.getMonth()]}</span>
            <span className="text-sm font-normal text-gray-500">
              {monthlyExpenses.length} item{monthlyExpenses.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No expenses recorded for this month</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {monthlyExpenses.map((expense, index) => {
                const categoryInfo = getCategoryInfo(expense.category || 'other')
                
                return (
                  <div 
                    key={expense.id || index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${categoryInfo.color}20` }}
                    >
                      {categoryInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(expense.createdAt)} • {categoryInfo.label}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900">
                        ৳{expense.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
