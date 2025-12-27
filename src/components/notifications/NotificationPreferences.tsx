/**
 * Notification Preferences Component
 * 
 * Allows users to configure their notification preferences.
 */

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { toast } from 'sonner@2.0.3'
import {
  UserNotificationPreferences,
  defaultNotificationPreferences
} from '../../utils/notifications/NotificationFactory'
import { PushNotificationStrategy } from '../../utils/notifications/NotificationStrategies'
import { notificationManager } from '../../utils/notifications/NotificationManager'

interface NotificationPreferencesProps {
  userId: string
  onSave?: (preferences: UserNotificationPreferences) => void
}

export function NotificationPreferences({ userId, onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({
    ...defaultNotificationPreferences,
    userId
  })
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check push notification permission
    if ('Notification' in window) {
      setPushPermission(Notification.permission)
    }
  }, [])

  const handleToggle = (key: keyof UserNotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleRequestPushPermission = async () => {
    const permission = await PushNotificationStrategy.requestPermission()
    setPushPermission(permission)
    
    if (permission === 'granted') {
      toast.success('Push notifications enabled!')
      setPreferences(prev => ({ ...prev, pushEnabled: true }))
    } else {
      toast.error('Push notifications denied')
      setPreferences(prev => ({ ...prev, pushEnabled: false }))
    }
  }

  const handleSave = () => {
    // Update notification manager with new preferences
    notificationManager.setUserPreferences(userId, preferences)
    
    // Call parent callback
    onSave?.(preferences)
    
    toast.success('Notification preferences saved!')
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
          <p className="text-sm text-gray-600">
            Choose how you want to receive notifications
          </p>
        </div>

        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <Label htmlFor="in-app" className="text-sm font-medium cursor-pointer">
                In-App Notifications
              </Label>
              <p className="text-xs text-gray-500">
                Show notifications within the app
              </p>
            </div>
          </div>
          <Switch
            id="in-app"
            checked={preferences.inAppEnabled}
            onCheckedChange={() => handleToggle('inAppEnabled')}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Label htmlFor="push" className="text-sm font-medium cursor-pointer">
                Push Notifications
              </Label>
              <p className="text-xs text-gray-500">
                Browser push notifications
                {pushPermission === 'denied' && ' (blocked by browser)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pushPermission === 'default' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRequestPushPermission}
              >
                Enable
              </Button>
            )}
            {pushPermission === 'granted' && (
              <Switch
                id="push"
                checked={preferences.pushEnabled}
                onCheckedChange={() => handleToggle('pushEnabled')}
              />
            )}
            {pushPermission === 'denied' && (
              <span className="text-xs text-red-500">Blocked</span>
            )}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-xs text-gray-500">
                Send important updates via email
              </p>
            </div>
          </div>
          <Switch
            id="email"
            checked={preferences.emailEnabled}
            onCheckedChange={() => handleToggle('emailEnabled')}
          />
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <Label htmlFor="sms" className="text-sm font-medium cursor-pointer">
                SMS Notifications
              </Label>
              <p className="text-xs text-gray-500">
                Urgent alerts via text message
              </p>
            </div>
          </div>
          <Switch
            id="sms"
            checked={preferences.smsEnabled}
            onCheckedChange={() => handleToggle('smsEnabled')}
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleSave} className="w-full">
            Save Preferences
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Note:</strong> High priority notifications may still be sent 
            through multiple channels regardless of your preferences to ensure 
            important updates reach you.
          </p>
        </div>
      </div>
    </Card>
  )
}
