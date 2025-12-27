import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'
import type { GroupExpensePayload, GroupPaymentPayload } from '@/types/groups'

export function useOptimizedGroups(accessToken: string | null) {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  // Fetch groups with caching
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', accessToken],
    queryFn: async () => {
      if (!accessToken) return []
      const data = await api.getGroups(accessToken)
      return Array.isArray(data) ? data : []
    },
    enabled: !!accessToken,
  })

  // Fetch selected group details
  const { data: selectedGroup, isLoading: selectedGroupLoading } = useQuery({
    queryKey: ['group-detail', accessToken, selectedGroupId],
    queryFn: async () => {
      if (!accessToken || !selectedGroupId) return null
      return await api.getGroup(accessToken, selectedGroupId)
    },
    enabled: !!accessToken && !!selectedGroupId,
  })

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: { name: string; members: string[] }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.createGroup(accessToken, groupData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', accessToken] })
      toast.success('Group created successfully')
    },
    onError: () => {
      toast.error('Failed to create group')
    },
  })

  // Add group expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async ({ groupId, expenseData }: { groupId: string; expenseData: GroupExpensePayload }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.addExpense(accessToken, groupId, expenseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', accessToken, selectedGroupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['activity', accessToken] })
      toast.success('Expense added to group')
    },
    onError: () => {
      toast.error('Failed to add expense')
    },
  })

  // Simplify debts mutation
  const simplifyDebtsMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.simplifyDebts(accessToken, groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', accessToken, selectedGroupId] })
      toast.success('Debts simplified successfully')
    },
    onError: () => {
      toast.error('Failed to simplify debts')
    },
  })

  // Settle and sync mutation
  const settleAndSyncMutation = useMutation({
    mutationFn: async ({ groupId, settlements }: { groupId: string; settlements: any[] }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.settleGroupBill(accessToken, groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', accessToken, selectedGroupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['friends', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['activity', accessToken] })
      toast.success('Settlements synced successfully')
    },
    onError: () => {
      toast.error('Failed to sync settlements')
    },
  })

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, friendId }: { groupId: string; friendId: string }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.addMemberById(accessToken, groupId, friendId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', accessToken, selectedGroupId] })
      toast.success('Member added successfully')
    },
    onError: () => {
      toast.error('Failed to add member')
    },
  })

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.deleteGroup(accessToken, groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', accessToken] })
      setSelectedGroupId(null)
      toast.success('Group deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete group')
    },
  })

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ groupId, paymentData }: { groupId: string; paymentData: GroupPaymentPayload }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.recordPayment(accessToken, groupId, paymentData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-detail', accessToken, selectedGroupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', accessToken] })
      toast.success('Payment recorded')
    },
    onError: () => {
      toast.error('Failed to record payment')
    },
  })

  const loading = isLoading || selectedGroupLoading

  return {
    groups,
    selectedGroupId,
    selectedGroup,
    loading,
    handleSelectGroup: setSelectedGroupId,
    handleBackToGroups: () => setSelectedGroupId(null),
    handleCreateGroup: createGroupMutation.mutateAsync,
    handleAddExpense: async (expenseData: GroupExpensePayload) => {
      if (!selectedGroupId) throw new Error('No group selected')
      return addExpenseMutation.mutateAsync({ groupId: selectedGroupId, expenseData })
    },
    handleSimplifyDebts: async () => {
      if (!selectedGroupId) throw new Error('No group selected')
      return simplifyDebtsMutation.mutateAsync(selectedGroupId)
    },
    handleSettleAndSync: async () => {
      if (!selectedGroupId) throw new Error('No group selected')
      return settleAndSyncMutation.mutateAsync({ groupId: selectedGroupId, settlements: [] })
    },
    handleAddMember: async (friendId: string) => {
      if (!selectedGroupId) throw new Error('No group selected')
      return addMemberMutation.mutateAsync({ groupId: selectedGroupId, friendId })
    },
    handleDeleteGroup: async () => {
      if (!selectedGroupId) throw new Error('No group selected')
      return deleteGroupMutation.mutateAsync(selectedGroupId)
    },
    handleRecordPayment: async (paymentData: GroupPaymentPayload) => {
      if (!selectedGroupId) throw new Error('No group selected')
      return recordPaymentMutation.mutateAsync({ groupId: selectedGroupId, paymentData })
    },
  }
}