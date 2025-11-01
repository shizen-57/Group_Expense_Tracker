import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function useGroups(accessToken: string | null) {
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch groups list
  const fetchGroups = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const groupsData = await api.getGroups(accessToken)
      console.log('Fetched groups:', groupsData)
      setGroups(groupsData)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      toast.error('Failed to load groups')
      // Reset groups on error to clear stale data
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch selected group details
  useEffect(() => {
    if (!accessToken || !selectedGroupId) {
      setLoading(false)
      return
    }

    const fetchGroupDetail = async () => {
      console.log('Fetching group details for ID:', selectedGroupId)
      setLoading(true)
      try {
        const groupData = await api.getGroup(accessToken, selectedGroupId)
        console.log('Group data received:', groupData)
        
        if (groupData && groupData.id) {
          setSelectedGroup(groupData)
          console.log('Selected group set successfully')
        } else {
          console.error('Group data missing ID:', groupData)
          toast.error('Invalid group data received')
          // Remove invalid group from local state
          setGroups(groups.filter(g => g.id !== selectedGroupId))
          setSelectedGroupId(null)
          setSelectedGroup(null)
        }
      } catch (error: any) {
        console.error('Error fetching group details:', error)
        
        // If group not found, remove it from local state and clear selection
        if (error.message === 'Group not found' || error.message === 'Not authorized to view this group') {
          console.log('Removing invalid group from local state:', selectedGroupId)
          setGroups(groups.filter(g => g.id !== selectedGroupId))
          toast.error('This group is no longer available.')
          setSelectedGroupId(null)
          setSelectedGroup(null)
          
          // Trigger a fresh fetch from server to sync state
          setTimeout(() => fetchGroups(), 500)
        } else {
          // For other errors, show error message
          console.error('Error fetching group details:', error.message || error)
          toast.error(`Failed to load group details: ${error.message || 'Unknown error'}`)
          setSelectedGroupId(null)
          setSelectedGroup(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGroupDetail()
  }, [selectedGroupId, accessToken])

  const handleCreateGroup = async (data: { name: string; description: string }) => {
    if (!accessToken) {
      toast.error('You must be logged in to create a group')
      return
    }

    try {
      const newGroup = await api.createGroup(accessToken, data)
      console.log('New group created:', newGroup)
      
      if (!newGroup || !newGroup.id) {
        throw new Error('Invalid group data received from server')
      }
      
      // Add to local state with metadata
      const groupWithMeta = { 
        ...newGroup, 
        memberCount: 1, 
        expenseCount: 0 
      }
      setGroups([...groups, groupWithMeta])
      
      // Immediately navigate to the new group
      setSelectedGroupId(newGroup.id)
      
      toast.success('Group created successfully')
      return newGroup
    } catch (error: any) {
      console.error('Failed to create group:', error)
      toast.error(error.message || 'Failed to create group')
      throw error
    }
  }

  const handleSelectGroup = (groupId: string) => {
    if (!groupId || groupId === 'null' || groupId === 'undefined') {
      console.error('Attempted to select invalid group ID:', groupId)
      toast.error('Invalid group selected')
      return
    }
    
    // Check if group exists in local state
    const groupExists = groups.some(g => g.id === groupId)
    if (!groupExists) {
      console.error('Group not found in local state:', groupId)
      toast.error('Group not found')
      // Refresh groups list to sync with server
      fetchGroups()
      return
    }
    
    console.log('Selecting group:', groupId)
    setSelectedGroupId(groupId)
  }

  const handleBackToGroups = () => {
    console.log('Navigating back to groups list')
    setSelectedGroupId(null)
    setSelectedGroup(null)
    // Refresh groups list to get latest data
    fetchGroups()
  }

  const handleAddMember = async (friendId: string) => {
    if (!accessToken || !selectedGroupId) return

    try {
      await api.addMemberById(accessToken, selectedGroupId, friendId)
      const groupData = await api.getGroup(accessToken, selectedGroupId)
      setSelectedGroup(groupData)
      toast.success('Member added successfully')
    } catch (error: any) {
      console.error('Failed to add member:', error)
      toast.error(error.error || 'Failed to add member')
      throw error
    }
  }

  const handleAddExpense = async (data: { 
    description: string
    amount: number
    paidBy: string
    splitWith: string[]
    splitType?: 'equal' | 'unequal' | 'percentage'
    splitAmounts?: Record<string, number>
    category?: string
    notes?: string
  }) => {
    if (!accessToken || !selectedGroupId) return

    try {
      await api.addExpense(accessToken, selectedGroupId, data)
      const groupData = await api.getGroup(accessToken, selectedGroupId)
      setSelectedGroup(groupData)
      toast.success('Expense added successfully')
    } catch (error) {
      console.error('Failed to add expense:', error)
      toast.error('Failed to add expense')
      throw error
    }
  }

  const handleSimplifyDebts = async () => {
    if (!accessToken || !selectedGroupId) return

    try {
      await api.simplifyDebts(accessToken, selectedGroupId)
      const groupData = await api.getGroup(accessToken, selectedGroupId)
      setSelectedGroup(groupData)
      toast.success('Debts simplified successfully')
    } catch (error) {
      console.error('Failed to simplify debts:', error)
      toast.error('Failed to simplify debts')
    }
  }

  const handleSettleAndSync = async () => {
    if (!accessToken || !selectedGroupId) return

    try {
      await api.settleGroupBill(accessToken, selectedGroupId)
      const groupData = await api.getGroup(accessToken, selectedGroupId)
      setSelectedGroup(groupData)
      toast.success('Expenses settled and synced to your personal tracker!')
    } catch (error) {
      console.error('Failed to settle and sync:', error)
      toast.error('Failed to settle expenses')
      throw error
    }
  }

  const handleDeleteGroup = async () => {
    if (!accessToken || !selectedGroupId) return

    try {
      await api.deleteGroup(accessToken, selectedGroupId)
      toast.success('Group deleted successfully')
      // Clear selection and return to list
      setSelectedGroupId(null)
      setSelectedGroup(null)
      // Refresh groups list
      await fetchGroups()
    } catch (error) {
      console.error('Failed to delete group:', error)
      toast.error('Failed to delete group')
      throw error
    }
  }

  const resetSelection = () => {
    setSelectedGroupId(null)
    setSelectedGroup(null)
  }

  return {
    groups,
    selectedGroupId,
    selectedGroup,
    loading,
    fetchGroups,
    handleCreateGroup,
    handleSelectGroup,
    handleBackToGroups,
    handleAddMember,
    handleAddExpense,
    handleSimplifyDebts,
    handleSettleAndSync,
    handleDeleteGroup,
    resetSelection,
  }
}
