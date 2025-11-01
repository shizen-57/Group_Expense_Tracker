import { Dashboard } from '../dashboard/Dashboard'

interface DashboardPageProps {
  stats: any
  loading: boolean
  onNavigate: (page: 'dashboard' | 'groups' | 'friends' | 'activity' | 'profile') => void
}

export function DashboardPage({ stats, loading, onNavigate }: DashboardPageProps) {
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">No data available</div>
  }

  return <Dashboard stats={stats} onNavigate={onNavigate} />
}
