/**
 * Tests for Notification Factory Pattern
 */

import { describe, it, expect } from '@jest/globals'
import { NotificationFactory } from '../NotificationFactory'

describe('NotificationFactory', () => {
  describe('createBudgetAlert', () => {
    it('should create URGENT budget alert for 100% usage', () => {
      const notification = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: {
          category: 'Food',
          spent: 10000,
          limit: 10000,
          percentage: 100
        }
      })

      expect(notification.type).toBe('BUDGET_ALERT')
      expect(notification.priority).toBe('URGENT')
      expect(notification.title).toContain('Food')
      expect(notification.channels).toContain('IN_APP')
      expect(notification.channels).toContain('EMAIL')
    })

    it('should create HIGH priority alert for 95% usage', () => {
      const notification = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: {
          category: 'Transport',
          spent: 4750,
          limit: 5000,
          percentage: 95
        }
      })

      expect(notification.priority).toBe('HIGH')
      expect(notification.message).toContain('৳4,750')
      expect(notification.message).toContain('৳5,000')
    })

    it('should create MEDIUM priority alert for 90% usage', () => {
      const notification = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: {
          category: 'Entertainment',
          spent: 2700,
          limit: 3000,
          percentage: 90
        }
      })

      expect(notification.priority).toBe('MEDIUM')
      expect(notification.title).toBe('Budget Alert: Entertainment')
    })

    it('should set expiration date', () => {
      const notification = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: {
          category: 'Food',
          spent: 5000,
          limit: 5000,
          percentage: 100
        }
      })

      expect(notification.expiresAt).toBeDefined()
      if (notification.expiresAt) {
        const daysUntilExpiry = Math.ceil(
          (notification.expiresAt.getTime() - notification.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        expect(daysUntilExpiry).toBe(7) // 7 days
      }
    })
  })

  describe('createExpenseNotification', () => {
    it('should create HIGH priority for large expense', () => {
      const notification = NotificationFactory.createExpenseNotification({
        userId: 'user1',
        data: {
          description: 'Team dinner',
          amount: 15000,
          paidBy: 'John',
          groupName: 'Office',
          category: 'Food'
        }
      })

      expect(notification.type).toBe('EXPENSE_ADDED')
      expect(notification.priority).toBe('HIGH')
      expect(notification.message).toContain('৳15,000')
    })

    it('should create MEDIUM priority for medium expense', () => {
      const notification = NotificationFactory.createExpenseNotification({
        userId: 'user1',
        data: {
          description: 'Groceries',
          amount: 7000,
          paidBy: 'Sarah',
          groupName: 'Family',
          category: 'Groceries'
        }
      })

      expect(notification.priority).toBe('MEDIUM')
      expect(notification.channels).toContain('IN_APP')
    })

    it('should create LOW priority for small expense', () => {
      const notification = NotificationFactory.createExpenseNotification({
        userId: 'user1',
        data: {
          description: 'Coffee',
          amount: 500,
          paidBy: 'Mike',
          groupName: 'Friends',
          category: 'Food'
        }
      })

      expect(notification.priority).toBe('LOW')
      expect(notification.channels).toEqual(['IN_APP'])
    })
  })

  describe('createPaymentReminder', () => {
    it('should create URGENT reminder for overdue payment', () => {
      const notification = NotificationFactory.createPaymentReminder({
        userId: 'user1',
        data: {
          amount: 5000,
          friendName: 'Alex',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          daysUntilDue: -2
        }
      })

      expect(notification.priority).toBe('URGENT')
      expect(notification.message).toContain('overdue')
      expect(notification.channels).toContain('SMS')
    })

    it('should create HIGH priority for due today', () => {
      const notification = NotificationFactory.createPaymentReminder({
        userId: 'user1',
        data: {
          amount: 3000,
          friendName: 'Taylor',
          dueDate: new Date(),
          daysUntilDue: 0
        }
      })

      expect(notification.priority).toBe('HIGH')
      expect(notification.message).toContain('due today')
    })

    it('should create MEDIUM priority for future payment', () => {
      const notification = NotificationFactory.createPaymentReminder({
        userId: 'user1',
        data: {
          amount: 2000,
          friendName: 'Jordan',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          daysUntilDue: 5
        }
      })

      expect(notification.priority).toBe('MEDIUM')
      expect(notification.message).toContain('5 days')
    })
  })

  describe('createFriendRequest', () => {
    it('should create friend request notification', () => {
      const notification = NotificationFactory.createFriendRequest({
        userId: 'user1',
        data: {
          fromUserName: 'Alice',
          fromUserId: 'user2'
        }
      })

      expect(notification.type).toBe('FRIEND_REQUEST')
      expect(notification.priority).toBe('MEDIUM')
      expect(notification.title).toBe('New Friend Request')
      expect(notification.message).toContain('Alice')
      expect(notification.data?.actionUrl).toContain('/friends')
    })
  })

  describe('createBatch', () => {
    it('should create multiple notifications for multiple users', () => {
      const notifications = NotificationFactory.createBatch(
        ['user1', 'user2', 'user3'],
        'EXPENSE_ADDED',
        {
          description: 'Lunch',
          amount: 1500,
          paidBy: 'John',
          groupName: 'Office',
          category: 'Food'
        }
      )

      expect(notifications).toHaveLength(3)
      expect(notifications[0].userId).toBe('user1')
      expect(notifications[1].userId).toBe('user2')
      expect(notifications[2].userId).toBe('user3')
      expect(notifications[0].type).toBe('EXPENSE_ADDED')
    })
  })

  describe('ID generation', () => {
    it('should generate unique IDs', () => {
      const notification1 = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: { category: 'Food', spent: 5000, limit: 5000, percentage: 100 }
      })

      const notification2 = NotificationFactory.createBudgetAlert({
        userId: 'user1',
        data: { category: 'Food', spent: 5000, limit: 5000, percentage: 100 }
      })

      expect(notification1.id).not.toBe(notification2.id)
      expect(notification1.id).toMatch(/^notif_\d+_[a-z0-9]+$/)
    })
  })
})
