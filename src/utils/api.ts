import { projectId, publicAnonKey } from './supabase/info'
import type { GroupExpensePayload, GroupPaymentPayload } from '@/types/groups'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-f573a585`

export const api = {
  async signup(data: { name: string; email: string; password: string; phone?: string; username: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  },

  async getProfile(token: string) {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async getGroups(token: string) {
    const res = await fetch(`${API_BASE}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error fetching groups:', data.error)
      throw new Error(data.error)
    }
    return Array.isArray(data) ? data : []
  },

  async createGroup(token: string, data: { name: string; description?: string }) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Group name is required')
    }
    
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    
    if (result.error) {
      console.error('Error creating group:', result.error)
      throw new Error(result.error)
    }
    
    if (!result.id) {
      console.error('Created group missing ID:', result)
      throw new Error('Invalid group data received from server')
    }
    
    console.log('Group created successfully:', result)
    return result
  },

  async getGroup(token: string, groupId: string) {
    if (!groupId || groupId === 'null' || groupId === 'undefined') {
      console.error('API: Invalid group ID:', groupId)
      throw new Error('Invalid group ID')
    }
    
    console.log('API: Fetching group with ID:', groupId)
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('API: Response status:', res.status)
    
    const data = await res.json()
    console.log('API: Response data:', data)
    
    if (data.error) {
      console.error('Error fetching group details:', data.error)
      throw new Error(data.error)
    }
    
    if (!data.id) {
      console.error('API: Group data missing ID:', data)
      throw new Error('Invalid group data received')
    }
    
    return data
  },

  async addMember(token: string, groupId: string, username: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error adding member:', data.error)
      throw new Error(data.error)
    }
    return data
  },

  async addMemberById(token: string, groupId: string, friendId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/members-by-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId })
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error adding member:', data.error)
      throw new Error(data.error)
    }
    return data
  },

  async addExpense(token: string, groupId: string, data: GroupExpensePayload) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.error) {
      console.error('Error adding expense:', result.error)
      throw new Error(result.error)
    }
    return result
  },

  async simplifyDebts(token: string, groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/simplify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async settleGroupBill(token: string, groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error settling group bill:', data.error)
      throw new Error(data.error)
    }
    return data
  },

  async recordPayment(token: string, groupId: string, data: GroupPaymentPayload) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.error) {
      console.error('Error recording payment:', result.error)
      throw new Error(result.error)
    }
    return result
  },

  async deleteGroup(token: string, groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error deleting group:', data.error)
      throw new Error(data.error)
    }
    return data
  },

  async debugGroup(token: string, groupId: string) {
    const res = await fetch(`${API_BASE}/debug/group/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async getFriends(token: string) {
    const res = await fetch(`${API_BASE}/friends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error fetching friends:', data.error)
      throw new Error(data.error)
    }
    return Array.isArray(data) ? data : []
  },

  async addFriend(token: string, username: string) {
    const res = await fetch(`${API_BASE}/friends/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username })
    })
    return res.json()
  },

  async addFriendByEmail(token: string, email: string) {
    const res = await fetch(`${API_BASE}/friends/add-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    })
    return res.json()
  },

  async addFriendByCode(token: string, code: string) {
    const res = await fetch(`${API_BASE}/friends/add-by-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    })
    return res.json()
  },

  async getFriendSuggestions(token: string, query: string) {
    const res = await fetch(`${API_BASE}/friends/suggestions?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async settleDebt(token: string, friendId: string, amount: number, method: string) {
    const res = await fetch(`${API_BASE}/friends/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendId, amount, method })
    })
    return res.json()
  },

  async getActivity(token: string) {
    const res = await fetch(`${API_BASE}/activity`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async getNotifications(token: string) {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  async getDashboardStats(token: string) {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  // Personal Expenses
  async getPersonalExpenses(token: string) {
    const res = await fetch(`${API_BASE}/personal-expenses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error fetching personal expenses:', data.error)
      throw new Error(data.error)
    }
    return Array.isArray(data) ? data : []
  },

  async createPersonalExpense(token: string, data: {
    description: string;
    amount: number;
    category?: string;
    notes?: string;
    receiptUrl?: string;
  }) {
    const res = await fetch(`${API_BASE}/personal-expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.error) {
      console.error('Error creating personal expense:', result.error)
      throw new Error(result.error)
    }
    return result
  },

  async deletePersonalExpense(token: string, expenseId: string) {
    const res = await fetch(`${API_BASE}/personal-expenses/${expenseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  // Budgets
  async getBudgets(token: string) {
    const res = await fetch(`${API_BASE}/budgets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error fetching budgets:', data.error)
      throw new Error(data.error)
    }
    return Array.isArray(data) ? data : []
  },

  async createBudget(token: string, data: {
    category: string;
    limit: number;
    month?: number;
    year?: number;
  }) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const result = await res.json()
    if (result.error) {
      console.error('Error creating budget:', result.error)
      throw new Error(result.error)
    }
    return result
  },

  async deleteBudget(token: string, budgetId: string) {
    const res = await fetch(`${API_BASE}/budgets/${budgetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  },

  // Enhanced Search with Analytics
  async searchExpenses(token: string, query: string) {
    console.log('API searchExpenses called with query:', query)
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    console.log('API searchExpenses response:', data)
    if (data.error) {
      console.error('Error searching expenses:', data.error)
      throw new Error(data.error)
    }
    // Handle both old array format and new object format
    if (Array.isArray(data)) {
      return { type: 'results', data: data }
    }
    return data
  },

  // AI Spending Insights
  async getAIInsights(token: string, query?: string) {
    try {
      const url = query 
        ? `${API_BASE}/ai/insights?query=${encodeURIComponent(query)}`
        : `${API_BASE}/ai/insights`
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        console.error('AI insights request failed with status:', res.status)
        throw new Error(`Request failed with status ${res.status}`)
      }
      
      const data = await res.json()
      
      // Backend now returns 200 with error field instead of 500
      // So just return the data, error field will be present if there was an issue
      if (data && data.error) {
        console.warn('AI insights returned with warning:', data.error)
      }
      
      return data || {}
    } catch (error: any) {
      console.error('Error fetching AI insights:', error.message)
      throw error
    }
  },

  // Analytics
  async getAnalyticsTrends(token: string) {
    const res = await fetch(`${API_BASE}/analytics/trends`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error fetching analytics trends:', data.error)
      throw new Error(data.error)
    }
    return data || {}
  },

  // AI Receipt Scanning
  async scanReceipt(token: string, imageBase64: string) {
    const res = await fetch(`${API_BASE}/scan-receipt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageBase64 })
    })
    const data = await res.json()
    if (data.error) {
      console.error('Error scanning receipt:', data.error, data.details)
      throw new Error(data.error)
    }
    return data
  }
}