/**
 * Template Method Pattern - Notification Manager
 * 
 * Orchestrates the notification sending process.
 * Defines the skeleton of the notification algorithm.
 */

import {
  INotificationStrategy,
  NotificationData,
  NotificationType,
  NotificationPriority,
  NotificationResult
} from './INotificationStrategy'
import { notificationObservable } from './NotificationObservable'
import { NotificationStrategyFactory, UserNotificationPreferences } from './NotificationFactory'

/**
 * Abstract base class for notification managers
 * Implements Template Method Pattern
 */
export abstract class BaseNotificationManager {
  /**
   * Template method - defines the notification algorithm
   */
  async sendNotification(notification: NotificationData): Promise<NotificationResult[]> {
    // Step 1: Validate notification
    if (!this.validate(notification)) {
      throw new Error('Invalid notification data')
    }

    // Step 2: Check quiet hours
    if (this.isQuietHours(notification)) {
      return this.defer(notification)
    }

    // Step 3: Get appropriate strategies
    const strategies = this.getStrategies(notification)

    // Step 4: Format notification
    const formattedNotification = this.format(notification)

    // Step 5: Send through all strategies
    const results = await this.send(formattedNotification, strategies)

    // Step 6: Log results
    this.log(formattedNotification, results)

    // Step 7: Notify observers
    this.notifyObservers(formattedNotification)

    return results
  }

  /**
   * Validate notification data (can be overridden)
   */
  protected validate(notification: NotificationData): boolean {
    return !!(
      notification.userId &&
      notification.title &&
      notification.message &&
      notification.type &&
      notification.priority
    )
  }

  /**
   * Check if current time is within quiet hours (can be overridden)
   */
  protected isQuietHours(notification: NotificationData): boolean {
    // Only check quiet hours for low and medium priority
    if (
      notification.priority === NotificationPriority.HIGH ||
      notification.priority === NotificationPriority.URGENT
    ) {
      return false
    }

    const preferences = this.getUserPreferences(notification.userId)
    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false
    }

    const now = new Date()
    const currentHour = now.getHours()

    return (
      currentHour >= preferences.quietHoursStart ||
      currentHour < preferences.quietHoursEnd
    )
  }

  /**
   * Defer notification for later delivery
   */
  protected defer(notification: NotificationData): NotificationResult[] {
    console.log('Notification deferred (quiet hours):', notification.title)
    // In production, store in queue for later delivery
    return [{
      success: true,
      channel: 'Deferred',
      sentAt: new Date()
    }]
  }

  /**
   * Format notification (can be overridden)
   */
  protected format(notification: NotificationData): NotificationData {
    return {
      ...notification,
      id: notification.id || this.generateId(),
      createdAt: notification.createdAt || new Date()
    }
  }

  /**
   * Send notification through strategies
   */
  protected async send(
    notification: NotificationData,
    strategies: INotificationStrategy[]
  ): Promise<NotificationResult[]> {
    const results = await Promise.allSettled(
      strategies.map(strategy => strategy.send(notification))
    )

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          success: false,
          channel: 'Unknown',
          sentAt: new Date(),
          error: result.reason?.message || 'Unknown error'
        }
      }
    })
  }

  /**
   * Log notification results (can be overridden)
   */
  protected log(notification: NotificationData, results: NotificationResult[]): void {
    const successCount = results.filter(r => r.success).length
    console.log(
      `📬 Notification sent: "${notification.title}" (${successCount}/${results.length} channels)`
    )
  }

  /**
   * Notify observers
   */
  protected notifyObservers(notification: NotificationData): void {
    notificationObservable.notify(notification)
  }

  /**
   * Generate unique notification ID
   */
  protected generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Abstract methods to be implemented by subclasses
  protected abstract getStrategies(notification: NotificationData): INotificationStrategy[]
  protected abstract getUserPreferences(userId: string): UserNotificationPreferences
}

/**
 * Concrete Notification Manager
 */
export class NotificationManager extends BaseNotificationManager {
  private userPreferences: Map<string, UserNotificationPreferences> = new Map()

  /**
   * Set user notification preferences
   */
  setUserPreferences(userId: string, preferences: UserNotificationPreferences): void {
    this.userPreferences.set(userId, preferences)
  }

  /**
   * Get strategies based on notification priority and user preferences
   */
  protected getStrategies(notification: NotificationData): INotificationStrategy[] {
    const preferences = this.getUserPreferences(notification.userId)
    
    // Get strategies from user preferences
    const userStrategies = NotificationStrategyFactory.createFromPreferences(preferences)
    
    // Filter strategies that can handle this notification
    return userStrategies.filter(strategy => strategy.canHandle(notification))
  }

