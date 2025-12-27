import { useState } from 'react'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

export function usePersonalExpenses(accessToken: string | null) {
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [trends, setTrends] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const fetchExpenses = async () => {
    if (!accessToken) return

    setLoading(true)
    try {
      const data = await api.getPersonalExpenses(accessToken)
      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch personal expenses:', error)
      toast.error('Failed to load expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const createExpense = async (expenseData: {
    description: string
    amount: number
    category?: string
    notes?: string
    receiptUrl?: string
  }) => {
    if (!accessToken) return

    try {
      const newExpense = await api.createPersonalExpense(accessToken, expenseData)
      setExpenses(prev => [newExpense, ...prev])
      toast.success('Expense added successfully')
      return newExpense
    } catch (error) {
      console.error('Failed to create expense:', error)
      toast.error('Failed to add expense')
      throw error
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!accessToken) return

    try {
      await api.deletePersonalExpense(accessToken, expenseId)
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId))
      toast.success('Expense deleted')
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const fetchBudgets = async () => {
    if (!accessToken) return

    try {
      const data = await api.getBudgets(accessToken)
      setBudgets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
      toast.error('Failed to load budgets')
      setBudgets([])
    }
  }

  const createBudget = async (budgetData: {
    category: string
    limit: number
    month?: number
    year?: number
  }) => {
    if (!accessToken) return

    try {
      const newBudget = await api.createBudget(accessToken, budgetData)
      setBudgets(prev => [newBudget, ...prev])
      toast.success('Budget created successfully')
      return newBudget
    } catch (error) {
      console.error('Failed to create budget:', error)
      toast.error('Failed to create budget')
      throw error
    }
  }

  const deleteBudget = async (budgetId: string) => {
    if (!accessToken) return

    try {
      await api.deleteBudget(accessToken, budgetId)
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      toast.success('Budget deleted')
    } catch (error) {
      console.error('Failed to delete budget:', error)
      toast.error('Failed to delete budget')
    }
  }

  const searchExpenses = async (query: string) => {
    if (!accessToken || !query) {
      setSearchResults([])
      return { type: 'results', data: [] }
    }

    try {
      const results = await api.searchExpenses(accessToken, query)
      // Handle both new format and legacy array format
      if (results.type === 'analytics' || results.type === 'results') {
        const resultArray = results.type === 'results' ? results.data : []
        setSearchResults(resultArray)
        return results
      }
      // Legacy array format
      const resultArray = Array.isArray(results) ? results : []
      setSearchResults(resultArray)
      return { type: 'results', data: resultArray }
    } catch (error) {
      console.error('Failed to search expenses:', error)
      toast.error('Search failed')
      setSearchResults([])
      return { type: 'results', data: [] }
    }
  }

  const fetchTrends = async () => {
    if (!accessToken) return

    try {
      const data = await api.getAnalyticsTrends(accessToken)
      setTrends(data)
    } catch (error) {
      console.error('Failed to fetch trends:', error)
      toast.error('Failed to load trends')
    }
  }

  const scanReceipt = async (file: File) => {
    if (!accessToken) return null

    try {
      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      const base64Image = await base64Promise
      
      // Call the API
      const scannedData = await api.scanReceipt(accessToken, base64Image)
      return scannedData
    } catch (error) {
      console.error('Failed to scan receipt:', error)
      toast.error('Failed to scan receipt')
      throw error
    }
  }

  const getAIInsights = async () => {
    if (!accessToken) return null

    try {
      const insights = await api.getAIInsights(accessToken)
      return insights
    } catch (error) {
      console.error('Failed to get AI insights:', error)
      toast.error('Failed to generate insights')
      throw error
    }
  }

  return {
    expenses,
    budgets,
    trends,
    loading,
    searchResults,
    fetchExpenses,
    createExpense,
    deleteExpense,
    fetchBudgets,
    createBudget,
    deleteBudget,
    searchExpenses,
    fetchTrends,
    scanReceipt,
    getAIInsights,
  }
}
