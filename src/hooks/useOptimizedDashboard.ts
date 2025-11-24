import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { useMemo } from 'react'

export function useOptimizedDashboard(accessToken: string | null) {
  const queryClient = useQueryClient()

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['dashboard', accessToken],
    queryFn: async () => {
      if (!accessToken) return null
      return await api.getDashboardStats(accessToken)
    },
    enabled: !!accessToken,
  })

  // Memoized computed values
  const stats = useMemo(() => {
    if (!dashboardStats) return {
      totalExpenses: 0,
      monthlyExpenses: 0,
      totalBudget: 0,
      categories: []
    }
    return dashboardStats
  }, [dashboardStats])

  const refetchDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', accessToken] })
  }

  return {
    dashboardStats: stats,
    loading: isLoading,
    refetchDashboard,
  }
}
