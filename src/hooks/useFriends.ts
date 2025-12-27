import { useState } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function useFriends(accessToken: string | null) {
  const [friends, setFriends] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFriends = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const friendsData = await api.getFriends(accessToken)
      setFriends(Array.isArray(friendsData) ? friendsData : [])
    } catch (error) {
      console.error('Failed to fetch friends:', error)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (username: string) => {
    if (!accessToken) return

    try {
      const newFriend = await api.addFriend(accessToken, username)
      if (newFriend.id) {
        setFriends([...friends, newFriend])
        toast.success('Friend added successfully')
      }
    } catch (error: any) {
      console.error('Failed to add friend:', error)
      toast.error(error.error || 'Failed to add friend')
      throw error
    }
  }

  const handleAddFriendByEmail = async (email: string) => {
    if (!accessToken) return

    try {
      const newFriend = await api.addFriendByEmail(accessToken, email)
      if (newFriend.id) {
        setFriends([...friends, newFriend])
        toast.success('Friend added successfully')
      }
    } catch (error: any) {
      console.error('Failed to add friend by email:', error)
      toast.error(error.error || 'Failed to add friend')
      throw error
    }
  }

  const handleAddFriendByCode = async (code: string) => {
    if (!accessToken) return

    try {
      const newFriend = await api.addFriendByCode(accessToken, code)
      if (newFriend.id) {
        setFriends([...friends, newFriend])
        toast.success('Friend added successfully')
      }
    } catch (error: any) {
      console.error('Failed to add friend by code:', error)
      toast.error(error.error || 'Failed to add friend')
      throw error
    }
  }

  const handleSearchSuggestions = async (query: string) => {
    if (!accessToken) return []

    try {
      const suggestions = await api.getFriendSuggestions(accessToken, query)
      return Array.isArray(suggestions) ? suggestions : []
    } catch (error) {
      console.error('Failed to search friends:', error)
      return []
    }
  }

  const handleSettleDebt = async (friendId: string, amount: number, method: string) => {
    if (!accessToken) return

    try {
      await api.settleDebt(accessToken, friendId, amount, method)
      const friendsData = await api.getFriends(accessToken)
      setFriends(Array.isArray(friendsData) ? friendsData : [])
      toast.success('Debt settled successfully')
    } catch (error) {
      console.error('Failed to settle debt:', error)
      toast.error('Failed to settle debt')
      throw error
    }
  }

  return {
    friends,
    loading,
    fetchFriends,
    handleAddFriend,
    handleAddFriendByEmail,
    handleAddFriendByCode,
    handleSearchSuggestions,
    handleSettleDebt,
  }
}
