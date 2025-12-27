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
    let isMounted = true
    let initialSessionHandled = false
    
    const fetchUserProfile = async (token: string) => {
      try {
        const userData = await api.getProfile(token)
        if (userData.id && isMounted) {
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }
    
    // Listen for auth state changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      // Handle initial session or signed in
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
        // Prevent duplicate handling
        if (initialSessionHandled && event === 'INITIAL_SESSION') return
        initialSessionHandled = true
        
        setAccessToken(session.access_token)
        await fetchUserProfile(session.access_token)
        setIsCheckingSession(false)
      } else if (event === 'SIGNED_OUT') {
        setAccessToken(null)
        setUser(null)
        setIsCheckingSession(false)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setAccessToken(session.access_token)
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session exists
        setIsCheckingSession(false)
      }
    })
    
    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setIsAuthenticating(true)
    
    try {
      const supabase = createClient()
      
      // Sign in with Supabase directly (this persists the session in the browser)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        let errorMessage = error.message
        
        if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.'
        }
        toast.error(errorMessage)
        throw new Error(errorMessage)
      }

      if (!data.session?.access_token) {
        toast.error('Login failed: No access token received')
        throw new Error('No access token received')
      }
      
      // Set the access token first
      setAccessToken(data.session.access_token)
      
      // Fetch user profile from our backend
      try {
        const userData = await api.getProfile(data.session.access_token)
        if (userData.id) {
          setUser(userData)
          toast.success(`Welcome back, ${userData.name}!`)
        } else {
          toast.error('Failed to load user profile')
        }
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError)
        toast.error('Login successful but failed to load profile')
      }
    } catch (error: any) {
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

      toast.success('Account created successfully! Logging you in...')
      
      // Automatically log in after successful signup
      await handleLogin(data.email, data.password)
      return true
    } catch (error: any) {
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