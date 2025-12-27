/**
 * Notification Center Component
 * 
 * Displays all notifications in a dropdown panel.
 * Uses Observer Pattern to reactively update when new notifications arrive.
 */

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { useNotifications } from '../../utils/notifications/NotificationObservable'
import { NotificationData, NotificationType } from '../../utils/notifications/INotificationStrategy'
import { motion, AnimatePresence } from 'motion/react'

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case NotificationType.EXPENSE_ADDED:
      return '💰'
    case NotificationType.BUDGET_ALERT:
      return '⚠️'
    case NotificationType.BUDGET_EXCEEDED:
      return '🚨'
    case NotificationType.FRIEND_REQUEST:
      return '👋'
    case NotificationType.SETTLEMENT_REMINDER:
      return '💳'
    case NotificationType.PAYMENT_DUE:
      return '⏰'
    case NotificationType.GROUP_ACTIVITY:
      return '👥'
    case NotificationType.DEBT_SIMPLIFIED:
      return '✅'
    case NotificationType.MEMBER_ADDED:
      return '➕'
    default:
      return '📬'
  }
}

/**
 * Get color for notification type
 */
function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case NotificationType.BUDGET_EXCEEDED:
      return 'bg-red-500/10 border-red-500/20'
    case NotificationType.BUDGET_ALERT:
      return 'bg-yellow-500/10 border-yellow-500/20'
    case NotificationType.FRIEND_REQUEST:
      return 'bg-blue-500/10 border-blue-500/20'
    case NotificationType.PAYMENT_DUE:
      return 'bg-orange-500/10 border-orange-500/20'
    default:
      return 'bg-emerald-500/10 border-emerald-500/20'
  }
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Individual notification item
 */
function NotificationItem({ 
  notification, 
  onMarkAsRead 
}: { 
  notification: NotificationData
  onMarkAsRead: (id: string) => void
}) {
  const isRead = notification.data?.read === true

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        p-3 rounded-lg border transition-all
        ${getNotificationColor(notification.type)}
        ${isRead ? 'opacity-60' : 'opacity-100'}
        hover:opacity-100
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm">
              {notification.title}
            </h4>
            {!isRead && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
            
            {!isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-6 px-2 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark read
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Main Notification Center Component
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant="destructive" 
                className="h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAll}
                className="h-8 w-8"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <ScrollArea className="h-[400px]">
          <div className="p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see updates here when something happens
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
