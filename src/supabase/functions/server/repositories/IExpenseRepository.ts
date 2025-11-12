/**
 * Repository Pattern - Interface
 * 
 * Defines the contract for expense data access operations.
 * This abstraction allows us to:
 * - Switch database implementations without changing business logic
 * - Mock repositories for testing
 * - Add caching layers transparently
 * - Enforce consistent data access patterns
 */

export interface Expense {
  id: string
  userId: string
  description: string
  amount: number
  category: string
  createdAt: string
  paidBy?: string
  notes?: string
  receiptUrl?: string
}

export interface ExpenseQuery {
  userId?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  searchTerm?: string
}

/**
 * IExpenseRepository Interface
 * 
 * Abstraction layer for all expense-related data operations
 */
export interface IExpenseRepository {
  /**
   * Get all expenses for a user
   */
  getUserExpenses(userId: string): Promise<Expense[]>
  
  /**
   * Get a single expense by ID
   */
  getExpenseById(userId: string, expenseId: string): Promise<Expense | null>
  
  /**
   * Add a new expense
   */
  addExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense>
  
  /**
   * Update an existing expense
   */
  updateExpense(userId: string, expenseId: string, updates: Partial<Expense>): Promise<Expense>
  
  /**
   * Delete an expense
   */
  deleteExpense(userId: string, expenseId: string): Promise<boolean>
  
  /**
   * Query expenses with filters
   */
  queryExpenses(query: ExpenseQuery): Promise<Expense[]>
  
  /**
   * Get expenses by category
   */
  getExpensesByCategory(userId: string, category: string): Promise<Expense[]>
  
  /**
   * Get expenses within date range
   */
  getExpensesByDateRange(userId: string, from: Date, to: Date): Promise<Expense[]>
  
  /**
   * Calculate total spending for a user
   */
  getTotalSpending(userId: string, from?: Date, to?: Date): Promise<number>
  
  /**
   * Search expenses by description
   */
  searchExpenses(userId: string, searchTerm: string): Promise<Expense[]>
}
