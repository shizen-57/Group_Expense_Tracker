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
        <h3 className="font-medium">Budget Management</h3>
        <p className="text-sm text-gray-600">Set spending limits for {monthNames[currentMonth]}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Budget</span>
        </Button>
        <Button 
          onClick={() => setAutoDistributeDialogOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          <span>Auto-Distribute</span>
        </Button>
      </div>

      {currentBudgets.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No budgets set for this month</p>
              <p className="text-sm text-gray-500 mt-1">Create a budget to track your spending</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
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
                className={`border shadow-sm ${
                  isOverBudget 
                    ? 'border-red-200 bg-red-50'
                    : isNearLimit
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-gray-200">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{categoryInfo.label}</p>
                        <p className="text-sm text-gray-600">
                          ৳{spent.toFixed(0)} / ৳{budget.limit.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget ? (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Over Budget</span>
                        </div>
                      ) : isNearLimit ? (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Near Limit</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>On Track</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="rounded-full hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${
                        isOverBudget ? 'bg-red-200' : isNearLimit ? 'bg-yellow-200' : 'bg-gray-200'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{percentage.toFixed(0)}% used</span>
                      <span>৳{Math.max(budget.limit - spent, 0).toFixed(0)} remaining</span>
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
                  className="text-xs rounded-full"
                >
                  {selectedCategories.length === expenseCategories.length ? 'Deselect All' : 'Select All Available'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                {expenseCategories.map((cat) => {
                  const hasExistingBudget = currentBudgets.some(b => b.category === cat.id)
                  const isSelected = selectedCategories.includes(cat.id)
                  const CategoryIcon = cat.icon

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !hasExistingBudget && toggleCategory(cat.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
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
                      <div className="p-2 rounded-lg bg-white border border-gray-200">
                        <CategoryIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cat.label}</p>
                        {hasExistingBudget && (
                          <p className="text-xs text-gray-500">Already exists</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {selectedCategories.length > 0 && (
                <p className="text-sm text-gray-600">
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
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </div>
            </div>

            {distributionPreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div>
                    <p className="font-medium text-emerald-900">
                      {distributionPreview.isDefault ? '📊 Default Distribution' : '🎯 Smart Distribution'}
                    </p>
                    <p className="text-sm text-emerald-700">
                      {distributionPreview.isDefault 
                        ? 'Using balanced defaults for new users'
                        : `Based on ৳${distributionPreview.totalSpent.toFixed(2)} spent over ${distributionPreview.monthsAnalyzed} months`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-emerald-900">
                      ৳{parseFloat(totalBudget).toFixed(0)}
                    </p>
                    <p className="text-xs text-emerald-600">Total Budget</p>
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
                            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                              <CategoryIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{categoryInfo.label}</p>
                              <p className="text-xs text-gray-600">
                                {percentage.toFixed(1)}% of total budget
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">৳{(amount as number).toFixed(0)}</p>
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
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyDistribution}
                disabled={!distributionPreview || loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
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
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
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