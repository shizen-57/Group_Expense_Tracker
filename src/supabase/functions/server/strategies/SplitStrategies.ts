/**
 * Strategy Pattern - Concrete Implementations
 * 
 * Different algorithms for splitting expenses
 */

import { ISplitStrategy, Member, Split } from './ISplitStrategy.ts'

/**
 * Equal Split Strategy
 * Divides the amount equally among all members
 */
export class EqualSplitStrategy implements ISplitStrategy {
  getName(): string {
    return 'equal'
  }

  validate(amount: number, members: Member[]): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (members.length === 0) {
      throw new Error('At least one member is required')
    }
  }

  calculate(amount: number, members: Member[]): Split[] {
    this.validate(amount, members)
    
    const perPerson = Number((amount / members.length).toFixed(2))
    const remainder = Number((amount - (perPerson * members.length)).toFixed(2))
    
    return members.map((member, index) => ({
      userId: member.id,
      amount: index === 0 ? perPerson + remainder : perPerson // First person gets remainder
    }))
  }
}

/**
 * Percentage Split Strategy
 * Splits based on specified percentages for each member
 */
export class PercentageSplitStrategy implements ISplitStrategy {
  getName(): string {
    return 'percentage'
  }

  validate(amount: number, members: Member[], data?: any): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Percentage data is required')
    }
    
    const totalPercentage = Object.values(data).reduce(
      (sum: number, item: any) => sum + (item.percentage || 0), 
      0
    )
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100 (got ${totalPercentage})`)
    }
    
    // Verify all members have percentages
    for (const member of members) {
      if (!data[member.id] || typeof data[member.id].percentage !== 'number') {
        throw new Error(`Missing percentage for member ${member.name}`)
      }
    }
  }

  calculate(amount: number, members: Member[], data: any): Split[] {
    this.validate(amount, members, data)
    
    const splits = members.map(member => ({
      userId: member.id,
      amount: Number((amount * (data[member.id].percentage / 100)).toFixed(2)),
      percentage: data[member.id].percentage
    }))
    
    // Adjust for rounding errors
    const total = splits.reduce((sum, split) => sum + split.amount, 0)
    const diff = Number((amount - total).toFixed(2))
    if (Math.abs(diff) > 0) {
      splits[0].amount = Number((splits[0].amount + diff).toFixed(2))
    }
    
    return splits
  }
}

/**
 * Custom Split Strategy
 * Each member pays a custom specified amount
 */
export class CustomSplitStrategy implements ISplitStrategy {
  getName(): string {
    return 'custom'
  }

  validate(amount: number, members: Member[], data?: any): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Custom amount data is required')
    }
    
    const totalCustom = Object.values(data).reduce(
      (sum: number, item: any) => sum + (item.amount || 0), 
      0
    )
    
    if (Math.abs(totalCustom - amount) > 0.01) {
      throw new Error(`Custom amounts must sum to ${amount} (got ${totalCustom})`)
    }
    
    // Verify all members have amounts
    for (const member of members) {
      if (!data[member.id] || typeof data[member.id].amount !== 'number') {
        throw new Error(`Missing amount for member ${member.name}`)
      }
    }
  }

  calculate(amount: number, members: Member[], data: any): Split[] {
    this.validate(amount, members, data)
    
    return members.map(member => ({
      userId: member.id,
      amount: data[member.id].amount
    }))
  }
}

/**
 * Share-based Split Strategy
 * Splits based on shares (e.g., person A gets 2 shares, person B gets 1 share)
 */
export class ShareSplitStrategy implements ISplitStrategy {
  getName(): string {
    return 'shares'
  }

  validate(amount: number, members: Member[], data?: any): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
    if (!data || typeof data !== 'object') {
      throw new Error('Share data is required')
    }
    
    // Verify all members have shares
    for (const member of members) {
      if (!data[member.id] || typeof data[member.id].shares !== 'number') {
        throw new Error(`Missing shares for member ${member.name}`)
      }
      if (data[member.id].shares <= 0) {
        throw new Error(`Shares must be positive for ${member.name}`)
      }
    }
  }

  calculate(amount: number, members: Member[], data: any): Split[] {
    this.validate(amount, members, data)
    
    const totalShares = Object.values(data).reduce(
      (sum: number, item: any) => sum + (item.shares || 0), 
      0
    )
    const perShare = amount / totalShares
    
    const splits = members.map(member => ({
      userId: member.id,
      amount: Number((perShare * data[member.id].shares).toFixed(2)),
      shares: data[member.id].shares
    }))
    
    // Adjust for rounding errors
    const total = splits.reduce((sum, split) => sum + split.amount, 0)
    const diff = Number((amount - total).toFixed(2))
    if (Math.abs(diff) > 0) {
      splits[0].amount = Number((splits[0].amount + diff).toFixed(2))
    }
    
    return splits
  }
}

/**
 * Expense Splitter Context
 * Uses a strategy to split expenses
 */
export class ExpenseSplitter {
  private strategy: ISplitStrategy
  
  constructor(strategy?: ISplitStrategy) {
    this.strategy = strategy || new EqualSplitStrategy()
  }
  
  setStrategy(strategy: ISplitStrategy): void {
    this.strategy = strategy
  }
  
  split(amount: number, members: Member[], data?: any): Split[] {
    return this.strategy.calculate(amount, members, data)
  }
  
  getStrategyName(): string {
    return this.strategy.getName()
  }
}

/**
 * Factory function to create the appropriate strategy
 */
export function createSplitStrategy(type: string): ISplitStrategy {
  switch (type) {
    case 'equal':
      return new EqualSplitStrategy()
    case 'percentage':
      return new PercentageSplitStrategy()
    case 'custom':
      return new CustomSplitStrategy()
    case 'shares':
      return new ShareSplitStrategy()
    default:
      throw new Error(`Unknown split strategy: ${type}`)
  }
}
