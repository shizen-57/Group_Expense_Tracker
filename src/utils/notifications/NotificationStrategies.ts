/**
 * Strategy Pattern - Concrete Notification Strategies
 * 
 * Implements different notification delivery channels:
 * - In-App notifications
 * - Email notifications
 * - SMS notifications
 * - Push notifications
 */

import { toast } from 'sonner@2.0.3'
import {
  INotificationStrategy,
  NotificationData,
  NotificationResult,
  NotificationPriority,
  NotificationType
} from './INotificationStrategy'

/**
 * In-App Notification Strategy
 * Uses toast notifications for immediate user feedback
 */
export class InAppNotificationStrategy implements INotificationStrategy {
  getName(): string {
    return 'In-App'
  }

  canHandle(notification: NotificationData): boolean {
    // In-app handles all notification types
    return true
  }

  getPriorityLevel(): NotificationPriority[] {
    return [
      NotificationPriority.LOW,
      NotificationPriority.MEDIUM,
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ]
  }

  async send(notification: NotificationData): Promise<NotificationResult> {
    try {
      // Determine toast type based on notification type and priority
      const toastConfig = this.getToastConfig(notification)
      
      // Show toast notification
      if (notification.priority === NotificationPriority.URGENT) {
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000, // 10 seconds for urgent
          ...toastConfig
        })
      } else if (notification.type === NotificationType.BUDGET_EXCEEDED) {
        toast.error(notification.title, {
          description: notification.message,
          duration: 8000,
          ...toastConfig
        })
      } else if (notification.type === NotificationType.BUDGET_ALERT) {
        toast.error(notification.title, {
          description: notification.message,
          duration: 6000,
          ...toastConfig
        })
      } else {
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
          ...toastConfig
        })
      }

      return {
        success: true,
        channel: this.getName(),
        sentAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        channel: this.getName(),
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getToastConfig(notification: NotificationData) {
    const config: any = {}

    // Add action buttons for specific notification types
    if (notification.type === NotificationType.FRIEND_REQUEST) {
      config.action = {
        label: 'View',
        onClick: () => {
          // Navigate to friends page
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'friends' }))
        }
      }
    } else if (notification.type === NotificationType.BUDGET_ALERT || 
               notification.type === NotificationType.BUDGET_EXCEEDED) {
      config.action = {
        label: 'View Budget',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'expenses' }))
        }
      }
    } else if (notification.type === NotificationType.PAYMENT_DUE) {
      config.action = {
        label: 'Settle Now',
        onClick: () => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'friends' }))
        }
      }
    }

    return config
  }
}

/**
 * Email Notification Strategy
 * Sends notifications via email (simulated for now)
 */
export class EmailNotificationStrategy implements INotificationStrategy {
  private apiEndpoint: string

  constructor(apiEndpoint: string = '/api/notifications/email') {
    this.apiEndpoint = apiEndpoint
  }

  getName(): string {
    return 'Email'
  }

  canHandle(notification: NotificationData): boolean {
    // Email handles medium, high, and urgent priorities
    return [
      NotificationPriority.MEDIUM,
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ].includes(notification.priority)
  }

  getPriorityLevel(): NotificationPriority[] {
    return [
      NotificationPriority.MEDIUM,
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ]
  }

  async send(notification: NotificationData): Promise<NotificationResult> {
    try {
      // In a real implementation, this would call an email service API
      // For now, we'll simulate the email send
      console.log(`📧 Email Notification Sent:`, {
        to: notification.userId,
        subject: notification.title,
        body: notification.message,
        priority: notification.priority
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))

      // In production, you would call something like:
      // await fetch(this.apiEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: notification.userId,
      //     subject: notification.title,
      //     html: this.formatEmailHTML(notification)
      //   })
      // })

      return {
        success: true,
        channel: this.getName(),
        sentAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        channel: this.getName(),
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Email send failed'
      }
    }
  }

