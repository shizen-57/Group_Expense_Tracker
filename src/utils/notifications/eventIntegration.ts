/**
 * Event Integration for Notification System
 * 
 * This file shows how to integrate the notification system
 * with existing app events (Observer Pattern)
 */

import { notificationManager } from './NotificationManager'
import type { NotificationEvent } from './types'

/**
 * Budget Alert Integration
 * Call this when a budget threshold is reached
 */
export async function triggerBudgetAlert(
  userId: string,
  category: string,
  spent: number,
  limit: number
) {
  const percentage = Math.round((spent / limit) * 100)

  const event: NotificationEvent = {
    type: 'BUDGET_ALERT',
    userId,
    data: {
      category,
      spent,
      limit,
      percentage
    },
    priority: percentage >= 100 ? 'URGENT' : percentage >= 90 ? 'HIGH' : 'MEDIUM'
  }

  await notificationManager.handleEvent(event)
}

/**
 * Expense Added Integration
 * Call this when a new expense is added to a group
 */
export async function triggerExpenseNotification(
  userIds: string[], // All group members except the one who added
  description: string,
  amount: number,
  paidBy: string,
  groupName: string,
  category: string,
  groupId: string
) {
  const event: NotificationEvent = {
    type: 'EXPENSE_ADDED',
    userId: userIds,
    data: {
      description,
      amount,
      paidBy,
      groupName,
      category,
      actionUrl: `/groups?groupId=${groupId}`
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Payment Reminder Integration
 * Call this from a scheduled job checking due dates
 */
export async function triggerPaymentReminder(
  userId: string,
  amount: number,
  friendName: string,
  dueDate: Date,
  friendId: string
) {
  const now = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const event: NotificationEvent = {
    type: 'PAYMENT_REMINDER',
    userId,
    data: {
      amount,
      friendName,
      dueDate: dueDate.toISOString(),
      daysUntilDue,
      actionUrl: `/friends?friendId=${friendId}`
    },
    priority: daysUntilDue < 0 ? 'URGENT' : daysUntilDue <= 1 ? 'HIGH' : 'MEDIUM'
  }

  await notificationManager.handleEvent(event)
}

/**
 * Friend Request Integration
 * Call this when a user sends a friend request
 */
export async function triggerFriendRequest(
  toUserId: string,
  fromUserName: string,
  fromUserId: string
) {
  const event: NotificationEvent = {
    type: 'FRIEND_REQUEST',
    userId: toUserId,
    data: {
      fromUserName,
      fromUserId,
      actionUrl: `/friends?requestId=${fromUserId}`
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Group Invite Integration
 * Call this when a user is invited to a group
 */
export async function triggerGroupInvite(
  invitedUserId: string,
  groupName: string,
  invitedBy: string,
  groupId: string
) {
  const event: NotificationEvent = {
    type: 'GROUP_INVITE',
    userId: invitedUserId,
    data: {
      groupName,
      invitedBy,
      groupId,
      actionUrl: `/groups?groupId=${groupId}`
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Settlement Reminder Integration
 * Call this from a scheduled job for pending settlements
 */
export async function triggerSettlementReminder(
  userId: string,
  amount: number,
  friendName: string,
  friendId: string
) {
  const event: NotificationEvent = {
    type: 'SETTLEMENT_REMINDER',
    userId,
    data: {
      amount,
      friendName,
      actionUrl: `/friends?friendId=${friendId}`
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Recurring Expense Reminder Integration
 * Call this from a scheduled job checking recurring expenses
 */
export async function triggerRecurringExpenseReminder(
  userId: string,
  description: string,
  amount: number,
  dueDate: Date
) {
  const event: NotificationEvent = {
    type: 'RECURRING_EXPENSE',
    userId,
    data: {
      description,
      amount,
      dueDate: dueDate.toISOString()
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Debt Settled Integration
 * Call this when a debt is settled
 */
export async function triggerDebtSettled(
  userId: string,
  amount: number,
  settledWith: string,
  paymentMethod: string
) {
  const event: NotificationEvent = {
    type: 'DEBT_SETTLED',
    userId,
    data: {
      amount,
      settledWith,
      paymentMethod
    }
  }

  await notificationManager.handleEvent(event)
}

/**
 * Example integration in existing code:
 * 
 * // In usePersonalExpenses.ts - Budget Alert
 * import { triggerBudgetAlert } from '../utils/notifications/eventIntegration'
 * 
 * const handleCreateExpense = async (expenseData) => {
 *   const newExpense = await api.createExpense(token, expenseData)
 *   
 *   // Check if budget threshold reached
 *   const budget = budgets.find(b => b.category === expenseData.category)
 *   if (budget) {
 *     const spent = calculateSpent(expenses, budget.category)
 *     const percentage = (spent / budget.limit) * 100
 *     
 *     if (percentage >= 90) {
 *       await triggerBudgetAlert(userId, budget.category, spent, budget.limit)
 *     }
 *   }
 *   
 *   return newExpense
 * }
 * 
 * // In useGroups.ts - Expense Added
 * import { triggerExpenseNotification } from '../utils/notifications/eventIntegration'
 * 
 * const handleAddExpense = async (expenseData) => {
 *   await api.addExpense(token, groupId, expenseData)
 *   
 *   // Notify all group members except the one who added
 *   const memberIds = group.members
 *     .filter(m => m.id !== expenseData.paidBy)
 *     .map(m => m.id)
 *   
 *   await triggerExpenseNotification(
 *     memberIds,
 *     expenseData.description,
 *     expenseData.amount,
 *     currentUser.name,
 *     group.name,
 *     expenseData.category,
 *     groupId
 *   )
 * }
 */
