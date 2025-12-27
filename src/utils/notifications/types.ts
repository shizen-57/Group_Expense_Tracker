/**
 * Notification System - Type Definitions
 * 
 * Defines all types and interfaces for the notification system
 */

export type NotificationType = 
  | 'BUDGET_ALERT'
  | 'EXPENSE_ADDED'
  | 'PAYMENT_REMINDER'
  | 'FRIEND_REQUEST'
  | 'GROUP_INVITE'
  | 'SETTLEMENT_REMINDER'
  | 'RECURRING_EXPENSE'
  | 'DEBT_SETTLED'

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  channels: NotificationChannel[]
  status: NotificationStatus
  data?: Record<string, any> // Additional data for navigation/actions
  createdAt: Date
  sentAt?: Date
  readAt?: Date
  expiresAt?: Date
}

export interface NotificationPreferences {
  userId: string
  channels: {
    budgetAlerts: NotificationChannel[]
    expenseUpdates: NotificationChannel[]
    paymentReminders: NotificationChannel[]
    socialUpdates: NotificationChannel[]
  }
  doNotDisturb: {
    enabled: boolean
    startTime?: string // e.g., "22:00"
    endTime?: string // e.g., "08:00"
  }
  frequency: {
    digest: boolean // Bundle notifications into daily digest
    digestTime?: string // e.g., "09:00"
  }
}

export interface NotificationEvent {
  type: NotificationType
  userId: string | string[] // Can notify multiple users
  data: Record<string, any>
  priority?: NotificationPriority
}

export interface DeliveryResult {
  channel: NotificationChannel
  success: boolean
  error?: string
  deliveredAt?: Date
}
