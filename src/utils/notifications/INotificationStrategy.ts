/**
 * Strategy Pattern - Notification Strategy Interface
 * 
 * Defines the contract for different notification delivery methods.
 * Each concrete strategy implements a specific notification channel.
 */

export interface NotificationData {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  data?: Record<string, any>
  createdAt: Date
}

export enum NotificationType {
  EXPENSE_ADDED = 'expense_added',
  BUDGET_ALERT = 'budget_alert',
  BUDGET_EXCEEDED = 'budget_exceeded',
  FRIEND_REQUEST = 'friend_request',
  SETTLEMENT_REMINDER = 'settlement_reminder',
  PAYMENT_DUE = 'payment_due',
  GROUP_ACTIVITY = 'group_activity',
  DEBT_SIMPLIFIED = 'debt_simplified',
  MEMBER_ADDED = 'member_added'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationResult {
  success: boolean
  channel: string
  sentAt: Date
  error?: string
}

/**
 * Strategy Interface
 * All notification channels must implement this interface
 */
export interface INotificationStrategy {
  /**
   * Get the name of this notification channel
   */
  getName(): string
  
  /**
   * Send a notification through this channel
   */
  send(notification: NotificationData): Promise<NotificationResult>
  
  /**
   * Check if this strategy can handle the notification
   */
  canHandle(notification: NotificationData): boolean
  
  /**
   * Get the priority level this strategy handles
   */
  getPriorityLevel(): NotificationPriority[]
}
