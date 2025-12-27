# Notification System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS / EVENTS                                │
│  (Add Expense, Create Group, Budget Threshold, Friend Request, etc.)       │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EVENT INTEGRATION LAYER                                 │
│                                                                               │
│  ┌─────────────────┐   ┌──────────────────┐   ┌─────────────────────┐     │
│  │  App Components │──▶│ NotificationTriggers │──▶│ Custom Events    │     │
│  │  (UI Actions)   │   │  (Helper Methods)  │   │ (Window Events)   │     │
│  └─────────────────┘   └──────────────────┘   └─────────────────────┘     │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION MANAGER (Template Method)                    │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Template Method Algorithm:                                      │        │
│  │  1. validate()         → Check notification data                │        │
│  │  2. isQuietHours()     → Respect user sleep time                │        │
│  │  3. getStrategies()    → Select delivery channels                │        │
│  │  4. format()           → Prepare notification                    │        │
│  │  5. send()             → Dispatch to channels                    │        │
│  │  6. log()              → Record results                          │        │
│  │  7. notifyObservers()  → Update UI components                    │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STRATEGY FACTORY (Factory Pattern)                      │
│                                                                               │
│  Selects strategies based on:                                                │
│  • Notification Priority (LOW, MEDIUM, HIGH, URGENT)                        │
│  • User Preferences (Enabled channels)                                      │
│  • Time of Day (Quiet hours)                                                │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
              ┌────────────────┼───────────────┬─────────────┐
              │                │               │             │
              ▼                ▼               ▼             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION STRATEGIES (Strategy Pattern)              │
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  ┌─────────────┐ │
│  │   In-App       │  │     Email      │  │    SMS     │  │    Push     │ │
│  │  ──────────    │  │  ──────────    │  │ ──────────  │  │ ─────────── │ │
│  │                │  │                │  │            │  │             │ │
│  │ • Toast UI     │  │ • HTML format  │  │ • 160 char │  │ • Browser   │ │
│  │ • All priority │  │ • MED/HIGH/URG │  │ • HIGH/URG │  │ • All prior │ │
│  │ • Instant      │  │ • Async send   │  │ • Twilio   │  │ • Service   │ │
│  │ • Sonner lib   │  │ • SendGrid/SES │  │ • Instant  │  │   Worker    │ │
│  │                │  │                │  │            │  │             │ │
│  └────────┬───────┘  └────────┬───────┘  └──────┬─────┘  └──────┬──────┘ │
│           │                   │                  │                │        │
└───────────┼───────────────────┼──────────────────┼────────────────┼────────┘
            │                   │                  │                │
            └───────────────────┴──────────────────┴────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  NOTIFICATION OBSERVABLE (Observer Pattern)                  │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │  Observable Store:                                              │         │
│  │  • Stores last 100 notifications                               │         │
│  │  • Tracks read/unread status                                   │         │
│  │  • Manages multiple observers                                  │         │
│  │  • Type-specific subscriptions                                 │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
│  Observer Methods:                                                           │
│  • subscribe(observer)              → All notifications                     │
│  • subscribeToType(type, observer)  → Specific types only                   │
│  • notify(notification)             → Broadcast to observers                │
│                                                                               │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UI COMPONENTS (Observers)                            │
│                                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐     │
│  │ NotificationCenter│  │ NotificationBell │  │  Custom Components   │     │
│  │ ──────────────── │  │ ──────────────── │  │  ──────────────────  │     │
│  │                  │  │                  │  │                      │     │
│  │ • Dropdown list  │  │ • Unread badge   │  │ • Budget widgets     │     │
│  │ • Mark as read   │  │ • Click to open  │  │ • Activity feed      │     │
│  │ • Clear all      │  │ • Animated       │  │ • Alert panels       │     │
│  │ • Scrollable     │  │                  │  │                      │     │
│  │                  │  │                  │  │                      │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### 1. User Adds an Expense

```
User Action                  System Response
───────────                  ───────────────

1. Click "Add Expense"
                        ──▶  UI Component validates input
                        
2. Fill form & submit
                        ──▶  API call to create expense
                        
3. Expense created
                        ──▶  NotificationTriggers.expenseAdded()
                        
4. Trigger fires event
                        ──▶  window.dispatchEvent('expense:added')
                        
5. Event listener catches
                        ──▶  useNotificationSystem hook
                        
6. Hook creates notification
                        ──▶  NotificationHelper.expenseAdded()
                        
7. Send notification
                        ──▶  notificationManager.sendNotification()
                        
8. Template method executes
                        ──▶  validate → getStrategies → send
                        
9. Strategy sends
                        ──▶  InAppNotificationStrategy.send()
                        
10. Toast appears
                        ──▶  toast.success("Expense Added")
                        
11. Observable notified
                        ──▶  notificationObservable.notify()
                        
12. UI updates
                        ──▶  NotificationCenter re-renders
                        
13. Bell badge updates
                        ──▶  Shows "1 unread"
```

