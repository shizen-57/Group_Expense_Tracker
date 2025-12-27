/**
 * Chain of Responsibility Pattern
 * 
 * Handles notification delivery with fallback mechanisms.
 * If one channel fails, tries the next in the chain.
 */

import type { Notification, DeliveryResult, NotificationChannel } from './types'
import type { INotificationStrategy } from './INotificationStrategy'

export interface IDeliveryHandler {
  setNext(handler: IDeliveryHandler): IDeliveryHandler
  handle(notification: Notification, preferredChannels: NotificationChannel[]): Promise<DeliveryResult[]>
}

export class DeliveryHandler implements IDeliveryHandler {
  private nextHandler: IDeliveryHandler | null = null

  constructor(private strategy: INotificationStrategy) {}

  setNext(handler: IDeliveryHandler): IDeliveryHandler {
    this.nextHandler = handler
    return handler
  }

  async handle(
    notification: Notification,
    preferredChannels: NotificationChannel[]
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = []

    // Try this handler's strategy if it's in preferred channels
    if (preferredChannels.includes(this.strategy.getChannel())) {
      // Check if strategy can handle this notification
      if (this.strategy.canHandle(notification)) {
        // Check priority support
        const supportedPriorities = this.strategy.getSupportedPriorities()
        if (supportedPriorities.includes(notification.priority)) {
          console.log(`Attempting delivery via ${this.strategy.getChannel()}...`)
          const result = await this.strategy.send(notification)
          results.push(result)

          // If delivery succeeded, we might still want to try other channels
          // (e.g., send both email AND push notification)
          // But if this is URGENT and succeeded, we can stop
          if (result.success && notification.priority === 'URGENT') {
            console.log(`✅ URGENT notification delivered via ${this.strategy.getChannel()}`)
            // Continue to next handler for redundancy
          }
        } else {
          console.log(
            `⏭️ Skipping ${this.strategy.getChannel()} - doesn't support ${notification.priority} priority`
          )
        }
      } else {
        console.log(`⏭️ Skipping ${this.strategy.getChannel()} - cannot handle notification`)
      }
    }

    // Pass to next handler in chain
    if (this.nextHandler) {
      const nextResults = await this.nextHandler.handle(notification, preferredChannels)
      results.push(...nextResults)
    }

    return results
  }
}

/**
 * FallbackDeliveryHandler
 * 
 * Tries each strategy in sequence until one succeeds
 * (Different from DeliveryHandler which tries all preferred channels)
 */
export class FallbackDeliveryHandler implements IDeliveryHandler {
  private nextHandler: IDeliveryHandler | null = null

  constructor(private strategy: INotificationStrategy) {}

  setNext(handler: IDeliveryHandler): IDeliveryHandler {
    this.nextHandler = handler
    return handler
  }

  async handle(
    notification: Notification,
    preferredChannels: NotificationChannel[]
  ): Promise<DeliveryResult[]> {
    const results: DeliveryResult[] = []

    // Try this handler's strategy if it's in preferred channels
    if (preferredChannels.includes(this.strategy.getChannel())) {
      if (this.strategy.canHandle(notification)) {
        const supportedPriorities = this.strategy.getSupportedPriorities()
        if (supportedPriorities.includes(notification.priority)) {
          console.log(`🔄 Fallback: Attempting ${this.strategy.getChannel()}...`)
          const result = await this.strategy.send(notification)
          results.push(result)

          // If this succeeded, stop the chain (fallback achieved)
          if (result.success) {
            console.log(`✅ Fallback successful via ${this.strategy.getChannel()}`)
            return results
          } else {
            console.log(`❌ ${this.strategy.getChannel()} failed: ${result.error}`)
          }
        }
      }
    }

    // This strategy failed or wasn't applicable, try next in chain
    if (this.nextHandler) {
      const nextResults = await this.nextHandler.handle(notification, preferredChannels)
      results.push(...nextResults)
    }

    return results
  }
}

/**
 * Smart Delivery Chain Builder
 * 
 * Builds the optimal delivery chain based on notification type and priority
 */
export class DeliveryChainBuilder {
  /**
   * Build a multi-channel delivery chain
   * Attempts all preferred channels simultaneously
   */
  static buildMultiChannel(strategies: INotificationStrategy[]): IDeliveryHandler {
    if (strategies.length === 0) {
      throw new Error('At least one strategy required')
    }

    const firstHandler = new DeliveryHandler(strategies[0])
    let currentHandler = firstHandler

    for (let i = 1; i < strategies.length; i++) {
      currentHandler = currentHandler.setNext(
        new DeliveryHandler(strategies[i])
      ) as DeliveryHandler
    }

    return firstHandler
  }

  /**
   * Build a fallback delivery chain
   * Tries each channel in sequence until one succeeds
   */
  static buildFallbackChain(strategies: INotificationStrategy[]): IDeliveryHandler {
    if (strategies.length === 0) {
      throw new Error('At least one strategy required')
    }

    const firstHandler = new FallbackDeliveryHandler(strategies[0])
    let currentHandler = firstHandler

    for (let i = 1; i < strategies.length; i++) {
      currentHandler = currentHandler.setNext(
        new FallbackDeliveryHandler(strategies[i])
      ) as FallbackDeliveryHandler
    }

    return firstHandler
  }

  /**
   * Build a priority-based chain
   * High priority: Multi-channel
   * Medium/Low priority: Fallback
   */
  static buildPriorityChain(
    notification: Notification,
    strategies: INotificationStrategy[]
  ): IDeliveryHandler {
    if (notification.priority === 'URGENT' || notification.priority === 'HIGH') {
      return this.buildMultiChannel(strategies)
    } else {
      return this.buildFallbackChain(strategies)
    }
  }
}

/**
 * Example Usage:
 * 
 * // Multi-channel delivery (try all)
 * const chain = DeliveryChainBuilder.buildMultiChannel([
 *   inAppStrategy,
 *   emailStrategy,
 *   pushStrategy
 * ])
 * 
 * const results = await chain.handle(notification, ['IN_APP', 'EMAIL', 'PUSH'])
 * 
 * // Fallback delivery (stop after first success)
 * const fallbackChain = DeliveryChainBuilder.buildFallbackChain([
 *   pushStrategy,    // Try push first
 *   emailStrategy,   // Fallback to email
 *   inAppStrategy    // Final fallback
 * ])
 * 
 * const results = await fallbackChain.handle(notification, ['PUSH', 'EMAIL', 'IN_APP'])
 */
