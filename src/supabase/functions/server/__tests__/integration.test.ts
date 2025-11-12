/**
 * Integration Tests
 * 
 * Tests that verify all patterns work together correctly
 */

import { ExpenseRepository } from '../repositories/ExpenseRepository.ts'
import { ExpenseSplitter, createSplitStrategy } from '../strategies/SplitStrategies.ts'
import * as kv from '../kv_store.tsx'

// Mock KV store
jest.mock('../kv_store.tsx', () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  getByPrefix: jest.fn(),
  mget: jest.fn(),
  mset: jest.fn(),
  mdel: jest.fn()
}))

describe('Integration Tests', () => {
  let repository: ExpenseRepository
  let splitter: ExpenseSplitter

  beforeEach(() => {
    repository = new ExpenseRepository()
    splitter = new ExpenseSplitter()
    jest.clearAllMocks()
  })

  describe('Repository + Strategy Integration', () => {
    it('should create expense via repository and apply split strategy', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      const members = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
        { id: 'user3', name: 'Charlie' }
      ]

      // Create expense
      const expense = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Team Lunch',
        amount: 1500,
        category: 'food'
      })

      // Apply split strategy
      const splits = splitter.split(expense.amount, members)

      expect(expense).toHaveProperty('id')
      expect(expense.amount).toBe(1500)
      expect(splits).toHaveLength(3)
      expect(splits[0].amount).toBe(500)
    })

    it('should use correct split strategy based on expense type', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      const members = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' }
      ]

      // Equal split expense
      const equalExpense = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Movie tickets',
        amount: 1000,
        category: 'entertainment'
      })

      splitter.setStrategy(createSplitStrategy('equal'))
      const equalSplits = splitter.split(equalExpense.amount, members)
      expect(equalSplits[0].amount).toBe(500)

      // Percentage split expense
      const percentageExpense = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Shared apartment',
        amount: 20000,
        category: 'housing'
      })

      splitter.setStrategy(createSplitStrategy('percentage'))
      const percentageSplits = splitter.split(percentageExpense.amount, members, {
        user1: { percentage: 60 },
        user2: { percentage: 40 }
      })
      expect(percentageSplits[0].amount).toBe(12000)
      expect(percentageSplits[1].amount).toBe(8000)
    })
  })

  describe('Data Persistence and Retrieval', () => {
    it('should persist expense and retrieve with filters', async () => {
      const mockExpenses = [
        {
          id: '1',
          userId: 'user1',
          description: 'Groceries',
          amount: 2500,
          category: 'groceries',
          createdAt: '2025-11-01T10:00:00Z'
        },
        {
          id: '2',
          userId: 'user1',
          description: 'Restaurant',
          amount: 1500,
          category: 'food',
          createdAt: '2025-11-02T15:00:00Z'
        }
      ]

      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      // Add first expense
      await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Groceries',
        amount: 2500,
        category: 'groceries'
      })

      // Mock retrieval
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })

      // Query by category
      const foodExpenses = await repository.getExpensesByCategory('user1', 'food')
      expect(foodExpenses).toHaveLength(1)
      expect(foodExpenses[0].category).toBe('food')

      // Query by amount
      const expensiveItems = await repository.queryExpenses({
        userId: 'user1',
        minAmount: 2000
      })
      expect(expensiveItems).toHaveLength(1)
      expect(expensiveItems[0].amount).toBe(2500)
    })
  })

  describe('Complete Expense Flow', () => {
    it('should handle complete expense lifecycle', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      // 1. Create expense
      const expense = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Team Dinner',
        amount: 3000,
        category: 'food',
        notes: 'Project celebration'
      })

      expect(expense).toHaveProperty('id')
      expect(expense.description).toBe('Team Dinner')

      // 2. Apply split strategy
      const members = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
        { id: 'user3', name: 'Charlie' }
      ]

      const splits = splitter.split(expense.amount, members)
      expect(splits).toHaveLength(3)
      expect(splits[0].amount).toBe(1000)

      // 3. Update expense
      const mockExpensesAfterAdd = [expense]
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpensesAfterAdd })

      const updated = await repository.updateExpense('user1', expense.id, {
        amount: 3300,
        notes: 'Updated with tip'
      })

      expect(updated.amount).toBe(3300)
      expect(updated.notes).toBe('Updated with tip')

      // 4. Recalculate splits with new amount
      const newSplits = splitter.split(updated.amount, members)
      expect(newSplits[0].amount).toBe(1100)

      // 5. Delete expense
      const mockExpensesAfterUpdate = [updated]
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpensesAfterUpdate })

      const deleted = await repository.deleteExpense('user1', expense.id)
      expect(deleted).toBe(true)
    })
  })

  describe('Error Handling Across Patterns', () => {
    it('should handle repository errors gracefully', async () => {
      ;(kv.get as jest.Mock).mockRejectedValue(new Error('Database error'))

      await expect(
        repository.getUserExpenses('user1')
      ).rejects.toThrow('Database error')
    })

    it('should validate data at repository level', async () => {
      await expect(
        repository.addExpense('user1', {
          userId: 'user1',
          description: 'Invalid',
          amount: -100,
          category: 'food'
        })
      ).rejects.toThrow('Expense amount cannot be negative')
    })

    it('should validate split strategy data', () => {
      const members = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' }
      ]

      splitter.setStrategy(createSplitStrategy('percentage'))

      expect(() => {
        splitter.split(1000, members, {
          user1: { percentage: 60 },
          user2: { percentage: 30 } // Only 90%
        })
      }).toThrow('Percentages must sum to 100')
    })
  })

  describe('Performance and Caching', () => {
    it('should cache repository queries', async () => {
      const mockExpenses = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]

      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })

      // First call
      await repository.getUserExpenses('user1')
      expect(kv.get).toHaveBeenCalledTimes(1)

      // Second call (should use cache)
      await repository.getUserExpenses('user1')
      expect(kv.get).toHaveBeenCalledTimes(1) // Still 1
    })

    it('should invalidate cache after updates', async () => {
      const mockExpenses = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]

      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      // Initial fetch
      await repository.getUserExpenses('user1')
      expect(kv.get).toHaveBeenCalledTimes(1)

      // Add new expense (should invalidate cache)
      await repository.addExpense('user1', {
        userId: 'user1',
        description: 'New',
        amount: 200,
        category: 'food'
      })

      // Fetch again (should hit KV store)
      await repository.getUserExpenses('user1')
      expect(kv.get).toHaveBeenCalledTimes(2)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle group expense with multiple split strategies', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      const members = [
        { id: 'user1', name: 'Alice' },
        { id: 'user2', name: 'Bob' },
        { id: 'user3', name: 'Charlie' },
        { id: 'user4', name: 'Diana' }
      ]

      // Scenario 1: Equal split for groceries
      const groceries = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Shared groceries',
        amount: 4000,
        category: 'groceries'
      })

      splitter.setStrategy(createSplitStrategy('equal'))
      const grocerySplits = splitter.split(groceries.amount, members)
      expect(grocerySplits.every(s => s.amount === 1000)).toBe(true)

      // Scenario 2: Percentage split for rent
      const rent = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Monthly rent',
        amount: 40000,
        category: 'housing'
      })

      splitter.setStrategy(createSplitStrategy('percentage'))
      const rentSplits = splitter.split(rent.amount, members, {
        user1: { percentage: 30 },
        user2: { percentage: 30 },
        user3: { percentage: 25 },
        user4: { percentage: 15 }
      })

      expect(rentSplits[0].amount).toBe(12000)
      expect(rentSplits[1].amount).toBe(12000)
      expect(rentSplits[2].amount).toBe(10000)
      expect(rentSplits[3].amount).toBe(6000)

      // Scenario 3: Share-based split for utilities
      const utilities = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Utilities',
        amount: 5000,
        category: 'utilities'
      })

      splitter.setStrategy(createSplitStrategy('shares'))
      const utilitySplits = splitter.split(utilities.amount, members, {
        user1: { shares: 2 }, // Has 2 rooms
        user2: { shares: 2 },
        user3: { shares: 1 },
        user4: { shares: 1 }
      })

      expect(utilitySplits[0].amount).toBeCloseTo(1666.67, 0)
    })

    it('should maintain data consistency across operations', async () => {
      const mockExpenses: any[] = []
      
      ;(kv.get as jest.Mock).mockImplementation(() => 
        Promise.resolve({ value: [...mockExpenses] })
      )
      
      ;(kv.set as jest.Mock).mockImplementation((key, value) => {
        mockExpenses.length = 0
        mockExpenses.push(...value)
        return Promise.resolve(undefined)
      })

      // Add multiple expenses
      const expense1 = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Expense 1',
        amount: 100,
        category: 'food'
      })

      const expense2 = await repository.addExpense('user1', {
        userId: 'user1',
        description: 'Expense 2',
        amount: 200,
        category: 'transport'
      })

      // Query should return both
      const allExpenses = await repository.getUserExpenses('user1')
      expect(allExpenses).toHaveLength(2)

      // Calculate total
      const total = await repository.getTotalSpending('user1')
      expect(total).toBe(300)

      // Delete one
      await repository.deleteExpense('user1', expense1.id)

      // Query should return one
      const remaining = await repository.getUserExpenses('user1')
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(expense2.id)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent expense additions', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)

      const promises = Array.from({ length: 5 }, (_, i) =>
        repository.addExpense('user1', {
          userId: 'user1',
          description: `Expense ${i}`,
          amount: 100 * (i + 1),
          category: 'food'
        })
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(5)
      expect(results.every(r => r.id)).toBe(true)
      expect(results.every(r => r.userId === 'user1')).toBe(true)
    })
  })
})
