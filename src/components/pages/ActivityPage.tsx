import { ActivityList } from '../activity/ActivityList'
import { BalanceSummary } from '../activity/BalanceSummary'

interface ActivityPageProps {
  activityData: any
  loading: boolean
  onGroupClick: (groupId: string) => void
}

export function ActivityPage({ activityData, loading, onGroupClick }: ActivityPageProps) {
  return (
    <div className="space-y-6">
      <h2>Activity</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : activityData ? (
        <>
          <BalanceSummary
            totalBalance={activityData.totalBalance || 0}
            totalOwed={activityData.totalOwed || 0}
            totalReceiving={activityData.totalReceiving || 0}
          />
          <ActivityList
            activities={activityData.activities || []}
            onGroupClick={onGroupClick}
          />
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">No activity data</div>
      )}
    </div>
  )
}
