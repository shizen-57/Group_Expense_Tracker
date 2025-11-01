import { useState } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function useActivity(accessToken: string | null) {
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchActivity = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const actData = await api.getActivity(accessToken)
      setActivityData(actData)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      toast.error('Failed to load activity')
    } finally {
      setLoading(false)
    }
  }

  return {
    activityData,
    loading,
    fetchActivity,
  }
}
