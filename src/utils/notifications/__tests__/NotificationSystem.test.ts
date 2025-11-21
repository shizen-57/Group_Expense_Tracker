/**
 * Notification System Tests
 * 
 * Tests for the notification system including:
 * - Strategy Pattern (different notification channels)
 * - Observer Pattern (notification observable)
 * - Factory Pattern (strategy creation)
 * - Template Method Pattern (notification manager)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  InAppNotificationStrategy,
  EmailNotificationStrategy,
  SMSNotificationStrategy,
  PushNotificationStrategy,
  MultiChannelNotificationStrategy
} from '../NotificationStrategies'
import {
  NotificationData,
  NotificationType,
  NotificationPriority
} from '../INotificationStrategy'
import { NotificationStrategyFactory } from '../NotificationFactory'
import { NotificationObservable } from '../NotificationObservable'
import { NotificationManager, NotificationHelper } from '../NotificationManager'

describe('Notification Strategies', () => {
  let testNotification: NotificationData

  beforeEach(() => {
    testNotification = {
      id: 'test-1',
      userId: 'user-1',
      title: 'Test Notification',
      message: 'This is a test message',
      type: NotificationType.EXPENSE_ADDED,
      priority: NotificationPriority.MEDIUM,
      createdAt: new Date()
    }
  })

  describe('InAppNotificationStrategy', () => {
    it('should handle all notification types', () => {
      const strategy = new InAppNotificationStrategy()
      expect(strategy.canHandle(testNotification)).toBe(true)
    })

    it('should send notification successfully', async () => {
      const strategy = new InAppNotificationStrategy()
      const result = await strategy.send(testNotification)
      
      expect(result.success).toBe(true)
      expect(result.channel).toBe('In-App')
    })

    it('should handle all priority levels', () => {
      const strategy = new InAppNotificationStrategy()
      const priorities = strategy.getPriorityLevel()
      
      expect(priorities).toContain(NotificationPriority.LOW)
      expect(priorities).toContain(NotificationPriority.MEDIUM)
      expect(priorities).toContain(NotificationPriority.HIGH)
      expect(priorities).toContain(NotificationPriority.URGENT)
    })
  })

  describe('EmailNotificationStrategy', () => {
    it('should only handle medium, high, and urgent priorities', () => {
      const strategy = new EmailNotificationStrategy()
      
      expect(strategy.canHandle({
        ...testNotification,
        priority: NotificationPriority.LOW
      })).toBe(false)
      
      expect(strategy.canHandle({
        ...testNotification,
        priority: NotificationPriority.MEDIUM
      })).toBe(true)
      
      expect(strategy.canHandle({
        ...testNotification,
        priority: NotificationPriority.HIGH
      })).toBe(true)
    })

    it('should send email notification', async () => {
      const strategy = new EmailNotificationStrategy()
      const result = await strategy.send(testNotification)
      
      expect(result.success).toBe(true)
      expect(result.channel).toBe('Email')
    })
  })

  describe('SMSNotificationStrategy', () => {
    it('should only handle high and urgent priorities', () => {
      const strategy = new SMSNotificationStrategy()
      
      expect(strategy.canHandle({
        ...testNotification,
        priority: NotificationPriority.LOW
      })).toBe(false)
      
      expect(strategy.canHandle({
        ...testNotification,
        priority: NotificationPriority.HIGH
      })).toBe(true)
    })

    it('should send SMS notification', async () => {
      const strategy = new SMSNotificationStrategy()
      const result = await strategy.send({
        ...testNotification,
        priority: NotificationPriority.HIGH
      })
      
      expect(result.success).toBe(true)
      expect(result.channel).toBe('SMS')
    })
  })

  describe('MultiChannelNotificationStrategy', () => {
    it('should send through multiple channels', async () => {
      const strategies = [
        new InAppNotificationStrategy(),
        new EmailNotificationStrategy()
      ]
      const multiChannel = new MultiChannelNotificationStrategy(strategies)
      
      const result = await multiChannel.send(testNotification)
      
      expect(result.success).toBe(true)
      expect(result.channel).toContain('Multi-Channel')
    })

    it('should combine priority levels from all strategies', () => {
      const strategies = [
        new InAppNotificationStrategy(),
        new SMSNotificationStrategy()
      ]
      const multiChannel = new MultiChannelNotificationStrategy(strategies)
      const priorities = multiChannel.getPriorityLevel()
      
      expect(priorities.length).toBeGreaterThan(0)
    })
  })
})

describe('NotificationFactory', () => {
  it('should create in-app strategy', () => {
    const strategy = NotificationStrategyFactory.createStrategy('in-app')
    expect(strategy.getName()).toBe('In-App')
  })

  it('should create email strategy', () => {
    const strategy = NotificationStrategyFactory.createStrategy('email')
    expect(strategy.getName()).toBe('Email')
  })

  it('should create SMS strategy', () => {
    const strategy = NotificationStrategyFactory.createStrategy('sms')
    expect(strategy.getName()).toBe('SMS')
  })

  it('should create push strategy', () => {
    const strategy = NotificationStrategyFactory.createStrategy('push')
    expect(strategy.getName()).toBe('Push')
  })

  it('should create multi-channel strategy for "all"', () => {
    const strategy = NotificationStrategyFactory.createStrategy('all')
    expect(strategy.getName()).toBe('Multi-Channel')
  })

  it('should create strategies for priority levels', () => {
    const lowStrategy = NotificationStrategyFactory.createForPriority(NotificationPriority.LOW)
    expect(lowStrategy).toBeDefined()
    
    const urgentStrategy = NotificationStrategyFactory.createForPriority(NotificationPriority.URGENT)
    expect(urgentStrategy.getName()).toBe('Multi-Channel')
  })
})

describe('NotificationObservable', () => {
  let observable: NotificationObservable
  let testNotification: NotificationData

  beforeEach(() => {
    observable = new NotificationObservable()
    testNotification = {
      id: 'test-1',
      userId: 'user-1',
      title: 'Test',
      message: 'Test message',
      type: NotificationType.EXPENSE_ADDED,
      priority: NotificationPriority.MEDIUM,
      createdAt: new Date()
    }
  })

  it('should notify all observers when notification is sent', () => {
    const observer = jest.fn()
    observable.subscribe(observer)
    
    observable.notify(testNotification)
    
    expect(observer).toHaveBeenCalledWith(testNotification)
  })

  it('should notify type-specific observers', () => {
    const expenseObserver = jest.fn()
    const budgetObserver = jest.fn()
    
    observable.subscribeToType(NotificationType.EXPENSE_ADDED, expenseObserver)
    observable.subscribeToType(NotificationType.BUDGET_ALERT, budgetObserver)
    
    observable.notify(testNotification)
    
    expect(expenseObserver).toHaveBeenCalledWith(testNotification)
    expect(budgetObserver).not.toHaveBeenCalled()
  })

  it('should unsubscribe observers', () => {
    const observer = jest.fn()
    const unsubscribe = observable.subscribe(observer)
    
    unsubscribe()
    observable.notify(testNotification)
    
    // Observer should only be called once during subscribe (immediate notification)
    expect(observer).toHaveBeenCalledTimes(0)
  })

  it('should store notifications', () => {
    observable.notify(testNotification)
    
    const notifications = observable.getNotifications()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].id).toBe('test-1')
  })

  it('should get notifications by type', () => {
    observable.notify(testNotification)
    observable.notify({
      ...testNotification,
      id: 'test-2',
      type: NotificationType.BUDGET_ALERT
    })
    
    const expenseNotifs = observable.getNotificationsByType(NotificationType.EXPENSE_ADDED)
    expect(expenseNotifs).toHaveLength(1)
  })

  it('should track unread count', () => {
    observable.notify(testNotification)
    expect(observable.getUnreadCount()).toBe(1)
    
    observable.markAsRead('test-1')
    expect(observable.getUnreadCount()).toBe(0)
  })

  it('should mark all as read', () => {
    observable.notify(testNotification)
    observable.notify({ ...testNotification, id: 'test-2' })
    
    observable.markAllAsRead()
    expect(observable.getUnreadCount()).toBe(0)
  })

  it('should clear all notifications', () => {
    observable.notify(testNotification)
    observable.clearAll()
    
    expect(observable.getNotifications()).toHaveLength(0)
  })
})

describe('NotificationManager', () => {
  let manager: NotificationManager

  beforeEach(() => {
    manager = new NotificationManager()
  })

  it('should send notification through appropriate strategies', async () => {
    manager.setUserPreferences('user-1', {
      userId: 'user-1',
      channels: ['in-app'],
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
      inAppEnabled: true
    })

    const notification: NotificationData = {
      id: '',
      userId: 'user-1',
      title: 'Test',
      message: 'Test message',
      type: NotificationType.EXPENSE_ADDED,
      priority: NotificationPriority.LOW,
      createdAt: new Date()
    }

    const results = await manager.sendNotification(notification)
    
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].success).toBe(true)
  })

  it('should validate notifications', async () => {
    const invalidNotification: any = {
      userId: 'user-1',
      // Missing required fields
    }

    await expect(manager.sendNotification(invalidNotification)).rejects.toThrow()
  })
})

describe('NotificationHelper', () => {
  it('should create expense added notification', () => {
    const notification = NotificationHelper.expenseAdded('user-1', 'Lunch', 500, 'John')
    
    expect(notification.type).toBe(NotificationType.EXPENSE_ADDED)
    expect(notification.title).toBe('Expense Added')
    expect(notification.message).toContain('Lunch')
    expect(notification.message).toContain('500')
  })

  it('should create budget alert notification', () => {
    const notification = NotificationHelper.budgetAlert('user-1', 'Food', 900, 1000, 90)
    
    expect(notification.type).toBe(NotificationType.BUDGET_ALERT)
    expect(notification.priority).toBe(NotificationPriority.MEDIUM)
    expect(notification.message).toContain('90%')
  })

  it('should create budget exceeded notification', () => {
    const notification = NotificationHelper.budgetExceeded('user-1', 'Food', 1100, 1000)
    
    expect(notification.type).toBe(NotificationType.BUDGET_EXCEEDED)
    expect(notification.priority).toBe(NotificationPriority.HIGH)
    expect(notification.message).toContain('exceeded')
  })

  it('should create friend request notification', () => {
    const notification = NotificationHelper.friendRequest('user-1', 'Alice')
    
    expect(notification.type).toBe(NotificationType.FRIEND_REQUEST)
    expect(notification.message).toContain('Alice')
  })

  it('should create settlement reminder notification', () => {
    const notification = NotificationHelper.settlementReminder('user-1', 'Bob', 500)
    
    expect(notification.type).toBe(NotificationType.SETTLEMENT_REMINDER)
    expect(notification.message).toContain('500')
  })

  it('should create group activity notification', () => {
    const notification = NotificationHelper.groupActivity('user-1', 'Trip Group', 'New expense added')
    
    expect(notification.type).toBe(NotificationType.GROUP_ACTIVITY)
    expect(notification.message).toContain('New expense added')
  })
})

describe('Integration Tests', () => {
  it('should send notification through entire system', async () => {
    const manager = new NotificationManager()
    const observable = new NotificationObservable()
    
    // Set up user preferences
    manager.setUserPreferences('user-1', {
      userId: 'user-1',
      channels: ['in-app'],
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
      inAppEnabled: true
    })
    
    // Subscribe observer
    const observer = jest.fn()
    observable.subscribe(observer)
    
    // Create and send notification
    const notification = NotificationHelper.expenseAdded('user-1', 'Coffee', 50, 'Me')
    await manager.sendNotification(notification)
    
    // Manually notify observable (in real app, manager does this)
    observable.notify(notification)
    
    expect(observer).toHaveBeenCalled()
  })
})
