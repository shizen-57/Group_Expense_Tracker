/**
 * Observer Pattern Tests
 * 
 * Tests for ExpenseObservable implementation
 * Coverage target: >90%
 */

import { 
  ExpenseObservable, 
  CategoryExpenseObservable, 
  DateRangeExpenseObservable,
  Expense 
} from '../ExpenseObservable.ts'

describe('ExpenseObservable', () => {
  let observable: ExpenseObservable

  beforeEach(() => {
    observable = new ExpenseObservable()
  })

  afterEach(() => {
    observable.clearObservers()
  })

  describe('Subscription Management', () => {
    it('should create observable instance', () => {
      expect(observable).toBeInstanceOf(ExpenseObservable)
      expect(observable.getObserverCount()).toBe(0)
    })

    it('should subscribe observer', () => {
      const observer = jest.fn()
      
      observable.subscribe(observer)
      
      expect(observable.getObserverCount()).toBe(1)
    })

    it('should notify observer immediately on subscribe', () => {
      const observer = jest.fn()
      
      observable.subscribe(observer)
      
      // Should be notified immediately with empty array
      expect(observer).toHaveBeenCalledWith([])
      expect(observer).toHaveBeenCalledTimes(1)
    })

    it('should unsubscribe observer', () => {
      const observer = jest.fn()
      const unsubscribe = observable.subscribe(observer)
      
      expect(observable.getObserverCount()).toBe(1)
      
      unsubscribe()
      
      expect(observable.getObserverCount()).toBe(0)
    })

    it('should not notify unsubscribed observers', () => {
      const observer = jest.fn()
      const unsubscribe = observable.subscribe(observer)
      
      observer.mockClear()
      unsubscribe()
      
      // Update should not trigger observer
      observable.updateExpenses([
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ])
      
      expect(observer).not.toHaveBeenCalled()
    })

    it('should notify all active observers', () => {
      const observer1 = jest.fn()
      const observer2 = jest.fn()
      const observer3 = jest.fn()
      
      observable.subscribe(observer1)
      observable.subscribe(observer2)
      observable.subscribe(observer3)
      
      observer1.mockClear()
      observer2.mockClear()
      observer3.mockClear()
      
      const expenses = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]
      observable.updateExpenses(expenses)
      
      expect(observer1).toHaveBeenCalledWith(expenses)
      expect(observer2).toHaveBeenCalledWith(expenses)
      expect(observer3).toHaveBeenCalledWith(expenses)
    })

    it('should handle multiple observers', () => {
      const observers = Array.from({ length: 10 }, () => jest.fn())
      
      observers.forEach(obs => observable.subscribe(obs))
      
      expect(observable.getObserverCount()).toBe(10)
      
      observers.forEach(obs => obs.mockClear())
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]
      observable.updateExpenses(expenses)
      
      observers.forEach(obs => {
        expect(obs).toHaveBeenCalledWith(expenses)
      })
    })

    it('should pass correct data to observers', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: 'user1', description: 'Coffee', amount: 200, category: 'food', createdAt: '2025-11-02' }
      ]
      
      observable.updateExpenses(expenses)
      
      expect(observer).toHaveBeenCalledWith(expenses)
    })

    it('should pass copy of data to prevent mutations', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      
      const expense: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      observable.addExpense(expense)
      
      const receivedData = observer.mock.calls[1][0] // [1] because [0] is initial empty call
      receivedData[0].amount = 999 // Try to mutate
      
      // Original should not be affected
      expect(observable.getExpenses()[0].amount).toBe(500)
    })

    it('should handle observer errors gracefully', () => {
      const errorObserver = jest.fn(() => {
        throw new Error('Observer error')
      })
      const goodObserver = jest.fn()
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      
      observable.subscribe(errorObserver)
      observable.subscribe(goodObserver)
      
      errorObserver.mockClear()
      goodObserver.mockClear()
      
      // Should not throw
      expect(() => {
        observable.updateExpenses([])
      }).not.toThrow()
      
      // Good observer should still be notified
      expect(goodObserver).toHaveBeenCalled()
      
      // Error should be logged
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })

    it('should clear all observers', () => {
      const observer1 = jest.fn()
      const observer2 = jest.fn()
      
      observable.subscribe(observer1)
      observable.subscribe(observer2)
      
      expect(observable.getObserverCount()).toBe(2)
      
      observable.clearObservers()
      
      expect(observable.getObserverCount()).toBe(0)
    })
  })

  describe('Expense Operations', () => {
    it('should update expenses and notify', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]
      
      observable.updateExpenses(expenses)
      
      expect(observer).toHaveBeenCalledTimes(1)
      expect(observer).toHaveBeenCalledWith(expenses)
    })

    it('should add expense and notify', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      const expense: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      observable.addExpense(expense)
      
      expect(observer).toHaveBeenCalledTimes(1)
      expect(observer).toHaveBeenCalledWith([expense])
    })

    it('should update single expense and notify', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      
      const expense: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      observable.addExpense(expense)
      observer.mockClear()
      
      observable.updateExpense('1', { amount: 600, notes: 'Updated' })
      
      expect(observer).toHaveBeenCalledTimes(1)
      const updatedExpenses = observer.mock.calls[0][0]
      expect(updatedExpenses[0].amount).toBe(600)
      expect(updatedExpenses[0].notes).toBe('Updated')
    })

    it('should not update non-existent expense', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      observable.updateExpense('nonexistent', { amount: 999 })
      
      // Should still notify but with no changes
      expect(observer).toHaveBeenCalledTimes(1)
      expect(observer).toHaveBeenCalledWith([])
    })

    it('should delete expense and notify', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      
      const expense: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      observable.addExpense(expense)
      observer.mockClear()
      
      observable.deleteExpense('1')
      
      expect(observer).toHaveBeenCalledWith([])
    })

    it('should handle deleting non-existent expense', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      observable.deleteExpense('nonexistent')
      
      // Should still notify
      expect(observer).toHaveBeenCalled()
    })

    it('should handle multiple expense additions', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      const expense1: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      const expense2: Expense = {
        id: '2',
        userId: 'user1',
        description: 'Coffee',
        amount: 200,
        category: 'food',
        createdAt: '2025-11-02'
      }
      
      observable.addExpense(expense1)
      observable.addExpense(expense2)
      
      expect(observer).toHaveBeenCalledTimes(2)
      
      const finalExpenses = observable.getExpenses()
      expect(finalExpenses).toHaveLength(2)
    })
  })

  describe('Metadata', () => {
    it('should track observer count', () => {
      expect(observable.getObserverCount()).toBe(0)
      
      const unsub1 = observable.subscribe(jest.fn())
      expect(observable.getObserverCount()).toBe(1)
      
      const unsub2 = observable.subscribe(jest.fn())
      expect(observable.getObserverCount()).toBe(2)
      
      unsub1()
      expect(observable.getObserverCount()).toBe(1)
      
      unsub2()
      expect(observable.getObserverCount()).toBe(0)
    })

    it('should track last update timestamp', () => {
      const before = Date.now()
      observable.updateExpenses([])
      const after = Date.now()
      
      const lastUpdate = observable.getLastUpdate()
      expect(lastUpdate).toBeGreaterThanOrEqual(before)
      expect(lastUpdate).toBeLessThanOrEqual(after)
    })

    it('should update timestamp on each change', async () => {
      observable.updateExpenses([])
      const firstUpdate = observable.getLastUpdate()
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10))
      
      observable.updateExpenses([])
      const secondUpdate = observable.getLastUpdate()
      
      expect(secondUpdate).toBeGreaterThan(firstUpdate)
    })

    it('should return read-only expenses', () => {
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Test', amount: 100, category: 'food', createdAt: '2025-11-01' }
      ]
      
      observable.updateExpenses(expenses)
      
      const retrieved = observable.getExpenses()
      expect(retrieved).toEqual(expenses)
    })
  })

  describe('CategoryExpenseObservable', () => {
    it('should filter by category', () => {
      const categoryObservable = new CategoryExpenseObservable('food')
      const observer = jest.fn()
      
      categoryObservable.subscribe(observer)
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' },
        { id: '2', userId: 'user1', description: 'Uber', amount: 300, category: 'transport', createdAt: '2025-11-02' },
        { id: '3', userId: 'user1', description: 'Coffee', amount: 200, category: 'food', createdAt: '2025-11-03' }
      ]
      
      categoryObservable.updateExpenses(expenses)
      
      const notifiedExpenses = observer.mock.calls[0][0]
      expect(notifiedExpenses).toHaveLength(2)
      expect(notifiedExpenses.every((e: Expense) => e.category === 'food')).toBe(true)
    })

    it('should notify with empty array when no matches', () => {
      const categoryObservable = new CategoryExpenseObservable('entertainment')
      const observer = jest.fn()
      
      categoryObservable.subscribe(observer)
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Lunch', amount: 500, category: 'food', createdAt: '2025-11-01' }
      ]
      
      categoryObservable.updateExpenses(expenses)
      
      expect(observer).toHaveBeenCalledWith([])
    })
  })

  describe('DateRangeExpenseObservable', () => {
    it('should filter by date range', () => {
      const from = new Date('2025-11-01')
      const to = new Date('2025-11-05')
      const dateRangeObservable = new DateRangeExpenseObservable(from, to)
      const observer = jest.fn()
      
      dateRangeObservable.subscribe(observer)
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Old', amount: 100, category: 'food', createdAt: '2025-10-30T10:00:00Z' },
        { id: '2', userId: 'user1', description: 'In Range 1', amount: 200, category: 'food', createdAt: '2025-11-02T10:00:00Z' },
        { id: '3', userId: 'user1', description: 'In Range 2', amount: 300, category: 'food', createdAt: '2025-11-04T10:00:00Z' },
        { id: '4', userId: 'user1', description: 'New', amount: 400, category: 'food', createdAt: '2025-11-10T10:00:00Z' }
      ]
      
      dateRangeObservable.updateExpenses(expenses)
      
      const notifiedExpenses = observer.mock.calls[0][0]
      expect(notifiedExpenses).toHaveLength(2)
      expect(notifiedExpenses.map((e: Expense) => e.id)).toEqual(['2', '3'])
    })

    it('should notify with empty array when no dates in range', () => {
      const from = new Date('2025-12-01')
      const to = new Date('2025-12-31')
      const dateRangeObservable = new DateRangeExpenseObservable(from, to)
      const observer = jest.fn()
      
      dateRangeObservable.subscribe(observer)
      observer.mockClear()
      
      const expenses: Expense[] = [
        { id: '1', userId: 'user1', description: 'Old', amount: 100, category: 'food', createdAt: '2025-11-01T10:00:00Z' }
      ]
      
      dateRangeObservable.updateExpenses(expenses)
      
      expect(observer).toHaveBeenCalledWith([])
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle multiple components observing the same data', () => {
      const dashboardObserver = jest.fn()
      const listObserver = jest.fn()
      const chartObserver = jest.fn()
      
      observable.subscribe(dashboardObserver)
      observable.subscribe(listObserver)
      observable.subscribe(chartObserver)
      
      dashboardObserver.mockClear()
      listObserver.mockClear()
      chartObserver.mockClear()
      
      const expense: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Lunch',
        amount: 500,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      observable.addExpense(expense)
      
      // All components should receive the update
      expect(dashboardObserver).toHaveBeenCalled()
      expect(listObserver).toHaveBeenCalled()
      expect(chartObserver).toHaveBeenCalled()
    })

    it('should handle component unmounting (cleanup)', () => {
      const componentObserver = jest.fn()
      
      // Component mounts
      const unsubscribe = observable.subscribe(componentObserver)
      expect(observable.getObserverCount()).toBe(1)
      
      // Component unmounts
      unsubscribe()
      expect(observable.getObserverCount()).toBe(0)
      
      // Updates after unmount shouldn't notify
      componentObserver.mockClear()
      observable.updateExpenses([])
      expect(componentObserver).not.toHaveBeenCalled()
    })

    it('should handle rapid updates', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      observer.mockClear()
      
      // Simulate rapid expense additions
      for (let i = 0; i < 10; i++) {
        observable.addExpense({
          id: `${i}`,
          userId: 'user1',
          description: `Expense ${i}`,
          amount: 100 * i,
          category: 'food',
          createdAt: '2025-11-01'
        })
      }
      
      // Should be notified 10 times
      expect(observer).toHaveBeenCalledTimes(10)
      
      // Final state should have 10 expenses
      const finalExpenses = observable.getExpenses()
      expect(finalExpenses).toHaveLength(10)
    })

    it('should maintain consistent state across updates', () => {
      const observer = jest.fn()
      observable.subscribe(observer)
      
      const expense1: Expense = {
        id: '1',
        userId: 'user1',
        description: 'Expense 1',
        amount: 100,
        category: 'food',
        createdAt: '2025-11-01'
      }
      
      const expense2: Expense = {
        id: '2',
        userId: 'user1',
        description: 'Expense 2',
        amount: 200,
        category: 'transport',
        createdAt: '2025-11-02'
      }
      
      observable.addExpense(expense1)
      observable.addExpense(expense2)
      observable.updateExpense('1', { amount: 150 })
      observable.deleteExpense('2')
      
      const finalExpenses = observable.getExpenses()
      expect(finalExpenses).toHaveLength(1)
      expect(finalExpenses[0].id).toBe('1')
      expect(finalExpenses[0].amount).toBe(150)
    })
  })
})
