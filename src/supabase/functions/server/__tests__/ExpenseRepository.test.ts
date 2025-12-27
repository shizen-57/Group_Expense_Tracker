/**
 * Repository Pattern Tests
 * 
 * Tests for ExpenseRepository implementation
 * Coverage target: >90%
 */

import { ExpenseRepository } from '../repositories/ExpenseRepository.ts'
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

describe('ExpenseRepository', () => {
  let repository: ExpenseRepository
  const mockUserId = 'user123'

  beforeEach(() => {
    repository = new ExpenseRepository()
    jest.clearAllMocks()
  })

  describe('getUserExpenses', () => {
    it('should get user expenses', async () => {
      const mockExpenses = [
        { 
          id: '1', 
          userId: mockUserId, 
          description: 'Lunch', 
          amount: 500, 
          category: 'food', 
          createdAt: '2025-11-01T10:00:00Z' 
        },
        { 
          id: '2', 
          userId: mockUserId, 
          description: 'Coffee', 
          amount: 200, 
          category: 'food', 
          createdAt: '2025-11-02T08:30:00Z' 
        }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const result = await repository.getUserExpenses(mockUserId)
      
      expect(result).toEqual(mockExpenses)
      expect(kv.get).toHaveBeenCalledWith(`user:${mockUserId}:personal_expenses`)
    })

    it('should return empty array for new user', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: null })
      
      const result = await repository.getUserExpenses('newuser')
      
      expect(result).toEqual([])
    })

    it('should cache frequently accessed data', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      // First call - should hit KV store
      await repository.getUserExpenses(mockUserId)
      expect(kv.get).toHaveBeenCalledTimes(1)
      
      // Second call within cache TTL - should hit cache
      await repository.getUserExpenses(mockUserId)
      expect(kv.get).toHaveBeenCalledTimes(1) // Still 1, not 2
    })
  })

  describe('getExpenseById', () => {
    it('should get expense by ID', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: mockUserId, description: 'Coffee', amount: 200, category: 'food', createdAt: '2025-11-02' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const result = await repository.getExpenseById(mockUserId, '1')
      
      expect(result).toEqual(mockExpenses[0])
    })

    it('should return null for non-existent expense ID', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      
      const result = await repository.getExpenseById(mockUserId, 'nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('addExpense', () => {
    it('should add new expense with generated ID', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)
      
      const expense = {
        userId: mockUserId,
        description: 'Dinner',
        amount: 1200,
        category: 'food',
        notes: 'Team dinner'
      }
      
      const result = await repository.addExpense(mockUserId, expense)
      
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('createdAt')
      expect(result.description).toBe('Dinner')
      expect(result.amount).toBe(1200)
      expect(kv.set).toHaveBeenCalled()
    })

    it('should add expense with all optional fields', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)
      
      const expense = {
        userId: mockUserId,
        description: 'Restaurant',
        amount: 2500,
        category: 'food',
        notes: 'Birthday celebration',
        paidBy: 'user456',
        receiptUrl: 'https://example.com/receipt.jpg'
      }
      
      const result = await repository.addExpense(mockUserId, expense)
      
      expect(result.notes).toBe('Birthday celebration')
      expect(result.paidBy).toBe('user456')
      expect(result.receiptUrl).toBe('https://example.com/receipt.jpg')
    })

    it('should throw error for negative amount', async () => {
      const expense = {
        userId: mockUserId,
        description: 'Invalid',
        amount: -100,
        category: 'food'
      }
      
      await expect(
        repository.addExpense(mockUserId, expense)
      ).rejects.toThrow('Expense amount cannot be negative')
    })

    it('should throw error for empty description', async () => {
      const expense = {
        userId: mockUserId,
        description: '   ',
        amount: 100,
        category: 'food'
      }
      
      await expect(
        repository.addExpense(mockUserId, expense)
      ).rejects.toThrow('Expense description cannot be empty')
    })

    it('should throw error for invalid category', async () => {
      const expense = {
        userId: mockUserId,
        description: 'Test',
        amount: 100,
        category: 'invalid_category'
      }
      
      await expect(
        repository.addExpense(mockUserId, expense)
      ).rejects.toThrow('Invalid category')
    })
  })

  describe('updateExpense', () => {
    it('should update existing expense', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)
      
      const updates = { amount: 600, notes: 'Updated amount' }
      const result = await repository.updateExpense(mockUserId, '1', updates)
      
      expect(result.amount).toBe(600)
      expect(result.notes).toBe('Updated amount')
      expect(kv.set).toHaveBeenCalled()
    })

    it('should throw error when updating non-existent expense', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      
      await expect(
        repository.updateExpense(mockUserId, 'nonexistent', { amount: 100 })
      ).rejects.toThrow('Expense nonexistent not found')
    })
  })

  describe('deleteExpense', () => {
    it('should delete expense successfully', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: mockUserId, description: 'Coffee', amount: 200, category: 'food', createdAt: '2025-11-02' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      ;(kv.set as jest.Mock).mockResolvedValue(undefined)
      
      const result = await repository.deleteExpense(mockUserId, '1')
      
      expect(result).toBe(true)
      expect(kv.set).toHaveBeenCalledWith(
        `user:${mockUserId}:personal_expenses`,
        expect.arrayContaining([mockExpenses[1]])
      )
    })

    it('should return false when deleting non-existent expense', async () => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: [] })
      
      const result = await repository.deleteExpense(mockUserId, 'nonexistent')
      
      expect(result).toBe(false)
    })
  })

  describe('queryExpenses', () => {
    const mockExpenses = [
      { id: '1', userId: mockUserId, description: 'Groceries', amount: 2500, category: 'groceries', createdAt: '2025-11-01T10:00:00Z' },
      { id: '2', userId: mockUserId, description: 'Uber', amount: 300, category: 'transport', createdAt: '2025-11-02T15:00:00Z' },
      { id: '3', userId: mockUserId, description: 'Restaurant', amount: 1500, category: 'food', createdAt: '2025-11-03T19:00:00Z', notes: 'Dinner with friends' }
    ]

    beforeEach(() => {
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
    })

    it('should filter by category', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        category: 'food'
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('food')
    })

    it('should filter by date range', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        dateFrom: '2025-11-02T00:00:00Z',
        dateTo: '2025-11-03T23:59:59Z'
      })
      
      expect(result).toHaveLength(2)
      expect(result.map(e => e.id)).toEqual(['2', '3'])
    })

    it('should filter by amount range', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        minAmount: 500,
        maxAmount: 2000
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(1500)
    })

    it('should search by description', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        searchTerm: 'uber'
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('Uber')
    })

    it('should search by notes', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        searchTerm: 'friends'
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].notes).toContain('friends')
    })

    it('should filter with multiple criteria', async () => {
      const result = await repository.queryExpenses({
        userId: mockUserId,
        category: 'food',
        minAmount: 1000,
        searchTerm: 'restaurant'
      })
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('should throw error if userId is missing', async () => {
      await expect(
        repository.queryExpenses({ category: 'food' })
      ).rejects.toThrow('userId is required')
    })
  })

  describe('getExpensesByCategory', () => {
    it('should get expenses by category', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Groceries', amount: 2500, category: 'groceries', createdAt: '2025-11-01' },
        { id: '2', userId: mockUserId, description: 'Restaurant', amount: 1500, category: 'food', createdAt: '2025-11-02' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const result = await repository.getExpensesByCategory(mockUserId, 'groceries')
      
      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('groceries')
    })
  })

  describe('getExpensesByDateRange', () => {
    it('should get expenses within date range', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Old', amount: 100, category: 'food', createdAt: '2025-10-15T10:00:00Z' },
        { id: '2', userId: mockUserId, description: 'Recent', amount: 200, category: 'food', createdAt: '2025-11-05T10:00:00Z' },
        { id: '3', userId: mockUserId, description: 'Also Recent', amount: 300, category: 'food', createdAt: '2025-11-10T10:00:00Z' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const from = new Date('2025-11-01')
      const to = new Date('2025-11-11')
      const result = await repository.getExpensesByDateRange(mockUserId, from, to)
      
      expect(result).toHaveLength(2)
      expect(result.map(e => e.id)).toEqual(['2', '3'])
    })
  })

  describe('getTotalSpending', () => {
    it('should calculate total spending for all expenses', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'A', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: mockUserId, description: 'B', amount: 300, category: 'food', createdAt: '2025-11-02' },
        { id: '3', userId: mockUserId, description: 'C', amount: 1200, category: 'food', createdAt: '2025-11-03' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const result = await repository.getTotalSpending(mockUserId)
      
      expect(result).toBe(2000)
    })

    it('should calculate total spending with date range', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Old', amount: 500, category: 'food', createdAt: '2025-10-01T10:00:00Z' },
        { id: '2', userId: mockUserId, description: 'Recent', amount: 300, category: 'food', createdAt: '2025-11-05T10:00:00Z' },
        { id: '3', userId: mockUserId, description: 'Also Recent', amount: 700, category: 'food', createdAt: '2025-11-10T10:00:00Z' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const from = new Date('2025-11-01')
      const to = new Date('2025-11-11')
      const result = await repository.getTotalSpending(mockUserId, from, to)
      
      expect(result).toBe(1000) // Only recent expenses
    })
  })

  describe('searchExpenses', () => {
    it('should search expenses by description', async () => {
      const mockExpenses = [
        { id: '1', userId: mockUserId, description: 'Coffee at Starbucks', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: mockUserId, description: 'Lunch', amount: 300, category: 'food', createdAt: '2025-11-02' }
      ]
      
      ;(kv.get as jest.Mock).mockResolvedValue({ value: mockExpenses })
      
      const result = await repository.searchExpenses(mockUserId, 'coffee')
      
      expect(result).toHaveLength(1)
      expect(result[0].description).toContain('Coffee')
    })
  })
})
