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
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p className="text-gray-600">No activity yet</p>
          <p className="text-sm text-gray-500 mt-1">Start adding expenses to see them here!</p>
        </CardContent>
      </Card>
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
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                onGroupClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onGroupClick?.(activity.groupId)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <Receipt className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {activity.groupName}
                    </span>
                    <span>•</span>
                    <span>By {activity.paidBy}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm font-medium text-gray-900">৳{activity.amount.toFixed(2)}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">
                  {activity.involvedUsers} people
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
