import { useState } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function useDashboard(accessToken: string | null) {
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDashboard = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const stats = await api.getDashboardStats(accessToken)
      setDashboardStats(stats)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  return {
    dashboardStats,
    loading,
    fetchDashboard,
  }
}
