import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Progress } from '../ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { expenseCategories } from '../groups/ExpenseCategories'
import { getCategoryInfo } from '../groups/ExpenseCategories'

interface BudgetManagerProps {
  budgets: any[]
  expenses: any[]
  onCreateBudget: (data: any) => Promise<any>
  onDeleteBudget: (id: string) => void
}

export function BudgetManager({ budgets, expenses, onCreateBudget, onDeleteBudget }: BudgetManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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
    } catch (error) {
      console.error('Failed to create budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Budget Management</h3>
          <p className="text-muted-foreground">Set spending limits for {monthNames[currentMonth]}</p>
        </div>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {currentBudgets.length === 0 ? (
        <Card className="border-0 shadow-xl">
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
                    ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950'
                    : isNearLimit
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950'
                    : 'bg-white dark:bg-gray-800'
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
                          ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
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
                      <span>${Math.max(budget.limit - spent, 0).toFixed(2)} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
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
