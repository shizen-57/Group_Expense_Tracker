import { Dashboard } from '../dashboard/Dashboard'
import { StatCardSkeleton } from '../ui/skeleton'

interface DashboardPageProps {
  stats: any
  loading: boolean
  onNavigate: (page: 'dashboard' | 'groups' | 'friends' | 'activity' | 'profile') => void
}

export function DashboardPage({ stats, loading, onNavigate }: DashboardPageProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="h-64 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No data available</div>
  }

  return <Dashboard stats={stats} onNavigate={onNavigate} />
}