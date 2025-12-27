/**
 * Factory Pattern - Notification Strategy Factory
 * 
 * Creates appropriate notification strategies based on configuration.
 * Centralizes strategy creation logic.
 */

import {
  INotificationStrategy,
  NotificationPriority
} from './INotificationStrategy'
import {
  InAppNotificationStrategy,
  EmailNotificationStrategy,
  SMSNotificationStrategy,
  PushNotificationStrategy,
  MultiChannelNotificationStrategy
} from './NotificationStrategies'

export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push' | 'all'

export interface UserNotificationPreferences {
  userId: string
  channels: NotificationChannel[]
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  quietHoursStart?: number // Hour (0-23)
  quietHoursEnd?: number // Hour (0-23)
}

/**
 * Factory for creating notification strategies
 */
export class NotificationStrategyFactory {
  private static emailEndpoint = '/api/notifications/email'
  private static smsEndpoint = '/api/notifications/sms'

  /**
   * Create a single notification strategy
   */
  static createStrategy(channel: NotificationChannel): INotificationStrategy {
    switch (channel) {
      case 'in-app':
        return new InAppNotificationStrategy()
      
      case 'email':
        return new EmailNotificationStrategy(this.emailEndpoint)
      
      case 'sms':
        return new SMSNotificationStrategy(this.smsEndpoint)
      
      case 'push':
        return new PushNotificationStrategy()
      
      case 'all':
        return new MultiChannelNotificationStrategy([
          new InAppNotificationStrategy(),
          new EmailNotificationStrategy(this.emailEndpoint),
          new PushNotificationStrategy()
        ])
      
      default:
        throw new Error(`Unknown notification channel: ${channel}`)
    }
  }

  /**
   * Create strategies based on user preferences
   */
  static createFromPreferences(
    preferences: UserNotificationPreferences
  ): INotificationStrategy[] {
    const strategies: INotificationStrategy[] = []

    if (preferences.inAppEnabled) {
      strategies.push(new InAppNotificationStrategy())
    }

    if (preferences.emailEnabled) {
      strategies.push(new EmailNotificationStrategy(this.emailEndpoint))
    }

    if (preferences.smsEnabled) {
      strategies.push(new SMSNotificationStrategy(this.smsEndpoint))
    }

    if (preferences.pushEnabled) {
      strategies.push(new PushNotificationStrategy())
    }

    return strategies
  }

  /**
   * Create strategy based on priority level
   */
  static createForPriority(priority: NotificationPriority): INotificationStrategy {
    switch (priority) {
      case NotificationPriority.LOW:
        // Low priority: in-app only
        return new InAppNotificationStrategy()
      
      case NotificationPriority.MEDIUM:
        // Medium priority: in-app + push
        return new MultiChannelNotificationStrategy([
          new InAppNotificationStrategy(),
          new PushNotificationStrategy()
        ])
      
      case NotificationPriority.HIGH:
        // High priority: in-app + push + email
        return new MultiChannelNotificationStrategy([
          new InAppNotificationStrategy(),
          new PushNotificationStrategy(),
          new EmailNotificationStrategy(this.emailEndpoint)
        ])
      
      case NotificationPriority.URGENT:
        // Urgent: all channels
        return new MultiChannelNotificationStrategy([
          new InAppNotificationStrategy(),
          new PushNotificationStrategy(),
          new EmailNotificationStrategy(this.emailEndpoint),
          new SMSNotificationStrategy(this.smsEndpoint)
        ])
      
      default:
        return new InAppNotificationStrategy()
    }
  }

  /**
   * Configure API endpoints
   */
  static configure(config: { emailEndpoint?: string; smsEndpoint?: string }) {
    if (config.emailEndpoint) {
      this.emailEndpoint = config.emailEndpoint
    }
    if (config.smsEndpoint) {
      this.smsEndpoint = config.smsEndpoint
    }
  }
}

/**
 * Default notification preferences
 */
export const defaultNotificationPreferences: UserNotificationPreferences = {
  userId: '',
  channels: ['in-app', 'push'],
  emailEnabled: false,
  smsEnabled: false,
  pushEnabled: true,
  inAppEnabled: true,
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8 // 8 AM
}