  private formatEmailHTML(notification: NotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); 
                     color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .footer { background: #e5e7eb; padding: 10px; text-align: center; 
                     border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              ${notification.data ? `<pre>${JSON.stringify(notification.data, null, 2)}</pre>` : ''}
            </div>
            <div class="footer">
              <p>Personal Expense Manager | <a href="#">View in App</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

/**
 * SMS Notification Strategy
 * Sends notifications via SMS (simulated for now)
 */
export class SMSNotificationStrategy implements INotificationStrategy {
  private apiEndpoint: string

  constructor(apiEndpoint: string = '/api/notifications/sms') {
    this.apiEndpoint = apiEndpoint
  }

  getName(): string {
    return 'SMS'
  }

  canHandle(notification: NotificationData): boolean {
    // SMS only for high and urgent priorities (to avoid spam)
    return [
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ].includes(notification.priority)
  }

  getPriorityLevel(): NotificationPriority[] {
    return [
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ]
  }

  async send(notification: NotificationData): Promise<NotificationResult> {
    try {
      // Truncate message for SMS (160 character limit)
      const smsMessage = this.formatSMSMessage(notification)

      console.log(`📱 SMS Notification Sent:`, {
        to: notification.userId,
        message: smsMessage,
        priority: notification.priority
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 150))

      // In production, you would call Twilio or similar:
      // await fetch(this.apiEndpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: notification.data?.phone,
      //     message: smsMessage
      //   })
      // })

      return {
        success: true,
        channel: this.getName(),
        sentAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        channel: this.getName(),
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'SMS send failed'
      }
    }
  }

  private formatSMSMessage(notification: NotificationData): string {
    // SMS has 160 character limit
    const prefix = '[ExpenseApp] '
    const maxLength = 160 - prefix.length
    const fullMessage = `${notification.title}: ${notification.message}`
    
    if (fullMessage.length <= maxLength) {
      return prefix + fullMessage
    }
    
    return prefix + fullMessage.substring(0, maxLength - 3) + '...'
  }
}

/**
 * Push Notification Strategy
 * Sends browser push notifications (using Web Push API)
 */
export class PushNotificationStrategy implements INotificationStrategy {
  getName(): string {
    return 'Push'
  }

  canHandle(notification: NotificationData): boolean {
    // Push notifications for all priority levels
    // But only if browser supports it and user granted permission
    return 'Notification' in window && Notification.permission === 'granted'
  }

  getPriorityLevel(): NotificationPriority[] {
    return [
      NotificationPriority.LOW,
      NotificationPriority.MEDIUM,
      NotificationPriority.HIGH,
      NotificationPriority.URGENT
    ]
  }

  async send(notification: NotificationData): Promise<NotificationResult> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        throw new Error('Browser does not support notifications')
      }

      // Check permission
      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted')
      }

      // Create notification
      const pushNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === NotificationPriority.URGENT,
        data: notification.data
      })

      // Handle notification click
      pushNotification.onclick = () => {
        window.focus()
        pushNotification.close()
        
        // Navigate based on notification type
        if (notification.type === NotificationType.FRIEND_REQUEST) {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'friends' }))
        } else if (notification.type === NotificationType.GROUP_ACTIVITY) {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'groups' }))
        } else if (notification.type === NotificationType.BUDGET_ALERT) {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'expenses' }))
        }
      }

      return {
        success: true,
        channel: this.getName(),
        sentAt: new Date()
      }
    } catch (error) {
      return {
        success: false,
        channel: this.getName(),
        sentAt: new Date(),
        error: error instanceof Error ? error.message : 'Push notification failed'
      }
    }
  }

  /**
   * Request permission for push notifications
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission()
    }

    return Notification.permission
  }
}

/**
 * Composite Notification Strategy
 * Sends notification through multiple channels simultaneously
 */
export class MultiChannelNotificationStrategy implements INotificationStrategy {
  private strategies: INotificationStrategy[]

  constructor(strategies: INotificationStrategy[]) {
    this.strategies = strategies
  }

  getName(): string {
    return 'Multi-Channel'
  }

  canHandle(notification: NotificationData): boolean {
    // Can handle if at least one strategy can handle it
    return this.strategies.some(strategy => strategy.canHandle(notification))
  }

  getPriorityLevel(): NotificationPriority[] {
    // Combines all priority levels from all strategies
    const priorities = new Set<NotificationPriority>()
    this.strategies.forEach(strategy => {
      strategy.getPriorityLevel().forEach(p => priorities.add(p))
    })
    return Array.from(priorities)
  }

  async send(notification: NotificationData): Promise<NotificationResult> {
    // Send through all strategies that can handle this notification
    const applicableStrategies = this.strategies.filter(s => s.canHandle(notification))
    
    const results = await Promise.allSettled(
      applicableStrategies.map(strategy => strategy.send(notification))
    )

    // Aggregate results
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const totalCount = results.length

    return {
      success: successCount > 0,
      channel: `${this.getName()} (${successCount}/${totalCount} channels)`,
      sentAt: new Date(),
      error: successCount === 0 ? 'All channels failed' : undefined
    }
  }
}
