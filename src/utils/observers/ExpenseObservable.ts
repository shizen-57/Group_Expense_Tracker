/**
 * Observer Pattern - Implementation
 * 
 * Implements the Observer pattern for real-time expense updates.
 * Components can subscribe to expense changes and automatically
 * re-render when data changes.
 * 
 * Benefits:
 * - No prop drilling
 * - Automatic UI updates
 * - Loose coupling between components
 * - Single source of truth
 */

export type Observer<T> = (data: T) => void

export interface Expense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  createdAt: string
  paidBy?: string
  notes?: string
}

/**
 * ExpenseObservable (Subject)
 * 
 * Manages a list of observers and notifies them when expenses change
 */
export class ExpenseObservable {
  private observers: Set<Observer<Expense[]>> = new Set()
  private expenses: Expense[] = []
  private lastUpdate: number = Date.now()

  /**
   * Subscribe to expense updates
   * Returns an unsubscribe function
   */
  subscribe(observer: Observer<Expense[]>): () => void {
    this.observers.add(observer)
    
    // Immediately notify the new observer with current data
    observer(this.expenses)
    
    // Return unsubscribe function
    return () => this.unsubscribe(observer)
  }

  /**
   * Unsubscribe from expense updates
   */
  unsubscribe(observer: Observer<Expense[]>): void {
    this.observers.delete(observer)
  }

  /**
   * Notify all observers of changes
   */
  private notify(): void {
    this.lastUpdate = Date.now()
    const expensesCopy = [...this.expenses] // Prevent mutations
    
    this.observers.forEach(observer => {
      try {
        observer(expensesCopy)
      } catch (error) {
        console.error('Error in observer notification:', error)
        // Don't let one observer's error break others
      }
    })
  }

  /**
   * Update the expenses list and notify observers
   */
  updateExpenses(expenses: Expense[]): void {
    this.expenses = expenses
    this.notify()
  }

  /**
   * Add a new expense
   */
  addExpense(expense: Expense): void {
    this.expenses = [...this.expenses, expense]
    this.notify()
  }

  /**
   * Update an existing expense
   */
  updateExpense(id: string, updates: Partial<Expense>): void {
    this.expenses = this.expenses.map(expense =>
      expense.id === id ? { ...expense, ...updates } : expense
    )
    this.notify()
  }

  /**
   * Delete an expense
   */
  deleteExpense(id: string): void {
    this.expenses = this.expenses.filter(expense => expense.id !== id)
    this.notify()
  }

  /**
   * Get current expenses (read-only)
   */
  getExpenses(): readonly Expense[] {
    return this.expenses
  }

  /**
   * Get number of active observers
   */
  getObserverCount(): number {
    return this.observers.size
  }

  /**
   * Get timestamp of last update
   */
  getLastUpdate(): number {
    return this.lastUpdate
  }

  /**
   * Clear all observers (useful for cleanup)
   */
  clearObservers(): void {
    this.observers.clear()
  }
}

// Singleton instance for global expense state
export const expenseObservable = new ExpenseObservable()

/**
 * React Hook for using the expense observable
 */
import { useEffect, useState } from 'react'

export function useExpenseObservable() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to expense updates
    const unsubscribe = expenseObservable.subscribe((newExpenses) => {
      setExpenses(newExpenses)
      setLoading(false)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    expenses,
    loading,
    addExpense: (expense: Expense) => expenseObservable.addExpense(expense),
    updateExpense: (id: string, updates: Partial<Expense>) => 
      expenseObservable.updateExpense(id, updates),
    deleteExpense: (id: string) => expenseObservable.deleteExpense(id),
    refreshExpenses: (expenses: Expense[]) => expenseObservable.updateExpenses(expenses)
  }
}

/**
 * Category-specific observable
 * Observers only notified for expenses in specific categories
 */
export class CategoryExpenseObservable extends ExpenseObservable {
  constructor(private category: string) {
    super()
  }

  private filterByCategory(expenses: Expense[]): Expense[] {
    return expenses.filter(e => e.category === this.category)
  }

  override updateExpenses(expenses: Expense[]): void {
    super.updateExpenses(this.filterByCategory(expenses))
  }
}

/**
 * Date-range observable
 * Observers only notified for expenses within a date range
 */
export class DateRangeExpenseObservable extends ExpenseObservable {
  constructor(private from: Date, private to: Date) {
    super()
  }

  private filterByDateRange(expenses: Expense[]): Expense[] {
    return expenses.filter(e => {
      const expenseDate = new Date(e.createdAt)
      return expenseDate >= this.from && expenseDate <= this.to
    })
  }

  override updateExpenses(expenses: Expense[]): void {
    super.updateExpenses(this.filterByDateRange(expenses))
  }
}
