/**
 * React Hook for Notification System
 * 
 * Provides easy access to notifications in React components
 */

import { useState, useEffect } from 'react'
import type { Notification, NotificationEvent, NotificationPreferences } from '../utils/notifications/types'
import { notificationManager } from '../utils/notifications/NotificationManager'
import { inAppNotificationStrategy } from '../utils/notifications/strategies/InAppNotificationStrategy'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to in-app notifications
    const unsubscribe = inAppNotificationStrategy.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter(n => !n.readAt).length)
      setLoading(false)
    })

    // Cleanup
    return () => unsubscribe()
  }, [])

  /**
   * Send a notification event
   */
  const sendNotification = async (event: NotificationEvent) => {
    await notificationManager.handleEvent(event)
  }

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId: string) => {
    inAppNotificationStrategy.markAsRead(notificationId)
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    inAppNotificationStrategy.markAllAsRead()
  }

  /**
   * Clear a notification
   */
  const clearNotification = (notificationId: string) => {
    inAppNotificationStrategy.clear(notificationId)
  }

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    inAppNotificationStrategy.clearAll()
  }

  /**
   * Get unread notifications
   */
  const getUnread = () => {
    return notifications.filter(n => !n.readAt)
  }

  return {
    notifications,
    unreadCount,
    loading,
    sendNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    getUnread
  }
}

/**
 * Hook for managing notification preferences
 */
export function useNotificationPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Load preferences
    const prefs = notificationManager.getPreferences(userId)
    if (prefs) {
      setPreferences(prefs)
    } else {
      // Set default preferences
      const defaultPrefs: NotificationPreferences = {
        userId,
        channels: {
          budgetAlerts: ['IN_APP', 'EMAIL', 'PUSH'],
          expenseUpdates: ['IN_APP', 'PUSH'],
          paymentReminders: ['IN_APP', 'EMAIL', 'PUSH'],
          socialUpdates: ['IN_APP', 'PUSH']
        },
        doNotDisturb: {
          enabled: false
        },
        frequency: {
          digest: false
        }
      }
      setPreferences(defaultPrefs)
      notificationManager.setPreferences(userId, defaultPrefs)
    }

    setLoading(false)
  }, [userId])

  /**
   * Update preferences
   */
  const updatePreferences = (newPreferences: NotificationPreferences) => {
    if (!userId) return

    setPreferences(newPreferences)
    notificationManager.setPreferences(userId, newPreferences)
  }

  /**
   * Enable/disable channel for a category
   */
  const toggleChannel = (
    category: keyof NotificationPreferences['channels'],
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'
  ) => {
    if (!preferences) return

    const channels = preferences.channels[category]
    const newChannels = channels.includes(channel)
      ? channels.filter(c => c !== channel)
      : [...channels, channel]

    const newPreferences = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [category]: newChannels
      }
    }

    updatePreferences(newPreferences)
  }

  /**
   * Enable Do Not Disturb
   */
  const setDoNotDisturb = (enabled: boolean, startTime?: string, endTime?: string) => {
    if (!preferences) return

    const newPreferences = {
      ...preferences,
      doNotDisturb: {
        enabled,
        startTime,
        endTime
      }
    }

    updatePreferences(newPreferences)
  }

  /**
   * Enable digest mode
   */
  const setDigestMode = (enabled: boolean, time?: string) => {
    if (!preferences) return

    const newPreferences = {
      ...preferences,
      frequency: {
        digest: enabled,
        digestTime: time
      }
    }

    updatePreferences(newPreferences)
  }

  return {
    preferences,
    loading,
    updatePreferences,
    toggleChannel,
    setDoNotDisturb,
    setDigestMode
  }
}
