import { useState, useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import { api } from '../utils/api'
import { toast } from 'sonner@2.0.3'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  username: string
}

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsCheckingSession(true)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        setAccessToken(session.access_token)
        await fetchUserProfile(session.access_token)
      }
      setIsCheckingSession(false)
    }
    
    checkSession()
  }, [])

  const fetchUserProfile = async (token: string) => {
    try {
      const userData = await api.getProfile(token)
      if (userData.id) {
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const handleLogin = async (email: string, password: string) => {
    setIsAuthenticating(true)
    try {
      const response = await api.login(email, password)
      console.log('Login response:', response)
      
      if (response.error) {
        // Provide more helpful error messages
        let errorMessage = response.error
        if (response.error.toLowerCase().includes('invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.'
        }
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      if (!response.accessToken) {
        console.error('No access token in response')
        toast.error('Login failed: No access token received')
        throw new Error('No access token received')
      }

      if (!response.user) {
        console.error('No user data in response')
        toast.error('Login failed: User data not found')
        throw new Error('User data not found')
      }

      console.log('Setting access token and user:', response.accessToken, response.user)
      setAccessToken(response.accessToken)
      setUser(response.user)
      toast.success('Welcome back!')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleSignup = async (data: { name: string; email: string; password: string; phone: string; username: string }) => {
    setIsAuthenticating(true)
    try {
      const response = await api.signup(data)
      
      if (response.error) {
        toast.error(response.error)
        throw new Error(response.error)
      }

      toast.success('Account created successfully!')
      
      // Automatically log in after successful signup
      await handleLogin(data.email, data.password)
      return true
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAccessToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  return {
    accessToken,
    user,
    isAuthenticating,
    isCheckingSession,
    handleLogin,
    handleSignup,
    handleLogout,
  }
}
