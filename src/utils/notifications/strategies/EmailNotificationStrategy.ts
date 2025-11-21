/**
 * Strategy Pattern - Concrete Strategy
 * Email Notification Delivery
 */

import type { Notification, DeliveryResult } from '../types'
import type { INotificationStrategy } from '../INotificationStrategy'

export class EmailNotificationStrategy implements INotificationStrategy {
  private apiEndpoint: string

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || '/api/notifications/email'
  }

  getChannel() {
    return 'EMAIL' as const
  }

  async send(notification: Notification): Promise<DeliveryResult> {
    try {
      const validationError = this.validate(notification)
      if (validationError) {
        return {
          channel: 'EMAIL',
          success: false,
          error: validationError
        }
      }

      // Format email content
      const emailContent = this.formatEmailContent(notification)

      // Send email via backend API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: notification.id,
          userId: notification.userId,
          subject: notification.title,
          content: emailContent,
          priority: notification.priority
        })
      })

      if (!response.ok) {
        throw new Error(`Email API error: ${response.statusText}`)
      }

      return {
        channel: 'EMAIL',
        success: true,
        deliveredAt: new Date()
      }
    } catch (error) {
      console.error('Email notification failed:', error)
      return {
        channel: 'EMAIL',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  canHandle(notification: Notification): boolean {
    return notification.channels.includes('EMAIL')
  }

  getSupportedPriorities(): string[] {
    return ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
  }

  validate(notification: Notification): string | null {
    if (!notification.title || notification.title.trim().length === 0) {
      return 'Email subject is required'
    }
    if (!notification.message || notification.message.trim().length === 0) {
      return 'Email content is required'
    }
    if (notification.title.length > 200) {
      return 'Email subject too long (max 200 characters)'
    }
    return null
  }

  /**
   * Format notification as HTML email
   */
  private formatEmailContent(notification: Notification): string {
    const priorityColor = this.getPriorityColor(notification.priority)
    const icon = this.getTypeIcon(notification.type)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .priority-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background: ${priorityColor};
              color: white;
              margin-bottom: 15px;
            }
            .message {
              font-size: 16px;
              margin: 20px 0;
            }
            .action-button {
              display: inline-block;
              padding: 12px 24px;
              background: #10b981;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="icon">${icon}</div>
            <h1 style="margin: 0;">${notification.title}</h1>
          </div>
          <div class="content">
            <div class="priority-badge">${notification.priority} PRIORITY</div>
            <div class="message">${notification.message}</div>
            ${this.getActionButton(notification)}
          </div>
          <div class="footer">
            <p>This is an automated notification from Personal Expense Manager</p>
            <p>To manage your notification preferences, visit your profile settings</p>
          </div>
        </body>
      </html>
    `
  }

  private getPriorityColor(priority: string): string {
    const colors = {
      LOW: '#6b7280',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444',
      URGENT: '#dc2626'
    }
    return colors[priority as keyof typeof colors] || colors.MEDIUM
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
    return icons[type as keyof typeof icons] || '📬'
  }

  private getActionButton(notification: Notification): string {
    if (notification.data?.actionUrl) {
      return `
        <a href="${notification.data.actionUrl}" class="action-button">
          ${notification.data.actionText || 'View Details'}
        </a>
      `
    }
    return ''
  }
}

// Singleton instance
export const emailNotificationStrategy = new EmailNotificationStrategy()
