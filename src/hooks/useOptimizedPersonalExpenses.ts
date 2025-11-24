import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'
import { useMemo } from 'react'

export function useOptimizedPersonalExpenses(accessToken: string | null) {
  const queryClient = useQueryClient()

  // Fetch expenses with caching
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['personal-expenses', accessToken],
    queryFn: async () => {
      if (!accessToken) return []
      const data = await api.getPersonalExpenses(accessToken)
      return Array.isArray(data) ? data : []
    },
    enabled: !!accessToken,
  })

  // Fetch budgets with caching
  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', accessToken],
    queryFn: async () => {
      if (!accessToken) return []
      const data = await api.getBudgets(accessToken)
      return Array.isArray(data) ? data : []
    },
    enabled: !!accessToken,
  })

  // Fetch trends with caching
  const { data: trends = {}, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', accessToken],
    queryFn: async () => {
      if (!accessToken) return {}
      return await api.getAnalyticsTrends(accessToken)
    },
    enabled: !!accessToken,
  })

  // Create expense mutation with optimistic update
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: {
      description: string
      amount: number
      category?: string
      notes?: string
      receiptUrl?: string
    }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.createPersonalExpense(accessToken, expenseData)
    },
    onMutate: async (newExpense) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['personal-expenses', accessToken] })

      // Snapshot previous value
      const previousExpenses = queryClient.getQueryData(['personal-expenses', accessToken])

      // Optimistically update
      const optimisticExpense = {
        id: `temp-${Date.now()}`,
        ...newExpense,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData(['personal-expenses', accessToken], (old: any[] = []) => 
        [optimisticExpense, ...old]
      )

      return { previousExpenses }
    },
    onSuccess: (newExpense) => {
      // Replace temp expense with real one
      queryClient.setQueryData(['personal-expenses', accessToken], (old: any[] = []) => {
        const filtered = old.filter(e => !e.id.startsWith('temp-'))
        return [newExpense, ...filtered]
      })
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trends', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', accessToken] })
      toast.success('Expense added successfully')
    },
    onError: (error, newExpense, context) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(['personal-expenses', accessToken], context.previousExpenses)
      }
      toast.error('Failed to add expense')
    },
  })

  // Delete expense mutation with optimistic update
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      await api.deletePersonalExpense(accessToken, expenseId)
    },
    onMutate: async (expenseId) => {
      await queryClient.cancelQueries({ queryKey: ['personal-expenses', accessToken] })
      const previousExpenses = queryClient.getQueryData(['personal-expenses', accessToken])
      
      // Optimistically remove
      queryClient.setQueryData(['personal-expenses', accessToken], (old: any[] = []) =>
        old.filter(exp => exp.id !== expenseId)
      )
      
      return { previousExpenses }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trends', accessToken] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', accessToken] })
      toast.success('Expense deleted')
    },
    onError: (error, expenseId, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(['personal-expenses', accessToken], context.previousExpenses)
      }
      toast.error('Failed to delete expense')
    },
  })

  // Create budget mutation with optimistic update
  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: {
      category: string
      limit: number
      month?: number
      year?: number
    }) => {
      if (!accessToken) throw new Error('Not authenticated')
      return await api.createBudget(accessToken, budgetData)
    },
    onMutate: async (newBudget) => {
      await queryClient.cancelQueries({ queryKey: ['budgets', accessToken] })
      const previousBudgets = queryClient.getQueryData(['budgets', accessToken])
      
      const optimisticBudget = {
        id: `temp-${Date.now()}`,
        ...newBudget,
      }
      queryClient.setQueryData(['budgets', accessToken], (old: any[] = []) => 
        [optimisticBudget, ...old]
      )
      
      return { previousBudgets }
    },
    onSuccess: (newBudget) => {
      queryClient.setQueryData(['budgets', accessToken], (old: any[] = []) => {
        const filtered = old.filter(b => !b.id.startsWith('temp-'))
        return [newBudget, ...filtered]
      })
      toast.success('Budget created successfully')
    },
    onError: (error, newBudget, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(['budgets', accessToken], context.previousBudgets)
      }
      toast.error('Failed to create budget')
    },
  })

  // Delete budget mutation with optimistic update
  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      if (!accessToken) throw new Error('Not authenticated')
      await api.deleteBudget(accessToken, budgetId)
    },
    onMutate: async (budgetId) => {
      await queryClient.cancelQueries({ queryKey: ['budgets', accessToken] })
      const previousBudgets = queryClient.getQueryData(['budgets', accessToken])
      
      queryClient.setQueryData(['budgets', accessToken], (old: any[] = []) =>
        old.filter(b => b.id !== budgetId)
      )
      
      return { previousBudgets }
    },
    onSuccess: () => {
      toast.success('Budget deleted')
    },
    onError: (error, budgetId, context) => {
      if (context?.previousBudgets) {
        queryClient.setQueryData(['budgets', accessToken], context.previousBudgets)
      }
      toast.error('Failed to delete budget')
    },
  })

  // Memoized computed values
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [expenses])

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  }, [expenses])

  // Search expenses function
  const searchExpenses = async (query: string) => {
    if (!accessToken || !query) {
      return { type: 'results', data: [] }
    }

    try {
      const results = await api.searchExpenses(accessToken, query)
      if (results.type === 'analytics' || results.type === 'results') {
        return results
      }
      const resultArray = Array.isArray(results) ? results : []
      return { type: 'results', data: resultArray }
    } catch (error) {
      console.error('Failed to search expenses:', error)
      toast.error('Search failed')
      return { type: 'results', data: [] }
    }
  }

  // Scan receipt function
  const scanReceipt = async (file: File) => {
    if (!accessToken) return null

    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String.split(',')[1])
        }
        reader.readAsDataURL(file)
      })

      const base64Image = await base64Promise
      const result = await api.scanReceipt(accessToken, base64Image)
      
      if (result) {
        toast.success('Receipt scanned successfully!')
        return result
      }
      return null
    } catch (error: any) {
      console.error('Receipt scanning error:', error)
      toast.error(error.message || 'Failed to scan receipt')
      return null
    }
  }

  // Get AI insights function
  const getAIInsights = async (query?: string) => {
    if (!accessToken) return null

    try {
      // For general insights (no query), fetch from insights endpoint
      if (!query) {
        return await api.getAIInsights(accessToken)
      }
      // For specific queries, use the insights endpoint with query
      return await api.getAIInsights(accessToken, query)
    } catch (error: any) {
      console.error('AI insights error:', error)
      toast.error(error.message || 'Failed to get AI insights')
      return null
    }
  }

  const loading = expensesLoading || budgetsLoading || trendsLoading

  return {
    expenses: sortedExpenses,
    budgets,
    trends,
    loading,
    totalExpenses,
    createExpense: createExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    createBudget: createBudgetMutation.mutateAsync,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    searchExpenses,
    scanReceipt,
    getAIInsights,
    isCreatingExpense: createExpenseMutation.isPending,
    isDeletingExpense: deleteExpenseMutation.isPending,
  }
}