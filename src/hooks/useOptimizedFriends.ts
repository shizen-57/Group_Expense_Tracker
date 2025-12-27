import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function useOptimizedFriends(accessToken: string | null) {
  const queryClient = useQueryClient()

  // Fetch friends with caching
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', accessToken],
    queryFn: async () => {
      if (!accessToken) return []
      const data = await api.getFriends(accessToken)
      return Array.isArray(data) ? data : []
    },
    enabled: !!accessToken,
  })

  // Add friend by username mutation
  const addFriendMutation = useMutation({
    mutationFn: async (username: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.addFriend(accessToken, username)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', accessToken] })
      toast.success('Friend added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add friend')
    },
  })

  // Add friend by email mutation
  const addFriendByEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.addFriendByEmail(accessToken, email)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', accessToken] })
      toast.success('Friend added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add friend')
    },
  })

  // Add friend by code mutation
  const addFriendByCodeMutation = useMutation({
    mutationFn: async (friendCode: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.addFriendByCode(accessToken, friendCode)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', accessToken] })
      toast.success('Friend added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add friend')
    },
  })

  // Settle debt mutation
  const settleDebtMutation = useMutation({
    mutationFn: async ({ friendId, amount }: { friendId: string; amount: number }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.settleFriendDebt(accessToken, friendId, amount)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['activity', accessToken] })
      toast.success('Debt settled successfully')
    },
    onError: () => {
      toast.error('Failed to settle debt')
    },
  })

  // Search suggestions function (no caching needed for real-time search)
  const handleSearchSuggestions = async (query: string) => {
    if (!accessToken || !query) return []
    try {
      return await api.searchUsers(accessToken, query)
    } catch (error) {
      console.error('Failed to search users:', error)
      return []
    }
  }

  return {
    friends,
    loading: isLoading,
    handleAddFriend: addFriendMutation.mutateAsync,
    handleAddFriendByEmail: addFriendByEmailMutation.mutateAsync,
    handleAddFriendByCode: addFriendByCodeMutation.mutateAsync,
    handleSettleDebt: settleDebtMutation.mutateAsync,
    handleSearchSuggestions,
  }
}
