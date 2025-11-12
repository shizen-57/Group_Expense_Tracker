/**
 * Strategy Pattern Tests
 * 
 * Tests for expense splitting strategies
 * Coverage target: >95%
 */

import {
  EqualSplitStrategy,
  PercentageSplitStrategy,
  CustomSplitStrategy,
  ShareSplitStrategy,
  ExpenseSplitter,
  createSplitStrategy
} from '../strategies/SplitStrategies.ts'
import { Member } from '../strategies/ISplitStrategy.ts'

describe('Split Strategies', () => {
  const members: Member[] = [
    { id: 'user1', name: 'Alice' },
    { id: 'user2', name: 'Bob' },
    { id: 'user3', name: 'Charlie' }
  ]

  describe('EqualSplitStrategy', () => {
    let strategy: EqualSplitStrategy

    beforeEach(() => {
      strategy = new EqualSplitStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('equal')
    })

    it('should split amount equally', () => {
      const result = strategy.calculate(1500, members)
      
      expect(result).toEqual([
        { userId: 'user1', amount: 500 },
        { userId: 'user2', amount: 500 },
        { userId: 'user3', amount: 500 }
      ])
    })

    it('should handle odd amounts with remainder', () => {
      const result = strategy.calculate(1000, members)
      
      const total = result.reduce((sum, split) => sum + split.amount, 0)
      expect(total).toBe(1000)
      
      // First person should get the remainder
      expect(result[0].amount).toBeGreaterThanOrEqual(333.33)
    })

    it('should handle single member', () => {
      const result = strategy.calculate(1000, [members[0]])
      
      expect(result).toEqual([
        { userId: 'user1', amount: 1000 }
      ])
    })

    it('should throw error for zero amount', () => {
      expect(() => {
        strategy.calculate(0, members)
      }).toThrow('Amount must be positive')
    })

    it('should throw error for negative amount', () => {
      expect(() => {
        strategy.calculate(-100, members)
      }).toThrow('Amount must be positive')
    })

    it('should throw error for empty members', () => {
      expect(() => {
        strategy.calculate(1000, [])
      }).toThrow('At least one member is required')
    })
  })

  describe('PercentageSplitStrategy', () => {
    let strategy: PercentageSplitStrategy

    beforeEach(() => {
      strategy = new PercentageSplitStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('percentage')
    })

    it('should split by percentages', () => {
      const data = {
        user1: { percentage: 50 },
        user2: { percentage: 30 },
        user3: { percentage: 20 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      expect(result).toEqual([
        { userId: 'user1', amount: 500, percentage: 50 },
        { userId: 'user2', amount: 300, percentage: 30 },
        { userId: 'user3', amount: 200, percentage: 20 }
      ])
    })

    it('should handle decimal percentages', () => {
      const data = {
        user1: { percentage: 33.33 },
        user2: { percentage: 33.33 },
        user3: { percentage: 33.34 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      const total = result.reduce((sum, split) => sum + split.amount, 0)
      expect(total).toBeCloseTo(1000, 0)
    })

    it('should throw error if percentages don\'t sum to 100', () => {
      const data = {
        user1: { percentage: 50 },
        user2: { percentage: 30 },
        user3: { percentage: 15 } // Only 95%
      }
      
      expect(() => {
        strategy.calculate(1000, members, data)
      }).toThrow('Percentages must sum to 100')
    })

    it('should throw error for missing percentage data', () => {
      expect(() => {
        strategy.calculate(1000, members, undefined)
      }).toThrow('Percentage data is required')
    })

    it('should throw error for incomplete percentage data', () => {
      const data = {
        user1: { percentage: 50 },
        user2: { percentage: 50 }
        // user3 missing
      }
      
      expect(() => {
        strategy.calculate(1000, members, data)
      }).toThrow('Missing percentage for member Charlie')
    })

    it('should adjust for rounding errors', () => {
      const data = {
        user1: { percentage: 33.33 },
        user2: { percentage: 33.33 },
        user3: { percentage: 33.34 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      // Total should be exactly 1000 despite rounding
      const total = result.reduce((sum, split) => sum + split.amount, 0)
      expect(total).toBe(1000)
    })
  })

  describe('CustomSplitStrategy', () => {
    let strategy: CustomSplitStrategy

    beforeEach(() => {
      strategy = new CustomSplitStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('custom')
    })

    it('should split by custom amounts', () => {
      const data = {
        user1: { amount: 600 },
        user2: { amount: 250 },
        user3: { amount: 150 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      expect(result).toEqual([
        { userId: 'user1', amount: 600 },
        { userId: 'user2', amount: 250 },
        { userId: 'user3', amount: 150 }
      ])
    })

    it('should throw error if amounts don\'t sum to total', () => {
      const data = {
        user1: { amount: 600 },
        user2: { amount: 250 },
        user3: { amount: 100 } // Only 950 total
      }
      
      expect(() => {
        strategy.calculate(1000, members, data)
      }).toThrow('Custom amounts must sum to 1000')
    })

    it('should throw error for missing amount data', () => {
      expect(() => {
        strategy.calculate(1000, members, undefined)
      }).toThrow('Custom amount data is required')
    })

    it('should handle zero amounts for some members', () => {
      const data = {
        user1: { amount: 1000 },
        user2: { amount: 0 },
        user3: { amount: 0 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      expect(result[0].amount).toBe(1000)
      expect(result[1].amount).toBe(0)
      expect(result[2].amount).toBe(0)
    })
  })

  describe('ShareSplitStrategy', () => {
    let strategy: ShareSplitStrategy

    beforeEach(() => {
      strategy = new ShareSplitStrategy()
    })

    it('should have correct name', () => {
      expect(strategy.getName()).toBe('shares')
    })

    it('should split by shares', () => {
      const data = {
        user1: { shares: 2 },
        user2: { shares: 2 },
        user3: { shares: 1 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      // Total 5 shares, so each share = 200
      expect(result).toEqual([
        { userId: 'user1', amount: 400, shares: 2 },
        { userId: 'user2', amount: 400, shares: 2 },
        { userId: 'user3', amount: 200, shares: 1 }
      ])
    })

    it('should handle unequal shares', () => {
      const data = {
        user1: { shares: 5 },
        user2: { shares: 3 },
        user3: { shares: 2 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      // Total 10 shares, so each share = 100
      expect(result).toEqual([
        { userId: 'user1', amount: 500, shares: 5 },
        { userId: 'user2', amount: 300, shares: 3 },
        { userId: 'user3', amount: 200, shares: 2 }
      ])
    })

    it('should throw error for negative shares', () => {
      const data = {
        user1: { shares: 2 },
        user2: { shares: -1 },
        user3: { shares: 1 }
      }
      
      expect(() => {
        strategy.calculate(1000, members, data)
      }).toThrow('Shares must be positive for Bob')
    })

    it('should throw error for missing share data', () => {
      expect(() => {
        strategy.calculate(1000, members, undefined)
      }).toThrow('Share data is required')
    })

    it('should adjust for rounding errors', () => {
      const data = {
        user1: { shares: 1 },
        user2: { shares: 1 },
        user3: { shares: 1 }
      }
      
      const result = strategy.calculate(1000, members, data)
      
      // Total should be exactly 1000 despite rounding
      const total = result.reduce((sum, split) => sum + split.amount, 0)
      expect(total).toBe(1000)
    })
  })

  describe('ExpenseSplitter Context', () => {
    it('should use equal split by default', () => {
      const splitter = new ExpenseSplitter()
      
      expect(splitter.getStrategyName()).toBe('equal')
    })

    it('should allow changing strategy at runtime', () => {
      const splitter = new ExpenseSplitter()
      
      // Default: equal split
      let result = splitter.split(1200, members)
      expect(result[0].amount).toBe(400)
      
      // Change to percentage split
      splitter.setStrategy(new PercentageSplitStrategy())
      result = splitter.split(1000, members, {
        user1: { percentage: 60 },
        user2: { percentage: 25 },
        user3: { percentage: 15 }
      })
      expect(result[0].amount).toBe(600)
      
      // Change to share split
      splitter.setStrategy(new ShareSplitStrategy())
      result = splitter.split(1000, members, {
        user1: { shares: 3 },
        user2: { shares: 1 },
        user3: { shares: 1 }
      })
      expect(result[0].amount).toBe(600)
    })

    it('should return strategy name', () => {
      const splitter = new ExpenseSplitter(new PercentageSplitStrategy())
      
      expect(splitter.getStrategyName()).toBe('percentage')
    })

    it('should accept strategy in constructor', () => {
      const splitter = new ExpenseSplitter(new CustomSplitStrategy())
      
      const result = splitter.split(1000, members, {
        user1: { amount: 500 },
        user2: { amount: 300 },
        user3: { amount: 200 }
      })
      
      expect(result[0].amount).toBe(500)
    })
  })

  describe('createSplitStrategy Factory', () => {
    it('should create equal split strategy', () => {
      const strategy = createSplitStrategy('equal')
      
      expect(strategy.getName()).toBe('equal')
    })

    it('should create percentage split strategy', () => {
      const strategy = createSplitStrategy('percentage')
      
      expect(strategy.getName()).toBe('percentage')
    })

    it('should create custom split strategy', () => {
      const strategy = createSplitStrategy('custom')
      
      expect(strategy.getName()).toBe('custom')
    })

    it('should create share split strategy', () => {
      const strategy = createSplitStrategy('shares')
      
      expect(strategy.getName()).toBe('shares')
    })

    it('should throw error for unknown strategy', () => {
      expect(() => {
        createSplitStrategy('unknown')
      }).toThrow('Unknown split strategy: unknown')
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle restaurant bill split equally', () => {
      const strategy = new EqualSplitStrategy()
      const diners: Member[] = [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
        { id: 'charlie', name: 'Charlie' },
        { id: 'diana', name: 'Diana' }
      ]
      
      const result = strategy.calculate(2840, diners)
      
      expect(result).toHaveLength(4)
      expect(result[0].amount).toBe(710)
    })

    it('should handle trip expenses by percentage of days', () => {
      const strategy = new PercentageSplitStrategy()
      const travelers: Member[] = [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
        { id: 'charlie', name: 'Charlie' }
      ]
      
      // Alice stayed 10 days, Bob 7 days, Charlie 3 days (total 20 days)
      const data = {
        alice: { percentage: 50 },   // 10/20
        bob: { percentage: 35 },     // 7/20
        charlie: { percentage: 15 }  // 3/20
      }
      
      const result = strategy.calculate(10000, travelers, data)
      
      expect(result[0].amount).toBe(5000)
      expect(result[1].amount).toBe(3500)
      expect(result[2].amount).toBe(1500)
    })

    it('should handle shopping with different item purchases', () => {
      const strategy = new CustomSplitStrategy()
      const shoppers: Member[] = [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' }
      ]
      
      // Alice bought items worth ৳1200, Bob bought items worth ৳800
      const data = {
        alice: { amount: 1200 },
        bob: { amount: 800 }
      }
      
      const result = strategy.calculate(2000, shoppers, data)
      
      expect(result[0].amount).toBe(1200)
      expect(result[1].amount).toBe(800)
    })

    it('should handle family expenses by number of adults', () => {
      const strategy = new ShareSplitStrategy()
      const family: Member[] = [
        { id: 'parent1', name: 'Parent 1' },
        { id: 'parent2', name: 'Parent 2' },
        { id: 'child', name: 'Child' }
      ]
      
      // Adults get 2 shares, child gets 1 share
      const data = {
        parent1: { shares: 2 },
        parent2: { shares: 2 },
        child: { shares: 1 }
      }
      
      const result = strategy.calculate(5000, family, data)
      
      expect(result[0].amount).toBe(2000)
      expect(result[1].amount).toBe(2000)
      expect(result[2].amount).toBe(1000)
    })
  })
})