  /**
   * Get user preferences
   */
  protected getUserPreferences(userId: string): UserNotificationPreferences {
    return this.userPreferences.get(userId) || {
      userId,
      channels: ['in-app'],
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
      inAppEnabled: true
    }
  }
}

/**
 * Singleton notification manager instance
 */
export const notificationManager = new NotificationManager()

/**
 * Helper functions for common notification scenarios
 */
export class NotificationHelper {
  /**
   * Create expense added notification
   */
  static expenseAdded(
    userId: string,
    expenseDescription: string,
    amount: number,
    paidBy: string
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Expense Added',
      message: `${paidBy} added ৳${amount} for ${expenseDescription}`,
      type: NotificationType.EXPENSE_ADDED,
      priority: NotificationPriority.LOW,
      data: { expenseDescription, amount, paidBy },
      createdAt: new Date()
    }
  }

  /**
   * Create budget alert notification
   */
  static budgetAlert(
    userId: string,
    category: string,
    spent: number,
    limit: number,
    percentage: number
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Budget Alert',
      message: `You've used ${percentage}% of your ${category} budget (৳${spent} of ৳${limit})`,
      type: NotificationType.BUDGET_ALERT,
      priority: NotificationPriority.MEDIUM,
      data: { category, spent, limit, percentage },
      createdAt: new Date()
    }
  }

  /**
   * Create budget exceeded notification
   */
  static budgetExceeded(
    userId: string,
    category: string,
    spent: number,
    limit: number
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Budget Exceeded!',
      message: `You've exceeded your ${category} budget! Spent ৳${spent} of ৳${limit}`,
      type: NotificationType.BUDGET_EXCEEDED,
      priority: NotificationPriority.HIGH,
      data: { category, spent, limit },
      createdAt: new Date()
    }
  }

  /**
   * Create friend request notification
   */
  static friendRequest(
    userId: string,
    requesterName: string
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Friend Request',
      message: `${requesterName} sent you a friend request`,
      type: NotificationType.FRIEND_REQUEST,
      priority: NotificationPriority.MEDIUM,
      data: { requesterName },
      createdAt: new Date()
    }
  }

  /**
   * Create settlement reminder notification
   */
  static settlementReminder(
    userId: string,
    friendName: string,
    amount: number
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Settlement Reminder',
      message: `You owe ৳${amount} to ${friendName}`,
      type: NotificationType.SETTLEMENT_REMINDER,
      priority: NotificationPriority.MEDIUM,
      data: { friendName, amount },
      createdAt: new Date()
    }
  }

  /**
   * Create payment due notification
   */
  static paymentDue(
    userId: string,
    description: string,
    amount: number,
    dueDate: Date
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Payment Due',
      message: `Payment of ৳${amount} for ${description} is due on ${dueDate.toLocaleDateString()}`,
      type: NotificationType.PAYMENT_DUE,
      priority: NotificationPriority.HIGH,
      data: { description, amount, dueDate },
      createdAt: new Date()
    }
  }

  /**
   * Create group activity notification
   */
  static groupActivity(
    userId: string,
    groupName: string,
    activityDescription: string
  ): NotificationData {
    return {
      id: '',
      userId,
      title: `Activity in ${groupName}`,
      message: activityDescription,
      type: NotificationType.GROUP_ACTIVITY,
      priority: NotificationPriority.LOW,
      data: { groupName, activityDescription },
      createdAt: new Date()
    }
  }

  /**
   * Create debt simplified notification
   */
  static debtSimplified(
    userId: string,
    groupName: string,
    transactionCount: number
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'Debts Simplified',
      message: `Group "${groupName}" debts simplified to ${transactionCount} transactions`,
      type: NotificationType.DEBT_SIMPLIFIED,
      priority: NotificationPriority.LOW,
      data: { groupName, transactionCount },
      createdAt: new Date()
    }
  }

  /**
   * Create member added notification
   */
  static memberAdded(
    userId: string,
    groupName: string,
    memberName: string
  ): NotificationData {
    return {
      id: '',
      userId,
      title: 'New Member',
      message: `${memberName} joined ${groupName}`,
      type: NotificationType.MEMBER_ADDED,
      priority: NotificationPriority.LOW,
      data: { groupName, memberName },
      createdAt: new Date()
    }
  }
}
