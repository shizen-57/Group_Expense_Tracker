/**
 * Strategy Pattern - Concrete Strategy
 * SMS Notification Delivery (Twilio Integration)
 */

import type { Notification, DeliveryResult } from '../types'
import type { INotificationStrategy } from '../INotificationStrategy'

export class SMSNotificationStrategy implements INotificationStrategy {
  private apiEndpoint: string

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || '/api/notifications/sms'
  }

  getChannel() {
    return 'SMS' as const
  }

  async send(notification: Notification): Promise<DeliveryResult> {
    try {
      const validationError = this.validate(notification)
      if (validationError) {
        return {
          channel: 'SMS',
          success: false,
          error: validationError
        }
      }

      // Format SMS content (keep it short)
      const smsContent = this.formatSMSContent(notification)

      // Send SMS via backend API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: notification.id,
          userId: notification.userId,
          message: smsContent,
          priority: notification.priority
        })
      })

      if (!response.ok) {
        throw new Error(`SMS API error: ${response.statusText}`)
      }

      return {
        channel: 'SMS',
        success: true,
        deliveredAt: new Date()
      }
    } catch (error) {
      console.error('SMS notification failed:', error)
      return {
        channel: 'SMS',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  canHandle(notification: Notification): boolean {
    return notification.channels.includes('SMS')
  }

  getSupportedPriorities(): string[] {
    // SMS is expensive, only for important notifications
    return ['HIGH', 'URGENT']
  }

  validate(notification: Notification): string | null {
    if (!notification.message || notification.message.trim().length === 0) {
      return 'SMS content is required'
    }
    // SMS has character limit (160 for single message, 153 for concatenated)
    if (notification.message.length > 160) {
      return 'SMS message too long (max 160 characters)'
    }
    return null
  }

  /**
   * Format notification as SMS text
   * Keep it concise - SMS has character limits
   */
  private formatSMSContent(notification: Notification): string {
    const icon = this.getTypeIcon(notification.type)
    const priority = notification.priority === 'URGENT' ? '🚨 URGENT: ' : ''
    
    // Build short message
    let message = `${icon} ${priority}${notification.title}\n\n${notification.message}`

    // Truncate if needed (leave room for app name)
    const maxLength = 140 // Leave 20 chars for footer
    if (message.length > maxLength) {
      message = message.substring(0, maxLength - 3) + '...'
    }

    // Add app signature
    message += '\n\n- Expense Manager'

    return message
  }

  private getTypeIcon(type: string): string {
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
    return icons[type as keyof typeof icons] || '📱'
  }

  /**
   * Estimate SMS cost based on message length
   * (Assuming standard pricing)
   */
  estimateCost(message: string): number {
    const segments = Math.ceil(message.length / 153) // 153 chars for concatenated
    const costPerSegment = 0.0075 // $0.0075 per segment (example)
    return segments * costPerSegment
  }

  /**
   * Check if message will be split into multiple segments
   */
  willSplit(message: string): boolean {
    return message.length > 160
  }
}

// Singleton instance
export const smsNotificationStrategy = new SMSNotificationStrategy()
