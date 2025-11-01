import { Card, CardContent } from '../ui/card'
import { Receipt, Users } from 'lucide-react'

interface Activity {
  id: string
  type: string
  description: string
  amount: number
  groupName: string
  groupId: string
  paidBy: string
  createdBy: string
  createdAt: string
  involvedUsers: number
}

interface ActivityListProps {
  activities: Activity[]
  onGroupClick?: (groupId: string) => void
}

export function ActivityList({ activities, onGroupClick }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No activity yet. Start adding expenses to see them here!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card 
          key={activity.id}
          className={onGroupClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
          onClick={() => onGroupClick?.(activity.groupId)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <Receipt className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p>{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {activity.groupName}
                    </span>
                    <span>•</span>
                    <span>Paid by {activity.paidBy}</span>
                    <span>•</span>
                    <span>{activity.involvedUsers} people</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-green-600">${activity.amount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
