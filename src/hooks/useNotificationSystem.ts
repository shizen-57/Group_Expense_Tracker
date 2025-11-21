/**
 * Notification System Integration Hook
 * 
 * Integrates notification system with existing app functionality.
 * Monitors app events and sends appropriate notifications.
 */

import { useEffect } from 'react'
import { notificationManager, NotificationHelper } from '../utils/notifications/NotificationManager'
import { UserNotificationPreferences } from '../utils/notifications/NotificationFactory'

interface UseNotificationSystemProps {
  userId: string
  user?: any
  preferences?: UserNotificationPreferences
}

/**
 * Hook to initialize and manage notification system
 */
export function useNotificationSystem({ userId, user, preferences }: UseNotificationSystemProps) {
  useEffect(() => {
    if (!userId) return

    // Set user preferences
    if (preferences) {
      notificationManager.setUserPreferences(userId, preferences)
    }

    // Listen for custom notification events
    const handleExpenseAdded = (event: CustomEvent) => {
      const { description, amount, paidBy } = event.detail
      const notification = NotificationHelper.expenseAdded(
        userId,
        description,
        amount,
        paidBy || user?.name || 'Someone'
      )
      notificationManager.sendNotification(notification)
    }

    const handleBudgetAlert = (event: CustomEvent) => {
      const { category, spent, limit, percentage } = event.detail
      const notification = NotificationHelper.budgetAlert(
        userId,
        category,
        spent,
        limit,
        percentage
      )
      notificationManager.sendNotification(notification)
    }

    const handleBudgetExceeded = (event: CustomEvent) => {
      const { category, spent, limit } = event.detail
      const notification = NotificationHelper.budgetExceeded(
        userId,
        category,
        spent,
        limit
      )
      notificationManager.sendNotification(notification)
    }

    const handleFriendRequest = (event: CustomEvent) => {
      const { requesterName } = event.detail
      const notification = NotificationHelper.friendRequest(userId, requesterName)
      notificationManager.sendNotification(notification)
    }

    const handleSettlementReminder = (event: CustomEvent) => {
      const { friendName, amount } = event.detail
      const notification = NotificationHelper.settlementReminder(
        userId,
        friendName,
        amount
      )
      notificationManager.sendNotification(notification)
    }

    const handlePaymentDue = (event: CustomEvent) => {
      const { description, amount, dueDate } = event.detail
      const notification = NotificationHelper.paymentDue(
        userId,
        description,
        amount,
        new Date(dueDate)
      )
      notificationManager.sendNotification(notification)
    }

    const handleGroupActivity = (event: CustomEvent) => {
      const { groupName, activityDescription } = event.detail
      const notification = NotificationHelper.groupActivity(
        userId,
        groupName,
        activityDescription
      )
      notificationManager.sendNotification(notification)
    }

    const handleDebtSimplified = (event: CustomEvent) => {
      const { groupName, transactionCount } = event.detail
      const notification = NotificationHelper.debtSimplified(
        userId,
        groupName,
        transactionCount
      )
      notificationManager.sendNotification(notification)
    }

    const handleMemberAdded = (event: CustomEvent) => {
      const { groupName, memberName } = event.detail
      const notification = NotificationHelper.memberAdded(
        userId,
        groupName,
        memberName
      )
      notificationManager.sendNotification(notification)
    }

    // Register event listeners
    window.addEventListener('expense:added', handleExpenseAdded as EventListener)
    window.addEventListener('budget:alert', handleBudgetAlert as EventListener)
    window.addEventListener('budget:exceeded', handleBudgetExceeded as EventListener)
    window.addEventListener('friend:request', handleFriendRequest as EventListener)
    window.addEventListener('settlement:reminder', handleSettlementReminder as EventListener)
    window.addEventListener('payment:due', handlePaymentDue as EventListener)
    window.addEventListener('group:activity', handleGroupActivity as EventListener)
    window.addEventListener('debt:simplified', handleDebtSimplified as EventListener)
    window.addEventListener('member:added', handleMemberAdded as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('expense:added', handleExpenseAdded as EventListener)
      window.removeEventListener('budget:alert', handleBudgetAlert as EventListener)
      window.removeEventListener('budget:exceeded', handleBudgetExceeded as EventListener)
      window.removeEventListener('friend:request', handleFriendRequest as EventListener)
      window.removeEventListener('settlement:reminder', handleSettlementReminder as EventListener)
      window.removeEventListener('payment:due', handlePaymentDue as EventListener)
      window.removeEventListener('group:activity', handleGroupActivity as EventListener)
      window.removeEventListener('debt:simplified', handleDebtSimplified as EventListener)
      window.removeEventListener('member:added', handleMemberAdded as EventListener)
    }
  }, [userId, user, preferences])
}

/**
 * Helper functions to trigger notifications
 */
export const NotificationTriggers = {
  /**
   * Trigger expense added notification
   */
  expenseAdded(description: string, amount: number, paidBy: string) {
    window.dispatchEvent(
      new CustomEvent('expense:added', {
        detail: { description, amount, paidBy }
      })
    )
  },

  /**
   * Trigger budget alert notification
   */
  budgetAlert(category: string, spent: number, limit: number, percentage: number) {
    window.dispatchEvent(
      new CustomEvent('budget:alert', {
        detail: { category, spent, limit, percentage }
      })
    )
  },

  /**
   * Trigger budget exceeded notification
   */
  budgetExceeded(category: string, spent: number, limit: number) {
    window.dispatchEvent(
      new CustomEvent('budget:exceeded', {
        detail: { category, spent, limit }
      })
    )
  },

  /**
   * Trigger friend request notification
   */
  friendRequest(requesterName: string) {
    window.dispatchEvent(
      new CustomEvent('friend:request', {
        detail: { requesterName }
      })
    )
  },

  /**
   * Trigger settlement reminder notification
   */
  settlementReminder(friendName: string, amount: number) {
    window.dispatchEvent(
      new CustomEvent('settlement:reminder', {
        detail: { friendName, amount }
      })
    )
  },

  /**
   * Trigger payment due notification
   */
  paymentDue(description: string, amount: number, dueDate: Date) {
    window.dispatchEvent(
      new CustomEvent('payment:due', {
        detail: { description, amount, dueDate }
      })
    )
  },

  /**
   * Trigger group activity notification
   */
  groupActivity(groupName: string, activityDescription: string) {
    window.dispatchEvent(
      new CustomEvent('group:activity', {
        detail: { groupName, activityDescription }
      })
    )
  },

  /**
   * Trigger debt simplified notification
   */
  debtSimplified(groupName: string, transactionCount: number) {
    window.dispatchEvent(
      new CustomEvent('debt:simplified', {
        detail: { groupName, transactionCount }
      })
    )
  },

  /**
   * Trigger member added notification
   */
  memberAdded(groupName: string, memberName: string) {
    window.dispatchEvent(
      new CustomEvent('member:added', {
        detail: { groupName, memberName }
      })
    )
  }
}
