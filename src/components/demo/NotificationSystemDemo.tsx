/**
 * Multi-Channel Notification System Demo
 * 
 * Interactive demonstration of the notification system capabilities
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react'
import { NotificationTriggers } from '../../hooks/useNotificationSystem'
import { notificationManager } from '../../utils/notifications/NotificationManager'
import { 
  NotificationPriority, 
  NotificationType 
} from '../../utils/notifications/INotificationStrategy'
import { motion } from 'motion/react'

export function NotificationSystemDemo() {
  const [stats, setStats] = useState({
    totalSent: 0,
    inAppSent: 0,
    emailSent: 0,
    smsSent: 0,
    pushSent: 0
  })

  const triggerNotification = async (
    type: 'expense' | 'budget-alert' | 'budget-exceeded' | 'friend' | 'group' | 'payment'
  ) => {
    setStats(prev => ({ ...prev, totalSent: prev.totalSent + 1 }))

    switch (type) {
      case 'expense':
        NotificationTriggers.expenseAdded('Grocery shopping', 450.50, 'You')
        setStats(prev => ({ ...prev, inAppSent: prev.inAppSent + 1 }))
        break
      
      case 'budget-alert':
        NotificationTriggers.budgetAlert('Food', 800, 1000, 80)
        setStats(prev => ({ 
          ...prev, 
          inAppSent: prev.inAppSent + 1,
          emailSent: prev.emailSent + 1
        }))
        break
      
      case 'budget-exceeded':
        NotificationTriggers.budgetExceeded('Shopping', 1200, 1000)
        setStats(prev => ({ 
          ...prev, 
          inAppSent: prev.inAppSent + 1,
          emailSent: prev.emailSent + 1,
          smsSent: prev.smsSent + 1
        }))
        break
      
      case 'friend':
        NotificationTriggers.friendRequest('John Doe')
        setStats(prev => ({ 
          ...prev, 
          inAppSent: prev.inAppSent + 1,
          emailSent: prev.emailSent + 1,
          pushSent: prev.pushSent + 1
        }))
        break
      
      case 'group':
        NotificationTriggers.groupActivity('Trip Fund', 'New expense added by Sarah')
        setStats(prev => ({ ...prev, inAppSent: prev.inAppSent + 1 }))
        break
      
      case 'payment':
        NotificationTriggers.paymentDue('Rent payment', 15000, new Date(Date.now() + 86400000))
        setStats(prev => ({ 
          ...prev, 
          inAppSent: prev.inAppSent + 1,
          emailSent: prev.emailSent + 1,
          smsSent: prev.smsSent + 1,
          pushSent: prev.pushSent + 1
        }))
        break
    }
  }

  const notificationTypes = [
    {
      id: 'expense',
      title: 'Expense Added',
      description: 'Low priority, In-App only',
      icon: Wallet,
      color: 'bg-blue-500',
      priority: 'LOW',
      channels: ['In-App']
    },
    {
      id: 'budget-alert',
      title: 'Budget Alert',
      description: 'Medium priority, In-App + Email',
      icon: AlertCircle,
      color: 'bg-yellow-500',
      priority: 'MEDIUM',
      channels: ['In-App', 'Email']
    },
    {
      id: 'budget-exceeded',
      title: 'Budget Exceeded',
      description: 'High priority, All except Push',
      icon: TrendingUp,
      color: 'bg-red-500',
      priority: 'HIGH',
      channels: ['In-App', 'Email', 'SMS']
    },
    {
      id: 'friend',
      title: 'Friend Request',
      description: 'Medium priority, Multi-channel',
      icon: Users,
      color: 'bg-purple-500',
      priority: 'MEDIUM',
      channels: ['In-App', 'Email', 'Push']
    },
    {
      id: 'group',
      title: 'Group Activity',
      description: 'Low priority, In-App only',
      icon: Users,
      color: 'bg-emerald-500',
      priority: 'LOW',
      channels: ['In-App']
    },
    {
      id: 'payment',
      title: 'Payment Due',
      description: 'Urgent priority, All channels',
      icon: Zap,
      color: 'bg-orange-500',
      priority: 'URGENT',
      channels: ['In-App', 'Email', 'SMS', 'Push']
    }
  ]

  const channels = [
    {
      name: 'In-App',
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      count: stats.inAppSent,
      description: 'Toast notifications'
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      count: stats.emailSent,
      description: 'HTML emails'
    },
    {
      name: 'SMS',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      count: stats.smsSent,
      description: '160 char limit'
    },
    {
      name: 'Push',
      icon: Smartphone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      count: stats.pushSent,
      description: 'Browser push'
    }
  ]

  const priorityInfo = [
    {
      level: 'LOW',
      color: 'bg-gray-500',
      description: 'Info updates, can wait',
      example: 'Expense added, Group activity'
    },
    {
      level: 'MEDIUM',
      color: 'bg-yellow-500',
      description: 'Important but not urgent',
      example: 'Budget alert, Friend request'
    },
    {
      level: 'HIGH',
      color: 'bg-orange-500',
      description: 'Requires attention soon',
      example: 'Budget exceeded, Payment reminder'
    },
    {
      level: 'URGENT',
      color: 'bg-red-500',
      description: 'Immediate action required',
      example: 'Payment due today, Critical alert'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl">Multi-Channel Notification System</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A production-ready notification infrastructure supporting 4 delivery channels,
          9 notification types, and 4 priority levels with real-time UI updates.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="col-span-1 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">{stats.totalSent}</div>
            <div className="text-sm text-gray-600">Total Sent</div>
          </CardContent>
        </Card>

        {channels.map((channel) => (
          <Card key={channel.name} className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-full ${channel.bgColor} mb-3`}>
                <channel.icon className={`h-6 w-6 ${channel.color}`} />
              </div>
              <div className="text-2xl mb-1">{channel.count}</div>
              <div className="text-sm font-medium mb-1">{channel.name}</div>
              <div className="text-xs text-gray-500">{channel.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Types */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Trigger Notifications</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Click any card to trigger a notification and see it in action!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notificationTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all"
                  onClick={() => triggerNotification(type.id as any)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 ${type.color} rounded-xl`}>
                        <type.icon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{type.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              type.priority === 'URGENT' ? 'border-red-500 text-red-700' :
                              type.priority === 'HIGH' ? 'border-orange-500 text-orange-700' :
                              type.priority === 'MEDIUM' ? 'border-yellow-500 text-yellow-700' :
                              'border-gray-500 text-gray-700'
                            }`}
                          >
                            {type.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {type.channels.map(channel => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Priority Levels</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Different priorities trigger different delivery channels
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityInfo.map((priority) => (
                <div 
                  key={priority.level}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`w-3 h-3 ${priority.color} rounded-full mt-1`} />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{priority.level}</div>
                    <div className="text-sm text-gray-600 mb-2">{priority.description}</div>
                    <div className="text-xs text-gray-500">Example: {priority.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Design Patterns */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Design Patterns</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Built with industry-standard architectural patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Strategy Pattern</div>
                  <div className="text-xs text-gray-600">Multiple delivery strategies (In-App, Email, SMS, Push)</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Observer Pattern</div>
                  <div className="text-xs text-gray-600">Real-time UI updates when notifications arrive</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Template Method</div>
                  <div className="text-xs text-gray-600">Standardized notification sending workflow</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Factory Pattern</div>
                  <div className="text-xs text-gray-600">Dynamic strategy creation from user preferences</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Singleton Pattern</div>
                  <div className="text-xs text-gray-600">Single notification manager instance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card className="border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Multi-Channel</div>
                <div className="text-xs text-gray-600">4 delivery channels supported</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Real-time Updates</div>
                <div className="text-xs text-gray-600">Instant UI synchronization</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">User Preferences</div>
                <div className="text-xs text-gray-600">Customizable channels & quiet hours</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Priority-based</div>
                <div className="text-xs text-gray-600">4 levels from low to urgent</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Read/Unread</div>
                <div className="text-xs text-gray-600">Track notification status</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Performance</div>
                <div className="text-xs text-gray-600">Optimized with caching & batching</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium mb-2">How to Use</div>
              <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                <li>Click any notification card above to trigger it</li>
                <li>Check the bell icon in the navigation to see notifications</li>
                <li>Toast notifications will appear at the bottom of the screen</li>
                <li>Console logs show Email/SMS/Push notifications (simulated)</li>
                <li>Try different notification types to see different priorities and channels</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
