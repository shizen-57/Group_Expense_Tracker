/**
 * Strategy Pattern - Interface
 * 
 * Defines different algorithms for splitting expenses among group members.
 * This pattern allows us to:
 * - Add new split types without modifying existing code
 * - Test each algorithm in isolation
 * - Switch split strategies at runtime
 * - Keep split logic clean and maintainable
 */

export interface Member {
  id: string
  name: string
}

export interface Split {
  userId: string
  amount: number
  percentage?: number
  shares?: number
}

/**
 * ISplitStrategy Interface
 * 
 * Each concrete strategy implements this to provide
 * a different way of splitting expenses
 */
export interface ISplitStrategy {
  /**
   * Calculate how to split the expense amount among members
   * 
   * @param amount - Total expense amount
   * @param members - List of group members
   * @param data - Optional data specific to the strategy (percentages, shares, custom amounts)
   * @returns Array of splits showing how much each member owes
   */
  calculate(amount: number, members: Member[], data?: any): Split[]
  
  /**
   * Validate the input data before calculating
   * Throws an error if data is invalid
   */
  validate(amount: number, members: Member[], data?: any): void
  
  /**
   * Get the name of this split strategy
   */
  getName(): string
}
