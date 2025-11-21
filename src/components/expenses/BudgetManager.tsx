import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import { Progress } from '../ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { expenseCategories } from '../groups/ExpenseCategories'
import { getCategoryInfo } from '../groups/ExpenseCategories'
import { toast } from 'sonner@2.0.3'

interface BudgetManagerProps {
  budgets: any[]
  expenses: any[]
  onCreateBudget: (data: any) => Promise<any>
  onDeleteBudget: (id: string) => void
}

export function BudgetManager({ budgets, expenses, onCreateBudget, onDeleteBudget }: BudgetManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [autoDistributeDialogOpen, setAutoDistributeDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalBudget, setTotalBudget] = useState('')
  const [distributionPreview, setDistributionPreview] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [formData, setFormData] = useState({
    category: 'food',
    limit: ''
  })

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Ensure budgets and expenses are arrays
  const budgetsArray = Array.isArray(budgets) ? budgets : []
  const expensesArray = Array.isArray(expenses) ? expenses : []

  // Filter budgets for current month
  const currentBudgets = budgetsArray.filter(
    b => b.month === currentMonth && b.year === currentYear
  )

  // Calculate spending per category for current month
  const monthlyExpenses = expensesArray.filter(exp => {
    const expDate = new Date(exp.createdAt)
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
  })

  const categorySpending: any = {}
  monthlyExpenses.forEach(exp => {
    const category = exp.category || 'other'
    categorySpending[category] = (categorySpending[category] || 0) + exp.amount
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.limit) {
      return
    }

    setLoading(true)
    try {
      await onCreateBudget({
        category: formData.category,
        limit: parseFloat(formData.limit),
        month: currentMonth,
        year: currentYear
      })
      
      setFormData({ category: 'food', limit: '' })
      setDialogOpen(false)
      toast.success('Budget created successfully!')
    } catch (error) {
      console.error('Failed to create budget:', error)
      toast.error('Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  // Default distribution percentages for new users
  const defaultDistribution = {
    food: 0.20,        // 20%
    groceries: 0.10,   // 10%
    housing: 0.15,     // 15%
    utilities: 0.10,   // 10%
    transport: 0.10,   // 10%
    entertainment: 0.10, // 10%
    healthcare: 0.05,  // 5%
    travel: 0.05,      // 5%
    gifts: 0.05,       // 5%
    other: 0.10        // 10% (includes savings & misc)
  }

  // Calculate automated budget distribution
  const calculateDistribution = (total: number, selectedCats: string[]) => {
    const now = new Date()
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    // Get expenses from last 3 months
    const recentExpenses = expensesArray.filter(exp => {
      const expDate = new Date(exp.createdAt)
      return expDate >= threeMonthsAgo && expDate < now
    })

    // If no transaction history, use default distribution
    if (recentExpenses.length === 0) {
      const distribution: any = {}
      
      // Calculate total default percentage for selected categories
      const selectedDefaults = Object.entries(defaultDistribution)
        .filter(([cat]) => selectedCats.includes(cat))
      
      const totalDefaultPercentage = selectedDefaults.reduce((sum, [_, pct]) => sum + pct, 0)
      
      // Normalize percentages to sum to 1 for selected categories
      selectedCats.forEach(category => {
        const defaultPct = defaultDistribution[category as keyof typeof defaultDistribution] || 0
        const normalizedPct = totalDefaultPercentage > 0 ? defaultPct / totalDefaultPercentage : 1 / selectedCats.length
        distribution[category] = total * normalizedPct
      })
      
      return {
        distribution,
        isDefault: true,
        monthsAnalyzed: 0,
        selectedCategories: selectedCats
      }
    }

    // Calculate category totals from last 3 months for selected categories only
    const categoryTotals: any = {}
    recentExpenses.forEach(exp => {
      const category = exp.category || 'other'
      if (selectedCats.includes(category)) {
        categoryTotals[category] = (categoryTotals[category] || 0) + exp.amount
      }
    })

    // Calculate total spending for selected categories
    const totalSpent = Object.values(categoryTotals).reduce((sum: number, amount: any) => sum + amount, 0) as number

    // Distribute budget proportionally based on historical spending
    const distribution: any = {}
    
    if (totalSpent > 0) {
      // Distribute based on historical proportions for selected categories
      selectedCats.forEach(category => {
        if (categoryTotals[category]) {
          const proportion = categoryTotals[category] / totalSpent
          distribution[category] = total * proportion
        } else {
          // For selected categories with no history, distribute evenly from remaining budget
          distribution[category] = 0
        }
      })
      
      // Handle categories with no spending history - use default distribution
      const categoriesWithoutHistory = selectedCats.filter(cat => !categoryTotals[cat])
      if (categoriesWithoutHistory.length > 0) {
        const spentBudget = Object.values(distribution).reduce((sum: number, amt: any) => sum + amt, 0) as number
        const remainingBudget = total - spentBudget
        
        // Calculate total default percentage for categories without history
        const totalDefaultPct = categoriesWithoutHistory.reduce((sum, cat) => {
          return sum + (defaultDistribution[cat as keyof typeof defaultDistribution] || 0)
        }, 0)
        
        // Distribute remaining budget using default ratios
        categoriesWithoutHistory.forEach(cat => {
          const defaultPct = defaultDistribution[cat as keyof typeof defaultDistribution] || (1 / categoriesWithoutHistory.length)
          const normalizedPct = totalDefaultPct > 0 ? defaultPct / totalDefaultPct : 1 / categoriesWithoutHistory.length
          distribution[cat] = remainingBudget * normalizedPct
        })
      }
    } else {
      // No spending history for selected categories - use default distribution
      const totalDefaultPct = selectedCats.reduce((sum, cat) => {
        return sum + (defaultDistribution[cat as keyof typeof defaultDistribution] || 0)
      }, 0)
      
      selectedCats.forEach(category => {
        const defaultPct = defaultDistribution[category as keyof typeof defaultDistribution] || (1 / selectedCats.length)
        const normalizedPct = totalDefaultPct > 0 ? defaultPct / totalDefaultPct : 1 / selectedCats.length
        distribution[category] = total * normalizedPct
      })
    }

    return {
      distribution,
      isDefault: false,
      monthsAnalyzed: 3,
      totalSpent,
      expenseCount: recentExpenses.length,
      selectedCategories: selectedCats
    }
  }

  const handleCalculateDistribution = () => {
    const total = parseFloat(totalBudget)
    if (isNaN(total) || total <= 0) {
      toast.error('Please enter a valid total budget amount')
      return
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category')
      return
    }

    // Check for existing budgets in selected categories
    const existingCategoryBudgets = currentBudgets
      .filter(b => selectedCategories.includes(b.category))
      .map(b => getCategoryInfo(b.category).label)

    if (existingCategoryBudgets.length > 0) {
      toast.error(`Budgets already exist for: ${existingCategoryBudgets.join(', ')}. Please remove them first or deselect these categories.`)
      return
    }

    const result = calculateDistribution(total, selectedCategories)
    setDistributionPreview(result)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleAllCategories = () => {
    const availableCategories = getAvailableCategories().map(cat => cat.id)
    if (selectedCategories.length === availableCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(availableCategories)
    }
  }

  const getAvailableCategories = () => {
    const existingCategoryIds = currentBudgets.map(b => b.category)
    return expenseCategories.filter(cat => !existingCategoryIds.includes(cat.id))
  }

  const handleApplyDistribution = async () => {
    if (!distributionPreview) return

    setLoading(true)
    try {
      // Create budgets for all categories with non-zero amounts
      const promises = Object.entries(distributionPreview.distribution).map(([category, amount]) => {
        if ((amount as number) > 0) {
          return onCreateBudget({
            category,
            limit: amount as number,
            month: currentMonth,
            year: currentYear
          })
        }
        return Promise.resolve()
      })

      await Promise.all(promises)
      
      toast.success(`Successfully created budgets for ${Object.keys(distributionPreview.distribution).filter(k => (distributionPreview.distribution[k] as number) > 0).length} categories!`)
      setAutoDistributeDialogOpen(false)
      setTotalBudget('')
      setDistributionPreview(null)
    } catch (error) {
      console.error('Failed to create budgets:', error)
      toast.error('Failed to create budgets')
    } finally {
      setLoading(false)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Budget Management</h3>
        <p className="text-muted-foreground">Set spending limits for {monthNames[currentMonth]}</p>
      </div>

      {/* Action Buttons - Prominent at Top */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => setDialogOpen(true)}
          className="h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span>Add Budget</span>
        </Button>
        <Button 
          onClick={() => setAutoDistributeDialogOpen(true)}
          className="h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          <span>Auto-Distribute</span>
        </Button>
      </div>

      {currentBudgets.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-4">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No budgets set for this month</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Create a budget to track your spending</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {currentBudgets.map((budget) => {
            const spent = categorySpending[budget.category] || 0
            const percentage = (spent / budget.limit) * 100
            const isOverBudget = percentage > 100
            const isNearLimit = percentage > 80 && percentage <= 100
            const categoryInfo = getCategoryInfo(budget.category)
            const CategoryIcon = categoryInfo.icon

            return (
              <Card 
                key={budget.id}
                className={`border-0 shadow-lg ${
                  isOverBudget 
                    ? 'bg-gradient-to-br from-red-50 to-orange-50'
                    : isNearLimit
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                    : 'bg-white'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${categoryInfo.bgColor}`}>
                        <CategoryIcon className={`h-6 w-6 ${categoryInfo.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{categoryInfo.label}</p>
                        <p className="text-sm text-muted-foreground">
                          ৳{spent.toFixed(2)} / ৳{budget.limit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget ? (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Over Budget</span>
                        </div>
                      ) : isNearLimit ? (
                        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Near Limit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">On Track</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>৳{Math.max(budget.limit - spent, 0).toFixed(2)} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Auto-Distribute Dialog */}
      <Dialog open={autoDistributeDialogOpen} onOpenChange={(open) => {
        setAutoDistributeDialogOpen(open)
        if (!open) {
          setTotalBudget('')
          setDistributionPreview(null)
          setSelectedCategories([])
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Auto-Distribute Budget
            </DialogTitle>
            <DialogDescription>
              Select categories, enter your total monthly budget, and we'll automatically distribute it
              {distributionPreview && (distributionPreview.isDefault 
                ? " using smart defaults (no transaction history found)"
                : ` based on your last 3 months of spending (${distributionPreview.expenseCount} transactions analyzed)`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Select Categories *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllCategories}
                  className="text-xs"
                >
                  {selectedCategories.length === expenseCategories.length ? 'Deselect All' : 'Select All Available'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg max-h-64 overflow-y-auto">
                {expenseCategories.map((cat) => {
                  const hasExistingBudget = currentBudgets.some(b => b.category === cat.id)
                  const isSelected = selectedCategories.includes(cat.id)
                  const CategoryIcon = cat.icon

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !hasExistingBudget && toggleCategory(cat.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        hasExistingBudget
                          ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={hasExistingBudget}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                        <CategoryIcon className={`h-4 w-4 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat.label}</p>
                        {hasExistingBudget && (
                          <p className="text-xs text-muted-foreground">Already exists</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {selectedCategories.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Monthly Budget *</Label>
              <div className="flex gap-2">
                <Input
                  id="totalBudget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="50000.00"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCalculateDistribution}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </div>
            </div>

            {distributionPreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <p className="font-medium text-emerald-900 dark:text-emerald-100">
                      {distributionPreview.isDefault ? '📊 Default Distribution' : '🎯 Smart Distribution'}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {distributionPreview.isDefault 
                        ? 'Using balanced defaults for new users'
                        : `Based on ৳${distributionPreview.totalSpent.toFixed(2)} spent over ${distributionPreview.monthsAnalyzed} months`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-emerald-900 dark:text-emerald-100">
                      ৳{parseFloat(totalBudget).toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Budget</p>
                  </div>
                </div>

                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {Object.entries(distributionPreview.distribution)
                    .filter(([_, amount]) => (amount as number) > 0)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([category, amount]) => {
                      const categoryInfo = getCategoryInfo(category)
                      const CategoryIcon = categoryInfo.icon
                      const percentage = ((amount as number) / parseFloat(totalBudget)) * 100

                      return (
                        <div 
                          key={category}
                          className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                              <CategoryIcon className={`h-5 w-5 ${categoryInfo.color}`} />
                            </div>
                            <div>
                              <p className="font-medium">{categoryInfo.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {percentage.toFixed(1)}% of total budget
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">৳{(amount as number).toFixed(2)}</p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAutoDistributeDialogOpen(false)
                  setTotalBudget('')
                  setDistributionPreview(null)
                  setSelectedCategories([])
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyDistribution}
                disabled={!distributionPreview || loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                {loading ? 'Creating...' : 'Apply Distribution'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>
              Set a spending limit for a specific category to help manage your finances.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Monthly Limit *</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {loading ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}