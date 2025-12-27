/**
 * Repository Pattern - Concrete Implementation
 * 
 * Implements IExpenseRepository using Supabase KV Store.
 * This can be easily swapped for SQL, MongoDB, or any other storage.
 */

import * as kv from '../kv_store.tsx'
import { IExpenseRepository, Expense, ExpenseQuery } from './IExpenseRepository.ts'

export class ExpenseRepository implements IExpenseRepository {
  // Cache for frequently accessed data
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private readonly CACHE_TTL = 60000 // 1 minute

  /**
   * Get cached data or fetch from KV store
   */
  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T
    }
    
    const data = await fetcher()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }

  /**
   * Invalidate cache for a specific key
   */
  private invalidateCache(userId: string) {
    this.cache.delete(`user:${userId}:expenses`)
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomUUID()
  }

  /**
   * Get all expenses for a user
   */
  async getUserExpenses(userId: string): Promise<Expense[]> {
    return this.getCached(`user:${userId}:expenses`, async () => {
      const result = await kv.get(`user:${userId}:personal_expenses`)
      return result?.value || []
    })
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(userId: string, expenseId: string): Promise<Expense | null> {
    const expenses = await this.getUserExpenses(userId)
    return expenses.find(e => e.id === expenseId) || null
  }

  /**
   * Add a new expense
   */
  async addExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    this.validateExpense(expense)
    
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      userId,
      createdAt: new Date().toISOString()
    }
    
    const expenses = await this.getUserExpenses(userId)
    expenses.push(newExpense)
    
    await kv.set(`user:${userId}:personal_expenses`, expenses)
    this.invalidateCache(userId)
    
    return newExpense
  }

  /**
   * Update an existing expense
   */
  async updateExpense(userId: string, expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    const expenses = await this.getUserExpenses(userId)
    const index = expenses.findIndex(e => e.id === expenseId)
    
    if (index === -1) {
      throw new Error(`Expense ${expenseId} not found`)
    }
    
    expenses[index] = { ...expenses[index], ...updates }
    this.validateExpense(expenses[index])
    
    await kv.set(`user:${userId}:personal_expenses`, expenses)
    this.invalidateCache(userId)
    
    return expenses[index]
  }

  /**
   * Delete an expense
   */
  async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    const expenses = await this.getUserExpenses(userId)
    const filteredExpenses = expenses.filter(e => e.id !== expenseId)
    
    if (filteredExpenses.length === expenses.length) {
      return false // Expense not found
    }
    
    await kv.set(`user:${userId}:personal_expenses`, filteredExpenses)
    this.invalidateCache(userId)
    
    return true
  }

  /**
   * Query expenses with filters
   */
  async queryExpenses(query: ExpenseQuery): Promise<Expense[]> {
    if (!query.userId) {
      throw new Error('userId is required for expense queries')
    }
    
    let expenses = await this.getUserExpenses(query.userId)
    
    // Apply filters
    if (query.category) {
      expenses = expenses.filter(e => e.category === query.category)
    }
    
    if (query.dateFrom) {
      const fromDate = new Date(query.dateFrom)
      expenses = expenses.filter(e => new Date(e.createdAt) >= fromDate)
    }
    
    if (query.dateTo) {
      const toDate = new Date(query.dateTo)
      expenses = expenses.filter(e => new Date(e.createdAt) <= toDate)
    }
    
    if (query.minAmount !== undefined) {
      expenses = expenses.filter(e => e.amount >= query.minAmount!)
    }
    
    if (query.maxAmount !== undefined) {
      expenses = expenses.filter(e => e.amount <= query.maxAmount!)
    }
    
    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase()
      expenses = expenses.filter(e => 
        e.description.toLowerCase().includes(term) ||
        e.notes?.toLowerCase().includes(term)
      )
    }
    
    return expenses
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    return this.queryExpenses({ userId, category })
  }

  /**
   * Get expenses within date range
   */
  async getExpensesByDateRange(userId: string, from: Date, to: Date): Promise<Expense[]> {
    return this.queryExpenses({ 
      userId, 
      dateFrom: from.toISOString(), 
      dateTo: to.toISOString() 
    })
  }

  /**
   * Calculate total spending for a user
   */
  async getTotalSpending(userId: string, from?: Date, to?: Date): Promise<number> {
    let expenses: Expense[]
    
    if (from && to) {
      expenses = await this.getExpensesByDateRange(userId, from, to)
    } else {
      expenses = await this.getUserExpenses(userId)
    }
    
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  /**
   * Search expenses by description
   */
  async searchExpenses(userId: string, searchTerm: string): Promise<Expense[]> {
    return this.queryExpenses({ userId, searchTerm })
  }

  /**
   * Validate expense data
   */
  private validateExpense(expense: Partial<Expense>) {
    if (expense.amount !== undefined && expense.amount < 0) {
      throw new Error('Expense amount cannot be negative')
    }
    
    if (expense.description && expense.description.trim().length === 0) {
      throw new Error('Expense description cannot be empty')
    }
    
    if (expense.category) {
      const validCategories = [
        'food', 'groceries', 'transport', 'entertainment', 
        'utilities', 'housing', 'travel', 'gifts', 'healthcare', 'other'
      ]
      if (!validCategories.includes(expense.category)) {
        throw new Error(`Invalid category: ${expense.category}`)
      }
    }
  }
}

// Singleton instance
export const expenseRepository = new ExpenseRepository()
