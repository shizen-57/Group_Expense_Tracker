/**
 * Strategy Pattern - Concrete Strategy
 * Push Notification Delivery (Browser Push API)
 */

import type { Notification, DeliveryResult } from '../types'
import type { INotificationStrategy } from '../INotificationStrategy'

export class PushNotificationStrategy implements INotificationStrategy {
  private registration: ServiceWorkerRegistration | null = null

  getChannel() {
    return 'PUSH' as const
  }

  async send(notification: Notification): Promise<DeliveryResult> {
    try {
      // Check if push notifications are supported
      if (!('Notification' in window)) {
        return {
          channel: 'PUSH',
          success: false,
          error: 'Push notifications not supported'
        }
      }

      // Check permission
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          return {
            channel: 'PUSH',
            success: false,
            error: 'Push notification permission denied'
          }
        }
      }

      // Get service worker registration
      if (!this.registration && 'serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.ready
      }

      const icon = this.getTypeIcon(notification.type)
      const badge = '/notification-badge.png'

      // Show notification
      if (this.registration) {
        await this.registration.showNotification(notification.title, {
          body: notification.message,
          icon: icon,
          badge: badge,
          tag: notification.id,
          data: notification.data,
          requireInteraction: notification.priority === 'URGENT',
          vibrate: notification.priority === 'HIGH' || notification.priority === 'URGENT' 
            ? [200, 100, 200] 
            : undefined,
          actions: this.getNotificationActions(notification)
        })
      } else {
        // Fallback to basic notification
        new Notification(notification.title, {
          body: notification.message,
          icon: icon,
          tag: notification.id,
          data: notification.data
        })
      }

      return {
        channel: 'PUSH',
        success: true,
        deliveredAt: new Date()
      }
    } catch (error) {
      console.error('Push notification failed:', error)
      return {
        channel: 'PUSH',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  canHandle(notification: Notification): boolean {
    return notification.channels.includes('PUSH') && 'Notification' in window
  }

  getSupportedPriorities(): string[] {
    return ['MEDIUM', 'HIGH', 'URGENT'] // Don't send push for LOW priority
  }

  validate(notification: Notification): string | null {
    if (!notification.title || notification.title.trim().length === 0) {
      return 'Notification title is required'
    }
    if (notification.title.length > 100) {
      return 'Notification title too long (max 100 characters)'
    }
    if (notification.message.length > 300) {
      return 'Notification message too long (max 300 characters)'
    }
    return null
  }

  /**
   * Request push notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return await Notification.requestPermission()
  }

  /**
   * Check if push notifications are enabled
   */
  isEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted'
  }

  private getTypeIcon(type: string): string {
    // Return emoji data URIs for icons
    const icons = {
      BUDGET_ALERT: '⚠️',
      EXPENSE_ADDED: '💰',
      PAYMENT_REMINDER: '🔔',
      FRIEND_REQUEST: '👤',
      GROUP_INVITE: '👥',
      SETTLEMENT_REMINDER: '💸',
      RECURRING_EXPENSE: '🔄',
      DEBT_SETTLED: '✅'
    }
    return icons[type as keyof typeof icons] || '📬'
  }

  private getNotificationActions(notification: Notification): NotificationAction[] {
    const actions: NotificationAction[] = []

    // Add type-specific actions
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        actions.push(
          { action: 'accept', title: 'Accept' },
          { action: 'reject', title: 'Reject' }
        )
        break
      case 'PAYMENT_REMINDER':
        actions.push(
          { action: 'pay', title: 'Pay Now' },
          { action: 'view', title: 'View Details' }
        )
        break
      case 'BUDGET_ALERT':
        actions.push(
          { action: 'view', title: 'View Budget' }
        )
        break
      case 'EXPENSE_ADDED':
        actions.push(
          { action: 'view', title: 'View Expense' }
        )
        break
    }

    return actions
  }
}

// Singleton instance
export const pushNotificationStrategy = new PushNotificationStrategy()
