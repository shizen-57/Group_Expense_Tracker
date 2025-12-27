/**
 * Notification Panel Component
 * 
 * Displays list of notifications in a dropdown panel
 */

import { useState } from 'react'
import { X, Check, CheckCheck, Trash2, Bell, AlertCircle, DollarSign, Users, UserPlus } from 'lucide-react'
import type { Notification } from '../../utils/notifications/types'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'

interface NotificationPanelProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClear: (id: string) => void
  onClearAll: () => void
  onClose: () => void
}

export function NotificationPanel({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onClearAll,
  onClose
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.readAt).length

  return (
    <Card className="absolute right-0 top-12 w-[380px] shadow-lg border-emerald-200 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b border-emerald-50">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onClearAll}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Notification List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
            <Bell className="h-12 w-12 mb-2 text-gray-300" />
            <p className="text-sm">No notifications</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-50">
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onClear={onClear}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onClear: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead, onClear }: NotificationItemProps) {
  const [hovering, setHovering] = useState(false)
  const isUnread = !notification.readAt

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id)
    }
    
    // Navigate if there's an action URL
    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl
    }
  }

  return (
    <div
      className={`p-3 transition-colors cursor-pointer relative ${
        isUnread ? 'bg-emerald-50/50' : 'hover:bg-gray-50'
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${isUnread ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            {isUnread && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}
            >
              {notification.priority}
            </Badge>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {hovering && (
          <div className="flex-shrink-0 flex flex-col gap-1">
            {isUnread && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onClear(notification.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function getNotificationIcon(type: string) {
  const iconMap: Record<string, JSX.Element> = {
    BUDGET_ALERT: <AlertCircle className="h-5 w-5" />,
    EXPENSE_ADDED: <DollarSign className="h-5 w-5" />,
    PAYMENT_REMINDER: <Bell className="h-5 w-5" />,
    FRIEND_REQUEST: <UserPlus className="h-5 w-5" />,
    GROUP_INVITE: <Users className="h-5 w-5" />,
    SETTLEMENT_REMINDER: <DollarSign className="h-5 w-5" />,
    RECURRING_EXPENSE: <DollarSign className="h-5 w-5" />,
    DEBT_SETTLED: <Check className="h-5 w-5" />
  }
  return iconMap[type] || <Bell className="h-5 w-5" />
}

function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500'
  }
  return colorMap[priority] || 'text-gray-500'
}

function getPriorityBadgeColor(priority: string): string {
  const colorMap: Record<string, string> = {
    LOW: 'border-gray-300 text-gray-600',
    MEDIUM: 'border-blue-300 text-blue-600',
    HIGH: 'border-orange-300 text-orange-600',
    URGENT: 'border-red-300 text-red-600'
  }
  return colorMap[priority] || 'border-gray-300 text-gray-600'
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return new Date(date).toLocaleDateString()
}