/**
 * Notification Settings Component
 * 
 * Allows users to configure their notification preferences
 */

import { useState } from 'react'
import { Bell, Mail, Smartphone, MessageSquare, Moon, Clock } from 'lucide-react'
import type { NotificationPreferences } from '../../utils/notifications/types'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'

interface NotificationSettingsProps {
  preferences: NotificationPreferences | null
  onToggleChannel: (
    category: keyof NotificationPreferences['channels'],
    channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'
  ) => void
  onSetDoNotDisturb: (enabled: boolean, startTime?: string, endTime?: string) => void
  onSetDigestMode: (enabled: boolean, time?: string) => void
}

export function NotificationSettings({
  preferences,
  onToggleChannel,
  onSetDoNotDisturb,
  onSetDigestMode
}: NotificationSettingsProps) {
  const [dndStartTime, setDndStartTime] = useState(preferences?.doNotDisturb.startTime || '22:00')
  const [dndEndTime, setDndEndTime] = useState(preferences?.doNotDisturb.endTime || '08:00')
  const [digestTime, setDigestTime] = useState(preferences?.frequency.digestTime || '09:00')

  if (!preferences) {
    return (
      <Card className="p-6 bg-white">
        <p className="text-gray-500">Loading preferences...</p>
      </Card>
    )
  }

  const channels = [
    { id: 'IN_APP', name: 'In-App', icon: <Bell className="h-4 w-4" />, description: 'Show notifications in the app' },
    { id: 'EMAIL', name: 'Email', icon: <Mail className="h-4 w-4" />, description: 'Send email notifications' },
    { id: 'PUSH', name: 'Push', icon: <Smartphone className="h-4 w-4" />, description: 'Browser push notifications' },
    { id: 'SMS', name: 'SMS', icon: <MessageSquare className="h-4 w-4" />, description: 'Text message notifications (HIGH priority only)' }
  ]

  const categories = [
    { id: 'budgetAlerts', name: 'Budget Alerts', description: 'Get notified when you reach budget limits' },
    { id: 'expenseUpdates', name: 'Expense Updates', description: 'New expenses and settlements' },
    { id: 'paymentReminders', name: 'Payment Reminders', description: 'Upcoming payment due dates' },
    { id: 'socialUpdates', name: 'Social Updates', description: 'Friend requests and group invites' }
  ]

  return (
    <div className="space-y-6">
      {/* Notification Channels by Category */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Notification Channels</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose how you want to be notified for each type of event
        </p>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="mb-3">
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 ml-4">
                {channels.map((channel) => {
                  const isEnabled = preferences.channels[
                    category.id as keyof NotificationPreferences['channels']
                  ].includes(channel.id as any)

                  return (
                    <div
                      key={channel.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isEnabled 
                          ? 'border-emerald-300 bg-emerald-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() =>
                          onToggleChannel(
                            category.id as keyof NotificationPreferences['channels'],
                            channel.id as any
                          )
                        }
                      />
                      <div className="flex items-center gap-2">
                        {channel.icon}
                        <span className="text-sm">{channel.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {category.id !== 'socialUpdates' && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Do Not Disturb */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Moon className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold">Do Not Disturb</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Silence notifications during specific hours
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dnd-toggle">Enable Do Not Disturb</Label>
            <Switch
              id="dnd-toggle"
              checked={preferences.doNotDisturb.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSetDoNotDisturb(true, dndStartTime, dndEndTime)
                } else {
                  onSetDoNotDisturb(false)
                }
              }}
            />
          </div>

          {preferences.doNotDisturb.enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div>
                <Label htmlFor="dnd-start" className="text-xs text-gray-600">From</Label>
                <Input
                  id="dnd-start"
                  type="time"
                  value={dndStartTime}
                  onChange={(e) => setDndStartTime(e.target.value)}
                  onBlur={() => onSetDoNotDisturb(true, dndStartTime, dndEndTime)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dnd-end" className="text-xs text-gray-600">To</Label>
                <Input
                  id="dnd-end"
                  type="time"
                  value={dndEndTime}
                  onChange={(e) => setDndEndTime(e.target.value)}
                  onBlur={() => onSetDoNotDisturb(true, dndStartTime, dndEndTime)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Digest Mode */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Daily Digest</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Receive a summary of all notifications at a specific time each day
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-toggle">Enable Daily Digest</Label>
            <Switch
              id="digest-toggle"
              checked={preferences.frequency.digest}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSetDigestMode(true, digestTime)
                } else {
                  onSetDigestMode(false)
                }
              }}
            />
          </div>

          {preferences.frequency.digest && (
            <div className="pl-6">
              <Label htmlFor="digest-time" className="text-xs text-gray-600">Delivery time</Label>
              <Input
                id="digest-time"
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                onBlur={() => onSetDigestMode(true, digestTime)}
                className="mt-1 max-w-[200px]"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Channel Descriptions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-sm mb-3">Channel Information</h4>
        <div className="space-y-2 text-xs text-gray-700">
          <p><strong>In-App:</strong> Free, instant, always available</p>
          <p><strong>Email:</strong> Free, reliable, good for detailed information</p>
          <p><strong>Push:</strong> Free, instant, works even when app is closed</p>
          <p><strong>SMS:</strong> Charges may apply, best for urgent notifications</p>
        </div>
      </Card>
    </div>
  )
}