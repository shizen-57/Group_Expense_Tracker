import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'
import { useMemo } from 'react'

export function useOptimizedActivity(accessToken: string | null) {
  const { data: activityData = [], isLoading } = useQuery({
    queryKey: ['activity', accessToken],
    queryFn: async () => {
      if (!accessToken) return []
      const data = await api.getActivity(accessToken)
      return Array.isArray(data) ? data : []
    },
    enabled: !!accessToken,
  })

  // Memoized sorting and filtering
  const sortedActivity = useMemo(() => {
    return [...activityData].sort((a, b) => 
      new Date(b.createdAt || b.timestamp || 0).getTime() - 
      new Date(a.createdAt || a.timestamp || 0).getTime()
    )
  }, [activityData])

  return {
    activityData: sortedActivity,
    loading: isLoading,
  }
}