### 2. Budget Threshold Reached

```
Budget Check                 Multi-Channel Response
────────────                 ──────────────────────

1. Expense added
                        ──▶  BudgetMonitor checks thresholds
                        
2. 80% threshold reached
                        ──▶  NotificationTriggers.budgetAlert()
                        
3. Create MEDIUM priority
                        ──▶  NotificationData with priority: MEDIUM
                        
4. Strategy selection
                        ──▶  Factory creates [InApp, Email]
                        
5. Parallel send
                        ──▶  Promise.allSettled([inApp, email])
                        
6. In-App executes
                        ──▶  toast.warning("Budget Alert - 80%")
                        
7. Email queued
                        ──▶  EmailService.send() (async)
                        
8. Both complete
                        ──▶  Results: [{success: true}, {success: true}]
                        
9. Log results
                        ──▶  console.log("2/2 channels successful")
                        
10. UI updates
                        ──▶  Notification appears in center
```

### 3. Urgent Payment Due

```
Payment Checker              All-Channel Alert
───────────────             ─────────────────

1. Daily cron job
                        ──▶  Check due dates
                        
2. Payment due today
                        ──▶  NotificationTriggers.paymentDue()
                        
3. Create URGENT priority
                        ──▶  NotificationData with priority: URGENT
                        
4. Strategy selection
                        ──▶  Factory creates [InApp, Email, SMS, Push]
                        
5. Parallel send to all
                        ──▶  Promise.allSettled(all strategies)
                        
6. In-App executes
                        ──▶  toast.error("URGENT: Payment Due!")
                        
7. Email sends
                        ──▶  HTML email with "PAY NOW" button
                        
8. SMS sends
                        ──▶  "Payment ৳15000 due TODAY for Rent"
                        
9. Push notification
                        ──▶  Browser notification (sticky)
                        
10. All complete
                        ──▶  Results: [{...}, {...}, {...}, {...}]
                        
11. User alerted everywhere
                        ──▶  Maximum visibility achieved
```

---

## Data Models

### NotificationData
```typescript
interface NotificationData {
  id: string                    // Unique identifier
  userId: string                // Recipient user ID
  title: string                 // Short title
  message: string               // Full message
  type: NotificationType        // Category
  priority: NotificationPriority // Urgency level
  data?: Record<string, any>    // Additional metadata
  createdAt: Date               // Timestamp
}
```

### NotificationResult
```typescript
interface NotificationResult {
  success: boolean              // Did it send?
  channel: string               // Which channel?
  sentAt: Date                  // When sent?
  error?: string                // Error message if failed
}
```

### UserNotificationPreferences
```typescript
interface UserNotificationPreferences {
  userId: string
  
  // Channel toggles
  inAppEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  
  // Quiet hours (24-hour format)
  quietHoursStart?: number      // e.g., 22 (10 PM)
  quietHoursEnd?: number        // e.g., 8 (8 AM)
  
  // Type-specific preferences
  notificationTypes?: {
    [key: string]: {
      enabled: boolean
      channels: string[]
    }
  }
}
```

---

## State Management

### Observable State
```typescript
class NotificationObservable {
  private observers: Map<string, Set<Observer>>  // Type-specific
  private allObservers: Set<Observer>            // All notifications
  private notifications: NotificationData[]      // Storage (max 100)
  
  // Computed state
  getUnreadCount(): number
  getNotificationsByType(type): NotificationData[]
  
  // Mutations
  markAsRead(id: string): void
  markAllAsRead(): void
  clearAll(): void
}
```

### React Hook State
```typescript
function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    // Subscribe to observable
    const unsubscribe = notificationObservable.subscribe((notification) => {
      setNotifications([...notificationObservable.getNotifications()])
      setUnreadCount(notificationObservable.getUnreadCount())
    })
    
    return () => unsubscribe()
  }, [])
  
  return { notifications, unreadCount, markAsRead, markAllAsRead, clearAll }
}
```

---

## Performance Optimizations

### 1. Batching
```typescript
class NotificationBatcher {
  private queue: NotificationData[] = []
  private timeout: NodeJS.Timeout | null = null
  
  add(notification: NotificationData) {
    this.queue.push(notification)
    
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.flush()
      }, 1000) // Batch for 1 second
    }
  }
  
  flush() {
    if (this.queue.length > 0) {
      notificationManager.sendBatch(this.queue)
      this.queue = []
    }
    this.timeout = null
  }
}
```

### 2. Debouncing
```typescript
import { debounce } from 'lodash'

// Prevent budget alert spam
const debouncedBudgetAlert = debounce(
  (category, spent, limit, percentage) => {
    NotificationTriggers.budgetAlert(category, spent, limit, percentage)
  },
  5000, // Max 1 per 5 seconds per category
  { leading: true, trailing: false }
)
```

