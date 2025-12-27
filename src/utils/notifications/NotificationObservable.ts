/**
 * Observer Pattern - Notification Observable
 * 
 * Manages notification observers and distributes notifications.
 * Components can subscribe to specific notification types.
 */

import { useEffect, useState } from 'react'
import { NotificationData, NotificationType } from './INotificationStrategy'

export type NotificationObserver = (notification: NotificationData) => void

/**
 * Notification Observable (Subject)
 * Manages observers and notifies them of new notifications
 */
export class NotificationObservable {
  private observers: Map<string, Set<NotificationObserver>> = new Map()
  private allObservers: Set<NotificationObserver> = new Set()
  private notifications: NotificationData[] = []
  private maxStoredNotifications = 100

  /**
   * Subscribe to all notifications
   */
  subscribe(observer: NotificationObserver): () => void {
    this.allObservers.add(observer)
    
    // Return unsubscribe function
    return () => this.unsubscribe(observer)
  }

  /**
   * Subscribe to specific notification types
   */
  subscribeToType(
    type: NotificationType,
    observer: NotificationObserver
  ): () => void {
    if (!this.observers.has(type)) {
      this.observers.set(type, new Set())
    }
    
    this.observers.get(type)!.add(observer)
    
    // Return unsubscribe function
    return () => this.unsubscribeFromType(type, observer)
  }

  /**
   * Subscribe to multiple notification types
   */
  subscribeToTypes(
    types: NotificationType[],
    observer: NotificationObserver
  ): () => void {
    const unsubscribers = types.map(type => 
      this.subscribeToType(type, observer)
    )
    
    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  unsubscribe(observer: NotificationObserver): void {
    this.allObservers.delete(observer)
  }

  /**
   * Unsubscribe from specific notification type
   */
  unsubscribeFromType(
    type: NotificationType,
    observer: NotificationObserver
  ): void {
    const typeObservers = this.observers.get(type)
    if (typeObservers) {
      typeObservers.delete(observer)
      
      // Clean up empty sets
      if (typeObservers.size === 0) {
        this.observers.delete(type)
      }
    }
  }

  /**
   * Emit a notification to all relevant observers
   */
  notify(notification: NotificationData): void {
    // Store notification
    this.storeNotification(notification)
    
    // Notify all observers
    this.allObservers.forEach(observer => {
      try {
        observer(notification)
      } catch (error) {
        console.error('Error in notification observer:', error)
      }
    })
    
    // Notify type-specific observers
    const typeObservers = this.observers.get(notification.type)
    if (typeObservers) {
      typeObservers.forEach(observer => {
        try {
          observer(notification)
        } catch (error) {
          console.error('Error in notification type observer:', error)
        }
      })
    }
  }

  /**
   * Get all stored notifications
   */
  getNotifications(): readonly NotificationData[] {
    return [...this.notifications]
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): readonly NotificationData[] {
    return this.notifications.filter(n => n.type === type)
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.data?.read).length
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.data = { ...notification.data, read: true }
      this.notifyObserversOfUpdate()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => {
      n.data = { ...n.data, read: true }
    })
    this.notifyObserversOfUpdate()
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = []
    this.notifyObserversOfUpdate()
  }

  /**
   * Clear notifications by type
   */
  clearByType(type: NotificationType): void {
    this.notifications = this.notifications.filter(n => n.type !== type)
    this.notifyObserversOfUpdate()
  }

  /**
   * Get number of active observers
   */
  getObserverCount(): number {
    let count = this.allObservers.size
    this.observers.forEach(set => {
      count += set.size
    })
    return count
  }

  /**
   * Store notification (with max limit)
   */
  private storeNotification(notification: NotificationData): void {
    this.notifications.unshift(notification)
    
    // Limit stored notifications
    if (this.notifications.length > this.maxStoredNotifications) {
      this.notifications = this.notifications.slice(0, this.maxStoredNotifications)
    }
  }

  /**
   * Notify observers of update to existing notifications
   */
  private notifyObserversOfUpdate(): void {
    // Create a dummy notification to trigger re-render
    const updateNotification: NotificationData = {
      id: 'update',
      userId: '',
      title: '',
      message: '',
      type: NotificationType.GROUP_ACTIVITY,
      priority: 'low' as any,
      createdAt: new Date()
    }
    
    this.allObservers.forEach(observer => {
      try {
        observer(updateNotification)
      } catch (error) {
        console.error('Error notifying observer of update:', error)
      }
    })
  }
}

// Singleton instance
export const notificationObservable = new NotificationObservable()

/**
 * React Hook for using notification observable
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Subscribe to all notifications
    const unsubscribe = notificationObservable.subscribe(() => {
      setNotifications([...notificationObservable.getNotifications()])
      setUnreadCount(notificationObservable.getUnreadCount())
    })

    // Initial load
    setNotifications([...notificationObservable.getNotifications()])
    setUnreadCount(notificationObservable.getUnreadCount())

    return () => {
      unsubscribe()
    }
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationObservable.markAsRead(id),
    markAllAsRead: () => notificationObservable.markAllAsRead(),
    clearAll: () => notificationObservable.clearAll()
  }
}

/**
 * React Hook for specific notification types
 */
export function useNotificationsOfType(type: NotificationType) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    const observer = () => {
      setNotifications([...notificationObservable.getNotificationsByType(type)])
    }

    const unsubscribe = notificationObservable.subscribeToType(type, observer)
    
    // Initial load
    observer()

    return () => {
      unsubscribe()
    }
  }, [type])

  return notifications
}
