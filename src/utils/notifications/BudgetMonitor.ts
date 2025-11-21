/**
 * Budget Monitor - Automated Budget Checking
 * 
 * Monitors expenses against budgets and sends alerts when thresholds are reached.
 * Uses Observer Pattern to watch expense changes.
 */

import { NotificationTriggers } from '../../hooks/useNotificationSystem'

export interface Budget {
  id: string
  userId: string
  category: string
  limit: number
  period: 'monthly' | 'weekly' | 'daily'
}

export interface Expense {
  id: string
  userId: string
  amount: number
  category: string
  createdAt: string
}

export class BudgetMonitor {
  private budgets: Budget[] = []
  private expenses: Expense[] = []
  private alertThresholds = [90, 100] // Percentages
  private alertedBudgets: Set<string> = new Set()

  /**
   * Update budgets
   */
  setBudgets(budgets: Budget[]): void {
    this.budgets = budgets
    this.checkAllBudgets()
  }

  /**
   * Update expenses
   */
  setExpenses(expenses: Expense[]): void {
    this.expenses = expenses
    this.checkAllBudgets()
  }

  /**
   * Add new expense and check budgets
   */
  addExpense(expense: Expense): void {
    this.expenses.push(expense)
    this.checkBudget(expense.category)
  }

  /**
   * Check all budgets
   */
  private checkAllBudgets(): void {
    this.budgets.forEach(budget => {
      this.checkBudget(budget.category)
    })
  }

  /**
   * Check specific budget
   */
  private checkBudget(category: string): void {
    const budget = this.budgets.find(b => b.category === category)
    if (!budget) return

    const spent = this.calculateSpent(category, budget.period)
    const percentage = (spent / budget.limit) * 100

    // Check if we need to send alerts
    if (percentage >= 100 && !this.alertedBudgets.has(`${budget.id}-100`)) {
      // Budget exceeded
      NotificationTriggers.budgetExceeded(budget.category, spent, budget.limit)
      this.alertedBudgets.add(`${budget.id}-100`)
    } else if (percentage >= 90 && percentage < 100 && !this.alertedBudgets.has(`${budget.id}-90`)) {
      // Budget alert at 90%
      NotificationTriggers.budgetAlert(budget.category, spent, budget.limit, percentage)
      this.alertedBudgets.add(`${budget.id}-90`)
    }
  }

  /**
   * Calculate spent amount for category and period
   */
  private calculateSpent(category: string, period: Budget['period']): number {
    const now = new Date()
    const relevantExpenses = this.expenses.filter(expense => {
      if (expense.category !== category) return false

      const expenseDate = new Date(expense.createdAt)
      
      switch (period) {
        case 'daily':
          return (
            expenseDate.getDate() === now.getDate() &&
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          )
        
        case 'weekly':
          const weekAgo = new Date(now)
          weekAgo.setDate(now.getDate() - 7)
          return expenseDate >= weekAgo
        
        case 'monthly':
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          )
        
        default:
          return false
      }
    })

    return relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  /**
   * Reset alerts for a budget (useful when budget period resets)
   */
  resetAlerts(budgetId: string): void {
    this.alertedBudgets.delete(`${budgetId}-90`)
    this.alertedBudgets.delete(`${budgetId}-100`)
  }

  /**
   * Reset all alerts
   */
  resetAllAlerts(): void {
    this.alertedBudgets.clear()
  }

  /**
   * Get budget status
   */
  getBudgetStatus(category: string): {
    spent: number
    limit: number
    percentage: number
    status: 'ok' | 'warning' | 'exceeded'
  } | null {
    const budget = this.budgets.find(b => b.category === category)
    if (!budget) return null

    const spent = this.calculateSpent(category, budget.period)
    const percentage = (spent / budget.limit) * 100

    let status: 'ok' | 'warning' | 'exceeded' = 'ok'
    if (percentage >= 100) status = 'exceeded'
    else if (percentage >= 90) status = 'warning'

    return {
      spent,
      limit: budget.limit,
      percentage,
      status
    }
  }
}

/**
 * Singleton budget monitor instance
 */
export const budgetMonitor = new BudgetMonitor()