### 3. Caching
```typescript
class NotificationCache {
  private cache: Map<string, NotificationData[]> = new Map()
  private TTL = 5 * 60 * 1000 // 5 minutes
  
  get(userId: string): NotificationData[] | null {
    const cached = this.cache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data
    }
    return null
  }
  
  set(userId: string, data: NotificationData[]) {
    this.cache.set(userId, {
      data,
      timestamp: Date.now()
    })
  }
}
```

### 4. Memory Management
```typescript
// Limit stored notifications to 100
private storeNotification(notification: NotificationData): void {
  this.notifications.unshift(notification)
  
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(0, 100)
  }
}

// Auto-cleanup old notifications
setInterval(() => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  notificationObservable.notifications = 
    notificationObservable.notifications.filter(
      n => n.createdAt.getTime() > oneWeekAgo
    )
}, 24 * 60 * 60 * 1000) // Daily cleanup
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('NotificationManager', () => {
  it('should select correct strategies based on priority', () => {
    const notification = {
      priority: NotificationPriority.HIGH,
      type: NotificationType.BUDGET_EXCEEDED
    }
    
    const strategies = manager.getStrategies(notification)
    
    expect(strategies).toHaveLength(3) // InApp, Email, SMS
    expect(strategies.map(s => s.getName())).toContain('Email')
  })
  
  it('should respect quiet hours for low priority', () => {
    jest.setSystemTime(new Date('2024-01-01 23:00:00')) // 11 PM
    
    const notification = { priority: NotificationPriority.LOW }
    const results = await manager.sendNotification(notification)
    
    expect(results[0].channel).toBe('Deferred')
  })
  
  it('should ignore quiet hours for urgent priority', () => {
    jest.setSystemTime(new Date('2024-01-01 23:00:00'))
    
    const notification = { priority: NotificationPriority.URGENT }
    const results = await manager.sendNotification(notification)
    
    expect(results[0].channel).not.toBe('Deferred')
  })
})
```

### Integration Tests
```typescript
describe('End-to-end notification flow', () => {
  it('should send notification through all channels for urgent priority', async () => {
    const spy = jest.spyOn(notificationObservable, 'notify')
    
    await NotificationTriggers.paymentDue('Rent', 15000, new Date())
    
    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0].priority).toBe('urgent')
    
    // Check UI updated
    const { unreadCount } = useNotifications()
    expect(unreadCount).toBe(1)
  })
})
```

---

## Security Considerations

### 1. Input Sanitization
```typescript
protected validate(notification: NotificationData): boolean {
  // Sanitize HTML in message
  notification.message = DOMPurify.sanitize(notification.message)
  
  // Validate user ID
  if (!notification.userId.match(/^[a-zA-Z0-9-_]+$/)) {
    return false
  }
  
  return true
}
```

### 2. Rate Limiting
```typescript
class RateLimiter {
  private counts: Map<string, number> = new Map()
  private limit = 10 // 10 notifications per minute per user
  
  canSend(userId: string): boolean {
    const count = this.counts.get(userId) || 0
    
    if (count >= this.limit) {
      return false
    }
    
    this.counts.set(userId, count + 1)
    
    // Reset after 1 minute
    setTimeout(() => {
      this.counts.delete(userId)
    }, 60000)
    
    return true
  }
}
```

### 3. Permission Checks
```typescript
async send(notification: NotificationData) {
  // Check if user has permission to receive this notification
  const hasPermission = await checkUserPermission(
    notification.userId,
    notification.type
  )
  
  if (!hasPermission) {
    throw new Error('User does not have permission')
  }
  
  // Continue with sending...
}
```

---

## Deployment Checklist

- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Configure SMS service (Twilio/AWS SNS)
- [ ] Set up push notification certificates
- [ ] Configure environment variables
- [ ] Set up notification queue (Redis/RabbitMQ)
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Create database tables for notification logs
- [ ] Configure backup/retry mechanisms
- [ ] Test all channels in production
- [ ] Set up analytics tracking
- [ ] Configure notification preferences UI
- [ ] Test quiet hours functionality
- [ ] Verify mobile responsiveness
- [ ] Load test with high volume

---

## Monitoring & Alerts

### Metrics to Track
```typescript
interface NotificationMetrics {
  totalSent: number
  successRate: number
  failureRate: number
  
  byChannel: {
    inApp: { sent: number, success: number }
    email: { sent: number, success: number }
    sms: { sent: number, success: number }
    push: { sent: number, success: number }
  }
  
  byType: {
    [key: string]: {
      sent: number
      readRate: number
      clickRate: number
    }
  }
  
  averageDeliveryTime: number
  queueLength: number
}
```

### Alert Thresholds
- Email delivery failure rate > 5%
- SMS delivery failure rate > 2%
- Average delivery time > 5 seconds
- Queue length > 1000
- Unread notifications > 100 per user

---

This architecture ensures scalability, reliability, and excellent user experience! 🚀
