/**
 * Strategy Pattern - Concrete Strategy
 * In-App Notification Delivery
 */

import type { Notification, DeliveryResult } from '../types'
import type { INotificationStrategy } from '../INotificationStrategy'

export class InAppNotificationStrategy implements INotificationStrategy {
  private notifications: Notification[] = []
  private listeners: Set<(notifications: Notification[]) => void> = new Set()

  getChannel() {
    return 'IN_APP' as const
  }

  async send(notification: Notification): Promise<DeliveryResult> {
    try {
      // Add to in-memory store
      this.notifications.unshift(notification)
      
      // Keep only last 100 notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100)
      }

      // Notify all listeners (Observer pattern)
      this.notifyListeners()

      // Store in localStorage for persistence
      this.persistToLocalStorage()

      return {
        channel: 'IN_APP',
        success: true,
        deliveredAt: new Date()
      }
    } catch (error) {
      console.error('In-app notification failed:', error)
      return {
        channel: 'IN_APP',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  canHandle(notification: Notification): boolean {
    return notification.channels.includes('IN_APP')
  }

  getSupportedPriorities(): string[] {
    return ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  }

  validate(notification: Notification): string | null {
    if (!notification.title || notification.title.trim().length === 0) {
      return 'Notification title is required'
    }
    if (!notification.message || notification.message.trim().length === 0) {
      return 'Notification message is required'
    }
    return null
  }

  /**
   * Subscribe to notification updates (Observer pattern)
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener)
    
    // Immediately notify with current notifications
    listener([...this.notifications])
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications]
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.readAt)
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.readAt = new Date()
      notification.status = 'READ'
      this.notifyListeners()
      this.persistToLocalStorage()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const now = new Date()
    this.notifications.forEach(notification => {
      if (!notification.readAt) {
        notification.readAt = now
        notification.status = 'READ'
      }
    })
    this.notifyListeners()
    this.persistToLocalStorage()
  }

  /**
   * Clear a notification
   */
  clear(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.notifyListeners()
    this.persistToLocalStorage()
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = []
    this.notifyListeners()
    this.persistToLocalStorage()
  }

  /**
   * Get notification count
   */
  getUnreadCount(): number {
    return this.getUnread().length
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const notificationsCopy = [...this.notifications]
    this.listeners.forEach(listener => {
      try {
        listener(notificationsCopy)
      } catch (error) {
        console.error('Error notifying listener:', error)
      }
    })
  }

  /**
   * Persist notifications to localStorage
   */
  private persistToLocalStorage(): void {
    try {
      localStorage.setItem(
        'in_app_notifications',
        JSON.stringify(this.notifications)
      )
    } catch (error) {
      console.error('Failed to persist notifications:', error)
    }
  }

  /**
   * Load notifications from localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('in_app_notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.notifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          sentAt: n.sentAt ? new Date(n.sentAt) : undefined,
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }))
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }
}

// Singleton instance
export const inAppNotificationStrategy = new InAppNotificationStrategy()

// Load from localStorage on initialization
if (typeof window !== 'undefined') {
  inAppNotificationStrategy.loadFromLocalStorage()
}
